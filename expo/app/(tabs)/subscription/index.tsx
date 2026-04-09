import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Check, Crown, RefreshCw, Sparkles, Star, Users, Briefcase, Gem, ExternalLink } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth";
import { navigate } from "@/utils/navigate";
import { Colors } from "@/constants/colors";

let Purchases: any = null;

try {
  const rc = require("react-native-purchases");
  Purchases = rc.default;
} catch {
  console.log("[Subscription] RevenueCat not available");
}

interface LocalPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  color: string;
  badge: string | null;
  target?: string;
  features: string[];
  tier: "premium" | "family" | "pro";
  icon: "star" | "users" | "briefcase" | "gem";
  savings?: string;
  rcPackageKey: string;
}

const LOCAL_PLANS: LocalPlan[] = [
  {
    id: "premium_monthly",
    name: "Premium",
    price: "14,99 €",
    period: "/mois",
    color: "#8b5cf6",
    badge: "⭐ PLUS POPULAIRE",
    icon: "star",
    tier: "premium",
    rcPackageKey: "monthly",
    features: [
      "Scans ILLIMITÉS",
      "Assistant IA ILLIMITÉ",
      "Communauté illimitée",
      "5 designs posters premium",
      "Gamification complète",
      "Guides pratiques avancés",
      "SANS PUBLICITÉ",
      "Support prioritaire < 2h",
      "Badge Premium communauté",
    ],
  },
  {
    id: "premium_yearly",
    name: "Premium Annuel",
    price: "149,99 €",
    period: "/an",
    color: "#8b5cf6",
    badge: "💰 MEILLEURE OFFRE",
    icon: "star",
    tier: "premium",
    rcPackageKey: "$rc_annual",
    savings: "Économisez ~17% vs mensuel",
    features: [
      "Tout Premium inclus",
      "Économisez ~17% vs mensuel",
      "Scans ILLIMITÉS",
      "Assistant IA ILLIMITÉ",
      "SANS PUBLICITÉ",
      "Support prioritaire",
    ],
  },
  {
    id: "family_monthly",
    name: "Family",
    price: "24,99 €",
    period: "/mois",
    color: "#ec4899",
    badge: "💎 FAMILLE",
    icon: "users",
    tier: "family",
    rcPackageKey: "family_monthly",
    features: [
      "Tout Premium +",
      "Jusqu'à 5 animaux",
      "Partage familial (5 comptes)",
      "Posters illimités",
      "Rappels vaccination auto",
      "Carnet de santé multi-animaux",
      "Export données PDF",
    ],
  },
  {
    id: "family_yearly",
    name: "Family Annuel",
    price: "239,99 €",
    period: "/an",
    color: "#ec4899",
    badge: "💎 FAMILLE - MEILLEUR PRIX",
    icon: "users",
    tier: "family",
    rcPackageKey: "family_yearly",
    savings: "Économisez ~20% vs mensuel",
    features: [
      "Tout Family inclus",
      "Économisez ~20% vs mensuel",
      "Partage familial (5 comptes)",
      "Posters illimités",
    ],
  },
  {
    id: "pro_monthly",
    name: "Pro",
    price: "49,99 €",
    period: "/mois",
    color: "#f59e0b",
    badge: "💼 PROFESSIONNEL",
    icon: "briefcase",
    tier: "pro",
    rcPackageKey: "pro_monthly",
    target: "Éleveurs, Vétérinaires, Pros",
    features: [
      "Tout Family +",
      "Gestion multi-portées",
      "Profil professionnel vérifié",
      "Badge Expert certifié",
      "Analytics avancés",
      "Outils business",
      "Support dédié",
    ],
  },
  {
    id: "pro_yearly",
    name: "Pro Annuel",
    price: "499,99 €",
    period: "/an",
    color: "#f59e0b",
    badge: "💼 PRO - MEILLEUR PRIX",
    icon: "briefcase",
    tier: "pro",
    rcPackageKey: "pro_yearly",
    savings: "Économisez ~17% vs mensuel",
    target: "Éleveurs, Vétérinaires, Pros",
    features: [
      "Tout Pro inclus",
      "Économisez ~17% vs mensuel",
      "Analytics avancés",
      "Support dédié",
    ],
  },
];

const IconMap = {
  star: Star,
  users: Users,
  briefcase: Briefcase,
  gem: Gem,
} as const;

function getTierFromProductId(productId: string): "premium" | "family" | "pro" {
  const lower = productId.toLowerCase();
  if (lower.includes("family")) return "family";
  if (lower.includes("pro")) return "pro";
  return "premium";
}

export default function SubscriptionScreen() {
  const { isAuthenticated, updateSubscription } = useAuth();
  const queryClient = useQueryClient();
  const [purchasingLocalId, setPurchasingLocalId] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const isTablet = screenWidth >= 768;
  const contentMaxWidth = isTablet ? 680 : undefined;

  const rcAvailable = Purchases != null;

  const offeringsQuery = useQuery({
    queryKey: ["rc-offerings"],
    queryFn: async () => {
      if (!rcAvailable) {
        console.log("[Subscription] RevenueCat not available, skipping fetch");
        return null;
      }
      console.log("[Subscription] Fetching offerings...");
      const offerings = await Purchases.getOfferings();
      console.log(
        "[Subscription] Offerings fetched:",
        JSON.stringify(
          offerings.current?.availablePackages.map((p: any) => ({
            id: p.identifier,
            productId: p.product?.identifier,
            price: p.product?.priceString,
          }))
        )
      );
      return offerings;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
    enabled: rcAvailable,
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      if (!rcAvailable) throw new Error("RevenueCat non disponible");
      console.log("[Subscription] Restoring purchases...");
      const customerInfo = await Purchases.restorePurchases();
      console.log("[Subscription] Restore result:", JSON.stringify(Object.keys(customerInfo.entitlements.active)));
      return customerInfo;
    },
    onSuccess: async (customerInfo: any) => {
      const activeEntitlements = customerInfo.entitlements.active;
      const hasActive = Object.keys(activeEntitlements).length > 0;
      if (hasActive) {
        if (activeEntitlements["premium"]) {
          const productId = activeEntitlements["premium"].productIdentifier;
          const tier = getTierFromProductId(productId);
          const expirationDate = activeEntitlements["premium"].expirationDate;
          const expiry = expirationDate ? new Date(expirationDate).getTime() : undefined;
          await updateSubscription(tier, expiry);
        }
        void queryClient.invalidateQueries({ queryKey: ["rc-offerings"] });
        void queryClient.invalidateQueries({ queryKey: ["rc-customer-info"] });
        Alert.alert("✅ Achats restaurés", "Vos achats précédents ont été restaurés avec succès.", [{ text: "OK" }]);
      } else {
        Alert.alert("Aucun achat trouvé", "Aucun abonnement actif n'a été trouvé pour ce compte.", [{ text: "OK" }]);
      }
    },
    onError: (error: any) => {
      console.error("[Subscription] Restore error:", error);
      Alert.alert("Erreur", "Impossible de restaurer les achats. Veuillez réessayer.");
    },
  });

  const rcPackages = useMemo(() => {
    return offeringsQuery.data?.current?.availablePackages || [];
  }, [offeringsQuery.data]);

  const findRCPackageForPlan = useCallback(
    (plan: LocalPlan) => {
      if (!rcPackages.length) {
        console.log("[Subscription] No RC packages available for plan:", plan.id);
        return null;
      }
      const targetKey = plan.rcPackageKey;
      let match = rcPackages.find((p: any) => p.identifier === targetKey);
      if (match) {
        console.log("[Subscription] Matched plan", plan.id, "-> RC package", match.identifier, "product:", match.product?.identifier);
        return match;
      }
      match = rcPackages.find((p: any) =>
        p.product?.identifier?.toLowerCase() === plan.id.toLowerCase() ||
        p.product?.identifier?.toLowerCase()?.includes(plan.id.toLowerCase())
      );
      if (match) {
        console.log("[Subscription] Matched plan by product ID", plan.id, "-> RC package", match.identifier, "product:", match.product?.identifier);
        return match;
      }
      match = rcPackages.find((p: any) => {
        const pkgId = (p.identifier || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const planKey = plan.id.toLowerCase().replace(/[^a-z0-9]/g, "");
        return pkgId.includes(planKey) || planKey.includes(pkgId);
      });
      if (match) {
        console.log("[Subscription] Fuzzy matched plan", plan.id, "-> RC package", match.identifier, "product:", match.product?.identifier);
        return match;
      }
      console.log("[Subscription] No RC match for plan", plan.id, "with key", targetKey, "available packages:", rcPackages.map((p: any) => p.identifier).join(", "));
      return null;
    },
    [rcPackages]
  );

  const handlePurchase = useCallback(
    async (plan: LocalPlan) => {
      if (!isAuthenticated) {
        Alert.alert("Connexion requise", "Veuillez vous connecter pour souscrire à un plan.", [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => navigate("/auth/login") },
        ]);
        return;
      }

      if (!rcAvailable) {
        Alert.alert(
          "Non disponible",
          "Les achats in-app ne sont pas disponibles sur cette plateforme. Veuillez utiliser l'application mobile.",
          [{ text: "OK" }]
        );
        return;
      }

      setPurchasingLocalId(plan.id);
      try {
        const matchingPkg = findRCPackageForPlan(plan);

        if (!matchingPkg) {
          console.warn("[Subscription] No RC package found for plan:", plan.id, "- attempting to refetch offerings");
          try {
            await offeringsQuery.refetch();
            const refreshedPackages = offeringsQuery.data?.current?.availablePackages || [];
            const retryMatch = refreshedPackages.find((p: any) =>
              p.identifier === plan.rcPackageKey ||
              p.product?.identifier?.toLowerCase()?.includes(plan.id.toLowerCase())
            );
            if (!retryMatch) {
              console.error("[Subscription] Still no RC package after refetch for plan:", plan.id);
              Alert.alert("Erreur", "Ce plan n'est pas disponible actuellement. Veuillez réessayer plus tard.");
              return;
            }
            console.log("[Subscription] Found package after refetch:", retryMatch.identifier);
            const result = await Purchases.purchasePackage(retryMatch);
            const customerInfo = result.customerInfo;
            const activeEntitlements = customerInfo.entitlements.active;
            if (activeEntitlements["premium"]) {
              const productId = activeEntitlements["premium"].productIdentifier;
              const tier = getTierFromProductId(productId);
              const expirationDate = activeEntitlements["premium"].expirationDate;
              const expiry = expirationDate ? new Date(expirationDate).getTime() : undefined;
              await updateSubscription(tier, expiry);
            } else {
              await updateSubscription(plan.tier);
            }
            void queryClient.invalidateQueries({ queryKey: ["rc-offerings"] });
            void queryClient.invalidateQueries({ queryKey: ["rc-customer-info"] });
            Alert.alert("🎉 Bienvenue !", "Votre abonnement est maintenant actif.", [
              { text: "OK", onPress: () => navigate("/(tabs)/(scan)") },
            ]);
            return;
          } catch (retryError: any) {
            if (retryError?.userCancelled) {
              console.log("[Subscription] User cancelled purchase on retry");
            } else {
              console.error("[Subscription] Retry purchase error:", retryError);
              Alert.alert("Erreur", "Ce plan n'est pas disponible actuellement. Veuillez réessayer plus tard.");
            }
            return;
          }
        }

        console.log("[Subscription] Purchasing RC package:", matchingPkg.identifier, "product:", matchingPkg.product?.identifier);
        const result = await Purchases.purchasePackage(matchingPkg);
        const customerInfo = result.customerInfo;
        const activeEntitlements = customerInfo.entitlements.active;

        console.log("[Subscription] Purchase result entitlements:", JSON.stringify(Object.keys(activeEntitlements)));

        if (activeEntitlements["premium"]) {
          const productId = activeEntitlements["premium"].productIdentifier;
          const tier = getTierFromProductId(productId);
          const expirationDate = activeEntitlements["premium"].expirationDate;
          const expiry = expirationDate ? new Date(expirationDate).getTime() : undefined;
          console.log("[Subscription] Activating subscription tier:", tier, "expiry:", expiry);
          await updateSubscription(tier, expiry);
        } else {
          console.log("[Subscription] Purchase completed but no premium entitlement found, activating tier:", plan.tier);
          await updateSubscription(plan.tier);
        }

        void queryClient.invalidateQueries({ queryKey: ["rc-offerings"] });
        void queryClient.invalidateQueries({ queryKey: ["rc-customer-info"] });

        Alert.alert("🎉 Bienvenue !", "Votre abonnement est maintenant actif.", [
          { text: "OK", onPress: () => navigate("/(tabs)/(scan)") },
        ]);
      } catch (error: any) {
        if (error?.userCancelled) {
          console.log("[Subscription] User cancelled purchase");
        } else {
          console.error("[Subscription] Purchase error:", error);
          Alert.alert("Erreur", "Une erreur est survenue lors de l'achat. Veuillez réessayer.");
        }
      } finally {
        setPurchasingLocalId(null);
      }
    },
    [isAuthenticated, rcAvailable, updateSubscription, queryClient, findRCPackageForPlan, offeringsQuery]
  );

  const renderPlanCard = useCallback(
    (plan: LocalPlan) => {
      const isProcessing = purchasingLocalId === plan.id;
      const isHighlighted = !!plan.badge;
      const PlanIcon = IconMap[plan.icon];
      const matchingRCPkg = findRCPackageForPlan(plan);
      const displayPrice = matchingRCPkg ? matchingRCPkg.product.priceString : plan.price;
      const displayPeriod = matchingRCPkg
        ? matchingRCPkg.packageType === "ANNUAL"
          ? "/an"
          : "/mois"
        : plan.period;

      return (
        <View
          key={plan.id}
          style={[styles.pricingCard, isHighlighted && styles.pricingCardHighlighted, { borderColor: plan.color }]}
        >
          {plan.badge && (
            <View style={[styles.badge, { backgroundColor: plan.color }]}>
              <Text style={styles.badgeText}>{plan.badge}</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.planNameRow}>
              <PlanIcon size={22} color={plan.color} />
              <Text style={styles.planName}>{plan.name}</Text>
            </View>
            {plan.target && <Text style={styles.planTarget}>{plan.target}</Text>}
          </View>

          <View style={styles.priceContainer}>
            <Text style={styles.price}>{displayPrice}</Text>
            <Text style={styles.pricePeriod}>{displayPeriod}</Text>
          </View>

          {plan.savings && (
            <View style={[styles.savingsBadge, { backgroundColor: plan.color + "20" }]}>
              <Text style={[styles.savingsText, { color: plan.color }]}>{plan.savings}</Text>
            </View>
          )}

          <View style={styles.featuresContainer}>
            {plan.features.map((feature, idx) => (
              <View key={idx} style={styles.featureRow}>
                <Check size={16} color={plan.color} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.ctaButton, { backgroundColor: plan.color }, isProcessing && { opacity: 0.7 }]}
            onPress={() => handlePurchase(plan)}
            disabled={isProcessing || purchasingLocalId !== null}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Crown size={20} color="#fff" />
                <Text style={styles.ctaText}>Choisir ce plan</Text>
              </>
            )}
          </Pressable>

          <Text style={styles.trialText}>Essai gratuit 14 jours · Annulation à tout moment</Text>
        </View>
      );
    },
    [purchasingLocalId, handlePurchase, findRCPackageForPlan]
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={isTablet ? { alignItems: 'center' as const } : undefined}>
      <View style={[styles.header, isTablet && { maxWidth: contentMaxWidth, width: '100%' }]}>
        <View style={styles.headerIcon}>
          <Sparkles size={28} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Choisissez votre plan</Text>
        <Text style={styles.subtitle}>Débloquez toutes les fonctionnalités de Purrly</Text>
      </View>

      {rcAvailable && offeringsQuery.isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des offres...</Text>
        </View>
      )}

      {offeringsQuery.isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Impossible de charger les offres.</Text>
          <Pressable style={styles.retryButton} onPress={() => offeringsQuery.refetch()}>
            <Text style={styles.retryText}>Réessayer</Text>
          </Pressable>
        </View>
      )}

      {!offeringsQuery.isLoading && (
        <View style={[styles.packagesContainer, isTablet && { maxWidth: contentMaxWidth, width: '100%' }]}>{LOCAL_PLANS.map((plan) => renderPlanCard(plan))}</View>
      )}

      {rcAvailable && (
        <Pressable
          style={styles.restoreButton}
          onPress={() => restoreMutation.mutate()}
          disabled={restoreMutation.isPending}
        >
          {restoreMutation.isPending ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <RefreshCw size={18} color={Colors.primary} />
              <Text style={styles.restoreText}>Restaurer mes achats</Text>
            </>
          )}
        </Pressable>
      )}

      <View style={[styles.legalContainer, isTablet && { maxWidth: contentMaxWidth, width: '100%' }]}>
        <Text style={styles.legalText}>
          Le paiement sera débité sur votre compte Apple/Google Play à la confirmation de l'achat. L'abonnement se
          renouvelle automatiquement sauf annulation au moins 24h avant la fin de la période en cours. Vous pouvez gérer
          vos abonnements dans les réglages de votre appareil.
        </Text>
        <View style={styles.legalLinks}>
          <Pressable onPress={() => Linking.openURL('https://siamubee2-max.github.io/purrly-legal/terms/')} style={styles.legalLink}>
            <ExternalLink size={12} color="#94a3b8" />
            <Text style={styles.legalLinkText}>Conditions d'utilisation</Text>
          </Pressable>
          <Text style={styles.legalSeparator}>·</Text>
          <Pressable onPress={() => Linking.openURL('https://siamubee2-max.github.io/purrly-legal/privacy/')} style={styles.legalLink}>
            <ExternalLink size={12} color="#94a3b8" />
            <Text style={styles.legalLinkText}>Politique de confidentialité</Text>
          </Pressable>
        </View>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 30,
    alignItems: "center",
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 160, 92, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#f8fafc",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: "#94a3b8",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: "#ef4444",
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "600" as const,
  },
  packagesContainer: {
    gap: 20,
    paddingHorizontal: 20,
  },
  pricingCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pricingCardHighlighted: {
    borderWidth: 2,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: "absolute",
    top: -12,
    left: 20,
    right: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700" as const,
    textTransform: "uppercase",
  },
  cardHeader: {
    marginTop: 8,
    marginBottom: 16,
  },
  planNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  planName: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#f8fafc",
    marginBottom: 4,
  },
  planTarget: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  price: {
    fontSize: 40,
    fontWeight: "800" as const,
    color: "#f8fafc",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#94a3b8",
    marginLeft: 4,
  },
  savingsBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  savingsText: {
    fontSize: 13,
    fontWeight: "700" as const,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    color: "#f8fafc",
    marginLeft: 12,
    flex: 1,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#ffffff",
  },
  trialText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 12,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    marginHorizontal: 20,
    marginTop: 12,
    gap: 8,
  },
  restoreText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  legalContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  legalText: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  legalLinkText: {
    fontSize: 12,
    color: "#94a3b8",
    textDecorationLine: "underline",
  },
  legalSeparator: {
    fontSize: 12,
    color: "#64748b",
  },
});
