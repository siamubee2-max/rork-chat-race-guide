// Supabase Edge Function: revenuecat-webhook
// Receives RevenueCat subscription events and updates public.profiles
// (the authoritative table read by ai.ts / kie-generate / subscription.ts).
//
// Replaces the broken hono.ts handler, which wrote to a non-existent `users`
// table and was never deployed where RevenueCat could reach it.
//
// Auth: RevenueCat sends the Authorization header value configured in its
// dashboard. We compare it constant-time against REVENUECAT_WEBHOOK_AUTH_KEY.
// Deployed with verify_jwt=false (webhooks carry no Supabase user JWT).

import { createClient } from "jsr:@supabase/supabase-js@2";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Constant-time string comparison to avoid timing attacks on the shared secret.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Map a RevenueCat product_id to a Purrly tier (product IDs embed the tier name).
function tierFromProduct(productId: string | undefined): string {
  const p = (productId ?? "").toLowerCase();
  if (p.includes("pro")) return "pro";
  if (p.includes("family")) return "family";
  if (p.includes("premium")) return "premium";
  return "free";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authKey = Deno.env.get("REVENUECAT_WEBHOOK_AUTH_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!authKey || !supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!safeEqual(authHeader, authKey)) {
    return json({ error: "Unauthorized" }, 401);
  }

  let event: Record<string, any> | undefined;
  try {
    const body = await req.json();
    event = body?.event;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!event || !event.type || !event.app_user_id) {
    return json({ error: "Invalid payload" }, 400);
  }

  const appUserId: string = event.app_user_id;
  const type: string = event.type;

  // Compute the new subscription state from the event.
  let tier: string;
  let expiry: string | null;

  switch (type) {
    case "INITIAL_PURCHASE":
    case "RENEWAL":
    case "UNCANCELLATION":
    case "PRODUCT_CHANGE":
    case "NON_RENEWING_PURCHASE":
    case "CANCELLATION": // access persists until expiry; expiry drives the gate
    case "BILLING_ISSUE": {
      tier = tierFromProduct(event.product_id);
      expiry = event.expiration_at_ms
        ? new Date(Number(event.expiration_at_ms)).toISOString()
        : null;
      break;
    }
    case "EXPIRATION": {
      tier = "free";
      expiry = null;
      break;
    }
    default: {
      // Unknown event type — do NOT overwrite subscription state.
      console.log(JSON.stringify({ service: "revenuecat", msg: "ignored event", type }));
      return json({ received: true, ignored: true }, 200);
    }
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: updateError } = await admin
    .from("profiles")
    .update({ subscription_tier: tier, subscription_expiry: expiry })
    .eq("id", appUserId);

  if (updateError) {
    console.error("revenuecat-webhook db update failed:", updateError.message);
    return json({ error: "Database update failed" }, 500);
  }

  console.log(JSON.stringify({ service: "revenuecat", type, app_user_id: appUserId, tier }));
  return json({ received: true, tier }, 200);
});
