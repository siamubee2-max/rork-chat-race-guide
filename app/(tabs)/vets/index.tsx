import React, { useState, useEffect } from "react";
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
import MapView, { Marker, PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import * as Location from "expo-location";
import { Navigation, MapPin, Phone, Clock, Stethoscope, Home, ShoppingBag, Hotel, Globe } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { Colors } from "@/constants/colors";

type PlaceType = "vet" | "shelter" | "shop" | "boarding";

interface Place {
  id: number;
  name: string;
  type: PlaceType;
  latitude: number;
  longitude: number;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  emoji: string;
  website?: string;
}

const PLACES: Place[] = [
  {
    id: 1,
    name: "Clinique Vétérinaire des Chats",
    type: "vet",
    latitude: 48.8566,
    longitude: 2.3522,
    address: "12 Rue des Chats, 75001 Paris",
    phone: "01 23 45 67 89",
    hours: "09:00 - 19:00",
    rating: 4.8,
    emoji: "🏥",
    website: "https://www.veterinaire.fr",
  },
  {
    id: 2,
    name: "Urgences Vétérinaires Paris",
    type: "vet",
    latitude: 48.8606,
    longitude: 2.3376,
    address: "45 Avenue de l'Opéra, 75002 Paris",
    phone: "01 98 76 54 32",
    hours: "24h/24",
    rating: 4.5,
    emoji: "🏥",
    website: "https://www.urgences-veterinaires-paris.fr",
  },
  {
    id: 3,
    name: "Cabinet Dr. Martin",
    type: "vet",
    latitude: 48.864716,
    longitude: 2.349014,
    address: "8 Rue Montorgueil, 75002 Paris",
    phone: "01 42 33 22 11",
    hours: "08:30 - 18:30",
    rating: 4.9,
    emoji: "🏥",
    website: "https://www.doctolib.fr",
  },
  {
    id: 11,
    name: "Refuge SPA Paris",
    type: "shelter",
    latitude: 48.8545,
    longitude: 2.3615,
    address: "22 Avenue de la Liberté, 75004 Paris",
    phone: "01 43 80 40 66",
    hours: "14:00 - 18:00",
    rating: 4.6,
    emoji: "🏠",
    website: "https://www.la-spa.fr",
  },
  {
    id: 12,
    name: "Association Chats Sans Toit",
    type: "shelter",
    latitude: 48.8465,
    longitude: 2.3456,
    address: "5 Rue de la Protection, 75006 Paris",
    phone: "01 42 19 30 55",
    hours: "10:00 - 17:00",
    rating: 4.8,
    emoji: "🏠",
    website: "https://www.secondechance.org",
  },
  {
    id: 13,
    name: "Refuge Chat'Perlipopette",
    type: "shelter",
    latitude: 48.8695,
    longitude: 2.3285,
    address: "18 Rue des Sauveteurs, 75018 Paris",
    phone: "01 48 25 35 45",
    hours: "13:00 - 19:00",
    rating: 4.7,
    emoji: "🏠",
    website: "https://www.adopte-un-chat.fr",
  },
  {
    id: 21,
    name: "Animalerie Féline Premium",
    type: "shop",
    latitude: 48.8505,
    longitude: 2.3488,
    address: "30 Rue du Commerce, 75005 Paris",
    phone: "01 45 87 65 43",
    hours: "09:30 - 19:30",
    rating: 4.5,
    emoji: "🛍️",
    website: "https://www.zooplus.fr",
  },
  {
    id: 22,
    name: "Litière & Compagnie",
    type: "shop",
    latitude: 48.8625,
    longitude: 2.3425,
    address: "14 Boulevard des Accessoires, 75009 Paris",
    phone: "01 47 25 36 98",
    hours: "10:00 - 20:00",
    rating: 4.4,
    emoji: "🛍️",
    website: "https://www.wanimo.com",
  },
  {
    id: 23,
    name: "PetStore Paris Centre",
    type: "shop",
    latitude: 48.8585,
    longitude: 2.3555,
    address: "8 Rue des Animaux, 75003 Paris",
    phone: "01 42 74 85 96",
    hours: "09:00 - 19:00",
    rating: 4.6,
    emoji: "🛍️",
    website: "https://www.animalis.com",
  },
  {
    id: 31,
    name: "Pension Chat'Teau",
    type: "boarding",
    latitude: 48.8445,
    longitude: 2.3565,
    address: "25 Avenue du Repos, 75013 Paris",
    phone: "01 45 65 78 90",
    hours: "08:00 - 20:00",
    rating: 4.9,
    emoji: "🏨",
    website: "https://www.emprunte-mon-toutou.com",
  },
  {
    id: 32,
    name: "Hôtel Félin Luxe",
    type: "boarding",
    latitude: 48.8745,
    longitude: 2.3305,
    address: "12 Rue du Confort, 75017 Paris",
    phone: "01 48 88 99 00",
    hours: "24h/24",
    rating: 4.8,
    emoji: "🏨",
    website: "https://www.garde-animaux.fr",
  },
  {
    id: 33,
    name: "Cat Paradise Pension",
    type: "boarding",
    latitude: 48.8385,
    longitude: 2.3485,
    address: "40 Rue des Vacances, 75014 Paris",
    phone: "01 43 27 38 49",
    hours: "07:00 - 21:00",
    rating: 4.7,
    emoji: "🏨",
    website: "https://www.rover.com/fr",
  },
];

export default function VetsScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [filter, setFilter] = useState<PlaceType | "all">("all");

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

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

  const handleNavigate = async (latitude: number, longitude: number, name: string) => {
    const googleMapsAppUrl = Platform.OS === 'ios' 
      ? `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`
      : `google.navigation:q=${latitude},${longitude}`;
    const googleMapsWebUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    
    if (Platform.OS === 'web') {
      Linking.openURL(googleMapsWebUrl).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
      });
      return;
    }
    
    try {
      const canOpen = await Linking.canOpenURL(googleMapsAppUrl);
      if (canOpen) {
        await Linking.openURL(googleMapsAppUrl);
      } else {
        await Linking.openURL(googleMapsWebUrl);
      }
    } catch {
      Linking.openURL(googleMapsWebUrl).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir Google Maps");
      });
    }
  };

  const handleOpenWebsite = (website: string) => {
    Linking.openURL(website).catch(() => {
      Alert.alert(
        "Erreur",
        "Impossible d'ouvrir le site web"
      );
    });
  };

  const initialRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const currentRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : initialRegion;

  if (Platform.OS === "web") {
    const filteredPlaces = PLACES.filter((place) => filter === "all" || place.type === filter);
    
    return (
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.webContainer}>
          <Text style={styles.webTitle}>Services pour chats à proximité</Text>
          <Text style={styles.webSubtitle}>
            La carte n&apos;est pas entièrement supportée sur la version web. Veuillez utiliser l&apos;application mobile pour une meilleure expérience.
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.webFilterScroll}
            contentContainerStyle={styles.webFilterContainer}
          >
            <TouchableOpacity
              style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
              onPress={() => setFilter("all")}
            >
              <MapPin size={18} color={filter === "all" ? "white" : Colors.primary} />
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>Tout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === "vet" && styles.filterTabActive]}
              onPress={() => setFilter("vet")}
            >
              <Stethoscope size={18} color={filter === "vet" ? "white" : Colors.primary} />
              <Text style={[styles.filterText, filter === "vet" && styles.filterTextActive]}>Vétérinaires</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === "shelter" && styles.filterTabActive]}
              onPress={() => setFilter("shelter")}
            >
              <Home size={18} color={filter === "shelter" ? "white" : Colors.primary} />
              <Text style={[styles.filterText, filter === "shelter" && styles.filterTextActive]}>Refuges</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === "shop" && styles.filterTabActive]}
              onPress={() => setFilter("shop")}
            >
              <ShoppingBag size={18} color={filter === "shop" ? "white" : Colors.primary} />
              <Text style={[styles.filterText, filter === "shop" && styles.filterTextActive]}>Litière</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, filter === "boarding" && styles.filterTabActive]}
              onPress={() => setFilter("boarding")}
            >
              <Hotel size={18} color={filter === "boarding" ? "white" : Colors.primary} />
              <Text style={[styles.filterText, filter === "boarding" && styles.filterTextActive]}>Pensions</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <View style={styles.listContainer}>
            {filteredPlaces.map((place) => (
              <View key={place.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{place.emoji} {place.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {place.rating}</Text>
                  </View>
                </View>
                <View style={styles.cardInfo}>
                  <MapPin size={16} color="#666" />
                  <Text style={styles.cardText}>{place.address}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Phone size={16} color="#666" />
                  <Text style={styles.cardText}>{place.phone}</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Clock size={16} color="#666" />
                  <Text style={styles.cardText}>{place.hours}</Text>
                </View>
                <View style={styles.webActionButtons}>
                  <TouchableOpacity 
                    style={[styles.webActionButton, styles.callButton]}
                    onPress={() => handleCall(place.phone)}
                  >
                    <Phone size={18} color="white" />
                    <Text style={styles.actionButtonText}>Appeler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.webActionButton, styles.routeButton]}
                    onPress={() => handleNavigate(place.latitude, place.longitude, place.name)}
                  >
                    <Navigation size={18} color="white" />
                    <Text style={styles.actionButtonText}>Itinéraire</Text>
                  </TouchableOpacity>
                  {place.website && (
                    <TouchableOpacity 
                      style={[styles.webActionButton, styles.websiteButton]}
                      onPress={() => handleOpenWebsite(place.website!)}
                    >
                      <Globe size={18} color="white" />
                      <Text style={styles.actionButtonText}>Site web</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        region={currentRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {PLACES.filter((place) => filter === "all" || place.type === filter).map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: place.latitude,
              longitude: place.longitude,
            }}
            title={place.name}
            description={place.address}
            onPress={() => setSelectedPlace(place)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.marker}>
                <Text style={styles.markerText}>{place.emoji}</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
          </Marker>
        ))}
      </MapView>
      
      <SafeAreaView style={styles.headerOverlay} pointerEvents="box-none">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContainer}
          style={styles.filterScroll}
        >
          <TouchableOpacity
            style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
            onPress={() => setFilter("all")}
          >
            <MapPin size={18} color={filter === "all" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
              Tout
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "vet" && styles.filterTabActive]}
            onPress={() => setFilter("vet")}
          >
            <Stethoscope size={18} color={filter === "vet" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "vet" && styles.filterTextActive]}>
              Vétérinaires
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "shelter" && styles.filterTabActive]}
            onPress={() => setFilter("shelter")}
          >
            <Home size={18} color={filter === "shelter" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "shelter" && styles.filterTextActive]}>
              Refuges
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "shop" && styles.filterTabActive]}
            onPress={() => setFilter("shop")}
          >
            <ShoppingBag size={18} color={filter === "shop" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "shop" && styles.filterTextActive]}>
              Litière
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === "boarding" && styles.filterTabActive]}
            onPress={() => setFilter("boarding")}
          >
            <Hotel size={18} color={filter === "boarding" ? "white" : Colors.primary} />
            <Text style={[styles.filterText, filter === "boarding" && styles.filterTextActive]}>
              Pensions
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {selectedPlace && (
        <View style={styles.cardWrapper}>
          <BlurView intensity={80} tint="light" style={styles.floatingCard}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{selectedPlace.emoji} {selectedPlace.name}</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.stars}>{"★".repeat(Math.floor(selectedPlace.rating))}</Text>
                  <Text style={styles.ratingValue}>{selectedPlace.rating}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setSelectedPlace(null)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.detailRow}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.detailText} numberOfLines={2}>{selectedPlace.address}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Clock size={18} color={Colors.primary} />
              <Text style={styles.detailText}>{selectedPlace.hours}</Text>
            </View>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.callButton]}
                onPress={() => handleCall(selectedPlace.phone)}
              >
                <Phone size={20} color="white" />
                <Text style={styles.actionButtonText}>Appeler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.routeButton]}
                onPress={() => handleNavigate(selectedPlace.latitude, selectedPlace.longitude, selectedPlace.name)}
              >
                <Navigation size={20} color="white" />
                <Text style={styles.actionButtonText}>Y aller</Text>
              </TouchableOpacity>
            </View>
            
            {selectedPlace.website && (
              <TouchableOpacity 
                style={[styles.websiteButtonFull]}
                onPress={() => handleOpenWebsite(selectedPlace.website!)}
              >
                <Globe size={20} color="white" />
                <Text style={styles.actionButtonText}>Visiter le site web</Text>
              </TouchableOpacity>
            )}
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
    marginBottom: 20,
    lineHeight: 24,
  },
  listContainer: {
    gap: 16,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    backgroundColor: Colors.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 20,
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid' as const,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 0,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  cardWrapper: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stars: {
    color: "#FFD700",
    fontSize: 14,
    marginRight: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: "#444",
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#1a1a1a',
  },
  routeButton: {
    backgroundColor: Colors.primary,
  },
  websiteButton: {
    backgroundColor: '#6366F1',
  },
  websiteButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    backgroundColor: '#6366F1',
    marginTop: 12,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: "600",
    fontSize: 16,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  filterScroll: {
    marginTop: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  filterTextActive: {
    color: 'white',
  },
  webFilterScroll: {
    marginVertical: 20,
  },
  webFilterContainer: {
    gap: 10,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ratingBadge: {
    backgroundColor: '#FFF9C4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#FBC02D',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
  webActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  webActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
});
