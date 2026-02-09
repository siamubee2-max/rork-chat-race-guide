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
import { router } from "expo-router";
import { useTranslation } from "react-i18next";

// ===================================
// NOUVELLE STRATÉGIE PRICING - LEADER DU MARCHÉ
// ===================================

const SUBSCRIPTION_TIERS = {
  free: {
    id: "free",
    name: "Free",
    nameTranslation: "subscription.tiers.free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "subscription.features.scans", // 10 scans/mois
      "subscription.features.allBreeds", // Toutes les races
      "subscription.features.aiQuestions", // 15 questions IA/mois
      "subscription.features.communityBasic", // Communauté (3 posts/mois)
      "subscription.features.vetsDirectory", // Annuaire vétos complet
      "subscription.features.emergencyPosterBasic", // 1 poster urgence
      "subscription.features.gamificationBasic", // Gamification niveaux 1-3
      "subscription.features.withAds", // Avec publicité
    ],
    limits: {
      scans: 10,
      aiQuestions: 15,
      communityPosts: 3,
      emergencyPosters: 1,
      gamificationLevel: 3,
    },
    color: "#94a3b8",
    badge: null,
  },

  premium: {
    id: "premium",
    name: "Premium",
    nameTranslation: "subscription.tiers.premium",
    monthlyPrice: 14.99,
    yearlyPrice: 149.99, // Économie ~17%
    originalPrice: 179.88, // Prix mensuel × 12 pour montrer économie
    features: [
      "subscription.features.unlimitedScans", // Scans ILLIMITÉS
      "subscription.features.allBreeds", // Toutes les races
      "subscription.features.aiUnlimited", // Assistant IA ILLIMITÉ + modèle avancé
      "subscription.features.communityUnlimited", // Communauté illimitée
      "subscription.features.emergencyPostersPremium", // 5 designs posters premium
      "subscription.features.gamificationFull", // Gamification complète
      "subscription.features.practicalGuides", // Guides pratiques avancés
      "subscription.features.noAds", // SANS PUBLICITÉ
      "subscription.features.prioritySupport", // Support prioritaire < 2h
      "subscription.features.premiumBadge", // Badge Premium communauté
      "subscription.features.betaAccess", // Accès bêta nouvelles features
    ],
    savings: "Économisez 30 $ vs mensuel",
    popular: true,
    color: "#8b5cf6",
    badge: "⭐ PLUS POPULAIRE",
  },

  family: {
    id: "family",
    name: "Family",
    nameTranslation: "subscription.tiers.family",
    monthlyPrice: 24.99,
    yearlyPrice: 239.99, // Économie 20%
    originalPrice: 299.88,
    features: [
      "subscription.features.allPremium", // Tout Premium +
      "subscription.features.upTo5Pets", // Jusqu'à 5 animaux
      "subscription.features.familySharing", // Partage familial (5 comptes)
      "subscription.features.unlimitedPosters", // Posters illimités (tous designs)
      "subscription.features.priorityAI", // Consultation IA véto prioritaire
      "subscription.features.healthReminders", // Rappels vaccination/santé auto
      "subscription.features.multiPetHealth", // Carnet de santé multi-animaux
      "subscription.features.analytics", // Statistiques & analytics
      "subscription.features.dataExport", // Export données PDF
    ],
    savings: "Économisez 60 $ vs mensuel",
    bestValue: true,
    color: "#ec4899",
    badge: "💎 MEILLEURE VALEUR",
  },

  pro: {
    id: "pro",
    name: "Pro",
    nameTranslation: "subscription.tiers.pro",
    monthlyPrice: 49.99,
    yearlyPrice: 499.99, // Économie ~17%
    originalPrice: 599.88,
    features: [
      "subscription.features.allFamily", // Tout Family +
      "subscription.features.multiLitters", // Gestion multi-portées (éleveurs)
      "subscription.features.professionalProfile", // Profil professionnel vérifié
      "subscription.features.expertBadge", // Badge "Expert certifié" visible
      "subscription.features.advancedAnalytics", // Analytics avancés
      "subscription.features.apiAccess", // API access (intégrations)
      "subscription.features.businessTools", // Outils business (facturation, CRM)
      "subscription.features.dedicatedSupport", // Support dédié (téléphone)
      "subscription.features.marketplacePriority", // Marketplace prioritaire
    ],
    savings: "Économisez 100 $ vs mensuel",
    target: "Éleveurs, Vétérinaires, Pros",
    color: "#f59e0b",
    badge: "💼 PROFESSIONNEL",
  },

  // OFFRE SPÉCIALE LANCEMENT (Désactiver après 1000 premiers)
  founder: {
    id: "founder",
    name: "Founder",
    nameTranslation: "subscription.tiers.founder",
    monthlyPrice: 9.99, // Prix À VIE
    yearlyPrice: null, // Pas de yearly pour founders
    lifetimeDiscount: true,
    features: [
      "subscription.features.allPremium", // Toutes features Premium
      "subscription.features.founderPrice", // Prix 9,99 $ À VIE
      "subscription.features.founderBadge", // Badge "Founding Member" exclusif
      "subscription.features.earlyAccess", // Accès priorité nouvelles features
      "subscription.features.founderPerks", // Avantages exclusifs futurs
    ],
    limited: 1000, // Limité aux 1000 premiers
    remaining: 873, // À mettre à jour dynamiquement
    color: "#3b82f6",
    badge: "🎁 OFFRE LIMITÉE",
    urgent: true,
  },
};

export default function SubscriptionScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = React.useState<"monthly" | "yearly">(
    "yearly"
  );
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubscribe = async (tierId: string) => {
    if (!isAuthenticated) {
      Alert.alert(
        t("subscription.loginRequired"),
        t("subscription.loginRequiredDesc"),
        [
          {
            text: t("common.cancel"),
            style: "cancel",
          },
          {
            text: t("auth.login"),
            onPress: () => router.push("/auth/login" as any),
          },
        ]
      );
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Intégrer votre système de paiement (Stripe, RevenueCat, etc.)
      // Pour l'instant, simulation
      
      // Exemple avec RevenueCat :
      // const offerings = await Purchases.getOfferings();
      // const packageToPurchase = offerings.current?.availablePackages.find(
      //   (pkg) => pkg.identifier === tierId
      // );
      // const purchaseResult = await Purchases.purchasePackage(packageToPurchase);
      
      Alert.alert(
        "🎉 Bienvenue !",
        `Vous avez souscrit au plan ${SUBSCRIPTION_TIERS[tierId].name}`,
        [{ text: "OK" }]
      );

      // Rediriger vers l'app
      router.push("/(tabs)/(scan)" as any);
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Une erreur est survenue. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPricingCard = (
    tier: keyof typeof SUBSCRIPTION_TIERS,
    index: number
  ) => {
    const plan = SUBSCRIPTION_TIERS[tier];
    const price =
      billingCycle === "yearly" && plan.yearlyPrice !== null
        ? plan.yearlyPrice
        : plan.monthlyPrice;
    
    const isHighlighted = plan.popular || plan.bestValue || plan.urgent;

    return (
      <View
        key={tier}
        style={[
          styles.pricingCard,
          isHighlighted && styles.pricingCardHighlighted,
          { borderColor: plan.color },
        ]}
      >
        {/* Badge en haut */}
        {plan.badge && (
          <View
            style={[styles.badge, { backgroundColor: plan.color }]}
          >
            <Text style={styles.badgeText}>{plan.badge}</Text>
          </View>
        )}

        {/* En-tête */}
        <View style={styles.cardHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          {plan.target && (
            <Text style={styles.planTarget}>{plan.target}</Text>
          )}
        </View>

        {/* Prix */}
        <View style={styles.priceContainer}>
          {plan.monthlyPrice === 0 ? (
            <Text style={styles.freeText}>Gratuit</Text>
          ) : (
            <>
              <Text style={styles.price}>
                {price.toFixed(2)} $
              </Text>
              <Text style={styles.pricePeriod}>
                {billingCycle === "yearly" ? "/an" : "/mois"}
              </Text>
              
              {/* Prix barré pour montrer l'économie */}
              {billingCycle === "yearly" && plan.originalPrice && (
                <Text style={styles.originalPrice}>
                  {plan.originalPrice.toFixed(2)} $
                </Text>
              )}
            </>
          )}
        </View>

        {/* Économie */}
        {billingCycle === "yearly" && plan.savings && (
          <Text style={styles.savings}>{plan.savings}</Text>
        )}

        {/* Compteur pour offre fondateur */}
        {plan.limited && plan.remaining && (
          <View style={styles.limitedCounter}>
            <Text style={styles.limitedText}>
              ⚡ Plus que {plan.remaining} / {plan.limited} places
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${(plan.remaining / plan.limited) * 100}%`,
                    backgroundColor: plan.color,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresContainer}>
          {plan.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Check size={16} color={plan.color} />
              <Text style={styles.featureText}>
                {t(feature)}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <Pressable
          style={[
            styles.ctaButton,
            isHighlighted && { backgroundColor: plan.color },
            !isHighlighted && styles.ctaButtonOutline,
          ]}
          onPress={() => handleSubscribe(tier)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {plan.monthlyPrice === 0 ? (
                <Text
                  style={[
                    styles.ctaText,
                    !isHighlighted && { color: plan.color },
                  ]}
                >
                  Commencer gratuitement
                </Text>
              ) : (
                <>
                  <Crown size={20} color="#fff" />
                  <Text style={styles.ctaText}>
                    {plan.urgent ? "Réserver ma place" : "Choisir ce plan"}
                  </Text>
                </>
              )}
            </>
          )}
        </Pressable>

        {/* Essai gratuit mention */}
        {plan.monthlyPrice > 0 && !plan.lifetimeDiscount && (
          <Text style={styles.trialText}>
            Essai gratuit 14 jours • Sans CB
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choisissez votre plan</Text>
        <Text style={styles.subtitle}>
          Économisez 250 $/an en regroupant tout dans Purrly
        </Text>
      </View>

      {/* Toggle Monthly/Yearly */}
      <View style={styles.billingToggle}>
        <Pressable
          style={[
            styles.toggleButton,
            billingCycle === "monthly" && styles.toggleButtonActive,
          ]}
          onPress={() => setBillingCycle("monthly")}
        >
          <Text
            style={[
              styles.toggleText,
              billingCycle === "monthly" && styles.toggleTextActive,
            ]}
          >
            Mensuel
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleButton,
            billingCycle === "yearly" && styles.toggleButtonActive,
          ]}
          onPress={() => setBillingCycle("yearly")}
        >
          <Text
            style={[
              styles.toggleText,
              billingCycle === "yearly" && styles.toggleTextActive,
            ]}
          >
            Annuel
          </Text>
        </Pressable>
      </View>

      {/* Pricing Cards */}
      {(Object.keys(SUBSCRIPTION_TIERS) as Array<keyof typeof SUBSCRIPTION_TIERS>).map((tier, index) =>
        renderPricingCard(tier, index)
      )}

      {/* Restore Purchases */}
      <Pressable style={styles.restoreButton} onPress={() => {
        Alert.alert("Restauration", "Restauration des achats...");
      }}>
        <RefreshCw size={16} color="#8b5cf6" />
        <Text style={styles.restoreText}>Restaurer mes achats</Text>
      </Pressable>

      {/* Spacer */}
      <View style={{ height: 40 }} />
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
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    lineHeight: 24,
  },
  billingToggle: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#8b5cf6",
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#94a3b8",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  pricingCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
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
    borderRadius: 20,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  cardHeader: {
    marginBottom: 16,
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 4,
  },
  planTarget: {
    fontSize: 14,
    color: "#94a3b8",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
    flexWrap: "wrap",
  },
  freeText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#f8fafc",
  },
  pricePeriod: {
    fontSize: 16,
    color: "#94a3b8",
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: "#94a3b8",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  savings: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
    marginBottom: 12,
  },
  limitedCounter: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  limitedText: {
    fontSize: 14,
    color: "#f59e0b",
    fontWeight: "600",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#334155",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  featuresContainer: {
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: "#e2e8f0",
    marginLeft: 8,
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
  ctaButtonOutline: {
    backgroundColor: "transparent",
    borderWidth: 2,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  trialText: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
  },
  restoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  restoreText: {
    fontSize: 14,
    color: "#8b5cf6",
    fontWeight: "600",
  },
});
