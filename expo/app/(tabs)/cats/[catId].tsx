import React, { useLayoutEffect, useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Modal, Dimensions, Alert } from "react-native";
import { useLocalSearchParams, router, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { Cat, Plus, Calendar, Syringe, Stethoscope, Pill, HeartPulse, ChevronRight, Heart, Bug, Activity, Images, X } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCats, MedicalRecordType } from "@/context/cats";
import { useAuth } from "@/context/auth";
import { getBreedById } from "@/constants/breeds";

const SCREEN_WIDTH = Dimensions.get("window").width;
const IS_TABLET = SCREEN_WIDTH >= 768;
const AVATAR_SIZE = IS_TABLET ? 160 : 80;
const GALLERY_THUMB = IS_TABLET ? 180 : 110;

export default function CatDetailsScreen() {
  const { t } = useTranslation();
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats } = useCats();
  const { currentUser } = useAuth();
  const navigation = useNavigation();

  
  const cat = cats.find((c) => c.id === catId);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

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
          <Pressable onPress={onEditCat} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })} accessibilityRole="button" accessibilityLabel={t("common.edit")}>
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
    const hasPremiumPlus = currentUser?.subscriptionTier === 'premium_plus';
    
    if (!hasPremiumPlus) {
      Alert.alert(
        "Fonctionnalité Premium",
        "Le suivi santé avancé est disponible avec l'abonnement Premium ou le module complémentaire.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Découvrir Premium", onPress: () => router.push('/(tabs)/subscription' as any) },
        ]
      );
      return;
    }
    
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
    <View style={styles.container}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        
        {/* Header Profile */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {cat.imageUri ? (
              <Image source={{ uri: cat.imageUri }} style={styles.avatar} contentFit="cover" accessibilityRole="image" accessibilityLabel={`Photo de ${cat.name}`} />
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

        {/* Photo Gallery */}
        {cat.gallery && cat.gallery.length > 0 && (
          <View style={styles.gallerySection}>
            <View style={styles.gallerySectionHeader}>
              <Images size={18} color="#111" />
              <Text style={styles.gallerySectionTitle}>Galerie ({cat.gallery.length})</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryScroll}
            >
              {cat.gallery.map((photo, index) => (
                <Pressable
                  key={photo.id}
                  onPress={() => setSelectedPhotoIndex(index)}
                  style={({ pressed }) => [styles.galleryItem, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Photo ${index + 1} de la galerie`}
                  accessibilityHint="Ouvre la photo en plein écran"
                >
                  <Image source={{ uri: photo.uri }} style={styles.galleryThumbnail} contentFit="cover" accessibilityRole="image" accessibilityLabel={`Photo de ${cat.name}`} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Health Dashboard Card */}
        <Pressable
          onPress={onOpenHealthDashboard}
          style={({ pressed }) => [styles.healthDashboardCard, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Tableau de bord santé"
          accessibilityHint="Ouvre le suivi du poids, logs quotidiens et alertes"
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
          <Pressable onPress={onAddRecord} style={styles.addBtn} accessibilityRole="button" accessibilityLabel={t("cats.addMedicalRecord")}>
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
                accessibilityRole="button"
                accessibilityLabel={`${record.title}, ${record.date}`}
                accessibilityHint="Ouvre le détail de l'enregistrement médical"
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

      {/* Full Screen Photo Modal */}
      <Modal
        visible={selectedPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPhotoIndex(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalCloseBtn}
            onPress={() => setSelectedPhotoIndex(null)}
            accessibilityRole="button"
            accessibilityLabel="Fermer"
          >
            <X size={24} color="#fff" />
          </Pressable>
          
          {selectedPhotoIndex !== null && cat.gallery && cat.gallery[selectedPhotoIndex] && (
            <View style={styles.modalContent}>
              <Image
                source={{ uri: cat.gallery[selectedPhotoIndex].uri }}
                style={styles.fullImage}
                contentFit="contain"
                accessibilityRole="image"
                accessibilityLabel={`Photo ${selectedPhotoIndex + 1} de ${cat.name}`}
              />
              <View style={styles.modalNav}>
                <Pressable
                  onPress={() => setSelectedPhotoIndex(Math.max(0, selectedPhotoIndex - 1))}
                  style={[styles.navBtn, selectedPhotoIndex === 0 && styles.navBtnDisabled]}
                  disabled={selectedPhotoIndex === 0}
                  accessibilityRole="button"
                  accessibilityLabel="Photo précédente"
                  accessibilityState={{ disabled: selectedPhotoIndex === 0 }}
                >
                  <Text style={styles.navBtnText}>←</Text>
                </Pressable>
                <Text style={styles.photoCounter}>
                  {selectedPhotoIndex + 1} / {cat.gallery.length}
                </Text>
                <Pressable
                  onPress={() => setSelectedPhotoIndex(Math.min(cat.gallery!.length - 1, selectedPhotoIndex + 1))}
                  style={[styles.navBtn, selectedPhotoIndex === cat.gallery.length - 1 && styles.navBtnDisabled]}
                  disabled={selectedPhotoIndex === cat.gallery.length - 1}
                  accessibilityRole="button"
                  accessibilityLabel="Photo suivante"
                  accessibilityState={{ disabled: selectedPhotoIndex === cat.gallery.length - 1 }}
                >
                  <Text style={styles.navBtnText}>→</Text>
                </Pressable>
              </View>
              {cat.gallery[selectedPhotoIndex].date && (
                <Text style={styles.photoDate}>{cat.gallery[selectedPhotoIndex].date}</Text>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
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
    padding: IS_TABLET ? 28 : 20,
    flexDirection: "row",
    alignItems: "center",
    gap: IS_TABLET ? 24 : 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  avatarContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
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
    fontSize: IS_TABLET ? 22 : 18,
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
    fontSize: IS_TABLET ? 16 : 14,
    color: "#666",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    marginBottom: 6,
  },
  notes: {
    fontSize: IS_TABLET ? 16 : 14,
    color: "#444",
    lineHeight: IS_TABLET ? 24 : 20,
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
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  gallerySection: {
    backgroundColor: "#fff",
    marginTop: 12,
    paddingVertical: 16,
  },
  gallerySectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  gallerySectionTitle: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: "#111",
  },
  galleryScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  galleryItem: {
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  galleryThumbnail: {
    width: GALLERY_THUMB,
    height: GALLERY_THUMB,
    borderRadius: IS_TABLET ? 16 : 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  modalCloseBtn: {
    position: "absolute" as const,
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  modalContent: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    width: "100%" as const,
  },
  fullImage: {
    width: "100%" as const,
    height: "70%" as const,
  },
  modalNav: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 30,
    marginTop: 20,
  },
  navBtn: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700" as const,
  },
  photoCounter: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  photoDate: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 12,
  },
});
