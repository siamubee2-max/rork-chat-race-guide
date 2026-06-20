import { createHmac, timingSafeEqual } from "node:crypto";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";
import { log } from "./lib/logger";

// ---------------------------------------------------------------------------
// In-memory rate limiter — guards tRPC AI routes against abuse.
// NOTE: state resets on process restart; upgrade to a shared store (Redis/KV)
// for multi-instance or serverless deployments.
// ---------------------------------------------------------------------------
interface RateLimitEntry { count: number; resetAt: number }
const _rlMap = new Map<string, RateLimitEntry>();

function makeRateLimit(maxRequests: number, windowMs: number) {
  return async (c: any, next: any) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
      c.req.header("x-real-ip") ??
      "unknown";
    const now = Date.now();
    const entry = _rlMap.get(ip);
    if (!entry || now > entry.resetAt) {
      _rlMap.set(ip, { count: 1, resetAt: now + windowMs });
    } else if (entry.count >= maxRequests) {
      log("warn", "rate-limiter", "429 Too Many Requests", { ip, path: c.req.path });
      c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return c.json({ error: "Too many requests" }, 429);
    } else {
      entry.count++;
    }
    // Prune stale entries when the map grows large
    if (_rlMap.size > 10_000) {
      for (const [k, v] of _rlMap) {
        if (now > v.resetAt) _rlMap.delete(k);
      }
    }
    await next();
  };
}

// ---------------------------------------------------------------------------
// HMAC-SHA256 verification for RevenueCat webhook signatures.
// Header format: "X-RevenueCat-Signature: v1=<64 lowercase hex chars>"
// ---------------------------------------------------------------------------
function verifyRevenueCatSignature(
  rawBody: Buffer,
  secret: string,
  signatureHeader: string | undefined
): boolean {
  if (!signatureHeader) return false;
  const match = signatureHeader.match(/^v1=([a-f0-9]{64})$/);
  if (!match) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(match[1], "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

const app = new Hono();

const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAllOrigins = process.env.NODE_ENV !== "production" && allowedOrigins.length === 0;

const resolveCorsOrigin = (origin?: string | null) => {
  if (!origin) {
    return allowAllOrigins ? "*" : allowedOrigins[0] ?? "";
  }
  if (allowAllOrigins || allowedOrigins.includes(origin)) {
    return origin;
  }
  return "";
};

app.use("*", async (c, next) => {
  const origin = c.req.header("Origin");
  if (origin && !allowAllOrigins && !allowedOrigins.includes(origin)) {
    return c.json({ error: "Origin not allowed" }, 403);
  }
  await next();
});

app.use(
  "*",
  cors({
    origin: resolveCorsOrigin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    credentials: true,
    maxAge: 600,
  }),
);

// Request logging — après CORS, avant rate limiter
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  const ip =
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ??
    c.req.header("x-real-ip") ??
    "unknown";
  log("info", "http", `${c.req.method} ${c.req.path}`, {
    status: c.res.status,
    ms,
    ip,
  });
});

// 60 tRPC requests / minute per IP — covers all AI endpoints
app.use("/trpc/*", makeRateLimit(60, 60_000));

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  }),
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

// ---------------------------------------------------------------------------
// RevenueCat Webhook — DEPRECATED / NON FONCTIONNEL
// Ce handler écrit dans une table `users` qui n'existe pas (la source
// autoritaire est `profiles`) et ce backend hono n'est pas déployé à
// l'URL que l'app/RevenueCat utilisent (Supabase Edge Functions).
// → Remplacé par l'Edge Function `supabase/functions/revenuecat-webhook`,
//   qui écrit dans `profiles`. Ne pas utiliser ce chemin.
// ---------------------------------------------------------------------------
app.post("/webhooks/revenuecat", async (c) => {
  const authKey = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

  if (!authKey) {
    log("error", "revenuecat", "missing REVENUECAT_WEBHOOK_AUTH_KEY");
    return c.json({ error: "Webhook not configured" }, 500);
  }

  // Read raw body once — needed for HMAC and JSON parsing
  const rawBody = Buffer.from(await c.req.arrayBuffer());

  const sigHeader = c.req.header("X-RevenueCat-Signature");
  const authHeader = c.req.header("Authorization");

  const isHmacValid = sigHeader
    ? verifyRevenueCatSignature(rawBody, authKey, sigHeader)
    : false;
  const isBearerValid = !sigHeader && authHeader === `Bearer ${authKey}`;

  if (!isHmacValid && !isBearerValid) {
    const ip = c.req.header("x-forwarded-for") ?? "unknown";
    log("warn", "revenuecat", "invalid auth", {
      ip,
      method: sigHeader ? "hmac" : "bearer",
    });
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = JSON.parse(rawBody.toString("utf8"));
    const { event } = body;

    if (!event || !event.type) {
      log("warn", "revenuecat", "invalid payload structure");
      return c.json({ error: "Invalid payload" }, 400);
    }

    log("info", "revenuecat", event.type, {
      event_id: event.event_id,
      app_user_id: event.app_user_id,
      product_id: event.product_id,
    });

    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      log("error", "revenuecat", "missing Supabase config");
      return c.json({ error: "Database not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const getSubscriptionStatus = (eventType: string): string => {
      switch (eventType) {
        case "INITIAL_PURCHASE":
        case "RENEWAL":
        case "UNCACHE_PURCHASE":
          return "active";
        case "CANCELLATION":
        case "EXPIRATION":
          return "inactive";
        case "BILLING_ISSUE":
          return "billing_issue";
        default:
          return "unknown";
      }
    };

    const subscriptionStatus = getSubscriptionStatus(event.type);
    const appUserId = event.app_user_id;
    const productId = event.product_id;

    const { error: updateError } = await supabase
      .from("users")
      .update({
        subscription_tier: productId,
        subscription_status: subscriptionStatus,
        subscription_updated_at: new Date().toISOString(),
        revenuecat_customer_id: event.subscriber_id || appUserId,
      })
      .eq("id", appUserId);

    if (updateError) {
      log("error", "revenuecat", "db update failed", { error: updateError.message });
      return c.json({ error: "Database update failed" }, 500);
    }

    log("info", "revenuecat", "processed", {
      app_user_id: appUserId,
      subscription_status: subscriptionStatus,
    });

    return c.json({ received: true, status: subscriptionStatus }, 200);
  } catch (error) {
    log("error", "revenuecat", "unexpected error", { error: String(error) });
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
