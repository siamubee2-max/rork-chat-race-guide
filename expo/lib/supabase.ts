import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus' | 'family' | 'pro';

export interface Profile {
  id: string;
  email: string;
  name: string;
  subscription_tier: SubscriptionTier;
  subscription_expiry: string | null;
  created_at: string;
}
