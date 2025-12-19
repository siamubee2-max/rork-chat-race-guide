import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
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
  Locate,
  Map,
  ChevronDown,
  ChevronUp,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import NativeMap, { MapMarker } from "@/components/NativeMap";

interface SearchCategory {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  query: string;
  emoji: string;
  color: string;
}

type NearbyPlace = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string;
};

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

  const [showMap, setShowMap] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("vet");

  const handleRequestLocation = useCallback(() => {
    console.log("[VetsScreen] user requested location");
    void locateOnce();
  }, [locateOnce]);

  const searchNearbyPlaces = useCallback(async (categoryId: string) => {
    if (!coords) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSelectedCategory(categoryId);
    console.log("[VetsScreen] searching nearby places for category:", categoryId);

    const categoryQueries: Record<string, string[]> = {
      vet: ['["amenity"="veterinary"]', '["healthcare"="veterinary"]'],
      emergency: ['["amenity"="veterinary"]', '["healthcare"="veterinary"]', '["amenity"="hospital"]["veterinary"="yes"]'],
      clinic: ['["amenity"="veterinary"]', '["amenity"="clinic"]["veterinary"="yes"]', '["healthcare"="veterinary"]'],
      pharmacy: ['["amenity"="pharmacy"]', '["shop"="chemist"]'],
      shop: ['["shop"="pet"]', '["shop"="pet_grooming"]', '["shop"="pet_food"]'],
      shelter: ['["amenity"="animal_shelter"]', '["amenity"="animal_boarding"]["shelter"="yes"]'],
      boarding: ['["amenity"="animal_boarding"]', '["tourism"="pet_friendly"]'],
    };

    const queries = categoryQueries[categoryId] || ['["amenity"="veterinary"]'];
    const radius = 25000; // 25km for better coverage

    const queryParts = queries.map(q => 
      `node${q}(around:${radius},${coords.latitude},${coords.longitude});\n        way${q}(around:${radius},${coords.latitude},${coords.longitude});`
    ).join('\n        ');

    const overpassQuery = `
      [out:json][timeout:30];
      (
        ${queryParts}
      );
      out body center;
    `;

    try {
      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          body: `data=${encodeURIComponent(overpassQuery)}`,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erreur de recherche");
      }

      const data = await response.json();
      console.log("[VetsScreen] Overpass response:", data.elements?.length, "results");

      const places: NearbyPlace[] = data.elements
        .map((el: any) => {
          const lat = el.lat || el.center?.lat;
          const lon = el.lon || el.center?.lon;
          if (!lat || !lon) return null;
          
          const name = el.tags?.name || 
            el.tags?.brand || 
            el.tags?.operator || 
            (el.tags?.amenity ? `${el.tags.amenity.charAt(0).toUpperCase()}${el.tags.amenity.slice(1)}` : null) ||
            (el.tags?.shop ? `${el.tags.shop.charAt(0).toUpperCase()}${el.tags.shop.slice(1)}` : null) ||
            'Établissement';
          
          return {
            id: el.id.toString(),
            name,
            lat,
            lon,
            type: categoryId,
            address: [
              el.tags?.["addr:housenumber"],
              el.tags?.["addr:street"],
              el.tags?.["addr:postcode"],
              el.tags?.["addr:city"],
            ].filter(Boolean).join(" ") || undefined,
            phone: el.tags?.phone || el.tags?.["contact:phone"],
            website: el.tags?.website || el.tags?.["contact:website"],
            openingHours: el.tags?.opening_hours,
          };
        })
        .filter((p: NearbyPlace | null): p is NearbyPlace => p !== null)
        .slice(0, 30);

      setNearbyPlaces(places);
      
      if (places.length === 0) {
        setSearchError("Aucun résultat trouvé dans un rayon de 25km. Essayez une autre catégorie ou ouvrez Google Maps.");
      }
    } catch (error) {
      console.log("[VetsScreen] search error:", error);
      setSearchError("Erreur lors de la recherche. Réessayez.");
    } finally {
      setIsSearching(false);
    }
  }, [coords]);

  useEffect(() => {
    if (coords) {
      searchNearbyPlaces("vet");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const openGoogleMaps = useCallback((query: string) => {
    let googleMapsUrl: string | undefined;
    let webFallback: string;

    if (coords) {
      const { latitude, longitude } = coords;
      googleMapsUrl = Platform.select({
        ios: `comgooglemaps://?q=${encodeURIComponent(query)}&center=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${encodeURIComponent(query)}`,
        default: `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`,
      });
      webFallback = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`;
    } else {
      // Sans localisation, recherche générale
      googleMapsUrl = undefined;
      webFallback = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    }

    if (googleMapsUrl) {
      Linking.canOpenURL(googleMapsUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(googleMapsUrl!);
          }
          return Linking.openURL(webFallback);
        })
        .catch(() => {
          Linking.openURL(webFallback).catch(() => {
            Alert.alert(t("common.error"), t("vets.cannotOpenMaps"));
          });
        });
    } else {
      Linking.openURL(webFallback).catch(() => {
        Alert.alert(t("common.error"), t("vets.cannotOpenMaps"));
      });
    }
  }, [coords, t]);

  const openPlaceDetails = useCallback((place: NearbyPlace) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`;
    Linking.openURL(url).catch(() => {
      Alert.alert(t("common.error"), t("vets.cannotOpenMaps"));
    });
  }, [t]);

  const callPlace = useCallback((phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, "")}`).catch(() => {
      Alert.alert(t("common.error"), "Impossible d'appeler ce numéro");
    });
  }, [t]);

  const mapMarkers: MapMarker[] = nearbyPlaces.map((place) => ({
    id: place.id,
    latitude: place.lat,
    longitude: place.lon,
    title: place.name,
    description: place.address,
    color: "#EF5350",
    emoji: "🏥",
    onPress: () => openPlaceDetails(place),
  }));

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
          {!coords ? (
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

          {/* Categories Grid - Always show with fallback search */}
          <>
              <Text style={styles.sectionTitle}>{coords ? t("vets.searchNearby") : "🔍 Recherche rapide"}</Text>
              {!coords && (
                <View style={styles.noLocationHint}>
                  <Text style={styles.noLocationHintText}>
                    Sans localisation, les recherches s&apos;ouvriront sur Google Maps
                  </Text>
                </View>
              )}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === category.id && styles.categoryChipActive,
                    ]}
                    onPress={() => searchNearbyPlaces(category.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.categoryChipIcon, { backgroundColor: category.color }]}>
                      {category.icon}
                    </View>
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === category.id && styles.categoryChipTextActive,
                    ]}>
                      {category.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Results Section */}
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>Recherche en cours...</Text>
                </View>
              ) : searchError ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{searchError}</Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => searchNearbyPlaces(selectedCategory)}
                  >
                    <Text style={styles.retryBtnText}>Réessayer</Text>
                  </TouchableOpacity>
                </View>
              ) : nearbyPlaces.length > 0 ? (
                <>
                  <View style={styles.resultsHeader}>
                    <Text style={styles.resultsCount}>
                      🏥 {nearbyPlaces.length} résultat{nearbyPlaces.length > 1 ? "s" : ""} trouvé{nearbyPlaces.length > 1 ? "s" : ""}
                    </Text>
                  </View>

                  {/* Native Map Section */}
                  {coords && <View style={styles.mapSection}>
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

                    {showMap && (
                      <View style={styles.mapContainer}>
                        <NativeMap
                          latitude={coords.latitude}
                          longitude={coords.longitude}
                          markers={mapMarkers}
                          height={280}
                          zoomLevel={13}
                          showUserLocation={true}
                        />
                      </View>
                    )}
                  </View>}

                  {/* Results List */}
                  <View style={styles.resultsList}>
                    {nearbyPlaces.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        style={styles.resultCard}
                        onPress={() => openPlaceDetails(place)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.resultIcon}>
                          <Stethoscope size={24} color="#fff" />
                        </View>
                        <View style={styles.resultContent}>
                          <Text style={styles.resultName} numberOfLines={1}>
                            {place.name}
                          </Text>
                          {place.address && (
                            <Text style={styles.resultAddress} numberOfLines={2}>
                              {place.address}
                            </Text>
                          )}
                          {place.openingHours && (
                            <Text style={styles.resultHours} numberOfLines={1}>
                              🕐 {place.openingHours}
                            </Text>
                          )}
                          <View style={styles.resultActions}>
                            {place.phone && (
                              <TouchableOpacity
                                style={styles.resultActionBtn}
                                onPress={() => callPlace(place.phone!)}
                              >
                                <Text style={styles.resultActionText}>📞 Appeler</Text>
                              </TouchableOpacity>
                            )}
                            <TouchableOpacity
                              style={styles.resultActionBtn}
                              onPress={() => openPlaceDetails(place)}
                            >
                              <Text style={styles.resultActionText}>📍 Itinéraire</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              ) : null}

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
  noLocationHint: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  noLocationHintText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
  },
  categoryScroll: {
    paddingBottom: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  categoryChipIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: Colors.primary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  retryBtnText: {
    color: Colors.background,
    fontWeight: "700",
    fontSize: 15,
  },
  resultsHeader: {
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  resultsList: {
    gap: 12,
    marginTop: 16,
  },
  resultCard: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  resultIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EF5350",
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 4,
  },
  resultAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 4,
  },
  resultHours: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  resultActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  resultActionBtn: {
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resultActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
});
