import React, { useState, useMemo, useEffect, useLayoutEffect } from "react";
import { StyleSheet, View, Text, Platform, TouchableOpacity, ScrollView } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useNavigation } from "expo-router";
import { Image } from "expo-image";
import { MapPin, Phone, Navigation, Heart, PawPrint } from "lucide-react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";

import { SHELTERS, type Shelter } from "@/constants/shelters";

export default function SheltersScreen() {
  const navigation = useNavigation();
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Refuges",
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          await Location.getCurrentPositionAsync({});
        }
      }
    })();
  }, []);

  const initialRegion = useMemo(() => {
    if (SHELTERS.length > 0) {
      return {
        latitude: SHELTERS[0].latitude,
        longitude: SHELTERS[0].longitude,
        latitudeDelta: 10,
        longitudeDelta: 10,
      };
    }
    return {
      latitude: 46.5,
      longitude: 2.5,
      latitudeDelta: 15,
      longitudeDelta: 15,
    };
  }, []);

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.webContainer}>
          <Text style={styles.webTitle}>Refuges & Associations</Text>
          <Text style={styles.webSubtitle}>
            Découvrez les refuges près de chez vous. Adoptez, n&apos;achetez pas !
            Utilisez l&apos;application mobile pour la carte interactive.
          </Text>

          <ScrollView contentContainerStyle={styles.listContainer}>
            {SHELTERS.map((shelter) => (
              <View key={shelter.id} style={styles.card}>
                <Image source={{ uri: shelter.imageUri }} style={styles.webCardImage} contentFit="cover" />
                <View style={styles.webCardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{shelter.name}</Text>
                    <View style={styles.animalsBadge}>
                      <PawPrint size={12} color="#E8835A" />
                      <Text style={styles.animalsText}>{shelter.focus}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardDescription} numberOfLines={2}>{shelter.description}</Text>
                  <View style={styles.cardInfo}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.cardText}>{shelter.city}, {shelter.country}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Phone size={16} color="#666" />
                    <Text style={styles.cardText}>{shelter.phone}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        rotateEnabled={false}
      >
        {SHELTERS.map((shelter) => (
          <Marker
            key={shelter.id}
            coordinate={{
              latitude: shelter.latitude,
              longitude: shelter.longitude,
            }}
            onPress={() => setSelectedShelter(shelter)}
          >
            <View style={styles.markerContainer}>
              <View style={[styles.marker, selectedShelter?.id === shelter.id && styles.markerActive]}>
                <Heart
                  size={20}
                  color={selectedShelter?.id === shelter.id ? "#fff" : "#E8835A"}
                  fill={selectedShelter?.id === shelter.id ? "#fff" : "transparent"}
                />
              </View>
              <View style={[styles.markerArrow, selectedShelter?.id === shelter.id && styles.markerArrowActive]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {selectedShelter && (
        <View style={styles.cardWrapper}>
          <BlurView intensity={90} tint="light" style={styles.floatingCard}>
            <View style={styles.cardContent}>
              <View style={styles.cardImageContainer}>
                <Image source={{ uri: selectedShelter.imageUri }} style={styles.cardImage} contentFit="cover" />
              </View>

              <View style={styles.cardDetails}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{selectedShelter.name}</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedShelter(null)}
                    hitSlop={10}
                  >
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.animalsRow}>
                  <PawPrint size={14} color="#E8835A" />
                  <Text style={styles.animalsValue}>{selectedShelter.focus}</Text>
                </View>

                <View style={styles.locationRow}>
                  <MapPin size={14} color="#666" />
                  <Text style={styles.locationText}>{selectedShelter.city}, {selectedShelter.country}</Text>
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
    width: "100%",
    alignSelf: "center",
  },
  webTitle: {
    fontSize: 28,
    fontWeight: "bold" as const,
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
    backgroundColor: "white",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    flexDirection: "row",
  },
  webCardImage: {
    width: 120,
    height: 120,
  },
  webCardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
  },
  cardDescription: {
    fontSize: 13,
    color: "#888",
    marginBottom: 6,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    backgroundColor: "white",
    padding: 8,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#E8835A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  markerActive: {
    backgroundColor: "#E8835A",
    borderColor: "#E8835A",
    transform: [{ scale: 1.1 }],
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#E8835A",
    marginTop: -1,
  },
  markerArrowActive: {
    borderTopColor: "#E8835A",
  },
  cardWrapper: {
    position: "absolute",
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
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  cardContent: {
    flexDirection: "row",
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
    backgroundColor: "#eee",
  },
  cardDetails: {
    flex: 1,
    justifyContent: "center",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold" as const,
    marginTop: -2,
  },
  animalsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  animalsValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#E8835A",
  },
  animalsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(232, 131, 90, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  animalsText: {
    color: "#E8835A",
    fontWeight: "bold" as const,
    fontSize: 12,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#555",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.06)",
    marginVertical: 16,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  callButton: {
    backgroundColor: "#1a1a1a",
  },
  routeButton: {
    backgroundColor: "#E8835A",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "600" as const,
    fontSize: 15,
  },
});
