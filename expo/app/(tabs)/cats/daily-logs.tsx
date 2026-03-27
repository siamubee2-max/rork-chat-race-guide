import React, { useLayoutEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Plus, Calendar, UtensilsCrossed, Droplets, Activity, Trash, AlertTriangle } from "lucide-react-native";
import { useCats } from "@/context/cats";

export default function DailyLogsScreen() {
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats } = useCats();
  const navigation = useNavigation();
  
  const cat = cats.find((c) => c.id === catId);
  const dailyLogs = cat?.dailyLogs ?? [];

  const onAddLog = useCallback(() => {
    router.push({ pathname: "/cats/daily-log-form" as any, params: { catId: cat?.id } });
  }, [cat?.id]);

  useLayoutEffect(() => {
    if (cat) {
      navigation.setOptions({
        title: `Logs quotidiens - ${cat.name}`,
        headerRight: () => (
          <Pressable onPress={onAddLog} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Plus size={24} color="#007AFF" />
          </Pressable>
        ),
      });
    }
  }, [cat, navigation, onAddLog]);

  const getStatusColor = (value: string) => {
    if (value === "normal") return "#34C759";
    if (value === "increased" || value === "playful" || value === "hyperactive") return "#5AC8FA";
    if (value === "decreased" || value === "lethargic") return "#FF9500";
    if (value === "none" || value === "diarrhea" || value === "constipation" || value === "blood") return "#FF3B30";
    return "#8E8E93";
  };

  const getStatusLabel = (type: string, value: string) => {
    const labels: Record<string, Record<string, string>> = {
      appetite: { normal: "Normal", increased: "↑", decreased: "↓", none: "Aucun" },
      water: { normal: "Normale", increased: "↑", decreased: "↓", none: "Aucune" },
      energy: { normal: "Normal", playful: "Joueur", lethargic: "Léthargique", hyperactive: "Hyperactif" },
      litter: { normal: "Normal", diarrhea: "Diarrhée", constipation: "Constipation", blood: "Sang", none: "Aucun" },
    };
    return labels[type]?.[value] ?? value;
  };

  if (!cat) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Chat introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        
        {dailyLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun log quotidien</Text>
            <Pressable onPress={onAddLog} style={styles.emptyBtn}>
              <Plus size={20} color="#fff" />
              <Text style={styles.emptyBtnText}>Ajouter un log</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {[...dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => {
              const hasSymptoms = log.vomiting || log.coughing || log.sneezing || log.scratching;
              const hasIssues = 
                log.appetite === "none" || log.appetite === "decreased" ||
                log.water === "none" || log.water === "decreased" ||
                log.energy === "lethargic" ||
                log.litter === "diarrhea" || log.litter === "blood" || log.litter === "constipation" ||
                hasSymptoms;

              return (
                <View key={log.id} style={[styles.logCard, hasIssues && styles.logCardAlert]}>
                  <View style={styles.logHeader}>
                    <View style={styles.logDateContainer}>
                      <Calendar size={16} color="#666" />
                      <Text style={styles.logDate}>{log.date}</Text>
                    </View>
                    {hasIssues && (
                      <View style={styles.alertBadge}>
                        <AlertTriangle size={12} color="#FF3B30" />
                      </View>
                    )}
                  </View>

                  <View style={styles.logStats}>
                    <View style={styles.statRow}>
                      <UtensilsCrossed size={16} color={getStatusColor(log.appetite)} />
                      <Text style={styles.statLabel}>Appétit:</Text>
                      <View style={[styles.statBadge, { backgroundColor: getStatusColor(log.appetite) + "20" }]}>
                        <Text style={[styles.statValue, { color: getStatusColor(log.appetite) }]}>
                          {getStatusLabel("appetite", log.appetite)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statRow}>
                      <Droplets size={16} color={getStatusColor(log.water)} />
                      <Text style={styles.statLabel}>Eau:</Text>
                      <View style={[styles.statBadge, { backgroundColor: getStatusColor(log.water) + "20" }]}>
                        <Text style={[styles.statValue, { color: getStatusColor(log.water) }]}>
                          {getStatusLabel("water", log.water)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statRow}>
                      <Activity size={16} color={getStatusColor(log.energy)} />
                      <Text style={styles.statLabel}>Énergie:</Text>
                      <View style={[styles.statBadge, { backgroundColor: getStatusColor(log.energy) + "20" }]}>
                        <Text style={[styles.statValue, { color: getStatusColor(log.energy) }]}>
                          {getStatusLabel("energy", log.energy)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statRow}>
                      <Trash size={16} color={getStatusColor(log.litter)} />
                      <Text style={styles.statLabel}>Litière:</Text>
                      <View style={[styles.statBadge, { backgroundColor: getStatusColor(log.litter) + "20" }]}>
                        <Text style={[styles.statValue, { color: getStatusColor(log.litter) }]}>
                          {getStatusLabel("litter", log.litter)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {hasSymptoms && (
                    <View style={styles.symptomsContainer}>
                      <Text style={styles.symptomsLabel}>Symptômes:</Text>
                      <View style={styles.symptomsList}>
                        {log.vomiting && <Text style={styles.symptomTag}>Vomissements</Text>}
                        {log.coughing && <Text style={styles.symptomTag}>Toux</Text>}
                        {log.sneezing && <Text style={styles.symptomTag}>Éternuements</Text>}
                        {log.scratching && <Text style={styles.symptomTag}>Grattage</Text>}
                      </View>
                    </View>
                  )}

                  {log.notes && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesText}>{log.notes}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

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
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 16,
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
  logCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  logCardAlert: {
    borderColor: "#FF3B30",
    backgroundColor: "#FFF5F5",
  },
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  logDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logDate: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
  },
  alertBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFE5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  logStats: {
    gap: 10,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  statBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  symptomsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  symptomsLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 6,
  },
  symptomsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  symptomTag: {
    backgroundColor: "#FF3B30",
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
});
