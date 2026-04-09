import React, { useState, useEffect } from "react";
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
import { , useLocalSearchParams } from "expo-router";
import { navigate, navigateWithParams, navigateReplace } from "@/utils/navigate";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Save, Trash2, Calendar as CalendarIcon, Syringe, Stethoscope, Pill, HeartPulse, Bug } from "lucide-react-native";
import { useCats, MedicalRecordType, MedicalRecord } from "@/context/cats";
import { generateUUID } from "@/utils/polyfills";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";

export default function RecordFormScreen() {
  const { catId, recordId } = useLocalSearchParams<{ catId: string; recordId: string }>();
  const { cats, updateCat } = useCats();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();

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
              setTimeout(() => navigate('/(tabs)/subscription'), 100);
            },
          }
        ]
      );
    }
  }, [hasHealthTracking, t]);

  const cat = cats.find((c) => c.id === catId);
  const existingRecord = cat?.medicalRecords?.find((r) => r.id === recordId);
  const isEditing = !!recordId;

  const [type, setType] = useState<MedicalRecordType>(existingRecord?.type ?? "vaccine");
  const [title, setTitle] = useState(existingRecord?.title ?? "");
  const [date, setDate] = useState(existingRecord?.date ?? new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState(existingRecord?.nextDueDate ?? "");
  const [vetName, setVetName] = useState(existingRecord?.vetName ?? "");
  const [notes, setNotes] = useState(existingRecord?.notes ?? "");

  useEffect(() => {
    if (existingRecord) {
      setType(existingRecord.type);
      setTitle(existingRecord.title);
      setDate(existingRecord.date);
      setNextDueDate(existingRecord.nextDueDate ?? "");
      setVetName(existingRecord.vetName ?? "");
      setNotes(existingRecord.notes ?? "");
    }
  }, [existingRecord]);

  const onSave = async () => {
    if (!cat) return;
    if (!title.trim()) {
      Alert.alert("Erreur", "Le titre est obligatoire");
      return;
    }
    if (!date.trim()) {
      Alert.alert("Erreur", "La date est obligatoire");
      return;
    }

    const recordPayload: MedicalRecord = {
      id: isEditing && recordId ? recordId : generateUUID(),
      type,
      title: title.trim(),
      date: date.trim(),
      nextDueDate: nextDueDate.trim() || undefined,
      vetName: vetName.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    let updatedRecords = cat.medicalRecords ? [...cat.medicalRecords] : [];

    if (isEditing) {
      updatedRecords = updatedRecords.map((r) => (r.id === recordPayload.id ? recordPayload : r));
    } else {
      updatedRecords.push(recordPayload);
    }

    // Sort by date descending
    updatedRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      await updateCat({ ...cat, medicalRecords: updatedRecords });
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder");
    }
  };

  const onDelete = async () => {
    if (!cat || !recordId) return;
    
    Alert.alert(
      "Supprimer",
      "Êtes-vous sûr de vouloir supprimer cet enregistrement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              const updatedRecords = (cat.medicalRecords ?? []).filter((r) => r.id !== recordId);
              await updateCat({ ...cat, medicalRecords: updatedRecords });
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer");
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (t: MedicalRecordType) => {
    switch (t) {
      case "vaccine": return "Vaccin";
      case "operation": return "Opération";
      case "medication": return "Médicament";
      case "care": return "Soin";
      case "parasite": return "Antiparasitaire";
    }
  };

  const getTypeIcon = (t: MedicalRecordType, selected: boolean) => {
    const color = selected ? "#fff" : "#666";
    switch (t) {
      case "vaccine": return <Syringe size={20} color={color} />;
      case "operation": return <Stethoscope size={20} color={color} />;
      case "medication": return <Pill size={20} color={color} />;
      case "care": return <HeartPulse size={20} color={color} />;
      case "parasite": return <Bug size={20} color={color} />;
    }
  };

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
          
          <Text style={styles.sectionTitle}>Type d&apos;enregistrement</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {(["vaccine", "medication", "parasite", "operation", "care"] as MedicalRecordType[]).map((t) => (
              <Pressable
                key={t}
                onPress={() => setType(t)}
                style={[styles.typeOption, type === t && styles.typeOptionSelected]}
              >
                {getTypeIcon(t, type === t)}
                <Text style={[styles.typeText, type === t && styles.typeTextSelected]}>
                  {getTypeLabel(t)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Titre *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder={type === "vaccine" ? "Ex: Rage + Typhus" : type === "parasite" ? "Ex: Vermifuge, Anti-puces" : "Ex: Consultation annuelle"}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1 }]}>
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

            <View style={[styles.formGroup, { flex: 1 }]}>
              <Text style={styles.label}>Prochain RDV</Text>
               <View style={styles.dateContainer}>
                <CalendarIcon size={18} color="#666" style={styles.dateIcon} />
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  value={nextDueDate}
                  onChangeText={setNextDueDate}
                  placeholder="Optionnel"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Vétérinaire / Clinique</Text>
            <TextInput
              style={styles.input}
              value={vetName}
              onChangeText={setVetName}
              placeholder="Ex: Dr. Martin"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Observations, dosage, etc."
              placeholderTextColor="#999"
              multiline
            />
          </View>

          {isEditing && (
            <Pressable onPress={onDelete} style={styles.deleteBtn}>
              <Trash2 color="#FF3B30" size={20} />
              <Text style={styles.deleteText}>Supprimer cet enregistrement</Text>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
    marginLeft: 4,
  },
  typeSelector: {
    flexDirection: "row",
    marginBottom: 24,
    // paddingBottom: 8,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  typeOptionSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  typeText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },
  typeTextSelected: {
    color: "#fff",
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 16,
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
  dateContainer: {
    position: 'relative',
  },
  dateIcon: {
    position: 'absolute',
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
