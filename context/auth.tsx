import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
  addOns: string[];
}

interface StoredUser extends User {
  password: string;
}

const STORAGE_USERS = "users";
const STORAGE_CURRENT_USER = "current_user";

// Fonction de hash simple pour les mots de passe
// NOTE: En production, utiliser un vrai système d'authentification avec backend et bcrypt
const hashPassword = (password: string, email: string): string => {
  // Hash simple basé sur le mot de passe et l'email comme salt
  let hash = 0;
  const str = password + email.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_CURRENT_USER);
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error loading current user:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: "Adresse email invalide" };
      }

      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, error: "Cette adresse email existe déjà" };
      }

      const newUser: StoredUser = {
        id: Date.now().toString(),
        email,
        password: hashPassword(password, email), // Stocker le hash au lieu du mot de passe en clair
        name,
        createdAt: new Date().toISOString(),
        subscriptionTier: 'free',
        addOns: [],
      };

      users.push(newUser);
      await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(users));

      const userToStore: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt,
        subscriptionTier: newUser.subscriptionTier,
        subscriptionExpiry: newUser.subscriptionExpiry,
        addOns: newUser.addOns,
      };

      setCurrentUser(userToStore);
      await AsyncStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(userToStore));

      return { success: true };
    } catch (error) {
      if (__DEV__) {
        console.error("Error signing up:", error);
      }
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];

      const passwordHash = hashPassword(password, email);
      const user = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === passwordHash
      );

      if (!user) {
        return { success: false, error: "Email ou mot de passe incorrect" };
      }

      const userToStore: User = {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        subscriptionTier: user.subscriptionTier || 'free',
        subscriptionExpiry: user.subscriptionExpiry,
        addOns: user.addOns || [],
      };

      setCurrentUser(userToStore);
      await AsyncStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(userToStore));

      return { success: true };
    } catch (error) {
      if (__DEV__) {
        console.error("Error logging in:", error);
      }
      return { success: false, error: "Erreur lors de la connexion" };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_CURRENT_USER);
      setCurrentUser(null);
    } catch (error) {
      if (__DEV__) {
        console.error("Error logging out:", error);
      }
    }
  };

  const getRegisteredEmails = async (): Promise<string[]> => {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      return users.map((u) => u.email);
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting registered emails:", error);
      }
      return [];
    }
  };

  const getUserByEmail = async (email: string): Promise<{ name: string; password: string } | null> => {
    try {
      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      return user ? { name: user.name, password: user.password } : null;
    } catch (error) {
      if (__DEV__) {
        console.error("Error getting user by email:", error);
      }
      return null;
    }
  };

  const updateSubscription = async (tier: SubscriptionTier, addOns: string[] = [], customExpiry?: number) => {
    try {
      if (!currentUser) return;

      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u) => u.id === currentUser.id);

      if (userIndex === -1) return;

      const expiry = customExpiry 
        ? new Date(customExpiry).toISOString()
        : tier !== 'free' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
          : undefined;

      users[userIndex].subscriptionTier = tier;
      users[userIndex].subscriptionExpiry = expiry;
      users[userIndex].addOns = addOns;

      await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(users));

      const updatedUser: User = {
        ...currentUser,
        subscriptionTier: tier,
        subscriptionExpiry: expiry,
        addOns,
      };

      setCurrentUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedUser));
    } catch (error) {
      if (__DEV__) {
        console.error("Error updating subscription:", error);
      }
    }
  };

  return {
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    getRegisteredEmails,
    getUserByEmail,
    updateSubscription,
  };
});
