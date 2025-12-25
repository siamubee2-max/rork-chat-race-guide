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
import { Check, Crown, Zap, CreditCard, RefreshCw } from "lucide-react-native";
import { useAuth } from "@/context/auth";
import { useStripe } from "@/context/stripe";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";

const SUBSCRIPTION_TIERS = [
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    yearlyPrice: 179.99,
    features: [
      'subscription.features.unlimitedScans',
      'subscription.features.allBreeds',
      'subscription.features.aiAssistant',
      'subscription.features.healthTracking',
      'subscription.features.emergencyPosters',
      'subscription.features.noAds',
    ],
    color: '#3b82f6',
    icon: Crown,
    popular: true,
  },
  {
    id: 'premium_plus',
    name: 'Premium Plus',
    price: 34.99,
    yearlyPrice: 299.99,
    features: [
      'subscription.features.allPremium',
      'subscription.features.advancedAI',
      'subscription.features.vetConsultations',
      'subscription.features.healthTracking',
      'subscription.features.prioritySupport',
      'subscription.features.exclusiveContent',
    ],
    color: '#8b5cf6',
    icon: Zap,
    popular: false,
  },
] as const;

const ADD_ONS = [
  {
    id: 'health_tracking',
    name: 'subscription.addOns.healthTracking',
    price: 6.99,
    yearlyPrice: 59.99,
    description: 'subscription.addOns.healthTrackingDesc',
  },
  {
    id: 'vet_directory',
    name: 'subscription.addOns.vetDirectory',
    price: 4.99,
    yearlyPrice: 39.99,
    description: 'subscription.addOns.vetDirectoryDesc',
  },
  {
    id: 'breeder_network',
    name: 'subscription.addOns.breederNetwork',
    price: 7.99,
    yearlyPrice: 69.99,
    description: 'subscription.addOns.breederNetworkDesc',
  },
] as const;

export default function SubscriptionScreen() {
  const { currentUser, updateSubscription, isAuthenticated } = useAuth();
  const { initiateSubscription, initiateAddOnPurchase, isProcessing, restorePurchases } = useStripe();
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async (tierId: string, addOns: string[] = []) => {
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

    const tier = SUBSCRIPTION_TIERS.find((t) => t.id === tierId);
    if (!tier) return;

    const price = billingCycle === 'yearly' ? tier.yearlyPrice : tier.price;
    const period = billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth');

    Alert.alert(
      t('subscription.confirmTitle'),
      t('subscription.confirmDescNew', {
        plan: tier.name,
        price: price.toFixed(2),
        period,
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('subscription.payWithStripe'),
          onPress: async () => {
            await initiateSubscription(tierId, billingCycle);
          },
        },
      ]
    );
  };

  const handleAddOn = async (addOnId: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        t('subscription.loginRequired'),
        t('subscription.loginRequiredDesc')
      );
      return;
    }

    const currentAddOns = currentUser?.addOns || [];
    const hasAddOn = currentAddOns.includes(addOnId);

    if (hasAddOn) {
      const newAddOns = currentAddOns.filter((id) => id !== addOnId);
      await updateSubscription(currentUser?.subscriptionTier || 'free', newAddOns);
      Alert.alert(t('common.success'), t('subscription.addOnRemoved'));
    } else {
      const addOn = ADD_ONS.find((a) => a.id === addOnId);
      if (!addOn) return;

      const price = billingCycle === 'yearly' ? addOn.yearlyPrice : addOn.price;
      const period = billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth');

      Alert.alert(
        t('subscription.confirmTitle'),
        t('subscription.confirmAddOnDescNew', {
          addOn: t(addOn.name),
          price: price.toFixed(2),
          period,
        }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('subscription.payWithStripe'),
            onPress: async () => {
              await initiateAddOnPurchase(addOnId, billingCycle);
            },
          },
        ]
      );
    }
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
          <View style={styles.currentPlanBadge}>
            <Crown size={16} color="#fff" />
            <Text style={styles.currentPlanText}>
              {currentUser.subscriptionTier === 'free'
                ? 'Free'
                : currentUser.subscriptionTier === 'premium'
                ? 'Premium'
                : 'Premium Plus'}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.tiersContainer}>
        {SUBSCRIPTION_TIERS.map((tier) => {
          const Icon = tier.icon;
          const isCurrentPlan = currentUser?.subscriptionTier === tier.id;

          return (
            <View key={tier.id} style={styles.tierCard}>
              {tier.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>
                    {t('subscription.popular')}
                  </Text>
                </View>
              )}

              <View style={styles.tierHeader}>
                <View
                  style={[styles.tierIcon, { backgroundColor: tier.color }]}
                >
                  <Icon size={24} color="#fff" />
                </View>
                <Text style={styles.tierName}>{tier.name}</Text>
              </View>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>
                  €{(billingCycle === 'yearly' ? tier.yearlyPrice : tier.price).toFixed(2)}
                </Text>
                <Text style={styles.priceUnit}>
                  {billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth')}
                </Text>
              </View>
              {billingCycle === 'yearly' && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>
                    {t('subscription.saveAmount', {
                      amount: (tier.price * 12 - tier.yearlyPrice).toFixed(0),
                    })}
                  </Text>
                </View>
              )}

              <View style={styles.featuresContainer}>
                {tier.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Check size={18} color={tier.color} />
                    <Text style={styles.featureText}>{t(feature)}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  styles.subscribeButton,
                  { backgroundColor: tier.color },
                  isCurrentPlan && styles.currentPlanButton,
                ]}
                onPress={() => !isCurrentPlan && handleSubscribe(tier.id)}
                disabled={isCurrentPlan}
              >
                <Text style={styles.subscribeButtonText}>
                  {isCurrentPlan
                    ? t('subscription.currentPlan')
                    : t('subscription.select')}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.addOnsSection}>
        <Text style={styles.sectionTitle}>{t('subscription.addOnsTitle')}</Text>
        <Text style={styles.sectionSubtitle}>
          {t('subscription.addOnsSubtitle')}
        </Text>

        {ADD_ONS.map((addOn) => {
          const isPremium = currentUser?.subscriptionTier === 'premium';
          const isPremiumPlus = currentUser?.subscriptionTier === 'premium_plus';
          const isIncludedInPlan = addOn.id === 'health_tracking' && (isPremium || isPremiumPlus);
          const hasAddOn = currentUser?.addOns?.includes(addOn.id) || isIncludedInPlan;

          return (
            <Pressable
              key={addOn.id}
              style={[
                styles.addOnCard, 
                hasAddOn && styles.addOnCardActive,
                isIncludedInPlan && styles.addOnCardIncluded
              ]}
              onPress={() => !isIncludedInPlan && handleAddOn(addOn.id)}
              disabled={isIncludedInPlan}
            >
              <View style={styles.addOnContent}>
                <Text style={styles.addOnName}>{t(addOn.name)}</Text>
                <Text style={styles.addOnDescription}>
                  {t(addOn.description)}
                </Text>
                <Text style={styles.addOnPrice}>
                  {isIncludedInPlan ? (
                    t('subscription.included')
                  ) : (
                    <>
                      €{(billingCycle === 'yearly' ? addOn.yearlyPrice : addOn.price).toFixed(2)}{' '}
                      <Text style={styles.addOnPriceUnit}>
                        {billingCycle === 'yearly' ? t('subscription.perYear') : t('subscription.perMonth')}
                      </Text>
                    </>
                  )}
                </Text>
                {billingCycle === 'yearly' && !isIncludedInPlan && (
                  <Text style={styles.addOnSavings}>
                    {t('subscription.saveAmount', {
                      amount: (addOn.price * 12 - addOn.yearlyPrice).toFixed(0),
                    })}
                  </Text>
                )}
              </View>
              {hasAddOn && (
                <View style={[styles.addOnCheck, isIncludedInPlan && styles.addOnCheckIncluded]}>
                  <Check size={20} color={isIncludedInPlan ? "#fff" : "#10b981"} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.stripeSection}>
        <View style={styles.stripeInfo}>
          <CreditCard size={20} color="#635bff" />
          <Text style={styles.stripeText}>{t('subscription.securedByStripe')}</Text>
        </View>
        <Pressable
          style={styles.restoreButton}
          onPress={restorePurchases}
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
  addOnCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  addOnCardActive: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  addOnCardIncluded: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  addOnCheckIncluded: {
    backgroundColor: '#3b82f6',
  },
  addOnContent: {
    flex: 1,
  },
  addOnName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
  },
  addOnDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 20,
  },
  addOnPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  addOnPriceUnit: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '400',
  },
  addOnCheck: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
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
  stripeSection: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  stripeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  stripeText: {
    fontSize: 14,
    color: '#635bff',
    fontWeight: '600',
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
  addOnSavings: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 4,
  },
});
