import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Bell,
  Wallet,
  ShoppingCart,
  Calculator,
  Plane,
  Heart,
  ChevronRight,
  AlertCircle,
  MapPin,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useReminders } from "@/context/reminders";
import { useExpenses } from "@/context/expenses";
import { useShopping } from "@/context/shopping";

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge?: string | number;
  badgeColor?: string;
  onPress: () => void;
  color: string;
};

const FeatureCard = ({ icon, title, subtitle, badge, badgeColor, onPress, color }: FeatureCardProps) => (
  <Pressable
    style={({ pressed }) => [
      styles.featureCard,
      pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
    ]}
    onPress={onPress}
  >
    <View style={[styles.featureIconContainer, { backgroundColor: color + "15" }]}>
      {icon}
    </View>
    <View style={styles.featureContent}>
      <View style={styles.featureTitleRow}>
        <Text style={styles.featureTitle}>{title}</Text>
        {badge !== undefined && badge !== 0 && (
          <View style={[styles.badge, { backgroundColor: badgeColor || Colors.primary }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
      <Text style={styles.featureSubtitle}>{subtitle}</Text>
    </View>
    <ChevronRight size={20} color={Colors.textMuted} />
  </Pressable>
);

type QuickActionProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color: string;
};

const QuickAction = ({ icon, label, onPress, color }: QuickActionProps) => (
  <Pressable
    style={({ pressed }) => [
      styles.quickAction,
      pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 },
    ]}
    onPress={onPress}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: color + "15" }]}>
      {icon}
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </Pressable>
);

export default function PracticalScreen() {
  const insets = useSafeAreaInsets();
  const { overdueReminders, upcomingReminders } = useReminders();
  const { totalThisMonth } = useExpenses();
  const { uncheckedItems } = useShopping();

  const overdueCount = overdueReminders.length;
  const upcomingCount = upcomingReminders.slice(0, 5).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Boîte à outils</Text>
        <Text style={styles.subtitle}>
          Tout pour prendre soin de votre chat au quotidien
        </Text>
      </View>

      {overdueCount > 0 && (
        <Pressable
          style={styles.alertBanner}
          onPress={() => router.push("/(tabs)/practical/reminders" as any)}
        >
          <View style={styles.alertIconContainer}>
            <AlertCircle size={24} color="#fff" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {overdueCount} rappel{overdueCount > 1 ? "s" : ""} en retard
            </Text>
            <Text style={styles.alertSubtitle}>Appuyez pour voir les détails</Text>
          </View>
          <ChevronRight size={20} color="#fff" />
        </Pressable>
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Accès rapide</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon={<MapPin size={22} color={Colors.primary} />}
            label="Vétérinaires"
            onPress={() => router.push("/(tabs)/vets/" as any)}
            color={Colors.primary}
          />
          <QuickAction
            icon={<AlertCircle size={22} color={Colors.error} />}
            label="Urgences"
            onPress={() => router.push("/(tabs)/emergency/" as any)}
            color={Colors.error}
          />
          <QuickAction
            icon={<Heart size={22} color="#E91E63" />}
            label="Premiers soins"
            onPress={() => router.push("/(tabs)/practical/first-aid" as any)}
            color="#E91E63"
          />
          <QuickAction
            icon={<Calculator size={22} color={Colors.info} />}
            label="Portions"
            onPress={() => router.push("/(tabs)/practical/food-calculator" as any)}
            color={Colors.info}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gestion quotidienne</Text>
        
        <FeatureCard
          icon={<Bell size={24} color={Colors.warning} />}
          title="Rappels & Rendez-vous"
          subtitle={`${upcomingCount} rappels à venir`}
          badge={overdueCount > 0 ? overdueCount : undefined}
          badgeColor={Colors.error}
          onPress={() => router.push("/(tabs)/practical/reminders" as any)}
          color={Colors.warning}
        />

        <FeatureCard
          icon={<Wallet size={24} color={Colors.success} />}
          title="Suivi des dépenses"
          subtitle={`${totalThisMonth.toFixed(2)}€ ce mois`}
          onPress={() => router.push("/(tabs)/practical/expenses" as any)}
          color={Colors.success}
        />

        <FeatureCard
          icon={<ShoppingCart size={24} color={Colors.info} />}
          title="Liste de courses"
          subtitle={`${uncheckedItems.length} article${uncheckedItems.length !== 1 ? "s" : ""} à acheter`}
          badge={uncheckedItems.length > 0 ? uncheckedItems.length : undefined}
          badgeColor={Colors.info}
          onPress={() => router.push("/(tabs)/practical/shopping" as any)}
          color={Colors.info}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Outils pratiques</Text>

        <FeatureCard
          icon={<Calculator size={24} color="#9C27B0" />}
          title="Calculateur de nourriture"
          subtitle="Portions adaptées au poids de votre chat"
          onPress={() => router.push("/(tabs)/practical/food-calculator" as any)}
          color="#9C27B0"
        />

        <FeatureCard
          icon={<Plane size={24} color="#00BCD4" />}
          title="Checklist voyage"
          subtitle="Préparez vos déplacements sereinement"
          onPress={() => router.push("/(tabs)/practical/travel" as any)}
          color="#00BCD4"
        />

        <FeatureCard
          icon={<Heart size={24} color="#E91E63" />}
          title="Guide premiers secours"
          subtitle="Réagir en cas d'urgence"
          onPress={() => router.push("/(tabs)/practical/first-aid" as any)}
          color="#E91E63"
        />
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipEmoji}>💡</Text>
        <Text style={styles.tipTitle}>Le saviez-vous ?</Text>
        <Text style={styles.tipText}>
          Un chat adulte a besoin de 40 à 60ml d&apos;eau par kg de poids corporel par jour. 
          Surveillez sa consommation d&apos;eau, surtout s&apos;il mange des croquettes.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.error,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  alertIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  alertSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  quickActionsContainer: {
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    width: "47%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  featureContent: {
    flex: 1,
  },
  featureTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  featureSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  tipCard: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.accent + "30",
  },
  tipEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
