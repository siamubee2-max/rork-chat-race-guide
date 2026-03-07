import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { SUBSCRIPTION_CONFIG, hasReachedLimit, type PlanId } from '@/config/subscriptions';
import { useAuth } from '@/context/auth';

export interface SubscriptionStatus {
  tier: PlanId;
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

type UsageKey = keyof SubscriptionStatus['usage'];

export function useSubscription() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/${currentUser?.id}`);
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      void fetchSubscription();
    }
  }, [currentUser, fetchSubscription]);

  const canUseFeature = useCallback((feature: UsageKey): boolean => {
    if (!subscription) return false;
    const current = subscription.usage[feature] ?? 0;
    return !hasReachedLimit(subscription.tier, feature, current);
  }, [subscription]);

  const checkLimit = useCallback((feature: UsageKey): {
    canUse: boolean;
    remaining: number;
    limit: number;
  } => {
    if (!subscription) {
      return { canUse: false, remaining: 0, limit: 0 };
    }

    const tierLimits = SUBSCRIPTION_CONFIG.limits[subscription.tier] as Record<string, number | boolean | undefined>;
    const limit = (tierLimits[feature] as number) ?? 0;
    const current = subscription.usage[feature] ?? 0;

    if (limit === -1) {
      return { canUse: true, remaining: -1, limit: -1 };
    }

    return {
      canUse: current < limit,
      remaining: Math.max(0, limit - current),
      limit,
    };
  }, [subscription]);

  const showUpgradeAlert = useCallback((_feature: UsageKey) => {
    Alert.alert(
      '🔒 Limite atteinte',
      'Vous avez atteint la limite de votre plan gratuit. Passez à Premium pour un accès illimité !',
      [
        { text: 'Plus tard', style: 'cancel' },
        {
          text: 'Voir les plans',
          onPress: () => {
            // TODO: Navigate to subscription screen
          },
        },
      ]
    );
  }, []);

  const incrementUsage = useCallback(async (feature: UsageKey, amount: number = 1) => {
    if (!subscription) return;

    try {
      await fetch(`/api/subscriptions/${currentUser?.id}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, amount }),
      });

      setSubscription((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          usage: {
            ...prev.usage,
            [feature]: (prev.usage[feature] ?? 0) + amount,
          },
        };
      });
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }, [subscription, currentUser]);

  return {
    subscription,
    loading,
    canUseFeature,
    checkLimit,
    showUpgradeAlert,
    incrementUsage,
    refetch: fetchSubscription,
  };
}
