export type PlanId = 'free' | 'premium' | 'family' | 'pro' | 'founder';
export type ProductId = 'free' | 'premium_monthly' | 'premium_yearly' | 'family_monthly' | 'family_yearly' | 'pro_monthly' | 'pro_yearly' | 'founder';

export interface PlanLimits {
  scans: number;
  aiQuestions: number;
  communityPosts: number;
  emergencyPosters: number;
  gamificationLevel: number;
  pets: number;
  accounts?: number;
  apiAccess?: boolean;
  businessTools?: boolean;
  founderBadge?: boolean;
}

export interface ProductConfig {
  id: string;
  revenueCatId: string | null;
  stripeId: string | null;
  price?: number;
  currency?: string;
  interval?: string;
  savings?: number;
  lifetime?: boolean;
  limited?: number;
}

export const SUBSCRIPTION_CONFIG = {
  products: {
    free: {
      id: 'free',
      revenueCatId: null,
      stripeId: null,
    },
    premium_monthly: {
      id: 'premium_monthly',
      revenueCatId: 'premium_monthly',
      stripeId: 'price_premium_monthly',
      price: 14.99,
      currency: 'USD',
      interval: 'month',
    },
    premium_yearly: {
      id: 'premium_yearly',
      revenueCatId: 'premium_yearly',
      stripeId: 'price_premium_yearly',
      price: 149.99,
      currency: 'USD',
      interval: 'year',
      savings: 29.89,
    },
    family_monthly: {
      id: 'family_monthly',
      revenueCatId: 'family_monthly',
      stripeId: 'price_family_monthly',
      price: 24.99,
      currency: 'USD',
      interval: 'month',
    },
    family_yearly: {
      id: 'family_yearly',
      revenueCatId: 'family_yearly',
      stripeId: 'price_family_yearly',
      price: 239.99,
      currency: 'USD',
      interval: 'year',
      savings: 59.89,
    },
    pro_monthly: {
      id: 'pro_monthly',
      revenueCatId: 'pro_monthly',
      stripeId: 'price_pro_monthly',
      price: 49.99,
      currency: 'USD',
      interval: 'month',
    },
    pro_yearly: {
      id: 'pro_yearly',
      revenueCatId: 'pro_yearly',
      stripeId: 'price_pro_yearly',
      price: 499.99,
      currency: 'USD',
      interval: 'year',
      savings: 99.89,
    },
    founder: {
      id: 'founder',
      revenueCatId: 'founder_lifetime',
      stripeId: 'price_founder_lifetime',
      price: 9.99,
      currency: 'USD',
      interval: 'month',
      lifetime: true,
      limited: 1000,
    },
  } satisfies Record<string, ProductConfig>,

  limits: {
    free: {
      scans: 10,
      aiQuestions: 15,
      communityPosts: 3,
      emergencyPosters: 1,
      gamificationLevel: 3,
      pets: 1,
    },
    premium: {
      scans: -1,
      aiQuestions: -1,
      communityPosts: -1,
      emergencyPosters: 5,
      gamificationLevel: -1,
      pets: 1,
    },
    family: {
      scans: -1,
      aiQuestions: -1,
      communityPosts: -1,
      emergencyPosters: -1,
      gamificationLevel: -1,
      pets: 5,
      accounts: 5,
    },
    pro: {
      scans: -1,
      aiQuestions: -1,
      communityPosts: -1,
      emergencyPosters: -1,
      gamificationLevel: -1,
      pets: -1,
      accounts: -1,
      apiAccess: true,
      businessTools: true,
    },
    founder: {
      scans: -1,
      aiQuestions: -1,
      communityPosts: -1,
      emergencyPosters: 5,
      gamificationLevel: -1,
      pets: 1,
      founderBadge: true,
    },
  } satisfies Record<PlanId, PlanLimits>,

  trial: {
    enabled: true,
    duration: 14,
    requiresCreditCard: false,
  },

  refund: {
    enabled: true,
    duration: 30,
    policy: 'https://purrly.app/refund-policy',
  },
};

export function hasReachedLimit(
  subscription: string,
  feature: string,
  current: number
): boolean {
  const limits = SUBSCRIPTION_CONFIG.limits as Record<string, Record<string, number | boolean | undefined>>;
  const limit = limits[subscription]?.[feature];

  if (limit === -1) return false;
  if (limit === undefined) return true;

  return current >= (limit as number);
}

export function getDisplayPrice(
  productId: string,
  locale: string = 'fr-FR'
): string {
  const products = SUBSCRIPTION_CONFIG.products as Record<string, ProductConfig>;
  const product = products[productId];
  if (!product || !product.price) return 'Gratuit';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: product.currency ?? 'USD',
  }).format(product.price);
}
