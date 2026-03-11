import React, { useRef, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  Animated,
  Image,
} from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  ScanLine,
  HeartPulse,
  Bot,
  Users,
  Siren,
  Wrench,
  Mail,
  Globe,
  ExternalLink,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";

const FEATURES = [
  { icon: ScanLine, color: "#D4A05C", bgColor: "rgba(212, 160, 92, 0.15)", titleKey: "feature1Title", textKey: "feature1Text" },
  { icon: HeartPulse, color: "#EF4444", bgColor: "rgba(239, 68, 68, 0.15)", titleKey: "feature2Title", textKey: "feature2Text" },
  { icon: Bot, color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.15)", titleKey: "feature3Title", textKey: "feature3Text" },
  { icon: Users, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.15)", titleKey: "feature4Title", textKey: "feature4Text" },
  { icon: Siren, color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)", titleKey: "feature5Title", textKey: "feature5Text" },
  { icon: Wrench, color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.15)", titleKey: "feature6Title", textKey: "feature6Text" },
] as const;

export default function AboutScreen() {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLink = async (url: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    void Linking.openURL(url);
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: t("legal.aboutTitle") }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/barkly-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Barkly</Text>
          <Text style={styles.tagline}>{t("legal.about.tagline")}</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>{t("legal.about.version")}</Text>
          </View>
        </Animated.View>

        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>
            {t("legal.about.description")}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>
              {t("legal.about.missionTitle")}
            </Text>
          </View>
          <View style={styles.missionCard}>
            <Text style={styles.missionText}>
              {t("legal.about.missionText")}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>
              {t("legal.about.featuresTitle")}
            </Text>
          </View>
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <View key={index} style={styles.featureCard}>
                  <View
                    style={[
                      styles.featureIconContainer,
                      { backgroundColor: feature.bgColor },
                    ]}
                  >
                    <Icon color={feature.color} size={22} />
                  </View>
                  <Text style={styles.featureTitle}>
                    {t(`legal.about.${feature.titleKey}`)}
                  </Text>
                  <Text style={styles.featureText}>
                    {t(`legal.about.${feature.textKey}`)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>
              {t("legal.about.teamTitle")}
            </Text>
          </View>
          <View style={styles.teamCard}>
            <View style={styles.teamLogoCircle}>
              <Text style={styles.teamLogoText}>IV</Text>
            </View>
            <Text style={styles.teamName}>InferenceVision</Text>
            <Text style={styles.teamText}>{t("legal.about.teamText")}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>
              {t("legal.about.contactTitle")}
            </Text>
          </View>
          <View style={styles.contactCard}>
            <Pressable
              onPress={() =>
                handleLink(`mailto:${t("legal.about.contactEmail")}`)
              }
              style={({ pressed }) => [
                styles.contactRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: "rgba(59, 130, 246, 0.15)" },
                ]}
              >
                <Mail color="#3B82F6" size={18} />
              </View>
              <Text style={styles.contactText}>
                {t("legal.about.contactEmail")}
              </Text>
              <ExternalLink color={Colors.textMuted} size={16} />
            </Pressable>
            <View style={styles.contactDivider} />
            <Pressable
              onPress={() =>
                handleLink(`https://${t("legal.about.contactWebsite")}`)
              }
              style={({ pressed }) => [
                styles.contactRow,
                pressed && { opacity: 0.7 },
              ]}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: "rgba(16, 185, 129, 0.15)" },
                ]}
              >
                <Globe color="#10B981" size={18} />
              </View>
              <Text style={styles.contactText}>
                {t("legal.about.contactWebsite")}
              </Text>
              <ExternalLink color={Colors.textMuted} size={16} />
            </Pressable>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerHeart}>{t("legal.about.madeWith")} 🐱</Text>
          <Text style={styles.footerCopyright}>
            {t("legal.about.copyright")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  heroSection: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  appName: {
    fontSize: 32,
    fontWeight: "900" as const,
    color: Colors.ivory,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  versionBadge: {
    marginTop: 14,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  descriptionCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
  },
  descriptionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    textAlign: "center",
  },
  section: {
    marginBottom: 28,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 24,
    marginBottom: 16,
    gap: 10,
  },
  sectionAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.ivory,
    letterSpacing: -0.3,
  },
  missionCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  missionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    gap: 12,
  },
  featureCard: {
    width: "47%" as any,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: Colors.ivory,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  teamCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: "center",
  },
  teamLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(212, 160, 92, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 14,
  },
  teamLogoText: {
    fontSize: 22,
    fontWeight: "900" as const,
    color: Colors.primary,
    letterSpacing: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: Colors.ivory,
    marginBottom: 8,
  },
  teamText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
  contactCard: {
    marginHorizontal: 24,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 14,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  contactText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.ivory,
  },
  contactDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 72,
  },
  footer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 20,
    gap: 8,
  },
  footerHeart: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: "600" as const,
  },
  footerCopyright: {
    fontSize: 12,
    color: Colors.textMuted,
    opacity: 0.6,
  },
});
