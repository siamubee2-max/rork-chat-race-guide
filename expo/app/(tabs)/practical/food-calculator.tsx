import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Scale,
  Activity,
  Heart,
  Zap,
  Info,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

type ActivityLevel = "low" | "normal" | "high";
type LifeStage = "kitten" | "adult" | "senior" | "pregnant";

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; icon: typeof Activity; multiplier: number }[] = [
  { value: "low", label: "Peu actif", icon: Heart, multiplier: 0.9 },
  { value: "normal", label: "Normal", icon: Activity, multiplier: 1.0 },
  { value: "high", label: "Très actif", icon: Zap, multiplier: 1.2 },
];

const LIFE_STAGES: { value: LifeStage; label: string; multiplier: number; description: string }[] = [
  { value: "kitten", label: "Chaton (< 1 an)", multiplier: 1.5, description: "Besoins élevés pour la croissance" },
  { value: "adult", label: "Adulte (1-7 ans)", multiplier: 1.0, description: "Besoins standards" },
  { value: "senior", label: "Senior (> 7 ans)", multiplier: 0.85, description: "Métabolisme ralenti" },
  { value: "pregnant", label: "Gestante/Allaitante", multiplier: 1.5, description: "Besoins énergétiques accrus" },
];

export default function FoodCalculatorScreen() {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState("");
  const [activity, setActivity] = useState<ActivityLevel>("normal");
  const [lifeStage, setLifeStage] = useState<LifeStage>("adult");
  const [isNeutered, setIsNeutered] = useState(true);

  const calculations = useMemo(() => {
    const weightNum = parseFloat(weight.replace(",", "."));
    if (isNaN(weightNum) || weightNum <= 0) return null;

    const activityMultiplier = ACTIVITY_LEVELS.find((a) => a.value === activity)?.multiplier ?? 1;
    const stageMultiplier = LIFE_STAGES.find((s) => s.value === lifeStage)?.multiplier ?? 1;
    const neuteredMultiplier = isNeutered ? 0.9 : 1;

    const baseCalories = 70 * Math.pow(weightNum, 0.75);
    const dailyCalories = Math.round(baseCalories * activityMultiplier * stageMultiplier * neuteredMultiplier);

    const dryFoodGrams = Math.round(dailyCalories / 3.5);
    const wetFoodGrams = Math.round(dailyCalories / 0.85);
    const waterMl = Math.round(weightNum * 50);

    return {
      calories: dailyCalories,
      dryFood: dryFoodGrams,
      wetFood: wetFoodGrams,
      water: waterMl,
    };
  }, [weight, activity, lifeStage, isNeutered]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Scale size={32} color={Colors.primary} />
        </View>
        <Text style={styles.headerTitle}>Calculateur de portions</Text>
        <Text style={styles.headerSubtitle}>
          Estimez les besoins nutritionnels quotidiens de votre chat
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Poids du chat (kg)</Text>
        <View style={styles.weightInputContainer}>
          <TextInput
            style={styles.weightInput}
            value={weight}
            onChangeText={setWeight}
            placeholder="4.5"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            accessibilityRole="text"
            accessibilityLabel="Poids du chat en kilogrammes"
          />
          <Text style={styles.weightUnit}>kg</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stade de vie</Text>
        <View style={styles.stagesGrid}>
          {LIFE_STAGES.map((stage) => (
            <Pressable
              key={stage.value}
              style={[styles.stageButton, lifeStage === stage.value && styles.stageButtonSelected]}
              onPress={() => setLifeStage(stage.value)}
              accessibilityRole="button"
              accessibilityLabel={stage.label}
              accessibilityState={{ selected: lifeStage === stage.value }}
            >
              <Text style={[styles.stageLabel, lifeStage === stage.value && styles.stageLabelSelected]}>
                {stage.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Niveau d&apos;activité</Text>
        <View style={styles.activityRow}>
          {ACTIVITY_LEVELS.map((level) => {
            const IconComponent = level.icon;
            const isSelected = activity === level.value;
            return (
              <Pressable
                key={level.value}
                style={[styles.activityButton, isSelected && styles.activityButtonSelected]}
                onPress={() => setActivity(level.value)}
                accessibilityRole="button"
                accessibilityLabel={level.label}
                accessibilityState={{ selected: isSelected }}
              >
                <IconComponent size={20} color={isSelected ? "#fff" : Colors.textMuted} />
                <Text style={[styles.activityLabel, isSelected && styles.activityLabelSelected]}>
                  {level.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Pressable
          style={[styles.toggleButton, isNeutered && styles.toggleButtonActive]}
          onPress={() => setIsNeutered(!isNeutered)}
          accessibilityRole="button"
          accessibilityLabel="Chat stérilisé ou castré"
          accessibilityState={{ selected: isNeutered }}
        >
          <View style={[styles.toggleIndicator, isNeutered && styles.toggleIndicatorActive]} />
          <Text style={styles.toggleLabel}>Chat stérilisé / castré</Text>
        </Pressable>
      </View>

      {calculations && (
        <View style={styles.resultsSection}>
          <Text style={styles.resultsTitle}>Besoins quotidiens estimés</Text>

          <View style={styles.resultsGrid}>
            <View style={[styles.resultCard, { backgroundColor: "#FF980020" }]}>
              <Text style={styles.resultValue}>{calculations.calories}</Text>
              <Text style={styles.resultLabel}>kcal/jour</Text>
              <Text style={styles.resultDesc}>Énergie</Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: "#4CAF5020" }]}>
              <Text style={styles.resultValue}>{calculations.dryFood}g</Text>
              <Text style={styles.resultLabel}>croquettes</Text>
              <Text style={styles.resultDesc}>~350 kcal/100g</Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: "#2196F320" }]}>
              <Text style={styles.resultValue}>{calculations.wetFood}g</Text>
              <Text style={styles.resultLabel}>pâtée</Text>
              <Text style={styles.resultDesc}>~85 kcal/100g</Text>
            </View>

            <View style={[styles.resultCard, { backgroundColor: "#00BCD420" }]}>
              <Text style={styles.resultValue}>{calculations.water}ml</Text>
              <Text style={styles.resultLabel}>eau</Text>
              <Text style={styles.resultDesc}>Hydratation</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Info size={18} color={Colors.info} />
            <Text style={styles.infoText}>
              Ces valeurs sont des estimations. Consultez votre vétérinaire pour des recommandations personnalisées, 
              surtout si votre chat a des besoins spécifiques.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.tipsSection}>
        <Text style={styles.tipsTitle}>💡 Conseils</Text>
        <View style={styles.tipsList}>
          <Text style={styles.tipItem}>• Divisez la ration en 2-3 repas par jour</Text>
          <Text style={styles.tipItem}>• Mélangez croquettes et pâtée pour varier</Text>
          <Text style={styles.tipItem}>• Changez l&apos;eau fraîche tous les jours</Text>
          <Text style={styles.tipItem}>• Surveillez le poids régulièrement</Text>
          <Text style={styles.tipItem}>• Adaptez si prise/perte de poids</Text>
        </View>
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
    marginBottom: 24,
  },
  headerIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primaryMuted,
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
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
  },
  weightInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    padding: 16,
    textAlign: "center",
  },
  weightUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textMuted,
    paddingRight: 20,
  },
  stagesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stageButton: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
  },
  stageButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "15",
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
  },
  stageLabelSelected: {
    color: Colors.primary,
  },
  activityRow: {
    flexDirection: "row",
    gap: 10,
  },
  activityButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.backgroundCard,
    gap: 6,
  },
  activityButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  activityLabelSelected: {
    color: "#fff",
  },
  toggleButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "10",
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  toggleIndicatorActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 14,
  },
  resultsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  resultCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  resultValue: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  resultDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.info + "15",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tipsSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
