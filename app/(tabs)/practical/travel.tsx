import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Check,
  Plane,
  Car,
  FileText,
  Stethoscope,
  Package,
  Utensils,
  Heart,
  RefreshCw,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

type ChecklistSection = {
  id: string;
  title: string;
  icon: typeof Plane;
  color: string;
  items: { id: string; label: string; checked: boolean }[];
};

const INITIAL_CHECKLIST: ChecklistSection[] = [
  {
    id: "documents",
    title: "Documents",
    icon: FileText,
    color: "#2196F3",
    items: [
      { id: "passport", label: "Passeport européen du chien", checked: false },
      { id: "vaccination", label: "Carnet de vaccination à jour", checked: false },
      { id: "chip", label: "Certificat de puce électronique", checked: false },
      { id: "health_cert", label: "Certificat sanitaire (si hors UE)", checked: false },
      { id: "insurance", label: "Attestation d'assurance", checked: false },
    ],
  },
  {
    id: "health",
    title: "Santé",
    icon: Stethoscope,
    color: "#4CAF50",
    items: [
      { id: "vet_visit", label: "Visite vétérinaire avant départ", checked: false },
      { id: "vaccines", label: "Vaccins à jour (rage obligatoire)", checked: false },
      { id: "antiparasite", label: "Traitement antiparasitaire récent", checked: false },
      { id: "medications", label: "Médicaments habituels", checked: false },
      { id: "first_aid", label: "Trousse de premiers soins", checked: false },
    ],
  },
  {
    id: "transport",
    title: "Transport",
    icon: Car,
    color: "#FF9800",
    items: [
      { id: "carrier", label: "Caisse de transport homologuée", checked: false },
      { id: "carrier_label", label: "Étiquette avec coordonnées", checked: false },
      { id: "blanket", label: "Couverture familière dans la caisse", checked: false },
      { id: "harness", label: "Harnais et laisse de sécurité", checked: false },
      { id: "water_bottle", label: "Biberon/gamelle de voyage", checked: false },
    ],
  },
  {
    id: "supplies",
    title: "Équipement",
    icon: Package,
    color: "#9C27B0",
    items: [
      { id: "litter_box", label: "Litière de voyage pliable", checked: false },
      { id: "litter", label: "Litière (quantité suffisante)", checked: false },
      { id: "waste_bags", label: "Sacs pour déchets", checked: false },
      { id: "cleaning", label: "Lingettes nettoyantes", checked: false },
      { id: "toys", label: "Jouets préférés", checked: false },
      { id: "bed", label: "Coussin ou lit familier", checked: false },
    ],
  },
  {
    id: "food",
    title: "Alimentation",
    icon: Utensils,
    color: "#E91E63",
    items: [
      { id: "dry_food", label: "Croquettes habituelles", checked: false },
      { id: "wet_food", label: "Pâtée/sachets fraîcheur", checked: false },
      { id: "treats", label: "Friandises", checked: false },
      { id: "bowls", label: "Gamelles de voyage", checked: false },
      { id: "water", label: "Eau en bouteille", checked: false },
    ],
  },
  {
    id: "comfort",
    title: "Confort & Bien-être",
    icon: Heart,
    color: "#00BCD4",
    items: [
      { id: "pheromones", label: "Spray/diffuseur Feliway", checked: false },
      { id: "calming", label: "Complément calmant naturel", checked: false },
      { id: "familiar_smell", label: "Vêtement avec votre odeur", checked: false },
      { id: "photo", label: "Photo récente du chien", checked: false },
      { id: "contact_vet", label: "Coordonnées vétérinaire sur place", checked: false },
    ],
  },
];

const STORAGE_KEY = "travel_checklist";

export default function TravelScreen() {
  const insets = useSafeAreaInsets();
  const [checklist, setChecklist] = useState<ChecklistSection[]>(INITIAL_CHECKLIST);

  useEffect(() => {
    loadChecklist();
  }, []);

  const loadChecklist = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setChecklist(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load checklist", e);
    }
  };

  const saveChecklist = async (newChecklist: ChecklistSection[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newChecklist));
    } catch (e) {
      console.error("Failed to save checklist", e);
    }
  };

  const toggleItem = (sectionId: string, itemId: string) => {
    const newChecklist = checklist.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          items: section.items.map((item) =>
            item.id === itemId ? { ...item, checked: !item.checked } : item
          ),
        };
      }
      return section;
    });
    setChecklist(newChecklist);
    saveChecklist(newChecklist);
  };

  const resetChecklist = () => {
    setChecklist(INITIAL_CHECKLIST);
    saveChecklist(INITIAL_CHECKLIST);
  };

  const totalItems = checklist.reduce((sum, s) => sum + s.items.length, 0);
  const checkedItems = checklist.reduce(
    (sum, s) => sum + s.items.filter((i) => i.checked).length,
    0
  );
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Plane size={32} color="#00BCD4" />
        </View>
        <Text style={styles.headerTitle}>Checklist voyage</Text>
        <Text style={styles.headerSubtitle}>
          Préparez sereinement vos déplacements avec votre chien
        </Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progression</Text>
          <Pressable style={styles.resetButton} onPress={resetChecklist}>
            <RefreshCw size={16} color={Colors.textMuted} />
            <Text style={styles.resetText}>Réinitialiser</Text>
          </Pressable>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {checkedItems} / {totalItems} éléments ({Math.round(progress)}%)
        </Text>
      </View>

      {checklist.map((section) => {
        const IconComponent = section.icon;
        const sectionChecked = section.items.filter((i) => i.checked).length;
        const allChecked = sectionChecked === section.items.length;

        return (
          <View key={section.id} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: section.color + "20" }]}>
                <IconComponent size={20} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={[styles.sectionBadge, allChecked && styles.sectionBadgeComplete]}>
                <Text style={[styles.sectionBadgeText, allChecked && styles.sectionBadgeTextComplete]}>
                  {sectionChecked}/{section.items.length}
                </Text>
              </View>
            </View>

            <View style={styles.itemsList}>
              {section.items.map((item) => (
                <Pressable
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => toggleItem(section.id, item.id)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      item.checked && { backgroundColor: section.color, borderColor: section.color },
                    ]}
                  >
                    {item.checked && <Check size={14} color="#fff" />}
                  </View>
                  <Text style={[styles.itemLabel, item.checked && styles.itemLabelChecked]}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>✈️ Conseils voyage</Text>
        <Text style={styles.tipItem}>• Habituez votre chien à sa caisse plusieurs jours avant</Text>
        <Text style={styles.tipItem}>• Évitez de nourrir 4h avant un long trajet</Text>
        <Text style={styles.tipItem}>• Faites des pauses toutes les 2h en voiture</Text>
        <Text style={styles.tipItem}>• Gardez la caisse à l&apos;ombre et ventilée</Text>
        <Text style={styles.tipItem}>• Pour l&apos;avion, renseignez-vous sur les règles de la compagnie</Text>
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
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#00BCD420",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  progressCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 6,
  },
  resetText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.success,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  section: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    gap: 10,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: Colors.backgroundSecondary,
  },
  sectionBadgeComplete: {
    backgroundColor: Colors.success + "20",
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  sectionBadgeTextComplete: {
    color: Colors.success,
  },
  itemsList: {
    gap: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  itemLabelChecked: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  tipsCard: {
    backgroundColor: Colors.accentMuted,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.accent + "30",
    gap: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
  },
  tipItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
