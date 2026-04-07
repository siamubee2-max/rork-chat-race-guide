import type { SubscriptionTier } from '@/context/auth';

/**
 * Maps a RevenueCat product identifier to the local subscription tier.
 * Used in both _layout.tsx (sync) and subscription screen (purchase).
 */
export function getTierFromProductId(productId: string): SubscriptionTier {
  const lower = productId.toLowerCase();
  if (lower.includes('family') || lower.includes('pro')) {
    return 'premium_plus';
  }
  return 'premium';
}
