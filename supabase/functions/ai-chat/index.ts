// Supabase Edge Function: ai-chat
// Proxies the Purrly AI assistant to OpenAI so OPENAI_API_KEY never ships in the
// app. HARDENED per 007 audit (prev. version: verify_jwt only, no quota, leaked
// raw upstream errors). Now mirrors kie-generate's defence-in-depth:
//   1. verify_jwt=true (gateway) + in-code admin.auth.getUser(token)
//   2. per-user daily quota (atomic check_and_increment_ai_usage) — cost cap
//   3. input validation (message count/size)
//   4. masked errors (never leak upstream/internal detail to the client)
//
// Quota is tier-aware: free users get FREE_DAILY, pro+ get PRO_DAILY. FREE_DAILY
// is the product's intended free limit (must match the client UI guard in
// UsageLimits.swift: freeAILimit, daily window). PRO_DAILY is a generous cost cap.

import { createClient } from "jsr:@supabase/supabase-js@2";

const FREE_DAILY = 15;
const PRO_DAILY = 200;
const TIER_RANK: Record<string, number> = { free: 0, pro: 1, premium: 2, premium_plus: 3, family: 4 };

const MAX_MESSAGES = 30;
const MAX_TOTAL_CHARS = 24_000; // ~ bounded prompt size

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!OPENAI_API_KEY || !supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured." }, 500);
  }

  // --- Identify caller (token already validated by verify_jwt) ---
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userErr || !userId) return json({ error: "Unauthorized" }, 401);

  // --- Tier-aware per-user daily quota (atomic) ---
  const { data: profile } = await admin
    .from("profiles").select("subscription_tier, subscription_expiry").eq("id", userId).single();
  const rank = TIER_RANK[profile?.subscription_tier as string] ?? 0;
  const expiry = profile?.subscription_expiry ? new Date(profile.subscription_expiry as string) : null;
  const proActive = rank >= 1 && (expiry ? expiry.getTime() > Date.now() : false);
  const limit = proActive ? PRO_DAILY : FREE_DAILY;

  const { data: allowed, error: quotaErr } = await admin.rpc(
    "check_and_increment_ai_usage",
    { p_user_id: userId, p_feature: "ai-chat", p_limit: limit },
  );
  if (quotaErr) return json({ error: "Quota check failed." }, 500);
  if (allowed !== true) return json({ error: `Limite quotidienne atteinte (${limit}/jour).` }, 429);

  // --- Validate input ---
  let messages: { role: string; content: string }[];
  let systemPrompt: string | undefined;
  try {
    const parsed = await req.json();
    messages = parsed?.messages;
    systemPrompt = parsed?.systemPrompt;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: "messages is required" }, 400);
  }
  if (messages.length > MAX_MESSAGES) {
    return json({ error: "Too many messages." }, 413);
  }
  const totalChars = messages.reduce((n, m) => n + (typeof m?.content === "string" ? m.content.length : 0), 0);
  if (totalChars > MAX_TOTAL_CHARS) {
    return json({ error: "Conversation too long." }, 413);
  }

  const openaiMessages = [
    { role: "system", content: systemPrompt ?? "Tu es Purrly, un assistant IA expert en santé et bien-être félin." },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: openaiMessages, max_tokens: 600, temperature: 0.7 }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      // Log detail server-side only; never leak upstream error to the client.
      console.error("ai-chat upstream error:", response.status, await response.text());
      return json({ error: "Le service IA est momentanément indisponible." }, 502);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    return json({ content }, 200);
  } catch (e) {
    console.error("ai-chat failed:", e instanceof Error ? e.message : e);
    return json({ error: "La requête a échoué. Réessaie plus tard." }, 500);
  }
});
