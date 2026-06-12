import { useCallback, useEffect, useMemo, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus' | 'family' | 'pro';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
}

const LIFETIME_EXPIRY = '2125-01-01T00:00:00Z';

// VIP accounts that get lifetime pro subscription — loaded from env to avoid
// exposing real emails in source code. Format: comma-separated list.
// Example in .env: EXPO_PUBLIC_VIP_EMAILS=admin@example.com,vip@example.com
const VIP_EMAILS: string[] = (
  process.env.EXPO_PUBLIC_VIP_EMAILS ?? ''
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const mapProfile = (profile: any): User => ({
  id: profile.id,
  email: profile.email,
  name: profile.name || '',
  createdAt: profile.created_at,
  subscriptionTier: (profile.subscription_tier as SubscriptionTier) || 'free',
  subscriptionExpiry: profile.subscription_expiry ?? undefined,
});

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from Supabase and apply VIP upgrade if needed
  const loadProfile = async (userId: string, email: string): Promise<User | null> => {
    const isVip = VIP_EMAILS.includes(email.toLowerCase());

    if (isVip) {
      // Ensure VIP has lifetime pro — upsert
      await supabase
        .from('profiles')
        .update({ subscription_tier: 'pro', subscription_expiry: LIFETIME_EXPIRY })
        .eq('id', userId);
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;
    return mapProfile(data);
  };

  // Listen to Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          const user = await loadProfile(session.user.id, session.user.email!);
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
        setIsLoading(false);
      }
    );

    // Initial session check with timeout fallback
    const initSession = async () => {
      try {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        );

        const sessionPromise = supabase.auth.getSession();
        const { data: { session } } = await Promise.race([sessionPromise, timeout]);

        if (session?.user) {
          const user = await loadProfile(session.user.id, session.user.email!);
          setCurrentUser(user);
        }
      } catch (error) {
        // Network or timeout error — treat as not authenticated
        if (__DEV__) console.log('[Auth] Init session error (treating as logged out):', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initSession();

    return () => subscription.unsubscribe();
  }, []);

  const signup = useCallback(async (
    email: string,
    password: string,
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedName = name.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return { success: false, error: "Adresse email invalide" };
      }

      if (!normalizedName) {
        return { success: false, error: "Le nom est requis" };
      }

      const isVip = VIP_EMAILS.includes(normalizedEmail);

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name: normalizedName },
          // Skip email confirmation for demo
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: "Cette adresse email existe déjà" };
        }
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Erreur lors de l'inscription" };
      }

      // Upsert profile with retry (trigger may have already created it)
      let retries = 3;
      let profileCreated = false;
      while (retries > 0 && !profileCreated) {
        try {
          const { error: upsertError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            email: normalizedEmail,
            name: normalizedName,
            subscription_tier: isVip ? 'pro' : 'free',
            subscription_expiry: isVip ? LIFETIME_EXPIRY : null,
          });
          if (!upsertError) {
            profileCreated = true;
          } else if (upsertError.code === '23505') {
            // Duplicate key — profile already exists, that's fine
            profileCreated = true;
          } else {
            retries--;
            if (retries > 0) await new Promise((r) => setTimeout(r, 1000));
          }
        } catch {
          retries--;
          if (retries > 0) await new Promise((r) => setTimeout(r, 1000));
        }
      }

      return { success: true };
    } catch (error) {
      if (__DEV__) console.error("Error signing up:", error);
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  }, []);

  const login = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: "Email ou mot de passe incorrect" };
        }
        if (error.message.includes('Email not confirmed')) {
          return { success: false, error: "Veuillez confirmer votre email" };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      if (__DEV__) console.error("Error logging in:", error);
      return { success: false, error: "Erreur lors de la connexion" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      if (__DEV__) console.error("Error logging out:", error);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser) return { success: false, error: "Aucun utilisateur connecté" };

      // Delete profile first (cascades from auth.users)
      await supabase.from('profiles').delete().eq('id', currentUser.id);
      // Sign out (actual auth.users deletion requires service_role server-side)
      await supabase.auth.signOut();
      setCurrentUser(null);
      return { success: true };
    } catch (error) {
      if (__DEV__) console.error("Error deleting account:", error);
      return { success: false, error: "Erreur lors de la suppression du compte" };
    }
  }, [currentUser]);

  const getRegisteredEmails = useCallback(async (): Promise<string[]> => {
    // Not exposable with anon key + RLS — return empty
    return [];
  }, []);

  const getUserByEmail = useCallback(async (
    email: string
  ): Promise<{ name: string; password: string } | null> => {
    // Passwords are not accessible via Supabase Auth — return null
    return null;
  }, []);

  const updateSubscription = useCallback(async (
    tier: SubscriptionTier,
    customExpiry?: number
  ) => {
    try {
      if (!currentUser) return;

      const expiry = customExpiry
        ? new Date(customExpiry).toISOString()
        : tier !== 'free'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : null;

      if (tier === 'free') {
        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_tier: 'free',
            subscription_expiry: null,
          })
          .eq('id', currentUser.id);

        if (error) {
          if (__DEV__) console.error("Error downgrading subscription:", error);
          return;
        }
      }

      if (__DEV__ && tier !== 'free') {
        console.warn('[Auth] Skipping client-side persistence for paid tier update');
      }

      setCurrentUser((prev) =>
        prev ? { ...prev, subscriptionTier: tier, subscriptionExpiry: expiry ?? undefined } : null
      );
    } catch (error) {
      if (__DEV__) console.error("Error updating subscription:", error);
    }
  }, [currentUser]);

  return useMemo(() => ({
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    getRegisteredEmails,
    getUserByEmail,
    updateSubscription,
    deleteAccount,
  }), [currentUser, isLoading, signup, login, logout, getRegisteredEmails, getUserByEmail, updateSubscription, deleteAccount]);
});
