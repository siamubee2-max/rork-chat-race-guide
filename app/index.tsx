import React, { useCallback, useEffect, useMemo } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BookOpen, Crown, ScanLine, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { catQuotes } from "@/constants/quotes";
import { Colors } from "@/constants/colors";

const heroUri =
  "https://images.unsplash.com/photo-1504595403659-9088ce801e29?auto=format&fit=crop&w=1400&q=80";

export default function Index() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasSelectedLanguage, isLoading: isLanguageLoading } = useLanguage();
  const insets = useSafeAreaInsets();

  const randomQuote = useMemo(
    () => catQuotes[Math.floor(Math.random() * catQuotes.length)],
    []
  );

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:29',message:'Index mounted',data:{isAuthenticated,isLoading,hasSelectedLanguage,isLanguageLoading},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    console.log("[Index] mounted", { isAuthenticated, isLoading, hasSelectedLanguage, isLanguageLoading });
  }, [isAuthenticated, isLoading, hasSelectedLanguage, isLanguageLoading]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:33',message:'Index navigation check',data:{isLanguageLoading,hasSelectedLanguage,isLoading,isAuthenticated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
    // #endregion
    if (!isLanguageLoading && !hasSelectedLanguage) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:36',message:'Redirecting to language-select',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      console.log("[Index] redirecting to language-select");
      router.replace("/language-select" as any);
      return;
    }
    
    if (!isLoading && !isLanguageLoading && !isAuthenticated) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'index.tsx:42',message:'Redirecting to login',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      console.log("[Index] redirecting to login");
      router.replace("/auth/login" as any);
    }
  }, [isLoading, isAuthenticated, hasSelectedLanguage, isLanguageLoading]);

  const goScan = useCallback(() => {
    console.log("[Index] goScan");
    router.replace("/(tabs)/(scan)/home" as any);
  }, []);

  const goBreeds = useCallback(() => {
    console.log("[Index] goBreeds");
    router.replace("/(tabs)/(breeds)/home" as any);
  }, []);

  if (isLoading || isLanguageLoading || !isAuthenticated) {
    return <View style={styles.screen} />;
  }

  return (
    <View style={styles.screen} testID="indexScreen">
      <View style={styles.hero} testID="indexHero">
        <Image source={{ uri: heroUri }} style={styles.heroImg} contentFit="cover" />
        <LinearGradient
          colors={["transparent", "rgba(12,10,9,0.4)", "#0C0A09"]}
          locations={[0, 0.4, 0.9]}
          style={styles.heroGrad}
        />
        
        <View style={[styles.header, { top: insets.top + 20 }]}>
          <View style={styles.brandPill}>
            <Crown color={Colors.primary} size={18} />
            <Text style={styles.brandText}>PURRLY</Text>
          </View>
          <View style={styles.premiumPill}>
            <Text style={styles.premiumText}>COLLECTION</Text>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.preTitle}>L&apos;ART DE LA GÉNÉTIQUE</Text>
          <Text style={styles.title}>Le prestige dans chaque regard</Text>
          <Text style={styles.subtitle}>
            Découvrez l&apos;élégance pure à travers notre intelligence artificielle dédiée à l&apos;univers félin.
          </Text>
          
          <View style={styles.ctaContainer}>
            <Pressable
              onPress={goScan}
              style={({ pressed }) => [
                styles.primaryBtn,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
              ]}
            >
              <ScanLine color="#0C0A09" size={22} />
              <Text style={styles.primaryBtnText}>Reconnaître une race</Text>
            </Pressable>
            
            <Pressable
              onPress={goBreeds}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text style={styles.secondaryBtnText}>Explorer les archives</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.quoteSection}>
          <Text style={styles.quoteSymbol}>&ldquo;</Text>
          <Text style={styles.quoteText}>{randomQuote}</Text>
        </View>

        <View style={styles.bentoGrid}>
          <View style={[styles.bentoItem, styles.bentoItemLarge]}>
            <Sparkles color={Colors.primary} size={24} />
            <Text style={styles.bentoTitle}>IA de Précision</Text>
            <Text style={styles.bentoDesc}>Une analyse biométrique raffinée pour identifier plus de 200 races avec une exactitude absolue.</Text>
          </View>
          
          <View style={styles.bentoRow}>
            <View style={styles.bentoItemSmall}>
              <BookOpen color={Colors.primary} size={20} />
              <Text style={styles.bentoTitleSmall}>Héritage</Text>
            </View>
            <View style={styles.bentoItemSmall}>
              <Crown color={Colors.primary} size={20} />
              <Text style={styles.bentoTitleSmall}>Prestige</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  hero: {
    height: "65%",
    width: "100%",
    position: "relative",
  },
  heroImg: {
    ...StyleSheet.absoluteFillObject,
  },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(12, 10, 9, 0.6)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 92, 0.3)",
  },
  brandText: {
    color: Colors.ivory,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 2,
  },
  premiumPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(253, 249, 239, 0.2)",
  },
  premiumText: {
    color: Colors.ivory,
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    opacity: 0.8,
  },
  heroCopy: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    gap: 12,
  },
  preTitle: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 4,
  },
  title: {
    color: Colors.ivory,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 48,
    letterSpacing: -1,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    maxWidth: "90%",
    marginBottom: 10,
  },
  ctaContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  primaryBtn: {
    flex: 1.5,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  primaryBtnText: {
    color: "#0C0A09",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    flex: 1,
    backgroundColor: "rgba(253, 249, 239, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(253, 249, 239, 0.15)",
  },
  secondaryBtnText: {
    color: Colors.ivory,
    fontSize: 15,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -20,
  },
  quoteSection: {
    marginBottom: 30,
    alignItems: "center",
  },
  quoteSymbol: {
    color: Colors.primary,
    fontSize: 48,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    height: 30,
    opacity: 0.5,
  },
  quoteText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  bentoGrid: {
    gap: 12,
  },
  bentoItem: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bentoItemLarge: {
    gap: 12,
  },
  bentoRow: {
    flexDirection: "row",
    gap: 12,
  },
  bentoItemSmall: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    gap: 8,
  },
  bentoTitle: {
    color: Colors.ivory,
    fontSize: 20,
    fontWeight: "800",
  },
  bentoTitleSmall: {
    color: Colors.ivory,
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  bentoDesc: {
    color: Colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
