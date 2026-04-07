import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Plus,
  Bell,
  Check,
  Trash2,
  Calendar,
  Syringe,
  Pill,
  Scissors,
  Bug,
  ShoppingBag,
  Cat,
  Clock,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useReminders, type Reminder, type ReminderType } from "@/context/reminders";

const REMINDER_ICONS: Record<ReminderType, { icon: typeof Bell; color: string }> = {
  vaccine: { icon: Syringe, color: "#4CAF50" },
  medication: { icon: Pill, color: "#2196F3" },
  vet_appointment: { icon: Calendar, color: "#9C27B0" },
  grooming: { icon: Scissors, color: "#FF9800" },
  deworming: { icon: Bug, color: "#795548" },
  flea_treatment: { icon: Bug, color: "#607D8B" },
  food: { icon: ShoppingBag, color: "#E91E63" },
  litter: { icon: Cat, color: "#00BCD4" },
  other: { icon: Bell, color: Colors.textMuted },
};

const REMINDER_LABELS: Record<ReminderType, string> = {
  vaccine: "Vaccin",
  medication: "Médicament",
  vet_appointment: "RDV Vétérinaire",
  grooming: "Toilettage",
  deworming: "Vermifuge",
  flea_treatment: "Anti-puces",
  food: "Nourriture",
  litter: "Litière",
  other: "Autre",
};

type ReminderCardProps = {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
  isOverdue: boolean;
};

const ReminderCard = ({ reminder, onToggle, onDelete, isOverdue }: ReminderCardProps) => {
  const iconInfo = REMINDER_ICONS[reminder.type];
  const IconComponent = iconInfo.icon;
  const date = new Date(reminder.dueDate);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });

  return (
    <View style={[styles.reminderCard, reminder.completed && styles.reminderCardCompleted]}>
      <Pressable
        style={({ pressed }) => [
          styles.checkButton,
          reminder.completed && styles.checkButtonChecked,
          pressed && { opacity: 0.7 },
        ]}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={reminder.completed ? `Marquer "${reminder.title}" comme non terminé` : `Marquer "${reminder.title}" comme terminé`}
        accessibilityState={{ checked: reminder.completed }}
      >
        {reminder.completed && <Check size={16} color="#fff" />}
      </Pressable>

      <View style={styles.reminderContent}>
        <View style={styles.reminderHeader}>
          <View style={[styles.typeIcon, { backgroundColor: iconInfo.color + "20" }]}>
            <IconComponent size={16} color={iconInfo.color} />
          </View>
          <Text style={styles.typeLabel}>{REMINDER_LABELS[reminder.type]}</Text>
          {isOverdue && !reminder.completed && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueText}>En retard</Text>
            </View>
          )}
        </View>

        <Text style={[styles.reminderTitle, reminder.completed && styles.reminderTitleCompleted]}>
          {reminder.title}
        </Text>

        {reminder.catName && (
          <Text style={styles.catName}>🐱 {reminder.catName}</Text>
        )}

        <View style={styles.dateRow}>
          <Clock size={14} color={isOverdue && !reminder.completed ? Colors.error : Colors.textMuted} />
          <Text style={[styles.dateText, isOverdue && !reminder.completed && styles.dateTextOverdue]}>
            {formattedDate}
          </Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={`Supprimer le rappel "${reminder.title}"`}
      >
        <Trash2 size={18} color={Colors.error} />
      </Pressable>
    </View>
  );
};

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const { reminders, overdueReminders, upcomingReminders, toggleComplete, deleteReminder } = useReminders();
  const [showCompleted, setShowCompleted] = useState(false);

  const completedReminders = reminders.filter((r) => r.completed);

  const handleDelete = (reminder: Reminder) => {
    Alert.alert(
      "Supprimer le rappel",
      `Voulez-vous supprimer "${reminder.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteReminder(reminder.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {overdueReminders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠️ En retard</Text>
              <Text style={styles.sectionCount}>{overdueReminders.length}</Text>
            </View>
            {overdueReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={() => toggleComplete(reminder.id)}
                onDelete={() => handleDelete(reminder)}
                isOverdue={true}
              />
            ))}
          </View>
        )}

        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📅 À venir</Text>
              <Text style={styles.sectionCount}>{upcomingReminders.length}</Text>
            </View>
            {upcomingReminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onToggle={() => toggleComplete(reminder.id)}
                onDelete={() => handleDelete(reminder)}
                isOverdue={false}
              />
            ))}
          </View>
        )}

        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.sectionHeader}
              onPress={() => setShowCompleted(!showCompleted)}
              accessibilityRole="button"
              accessibilityLabel={showCompleted ? "Masquer les rappels terminés" : `Afficher les rappels terminés (${completedReminders.length})`}
              accessibilityState={{ expanded: showCompleted }}
            >
              <Text style={styles.sectionTitle}>✅ Terminés</Text>
              <Text style={styles.sectionCount}>
                {showCompleted ? "Masquer" : completedReminders.length}
              </Text>
            </Pressable>
            {showCompleted &&
              completedReminders.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onToggle={() => toggleComplete(reminder.id)}
                  onDelete={() => handleDelete(reminder)}
                  isOverdue={false}
                />
              ))}
          </View>
        )}

        {reminders.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Bell size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>Aucun rappel</Text>
            <Text style={styles.emptyText}>
              Créez des rappels pour ne jamais oublier les vaccins, médicaments ou rendez-vous de votre chat
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={() => router.push("/(tabs)/practical/reminder-form" as any)}
          accessibilityRole="button"
          accessibilityLabel="Ajouter un rappel"
          accessibilityHint="Ouvre le formulaire de création de rappel"
        >
          <Plus size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  reminderCardCompleted: {
    opacity: 0.6,
  },
  checkButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkButtonChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  reminderContent: {
    flex: 1,
  },
  reminderHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  overdueBadge: {
    backgroundColor: Colors.error + "20",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  overdueText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.error,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  reminderTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  catName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  dateTextOverdue: {
    color: Colors.error,
    fontWeight: "600",
  },
  deleteButton: {
    padding: 6,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
