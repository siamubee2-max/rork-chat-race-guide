import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useUserLocation } from "@/context/user-location";
import { 
  MapPin, 
  Stethoscope, 
  Home, 
  ShoppingBag, 
  Hotel, 
  Pill, 
  Building2,
  ExternalLink,
  Locate,
  Map,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import NativeMap from "@/components/NativeMap";

interface SearchCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  query: string;
  emoji: string;
  color: string;
}

export default function VetsScreen() {
  const { t } = useTranslation();
  const {
    coords,
    address,
    permission,
    error: locationError,
    locateOnce,
    isLocating,
  } = useUserLocation();

  const [hasAskedPermission, setHasAskedPermission] = useState(false);
  const [showMap, setShowMap] = useState(true);

  const handleRequestLocation = useCallback(() => {
    console.log("[VetsScreen] user requested location");
    setHasAskedPermission(true);
    void locateOnce();
  }, [locateOnce]);

  const openGoogleMaps = useCallback((query: string) => {
    if (!coords) {
      Alert.alert(
        t("vets.locationRequired"),
        t("vets.enableLocationFirst")
      );
      return;
    }

    const { latitude, longitude } = coords;
    
    // URL Google Maps avec recherche à proximité
    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?q=${encodeURIComponent(query)}&center=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${encodeURIComponent(query)}`,
      default: `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`,
    });

    const webFallback = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;

    // Essayer d'ouvrir l'app Google Maps, sinon fallback web
    Linking.canOpenURL(googleMapsUrl || webFallback)
      .then((supported) => {
        if (supported && googleMapsUrl) {
          return Linking.openURL(googleMapsUrl);
        }
        return Linking.openURL(webFallback);
      })
      .catch(() => {
        Linking.openURL(webFallback).catch(() => {
          Alert.alert(t("common.error"), t("vets.cannotOpenMaps"));
        });
      });
  }, [coords, t]);

  const categories: SearchCategory[] = [
    {
      id: "vet",
      icon: <Stethoscope color="#fff" size={24} />,
      title: t("vets.veterinarian"),
      subtitle: t("vets.vetSubtitle"),
      query: "vétérinaire chat",
      emoji: "🏥",
      color: "#EF5350",
    },
    {
      id: "emergency",
      icon: <Building2 color="#fff" size={24} />,
      title: t("vets.emergencyVet"),
      subtitle: t("vets.emergencySubtitle"),
      query: "urgences vétérinaires 24h",
      emoji: "🚨",
      color: "#FF7043",
    },
    {
      id: "clinic",
      icon: <Building2 color="#fff" size={24} />,
      title: t("vets.clinic"),
      subtitle: t("vets.clinicSubtitle"),
      query: "clinique vétérinaire féline",
      emoji: "🩺",
      color: "#42A5F5",
    },
    {
      id: "pharmacy",
      icon: <Pill color="#fff" size={24} />,
      title: t("vets.pharmacy"),
      subtitle: t("vets.pharmacySubtitle"),
      query: "pharmacie vétérinaire",
      emoji: "💊",
      color: "#66BB6A",
    },
    {
      id: "shop",
      icon: <ShoppingBag color="#fff" size={24} />,
      title: t("vets.petShop"),
      subtitle: t("vets.petShopSubtitle"),
      query: "animalerie chat litière croquettes",
      emoji: "🛍️",
      color: "#AB47BC",
    },
    {
      id: "shelter",
      icon: <Home color="#fff" size={24} />,
      title: t("vets.shelter"),
      subtitle: t("vets.shelterSubtitle"),
      query: "refuge animaux SPA",
      emoji: "🏠",
      color: "#26A69A",
    },
    {
      id: "boarding",
      icon: <Hotel color="#fff" size={24} />,
      title: t("vets.boarding"),
      subtitle: t("vets.boardingSubtitle"),
      query: "pension chat garde féline",
      emoji: "🏨",
      color: "#7E57C2",
    },
  ];

  const locationLine = (() => {
    if (permission === "denied") return t("vets.locationDenied");
    if (permission === "unavailable") return t("vets.locationUnavailable");
    if (locationError?.message) return locationError.message;
    if (!coords) return t("vets.locating");
    
    const label = address?.label;
    const acc = coords?.accuracyMeters;
    const accText = typeof acc === "number" ? ` (±${Math.round(acc)} m)` : "";
    
    if (label) return `${label}${accText}`;
    return `${coords?.latitude.toFixed(6)}, ${coords?.longitude.toFixed(6)}${accText}`;
  })();

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t("vets.title")}</Text>
            <Text style={styles.subtitle}>
              {t("vets.subtitle")}
            </Text>
          </View>

          {/* Location Card */}
          {!hasAskedPermission || (!coords && permission !== "denied") ? (
            <View style={styles.locationCard}>
              <View style={styles.locationIconContainer}>
                <MapPin size={32} color={Colors.primary} />
              </View>
              <Text style={styles.locationTitle}>{t("vets.locationRequired")}</Text>
              <Text style={styles.locationText}>
                {t("vets.locationExplanation")}
              </Text>
              <TouchableOpacity
                testID="vets-request-location"
                onPress={handleRequestLocation}
                style={styles.locationBtn}
                activeOpacity={0.8}
              >
                <Locate size={20} color={Colors.background} />
                <Text style={styles.locationBtnText}>
                  {isLocating ? t("vets.locating") : t("vets.locateMe")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.currentLocationCard}>
              <View style={styles.currentLocationHeader}>
                <MapPin size={18} color={Colors.primary} />
                <Text style={styles.currentLocationLabel}>{t("vets.yourPosition")}</Text>
              </View>
              <Text style={styles.currentLocationText} numberOfLines={2}>
                {locationLine}
              </Text>
              <TouchableOpacity
                onPress={() => locateOnce()}
                style={styles.refreshBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.refreshBtnText}>
                  {isLocating ? "..." : t("vets.refresh")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Categories Grid */}
          {coords && (
            <>
              <Text style={styles.sectionTitle}>{t("vets.searchNearby")}</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() => openGoogleMaps(category.query)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
                      {category.icon}
                    </View>
                    <View style={styles.categoryContent}>
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                      <Text style={styles.categoryTitle}>{category.title}</Text>
                      <Text style={styles.categorySubtitle} numberOfLines={2}>
                        {category.subtitle}
                      </Text>
                    </View>
                    <View style={styles.categoryArrow}>
                      <ExternalLink size={16} color={Colors.textMuted} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Native Map Section */}
              <View style={styles.mapSection}>
                <TouchableOpacity 
                  style={styles.mapToggleHeader}
                  onPress={() => setShowMap(!showMap)}
                  activeOpacity={0.7}
                >
                  <View style={styles.mapToggleLeft}>
                    <Map size={18} color={Colors.primary} />
                    <Text style={styles.mapToggleTitle}>{t("vets.mapView")}</Text>
                  </View>
                  {showMap ? (
                    <ChevronUp size={20} color={Colors.textMuted} />
                  ) : (
                    <ChevronDown size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>

                {showMap && coords && (
                  <View style={styles.mapContainer}>
                    <NativeMap
                      latitude={coords.latitude}
                      longitude={coords.longitude}
                      height={280}
                      zoomLevel={14}
                      showUserLocation={true}
                    />
                    <Text style={styles.mapHint}>
                      {t("vets.tapMarkerHint")}
                    </Text>
                  </View>
                )}
              </View>

              {/* Quick Actions */}
              <View style={styles.quickActions}>
                <TouchableOpacity
                  style={styles.quickActionBtn}
                  onPress={() => openGoogleMaps("vétérinaire")}
                  activeOpacity={0.8}
                >
                  <Map size={20} color="#fff" />
                  <Text style={styles.quickActionText}>{t("vets.openGoogleMaps")}</Text>
                </TouchableOpacity>
              </View>

              {/* Info Card */}
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>💡 {t("vets.tip")}</Text>
                <Text style={styles.infoText}>
                  {t("vets.tipText")}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  locationCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  locationIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 10,
  },
  locationText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  locationBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  locationBtnText: {
    color: Colors.background,
    fontWeight: "800",
    fontSize: 16,
  },
  currentLocationCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  currentLocationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  currentLocationLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  currentLocationText: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  refreshBtn: {
    alignSelf: "flex-end",
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 12,
  },
  refreshBtnText: {
    color: Colors.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 16,
  },
  categoriesGrid: {
    gap: 12,
    marginBottom: 24,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryContent: {
    flex: 1,
  },
  categoryEmoji: {
    fontSize: 12,
    marginBottom: 2,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 3,
  },
  categorySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  categoryArrow: {
    padding: 8,
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionText: {
    color: Colors.background,
    fontWeight: "800",
    fontSize: 16,
  },
  infoCard: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  mapSection: {
    marginBottom: 24,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapToggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  mapToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mapToggleTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  mapContainer: {
    padding: 12,
  },
  mapHint: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
});
