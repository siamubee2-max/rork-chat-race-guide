import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Check, Crown, RefreshCw, Sparkles } from "lucide-react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Purchases, {
  type PurchasesPackage,
} from "react-native-purchases";
import { useAuth } from "@/context/auth";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

const PACKAGE_META: Record<string, { name: string; color: string; badge: string | null; features: string[]; target?: string }> = {
  monthly: {
    name: "Premium",
    color: "#8b5cf6",
    badge: "⭐ PLUS POPULAIRE",
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
  "$rc_annual": {
    name: "Premium Annuel",
    color: "#8b5cf6",
    badge: "💰 MEILLEURE OFFRE",
    features: [
      "Tout Premium inclus",
      "Économisez ~17% vs mensuel",
      "Scans ILLIMITÉS",
      "Assistant IA ILLIMITÉ",
      "SANS PUBLICITÉ",
      "Support prioritaire",
    ],
  },
  family_monthly: {
    name: "Family",
    color: "#ec4899",
    badge: "💎 FAMILLE",
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
  family_yearly: {
    name: "Family Annuel",
    color: "#ec4899",
    badge: "💎 FAMILLE - MEILLEUR PRIX",
    features: [
      "Tout Family inclus",
      "Économisez ~20% vs mensuel",
      "Partage familial (5 comptes)",
      "Posters illimités",
    ],
  },
  pro_monthly: {
    name: "Pro",
    color: "#f59e0b",
    badge: "💼 PROFESSIONNEL",
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
};

export default function SubscriptionScreen() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [purchasingPkgId, setPurchasingPkgId] = useState<string | null>(null);

  const offeringsQuery = useQuery({
    queryKey: ["rc-offerings"],
    queryFn: async () => {
      console.log("[Subscription] Fetching offerings...");
      const offerings = await Purchases.getOfferings();
      console.log("[Subscription] Offerings fetched:", JSON.stringify(offerings.current?.availablePackages.map(p => p.identifier)));
      return offerings;
    },
    retry: 2,
    staleTime: 1000 * 60 * 5,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (pkg: PurchasesPackage) => {
      console.log("[Subscription] Purchasing package:", pkg.identifier, pkg.product.identifier);
      const result = await Purchases.purchasePackage(pkg);
      console.log("[Subscription] Purchase result:", JSON.stringify(result));
      return result;
    },
    onSuccess: () => {
      console.log("[Subscription] Purchase successful");
      void queryClient.invalidateQueries({ queryKey: ["rc-offerings"] });
      void queryClient.invalidateQueries({ queryKey: ["rc-customer-info"] });
      setPurchasingPkgId(null);
      Alert.alert(
        "🎉 Bienvenue !",
        "Votre abonnement est maintenant actif. Profitez de toutes les fonctionnalités !",
        [{ text: "OK", onPress: () => router.push("/(tabs)/(scan)" as any) }]
      );
    },
    onError: (error: any) => {
      setPurchasingPkgId(null);
      if (error?.userCancelled) {
        console.log("[Subscription] User cancelled purchase");
        return;
      }
      console.error("[Subscription] Purchase error:", error);
      Alert.alert(
        "Erreur",
        error?.message || "Une erreur est survenue lors de l'achat. Veuillez réessayer.",
        [{ text: "OK" }]
      );
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      console.log("[Subscription] Restoring purchases...");
      const customerInfo = await Purchases.restorePurchases();
      console.log("[Subscription] Restore result:", JSON.stringify(customerInfo.entitlements.active));
      return customerInfo;
    },
    onSuccess: (customerInfo) => {
      const hasActive = Object.keys(customerInfo.entitlements.active).length > 0;
      if (hasActive) {
        void queryClient.invalidateQueries({ queryKey: ["rc-offerings"] });
        void queryClient.invalidateQueries({ queryKey: ["rc-customer-info"] });
        Alert.alert(
          "✅ Achats restaurés",
          "Vos achats précédents ont été restaurés avec succès.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Aucun achat trouvé",
          "Aucun abonnement actif n'a été trouvé pour ce compte.",
          [{ text: "OK" }]
        );
      }
    },
    onError: (error: any) => {
      console.error("[Subscription] Restore error:", error);
      Alert.alert("Erreur", "Impossible de restaurer les achats. Veuillez réessayer.");
    },
  });

  const handleSubscribe = useCallback(async (pkg: PurchasesPackage) => {
    if (!isAuthenticated) {
      Alert.alert(
        "Connexion requise",
        "Veuillez vous connecter pour souscrire à un plan.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Se connecter", onPress: () => router.push("/auth/login" as any) },
        ]
      );
      return;
    }

    setPurchasingPkgId(pkg.identifier);
    purchaseMutation.mutate(pkg);
  }, [isAuthenticated, purchaseMutation]);

  const offering = offeringsQuery.data?.current;

  const renderPackageCard = useCallback((pkg: PurchasesPackage) => {
    const meta = PACKAGE_META[pkg.identifier] || {
      name: pkg.product.title || pkg.identifier,
      color: Colors.primary,
      badge: null,
      features: [],
    };

    const isProcessing = purchasingPkgId === pkg.identifier;
    const isHighlighted = !!meta.badge;
    const priceString = pkg.product.priceString;
    const period = pkg.packageType === "ANNUAL" ? "/an" : "/mois";

    return (
      <View
        key={pkg.identifier}
        style={[
          styles.pricingCard,
          isHighlighted && styles.pricingCardHighlighted,
          { borderColor: meta.color },
        ]}
      >
        {meta.badge && (
          <View style={[styles.badge, { backgroundColor: meta.color }]}>
            <Text style={styles.badgeText}>{meta.badge}</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.planName}>{meta.name}</Text>
          {meta.target && <Text style={styles.planTarget}>{meta.target}</Text>}
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{priceString}</Text>
          <Text style={styles.pricePeriod}>{period}</Text>
        </View>

        <View style={styles.featuresContainer}>
          {meta.features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <Check size={16} color={meta.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={[
            styles.ctaButton,
            { backgroundColor: meta.color },
            isProcessing && { opacity: 0.7 },
          ]}
          onPress={() => handleSubscribe(pkg)}
          disabled={isProcessing || purchaseMutation.isPending}
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

        <Text style={styles.trialText}>
          Essai gratuit · Annulation à tout moment
        </Text>
      </View>
    );
  }, [purchasingPkgId, purchaseMutation.isPending, handleSubscribe]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Sparkles size={28} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Choisissez votre plan</Text>
        <Text style={styles.subtitle}>
          Débloquez toutes les fonctionnalités de Purrly
        </Text>
      </View>

      {offeringsQuery.isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des offres...</Text>
        </View>
      )}

      {offeringsQuery.isError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Impossible de charger les offres.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void offeringsQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </Pressable>
        </View>
      )}

      {offering && offering.availablePackages.length > 0 && (
        <View style={styles.packagesContainer}>
          {offering.availablePackages.map((pkg) => renderPackageCard(pkg))}
        </View>
      )}

      {offering && offering.availablePackages.length === 0 && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Aucune offre disponible pour le moment.
          </Text>
        </View>
      )}

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
    gap: 16,
  },
  errorText: {
    fontSize: 15,
    color: "#94a3b8",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: "#fff",
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
  planName: {
    fontSize: 24,
    fontWeight: "800" as const,
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
});
