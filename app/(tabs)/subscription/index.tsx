import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Check, Crown, RefreshCw } from "lucide-react-native";
import { useAuth } from "@/context/auth";

import { useTranslation } from "react-i18next";
import { router } from "expo-router";

const SUBSCRIPTION = {
  id: 'premium',
  name: 'Premium',
  monthlyPrice: 29.99,
  yearlyPrice: 249.99,
  features: [
    'subscription.features.unlimitedScans',
    'subscription.features.allBreeds',
    'subscription.features.aiAssistant',
    'subscription.features.emergencyPosters',
    'subscription.features.noAds',
    'subscription.features.advancedAI',
    'subscription.features.advancedHealthTracking',
    'subscription.features.vetConsultations',
    'subscription.features.prioritySupport',
    'subscription.features.exclusiveContent',
  ],
  color: '#3b82f6',
  icon: Crown,
};

export default function SubscriptionScreen() {
  const { currentUser, updateSubscription, isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      Alert.alert(
        t('subscription.loginRequired'),
        t('subscription.loginRequiredDesc'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('auth.login'),
            onPress: () => router.push('/auth/login' as any),
          },
        ]
      );
      return;
    }

    const price = billingCycle === 'yearly' ? SUBSCRIPTION.yearlyPrice : SUBSCRIPTION.monthlyPrice;
    const period = billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth');

    Alert.alert(
      t('subscription.confirmTitle'),
      t('subscription.confirmDescNew', {
        plan: SUBSCRIPTION.name,
        price: price.toFixed(2),
        period,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscription.confirm'),
          onPress: async () => {
            setIsProcessing(true);
            try {
              await updateSubscription('premium');
              Alert.alert(t('common.success'), t('subscription.subscriptionActivated', { plan: SUBSCRIPTION.name }));
            } catch {
              Alert.alert(t('common.error'), t('subscription.subscriptionError'));
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('subscription.headerTitle')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('subscription.headerSubtitle')}
        </Text>
        
        <View style={styles.billingToggle}>
          <Pressable
            style={[
              styles.billingButton,
              billingCycle === 'monthly' && styles.billingButtonActive,
            ]}
            onPress={() => setBillingCycle('monthly')}
          >
            <Text
              style={[
                styles.billingButtonText,
                billingCycle === 'monthly' && styles.billingButtonTextActive,
              ]}
            >
              {t('subscription.monthly')}
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.billingButton,
              billingCycle === 'yearly' && styles.billingButtonActive,
            ]}
            onPress={() => setBillingCycle('yearly')}
          >
            <Text
              style={[
                styles.billingButtonText,
                billingCycle === 'yearly' && styles.billingButtonTextActive,
              ]}
            >
              {t('subscription.yearly')}
            </Text>
          </Pressable>
        </View>
        {billingCycle === 'yearly' && (
          <Text style={styles.savingsText}>{t('subscription.savingsText')}</Text>
        )}
      </View>

      {currentUser && (
        <View style={styles.currentPlan}>
          <Text style={styles.currentPlanTitle}>
            {t('subscription.currentPlan')}
          </Text>
          <View style={[styles.currentPlanBadge, currentUser.subscriptionTier === 'free' && styles.freeBadge]}>
            <Crown size={16} color="#fff" />
            <Text style={styles.currentPlanText}>
              {currentUser.subscriptionTier === 'free' ? 'Free' : 'Premium'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.tiersContainer}>
        {(() => {
          const Icon = SUBSCRIPTION.icon;
          const isCurrentPlan = currentUser?.subscriptionTier === 'premium';
          const price = billingCycle === 'yearly' ? SUBSCRIPTION.yearlyPrice : SUBSCRIPTION.monthlyPrice;
          const savings = SUBSCRIPTION.monthlyPrice * 12 - SUBSCRIPTION.yearlyPrice;

          return (
            <View style={[styles.tierCard, styles.tierCardHighlight]}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>
                  {t('subscription.allAccess')}
                </Text>
              </View>

              <View style={styles.tierHeader}>
                <View style={[styles.tierIcon, { backgroundColor: SUBSCRIPTION.color }]}>
                  <Icon size={24} color="#fff" />
                </View>
                <Text style={styles.tierName}>{SUBSCRIPTION.name}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>€{price.toFixed(2)}</Text>
                <Text style={styles.priceUnit}>
                  {billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth')}
                </Text>
              </View>
              {billingCycle === 'yearly' && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>
                    {t('subscription.saveAmount', { amount: savings.toFixed(0) })}
                  </Text>
                </View>
              )}

              <View style={styles.featuresContainer}>
                {SUBSCRIPTION.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={18} color={SUBSCRIPTION.color} />
                    <Text style={styles.featureText}>{t(feature)}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  styles.subscribeButton,
                  { backgroundColor: SUBSCRIPTION.color },
                  isCurrentPlan && styles.currentPlanButton,
                ]}
                onPress={() => !isCurrentPlan && handleSubscribe()}
                disabled={isCurrentPlan}
              >
                <Text style={styles.subscribeButtonText}>
                  {isCurrentPlan ? t('subscription.currentPlan') : t('subscription.select')}
                </Text>
              </Pressable>
            </View>
          );
        })()}
      </View>

      <View style={styles.restoreSection}>
        <Pressable
          style={styles.restoreButton}
          onPress={() => Alert.alert(t('subscription.restorePurchases'), t('subscription.restorePurchasesInfo'))}
          disabled={isProcessing}
        >
          <RefreshCw size={16} color="#64748b" />
          <Text style={styles.restoreButtonText}>{t('subscription.restorePurchases')}</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{t('subscription.footerText')}</Text>
      </View>

      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#635bff" />
            <Text style={styles.loadingText}>{t('subscription.processing')}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  currentPlan: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentPlanTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  currentPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  currentPlanText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tiersContainer: {
    padding: 16,
    gap: 16,
  },
  tierCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 24,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 40,
    fontWeight: '800',
    color: '#111',
  },
  priceUnit: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  featuresContainer: {
    gap: 12,
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#334155',
    flex: 1,
  },
  subscribeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  currentPlanButton: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  addOnsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 16,
  },
  tierCardHighlight: {
    borderColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  freeBadge: {
    backgroundColor: '#94a3b8',
  },
  footer: {
    padding: 24,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  restoreSection: {
    padding: 20,
    alignItems: 'center',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  restoreButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },
  billingToggle: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
  },
  billingButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  billingButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  billingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  billingButtonTextActive: {
    color: '#111',
  },
  savingsText: {
    marginTop: 12,
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
  },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  savingsBadgeText: {
    color: '#15803d',
    fontSize: 13,
    fontWeight: '700',
  },

});
