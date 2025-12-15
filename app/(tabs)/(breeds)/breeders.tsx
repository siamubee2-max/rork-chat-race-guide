import React, { useState, useMemo, useCallback } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity, ScrollView, Linking, Alert } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import { useLocalSearchParams, Stack } from "expo-router";
import { Image } from "expo-image";
import { MapPin, Phone, Star, Navigation } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";

import { BREEDERS, type Breeder } from "@/constants/breeders";
import { getBreedById } from "@/constants/breeds";
import { Colors } from "@/constants/colors";
import { useUserLocation } from "@/context/user-location";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  if (km >= 1000) {
    return `${Math.round(km)} km`;
  }
  return `${km.toFixed(1)} km`;
}

export default function BreedersScreen() {
  const params = useLocalSearchParams<{ breedId?: string }>();
  const { coords, address, permission, error: locationError, locateOnce, isLocating } = useUserLocation();
  
  const [selectedBreeder, setSelectedBreeder] = useState<Breeder | null>(null);
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  const handleRequestLocation = useCallback(() => {
    console.log("[BreedersScreen] user requested location");
    setHasAskedPermission(true);
    void locateOnce();
  }, [locateOnce]);

  const breedId = params.breedId;
  const breed = getBreedById(breedId);
  
  const sortedAndFilteredBreeders = useMemo(() => {
    const filtered = breedId ? BREEDERS.filter(b => b.breedId === breedId) : BREEDERS;
    
    if (!coords) return filtered.map(b => ({ ...b, distance: undefined }));
    
    return filtered
      .map(breeder => ({
        ...breeder,
        distance: calculateDistance(
          coords.latitude,
          coords.longitude,
          breeder.latitude,
          breeder.longitude
        ),
      }))
      .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  }, [breedId, coords]);

  const initialRegion = useMemo(() => {
    if (coords) {
      return {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };
    }
    if (sortedAndFilteredBreeders.length > 0) {
      return {
        latitude: sortedAndFilteredBreeders[0].latitude,
        longitude: sortedAndFilteredBreeders[0].longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };
    }
    return {
      latitude: 40,
      longitude: -30,
      latitudeDelta: 60,
      longitudeDelta: 60,
    };
  }, [sortedAndFilteredBreeders, coords]);

  const handleRelocate = useCallback(() => {
    console.log("[BreedersScreen] handleRelocate");
    void locateOnce();
  }, [locateOnce]);

  const webLocationLine = useMemo(() => {
    if (permission === "denied") return "Localisation refusée.";
    if (permission === "unavailable") return "Localisation indisponible.";
    if (locationError?.message) return locationError.message;

    const label = address?.label;
    if (!label && !coords) return "Localisation en cours…";
    if (label) return `Votre position: ${label}`;
    return `Votre position: ${coords?.latitude.toFixed(6)}, ${coords?.longitude.toFixed(6)}`;
  }, [address?.label, coords, locationError?.message, permission]);

  const handleCall = (phone: string) => {
    if (Platform.OS === 'web') {
      Alert.alert(
        "Appeler",
        `Composez ce numéro : ${phone}`,
        [{ text: "OK" }]
      );
    } else {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleNavigate = async (latitude: number, longitude: number) => {
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    if (Platform.OS === 'web') {
      Linking.openURL(googleMapsWebUrl).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
      });
      return;
    }
    
    if (Platform.OS === 'android') {
      const googleMapsAppUrl = `google.navigation:q=${latitude},${longitude}`;
      try {
        const canOpen = await Linking.canOpenURL(googleMapsAppUrl);
        if (canOpen) {
          await Linking.openURL(googleMapsAppUrl);
          return;
        }
      } catch {}
    }
    
    // Toujours ouvrir Google Maps web (évite Apple Maps sur iOS)
    Linking.openURL(googleMapsWebUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
    });
  };

  // Web + iOS Fallback
  if (Platform.OS !== "android") {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Élevages" }} />
        <SafeAreaView edges={["top"]} style={styles.webContainer}>
          <Text style={styles.webTitle}>
            Élevages {breed ? `de ${breed.name}` : "dans le monde"}
          </Text>
          <Text style={styles.webSubtitle}>
             {Platform.OS === "web"
               ? "Découvrez les meilleurs élevages sélectionnés pour vous. Utilisez l'application mobile pour la carte interactive."
               : "Sur iPhone, la carte intégrée utilise Apple Plans. Utilisez plutôt les boutons Google Maps ci-dessous."}
          </Text>

          {!hasAskedPermission && permission === "unknown" ? (
            <View style={styles.permissionCard}>
              <View style={styles.permissionIcon}>
                <MapPin size={28} color={Colors.primary} />
              </View>
              <Text style={styles.permissionTitle}>Autoriser la localisation</Text>
              <Text style={styles.permissionText}>
                Pour trier les élevages du plus proche au plus éloigné.
              </Text>
              <TouchableOpacity
                testID="breeders-request-location"
                onPress={handleRequestLocation}
                style={styles.permissionBtn}
              >
                <Navigation size={16} color="white" />
                <Text style={styles.permissionBtnText}>
                  {isLocating ? "Localisation..." : "Me localiser"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>{webLocationLine}</Text>
              <TouchableOpacity
                testID="breeders-relocate"
                onPress={handleRelocate}
                style={styles.locationBtn}
              >
                <Text style={styles.locationBtnText}>{isLocating ? "..." : "Actualiser"}</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <ScrollView contentContainerStyle={styles.listContainer}>
            {sortedAndFilteredBreeders.map((breeder) => (
              <View key={breeder.id} style={styles.card}>
                <Image source={{ uri: breeder.imageUri }} style={styles.webCardImage} contentFit="cover" />
                <View style={styles.webCardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{breeder.name}</Text>
                      <View style={styles.ratingBadge}>
                        <Text style={styles.ratingText}>★ {breeder.rating}</Text>
                      </View>
                    </View>
                    <View style={styles.cardInfo}>
                      <MapPin size={16} color="#666" />
                      <Text style={styles.cardText}>{breeder.city}, {breeder.country}</Text>
                    </View>
                    {breeder.distance !== undefined && (
                      <View style={styles.distanceBadge}>
                        <Navigation size={14} color={Colors.primary} />
                        <Text style={styles.distanceText}>{formatDistance(breeder.distance)}</Text>
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <Phone size={16} color="#666" />
                      <Text style={styles.cardText}>{breeder.phone}</Text>
                    </View>
                </View>
              </View>
            ))}
            {sortedAndFilteredBreeders.length === 0 && (
                <Text style={styles.emptyText}>Aucun élevage trouvé pour cette sélection.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
            headerTitle: breed ? `Élevages ${breed.name}` : "Élevages Monde",
            headerTransparent: true,
            headerBlurEffect: "regular",
            headerStyle: {
                backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.9)' : undefined
            }
        }} 
      />
      
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        rotateEnabled={false}
      >
        {sortedAndFilteredBreeders.map((breeder) => (
          <Marker
            key={breeder.id}
            coordinate={{
              latitude: breeder.latitude,
              longitude: breeder.longitude,
            }}
            onPress={() => setSelectedBreeder(breeder)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, selectedBreeder?.id === breeder.id && styles.markerActive]}>
                <Image 
                    source={{ uri: breeder.imageUri }} 
                    style={styles.markerImage} 
                />
              </View>
              <View style={[styles.markerArrow, selectedBreeder?.id === breeder.id && styles.markerArrowActive]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Info Card */}
      {selectedBreeder && (
        <View style={styles.cardWrapper}>
          <BlurView intensity={90} tint="light" style={styles.floatingCard}>
            <View style={styles.cardContent}>
                <View style={styles.cardImageContainer}>
                    <Image source={{ uri: selectedBreeder.imageUri }} style={styles.cardImage} contentFit="cover" />
                </View>
                
                <View style={styles.cardDetails}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle} numberOfLines={1}>{selectedBreeder.name}</Text>
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setSelectedBreeder(null)}
                            hitSlop={10}
                        >
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.ratingRow}>
                        <Star size={14} color="#FFD700" fill="#FFD700" />
                        <Text style={styles.ratingValue}>{selectedBreeder.rating}</Text>
                        <Text style={styles.breedTag}>
                            {getBreedById(selectedBreeder.breedId)?.name}
                        </Text>
                    </View>

                    <View style={styles.breederLocationRow}>
                        <MapPin size={14} color="#666" />
                        <Text style={styles.breederLocationText}>{selectedBreeder.city}, {selectedBreeder.country}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall(selectedBreeder.phone)}
              >
                <Phone size={18} color="white" />
                <Text style={styles.actionButtonText}>Contacter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.routeButton]}
                onPress={() => handleNavigate(selectedBreeder.latitude, selectedBreeder.longitude)}
              >
                <Navigation size={18} color="white" />
                <Text style={styles.actionButtonText}>Itinéraire</Text>
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  webContainer: {
    flex: 1,
    padding: 20,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  webTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  webSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    lineHeight: 24,
  },
  listContainer: {
    gap: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  webCardImage: {
    width: 120,
    height: 120,
  },
  webCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 14,
  },
  locationText: {
    flex: 1,
    fontSize: 13,
    color: "#444",
    lineHeight: 18,
  },
  locationBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.primary,
  },
  locationBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  permissionText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  permissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  permissionBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  
  // Marker Styles
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: 'white',
    padding: 3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 48,
    height: 48,
  },
  markerActive: {
    borderColor: '#FBC02D',
    transform: [{ scale: 1.1 }],
  },
  markerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  markerArrowActive: {
    borderTopColor: '#FBC02D',
  },

  // Floating Card Styles
  cardWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCard: {
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cardContent: {
    flexDirection: 'row',
    gap: 14,
  },
  cardImageContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#eee',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
    marginTop: -2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  ratingBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  ratingText: {
    color: '#FBC02D',
    fontWeight: 'bold',
    fontSize: 12,
  },
  breedTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    overflow: 'hidden',
    marginLeft: 6,
  },
  breederLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  breederLocationText: {
    fontSize: 14,
    color: "#666",
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#1a1a1a',
  },
  routeButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: "600",
    fontSize: 15,
  },
});
