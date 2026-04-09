import { z } from "zod";
import { TRPCError } from "@trpc/server";
import OpenAI from "openai";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  getOpenAIKey,
} from "../create-context";

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

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------
const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
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
        systemPrompt: z.string().optional(),
        model: z.string().optional().default("gpt-4o-mini"),
      })
    )
    .mutation(async ({ input }) => {
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
        mimeType: z.string().default("audio/m4a"),
        language: z.string().default("fr"),
      })
    )
    .mutation(async ({ input }) => {
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
        catName: z.string().optional(),
        catAge: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
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
        catName: z.string(),
        catAge: z.string().optional(),
        recentLogs: z.array(z.any()).max(14),
        weightHistory: z.array(z.any()).max(10),
        medicalRecords: z.array(z.any()).optional(),
      })
    )
    .mutation(async ({ input }) => {
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
  breedIdentify: publicProcedure
    .input(
      z.object({
        imageBase64: z.string(),
        language: z.string().default("fr"),
      })
    )
    .mutation(async ({ input }) => {
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
