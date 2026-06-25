// Supabase Edge Function: kie-generate
// Proxies a KIE AI image-generation request server-side so KIE_API_KEY never
// ships in the iOS app bundle.
//
// Auth & authorization (defence in depth — client UsageLimits is bypassable):
//   1. verify_jwt=true — Supabase validates the caller's JWT before this runs.
//   2. Subscription gate — caller must be tier 'pro' or higher AND not expired.
//   3. Per-user daily quota — atomic check_and_increment_kie_usage(), caps
//      generations/day to prevent KIE cost-explosion.
//
// KIE API contract (verified live 2026-06): upload requires uploadPath+fileName
// and returns data.downloadUrl; createTask uses model gpt-image-2-image-to-image
// with input{prompt,input_urls[],aspect_ratio} and returns data.taskId; poll
// recordInfo returns data.state + data.resultJson({resultUrls[]}).
//
// Request  (POST, application/json): { "imageBase64": string, "preset": string }
// Response (200, application/json):   { "resultUrl": string }
//          (402 tier required | 429 quota exceeded | 401 | 400 | 500)

import { createClient } from "jsr:@supabase/supabase-js@2";

const REQUIRED_TIER_RANK = 1; // pro
const DAILY_LIMIT = 5;
const TIER_RANK: Record<string, number> = {
  free: 0, pro: 1, premium: 2, premium_plus: 3, family: 4,
};

const KIE_UPLOAD_URL = "https://kieai.redpandaai.co/api/file-stream-upload";
const KIE_CREATE_TASK_URL = "https://api.kie.ai/api/v1/jobs/createTask";
const KIE_RECORD_INFO_BASE = "https://api.kie.ai/api/v1/jobs/recordInfo";
const KIE_MODEL = "gpt-image-2-image-to-image";
const KIE_UPLOAD_PATH = "images/cat-photobooth";

const MAX_IMAGE_BASE64 = 7_000_000;
const POLL_MAX_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 3_000;

const PRESET_PROMPTS: Record<string, string> = {
  cowboy_hat:    "Add a realistic brown cowboy hat on top of this cat's head. Keep the cat exactly as-is, only add the hat. Photorealistic, fun.",
  crown:         "Place a golden royal crown on this cat's head. The cat stays the same, only add the crown. Photorealistic, regal look.",
  witch_hat:     "Add a classic black witch hat on this cat's head. Keep the cat unchanged, only add the hat. Photorealistic, Halloween style.",
  sunglasses:    "Put stylish sunglasses on this cat's face over its eyes. The cat stays the same, only add the sunglasses. Photorealistic, cool look.",
  party_hat:     "Place a colorful party cone hat on this cat's head. Keep the cat unchanged, only add the party hat. Fun, photorealistic.",
  bowtie:        "Add a cute bow tie around this cat's neck. Keep the cat unchanged, only add the bow tie. Elegant, photorealistic.",
  flower_wreath: "Place a beautiful flower wreath crown on this cat's head. Keep the cat unchanged, only add the flowers. Photorealistic, natural look.",
  superhero:     "Dress this cat as a superhero with a small cape and mask. Keep the cat's face visible. Fun, photorealistic superhero costume.",
  pirate:        "Add a pirate hat and eyepatch to this cat. Keep the cat unchanged. Fun photorealistic pirate style.",
  princess:      "Add a princess tiara and a small sparkly collar to this cat. Keep the cat unchanged. Cute, photorealistic princess look.",
};

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

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function kieUpload(imageBase64: string, apiKey: string): Promise<string> {
  const form = new FormData();
  form.append("file", new Blob([base64ToBytes(imageBase64)], { type: "image/jpeg" }), "cat.jpg");
  form.append("uploadPath", KIE_UPLOAD_PATH);
  form.append("fileName", "cat.jpg");

  // Do NOT set Content-Type manually — fetch adds the multipart boundary.
  const res = await fetch(KIE_UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`KIE upload HTTP ${res.status}`);

  const data = await res.json() as Record<string, any>;
  const url: string | undefined = data?.data?.downloadUrl ?? data?.data?.fileUrl;
  if (!url) throw new Error(`KIE upload: no downloadUrl (${data?.msg ?? "unknown"})`);
  return url;
}

async function kieCreateTask(imageURL: string, prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(KIE_CREATE_TASK_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: KIE_MODEL,
      input: { prompt, input_urls: [imageURL], aspect_ratio: "auto" },
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`KIE createTask HTTP ${res.status}`);

  const data = await res.json() as Record<string, any>;
  const taskId: string | undefined = data?.data?.taskId;
  if (!taskId) throw new Error(`KIE createTask: no taskId (${data?.msg ?? "unknown"})`);
  return taskId;
}

async function kiePollTask(taskId: string, apiKey: string): Promise<string> {
  const pollURL = `${KIE_RECORD_INFO_BASE}?taskId=${encodeURIComponent(taskId)}`;

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const res = await fetch(pollURL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) continue;

    const data = await res.json() as Record<string, any>;
    const d = data?.data as Record<string, any> | undefined;
    const state: string = d?.state ?? "";

    if (state === "success") {
      let resultUrl: string | undefined;
      try {
        resultUrl = (JSON.parse(d?.resultJson ?? "{}")?.resultUrls ?? [])[0];
      } catch { /* fallthrough */ }
      if (!resultUrl) throw new Error("KIE poll: success but no resultUrls");
      return resultUrl;
    }
    if (state === "fail" || state === "failed" || state === "error") {
      throw new Error(`KIE generation failed: ${d?.failMsg ?? "unknown"}`);
    }
  }
  throw new Error("KIE generation timed out after 3 minutes");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("KIE_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!apiKey || !supabaseUrl || !serviceKey) {
    return json({ error: "Server not configured." }, 500);
  }

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Unauthorized" }, 401);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  const userId = userData?.user?.id;
  if (userErr || !userId) return json({ error: "Unauthorized" }, 401);

  // --- Subscription gate: tier 'pro'+ and not expired ---
  const { data: profile, error: profErr } = await admin
    .from("profiles")
    .select("subscription_tier, subscription_expiry")
    .eq("id", userId)
    .single();

  if (profErr || !profile) return json({ error: "Profile not found." }, 403);

  const rank = TIER_RANK[profile.subscription_tier as string] ?? 0;
  const expiry = profile.subscription_expiry ? new Date(profile.subscription_expiry as string) : null;
  const active = expiry ? expiry.getTime() > Date.now() : false;
  if (rank < REQUIRED_TIER_RANK || !active) {
    return json({ error: "Le Photo Booth nécessite un abonnement Pro actif." }, 402);
  }

  // --- Per-user daily quota (atomic) ---
  const { data: allowed, error: quotaErr } = await admin.rpc(
    "check_and_increment_kie_usage",
    { p_user_id: userId, p_limit: DAILY_LIMIT },
  );
  if (quotaErr) return json({ error: "Quota check failed." }, 500);
  if (allowed !== true) {
    return json({ error: `Limite quotidienne atteinte (${DAILY_LIMIT}/jour).` }, 429);
  }

  let imageBase64: string;
  let preset: string;
  try {
    const parsed = await req.json();
    imageBase64 = parsed?.imageBase64;
    preset = parsed?.preset;
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  if (typeof imageBase64 !== "string" || imageBase64.length === 0) {
    return json({ error: "imageBase64 is required" }, 400);
  }
  if (imageBase64.length > MAX_IMAGE_BASE64) {
    return json({ error: "Image payload too large." }, 413);
  }
  const prompt = typeof preset === "string" ? PRESET_PROMPTS[preset] : undefined;
  if (!prompt) {
    return json({ error: `Unknown preset: ${preset}` }, 400);
  }

  try {
    const imageURL = await kieUpload(imageBase64, apiKey);
    const taskId = await kieCreateTask(imageURL, prompt, apiKey);
    const resultUrl = await kiePollTask(taskId, apiKey);
    return json({ resultUrl }, 200);
  } catch (err) {
    // Log detail server-side only; never leak internal/upstream errors to client.
    console.error("kie-generate failed:", err instanceof Error ? err.message : err);
    return json({ error: "La génération a échoué. Réessaie plus tard." }, 500);
  }
});
