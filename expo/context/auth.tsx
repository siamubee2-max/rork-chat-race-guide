import { useCallback, useEffect, useMemo, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
}

function mapProfile(profile: any, session: Session): User {
  return {
    id: session.user.id,
    email: session.user.email ?? profile.email,
    name: profile.name ?? session.user.user_metadata?.name ?? "",
    createdAt: profile.created_at ?? session.user.created_at,
    subscriptionTier: profile.subscription_tier ?? "free",
    subscriptionExpiry: profile.subscription_expiry ?? undefined,
  };
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from Supabase
  const fetchProfile = useCallback(async (session: Session): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.log("[Auth] Profile fetch error:", error.message);
        // Profile might not exist yet (trigger delay), create a basic user
        return {
          id: session.user.id,
          email: session.user.email ?? "",
          name: session.user.user_metadata?.name ?? "",
          createdAt: session.user.created_at,
          subscriptionTier: "free",
        };
      }

      return mapProfile(profile, session);
    } catch (error) {
      console.error("[Auth] fetchProfile error:", error);
      return null;
    }
  }, []);

  // Initialize: check existing session + listen for auth changes
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && mounted) {
          const user = await fetchProfile(session);
          if (mounted) setCurrentUser(user);
        }
      } catch (error) {
        console.error("[Auth] Init error:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] Auth state change:", event);
        if (session && mounted) {
          const user = await fetchProfile(session);
          if (mounted) setCurrentUser(user);
        } else if (mounted) {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signup = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Adresse email invalide" };
      }

      if (password.length < 6) {
        return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          return { success: false, error: "Cette adresse email existe déjà" };
        }
        return { success: false, error: error.message };
      }

      if (!data.session) {
        // Email confirmation required
        return { success: true };
      }

      return { success: true };
    } catch (error) {
      console.error("[Auth] Signup error:", error);
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          return { success: false, error: "Email ou mot de passe incorrect" };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return { success: false, error: "Erreur lors de la connexion" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("[Auth] Logout error:", error);
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!currentUser) {
        return { success: false, error: "Aucun utilisateur connecté" };
      }

      // Delete profile (cascade will clean up subscription_history)
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", currentUser.id);

      if (profileError) {
        console.error("[Auth] Profile delete error:", profileError);
      }

      await supabase.auth.signOut();
      setCurrentUser(null);

      console.log("[Auth] Account deleted for user:", currentUser.id);
      return { success: true };
    } catch (error) {
      console.error("[Auth] Delete account error:", error);
      return { success: false, error: "Erreur lors de la suppression du compte" };
    }
  }, [currentUser]);

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error("[Auth] Reset password error:", error);
      return { success: false, error: "Erreur lors de la réinitialisation" };
    }
  }, []);

  const updateSubscription = useCallback(async (tier: SubscriptionTier, customExpiry?: number) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      let expiry: string | undefined;
      if (customExpiry) {
        expiry = new Date(customExpiry).toISOString();
      } else if (tier !== 'free') {
        console.warn('[Auth] No expiry date provided for tier:', tier);
        expiry = undefined;
      }

      // Update profile in Supabase
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_tier: tier,
          subscription_expiry: expiry ?? null,
        })
        .eq("id", session.user.id);

      if (error) {
        console.error("[Auth] Subscription update error:", error);
        return;
      }

      // Record in subscription history
      await supabase.from("subscription_history").insert({
        user_id: session.user.id,
        tier,
        expires_at: expiry ?? null,
      });

      // Update local state
      setCurrentUser((prev) =>
        prev
          ? { ...prev, subscriptionTier: tier, subscriptionExpiry: expiry }
          : null
      );
    } catch (error) {
      console.error("[Auth] Update subscription error:", error);
    }
  }, []);

  return useMemo(() => ({
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateSubscription,
    deleteAccount,
  }), [currentUser, isLoading, signup, login, logout, resetPassword, updateSubscription, deleteAccount]);
});
