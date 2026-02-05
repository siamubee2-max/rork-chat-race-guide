import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Save, Trash2, Calendar as CalendarIcon } from "lucide-react-native";
import { useCats, type WeightEntry } from "@/context/cats";
import { generateUUID } from "@/utils/polyfills";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";

export default function WeightFormScreen() {
  const { catId, weightId } = useLocalSearchParams<{ catId: string; weightId?: string }>();
  const { cats, updateCat } = useCats();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const hasHealthTracking = React.useMemo(() => {
    if (!currentUser) return false;
    return currentUser.subscriptionTier === 'premium_plus';
  }, [currentUser]);

  React.useEffect(() => {
    if (!hasHealthTracking) {
      Alert.alert(
        t('subscription.features.healthTracking'),
        t('subscription.addOns.healthTrackingDesc'),
        [
          { text: t('common.cancel'), style: 'cancel', onPress: () => router.back() },
          {
            text: t('subscription.subscribe'),
            onPress: () => {
              router.back();
              setTimeout(() => router.push('/(tabs)/subscription' as any), 100);
            },
          }
        ]
      );
    }
  }, [hasHealthTracking, t]);

  const cat = cats.find((c) => c.id === catId);
  const existingWeight = cat?.weightHistory?.find((w) => w.id === weightId);
  const isEditing = !!weightId;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Modifier le poids" : "Ajouter une pesée",
    });
  }, [isEditing, navigation]);

  const [weight, setWeight] = useState(existingWeight?.weight.toString() ?? "");
  const [unit, setUnit] = useState<"kg" | "lb">(existingWeight?.unit ?? "kg");
  const [date, setDate] = useState(existingWeight?.date ?? new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState(existingWeight?.notes ?? "");

  useEffect(() => {
    if (existingWeight) {
      setWeight(existingWeight.weight.toString());
      setUnit(existingWeight.unit);
      setDate(existingWeight.date);
      setNotes(existingWeight.notes ?? "");
    }
  }, [existingWeight]);

  const onSave = async () => {
    if (!cat) return;
    if (!weight.trim()) {
      Alert.alert("Erreur", "Le poids est obligatoire");
      return;
    }
    if (!date.trim()) {
      Alert.alert("Erreur", "La date est obligatoire");
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      Alert.alert("Erreur", "Le poids doit être un nombre positif");
      return;
    }

    const weightPayload: WeightEntry = {
      id: isEditing && weightId ? weightId : generateUUID(),
      weight: weightValue,
      unit,
      date: date.trim(),
      notes: notes.trim() || undefined,
    };

    let updatedWeights = cat.weightHistory ? [...cat.weightHistory] : [];

    if (isEditing) {
      updatedWeights = updatedWeights.map((w) => (w.id === weightPayload.id ? weightPayload : w));
    } else {
      updatedWeights.push(weightPayload);
    }

    updatedWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      await updateCat({ ...cat, weightHistory: updatedWeights });
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder");
    }
  };

  const onDelete = async () => {
    if (!cat || !weightId) return;
    
    Alert.alert(
      "Supprimer",
      "Êtes-vous sûr de vouloir supprimer cette pesée ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedWeights = (cat.weightHistory ?? []).filter((w) => w.id !== weightId);
              await updateCat({ ...cat, weightHistory: updatedWeights });
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Poids *</Text>
              <View style={styles.weightRow}>
                <TextInput
                  style={[styles.input, styles.weightInput]}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Ex: 4.5"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                />
                <View style={styles.unitSelector}>
                  <Pressable
                    onPress={() => setUnit("kg")}
                    style={[styles.unitBtn, unit === "kg" && styles.unitBtnSelected]}
                  >
                    <Text style={[styles.unitText, unit === "kg" && styles.unitTextSelected]}>kg</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setUnit("lb")}
                    style={[styles.unitBtn, unit === "lb" && styles.unitBtnSelected]}
                  >
                    <Text style={[styles.unitText, unit === "lb" && styles.unitTextSelected]}>lb</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date *</Text>
              <View style={styles.dateContainer}>
                <CalendarIcon size={18} color="#666" style={styles.dateIcon} />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Observations, contexte..."
                placeholderTextColor="#999"
                multiline
              />
            </View>

            {isEditing && (
              <Pressable onPress={onDelete} style={styles.deleteBtn}>
                <Trash2 color="#FF3B30" size={20} />
                <Text style={styles.deleteText}>Supprimer cette pesée</Text>
              </Pressable>
            )}

          </ScrollView>
        </KeyboardAvoidingView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Pressable onPress={onSave} style={styles.saveBtn}>
            <Save color="#fff" size={20} />
            <Text style={styles.saveText}>Enregistrer</Text>
          </Pressable>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  weightRow: {
    flexDirection: "row",
    gap: 12,
  },
  weightInput: {
    flex: 1,
  },
  unitSelector: {
    flexDirection: "row",
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  unitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  unitBtnSelected: {
    backgroundColor: "#fff",
  },
  unitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  unitTextSelected: {
    color: "#111",
  },
  dateContainer: {
    position: "relative",
  },
  dateIcon: {
    position: "absolute",
    left: 12,
    top: 15,
    zIndex: 1,
  },
  dateInput: {
    paddingLeft: 40,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  saveBtn: {
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    padding: 16,
    backgroundColor: "#FFF0F0",
    borderRadius: 16,
  },
  deleteText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});
