import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";

const KIE_UPLOAD_URL = "https://kieai.redpandaai.co/api/file-stream-upload";
const KIE_CREATE_TASK_URL = "https://api.kie.ai/api/v1/jobs/createTask";
const KIE_RECORD_INFO_BASE = "https://api.kie.ai/api/v1/jobs/recordInfo";

const MAX_IMAGE_BASE64 = 7_000_000;
const POLL_MAX_ATTEMPTS = 60;
const POLL_INTERVAL_MS = 3_000;

function getKieApiKey(): string {
  const key = process.env.KIE_API_KEY;
  if (!key) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "KIE_API_KEY is not configured on the server.",
    });
  }
  return key;
}

async function kieUpload(imageBase64: string, apiKey: string): Promise<string> {
  const buffer = Buffer.from(imageBase64, "base64");
  const boundary = `boundary-${Date.now()}`;

  const parts: Buffer[] = [
    Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="cat.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`),
    buffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ];
  const body = Buffer.concat(parts);

  const response = await fetch(KIE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`,
    },
    body,
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `KIE upload failed: ${response.status}` });
  }

  const json = await response.json() as Record<string, any>;
  const url: string | undefined =
    json?.url ?? json?.fileUrl ?? json?.data?.url;
  if (!url) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KIE upload: no URL in response" });
  }
  return url;
}

async function kieCreateTask(imageURL: string, prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(KIE_CREATE_TASK_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-image",
      input: { prompt, image: imageURL, action: "edit" },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `KIE createTask failed: ${response.status}` });
  }

  const json = await response.json() as Record<string, any>;
  const taskId: string | undefined = json?.body?.taskId;
  if (!taskId) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KIE createTask: no taskId in response" });
  }
  return taskId;
}

async function kiePollTask(taskId: string, apiKey: string): Promise<string> {
  const pollURL = `${KIE_RECORD_INFO_BASE}?taskId=${encodeURIComponent(taskId)}`;

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));

    const response = await fetch(pollURL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) continue;

    const json = await response.json() as Record<string, any>;
    const body = json?.body as Record<string, any> | undefined;
    const state: string = body?.state ?? "";

    if (state === "success" || state === "completed") {
      const resultUrl: string | undefined =
        body?.result?.url ??
        body?.result?.imageUrl ??
        body?.result?.images?.[0]?.url;
      if (!resultUrl) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KIE poll: success but no result URL" });
      }
      return resultUrl;
    }

    if (state === "fail" || state === "failed" || state === "error") {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KIE generation failed" });
    }
  }

  throw new TRPCError({ code: "TIMEOUT", message: "KIE generation timed out after 3 minutes" });
}

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

export const kieRouter = createTRPCRouter({
  /**
   * POST /trpc/kie.generate
   * Proxies a KIE AI image-generation request server-side so KIE_API_KEY
   * never ships in the iOS app bundle.
   *
   * The iOS client should migrate from calling kie.ai directly
   * (KieAIService.swift) to calling this endpoint.
   */
  generate: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string().refine(
          (v) => v.length <= MAX_IMAGE_BASE64,
          { message: "Image payload too large." }
        ),
        preset: z.string().min(1).max(64),
      })
    )
    .mutation(async ({ input }) => {
      const apiKey = getKieApiKey();

      const prompt = PRESET_PROMPTS[input.preset];
      if (!prompt) {
        throw new TRPCError({ code: "BAD_REQUEST", message: `Unknown preset: ${input.preset}` });
      }

      const imageURL = await kieUpload(input.imageBase64, apiKey);
      const taskId = await kieCreateTask(imageURL, prompt, apiKey);
      const resultUrl = await kiePollTask(taskId, apiKey);

      return { resultUrl };
    }),
});
