import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { SUBSCRIPTION_CONFIG, hasReachedLimit } from '@/config/subscriptions';
import { useAuth } from '@/context/auth';

export interface SubscriptionStatus {
  tier: 'free' | 'premium' | 'family' | 'pro' | 'founder';
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

export function useSubscription() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchSubscription();
    }
  }, [currentUser]);

  const fetchSubscription = async () => {
    setLoading(true);
    try {
      // TODO: Remplacer par votre API
      const response = await fetch(`/api/subscriptions/${currentUser?.id}`);
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const canUseFeature = (feature: string): boolean => {
    if (!subscription) return false;
    
    const current = (subscription.usage as Record<string, number>)[feature] || 0;
    return !hasReachedLimit(subscription.tier, feature, current);
  };

  const checkLimit = (feature: string): {
    canUse: boolean;
    remaining: number;
    limit: number;
  } => {
    if (!subscription) {
      return { canUse: false, remaining: 0, limit: 0 };
    }

    const tierLimits = SUBSCRIPTION_CONFIG.limits[subscription.tier] as Record<string, number | boolean | undefined>;
    const limit = tierLimits[feature] as number;
    const current = (subscription.usage as Record<string, number>)[feature] || 0;
    
    if (limit === -1) {
      return { canUse: true, remaining: -1, limit: -1 }; // illimité
    }

    return {
      canUse: current < limit,
      remaining: Math.max(0, limit - current),
      limit,
    };
  };

  const showUpgradeAlert = (feature: string) => {
    Alert.alert(
      '🔒 Limite atteinte',
      `Vous avez atteint la limite de votre plan gratuit. Passez à Premium pour un accès illimité !`,
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
  };

  const incrementUsage = async (feature: string, amount: number = 1) => {
    if (!subscription) return;

    try {
      // TODO: Remplacer par votre API
      await fetch(`/api/subscriptions/${currentUser?.id}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, amount }),
      });

      // Mettre à jour localement
      setSubscription((prev) => ({
        ...prev!,
        usage: {
          ...prev!.usage,
          [feature]: ((prev!.usage as Record<string, number>)[feature] || 0) + amount,
        },
      }));
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  };

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