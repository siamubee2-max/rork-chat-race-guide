import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Animated,
} from "react-native";
import {
  Brain,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  TrendingUp,
  Heart,
  Utensils,
  Activity,
  ChevronRight,
  X,
  Zap,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useCats } from "@/context/dogs";
import { useAI, HealthInsight } from "@/context/ai";

const INSIGHT_ICONS = {
  warning: AlertTriangle,
  tip: Lightbulb,
  alert: AlertTriangle,
  positive: CheckCircle,
};

const INSIGHT_COLORS = {
  warning: Colors.warning,
  tip: Colors.info,
  alert: Colors.error,
  positive: Colors.success,
};

const CATEGORY_ICONS = {
  weight: TrendingUp,
  behavior: Activity,
  nutrition: Utensils,
  health: Heart,
  general: Sparkles,
};

export default function InsightsScreen() {
  const { cats } = useCats();
  const { 
    insights, 
    generateHealthInsights, 
    isGeneratingInsights,
    dismissInsight,
  } = useAI();
  
  const [selectedCatId, setSelectedCatId] = useState<string | null>(
    cats.length > 0 ? cats[0].id : null
  );
  const [refreshing, setRefreshing] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const selectedCat = cats.find(c => c.id === selectedCatId);
  const catInsights = selectedCatId 
    ? insights.filter(i => i.catId === selectedCatId)
    : insights;

  const handleGenerateInsights = useCallback(async () => {
    if (!selectedCat) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await generateHealthInsights(selectedCat);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to generate insights:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [selectedCat, generateHealthInsights]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedCat) {
      await handleGenerateInsights();
    }
    setRefreshing(false);
  }, [selectedCat, handleGenerateInsights]);

  const handleDismiss = useCallback(async (insightId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await dismissInsight(insightId);
  }, [dismissInsight]);

  const priorityInsights = catInsights.filter(i => i.priority === "high");
  const otherInsights = catInsights.filter(i => i.priority !== "high");

  const renderInsightCard = (insight: HealthInsight, index: number) => {
    const IconComponent = INSIGHT_ICONS[insight.type];
    const CategoryIcon = CATEGORY_ICONS[insight.category];
    const color = INSIGHT_COLORS[insight.type];

    return (
      <Animated.View
        key={insight.id}
        style={[
          styles.insightCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            borderLeftColor: color,
          },
        ]}
      >
        <View style={styles.insightHeader}>
          <View style={[styles.insightIconContainer, { backgroundColor: color + "20" }]}>
            <IconComponent color={color} size={18} />
          </View>
          <View style={styles.insightTitleContainer}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <View style={styles.categoryBadge}>
              <CategoryIcon color={Colors.textMuted} size={12} />
              <Text style={styles.categoryText}>
                {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismiss(insight.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X color={Colors.textMuted} size={16} />
          </TouchableOpacity>
        </View>
        <Text style={styles.insightDescription}>{insight.description}</Text>
      </Animated.View>
    );
  };

  if (cats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Brain color={Colors.primary} size={48} />
        </View>
        <Text style={styles.emptyTitle}>Aucun chien enregistré</Text>
        <Text style={styles.emptyText}>
          Ajoutez un chien pour recevoir des analyses IA personnalisées sur sa santé et son comportement.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Brain color={Colors.primary} size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Analyses IA</Text>
          <Text style={styles.headerSubtitle}>
            Insights personnalisés pour vos chiens
          </Text>
        </View>
      </View>

      {cats.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catSelector}
          contentContainerStyle={styles.catSelectorContent}
        >
          {cats.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.catPill,
                selectedCatId === cat.id && styles.catPillSelected,
              ]}
              onPress={() => {
                setSelectedCatId(cat.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text
                style={[
                  styles.catPillText,
                  selectedCatId === cat.id && styles.catPillTextSelected,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[
          styles.generateButton,
          isGeneratingInsights && styles.generateButtonDisabled,
        ]}
        onPress={handleGenerateInsights}
        disabled={isGeneratingInsights || !selectedCat}
        activeOpacity={0.8}
      >
        {isGeneratingInsights ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.generateButtonText}>Analyse en cours...</Text>
          </>
        ) : (
          <>
            <Zap color="#fff" size={20} />
            <Text style={styles.generateButtonText}>
              Analyser {selectedCat?.name || ""}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {selectedCat && (
        <View style={styles.dataStatus}>
          <Text style={styles.dataStatusText}>
            📊 {(selectedCat.dailyLogs || []).length} journaux • {(selectedCat.weightHistory || []).length} pesées • {(selectedCat.medicalRecords || []).length} soins
          </Text>
        </View>
      )}

      {priorityInsights.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertTriangle color={Colors.error} size={18} />
            <Text style={styles.sectionTitle}>Priorité haute</Text>
          </View>
          {priorityInsights.map((insight, index) => renderInsightCard(insight, index))}
        </View>
      )}

      {otherInsights.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sparkles color={Colors.primary} size={18} />
            <Text style={styles.sectionTitle}>Recommandations</Text>
          </View>
          {otherInsights.map((insight, index) => renderInsightCard(insight, index))}
        </View>
      )}

      {catInsights.length === 0 && !isGeneratingInsights && (
        <View style={styles.noInsights}>
          <Lightbulb color={Colors.textMuted} size={32} />
          <Text style={styles.noInsightsTitle}>Aucune analyse</Text>
          <Text style={styles.noInsightsText}>
            Appuyez sur le bouton pour générer des insights IA basés sur les données de {selectedCat?.name || "votre chien"}.
          </Text>
        </View>
      )}

      <View style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <Lightbulb color={Colors.accent} size={20} />
        </View>
        <View style={styles.tipContent}>
          <Text style={styles.tipTitle}>Conseil</Text>
          <Text style={styles.tipText}>
            Plus vous ajoutez de données (journaux quotidiens, poids, soins), plus les analyses seront précises et personnalisées.
          </Text>
        </View>
        <ChevronRight color={Colors.textMuted} size={20} />
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
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 20,
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  catSelector: {
    marginBottom: 16,
  },
  catSelectorContent: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  catPillTextSelected: {
    color: "#fff",
  },
  generateButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 12,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  dataStatus: {
    alignItems: "center" as const,
    marginBottom: 20,
  },
  dataStatusText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  insightCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  insightHeader: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 12,
    marginBottom: 10,
  },
  insightIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  insightTitleContainer: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  dismissButton: {
    padding: 4,
  },
  insightDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.textSecondary,
  },
  noInsights: {
    alignItems: "center" as const,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  noInsightsTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  noInsightsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  tipCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.accentMuted,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent + "30",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
  },
});
