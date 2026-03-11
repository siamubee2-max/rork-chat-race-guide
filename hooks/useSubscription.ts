import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import { SUBSCRIPTION_CONFIG, hasReachedLimit } from '@/config/subscriptions';
import { useAuth } from '@/context/auth';

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'family' | 'pro';
  isActive: boolean;
  expiresAt?: Date;
  canceledAt?: Date;
  limits: {
    scans: number;
    aiQuestions: number;
    communityPosts: number;
    emergencyPosters: number;
    pets: number;
  };
  usage: {
    scans: number;
    aiQuestions: number;
    communityPosts: number;
    emergencyPosters: number;
    pets: number;
  };
}

function mapAuthTierToSubTier(authTier: string): 'free' | 'premium' | 'family' | 'pro' {
  if (authTier === 'premium_plus') return 'pro';
  if (authTier === 'premium') return 'premium';
  return 'free';
}

export function useSubscription() {
  const { currentUser } = useAuth();
  const [usage, setUsage] = useState<Record<string, number>>({});

  const tier = useMemo(() => {
    return mapAuthTierToSubTier(currentUser?.subscriptionTier ?? 'free');
  }, [currentUser?.subscriptionTier]);

  const subscription = useMemo<SubscriptionStatus | null>(() => {
    if (!currentUser) return null;

    const tierLimits = SUBSCRIPTION_CONFIG.limits[tier === 'pro' ? 'pro' : tier] as Record<string, number | boolean | undefined>;

    return {
      tier,
      isActive: tier !== 'free',
      expiresAt: currentUser.subscriptionExpiry ? new Date(currentUser.subscriptionExpiry) : undefined,
      limits: {
        scans: (tierLimits.scans as number) ?? 10,
        aiQuestions: (tierLimits.aiQuestions as number) ?? 15,
        communityPosts: (tierLimits.communityPosts as number) ?? 3,
        emergencyPosters: (tierLimits.emergencyPosters as number) ?? 1,
        pets: (tierLimits.pets as number) ?? 1,
      },
      usage: {
        scans: usage.scans ?? 0,
        aiQuestions: usage.aiQuestions ?? 0,
        communityPosts: usage.communityPosts ?? 0,
        emergencyPosters: usage.emergencyPosters ?? 0,
        pets: usage.pets ?? 0,
      },
    };
  }, [currentUser, tier, usage]);

  const canUseFeature = useCallback((feature: string): boolean => {
    const current = usage[feature] ?? 0;
    return !hasReachedLimit(tier, feature, current);
  }, [tier, usage]);

  const checkLimit = useCallback((feature: string): {
    canUse: boolean;
    remaining: number;
    limit: number;
  } => {
    const tierLimits = SUBSCRIPTION_CONFIG.limits[tier === 'pro' ? 'pro' : tier] as Record<string, number | boolean | undefined>;
    const limit = tierLimits[feature] as number;
    const current = usage[feature] ?? 0;

    if (limit === -1) {
      return { canUse: true, remaining: -1, limit: -1 };
    }

    return {
      canUse: current < (limit ?? 0),
      remaining: Math.max(0, (limit ?? 0) - current),
      limit: limit ?? 0,
    };
  }, [tier, usage]);

  const showUpgradeAlert = useCallback((_feature: string) => {
    Alert.alert(
      'Limite atteinte',
      'Vous avez atteint la limite de votre plan gratuit. Passez à Premium pour un accès illimité !',
      [
        { text: 'Plus tard', style: 'cancel' },
        { text: 'Voir les plans', onPress: () => {} },
      ]
    );
  }, []);

  const incrementUsage = useCallback(async (feature: string, amount: number = 1) => {
    setUsage((prev) => ({
      ...prev,
      [feature]: (prev[feature] ?? 0) + amount,
    }));
  }, []);

  return {
    subscription,
    loading: false,
    canUseFeature,
    checkLimit,
    showUpgradeAlert,
    incrementUsage,
    refetch: () => {},
  };
}
