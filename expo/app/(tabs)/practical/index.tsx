import React from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { navigate } from "@/utils/navigate";
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
import { useTranslation } from "react-i18next";
import { PremiumGate } from "@/components/PremiumGate";

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
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { overdueReminders, upcomingReminders } = useReminders();
  const { totalThisMonth } = useExpenses();
  const { uncheckedItems } = useShopping();

  const overdueCount = overdueReminders.length;
  const upcomingCount = upcomingReminders.slice(0, 5).length;

  return (
    <PremiumGate>
      <ScrollView
        style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('practical.toolbox')}</Text>
        <Text style={styles.subtitle}>
          {t('practical.toolboxSubtitle')}
        </Text>
      </View>

      {overdueCount > 0 && (
        <Pressable
          style={styles.alertBanner}
          onPress={() => navigate("/(tabs)/practical/reminders")}
        >
          <View style={styles.alertIconContainer}>
            <AlertCircle size={24} color="#fff" />
          </View>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>
              {t('practical.overdueReminders', { count: overdueCount })}
            </Text>
            <Text style={styles.alertSubtitle}>{t('practical.tapToSeeDetails')}</Text>
          </View>
          <ChevronRight size={20} color="#fff" />
        </Pressable>
      )}

      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>{t('practical.quickAccess')}</Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon={<MapPin size={22} color={Colors.primary} />}
            label={t('practical.veterinarians')}
            onPress={() => navigate("/(tabs)/vets/")}
            color={Colors.primary}
          />
          <QuickAction
            icon={<AlertCircle size={22} color={Colors.error} />}
            label={t('practical.emergencies')}
            onPress={() => navigate("/(tabs)/emergency/")}
            color={Colors.error}
          />
          <QuickAction
            icon={<Heart size={22} color="#E91E63" />}
            label={t('practical.firstAidShort')}
            onPress={() => navigate("/(tabs)/practical/first-aid")}
            color="#E91E63"
          />
          <QuickAction
            icon={<Calculator size={22} color={Colors.info} />}
            label={t('practical.portions')}
            onPress={() => navigate("/(tabs)/practical/food-calculator")}
            color={Colors.info}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('practical.dailyManagement')}</Text>
        
        <FeatureCard
          icon={<Bell size={24} color={Colors.warning} />}
          title={t('practical.remindersAppointments')}
          subtitle={t('practical.upcomingReminders', { count: upcomingCount })}
          badge={overdueCount > 0 ? overdueCount : undefined}
          badgeColor={Colors.error}
          onPress={() => navigate("/(tabs)/practical/reminders")}
          color={Colors.warning}
        />

        <FeatureCard
          icon={<Wallet size={24} color={Colors.success} />}
          title={t('practical.expenseTracking')}
          subtitle={`${totalThisMonth.toFixed(2)}€ ${t('practical.thisMonth')}`}
          onPress={() => navigate("/(tabs)/practical/expenses")}
          color={Colors.success}
        />

        <FeatureCard
          icon={<ShoppingCart size={24} color={Colors.info} />}
          title={t('practical.shoppingListTitle')}
          subtitle={t('practical.itemsToBuy', { count: uncheckedItems.length })}
          badge={uncheckedItems.length > 0 ? uncheckedItems.length : undefined}
          badgeColor={Colors.info}
          onPress={() => navigate("/(tabs)/practical/shopping")}
          color={Colors.info}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('practical.practicalTools')}</Text>

        <FeatureCard
          icon={<Calculator size={24} color="#9C27B0" />}
          title={t('practical.foodCalculatorTitle')}
          subtitle={t('practical.foodCalculatorDesc')}
          onPress={() => navigate("/(tabs)/practical/food-calculator")}
          color="#9C27B0"
        />

        <FeatureCard
          icon={<Plane size={24} color="#00BCD4" />}
          title={t('practical.travelChecklist')}
          subtitle={t('practical.travelChecklistDesc')}
          onPress={() => navigate("/(tabs)/practical/travel")}
          color="#00BCD4"
        />

        <FeatureCard
          icon={<Heart size={24} color="#E91E63" />}
          title={t('practical.firstAidGuide')}
          subtitle={t('practical.firstAidGuideDesc')}
          onPress={() => navigate("/(tabs)/practical/first-aid")}
          color="#E91E63"
        />
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipEmoji}>💡</Text>
        <Text style={styles.tipTitle}>{t('practical.didYouKnow')}</Text>
        <Text style={styles.tipText}>
          {t('practical.waterTip')}
        </Text>
      </View>
      </ScrollView>
    </PremiumGate>
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
