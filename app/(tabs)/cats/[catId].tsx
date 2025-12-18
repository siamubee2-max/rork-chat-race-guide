import React, { useLayoutEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { Cat, Plus, Calendar, Syringe, Stethoscope, Pill, HeartPulse, ChevronRight, Heart, Bug, Activity } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCats, MedicalRecordType } from "@/context/cats";
import { getBreedById } from "@/constants/breeds";

export default function CatDetailsScreen() {
  const { t } = useTranslation();
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats } = useCats();
  const navigation = useNavigation();
  
  const cat = cats.find((c) => c.id === catId);

  const breed = cat?.breedId ? getBreedById(cat.breedId) : null;
  const breedDisplay = breed?.name ?? t("cats.mixedBreed");

  const onEditCat = useCallback(() => {
    if (cat) {
      router.push({
        pathname: "/(tabs)/cats/form" as any,
        params: { catId: cat.id },
      });
    }
  }, [cat]);

  useLayoutEffect(() => {
    if (cat) {
      navigation.setOptions({
        title: cat.name,
        headerRight: () => (
          <Pressable onPress={onEditCat} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Text style={styles.headerBtn}>{t("common.edit")}</Text>
          </Pressable>
        ),
      });
    }
  }, [cat, navigation, t, onEditCat]);

  if (!cat) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{t("cats.catNotFound")}</Text>
      </View>
    );
  }

  const onAddRecord = () => {
    router.push({
      pathname: "/(tabs)/cats/record-form" as any,
      params: { catId: cat.id },
    });
  };

  const onEditRecord = (recordId: string) => {
    router.push({
      pathname: "/(tabs)/cats/record-form" as any,
      params: { catId: cat.id, recordId },
    });
  };

  const onOpenHealthDashboard = () => {
    router.push({
      pathname: "/cats/health-dashboard" as any,
      params: { catId: cat.id },
    });
  };

  const getRecordIcon = (type: MedicalRecordType) => {
    switch (type) {
      case "vaccine": return <Syringe size={20} color="#111" />;
      case "operation": return <Stethoscope size={20} color="#111" />;
      case "medication": return <Pill size={20} color="#111" />;
      case "care": return <HeartPulse size={20} color="#111" />;
      case "parasite": return <Bug size={20} color="#111" />;
    }
  };

  const getRecordColor = (type: MedicalRecordType) => {
    switch (type) {
      case "vaccine": return "#E3F2FD";
      case "operation": return "#FFEBEE";
      case "medication": return "#E8F5E9";
      case "care": return "#FFF3E0";
      case "parasite": return "#F3E5F5";
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {cat.imageUri ? (
              <Image source={{ uri: cat.imageUri }} style={styles.avatar} contentFit="cover" />
            ) : (
              <View style={styles.placeholderAvatar}>
                <Cat size={40} color="#999" />
              </View>
            )}
          </View>
          
          <View style={styles.headerInfo}>
            <View style={styles.breedContainer}>
              {!breed && <Heart size={14} color="#E91E63" />}
              <Text style={[styles.breedName, !breed && styles.mixedBreedName]}>{breedDisplay}</Text>
            </View>
            {cat.microchip ? (
              <Text style={styles.chipText}>{t("cats.chip")} : {cat.microchip}</Text>
            ) : null}
            {cat.notes ? (
              <Text style={styles.notes} numberOfLines={2}>{cat.notes}</Text>
            ) : null}
          </View>
        </View>

        {/* Health Dashboard Card */}
        <Pressable 
          onPress={onOpenHealthDashboard}
          style={({ pressed }) => [styles.healthDashboardCard, pressed && styles.pressed]}
        >
          <View style={styles.dashboardIcon}>
            <Activity size={24} color="#007AFF" />
          </View>
          <View style={styles.dashboardContent}>
            <Text style={styles.dashboardTitle}>Tableau de bord santé</Text>
            <Text style={styles.dashboardSubtitle}>
              Suivi du poids, logs quotidiens et alertes
            </Text>
          </View>
          <ChevronRight size={20} color="#007AFF" />
        </Pressable>

        {/* Medical Records Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t("cats.healthRecord")}</Text>
          <Pressable onPress={onAddRecord} style={styles.addBtn}>
            <Plus size={16} color="#fff" />
            <Text style={styles.addBtnText}>{t("cats.addMedicalRecord")}</Text>
          </Pressable>
        </View>

        {(!cat.medicalRecords || cat.medicalRecords.length === 0) ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>{t("cats.noMedicalRecords")}</Text>
            <Text style={styles.emptyStateSubtext}>
              {t("cats.addMedicalRecordsHint")}
            </Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {cat.medicalRecords.map((record) => (
              <Pressable 
                key={record.id} 
                style={({ pressed }) => [styles.recordCard, pressed && styles.pressed]}
                onPress={() => onEditRecord(record.id)}
              >
                <View style={[styles.recordIcon, { backgroundColor: getRecordColor(record.type) }]}>
                  {getRecordIcon(record.type)}
                </View>
                
                <View style={styles.recordContent}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordTitle}>{record.title}</Text>
                    <Text style={styles.recordDate}>{record.date}</Text>
                  </View>
                  
                  {record.vetName && (
                    <Text style={styles.recordVet}>{record.vetName}</Text>
                  )}
                  
                  {record.nextDueDate && (
                    <View style={styles.nextDateContainer}>
                      <Calendar size={12} color="#E65100" />
                      <Text style={styles.nextDateText}>
                        {t("cats.next")}: {record.nextDueDate}
                      </Text>
                    </View>
                  )}
                </View>
                
                <ChevronRight size={20} color="#ccc" />
              </Pressable>
            ))}
          </View>
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
    paddingBottom: 40,
  },
  headerBtn: {
    fontSize: 17,
    color: "#007AFF",
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#fff",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  placeholderAvatar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  breedName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  breedContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  mixedBreedName: {
    color: "#E91E63",
  },
  chipText: {
    fontSize: 14,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 6,
  },
  notes: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
  },
  recordsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pressed: {
    opacity: 0.7,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  recordContent: {
    flex: 1,
  },
  recordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
    marginRight: 8,
  },
  recordDate: {
    fontSize: 13,
    color: "#888",
  },
  recordVet: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  nextDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    backgroundColor: "#FFF3E0",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextDateText: {
    fontSize: 11,
    color: "#E65100",
    fontWeight: "600",
  },
  healthDashboardCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E3F2FD",
  },
  dashboardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E3F2FD",
    alignItems: "center",
    justifyContent: "center",
  },
  dashboardContent: {
    flex: 1,
  },
  dashboardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111",
    marginBottom: 2,
  },
  dashboardSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
});
