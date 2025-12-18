import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Save, Calendar as CalendarIcon, UtensilsCrossed, Droplets, Activity, Trash } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCats, type DailyLog } from "@/context/cats";
import { generateUUID } from "@/utils/polyfills";
import { useAuth } from "@/context/auth";

type AppetiteLevel = "normal" | "increased" | "decreased" | "none";
type WaterLevel = "normal" | "increased" | "decreased" | "none";
type EnergyLevel = "normal" | "playful" | "lethargic" | "hyperactive";
type LitterStatus = "normal" | "diarrhea" | "constipation" | "blood" | "none";

export default function DailyLogFormScreen() {
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats, updateCat } = useCats();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const hasHealthTracking = React.useMemo(() => {
    if (!currentUser) return false;
    return currentUser.subscriptionTier === 'premium_plus' || currentUser.addOns?.includes('health_tracking');
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

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t("dailyLog.title"),
    });
  }, [navigation, t]);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [appetite, setAppetite] = useState<AppetiteLevel>("normal");
  const [water, setWater] = useState<WaterLevel>("normal");
  const [energy, setEnergy] = useState<EnergyLevel>("normal");
  const [litter, setLitter] = useState<LitterStatus>("normal");
  const [vomiting, setVomiting] = useState(false);
  const [coughing, setCoughing] = useState(false);
  const [sneezing, setSneezing] = useState(false);
  const [scratching, setScratching] = useState(false);
  const [notes, setNotes] = useState("");

  const onSave = async () => {
    if (!cat) return;
    if (!date.trim()) {
      Alert.alert(t("common.error"), t("dailyLog.dateRequired"));
      return;
    }

    const logPayload: DailyLog = {
      id: generateUUID(),
      date: date.trim(),
      appetite,
      water,
      energy,
      litter,
      vomiting,
      coughing,
      sneezing,
      scratching,
      notes: notes.trim() || undefined,
    };

    const updatedLogs = cat.dailyLogs ? [...cat.dailyLogs, logPayload] : [logPayload];
    updatedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      await updateCat({ ...cat, dailyLogs: updatedLogs });
      router.back();
    } catch {
      Alert.alert(t("common.error"), t("dailyLog.saveError"));
    }
  };

  const OptionButton = ({ 
    label, 
    selected, 
    onPress, 
    color 
  }: { 
    label: string; 
    selected: boolean; 
    onPress: () => void; 
    color?: string;
  }) => (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionBtn,
        selected && styles.optionBtnSelected,
        selected && color && { backgroundColor: color, borderColor: color }
      ]}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{label}</Text>
    </Pressable>
  );

  const SymptomToggle = ({ 
    label, 
    icon: Icon, 
    active, 
    onToggle 
  }: { 
    label: string; 
    icon: any; 
    active: boolean; 
    onToggle: () => void;
  }) => (
    <Pressable
      onPress={onToggle}
      style={[styles.symptomBtn, active && styles.symptomBtnActive]}
    >
      <Icon size={20} color={active ? "#fff" : "#666"} />
      <Text style={[styles.symptomText, active && styles.symptomTextActive]}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t("dailyLog.date")}</Text>
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

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <UtensilsCrossed size={20} color="#FF9500" />
                <Text style={styles.sectionTitle}>Appétit</Text>
              </View>
              <View style={styles.optionsRow}>
                <OptionButton label="Normal" selected={appetite === "normal"} onPress={() => setAppetite("normal")} />
                <OptionButton label="Augmenté" selected={appetite === "increased"} onPress={() => setAppetite("increased")} color="#34C759" />
                <OptionButton label="Diminué" selected={appetite === "decreased"} onPress={() => setAppetite("decreased")} color="#FF9500" />
                <OptionButton label="Aucun" selected={appetite === "none"} onPress={() => setAppetite("none")} color="#FF3B30" />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Droplets size={20} color="#007AFF" />
                <Text style={styles.sectionTitle}>Hydratation</Text>
              </View>
              <View style={styles.optionsRow}>
                <OptionButton label="Normale" selected={water === "normal"} onPress={() => setWater("normal")} />
                <OptionButton label="Augmentée" selected={water === "increased"} onPress={() => setWater("increased")} color="#34C759" />
                <OptionButton label="Diminuée" selected={water === "decreased"} onPress={() => setWater("decreased")} color="#FF9500" />
                <OptionButton label="Aucune" selected={water === "none"} onPress={() => setWater("none")} color="#FF3B30" />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Activity size={20} color="#34C759" />
                <Text style={styles.sectionTitle}>Niveau d&apos;énergie</Text>
              </View>
              <View style={styles.optionsRow}>
                <OptionButton label="Normal" selected={energy === "normal"} onPress={() => setEnergy("normal")} />
                <OptionButton label="Joueur" selected={energy === "playful"} onPress={() => setEnergy("playful")} color="#34C759" />
                <OptionButton label="Léthargique" selected={energy === "lethargic"} onPress={() => setEnergy("lethargic")} color="#FF3B30" />
                <OptionButton label="Hyperactif" selected={energy === "hyperactive"} onPress={() => setEnergy("hyperactive")} color="#FF9500" />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Trash size={20} color="#8E8E93" />
                <Text style={styles.sectionTitle}>Litière</Text>
              </View>
              <View style={styles.optionsRow}>
                <OptionButton label="Normal" selected={litter === "normal"} onPress={() => setLitter("normal")} />
                <OptionButton label="Diarrhée" selected={litter === "diarrhea"} onPress={() => setLitter("diarrhea")} color="#FF9500" />
                <OptionButton label="Constipation" selected={litter === "constipation"} onPress={() => setLitter("constipation")} color="#FF9500" />
                <OptionButton label="Sang" selected={litter === "blood"} onPress={() => setLitter("blood")} color="#FF3B30" />
                <OptionButton label="Aucun" selected={litter === "none"} onPress={() => setLitter("none")} color="#8E8E93" />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptômes</Text>
              <View style={styles.symptomsGrid}>
                <SymptomToggle label="Vomissements" icon={Activity} active={vomiting} onToggle={() => setVomiting(!vomiting)} />
                <SymptomToggle label="Toux" icon={Activity} active={coughing} onToggle={() => setCoughing(!coughing)} />
                <SymptomToggle label="Éternuements" icon={Activity} active={sneezing} onToggle={() => setSneezing(!sneezing)} />
                <SymptomToggle label="Grattage" icon={Activity} active={scratching} onToggle={() => setScratching(!scratching)} />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes additionnelles</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Comportements, observations..."
                placeholderTextColor="#999"
                multiline
              />
            </View>

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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  optionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionBtnSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  optionTextSelected: {
    color: "#fff",
  },
  symptomsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  symptomBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F2F2F7",
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  symptomBtnActive: {
    backgroundColor: "#FF3B30",
    borderColor: "#FF3B30",
  },
  symptomText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  symptomTextActive: {
    color: "#fff",
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
});
