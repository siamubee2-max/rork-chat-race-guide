import React, { useState, useMemo, useEffect, useLayoutEffect } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Image } from "expo-image";
import { MapPin, Phone, Star, Navigation } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { BREEDERS, type Breeder } from "@/constants/breeders";
import { getBreedById } from "@/constants/breeds";
import { Colors } from "@/constants/colors";

export default function BreedersScreen() {
  const params = useLocalSearchParams<{ breedId?: string }>();
  const navigation = useNavigation();
  
  const [selectedBreeder, setSelectedBreeder] = useState<Breeder | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Élevages",
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        await Location.getCurrentPositionAsync({});
      }
    })();
  }, []);

  const breedId = params.breedId;
  const breed = getBreedById(breedId);
  
  const filteredBreeders = useMemo(() => {
    if (!breedId) return BREEDERS;
    return BREEDERS.filter(b => b.breedId === breedId);
  }, [breedId]);

  const initialRegion = useMemo(() => {
    if (filteredBreeders.length > 0) {
      // Center on the first breeder or calculate centroid
      // For simplicity, let's just take the first one
      return {
        latitude: filteredBreeders[0].latitude,
        longitude: filteredBreeders[0].longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };
    }
    // Default to a view of Europe/Atlantic if no breeders or general view
    return {
      latitude: 40,
      longitude: -30,
      latitudeDelta: 60,
      longitudeDelta: 60,
    };
  }, [filteredBreeders]);

  // Web Fallback
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.webContainer}>
          <Text style={styles.webTitle}>
            Élevages {breed ? `de ${breed.name}` : "dans le monde"}
          </Text>
          <Text style={styles.webSubtitle}>
             Découvrez les meilleurs élevages sélectionnés pour vous.
             Utilisez l&apos;application mobile pour la carte interactive.
          </Text>
          
          <ScrollView contentContainerStyle={styles.listContainer}>
            {filteredBreeders.map((breeder) => (
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
                    <View style={styles.cardInfo}>
                      <Phone size={16} color="#666" />
                      <Text style={styles.cardText}>{breeder.phone}</Text>
                    </View>
                </View>
              </View>
            ))}
            {filteredBreeders.length === 0 && (
                <Text style={styles.emptyText}>Aucun élevage trouvé pour cette sélection.</Text>
            )}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        rotateEnabled={false}
      >
        {filteredBreeders.map((breeder) => (
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

                    <View style={styles.locationRow}>
                        <MapPin size={14} color="#666" />
                        <Text style={styles.locationText}>{selectedBreeder.city}, {selectedBreeder.country}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.callButton]}>
                <Phone size={18} color="white" />
                <Text style={styles.actionButtonText}>Contacter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, styles.routeButton]}>
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
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
