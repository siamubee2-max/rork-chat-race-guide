import React, { useCallback, useEffect, useMemo } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BookOpen, ScanLine, Sparkles } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { catQuotes } from "@/constants/quotes";
import { Colors } from "@/constants/colors";

const heroUri =
  "https://images.unsplash.com/photo-1615796153287-98eacf0abb13?auto=format&fit=crop&w=1200&q=80";

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
    console.log("[Index] mounted", { isAuthenticated, isLoading, hasSelectedLanguage, isLanguageLoading });
  }, [isAuthenticated, isLoading, hasSelectedLanguage, isLanguageLoading]);

  useEffect(() => {
    if (!isLanguageLoading && !hasSelectedLanguage) {
      console.log("[Index] redirecting to language-select");
      router.replace("/language-select" as any);
      return;
    }
    
    if (!isLoading && !isLanguageLoading && !isAuthenticated) {
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
          colors={["rgba(61, 46, 36, 0)", "rgba(61, 46, 36, 0.7)", Colors.background]}
          locations={[0, 0.6, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.heroGrad}
        />
        <View style={[styles.brandPill, { top: insets.top + 12 }]}>
          <Sparkles color="#fff" size={14} />
          <Text style={styles.brandText}>Purrly</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={styles.title}>{t('index.title')}</Text>
          <Text style={styles.quote}>&ldquo;{randomQuote}&rdquo;</Text>
          <Text style={styles.subtitle}>
            {t('index.subtitle')}
          </Text>
        </View>
      </View>

      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 20) + 20 }]} testID="indexContent">
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Bienvenue 🐱</Text>
          <Text style={styles.welcomeText}>
            Découvrez le monde fascinant des chats avec notre IA de reconnaissance de races.
          </Text>
        </View>

        <Pressable
          onPress={goScan}
          style={({ pressed }) => [
            styles.primary,
            pressed ? { transform: [{ scale: 0.98 }], opacity: 0.9 } : null,
          ]}
          testID="indexGoScan"
        >
          <ScanLine color="#fff" size={20} />
          <Text style={styles.primaryText}>{t('index.scan')}</Text>
        </Pressable>

        <Pressable
          onPress={goBreeds}
          style={({ pressed }) => [
            styles.secondary,
            pressed ? { opacity: 0.85 } : null,
          ]}
          testID="indexGoBreeds"
        >
          <BookOpen color={Colors.primary} size={20} />
          <Text style={styles.secondaryText}>{t('index.browseBreeds')}</Text>
        </Pressable>
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
    height: 420,
    overflow: "hidden",
    backgroundColor: Colors.text,
  },
  heroImg: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  heroGrad: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  brandPill: {
    position: "absolute",
    top: 16, // Overridden by inline style with insets
    left: 16,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(212, 119, 92, 0.85)",
  },
  brandText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
    letterSpacing: 0.3,
  },
  heroCopy: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
  },
  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  quote: {
    marginTop: 10,
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
    maxWidth: 520,
  },
  subtitle: {
    marginTop: 12,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 21,
    fontSize: 15,
    maxWidth: 520,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  primary: {
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },
  secondary: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: Colors.primaryMuted,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  secondaryText: {
    color: Colors.primary,
    fontWeight: "800",
    fontSize: 16,
  },
});
