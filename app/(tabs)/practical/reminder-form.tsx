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
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Bell,
  Syringe,
  Pill,
  Calendar,
  Scissors,
  Bug,
  ShoppingBag,
  Cat,
  Check,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useReminders, type ReminderType, type ReminderFrequency } from "@/context/reminders";
import { useCats } from "@/context/dogs";

const REMINDER_TYPES: { type: ReminderType; label: string; icon: typeof Bell; color: string }[] = [
  { type: "vaccine", label: "Vaccin", icon: Syringe, color: "#4CAF50" },
  { type: "medication", label: "Médicament", icon: Pill, color: "#2196F3" },
  { type: "vet_appointment", label: "RDV Véto", icon: Calendar, color: "#9C27B0" },
  { type: "grooming", label: "Toilettage", icon: Scissors, color: "#FF9800" },
  { type: "deworming", label: "Vermifuge", icon: Bug, color: "#795548" },
  { type: "flea_treatment", label: "Anti-puces", icon: Bug, color: "#607D8B" },
  { type: "food", label: "Nourriture", icon: ShoppingBag, color: "#E91E63" },
  { type: "litter", label: "Litière", icon: Cat, color: "#00BCD4" },
  { type: "other", label: "Autre", icon: Bell, color: Colors.textMuted },
];

const FREQUENCIES: { value: ReminderFrequency; label: string }[] = [
  { value: "once", label: "Une fois" },
  { value: "daily", label: "Quotidien" },
  { value: "weekly", label: "Hebdomadaire" },
  { value: "monthly", label: "Mensuel" },
  { value: "yearly", label: "Annuel" },
];

export default function ReminderFormScreen() {
  const insets = useSafeAreaInsets();
  const { addReminder } = useReminders();
  const { cats } = useCats();

  const [type, setType] = useState<ReminderType>("vaccine");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [frequency, setFrequency] = useState<ReminderFrequency>("once");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const selectedCat = cats.find((c) => c.id === selectedCatId);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un titre pour le rappel");
      return;
    }

    const newReminder = {
      id: Date.now().toString(),
      catId: selectedCatId || undefined,
      catName: selectedCat?.name,
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate.toISOString(),
      frequency,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await addReminder(newReminder);
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de rappel</Text>
          <View style={styles.typesGrid}>
            {REMINDER_TYPES.map((item) => {
              const IconComponent = item.icon;
              const isSelected = type === item.type;
              return (
                <Pressable
                  key={item.type}
                  style={[
                    styles.typeButton,
                    isSelected && { backgroundColor: item.color + "20", borderColor: item.color },
                  ]}
                  onPress={() => setType(item.type)}
                >
                  <IconComponent size={20} color={isSelected ? item.color : Colors.textMuted} />
                  <Text style={[styles.typeLabel, isSelected && { color: item.color }]}>
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
            placeholder="Ex: Vaccin rage + typhus"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description (optionnel)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Notes supplémentaires..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
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
              {dueDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </Pressable>
          {(showDatePicker || Platform.OS === "web") && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
              minimumDate={new Date()}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Répétition</Text>
          <View style={styles.frequencyRow}>
            {FREQUENCIES.map((freq) => (
              <Pressable
                key={freq.value}
                style={[styles.freqButton, frequency === freq.value && styles.freqButtonSelected]}
                onPress={() => setFrequency(freq.value)}
              >
                <Text style={[styles.freqText, frequency === freq.value && styles.freqTextSelected]}>
                  {freq.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
          onPress={handleSave}
        >
          <Check size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Créer le rappel</Text>
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
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  typeLabel: {
    fontSize: 13,
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
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  freqButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  freqButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  freqText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  freqTextSelected: {
    color: "#fff",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary,
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
