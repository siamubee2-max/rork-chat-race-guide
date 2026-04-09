import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { router , useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Check,
  Calendar,
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
import { useExpenses, type ExpenseCategory } from "@/context/expenses";
import { useCats } from "@/context/cats";

const CATEGORIES: { value: ExpenseCategory; label: string; icon: typeof ShoppingBag; color: string }[] = [
  { value: "food", label: "Nourriture", icon: ShoppingBag, color: "#4CAF50" },
  { value: "vet", label: "Vétérinaire", icon: Stethoscope, color: "#9C27B0" },
  { value: "medication", label: "Médicaments", icon: Pill, color: "#2196F3" },
  { value: "litter", label: "Litière", icon: Box, color: "#795548" },
  { value: "accessories", label: "Accessoires", icon: Box, color: "#FF9800" },
  { value: "grooming", label: "Toilettage", icon: Scissors, color: "#E91E63" },
  { value: "toys", label: "Jouets", icon: Gamepad2, color: "#FF5722" },
  { value: "boarding", label: "Pension", icon: Hotel, color: "#00BCD4" },
  { value: "insurance", label: "Assurance", icon: Shield, color: "#607D8B" },
  { value: "other", label: "Autre", icon: CircleDot, color: Colors.textMuted },
];

export default function ExpenseFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addExpense } = useExpenses();
  const { cats } = useCats();

  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedCat = cats.find((c) => c.id === selectedCatId);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un titre");
      return;
    }

    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      catId: selectedCatId || undefined,
      catName: selectedCat?.name,
      category,
      title: title.trim(),
      amount: parsedAmount,
      currency: "EUR",
      date: date.toISOString(),
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await addExpense(newExpense);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Catégorie</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((item) => {
              const IconComponent = item.icon;
              const isSelected = category === item.value;
              return (
                <Pressable
                  key={item.value}
                  style={[
                    styles.categoryButton,
                    isSelected && { backgroundColor: item.color + "20", borderColor: item.color },
                  ]}
                  onPress={() => setCategory(item.value)}
                >
                  <IconComponent size={18} color={isSelected ? item.color : Colors.textMuted} />
                  <Text style={[styles.categoryLabel, isSelected && { color: item.color }]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Titre *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Croquettes Royal Canin"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Montant (€) *</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
          />
        </View>

        {cats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chat concerné (optionnel)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catsScroll}>
              <Pressable
                style={[styles.catChip, !selectedCatId && styles.catChipSelected]}
                onPress={() => setSelectedCatId(null)}
              >
                <Text style={[styles.catChipText, !selectedCatId && styles.catChipTextSelected]}>
                  Tous
                </Text>
              </Pressable>
              {cats.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[styles.catChip, selectedCatId === cat.id && styles.catChipSelected]}
                  onPress={() => setSelectedCatId(cat.id)}
                >
                  <Text style={[styles.catChipText, selectedCatId === cat.id && styles.catChipTextSelected]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date</Text>
          <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Calendar size={20} color={Colors.primary} />
            <Text style={styles.dateText}>
              {date.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Pressable>
          {(showDatePicker || Platform.OS === "web") && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
              maximumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Détails supplémentaires..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
          onPress={handleSave}
        >
          <Check size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Ajouter la dépense</Text>
        </Pressable>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  amountInput: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  catsScroll: {
    marginHorizontal: -4,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    marginHorizontal: 4,
  },
  catChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  catChipTextSelected: {
    color: "#fff",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateText: {
    fontSize: 15,
    color: Colors.text,
    textTransform: "capitalize",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.success,
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
