import React, { useMemo, useState, useCallback } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Plus, AlertTriangle, MapPin, Phone, CheckCircle, PhoneCall, Globe, Navigation } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Linking,
  Platform,
  Alert,
  type ListRenderItem,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEmergency, type EmergencyAlert } from "@/context/emergency";
import { useUserLocation } from "@/context/user-location";
import { Colors } from "@/constants/colors";

const EMERGENCY_TYPES = {
  lost: { label: "Perdu", color: "#FF6B6B", icon: "🔍" },
  injured: { label: "Blessé", color: "#FF8C42", icon: "🚑" },
  found: { label: "Trouvé", color: "#4ECDC4", icon: "✨" },
};

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  description: string;
  color: string;
  icon: string;
  website: string;
  country: string;
};

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  // France
  {
    id: "poison-fr",
    name: "Centre Antipoison Animal",
    phone: "01 48 94 31 00",
    description: "CNITV Alfort - Disponible 24h/24",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.centre-antipoison-animal.com",
    country: "France",
  },
  {
    id: "vet-fr",
    name: "Vétérinaire de Garde",
    phone: "3115",
    description: "Service national 24h/24",
    color: "#059669",
    icon: "🏥",
    website: "https://www.veterinaire-garde.fr",
    country: "France",
  },
  {
    id: "icad-fr",
    name: "I-CAD Chat Perdu",
    phone: "0 810 778 778",
    description: "Déclaration de perte/vol",
    color: "#2563EB",
    icon: "🔍",
    website: "https://www.i-cad.fr",
    country: "France",
  },
  {
    id: "spa-fr",
    name: "SPA Urgences",
    phone: "01 43 80 40 66",
    description: "Protection animale",
    color: "#7C3AED",
    icon: "🐾",
    website: "https://www.la-spa.fr",
    country: "France",
  },
  // Belgium
  {
    id: "poison-be",
    name: "Centre Antipoison Belgique",
    phone: "070 245 245",
    description: "Urgences 24h/24",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.centreantipoisons.be",
    country: "Belgium",
  },
  {
    id: "vet-be",
    name: "Vétérinaire de Garde Belgique",
    phone: "1733",
    description: "Service vétérinaire de garde",
    color: "#059669",
    icon: "🏥",
    website: "https://www.docteur-de-garde.be",
    country: "Belgium",
  },
  // Switzerland
  {
    id: "poison-ch",
    name: "Tox Info Suisse",
    phone: "145",
    description: "Centre antipoison 24h/24",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.toxinfo.ch",
    country: "Switzerland",
  },
  {
    id: "vet-ch",
    name: "Vétérinaire de Garde Suisse",
    phone: "0900 900 032",
    description: "Service vétérinaire 24h/24",
    color: "#059669",
    icon: "🏥",
    website: "https://www.gstsvs.ch",
    country: "Switzerland",
  },
  // Canada
  {
    id: "poison-ca",
    name: "Centre Antipoison Québec",
    phone: "1 800 463 5060",
    description: "Urgences 24h/24",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.ciusss-capitalenationale.gouv.qc.ca",
    country: "Canada",
  },
  {
    id: "vet-ca",
    name: "Urgence Vétérinaire Montréal",
    phone: "514 931 0851",
    description: "Hôpital vétérinaire 24h/24",
    color: "#059669",
    icon: "🏥",
    website: "https://www.dfrvet.com",
    country: "Canada",
  },
  // USA
  {
    id: "poison-us",
    name: "ASPCA Poison Control",
    phone: "888 426 4435",
    description: "Animal Poison Control 24/7",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.aspca.org/pet-care/animal-poison-control",
    country: "United States",
  },
  {
    id: "vet-us",
    name: "Emergency Vet Finder",
    phone: "911",
    description: "Find local emergency vet",
    color: "#059669",
    icon: "🏥",
    website: "https://www.aaha.org/your-pet/pet-owner-education/ask-aaha/find-hospital/",
    country: "United States",
  },
  // UK
  {
    id: "poison-uk",
    name: "Animal PoisonLine UK",
    phone: "01onal 202 509 000",
    description: "24-hour emergency service",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.animalpoisonline.co.uk",
    country: "United Kingdom",
  },
  {
    id: "vet-uk",
    name: "Vets Now UK",
    phone: "0800 011 9493",
    description: "Emergency vets 24/7",
    color: "#059669",
    icon: "🏥",
    website: "https://www.vets-now.com",
    country: "United Kingdom",
  },
  // Germany
  {
    id: "poison-de",
    name: "Giftnotruf Berlin",
    phone: "030 19240",
    description: "Vergiftungsnotfall 24h",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.giftnotruf.de",
    country: "Germany",
  },
  {
    id: "vet-de",
    name: "Tierärztlicher Notdienst",
    phone: "116117",
    description: "Tierärztlicher Bereitschaftsdienst",
    color: "#059669",
    icon: "🏥",
    website: "https://www.bundestieraerztekammer.de",
    country: "Germany",
  },
  // Spain
  {
    id: "poison-es",
    name: "Servicio de Toxicología",
    phone: "91 562 04 20",
    description: "Instituto Nacional de Toxicología",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.mscbs.gob.es",
    country: "Spain",
  },
  {
    id: "vet-es",
    name: "Veterinario de Urgencias",
    phone: "900 104 946",
    description: "Servicio veterinario 24h",
    color: "#059669",
    icon: "🏥",
    website: "https://www.hospitalveterinari.com",
    country: "Spain",
  },
  // Italy
  {
    id: "poison-it",
    name: "Centro Antiveleni",
    phone: "02 66101029",
    description: "Centro Antiveleni Milano",
    color: "#DC2626",
    icon: "☠️",
    website: "https://www.centroantiveleni.org",
    country: "Italy",
  },
  {
    id: "vet-it",
    name: "Veterinario di Guardia",
    phone: "800 274 274",
    description: "Pronto soccorso veterinario",
    color: "#059669",
    icon: "🏥",
    website: "https://www.fnovi.it",
    country: "Italy",
  },
];

export default function EmergencyListScreen() {
  const { alerts } = useEmergency();
  const insets = useSafeAreaInsets();
  const { address, permission, locateOnce, isLocating } = useUserLocation();
  const [hasAskedPermission, setHasAskedPermission] = useState(false);

  const handleRequestLocation = useCallback(() => {
    console.log("[EmergencyScreen] user requested location");
    setHasAskedPermission(true);
    void locateOnce();
  }, [locateOnce]);

  const userCountry = address?.country;

  const filteredContacts = useMemo(() => {
    if (!userCountry) {
      return EMERGENCY_CONTACTS.filter(c => c.country === "France");
    }
    const countryContacts = EMERGENCY_CONTACTS.filter(c => c.country === userCountry);
    if (countryContacts.length > 0) {
      return countryContacts;
    }
    return EMERGENCY_CONTACTS.filter(c => c.country === "France");
  }, [userCountry]);

  const onCreateAlert = () => {
    router.push("/(tabs)/emergency/create" as any);
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);

  const renderItem: ListRenderItem<EmergencyAlert> = ({ item }) => {
    const typeInfo = EMERGENCY_TYPES[item.type];
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed ? { transform: [{ scale: 0.98 }] } : null,
        ]}
      >
        <View style={[styles.statusBadge, { backgroundColor: typeInfo.color }]}>
          <Text style={styles.statusEmoji}>{typeInfo.icon}</Text>
          <Text style={styles.statusText}>{typeInfo.label}</Text>
        </View>

        <View style={styles.cardContent}>
          {item.catImageUri && (
            <Image
              source={{ uri: item.catImageUri }}
              style={styles.catImage}
              contentFit="cover"
            />
          )}

          <View style={styles.cardInfo}>
            <Text style={styles.catName}>{item.catName}</Text>
            {item.catBreed && (
              <Text style={styles.catBreed}>{item.catBreed}</Text>
            )}
            
            {item.microchip && (
              <View style={styles.chipBadge}>
                <Text style={styles.chipText}>Puce: {item.microchip}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <MapPin color="#666" size={14} />
              <Text style={styles.infoText}>{item.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Phone color="#666" size={14} />
              <Text style={styles.infoText}>{item.contactPhone}</Text>
            </View>

            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            <Text style={styles.date}>{formattedDate}</Text>
          </View>
        </View>

        {item.resolved && (
          <View style={styles.resolvedBadge}>
            <CheckCircle color="#10B981" size={16} />
            <Text style={styles.resolvedText}>Résolu</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const handleCallEmergency = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    if (Platform.OS === 'web') {
      Alert.alert(
        "Appeler",
        `Composez ce numéro : ${phone}`,
        [
          { text: "OK" }
        ]
      );
    } else {
      Linking.openURL(`tel:${cleanPhone}`).catch(() => {
        Alert.alert("Erreur", "Impossible d'ouvrir l'application téléphone");
      });
    }
  };

  const handleOpenWebsite = (website: string) => {
    Linking.openURL(website).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir le site web");
    });
  };

  const EmergencyContactsHeader = () => (
    <View style={styles.emergencySection}>
      <Text style={styles.emergencyTitle}>📞 Numéros d&apos;Urgence</Text>
      
      {!hasAskedPermission && permission === "unknown" ? (
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <MapPin size={28} color={Colors.primary} />
          </View>
          <Text style={styles.permissionTitle}>Localisation</Text>
          <Text style={styles.permissionText}>
            Autorisez la localisation pour afficher les numéros d&apos;urgence de votre pays.
          </Text>
          <TouchableOpacity
            testID="emergency-request-location"
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
        <View style={styles.countryBadge}>
          <MapPin size={14} color={Colors.primary} />
          <Text style={styles.countryText}>
            {userCountry ? `Pays détecté : ${userCountry}` : "France (par défaut)"}
          </Text>
          <TouchableOpacity onPress={() => { setHasAskedPermission(true); void locateOnce(); }}>
            <Text style={styles.refreshText}>Actualiser</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {filteredContacts.map((contact) => (
        <View key={contact.id} style={styles.emergencyCardWrapper}>
          <View
            style={[
              styles.emergencyCard,
              { backgroundColor: contact.color },
            ]}
          >
            <View style={styles.emergencyCardLeft}>
              <Text style={styles.emergencyIcon}>{contact.icon}</Text>
              <View style={styles.emergencyCardInfo}>
                <Text style={styles.emergencyCardName}>{contact.name}</Text>
                <Text style={styles.emergencyCardDesc}>{contact.description}</Text>
              </View>
            </View>
            <View style={styles.emergencyCardRight}>
              <Text style={styles.emergencyPhone}>{contact.phone}</Text>
            </View>
          </View>
          <View style={styles.emergencyActions}>
            <Pressable
              style={({ pressed }) => [
                styles.emergencyActionBtn,
                styles.callBtn,
                pressed ? { opacity: 0.8 } : null,
              ]}
              onPress={() => handleCallEmergency(contact.phone)}
            >
              <PhoneCall color="#fff" size={18} />
              <Text style={styles.emergencyActionText}>Appeler</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.emergencyActionBtn,
                styles.webBtn,
                pressed ? { opacity: 0.8 } : null,
              ]}
              onPress={() => handleOpenWebsite(contact.website)}
            >
              <Globe color="#fff" size={18} />
              <Text style={styles.emergencyActionText}>Site web</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <AlertTriangle color="#ccc" size={48} />
      </View>
      <Text style={styles.emptyTitle}>Aucune alerte active</Text>
      <Text style={styles.emptyText}>
        Créez une alerte d&apos;urgence si votre chat est perdu, blessé, ou si vous avez trouvé un chat
      </Text>
      <Pressable onPress={onCreateAlert} style={styles.emptyBtn}>
        <Plus color="#fff" size={20} />
        <Text style={styles.emptyBtnText}>Créer une alerte</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={activeAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          activeAlerts.length === 0 && styles.listContentEmpty,
        ]}
        ListHeaderComponent={EmergencyContactsHeader}
        ListEmptyComponent={EmptyState}
      />

      {activeAlerts.length > 0 && (
        <View
          style={[
            styles.fabContainer,
            { bottom: insets.bottom + 20 },
          ]}
        >
          <Pressable onPress={onCreateAlert} style={styles.fab}>
            <Plus color="#fff" size={24} />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textTransform: "uppercase",
  },
  cardContent: {
    padding: 16,
  },
  catImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f5f5f5",
  },
  cardInfo: {
    gap: 8,
  },
  catName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  catBreed: {
    fontSize: 15,
    color: "#666",
  },
  chipBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  resolvedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 12,
    backgroundColor: "#ECFDF5",
    borderTopWidth: 1,
    borderTopColor: "rgba(16, 185, 129, 0.1)",
  },
  resolvedText: {
    color: "#10B981",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  emergencySection: {
    marginBottom: 24,
    gap: 12,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  emergencyCardWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: '#fff',
  },
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  emergencyActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  emergencyActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  callBtn: {
    backgroundColor: '#1a1a1a',
  },
  webBtn: {
    backgroundColor: '#6366F1',
  },
  emergencyActionText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emergencyCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emergencyIcon: {
    fontSize: 28,
  },
  emergencyCardInfo: {
    flex: 1,
    gap: 2,
  },
  emergencyCardName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  emergencyCardDesc: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
  },
  emergencyCardRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  emergencyPhone: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
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
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${Colors.primary}10`,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  countryText: {
    flex: 1,
    fontSize: 13,
    color: '#444',
    fontWeight: '500',
  },
  refreshText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
});
