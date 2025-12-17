import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Alert } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { TrendingUp, TrendingDown, Plus, Edit3 } from "lucide-react-native";
import { useCats } from "@/context/cats";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/auth";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CHART_WIDTH = SCREEN_WIDTH - 60;
const CHART_HEIGHT = 220;

export default function WeightChartScreen() {
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats } = useCats();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  
  const cat = cats.find((c) => c.id === catId);

  const hasHealthTracking = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.subscriptionTier === 'premium_plus' || currentUser.addOns?.includes('health_tracking');
  }, [currentUser]);

  // Protect the route
  React.useEffect(() => {
    if (!hasHealthTracking && cat) {
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
  }, [hasHealthTracking, cat, t]);

  const weightHistory = useMemo(() => {
    if (!cat?.weightHistory) return [];
    return [...cat.weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [cat]);

  const chartData = useMemo(() => {
    if (weightHistory.length === 0) return null;

    const weights = weightHistory.map(w => w.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 1;

    return weightHistory.map((entry, index) => {
      const x = (index / Math.max(weightHistory.length - 1, 1)) * CHART_WIDTH;
      const normalizedHeight = ((entry.weight - minWeight) / range);
      const y = CHART_HEIGHT - (normalizedHeight * (CHART_HEIGHT - 40)) - 20;
      
      return {
        ...entry,
        x,
        y,
      };
    });
  }, [weightHistory]);

  const pathD = useMemo(() => {
    if (!chartData || chartData.length === 0) return "";
    
    let path = `M ${chartData[0].x} ${chartData[0].y}`;
    
    for (let i = 1; i < chartData.length; i++) {
      const prev = chartData[i - 1];
      const curr = chartData[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 3;
      const cpX2 = prev.x + 2 * (curr.x - prev.x) / 3;
      path += ` C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    
    return path;
  }, [chartData]);

  const trend = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const latest = weightHistory[weightHistory.length - 1];
    const previous = weightHistory[weightHistory.length - 2];
    const diff = latest.weight - previous.weight;
    return { diff, unit: latest.unit };
  }, [weightHistory]);

  const onAddWeight = () => {
    router.push({ pathname: "/cats/weight-form" as any, params: { catId: cat?.id } });
  };

  const onEditWeight = (weightId: string) => {
    router.push({ pathname: "/cats/weight-form" as any, params: { catId: cat?.id, weightId } });
  };

  if (!cat) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chat introuvable</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: `Évolution du poids - ${cat.name}`,
          headerRight: () => (
            <Pressable onPress={onAddWeight} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <Plus size={24} color="#007AFF" />
            </Pressable>
          ),
        }} 
      />
      
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        
        {chartData && chartData.length > 0 ? (
          <>
            <View style={styles.chartContainer}>
              <View style={styles.chart}>
                <View style={styles.gridLines}>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.gridLine, { top: (i / 4) * CHART_HEIGHT }]} />
                  ))}
                </View>
                
                <svg width={CHART_WIDTH} height={CHART_HEIGHT} style={styles.svg}>
                  <path
                    d={pathD}
                    stroke="#007AFF"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {chartData.map((point, idx) => (
                    <circle
                      key={point.id}
                      cx={point.x}
                      cy={point.y}
                      r="6"
                      fill="#007AFF"
                      stroke="#fff"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </View>
              
              <View style={styles.chartLabels}>
                {chartData.map((point, idx) => (
                  <View key={point.id} style={[styles.chartLabel, { left: point.x - 20 }]}>
                    <Text style={styles.chartLabelText}>{point.weight}</Text>
                  </View>
                ))}
              </View>
            </View>

            {trend && (
              <View style={styles.trendCard}>
                <View style={styles.trendIcon}>
                  {trend.diff > 0 ? (
                    <TrendingUp size={24} color="#34C759" />
                  ) : trend.diff < 0 ? (
                    <TrendingDown size={24} color="#FF3B30" />
                  ) : null}
                </View>
                <View style={styles.trendInfo}>
                  <Text style={styles.trendLabel}>Tendance récente</Text>
                  <Text style={[
                    styles.trendValue,
                    { color: trend.diff > 0 ? "#34C759" : trend.diff < 0 ? "#FF3B30" : "#666" }
                  ]}>
                    {trend.diff > 0 ? "+" : ""}{trend.diff.toFixed(2)} {trend.unit}
                  </Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune donnée de poids</Text>
            <Pressable onPress={onAddWeight} style={styles.emptyBtn}>
              <Plus size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>Ajouter une pesée</Text>
            </Pressable>
          </View>
        )}

        {weightHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Historique</Text>
            {[...weightHistory].reverse().map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => onEditWeight(entry.id)}
                style={({ pressed }) => [styles.historyCard, pressed && styles.pressed]}
              >
                <View style={styles.historyMain}>
                  <Text style={styles.historyWeight}>{entry.weight} {entry.unit}</Text>
                  <Text style={styles.historyDate}>{entry.date}</Text>
                </View>
                {entry.notes && (
                  <Text style={styles.historyNotes}>{entry.notes}</Text>
                )}
                <Edit3 size={16} color="#ccc" style={styles.historyIcon} />
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    paddingBottom: 40,
  },
  chartContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 12,
  },
  chart: {
    height: CHART_HEIGHT,
    width: CHART_WIDTH,
    position: "relative",
  },
  gridLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  svg: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  chartLabels: {
    marginTop: 8,
    height: 20,
    position: "relative",
    width: CHART_WIDTH,
  },
  chartLabel: {
    position: "absolute",
    width: 40,
  },
  chartLabelText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#007AFF",
    textAlign: "center",
  },
  trendCard: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  trendIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  trendInfo: {
    flex: 1,
  },
  trendLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 4,
  },
  trendValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  emptyState: {
    backgroundColor: "#fff",
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 20,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  historySection: {
    backgroundColor: "#fff",
    padding: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: "#F9F9FB",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    position: "relative",
  },
  pressed: {
    opacity: 0.7,
  },
  historyMain: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  historyWeight: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  historyDate: {
    fontSize: 14,
    color: "#888",
  },
  historyNotes: {
    fontSize: 13,
    color: "#666",
    marginTop: 6,
  },
  historyIcon: {
    position: "absolute",
    right: 16,
    top: 18,
  },
});
