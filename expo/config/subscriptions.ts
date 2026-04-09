/**
 * Configuration des abonnements Purrly
 * Compatible avec RevenueCat, Stripe, ou tout autre système
 */

export const SUBSCRIPTION_CONFIG = {
  // IDs produits (à créer dans votre dashboard Stripe/RevenueCat)
  products: {
    free: {
      id: 'free',
      revenueCatId: null, // Pas besoin pour plan gratuit
      stripeId: null,
    },
    
    premium_monthly: {
      id: 'premium_monthly',
      revenueCatId: 'premium_monthly', 
      stripeId: 'price_premium_monthly', 
      price: 14.99,
      currency: 'EUR',
      interval: 'month',
    },
    
    premium_yearly: {
      id: 'premium_yearly',
      revenueCatId: 'com.purrly.premium.yearly',
      stripeId: 'price_premium_yearly',
      price: 149.99,
      currency: 'EUR',
      interval: 'year',
      savings: 29.89, 
    },
    
    family_monthly: {
      id: 'family_monthly',
      revenueCatId: 'com.purrly.family.monthly',
      stripeId: 'price_family_monthly',
      price: 24.99,
      currency: 'EUR',
      interval: 'month',
    },
    
    family_yearly: {
      id: 'family_yearly',
      revenueCatId: 'com.purrly.family.yearly',
      stripeId: 'price_family_yearly',
      price: 239.99,
      currency: 'EUR',
      interval: 'year',
      savings: 59.89,
    },
    
    pro_monthly: {
      id: 'pro_monthly',
      revenueCatId: 'com.purrly.pro.monthly',
      stripeId: 'price_pro_monthly',
      price: 49.99,
      currency: 'EUR',
      interval: 'month',
    },
    
    pro_yearly: {
      id: 'pro_yearly',
      revenueCatId: 'com.purrly.pro.yearly',
      stripeId: 'price_pro_yearly',
      price: 499.99,
      currency: 'EUR',
      interval: 'year',
      savings: 99.89,
    },
    

  },

  // Limites par plan
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
      scans: -1, // illimité
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

  },

  // Configuration essai gratuit
  trial: {
    enabled: true,
    duration: 14, // jours
    requiresCreditCard: false, // Pas de CB pour trial
  },

  // Configuration remboursement
  refund: {
    enabled: true,
    duration: 30, // jours
    policy: 'https://siamubee2-max.github.io/purrly-legal/terms/',
  },
};

// Helper pour vérifier si user a atteint limite
export function hasReachedLimit(
  subscription: string,
  feature: string,
  current: number
): boolean {
  const limits = SUBSCRIPTION_CONFIG.limits as Record<string, Record<string, number | boolean | undefined>>;
  const limit = limits[subscription]?.[feature];
  
  if (limit === -1) return false; // illimité
  if (limit === undefined) return true; // feature non disponible
  
  return current >= (limit as number);
}

// Helper pour obtenir prix affiché
export function getDisplayPrice(
  productId: string,
  locale: string = 'fr-FR'
): string {
  const products = SUBSCRIPTION_CONFIG.products as Record<string, { price?: number; currency?: string; [key: string]: unknown }>;
  const product = products[productId];
  if (!product || !product.price) return 'Gratuit';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: product.currency ?? 'USD',
  }).format(product.price);
}