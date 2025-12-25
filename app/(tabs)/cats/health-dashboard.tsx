import React, { useMemo, useLayoutEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Droplets, 
  UtensilsCrossed, 
  AlertTriangle,
  Calendar,
  Weight,
  Plus,
  Heart
} from "lucide-react-native";
import { useCats } from "@/context/cats";
import { useAuth } from "@/context/auth";

export default function HealthDashboardScreen() {
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats } = useCats();
  const { currentUser } = useAuth();
  const navigation = useNavigation();
  
  const cat = cats.find((c) => c.id === catId);

  const hasHealthAccess = useMemo(() => {
    if (!currentUser) return false;
    const isPremium = currentUser.subscriptionTier === 'premium' || currentUser.subscriptionTier === 'premium_plus';
    const hasAddon = currentUser.addOns?.includes('health_tracking');
    return isPremium || hasAddon;
  }, [currentUser]);

  useLayoutEffect(() => {
    if (cat) {
      navigation.setOptions({
        title: `Santé - ${cat.name}`,
      });
    }
  }, [cat, navigation]);

  const weightHistory = useMemo(() => cat?.weightHistory ?? [], [cat]);
  const dailyLogs = useMemo(() => cat?.dailyLogs ?? [], [cat]);
  const medicalRecords = useMemo(() => cat?.medicalRecords ?? [], [cat]);

  const latestWeight = useMemo(() => {
    if (weightHistory.length === 0) return null;
    const sorted = [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return sorted[0];
  }, [weightHistory]);

  const weightTrend = useMemo(() => {
    if (weightHistory.length < 2) return null;
    const sorted = [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const diff = sorted[0].weight - sorted[1].weight;
    return diff;
  }, [weightHistory]);

  const recentLogs = useMemo(() => {
    return [...dailyLogs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);
  }, [dailyLogs]);

  const healthAlerts = useMemo(() => {
    const alerts: { type: string; message: string; severity: "high" | "medium" | "low" }[] = [];

    const recentLog = recentLogs[0];
    if (recentLog) {
      if (recentLog.appetite === "none" || recentLog.appetite === "decreased") {
        alerts.push({ type: "appetite", message: "Appétit diminué récemment", severity: "medium" });
      }
      if (recentLog.water === "none" || recentLog.water === "decreased") {
        alerts.push({ type: "hydration", message: "Hydratation faible", severity: "high" });
      }
      if (recentLog.vomiting) {
        alerts.push({ type: "vomiting", message: "Vomissements signalés", severity: "high" });
      }
      if (recentLog.litter === "diarrhea" || recentLog.litter === "blood") {
        alerts.push({ type: "litter", message: "Problème de litière signalé", severity: "high" });
      }
      if (recentLog.energy === "lethargic") {
        alerts.push({ type: "energy", message: "Léthargie observée", severity: "medium" });
      }
    }

    const upcomingRecords = medicalRecords.filter((r) => {
      if (!r.nextDueDate) return false;
      const dueDate = new Date(r.nextDueDate);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 14 && diffDays >= 0;
    });

    upcomingRecords.forEach((record) => {
      alerts.push({ 
        type: "reminder", 
        message: `${record.title} prévu le ${record.nextDueDate}`, 
        severity: "low" 
      });
    });

    return alerts;
  }, [recentLogs, medicalRecords]);

  const avgAppetite = useMemo(() => {
    if (recentLogs.length === 0) return null;
    const normalCount = recentLogs.filter(l => l.appetite === "normal").length;
    return (normalCount / recentLogs.length) * 100;
  }, [recentLogs]);

  const avgWater = useMemo(() => {
    if (recentLogs.length === 0) return null;
    const normalCount = recentLogs.filter(l => l.water === "normal").length;
    return (normalCount / recentLogs.length) * 100;
  }, [recentLogs]);

  const avgEnergy = useMemo(() => {
    if (recentLogs.length === 0) return null;
    const normalCount = recentLogs.filter(l => l.energy === "normal" || l.energy === "playful").length;
    return (normalCount / recentLogs.length) * 100;
  }, [recentLogs]);

  if (!cat) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chat introuvable</Text>
      </View>
    );
  }

  if (!hasHealthAccess) {
    return (
      <View style={styles.center}>
        <Heart size={64} color="#ccc" style={{ marginBottom: 16 }} />
        <Text style={styles.premiumTitle}>Suivi Santé Premium</Text>
        <Text style={styles.premiumText}>Cette fonctionnalité est disponible avec:</Text>
        <View style={styles.premiumList}>
          <Text style={styles.premiumItem}>• Abonnement Premium ou Premium Plus</Text>
          <Text style={styles.premiumItem}>• Module &quot;Suivi Santé Avancé&quot;</Text>
        </View>
        <Pressable 
          style={styles.upgradeBtn}
          onPress={() => router.push('/(tabs)/subscription' as any)}
        >
          <Text style={styles.upgradeBtnText}>Découvrir Premium</Text>
        </Pressable>
      </View>
    );
  }

  const onAddWeight = () => {
    router.push({ pathname: "/cats/weight-form" as any, params: { catId: cat.id } });
  };

  const onViewWeightChart = () => {
    router.push({ pathname: "/cats/weight-chart" as any, params: { catId: cat.id } });
  };

  const onAddDailyLog = () => {
    router.push({ pathname: "/cats/daily-log-form" as any, params: { catId: cat.id } });
  };

  const onViewDailyLogs = () => {
    router.push({ pathname: "/cats/daily-logs" as any, params: { catId: cat.id } });
  };

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high": return "#FF3B30";
      case "medium": return "#FF9500";
      case "low": return "#5AC8FA";
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        
        {healthAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color="#FF3B30" />
              <Text style={styles.sectionTitle}>Alertes et rappels</Text>
            </View>
            {healthAlerts.map((alert, idx) => (
              <View key={idx} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
                <View style={[styles.alertDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
                <Text style={styles.alertText}>{alert.message}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <Weight size={20} color="#111" />
              <Text style={styles.sectionTitle}>Poids</Text>
            </View>
            <Pressable onPress={onAddWeight} style={styles.addIconBtn}>
              <Plus size={18} color="#007AFF" />
            </Pressable>
          </View>

          {latestWeight ? (
            <Pressable onPress={onViewWeightChart} style={styles.weightCard}>
              <View style={styles.weightMain}>
                <Text style={styles.weightValue}>{latestWeight.weight}</Text>
                <Text style={styles.weightUnit}>{latestWeight.unit}</Text>
              </View>
              <Text style={styles.weightDate}>Dernière pesée: {latestWeight.date}</Text>
              {weightTrend !== null && weightTrend !== 0 && (
                <View style={styles.trendContainer}>
                  {weightTrend > 0 ? (
                    <TrendingUp size={16} color="#34C759" />
                  ) : (
                    <TrendingDown size={16} color="#FF3B30" />
                  )}
                  <Text style={[styles.trendText, { color: weightTrend > 0 ? "#34C759" : "#FF3B30" }]}>
                    {Math.abs(weightTrend).toFixed(2)} {latestWeight.unit}
                  </Text>
                </View>
              )}
            </Pressable>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun poids enregistré</Text>
              <Pressable onPress={onAddWeight} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Ajouter</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#FF3B30" />
              <Text style={styles.sectionTitle}>Suivi quotidien (7 jours)</Text>
            </View>
            <Pressable onPress={onAddDailyLog} style={styles.addIconBtn}>
              <Plus size={18} color="#007AFF" />
            </Pressable>
          </View>

          {recentLogs.length > 0 ? (
            <Pressable onPress={onViewDailyLogs} style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#FFF3E0" }]}>
                  <UtensilsCrossed size={20} color="#FF9500" />
                </View>
                <Text style={styles.statLabel}>Appétit</Text>
                <View style={styles.statBar}>
                  <View style={[styles.statBarFill, { width: `${avgAppetite ?? 0}%`, backgroundColor: "#FF9500" }]} />
                </View>
                <Text style={styles.statValue}>{avgAppetite?.toFixed(0) ?? 0}%</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#E3F2FD" }]}>
                  <Droplets size={20} color="#007AFF" />
                </View>
                <Text style={styles.statLabel}>Hydratation</Text>
                <View style={styles.statBar}>
                  <View style={[styles.statBarFill, { width: `${avgWater ?? 0}%`, backgroundColor: "#007AFF" }]} />
                </View>
                <Text style={styles.statValue}>{avgWater?.toFixed(0) ?? 0}%</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: "#E8F5E9" }]}>
                  <Activity size={20} color="#34C759" />
                </View>
                <Text style={styles.statLabel}>Énergie</Text>
                <View style={styles.statBar}>
                  <View style={[styles.statBarFill, { width: `${avgEnergy ?? 0}%`, backgroundColor: "#34C759" }]} />
                </View>
                <Text style={styles.statValue}>{avgEnergy?.toFixed(0) ?? 0}%</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun suivi quotidien</Text>
              <Pressable onPress={onAddDailyLog} style={styles.emptyBtn}>
                <Text style={styles.emptyBtnText}>Commencer</Text>
              </Pressable>
            </View>
          )}
        </View>

        <View style={styles.quickActions}>
          <Pressable onPress={onViewWeightChart} style={styles.actionBtn}>
            <TrendingUp size={20} color="#007AFF" />
            <Text style={styles.actionBtnText}>Graphique de poids</Text>
          </Pressable>
          
          <Pressable onPress={onViewDailyLogs} style={styles.actionBtn}>
            <Calendar size={20} color="#007AFF" />
            <Text style={styles.actionBtnText}>Historique des logs</Text>
          </Pressable>
        </View>

    </ScrollView>
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
  alertsSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  section: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
  },
  addIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  alertCard: {
    backgroundColor: "#FFF3F3",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderLeftWidth: 4,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  weightCard: {
    backgroundColor: "#F9F9FB",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  weightMain: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 48,
    fontWeight: "800",
    color: "#111",
  },
  weightUnit: {
    fontSize: 20,
    fontWeight: "600",
    color: "#666",
  },
  weightDate: {
    fontSize: 13,
    color: "#888",
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  trendText: {
    fontSize: 14,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#F9F9FB",
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  emptyText: {
    fontSize: 15,
    color: "#888",
    marginBottom: 12,
  },
  emptyBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    gap: 12,
  },
  statCard: {
    backgroundColor: "#F9F9FB",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  statBar: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 6,
  },
  statBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111",
  },
  premiumTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    textAlign: "center",
  },
  premiumText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
  },
  premiumList: {
    marginBottom: 24,
  },
  premiumItem: {
    fontSize: 15,
    color: "#444",
    marginBottom: 8,
  },
  upgradeBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  upgradeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
  },
});
