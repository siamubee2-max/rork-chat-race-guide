import { useState, useCallback } from "react";
import createContextHook from "@nkzw/create-context-hook";
import * as Linking from "expo-linking";
import { Alert } from "react-native";
import { useAuth, SubscriptionTier } from "./auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export interface StripeProduct {
  id: string;
  priceId: string;
  yearlyPriceId?: string;
  name: string;
  tier: SubscriptionTier;
}

export interface StripeAddOn {
  id: string;
  priceId: string;
  yearlyPriceId?: string;
  name: string;
}

const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: "premium",
    priceId: "price_premium_monthly",
    yearlyPriceId: "price_premium_yearly",
    name: "Premium",
    tier: "premium",
  },
  {
    id: "premium_plus",
    priceId: "price_premium_plus_monthly",
    yearlyPriceId: "price_premium_plus_yearly",
    name: "Premium Plus",
    tier: "premium_plus",
  },
];

const STRIPE_ADDONS: StripeAddOn[] = [
  {
    id: "health_tracking",
    priceId: "price_health_tracking_monthly",
    yearlyPriceId: "price_health_tracking_yearly",
    name: "Suivi Santé Avancé",
  },
  {
    id: "vet_directory",
    priceId: "price_vet_directory_monthly",
    yearlyPriceId: "price_vet_directory_yearly",
    name: "Annuaire Vétérinaire",
  },
  {
    id: "breeder_network",
    priceId: "price_breeder_network_monthly",
    yearlyPriceId: "price_breeder_network_yearly",
    name: "Réseau Éleveurs Premium",
  },
];

const STORAGE_PENDING_PAYMENT = "pending_stripe_payment";

interface PendingPayment {
  type: "subscription" | "addon";
  productId: string;
  tier?: SubscriptionTier;
  billingCycle: "monthly" | "yearly";
  timestamp: number;
}

export const [StripeProvider, useStripe] = createContextHook(() => {
  const { currentUser, updateSubscription } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const getStripeCheckoutUrl = useCallback(
    (
      priceId: string,
      mode: "subscription" | "payment" = "subscription",
      successUrl?: string,
      cancelUrl?: string
    ): string => {
      const baseUrl = process.env.EXPO_PUBLIC_STRIPE_CHECKOUT_URL || "";
      
      if (!baseUrl) {
        console.log("No Stripe checkout URL configured");
        return "";
      }

      const redirectUrl = Linking.createURL("subscription/success");
      const cancelRedirectUrl = Linking.createURL("subscription/cancel");

      const params = new URLSearchParams({
        price_id: priceId,
        mode,
        success_url: successUrl || redirectUrl,
        cancel_url: cancelUrl || cancelRedirectUrl,
        customer_email: currentUser?.email || "",
        client_reference_id: currentUser?.id || "",
      });

      return `${baseUrl}?${params.toString()}`;
    },
    [currentUser]
  );

  const initiateSubscription = useCallback(
    async (
      productId: string,
      billingCycle: "monthly" | "yearly" = "monthly"
    ): Promise<boolean> => {
      console.log("Initiating subscription:", productId, billingCycle);
      setIsProcessing(true);

      try {
        const product = STRIPE_PRODUCTS.find((p) => p.id === productId);
        if (!product) {
          console.error("Product not found:", productId);
          Alert.alert("Erreur", "Produit non trouvé");
          return false;
        }

        const priceId = billingCycle === "yearly" ? product.yearlyPriceId : product.priceId;
        if (!priceId) {
          console.error("Price ID not found for:", productId, billingCycle);
          Alert.alert("Erreur", "Prix non trouvé");
          return false;
        }

        const pendingPayment: PendingPayment = {
          type: "subscription",
          productId,
          tier: product.tier,
          billingCycle,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_PENDING_PAYMENT, JSON.stringify(pendingPayment));

        const checkoutUrl = getStripeCheckoutUrl(priceId);
        
        if (!checkoutUrl) {
          console.log("Demo mode: simulating payment success");
          await updateSubscription(product.tier, currentUser?.addOns || []);
          Alert.alert("Succès", `Abonnement ${product.name} activé !`);
          return true;
        }

        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
          return true;
        } else {
          Alert.alert("Erreur", "Impossible d'ouvrir le paiement");
          return false;
        }
      } catch (error) {
        console.error("Error initiating subscription:", error);
        Alert.alert("Erreur", "Une erreur est survenue lors du paiement");
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [currentUser, getStripeCheckoutUrl, updateSubscription]
  );

  const initiateAddOnPurchase = useCallback(
    async (
      addOnId: string,
      billingCycle: "monthly" | "yearly" = "monthly"
    ): Promise<boolean> => {
      console.log("Initiating add-on purchase:", addOnId, billingCycle);
      setIsProcessing(true);

      try {
        const addOn = STRIPE_ADDONS.find((a) => a.id === addOnId);
        if (!addOn) {
          console.error("Add-on not found:", addOnId);
          Alert.alert("Erreur", "Module non trouvé");
          return false;
        }

        const priceId = billingCycle === "yearly" ? addOn.yearlyPriceId : addOn.priceId;
        if (!priceId) {
          console.error("Price ID not found for add-on:", addOnId, billingCycle);
          Alert.alert("Erreur", "Prix non trouvé");
          return false;
        }

        const pendingPayment: PendingPayment = {
          type: "addon",
          productId: addOnId,
          billingCycle,
          timestamp: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE_PENDING_PAYMENT, JSON.stringify(pendingPayment));

        const checkoutUrl = getStripeCheckoutUrl(priceId);
        
        if (!checkoutUrl) {
          console.log("Demo mode: simulating add-on purchase");
          const currentAddOns = currentUser?.addOns || [];
          if (!currentAddOns.includes(addOnId)) {
            await updateSubscription(
              currentUser?.subscriptionTier || "free",
              [...currentAddOns, addOnId]
            );
          }
          Alert.alert("Succès", `Module ${addOn.name} ajouté !`);
          return true;
        }

        const supported = await Linking.canOpenURL(checkoutUrl);
        if (supported) {
          await Linking.openURL(checkoutUrl);
          return true;
        } else {
          Alert.alert("Erreur", "Impossible d'ouvrir le paiement");
          return false;
        }
      } catch (error) {
        console.error("Error initiating add-on purchase:", error);
        Alert.alert("Erreur", "Une erreur est survenue lors du paiement");
        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [currentUser, getStripeCheckoutUrl, updateSubscription]
  );

  const handlePaymentSuccess = useCallback(async (): Promise<boolean> => {
    console.log("Handling payment success");
    
    try {
      const pendingData = await AsyncStorage.getItem(STORAGE_PENDING_PAYMENT);
      if (!pendingData) {
        console.log("No pending payment found");
        return false;
      }

      const pending: PendingPayment = JSON.parse(pendingData);
      
      if (Date.now() - pending.timestamp > 30 * 60 * 1000) {
        console.log("Pending payment expired");
        await AsyncStorage.removeItem(STORAGE_PENDING_PAYMENT);
        return false;
      }

      if (pending.type === "subscription" && pending.tier) {
        await updateSubscription(pending.tier, currentUser?.addOns || []);
        console.log("Subscription updated to:", pending.tier);
      } else if (pending.type === "addon") {
        const currentAddOns = currentUser?.addOns || [];
        if (!currentAddOns.includes(pending.productId)) {
          await updateSubscription(
            currentUser?.subscriptionTier || "free",
            [...currentAddOns, pending.productId]
          );
        }
        console.log("Add-on added:", pending.productId);
      }

      await AsyncStorage.removeItem(STORAGE_PENDING_PAYMENT);
      return true;
    } catch (error) {
      console.error("Error handling payment success:", error);
      return false;
    }
  }, [currentUser, updateSubscription]);

  const cancelSubscription = useCallback(async (): Promise<boolean> => {
    console.log("Cancelling subscription");
    
    try {
      await updateSubscription("free", []);
      Alert.alert("Succès", "Votre abonnement a été annulé");
      return true;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      Alert.alert("Erreur", "Impossible d'annuler l'abonnement");
      return false;
    }
  }, [updateSubscription]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    console.log("Restoring purchases");
    Alert.alert(
      "Restauration",
      "Pour restaurer vos achats, veuillez vous connecter avec le même compte utilisé pour l'achat initial."
    );
    return true;
  }, []);

  return {
    isProcessing,
    isStripeConfigured: !!STRIPE_PUBLISHABLE_KEY,
    initiateSubscription,
    initiateAddOnPurchase,
    handlePaymentSuccess,
    cancelSubscription,
    restorePurchases,
    products: STRIPE_PRODUCTS,
    addOns: STRIPE_ADDONS,
  };
});
