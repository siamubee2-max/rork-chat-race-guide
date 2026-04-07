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
  Activity,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ChevronRight,
  BarChart3,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/colors";
import { useCats } from "@/context/cats";
import { useAI, BehaviorPattern } from "@/context/ai";

const SENTIMENT_CONFIG = {
  positive: { color: Colors.success, icon: CheckCircle, label: "Positif" },
  neutral: { color: Colors.info, icon: Activity, label: "Neutre" },
  concerning: { color: Colors.warning, icon: AlertCircle, label: "À surveiller" },
};

const FREQUENCY_LABELS = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  occasional: "Occasionnel",
};

export default function BehaviorScreen() {
  const { cats } = useCats();
  const { 
    patterns, 
    analyzeBehavior, 
    isAnalyzingBehavior,
    getPatternsForCat,
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
  const catPatterns = selectedCatId ? getPatternsForCat(selectedCatId) : patterns;

  const handleAnalyze = useCallback(async () => {
    if (!selectedCat) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await analyzeBehavior(selectedCat);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to analyze behavior:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [selectedCat, analyzeBehavior]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (selectedCat) {
      await handleAnalyze();
    }
    setRefreshing(false);
  }, [selectedCat, handleAnalyze]);

  const logsCount = selectedCat?.dailyLogs?.length || 0;
  const canAnalyze = logsCount >= 3;

  const renderPatternCard = (pattern: BehaviorPattern, index: number) => {
    const config = SENTIMENT_CONFIG[pattern.sentiment];
    const IconComponent = config.icon;

    return (
      <Animated.View
        key={pattern.id}
        style={[
          styles.patternCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.patternHeader}>
          <View style={[styles.sentimentBadge, { backgroundColor: config.color + "20" }]}>
            <IconComponent color={config.color} size={16} />
            <Text style={[styles.sentimentText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
          <View style={styles.frequencyBadge}>
            <Clock color={Colors.textMuted} size={12} />
            <Text style={styles.frequencyText}>
              {FREQUENCY_LABELS[pattern.frequency]}
            </Text>
          </View>
        </View>

        <Text style={styles.patternTitle}>{pattern.pattern}</Text>

        {pattern.insights.length > 0 && (
          <View style={styles.insightsContainer}>
            {pattern.insights.map((insight, i) => (
              <View key={i} style={styles.insightItem}>
                <ChevronRight color={Colors.primary} size={14} />
                <Text style={styles.insightText}>{insight}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    );
  };

  if (cats.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Activity color={Colors.primary} size={48} />
        </View>
        <Text style={styles.emptyTitle}>Aucun chat enregistré</Text>
        <Text style={styles.emptyText}>
          Ajoutez un chat et enregistrez ses journaux quotidiens pour analyser son comportement.
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
          <Activity color={Colors.primary} size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Analyse comportementale</Text>
          <Text style={styles.headerSubtitle}>
            Détection de patterns par IA
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
              accessibilityRole="button"
              accessibilityLabel={cat.name}
              accessibilityState={{ selected: selectedCatId === cat.id }}
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

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <BarChart3 color={Colors.primary} size={20} />
          <Text style={styles.statValue}>{logsCount}</Text>
          <Text style={styles.statLabel}>Journaux</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Brain color={Colors.accent} size={20} />
          <Text style={styles.statValue}>{catPatterns.length}</Text>
          <Text style={styles.statLabel}>Patterns</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <TrendingUp color={Colors.success} size={20} />
          <Text style={styles.statValue}>
            {catPatterns.filter(p => p.sentiment === "positive").length}
          </Text>
          <Text style={styles.statLabel}>Positifs</Text>
        </View>
      </View>

      {!canAnalyze && (
        <View style={styles.warningCard}>
          <AlertCircle color={Colors.warning} size={20} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Données insuffisantes</Text>
            <Text style={styles.warningText}>
              Ajoutez au moins 3 journaux quotidiens pour {selectedCat?.name} afin de permettre une analyse comportementale.
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.analyzeButton,
          (!canAnalyze || isAnalyzingBehavior) && styles.analyzeButtonDisabled,
        ]}
        onPress={handleAnalyze}
        disabled={!canAnalyze || isAnalyzingBehavior}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Analyser le comportement"
        accessibilityState={{ disabled: !canAnalyze || isAnalyzingBehavior }}
      >
        {isAnalyzingBehavior ? (
          <>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.analyzeButtonText}>Analyse en cours...</Text>
          </>
        ) : (
          <>
            <Zap color="#fff" size={20} />
            <Text style={styles.analyzeButtonText}>
              Analyser le comportement
            </Text>
          </>
        )}
      </TouchableOpacity>

      {catPatterns.length > 0 && (
        <View style={styles.patternsSection}>
          <Text style={styles.sectionTitle}>Patterns détectés</Text>
          {catPatterns.map((pattern, index) => renderPatternCard(pattern, index))}
        </View>
      )}

      {catPatterns.length === 0 && !isAnalyzingBehavior && canAnalyze && (
        <View style={styles.noPatterns}>
          <Brain color={Colors.textMuted} size={32} />
          <Text style={styles.noPatternsTitle}>Aucun pattern détecté</Text>
          <Text style={styles.noPatternsText}>
            Lancez une analyse pour détecter les patterns comportementaux de {selectedCat?.name}.
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Brain color={Colors.info} size={20} />
        </View>
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Comment ça fonctionne ?</Text>
          <Text style={styles.infoText}>
            Notre IA analyse vos journaux quotidiens pour identifier des patterns récurrents dans le comportement de votre chat : habitudes alimentaires, niveau d&apos;énergie, comportements inhabituels...
          </Text>
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
  statsCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: "center" as const,
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 12,
  },
  warningCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.warning + "15",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 12,
    alignItems: "flex-start" as const,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.warning,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  analyzeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    marginBottom: 24,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  patternsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  patternCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  patternHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 12,
  },
  sentimentBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  frequencyBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  frequencyText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  patternTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 10,
    lineHeight: 21,
  },
  insightsContainer: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  insightItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  noPatterns: {
    alignItems: "center" as const,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  noPatternsTitle: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  noPatternsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: "row" as const,
    backgroundColor: Colors.info + "10",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginTop: 8,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.info + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  infoText: {
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
