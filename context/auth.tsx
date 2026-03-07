import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import createContextHook from "@nkzw/create-context-hook";

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiry?: string;
}

interface StoredUser extends User {
  password: string;
}

const STORAGE_USERS = "users";
const STORAGE_CURRENT_USER = "current_user";

const hashPassword = (password: string, email: string): string => {
  let hash = 0;
  const str = password + email.toLowerCase();
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadCurrentUser();
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

  const signup = useCallback(async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
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
        password: hashPassword(password, email),
        name,
        createdAt: new Date().toISOString(),
        subscriptionTier: 'free',
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
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_CURRENT_USER);
      setCurrentUser(null);
    } catch (error) {
      if (__DEV__) {
        console.error("Error logging out:", error);
      }
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_CURRENT_USER);
      if (!userData) {
        return { success: false, error: "Aucun utilisateur connecté" };
      }
      const user: User = JSON.parse(userData);

      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      const filteredUsers = users.filter((u) => u.id !== user.id);

      await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(filteredUsers));
      await AsyncStorage.removeItem(STORAGE_CURRENT_USER);
      setCurrentUser(null);

      return { success: true };
    } catch (error) {
      if (__DEV__) {
        console.error("Error deleting account:", error);
      }
      return { success: false, error: "Erreur lors de la suppression du compte" };
    }
  }, []);

  const getRegisteredEmails = useCallback(async (): Promise<string[]> => {
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
  }, []);

  const getUserByEmail = useCallback(async (email: string): Promise<{ name: string; password: string } | null> => {
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
  }, []);

  const updateSubscription = useCallback(async (tier: SubscriptionTier, customExpiry?: number) => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_CURRENT_USER);
      if (!userData) return;
      const current: User = JSON.parse(userData);

      const usersData = await AsyncStorage.getItem(STORAGE_USERS);
      const users: StoredUser[] = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u) => u.id === current.id);

      if (userIndex === -1) return;

      const expiry = customExpiry 
        ? new Date(customExpiry).toISOString()
        : tier !== 'free' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() 
          : undefined;

      users[userIndex].subscriptionTier = tier;
      users[userIndex].subscriptionExpiry = expiry;

      await AsyncStorage.setItem(STORAGE_USERS, JSON.stringify(users));

      const updatedUser: User = {
        ...current,
        subscriptionTier: tier,
        subscriptionExpiry: expiry,
      };

      setCurrentUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_CURRENT_USER, JSON.stringify(updatedUser));
    } catch (error) {
      if (__DEV__) {
        console.error("Error updating subscription:", error);
      }
    }
  }, []);

  return useMemo(() => ({
    currentUser,
    isLoading,
    isAuthenticated: !!currentUser,
    signup,
    login,
    logout,
    deleteAccount,
    getRegisteredEmails,
    getUserByEmail,
    updateSubscription,
  }), [currentUser, isLoading, signup, login, logout, deleteAccount, getRegisteredEmails, getUserByEmail, updateSubscription]);
});
