import React from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";
import {
  Cat,
  Stethoscope,
  MessageCircle,
  Wrench,
  Trophy,
  Crown,
  BookOpen,
  Users,
  Languages,
  ChevronRight,
  Zap,
  Bell,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Switch,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/auth";
import { useNotifications } from "@/context/notifications";

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  route: string;
  color: string;
  badge?: string;
}

export default function MoreScreen() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { 
    notificationsEnabled, 
    requestPermissions, 
    disableNotifications,
  } = useNotifications();

  const handleNavigation = async (route: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    try {
      router.push(route as any);
    } catch (error) {
      console.error(`Navigation error to ${route}:`, error);
      try {
        router.navigate(route as any);
      } catch (navError) {
        console.error(`Navigation fallback failed:`, navError);
      }
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    try {
      await Haptics.selectionAsync();
    } catch {}

    if (Platform.OS === "web") {
      Alert.alert(
        t("notifications.title"),
        t("notifications.notAvailableWeb")
      );
      return;
    }

    if (value) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          t("notifications.permissionDenied"),
          t("notifications.permissionDeniedText")
        );
      }
    } else {
      await disableNotifications();
    }
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: t("more.discover"),
      items: [
        {
          id: "breeds",
          icon: <Cat color={Colors.primary} size={22} />,
          title: t("more.catBreeds"),
          subtitle: t("more.exploreBreeds"),
          route: "/(tabs)/(breeds)/home",
          color: Colors.primaryMuted,
        },
        {
          id: "breeders",
          icon: <Users color="#8B7355" size={22} />,
          title: t("more.breeders"),
          subtitle: t("more.findBreeders"),
          route: "/(tabs)/(breeds)/breeders",
          color: "rgba(139, 115, 85, 0.15)",
        },
      ],
    },
    {
      title: t("more.healthEmergency"),
      items: [
        {
          id: "emergency",
          icon: <Stethoscope color="#D45B5B" size={22} />,
          title: t("more.vetEmergency"),
          subtitle: t("more.emergencyContacts"),
          route: "/(tabs)/emergency",
          color: "rgba(212, 91, 91, 0.15)",
          badge: "SOS",
        },
        {
          id: "vets",
          icon: <BookOpen color="#5B8FD4" size={22} />,
          title: t("more.veterinarians"),
          subtitle: t("more.findVet"),
          route: "/(tabs)/vets",
          color: "rgba(91, 143, 212, 0.15)",
        },
      ],
    },
    {
      title: t("more.practicalTools"),
      items: [
        {
          id: "practical",
          icon: <Wrench color="#8E7CC3" size={22} />,
          title: t("more.practicalTools"),
          subtitle: t("more.toolsSubtitle"),
          route: "/(tabs)/practical",
          color: "rgba(142, 124, 195, 0.15)",
        },
        {
          id: "discussions",
          icon: <MessageCircle color="#E89C3F" size={22} />,
          title: t("more.forum"),
          subtitle: t("more.askQuestions"),
          route: "/(tabs)/discussions",
          color: "rgba(232, 156, 63, 0.15)",
        },
      ],
    },
    {
      title: t("more.gamification"),
      items: [
        {
          id: "gamification",
          icon: <Trophy color="#D4A65D" size={22} />,
          title: t("more.profileAchievements"),
          subtitle: t("more.challengesBadges"),
          route: "/(tabs)/gamification",
          color: "rgba(212, 166, 93, 0.15)",
        },
      ],
    },
    {
      title: t("more.premium"),
      items: [
        {
          id: "subscription",
          icon: <Crown color="#D4775C" size={22} />,
          title: t("more.purrlyPremium"),
          subtitle: t("more.unlimitedAccess"),
          route: "/(tabs)/subscription",
          color: "rgba(212, 119, 92, 0.15)",
          badge: "PRO",
        },
      ],
    },
    {
      title: t("more.settings"),
      items: [
        {
          id: "language",
          icon: <Languages color={Colors.textSecondary} size={22} />,
          title: t("more.language"),
          subtitle: t("more.changeLanguage"),
          route: "/modal",
          color: Colors.backgroundSecondary,
        },
      ],
    },
  ];

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.id}
      onPress={() => handleNavigation(item.route)}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
        {item.icon}
      </View>
      <View style={styles.menuContent}>
        <View style={styles.menuTitleRow}>
          <Text style={styles.menuTitle}>{item.title}</Text>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
      </View>
      <ChevronRight color={Colors.textMuted} size={20} />
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileCard}>
            <View style={styles.profileIcon}>
              <Zap color="#fff" size={24} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {currentUser?.name || t("more.user")}
              </Text>
              <Text style={styles.profileEmail}>{currentUser?.email}</Text>
            </View>
          </View>
        </View>

        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderMenuItem)}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("notifications.settingsTitle")}</Text>
          <View style={styles.sectionContent}>
            <View style={styles.menuItem}>
              <View style={[styles.menuIcon, { backgroundColor: notificationsEnabled ? "rgba(76, 175, 80, 0.15)" : "rgba(158, 158, 158, 0.15)" }]}>
                <Bell color={notificationsEnabled ? "#4CAF50" : Colors.textMuted} size={22} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{t("notifications.pushNotifications")}</Text>
                <Text style={styles.menuSubtitle}>{t("notifications.pushNotificationsDesc")}</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: Colors.border, true: Colors.primary }}
                thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Purrly v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            {t("more.madeWithLove")}
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
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 32,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    backgroundColor: Colors.backgroundSecondary,
    padding: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.ivory,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginLeft: 32,
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 24,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(253, 249, 239, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(253, 249, 239, 0.08)",
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.ivory,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: "#0C0A09",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "900",
    color: Colors.textMuted,
    letterSpacing: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 6,
    opacity: 0.6,
  },
});
