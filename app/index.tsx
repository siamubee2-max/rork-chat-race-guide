import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BookOpen, Crown, ScanLine, Sparkles } from "lucide-react-native";
import { Animated, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { catQuotes } from "@/constants/quotes";
import { Colors } from "@/constants/colors";

const logoUri = require("@/assets/images/purrly-logo.png");

export default function Index() {
  useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = useWindowDimensions();
  const isTablet = SCREEN_WIDTH >= 768;
  const { hasSelectedLanguage, isLoading: isLanguageLoading } = useLanguage();
  const insets = useSafeAreaInsets();

  const randomQuote = useMemo(
    () => catQuotes[Math.floor(Math.random() * catQuotes.length)],
    []
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (isAuthenticated && !isLoading && !isLanguageLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAuthenticated, isLoading, isLanguageLoading, fadeAnim, slideAnim]);

  useEffect(() => {
    if (!isLanguageLoading && !hasSelectedLanguage) {
      router.replace("/language-select" as any);
      return;
    }
    
    if (!isLoading && !isLanguageLoading && !isAuthenticated) {
      router.replace("/auth/login" as any);
    }
  }, [isLoading, isAuthenticated, hasSelectedLanguage, isLanguageLoading]);

  const goScan = useCallback(() => {
    router.replace("/(tabs)/(scan)/home" as any);
  }, []);

  const goBreeds = useCallback(() => {
    router.replace("/(tabs)/(breeds)/home" as any);
  }, []);

  if (isLoading || isLanguageLoading || !isAuthenticated) {
    return <View style={styles.screen} />;
  }

  const heroHeight = Math.max(SCREEN_HEIGHT * 0.65, 500);
  const logoSize = isTablet ? 240 : 180;
  const titleSize = isTablet ? Math.min(52, SCREEN_HEIGHT * 0.05) : Math.min(42, SCREEN_HEIGHT * 0.05);
  const titleLineHeight = isTablet ? Math.min(58, SCREEN_HEIGHT * 0.056) : Math.min(48, SCREEN_HEIGHT * 0.056);
  const contentMaxWidth = isTablet ? 680 : undefined;

  return (
    <View style={styles.screen} testID="indexScreen">
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40, alignItems: isTablet ? 'center' as const : undefined }}
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.hero, { height: heroHeight, maxWidth: isTablet ? 900 : undefined, alignSelf: isTablet ? 'center' as const : undefined, width: '100%' }]} testID="indexHero">
        <View style={styles.heroBg} />
        <View style={[styles.logoContainer, { height: SCREEN_HEIGHT * 0.3 }]}>
          <Image source={logoUri} style={[styles.logoImg, { width: logoSize, height: logoSize }]} contentFit="contain" />
        </View>
        <LinearGradient
          colors={["transparent", "rgba(12,10,9,0.4)", "#0C0A09"]}
          locations={[0, 0.4, 0.9]}
          style={styles.heroGrad}
        />
        
        <Animated.View style={[styles.heroCopy, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.header}>
            <View style={styles.brandPill}>
              <Crown color={Colors.primary} size={18} />
              <Text style={styles.brandText}>PURRLY</Text>
            </View>
            <View style={styles.premiumPill}>
              <Text style={styles.premiumText}>COLLECTION</Text>
            </View>
          </View>
          <Text style={styles.preTitle}>L&apos;ART DE LA GÉNÉTIQUE</Text>
          <Text style={[styles.title, { fontSize: titleSize, lineHeight: titleLineHeight }]}>Le prestige dans chaque regard</Text>
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
        </Animated.View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, maxWidth: contentMaxWidth, width: isTablet ? '100%' : undefined }]}>
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
      </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    width: "100%",
    position: "relative",
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0C0A09',
  },
  logoContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: {
    borderRadius: 30,
  },
  heroGrad: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
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
    bottom: 30,
    left: 24,
    right: 24,
    gap: 10,
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
    fontWeight: "900",
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
    flex: 1,
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
    paddingHorizontal: 24,
    marginTop: -20,
    paddingBottom: 20,
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
