import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Plus, AlertTriangle, MapPin, Phone, CheckCircle, PhoneCall } from "lucide-react-native";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useEmergency, type EmergencyAlert } from "@/context/emergency";

const EMERGENCY_TYPES = {
  lost: { label: "Perdu", color: "#FF6B6B", icon: "🔍" },
  injured: { label: "Blessé", color: "#FF8C42", icon: "🚑" },
  found: { label: "Trouvé", color: "#4ECDC4", icon: "✨" },
};

const EMERGENCY_CONTACTS = [
  {
    id: "poison",
    name: "Centre Antipoison Animal",
    phone: "01 48 94 31 00",
    description: "CNITV Alfort - Disponible 24h/24",
    color: "#DC2626",
    icon: "☠️",
  },
  {
    id: "vet",
    name: "Vétérinaire de Garde",
    phone: "3115",
    description: "Service national 24h/24",
    color: "#059669",
    icon: "🏥",
  },
];

export default function EmergencyListScreen() {
  const { alerts } = useEmergency();
  const insets = useSafeAreaInsets();

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
    if (Platform.OS === 'web') {
      Alert.alert(
        "Appeler",
        `Composez ce numéro : ${phone}`,
        [
          { text: "OK" }
        ]
      );
    } else {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const EmergencyContactsHeader = () => (
    <View style={styles.emergencySection}>
      <Text style={styles.emergencyTitle}>📞 Numéros d&apos;Urgence</Text>
      {EMERGENCY_CONTACTS.map((contact) => (
        <Pressable
          key={contact.id}
          style={({ pressed }) => [
            styles.emergencyCard,
            { backgroundColor: contact.color },
            pressed ? { opacity: 0.8 } : null,
          ]}
          onPress={() => handleCallEmergency(contact.phone)}
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
            <PhoneCall color="#fff" size={20} />
          </View>
        </Pressable>
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
  emergencyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
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
});
