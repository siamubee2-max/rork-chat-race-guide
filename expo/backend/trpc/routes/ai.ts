import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../create-context";
import { getOpenAIKey } from "../../../lib/openai";
import OpenAI from "openai";
import type { SubscriptionTier } from "../../../lib/supabase";

// Tier hierarchy for subscription verification
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  pro: 1,
  premium: 2,
  premium_plus: 3,
  family: 4,
};

/**
 * Verify user has required subscription tier before processing AI requests
 * @param ctx - tRPC context with Supabase client and user
 * @param requiredTier - Minimum tier required ("pro" or "premium")
 * @param feature - Optional feature name for logging
 * @throws TRPCError with UNAUTHORIZED code if subscription insufficient
 */
async function verifySubscriptionTier(
  ctx: any,
  requiredTier: "pro" | "premium",
  feature?: string
): Promise<void> {
  // Fetch current subscription status
  const { data: profile, error } = await ctx.supabase
    .from("profiles")
    .select("subscription_tier, subscription_expiry")
    .eq("id", ctx.user.id)
    .single();

  if (error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Failed to verify subscription: ${error.message}`,
    });
  }

  if (!profile) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User profile not found.",
    });
  }

  // Check if subscription is active
  const now = new Date();
  const expiryDate = profile.subscription_expiry ? new Date(profile.subscription_expiry) : null;
  const isActive = expiryDate ? expiryDate > now : false;

  // Check tier hierarchy
  const userTier = profile.subscription_tier as SubscriptionTier;
  const hasRequiredTier = TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];

  // Grant access only if subscription is active AND tier is sufficient
  const hasAccess = isActive && hasRequiredTier;

  if (!hasAccess) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `This feature requires an active ${requiredTier} subscription. Your current tier: ${userTier} (${isActive ? "active" : "expired"})`,
    });
  }
}

// ---------------------------------------------------------------------------
// Lazy OpenAI client — created on first use to avoid crash if key is missing
// ---------------------------------------------------------------------------
let _openai: OpenAI | null = null;
function getClient(): OpenAI {
  if (!_openai) {
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "OpenAI API key is not configured on the server.",
      });
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

const ALLOWED_CHAT_MODELS = ["gpt-4o-mini"] as const;
const MAX_CHAT_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_SYSTEM_PROMPT_LENGTH = 1000;
const MAX_AUDIO_BASE64_LENGTH = 7_000_000;
const MAX_IMAGE_BASE64_LENGTH = 7_000_000;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

export const aiRouter = createTRPCRouter({
  /**
   * POST /trpc/ai.chat
   * Streams a chat completion from GPT-4o.
   * Pass the full message history + optional system prompt.
   */
  chat: protectedProcedure
    .input(
      z.object({
        messages: z.array(messageSchema).min(1),
        systemPrompt: z.string().max(MAX_SYSTEM_PROMPT_LENGTH).optional(),
        model: z.enum(ALLOWED_CHAT_MODELS).optional().default("gpt-4o-mini"),
      })
      .refine((value) => value.messages.length <= MAX_CHAT_MESSAGES, {
        message: `A maximum of ${MAX_CHAT_MESSAGES} messages is allowed per request.`,
        path: ["messages"],
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Subscription verification - pro tier required for AI chat
      await verifySubscriptionTier(ctx, 'pro');

      const openai = getClient();

      const systemMessage: OpenAI.ChatCompletionMessageParam = {
        role: "system",
        content:
          input.systemPrompt ??
          "Tu es Purrly, un assistant IA expert en santé et bien-être félin. Réponds de manière concise, précise et amicale en français.",
      };

      const response = await openai.chat.completions.create({
        model: input.model,
        messages: [
          systemMessage,
          ...input.messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        max_tokens: 1024,
      });

      const content = response.choices[0]?.message?.content ?? "";
      return { content, usage: response.usage };
    }),

  /**
   * POST /trpc/ai.transcribe
   * Transcribes audio using Whisper.
   * Accepts a base64-encoded audio blob.
   */
  transcribe: protectedProcedure
    .input(
      z.object({
        audioBase64: z.string(),
        mimeType: z.string().min(3).max(100).default("audio/m4a"),
        language: z.string().min(2).max(10).default("fr"),
      })
      .refine((value) => value.audioBase64.length <= MAX_AUDIO_BASE64_LENGTH, {
        message: "Audio payload too large.",
        path: ["audioBase64"],
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Subscription verification - pro tier required for audio transcription
      await verifySubscriptionTier(ctx, 'pro');

      const openai = getClient();

      // Convert base64 → Buffer → File
      const buffer = Buffer.from(input.audioBase64, "base64");
      const ext = input.mimeType.split("/")[1] ?? "m4a";
      const file = new File([buffer], `recording.${ext}`, {
        type: input.mimeType,
      });

      const transcription = await openai.audio.transcriptions.create({
        file,
        model: "whisper-1",
        language: input.language,
      });

      return { text: transcription.text };
    }),

  /**
   * POST /trpc/ai.analyzeImage
   * Analyzes a cat photo using GPT-4o Vision.
   * Returns mood, body condition, observations, and recommendations.
   */
  analyzeImage: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        catName: z.string().max(80).optional(),
        catAge: z.string().max(40).optional(),
      })
      .refine((value) => value.imageBase64.length <= MAX_IMAGE_BASE64_LENGTH, {
        message: "Image payload too large.",
        path: ["imageBase64"],
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Subscription verification - pro tier required for image analysis
      await verifySubscriptionTier(ctx, 'pro');

      const openai = getClient();

      const catInfo = input.catName
        ? `This is ${input.catName}${input.catAge ? `, age ${input.catAge}` : ""}.`
        : "This is a cat.";

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${catInfo} Analyze this cat photo and respond ONLY with valid JSON matching this schema:
{
  "mood": "string (e.g. relaxed, playful, anxious, sleepy)",
  "bodyCondition": "string (underweight | ideal | overweight)",
  "healthObservations": ["string"],
  "recommendations": ["string"]
}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.imageBase64}`,
                  detail: "low",
                },
              },
            ],
          },
        ],
        max_tokens: 512,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);
      return {
        mood: parsed.mood ?? "Inconnu",
        bodyCondition: parsed.bodyCondition ?? "Non déterminé",
        healthObservations: parsed.healthObservations ?? [],
        recommendations: parsed.recommendations ?? [],
      };
    }),

  /**
   * POST /trpc/ai.generateHealthInsights
   * Generates health insights for a cat based on logs + weight history.
   */
  generateHealthInsights: protectedProcedure
    .input(
      z.object({
        catName: z.string().min(1).max(80),
        catAge: z.string().max(40).optional(),
        recentLogs: z.array(z.any()).max(14),
        weightHistory: z.array(z.any()).max(10),
        medicalRecords: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Subscription verification - pro tier required for health insights generation
      await verifySubscriptionTier(ctx, 'pro');

      const openai = getClient();

      const prompt = `Analyze this cat's health data and provide insights. Respond ONLY with valid JSON.

Cat: ${input.catName}
Age: ${input.catAge ?? "Unknown"}
Recent daily logs: ${JSON.stringify(input.recentLogs)}
Weight history: ${JSON.stringify(input.weightHistory)}
Medical records: ${JSON.stringify(input.medicalRecords ?? [])}

Return JSON matching:
{
  "insights": [
    {
      "type": "warning" | "tip" | "alert" | "positive",
      "category": "weight" | "behavior" | "nutrition" | "health" | "general",
      "title": "string",
      "description": "string",
      "priority": "low" | "medium" | "high"
    }
  ]
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a veterinary AI assistant. Provide actionable, evidence-based health insights. Always respond in French.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1024,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? '{"insights":[]}';
      const parsed = JSON.parse(raw);
      return { insights: parsed.insights ?? [] };
    }),

  /**
   * POST /trpc/ai.breedIdentify
   * Identifies a cat's breed from a photo using GPT-4o Vision.
   */
  breedIdentify: protectedProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        language: z.string().min(2).max(10).default("fr"),
      })
      .refine((value) => value.imageBase64.length <= MAX_IMAGE_BASE64_LENGTH, {
        message: "Image payload too large.",
        path: ["imageBase64"],
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Subscription verification - pro tier required for breed identification
      await verifySubscriptionTier(ctx, 'pro');

      const openai = getClient();

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Identify the cat breed in this photo. Respond ONLY with valid JSON:
{
  "breed": "string (breed name in ${input.language})",
  "confidence": "high" | "medium" | "low",
  "characteristics": ["string"],
  "origin": "string",
  "temperament": "string",
  "careLevel": "easy" | "moderate" | "demanding",
  "description": "string (2-3 sentences about the breed)"
}
If not a cat or breed cannot be determined, set breed to "Unknown".`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${input.imageBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 512,
        response_format: { type: "json_object" },
      });

      const raw = response.choices[0]?.message?.content ?? "{}";
      return JSON.parse(raw);
    }),
});
