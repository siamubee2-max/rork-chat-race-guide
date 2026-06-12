import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createClient } from "@supabase/supabase-js";

import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

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

// RevenueCat Webhook Handler
// Verifies webhook signatures and syncs subscription status to Supabase
app.post("/webhooks/revenuecat", async (c) => {
  const authKey = process.env.REVENUECAT_WEBHOOK_AUTH_KEY;

  if (!authKey) {
    console.error("[RevenueCat Webhook] Missing REVENUECAT_WEBHOOK_AUTH_KEY");
    return c.json({ error: "Webhook not configured" }, 500);
  }

  // Verify Authorization header
  const authHeader = c.req.header("Authorization");
  if (!authHeader || authHeader !== `Bearer ${authKey}`) {
    console.warn("[RevenueCat Webhook] Invalid authorization attempt");
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const { event } = body;

    if (!event || !event.type) {
      console.warn("[RevenueCat Webhook] Invalid payload structure");
      return c.json({ error: "Invalid payload" }, 400);
    }

    console.log(`[RevenueCat Webhook] Received event: ${event.type}`, {
      event_id: event.event_id,
      app_user_id: event.app_user_id,
      product_id: event.product_id,
    });

    // Initialize Supabase admin client
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("[RevenueCat Webhook] Missing Supabase configuration");
      return c.json({ error: "Database not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Map RevenueCat event types to subscription status
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
    const transactionId = event.transaction_id || event.event_id;

    // Update user subscription in database
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
      console.error("[RevenueCat Webhook] Database update failed:", updateError);
      return c.json({ error: "Database update failed" }, 500);
    }

    console.log(`[RevenueCat Webhook] Successfully processed ${event.type}`, {
      app_user_id: appUserId,
      subscription_status: subscriptionStatus,
    });

    return c.json({ received: true, status: subscriptionStatus }, 200);
  } catch (error) {
    console.error("[RevenueCat Webhook] Unexpected error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default app;
