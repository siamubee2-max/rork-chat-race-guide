import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "../create-context";
import type { SubscriptionTier } from "../../../lib/supabase";

// ---------------------------------------------------------------------------
// Zod schema for an update payload
// ---------------------------------------------------------------------------
const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subscription_tier: z
    .enum(["free", "premium", "premium_plus", "family", "pro"])
    .optional(),
});

export const profileRouter = createTRPCRouter({
  /**
   * GET /trpc/profile.me
   * Returns the authenticated user's profile row from the `profiles` table.
   * Requires a valid Supabase session.
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from("profiles")
      .select("*")
      .eq("id", ctx.user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error.message,
      });
    }

    if (!data) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Profile not found.",
      });
    }

    return data as {
      id: string;
      email: string;
      name: string;
      subscription_tier: SubscriptionTier;
      subscription_expiry: string | null;
      created_at: string;
    };
  }),

  /**
   * PATCH /trpc/profile.update
   * Updates mutable profile fields for the authenticated user.
   */
  update: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      if (Object.keys(input).length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No fields to update.",
        });
      }

      const { data, error } = await ctx.supabase
        .from("profiles")
        .update(input)
        .eq("id", ctx.user.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return data;
    }),

  /**
   * GET /trpc/profile.hello — public health-check endpoint, no auth required.
   */
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => ({
      message: `Hello, ${input.name ?? "world"}!`,
    })),
});
