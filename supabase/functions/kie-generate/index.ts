// Supabase Edge Function: kie-generate
// Proxies a KIE AI image-generation request server-side so KIE_API_KEY never
// ships in the iOS app bundle. Mirrors expo/backend/trpc/routes/kie.ts.
//
// Auth: deployed with verify_jwt=true — Supabase validates the caller's JWT
// (the user's access token) before this code runs.
//
// Request  (POST, application/json): { "imageBase64": string, "preset": string }
// Response (200, application/json):   { "resultUrl": string }

const KIE_UPLOAD_URL = "https://kieai.redpandaai.co/api/file-stream-upload";
const KIE_CREATE_TASK_URL = "https://api.kie.ai/api/v1/jobs/createTask";
const KIE_RECORD_INFO_BASE = "https://api.kie.ai/api/v1/jobs/recordInfo";

const MAX_IMAGE_BASE64 = 7_000_000;
const POLL_MAX_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 3_000;

// Prompt lookup — mirrors AccessoryPreset.prompt in KieAIService.swift
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

  // Do NOT set Content-Type manually — fetch adds the multipart boundary.
  const res = await fetch(KIE_UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`KIE upload failed: ${res.status}`);

  const data = await res.json() as Record<string, any>;
  const url: string | undefined = data?.url ?? data?.fileUrl ?? data?.data?.url;
  if (!url) throw new Error("KIE upload: no URL in response");
  return url;
}

async function kieCreateTask(imageURL: string, prompt: string, apiKey: string): Promise<string> {
  const res = await fetch(KIE_CREATE_TASK_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-image", input: { prompt, image: imageURL, action: "edit" } }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`KIE createTask failed: ${res.status}`);

  const data = await res.json() as Record<string, any>;
  const taskId: string | undefined = data?.body?.taskId;
  if (!taskId) throw new Error("KIE createTask: no taskId in response");
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
    const body = data?.body as Record<string, any> | undefined;
    const state: string = body?.state ?? "";

    if (state === "success" || state === "completed") {
      const resultUrl: string | undefined =
        body?.result?.url ?? body?.result?.imageUrl ?? body?.result?.images?.[0]?.url;
      if (!resultUrl) throw new Error("KIE poll: success but no result URL");
      return resultUrl;
    }
    if (state === "fail" || state === "failed" || state === "error") {
      throw new Error("KIE generation failed");
    }
  }
  throw new Error("KIE generation timed out after 3 minutes");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("KIE_API_KEY");
  if (!apiKey) return json({ error: "KIE_API_KEY is not configured on the server." }, 500);

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
    return json({ error: String(err instanceof Error ? err.message : err) }, 500);
  }
});
