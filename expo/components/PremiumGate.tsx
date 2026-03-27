import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Lock, Crown } from "lucide-react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";
import { Colors } from "@/constants/colors";

interface PremiumGateProps {
  children: React.ReactNode;
}

export function PremiumGate({ children }: PremiumGateProps) {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  
  const isPremium = currentUser?.subscriptionTier === 'premium' || currentUser?.subscriptionTier === 'premium_plus';
  console.log('[PremiumGate] User tier:', currentUser?.subscriptionTier, 'isPremium:', isPremium);

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentPreview}>
        {children}
      </View>
      <View style={styles.overlay}>
        <View style={styles.gateContent}>
          <View style={styles.iconContainer}>
            <Lock color="#fff" size={32} />
          </View>
          <Text style={styles.title}>{t('premiumGate.title')}</Text>
          <Text style={styles.description}>{t('premiumGate.description')}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.subscribeButton,
              pressed && styles.subscribeButtonPressed,
            ]}
            onPress={() => router.push('/(tabs)/subscription' as any)}
          >
            <Crown color="#fff" size={20} />
            <Text style={styles.subscribeButtonText}>{t('premiumGate.subscribe')}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export function usePremiumAccess() {
  const { currentUser } = useAuth();
  const isPremium = currentUser?.subscriptionTier === 'premium' || currentUser?.subscriptionTier === 'premium_plus';
  console.log('[usePremiumAccess] User tier:', currentUser?.subscriptionTier, 'isPremium:', isPremium);
  return { isPremium, subscriptionTier: currentUser?.subscriptionTier };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  contentPreview: {
    flex: 1,
    opacity: 0.3,
    minHeight: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  gateContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  subscribeButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
