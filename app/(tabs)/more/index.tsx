import React from "react";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
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
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/context/auth";

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

  const handleNavigation = async (route: string) => {
    try {
      await Haptics.selectionAsync();
    } catch {}
    router.push(route as any);
  };

  const menuSections: { title: string; items: MenuItem[] }[] = [
    {
      title: "Découvrir",
      items: [
        {
          id: "breeds",
          icon: <Cat color={Colors.primary} size={22} />,
          title: "Races de Chats",
          subtitle: "Explorez 200+ races",
          route: "/(tabs)/(breeds)/home",
          color: Colors.primaryMuted,
        },
        {
          id: "breeders",
          icon: <Users color="#8B7355" size={22} />,
          title: "Éleveurs",
          subtitle: "Trouvez des éleveurs certifiés",
          route: "/(tabs)/(breeds)/breeders",
          color: "rgba(139, 115, 85, 0.15)",
        },
      ],
    },
    {
      title: "Santé & Urgence",
      items: [
        {
          id: "emergency",
          icon: <Stethoscope color="#D45B5B" size={22} />,
          title: "Urgence Vétérinaire",
          subtitle: "Contacts et conseils d'urgence",
          route: "/(tabs)/emergency",
          color: "rgba(212, 91, 91, 0.15)",
          badge: "SOS",
        },
        {
          id: "vets",
          icon: <BookOpen color="#5B8FD4" size={22} />,
          title: "Vétérinaires",
          subtitle: "Trouvez un vétérinaire près de vous",
          route: "/(tabs)/vets",
          color: "rgba(91, 143, 212, 0.15)",
        },
      ],
    },
    {
      title: "Outils Pratiques",
      items: [
        {
          id: "practical",
          icon: <Wrench color="#8E7CC3" size={22} />,
          title: "Outils Pratiques",
          subtitle: "Rappels, budget, courses...",
          route: "/(tabs)/practical",
          color: "rgba(142, 124, 195, 0.15)",
        },
        {
          id: "discussions",
          icon: <MessageCircle color="#E89C3F" size={22} />,
          title: "Forum",
          subtitle: "Posez vos questions",
          route: "/(tabs)/discussions",
          color: "rgba(232, 156, 63, 0.15)",
        },
      ],
    },
    {
      title: "Gamification",
      items: [
        {
          id: "gamification",
          icon: <Trophy color="#D4A65D" size={22} />,
          title: "Profil & Réalisations",
          subtitle: "Défis, badges et classement",
          route: "/(tabs)/gamification",
          color: "rgba(212, 166, 93, 0.15)",
        },
      ],
    },
    {
      title: "Premium",
      items: [
        {
          id: "subscription",
          icon: <Crown color="#D4775C" size={22} />,
          title: "Purrly Premium",
          subtitle: "Accès illimité aux fonctionnalités",
          route: "/(tabs)/subscription",
          color: "rgba(212, 119, 92, 0.15)",
          badge: "PRO",
        },
      ],
    },
    {
      title: "Paramètres",
      items: [
        {
          id: "language",
          icon: <Languages color={Colors.textSecondary} size={22} />,
          title: "Langue",
          subtitle: "Changer la langue de l'app",
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
                {currentUser?.name || "Utilisateur"}
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

        <View style={styles.footer}>
          <Text style={styles.footerText}>Purrly v1.0.0</Text>
          <Text style={styles.footerSubtext}>
            Fait avec ❤️ pour les amoureux des chats
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
    padding: 20,
    paddingTop: 24,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.backgroundCard,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 24,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    fontWeight: "800",
    color: "#fff",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
