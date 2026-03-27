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
  Trash2,
  TrendingUp,
  ShoppingBag,
  Stethoscope,
  Pill,
  Scissors,
  Hotel,
  Shield,
  Box,
  Gamepad2,
  CircleDot,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useExpenses, type Expense, type ExpenseCategory } from "@/context/expenses";

const CATEGORY_INFO: Record<ExpenseCategory, { icon: typeof ShoppingBag; color: string; label: string }> = {
  food: { icon: ShoppingBag, color: "#4CAF50", label: "Nourriture" },
  vet: { icon: Stethoscope, color: "#9C27B0", label: "Vétérinaire" },
  medication: { icon: Pill, color: "#2196F3", label: "Médicaments" },
  accessories: { icon: Box, color: "#FF9800", label: "Accessoires" },
  grooming: { icon: Scissors, color: "#E91E63", label: "Toilettage" },
  boarding: { icon: Hotel, color: "#00BCD4", label: "Pension" },
  insurance: { icon: Shield, color: "#607D8B", label: "Assurance" },
  litter: { icon: Box, color: "#795548", label: "Litière" },
  toys: { icon: Gamepad2, color: "#FF5722", label: "Jouets" },
  other: { icon: CircleDot, color: Colors.textMuted, label: "Autre" },
};

type ExpenseCardProps = {
  expense: Expense;
  onDelete: () => void;
};

const ExpenseCard = ({ expense, onDelete }: ExpenseCardProps) => {
  const categoryInfo = CATEGORY_INFO[expense.category];
  const IconComponent = categoryInfo.icon;
  const date = new Date(expense.date);
  const formattedDate = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });

  return (
    <View style={styles.expenseCard}>
      <View style={[styles.categoryIcon, { backgroundColor: categoryInfo.color + "20" }]}>
        <IconComponent size={20} color={categoryInfo.color} />
      </View>

      <View style={styles.expenseContent}>
        <Text style={styles.expenseTitle}>{expense.title}</Text>
        <View style={styles.expenseMeta}>
          <Text style={styles.categoryLabel}>{categoryInfo.label}</Text>
          {expense.catName && <Text style={styles.catName}>• {expense.catName}</Text>}
        </View>
        <Text style={styles.expenseDate}>{formattedDate}</Text>
      </View>

      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>{expense.amount.toFixed(2)}€</Text>
        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]}
          onPress={onDelete}
        >
          <Trash2 size={16} color={Colors.error} />
        </Pressable>
      </View>
    </View>
  );
};

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { expenses, totalThisMonth, totalThisYear, totalByCategory, deleteExpense } = useExpenses();
  const [selectedPeriod, setSelectedPeriod] = useState<"month" | "year">("month");

  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const topCategories = Object.entries(totalByCategory)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const handleDelete = (expense: Expense) => {
    Alert.alert(
      "Supprimer la dépense",
      `Voulez-vous supprimer "${expense.title}" (${expense.amount.toFixed(2)}€) ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteExpense(expense.id),
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
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <TrendingUp size={24} color={Colors.success} />
            <View style={styles.periodToggle}>
              <Pressable
                style={[styles.periodButton, selectedPeriod === "month" && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod("month")}
              >
                <Text style={[styles.periodText, selectedPeriod === "month" && styles.periodTextActive]}>
                  Ce mois
                </Text>
              </Pressable>
              <Pressable
                style={[styles.periodButton, selectedPeriod === "year" && styles.periodButtonActive]}
                onPress={() => setSelectedPeriod("year")}
              >
                <Text style={[styles.periodText, selectedPeriod === "year" && styles.periodTextActive]}>
                  Cette année
                </Text>
              </Pressable>
            </View>
          </View>
          <Text style={styles.totalAmount}>
            {(selectedPeriod === "month" ? totalThisMonth : totalThisYear).toFixed(2)}€
          </Text>
          <Text style={styles.totalLabel}>
            Total des dépenses {selectedPeriod === "month" ? "ce mois" : "cette année"}
          </Text>
        </View>

        {topCategories.length > 0 && (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Répartition</Text>
            <View style={styles.categoriesGrid}>
              {topCategories.map(([category, amount]) => {
                const info = CATEGORY_INFO[category as ExpenseCategory];
                const IconComponent = info.icon;
                const total = selectedPeriod === "month" ? totalThisMonth : totalThisYear;
                const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
                return (
                  <View key={category} style={styles.categoryCard}>
                    <View style={[styles.categoryIconSmall, { backgroundColor: info.color + "20" }]}>
                      <IconComponent size={18} color={info.color} />
                    </View>
                    <Text style={styles.categoryName}>{info.label}</Text>
                    <Text style={styles.categoryAmount}>{amount.toFixed(0)}€</Text>
                    <Text style={styles.categoryPercent}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>Historique</Text>
          {sortedExpenses.length > 0 ? (
            sortedExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onDelete={() => handleDelete(expense)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Aucune dépense enregistrée</Text>
              <Text style={styles.emptySubtext}>
                Commencez à suivre vos dépenses pour votre chat
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.95 }] }]}
          onPress={() => router.push("/(tabs)/practical/expense-form" as any)}
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
  summaryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  periodToggle: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 10,
    padding: 3,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: Colors.backgroundCard,
  },
  periodText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  periodTextActive: {
    color: Colors.text,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: "800",
    color: Colors.text,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  categoriesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryCard: {
    width: "48%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  categoryPercent: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  listSection: {
    marginBottom: 20,
  },
  expenseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  expenseContent: {
    flex: 1,
  },
  expenseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  expenseMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  catName: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  expenseDate: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  expenseRight: {
    alignItems: "flex-end",
    gap: 8,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: "center",
    padding: 30,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  fabContainer: {
    position: "absolute",
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
