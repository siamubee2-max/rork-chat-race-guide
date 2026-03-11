import React, { useMemo, useCallback } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Plus, AlertTriangle, MapPin, Phone, CheckCircle, PhoneCall, Globe, Navigation, MoreVertical, Trash2, RotateCcw, Check, X, Share2 } from "lucide-react-native";
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
  Modal,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEmergency, type EmergencyAlert } from "@/context/emergency";
import { useUserLocation } from "@/context/user-location";
import { Colors } from "@/constants/colors";
import { useTranslation } from "react-i18next";
import { PremiumGate } from "@/components/PremiumGate";



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

export default function EmergencyScreen() {
  const { t } = useTranslation();
  
  const EMERGENCY_TYPES = useMemo(() => ({
    lost: { label: t('emergency.types.lost'), color: "#FF6B6B", icon: "🔍" },
    injured: { label: t('emergency.types.injured'), color: "#FF8C42", icon: "🚑" },
    found: { label: t('emergency.types.found'), color: "#4ECDC4", icon: "✨" },
  }), [t]);

const EMERGENCY_CONTACTS: EmergencyContact[] = useMemo(() => [
  {
    id: "poison-fr",
    name: t('emergency.contacts.poisonAnimal'),
    phone: "01 48 94 31 00",
    description: t('emergency.contacts.poisonAnimalDesc'),
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
], [t]);


const { alerts, updateAlert, deleteAlert } = useEmergency();
  const [selectedAlert, setSelectedAlert] = React.useState<EmergencyAlert | null>(null);
  const [showArchivedAlerts, setShowArchivedAlerts] = React.useState<boolean>(false);
  const insets = useSafeAreaInsets();
  const { address, locateOnce, isLocating } = useUserLocation();

  const handleRequestLocation = useCallback(() => {
    console.log("[EmergencyScreen] user requested location");
    void locateOnce();
  }, [locateOnce]);

  const normalizeCountryName = useCallback((country: string | undefined): string | null => {
    if (!country) return null;
    
    const normalized = country.toLowerCase().trim();
    
    const countryMap: Record<string, string> = {
      'france': 'France',
      'francia': 'France',
      'frankreich': 'France',
      'belgium': 'Belgium',
      'belgique': 'Belgium',
      'belgië': 'Belgium',
      'belgien': 'Belgium',
      'switzerland': 'Switzerland',
      'suisse': 'Switzerland',
      'schweiz': 'Switzerland',
      'svizzera': 'Switzerland',
      'canada': 'Canada',
      'united states': 'United States',
      'usa': 'United States',
      'états-unis': 'United States',
      'vereinigte staaten': 'United States',
      'united kingdom': 'United Kingdom',
      'uk': 'United Kingdom',
      'royaume-uni': 'United Kingdom',
      'vereinigtes königreich': 'United Kingdom',
      'germany': 'Germany',
      'allemagne': 'Germany',
      'deutschland': 'Germany',
      'germania': 'Germany',
      'spain': 'Spain',
      'espagne': 'Spain',
      'spanien': 'Spain',
      'españa': 'Spain',
      'spagna': 'Spain',
      'italy': 'Italy',
      'italie': 'Italy',
      'italien': 'Italy',
      'italia': 'Italy',
    };
    
    return countryMap[normalized] || null;
  }, []);

  const userCountry = useMemo(() => normalizeCountryName(address?.country), [address?.country, normalizeCountryName]);

  const filteredContacts = useMemo(() => {
    if (!userCountry) {
      return EMERGENCY_CONTACTS.filter(c => c.country === "France");
    }
    const countryContacts = EMERGENCY_CONTACTS.filter(c => c.country === userCountry);
    return countryContacts.length > 0 ? countryContacts : [];
  }, [userCountry, EMERGENCY_CONTACTS]);

  const showDefaultContacts = !userCountry || filteredContacts.length === 0;

  const onCreateAlert = () => {
    router.push("/(tabs)/emergency/create" as any);
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const archivedAlerts = alerts.filter((a) => a.resolved);

  const handleResolveAlert = async (alert: EmergencyAlert) => {
    Alert.alert(
      "Résoudre l'alerte",
      "Marquer cette alerte comme résolue ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Résoudre",
          style: "default",
          onPress: async () => {
            await updateAlert({ ...alert, resolved: true });
            setSelectedAlert(null);
          },
        },
      ]
    );
  };

  const handleReactivateAlert = async (alert: EmergencyAlert) => {
    Alert.alert(
      "Réactiver l'alerte",
      "Réactiver cette alerte archivée ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Réactiver",
          style: "default",
          onPress: async () => {
            await updateAlert({ ...alert, resolved: false });
            setSelectedAlert(null);
          },
        },
      ]
    );
  };

  const handleDeleteAlert = async (alert: EmergencyAlert) => {
    Alert.alert(
      "Supprimer l'alerte",
      "Êtes-vous sûr de vouloir supprimer cette alerte définitivement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            await deleteAlert(alert.id);
            setSelectedAlert(null);
          },
        },
      ]
    );
  };

  const handleShareAlert = async (alert: EmergencyAlert) => {
    const typeInfo = EMERGENCY_TYPES[alert.type];
    const typeLabel = typeInfo.label.toUpperCase();
    
    let message = `🚨 ${typeLabel} 🚨\n\n`;
    message += `📛 Nom: ${alert.catName}\n`;
    
    if (alert.catBreed) {
      message += `🐱 Race: ${alert.catBreed}\n`;
    }
    
    if (alert.microchip) {
      message += `💳 Puce: ${alert.microchip}\n`;
    }
    
    message += `📍 Lieu: ${alert.location}\n`;
    
    if (alert.description) {
      message += `\n📝 Description:\n${alert.description}\n`;
    }
    
    message += `\n📞 Contact: ${alert.contactPhone}`;
    
    if (alert.contactEmail) {
      message += `\n📧 Email: ${alert.contactEmail}`;
    }
    
    message += `\n\n⚠️ Merci de partager pour aider à retrouver ce chien !`;

    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(message);
        Alert.alert(
          "Message copié",
          "Le message a été copié dans le presse-papiers. Vous pouvez maintenant le coller sur vos réseaux sociaux.",
          [
            {
              text: "Ouvrir Facebook",
              onPress: () => Linking.openURL('https://www.facebook.com')
            },
            {
              text: "Ouvrir Twitter",
              onPress: () => Linking.openURL('https://www.twitter.com')
            },
            { text: "OK" }
          ]
        );
      } else {
        const result = await Share.share({
          message,
          title: `${typeLabel} - ${alert.catName}`,
        });
        
        if (result.action === Share.sharedAction) {
          console.log('[Emergency] Alert shared successfully');
        }
      }
      setSelectedAlert(null);
    } catch (error) {
      console.error('[Emergency] Error sharing alert:', error);
      Alert.alert("Erreur", "Impossible de partager l'alerte");
    }
  };

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
      <View style={styles.card}>
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

        <Pressable
          style={styles.moreButton}
          onPress={() => setSelectedAlert(item)}
        >
          <MoreVertical color={Colors.textSecondary} size={20} />
        </Pressable>
      </View>
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
      
      {!userCountry && (
        <View style={styles.permissionCard}>
          <View style={styles.permissionIcon}>
            <MapPin size={28} color={Colors.primary} />
          </View>
          <Text style={styles.permissionTitle}>Localisation</Text>
          <Text style={styles.permissionText}>
            Autorisez la localisation pour afficher les numéros d&apos;urgence de votre pays. En attendant, voici les contacts pour la France.
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
      )}
      
      {userCountry && (
        <View style={styles.countryBadge}>
          <MapPin size={14} color={Colors.primary} />
          <Text style={styles.countryText}>
            📍 Numéros d&apos;urgence pour : {userCountry}
          </Text>
          <TouchableOpacity onPress={() => { void locateOnce(); }}>
            <Text style={styles.refreshText}>↻</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {userCountry && filteredContacts.length === 0 && (
        <View style={styles.noDataCard}>
          <AlertTriangle size={24} color={"#F59E0B"} />
          <Text style={styles.noDataTitle}>
            Numéros non disponibles pour {userCountry}
          </Text>
          <Text style={styles.noDataText}>
            Nous affichons les contacts France par défaut. Recherchez les numéros d&apos;urgence vétérinaire locaux.
          </Text>
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://www.google.com/search?q=urgence+v%C3%A9t%C3%A9rinaire+${encodeURIComponent(userCountry)}`)}
            style={styles.googleSearchBtn}
          >
            <Globe size={16} color="white" />
            <Text style={styles.googleSearchBtnText}>Rechercher en ligne</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {showDefaultContacts && !userCountry && (
        <View style={styles.defaultCountryBadge}>
          <Text style={styles.defaultCountryText}>🇫🇷 Contacts France (par défaut)</Text>
        </View>
      )}
      
      {(filteredContacts.length > 0 ? filteredContacts : EMERGENCY_CONTACTS.filter(c => c.country === "France")).map((contact) => (
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
        Créez une alerte d&apos;urgence si votre chien est perdu, blessé, ou si vous avez trouvé un chien
      </Text>
      <Pressable onPress={onCreateAlert} style={styles.emptyBtn}>
        <Plus color="#fff" size={20} />
        <Text style={styles.emptyBtnText}>Créer une alerte</Text>
      </Pressable>
    </View>
  );

  const ArchivedAlertsSection = () => (
    <View style={styles.archivedSection}>
      <Pressable
        style={styles.archivedHeader}
        onPress={() => setShowArchivedAlerts(!showArchivedAlerts)}
      >
        <Text style={styles.archivedTitle}>
          📋 Alertes archivées ({archivedAlerts.length})
        </Text>
        <Text style={styles.archivedToggle}>
          {showArchivedAlerts ? "▼" : "►"}
        </Text>
      </Pressable>
      {showArchivedAlerts && archivedAlerts.map((alert) => {
        const typeInfo = EMERGENCY_TYPES[alert.type];
        const date = new Date(alert.date);
        const formattedDate = date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <View key={alert.id} style={styles.card}>
            <View style={[styles.statusBadge, { backgroundColor: typeInfo.color }]}>
              <Text style={styles.statusEmoji}>{typeInfo.icon}</Text>
              <Text style={styles.statusText}>{typeInfo.label}</Text>
            </View>

            <View style={styles.cardContent}>
              {alert.catImageUri && (
                <Image
                  source={{ uri: alert.catImageUri }}
                  style={styles.catImage}
                  contentFit="cover"
                />
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.catName}>{alert.catName}</Text>
                {alert.catBreed && (
                  <Text style={styles.catBreed}>{alert.catBreed}</Text>
                )}
                
                {alert.microchip && (
                  <View style={styles.chipBadge}>
                    <Text style={styles.chipText}>Puce: {alert.microchip}</Text>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <MapPin color="#666" size={14} />
                  <Text style={styles.infoText}>{alert.location}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Phone color="#666" size={14} />
                  <Text style={styles.infoText}>{alert.contactPhone}</Text>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {alert.description}
                </Text>

                <Text style={styles.date}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.resolvedBadge}>
              <CheckCircle color="#10B981" size={16} />
              <Text style={styles.resolvedText}>Résolu</Text>
            </View>

            <Pressable
              style={styles.moreButton}
              onPress={() => setSelectedAlert(alert)}
            >
              <MoreVertical color={Colors.textSecondary} size={20} />
            </Pressable>
          </View>
        );
      })}
    </View>
  );

  return (
    <PremiumGate>
      <View style={styles.screen}>
      <FlatList
        data={activeAlerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={EmergencyContactsHeader}
        ListEmptyComponent={EmptyState}
        ListFooterComponent={archivedAlerts.length > 0 ? ArchivedAlertsSection : null}
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

      <Modal
        visible={selectedAlert !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAlert(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedAlert(null)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Actions</Text>
            
            {selectedAlert && (
              <Pressable
                style={styles.modalAction}
                onPress={() => handleShareAlert(selectedAlert)}
              >
                <Share2 color="#2563EB" size={20} />
                <Text style={styles.modalActionText}>Partager sur les réseaux sociaux</Text>
              </Pressable>
            )}
            
            {selectedAlert && !selectedAlert.resolved && (
              <Pressable
                style={styles.modalAction}
                onPress={() => handleResolveAlert(selectedAlert)}
              >
                <Check color="#10B981" size={20} />
                <Text style={styles.modalActionText}>Marquer comme résolu</Text>
              </Pressable>
            )}

            {selectedAlert && selectedAlert.resolved && (
              <Pressable
                style={styles.modalAction}
                onPress={() => handleReactivateAlert(selectedAlert)}
              >
                <RotateCcw color="#2563EB" size={20} />
                <Text style={styles.modalActionText}>Réactiver l&apos;alerte</Text>
              </Pressable>
            )}

            {selectedAlert && (
              <Pressable
                style={styles.modalAction}
                onPress={() => handleDeleteAlert(selectedAlert)}
              >
                <Trash2 color="#DC2626" size={20} />
                <Text style={[styles.modalActionText, { color: "#DC2626" }]}>
                  Supprimer définitivement
                </Text>
              </Pressable>
            )}

            <Pressable
              style={styles.modalCancel}
              onPress={() => setSelectedAlert(null)}
            >
              <X color={Colors.textSecondary} size={20} />
              <Text style={styles.modalCancelText}>Annuler</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
      </View>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
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
    color: Colors.text,
  },
  catBreed: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  chipBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  chipText: {
    fontSize: 12,
    color: Colors.primary,
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
    color: Colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.textMuted,
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
    minHeight: 300,
    justifyContent: "center",
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
    color: Colors.text,
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
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    backgroundColor: Colors.backgroundCard,
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
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    color: Colors.text,
    marginBottom: 6,
  },
  permissionText: {
    fontSize: 13,
    color: Colors.textSecondary,
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
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  refreshText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  noDataCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  noDataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 13,
    color: '#78350F',
    textAlign: 'center',
    lineHeight: 18,
  },
  googleSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 4,
  },
  googleSearchBtnText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 14,
  },
  defaultCountryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 8,
  },
  defaultCountryText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  moreButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  modalAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    marginBottom: 8,
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  modalCancel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  archivedSection: {
    marginTop: 24,
  },
  archivedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  archivedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  archivedToggle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
