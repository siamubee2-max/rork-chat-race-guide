import React, { useCallback, useEffect, useRef } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { 
  BookOpen, 
  ScanLine, 
  Heart, 
  MessageCircle, 
  Stethoscope,
  ChevronRight,
  Cat
} from "lucide-react-native";
import { 
  Animated, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  Dimensions
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

const heroUri =
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=1200&q=80";

const FEATURES = [
  {
    id: "scan",
    icon: ScanLine,
    color: Colors.primary,
    bgColor: "rgba(212, 119, 92, 0.12)",
    route: "/(tabs)/(scan)/home",
  },
  {
    id: "breeds",
    icon: BookOpen,
    color: Colors.accent,
    bgColor: "rgba(232, 168, 73, 0.12)",
    route: "/(tabs)/(breeds)/home",
  },
  {
    id: "health",
    icon: Stethoscope,
    color: Colors.success,
    bgColor: "rgba(123, 160, 91, 0.12)",
    route: "/(tabs)/cats",
  },
  {
    id: "community",
    icon: MessageCircle,
    color: Colors.info,
    bgColor: "rgba(107, 154, 196, 0.12)",
    route: "/(tabs)/community",
  },
];

export default function Index() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasSelectedLanguage, isLoading: isLanguageLoading } = useLanguage();
  const insets = useSafeAreaInsets();
  
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

  const navigate = useCallback((route: string) => {
    console.log("[Index] navigate to", route);
    router.replace(route as any);
  }, []);

  if (isLoading || isLanguageLoading || !isAuthenticated) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <Cat color={Colors.primary} size={40} />
          </View>
          <Text style={styles.loadingText}>Purrly</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen} testID="indexScreen">
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: heroUri }} 
            style={styles.heroImg} 
            contentFit="cover" 
          />
          <LinearGradient
            colors={["transparent", "rgba(61, 46, 36, 0.4)", Colors.background]}
            locations={[0, 0.5, 1]}
            style={styles.heroGrad}
          />
          
          <View style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}>
            <View style={styles.logoPill}>
              <Cat color="#fff" size={18} />
              <Text style={styles.logoText}>Purrly</Text>
            </View>
          </View>

          <Animated.View 
            style={[
              styles.heroContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }
            ]}
          >
            <Text style={styles.heroTitle}>{t('index.title')}</Text>
            <Text style={styles.heroSubtitle}>{t('index.subtitle')}</Text>
          </Animated.View>
        </View>

        <Animated.View 
          style={[
            styles.mainContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <Pressable
            onPress={() => navigate("/(tabs)/(scan)/home")}
            style={({ pressed }) => [
              styles.mainCta,
              pressed && styles.mainCtaPressed,
            ]}
            testID="indexGoScan"
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainCtaGradient}
            >
              <View style={styles.mainCtaIcon}>
                <ScanLine color="#fff" size={28} />
              </View>
              <View style={styles.mainCtaText}>
                <Text style={styles.mainCtaTitle}>{t('index.scan')}</Text>
                <Text style={styles.mainCtaDesc}>Identifiez la race de votre chat</Text>
              </View>
              <ChevronRight color="rgba(255,255,255,0.7)" size={24} />
            </LinearGradient>
          </Pressable>

          <Text style={styles.sectionTitle}>Découvrir</Text>
          
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              const labels: Record<string, { title: string; desc: string }> = {
                scan: { title: "Scanner", desc: "IA de reconnaissance" },
                breeds: { title: "Races", desc: "Encyclopédie féline" },
                health: { title: "Santé", desc: "Suivi de vos chats" },
                community: { title: "Communauté", desc: "Échanges et partages" },
              };
              const label = labels[feature.id];
              
              return (
                <Pressable
                  key={feature.id}
                  onPress={() => navigate(feature.route)}
                  style={({ pressed }) => [
                    styles.featureCard,
                    pressed && styles.featureCardPressed,
                  ]}
                  testID={`feature-${feature.id}`}
                >
                  <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                    <Icon color={feature.color} size={22} />
                  </View>
                  <Text style={styles.featureTitle}>{label.title}</Text>
                  <Text style={styles.featureDesc}>{label.desc}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={() => navigate("/(tabs)/assistant")}
            style={({ pressed }) => [
              styles.assistantCard,
              pressed && styles.assistantCardPressed,
            ]}
          >
            <View style={styles.assistantLeft}>
              <View style={styles.assistantIcon}>
                <Heart color={Colors.heart} size={20} fill={Colors.heart} />
              </View>
              <View style={styles.assistantText}>
                <Text style={styles.assistantTitle}>Assistant IA</Text>
                <Text style={styles.assistantDesc}>
                  Posez vos questions sur les chats
                </Text>
              </View>
            </View>
            <ChevronRight color={Colors.textMuted} size={20} />
          </Pressable>
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
  loadingScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 12,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroContainer: {
    height: 340,
    position: "relative",
  },
  heroImg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGrad: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  logoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(212, 119, 92, 0.9)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 50,
  },
  logoText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -0.5,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 22,
    maxWidth: 300,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  mainCta: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  mainCtaPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  mainCtaGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 18,
    gap: 14,
  },
  mainCtaIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  mainCtaText: {
    flex: 1,
  },
  mainCtaTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 2,
  },
  mainCtaDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    marginTop: 28,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: (width - 52) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureCardPressed: {
    backgroundColor: Colors.backgroundSecondary,
    transform: [{ scale: 0.98 }],
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  assistantCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  assistantCardPressed: {
    backgroundColor: Colors.backgroundSecondary,
  },
  assistantLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  assistantIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(212, 91, 91, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  assistantText: {
    gap: 2,
  },
  assistantTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  assistantDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
