import { z } from "zod";
import { TRPCError } from "@trpc/server";

import {
  createTRPCRouter,
  protectedProcedure,
} from "../create-context";
import type { SubscriptionTier } from "../../../lib/supabase";

// ---------------------------------------------------------------------------
// Subscription status response type
// ---------------------------------------------------------------------------
export interface SubscriptionStatus {
  tier: SubscriptionTier;
  isActive: boolean;
  expiryDate: string | null;
  daysRemaining: number | null;
  platform: "ios" | "android" | "web" | null;
  entitlements: string[];
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------
const subscriptionStatusSchema = z.object({
  tier: z.enum(["free", "pro", "premium"]),
  isActive: z.boolean(),
  expiryDate: z.string().nullable(),
  daysRemaining: z.number().nullable(),
  platform: z.enum(["ios", "android", "web"]).nullable(),
  entitlements: z.array(z.string()),
});

export const subscriptionRouter = createTRPCRouter({
  /**
   * GET /trpc/subscription.status
   * Returns the authenticated user's subscription status with server-side verification.
   * This is the authoritative source of truth - RevenueCat webhook data takes precedence.
   * 
   * Security: Uses protectedProcedure (requires valid session)
   *            Reads from profiles table which is updated by RevenueCat webhooks
   */
  status: protectedProcedure.query(async ({ ctx }): Promise<SubscriptionStatus> => {
    // Fetch user's profile with subscription data
    const { data: profile, error } = await ctx.supabase
      .from("profiles")
      .select("subscription_tier, subscription_expiry, subscription_platform, subscription_entitlements")
      .eq("id", ctx.user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch subscription status: ${error.message}`,
      });
    }

    if (!profile) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User profile not found.",
      });
    }

    // Calculate subscription status
    const now = new Date();
    const expiryDate = profile.subscription_expiry ? new Date(profile.subscription_expiry) : null;
    const isActive = expiryDate ? expiryDate > now : false;
    
    // Calculate days remaining
    let daysRemaining: number | null = null;
    if (expiryDate && isActive) {
      const diffTime = expiryDate.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      tier: profile.subscription_tier as SubscriptionTier,
      isActive,
      expiryDate: profile.subscription_expiry,
      daysRemaining,
      platform: profile.subscription_platform as "ios" | "android" | "web" | null,
      entitlements: profile.subscription_entitlements || [],
    };
  }),

  /**
   * POST /trpc/subscription.verify
   * Server-side verification that user has active subscription for a specific feature.
   * Use this before granting access to premium features.
   * 
   * Security: This is the critical security lock - always verify server-side
   *            Never trust client-side subscription state alone
   */
  verify: protectedProcedure
    .input(z.object({
      requiredTier: z.enum(["pro", "premium"]),
      feature: z.string().optional(), // Optional: for logging/auditing
    }))
    .query(async ({ ctx, input }) => {
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

      // Tier hierarchy: free < pro < premium < premium_plus < family
      const tierHierarchy: Record<SubscriptionTier, number> = {
        free: 0,
        pro: 1,
        premium: 2,
        premium_plus: 3,
        family: 4,
      };

      const userTier = profile.subscription_tier as SubscriptionTier;
      const hasRequiredTier = tierHierarchy[userTier] >= tierHierarchy[input.requiredTier];

      // Grant access only if subscription is active AND tier is sufficient
      const hasAccess = isActive && hasRequiredTier;

      return {
        hasAccess,
        currentTier: userTier,
        requiredTier: input.requiredTier,
        isActive,
        expiryDate: profile.subscription_expiry,
        feature: input.feature,
      };
    }),

  /**
   * GET /trpc/subscription.entitlements
   * Returns the list of entitlements the user has access to.
   * Useful for feature gating on the client.
   */
  entitlements: protectedProcedure.query(async ({ ctx }) => {
    const { data: profile, error } = await ctx.supabase
      .from("profiles")
      .select("subscription_tier, subscription_entitlements, subscription_expiry")
      .eq("id", ctx.user.id)
      .single();

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to fetch entitlements: ${error.message}`,
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

    // Return entitlements only if subscription is active
    return {
      entitlements: isActive ? (profile.subscription_entitlements || []) : [],
      tier: profile.subscription_tier as SubscriptionTier,
      isActive,
    };
  }),
});