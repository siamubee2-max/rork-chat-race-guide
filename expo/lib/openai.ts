/**
 * OpenAI client configuration for Expo backend
 * Provides secure API key retrieval for OpenAI API calls
 */

import OpenAI from "openai";

/**
 * Retrieves the OpenAI API key from environment variables
 * @throws Error if OPENAI_API_KEY is not set
 */
export function getOpenAIKey(): string {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return apiKey;
}