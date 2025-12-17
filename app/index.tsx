import React, { useCallback, useEffect, useRef } from "react";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { 
  BookOpen, 
  ScanLine, 
  MessageCircle, 
  Stethoscope,
  Sparkles,
  ArrowRight,
  Cat
} from "lucide-react-native";
import { 
  Animated, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  Dimensions,
  Platform,
  StatusBar
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";
import { useLanguage } from "@/context/language";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

const heroUri = "https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=1935&auto=format&fit=crop";

export default function Index() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { hasSelectedLanguage, isLoading: isLanguageLoading } = useLanguage();
  const insets = useSafeAreaInsets();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (isAuthenticated && !isLoading && !isLanguageLoading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAuthenticated, isLoading, isLanguageLoading, fadeAnim, slideAnim, scaleAnim]);

  useEffect(() => {
    if (!isLanguageLoading && !hasSelectedLanguage) {
      router.replace("/language-select" as any);
      return;
    }
    
    if (!isLoading && !isLanguageLoading && !isAuthenticated) {
      router.replace("/auth/login" as any);
    }
  }, [isLoading, isAuthenticated, hasSelectedLanguage, isLanguageLoading]);

  const navigate = useCallback((route: string) => {
    router.replace(route as any);
  }, []);

  if (isLoading || isLanguageLoading || !isAuthenticated) {
    return (
      <View style={styles.loadingScreen}>
        <View style={styles.loadingLogo}>
           <Cat color={Colors.primary} size={48} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="indexScreen">
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.heroSection}>
          <Image 
            source={{ uri: heroUri }} 
            style={styles.heroImage} 
            contentFit="cover"
            transition={500}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]}
            style={styles.heroOverlay}
          />
          
          <View style={[styles.heroContent, { paddingTop: insets.top + 20 }]}>
            <View style={styles.headerRow}>
              <View style={styles.logoBadge}>
                <Cat color="#fff" size={16} />
                <Text style={styles.logoText}>PURRLY</Text>
              </View>
            </View>
            
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
              <Text style={styles.heroTitle}>L&apos;excellence{"\n"}pour votre félin</Text>
              <Text style={styles.heroSubtitle}>
                Découvrez, comprenez et prenez soin de votre compagnon avec élégance.
              </Text>
            </Animated.View>
          </View>
        </View>

        <Animated.View 
          style={[
            styles.contentContainer,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Main Action Card */}
          <Pressable
            onPress={() => navigate("/(tabs)/(scan)/home")}
            style={({ pressed }) => [
              styles.mainCard,
              pressed && styles.cardPressed
            ]}
          >
            <LinearGradient
              colors={[Colors.primary, "#C06850"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mainCardGradient}
            >
              <View style={styles.mainCardContent}>
                <View style={styles.mainCardIcon}>
                  <ScanLine color="#fff" size={32} />
                </View>
                <View style={styles.mainCardText}>
                  <Text style={styles.mainCardTitle}>{t('index.scan')}</Text>
                  <Text style={styles.mainCardSubtitle}>Identification de race par IA</Text>
                </View>
                <View style={styles.arrowCircle}>
                  <ArrowRight color={Colors.primary} size={20} />
                </View>
              </View>
            </LinearGradient>
          </Pressable>

          {/* Quick Access Grid */}
          <Text style={styles.sectionHeader}>Univers Purrly</Text>
          
          <View style={styles.grid}>
            <Pressable 
              onPress={() => navigate("/(tabs)/(breeds)/home")}
              style={({ pressed }) => [styles.gridItem, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#FFF5F0" }]}>
                <BookOpen color={Colors.primary} size={24} />
              </View>
              <Text style={styles.gridTitle}>Encyclopédie</Text>
              <Text style={styles.gridSub}>Toutes les races</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigate("/(tabs)/cats")}
              style={({ pressed }) => [styles.gridItem, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#F0F7ED" }]}>
                <Stethoscope color={Colors.success} size={24} />
              </View>
              <Text style={styles.gridTitle}>Santé & Suivi</Text>
              <Text style={styles.gridSub}>Carnet médical</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigate("/(tabs)/community")}
              style={({ pressed }) => [styles.gridItem, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#EDF4F9" }]}>
                <MessageCircle color={Colors.info} size={24} />
              </View>
              <Text style={styles.gridTitle}>Communauté</Text>
              <Text style={styles.gridSub}>Passionnés</Text>
            </Pressable>

            <Pressable 
              onPress={() => navigate("/(tabs)/assistant")}
              style={({ pressed }) => [styles.gridItem, pressed && styles.cardPressed]}
            >
              <View style={[styles.iconContainer, { backgroundColor: "#FFF0F0" }]}>
                <Sparkles color="#E85D75" size={24} />
              </View>
              <Text style={styles.gridTitle}>Assistant IA</Text>
              <Text style={styles.gridSub}>Conseils 24/7</Text>
            </Pressable>
          </View>

          {/* Featured Banner */}
          <Pressable
            onPress={() => navigate("/(tabs)/subscription")}
            style={({ pressed }) => [
              styles.premiumBanner,
              pressed && styles.cardPressed
            ]}
          >
            <LinearGradient
              colors={["#2C2C2C", "#1A1A1A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumGradient}
            >
              <View>
                <Text style={styles.premiumTitle}>Purrly Premium</Text>
                <Text style={styles.premiumSub}>Débloquez tout le potentiel</Text>
              </View>
              <Sparkles color="#D4A05C" size={24} />
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5F0",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: 420,
    position: "relative",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  logoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
  },
  logoText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "300",
    color: "#fff",
    lineHeight: 48,
    marginBottom: 16,
    fontFamily: Platform.select({ ios: "Georgia", android: "serif" }),
  },
  heroSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
    maxWidth: 300,
    fontWeight: "400",
  },
  contentContainer: {
    flex: 1,
    marginTop: -40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mainCard: {
    marginBottom: 32,
    borderRadius: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  mainCardGradient: {
    borderRadius: 24,
    padding: 24,
  },
  mainCardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  mainCardIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  mainCardText: {
    flex: 1,
  },
  mainCardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  mainCardSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridItem: {
    width: COLUMN_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  gridSub: {
    fontSize: 13,
    color: "#888",
  },
  premiumBanner: {
    marginTop: 24,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  premiumGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 24,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#D4A05C",
    marginBottom: 4,
  },
  premiumSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
  },
});
