// Supabase Edge Function: breed-scan
// Proxies cat-breed identification to OpenAI Vision so OPENAI_API_KEY never ships
// in the app. HARDENED per 007 audit (prev. version: verify_jwt only, no quota,
// no input size check, leaked raw upstream errors). Mirrors kie-generate:
//   1. verify_jwt=true (gateway) + in-code admin.auth.getUser(token)
//   2. per-user daily quota (atomic check_and_increment_ai_usage) — cost cap
//   3. input validation (base64 presence + size)
//   4. masked errors

import { createClient } from "jsr:@supabase/supabase-js@2";

const FREE_DAILY = 10;
const PRO_DAILY = 100;
const TIER_RANK: Record<string, number> = { free: 0, pro: 1, premium: 2, premium_plus: 3, family: 4 };
const MAX_IMAGE_BASE64 = 7_000_000; // ~5 MB image

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

const SYSTEM_PROMPT =
  'Tu es un expert en races de chats. Analyse l image et identifie la race. ' +
  'Réponds UNIQUEMENT en JSON valide: {"topBreed": "nom exact de la race", ' +
  '"confidence": "Très probable|Probable|Possible", "why": "explication courte", ' +
  '"alternatives": ["race2", "race3"]}. Si ce n est pas un chat, réponds: ' +
  '{"error": "Aucun chat détecté"}.';

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
    { p_user_id: userId, p_feature: "breed-scan", p_limit: limit },
  );
  if (quotaErr) return json({ error: "Quota check failed." }, 500);
  if (allowed !== true) return json({ error: `Limite quotidienne atteinte (${limit}/jour).` }, 429);

  // --- Validate input ---
  let imageBase64: string;
  try {
    const parsed = await req.json();
    imageBase64 = parsed?.imageBase64;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return json({ error: "imageBase64 is required" }, 400);
  }
  if (imageBase64.length > MAX_IMAGE_BASE64) {
    return json({ error: "Image payload too large." }, 413);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "low" } },
              { type: "text", text: "Identifie la race de ce chat." },
            ],
          },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!response.ok) {
      console.error("breed-scan upstream error:", response.status, await response.text());
      return json({ error: "Le service d'analyse est momentanément indisponible." }, 502);
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let result: unknown;
    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch?.[0] ?? raw);
    } catch {
      result = { topBreed: "Race inconnue", confidence: "Possible", why: raw, alternatives: [] };
    }
    return json(result, 200);
  } catch (e) {
    console.error("breed-scan failed:", e instanceof Error ? e.message : e);
    return json({ error: "L'analyse a échoué. Réessaie plus tard." }, 500);
  }
});
