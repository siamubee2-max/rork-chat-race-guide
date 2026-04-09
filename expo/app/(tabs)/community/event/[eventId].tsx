import React from "react";
import { useLocalSearchParams } from "expo-router";
import { navigate } from "@/utils/navigate";
import { Calendar, MapPin, Users, Clock, Euro, Share2, UserCheck } from "lucide-react-native";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

import { useSocial } from "@/context/social";
import { useAuth } from "@/context/auth";
import { Colors } from "@/constants/colors";

export default function EventDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { events, attendEvent, isAttending } = useSocial();
  const { isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const event = events.find(e => e.id === eventId);
  const attending = isAttending(eventId || "");

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Événement introuvable</Text>
      </View>
    );
  }

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getEventTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      meetup: "Rencontre",
      adoption: "Adoption",
      show: "Exposition",
      workshop: "Atelier",
      charity: "Caritatif",
    };
    return labels[type] || type;
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      meetup: Colors.primary,
      adoption: Colors.success,
      show: Colors.accent,
      workshop: Colors.info,
      charity: "#E85D75",
    };
    return colors[type] || Colors.primary;
  };

  const handleAttend = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }

    if (event.maxAttendees && event.attendeesCount >= event.maxAttendees && !attending) {
      Alert.alert("Complet", "Cet événement a atteint sa capacité maximale.");
      return;
    }

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await attendEvent(event.id);
  };

  const typeColor = getEventTypeColor(event.type);
  const isFull = event.maxAttendees ? event.attendeesCount >= event.maxAttendees : false;

  return (
    <View style={styles.screen}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {event.imageUrl && (
          <Image source={{ uri: event.imageUrl }} style={styles.image} />
        )}

        <View style={styles.mainContent}>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + "20" }]}>
            <Text style={[styles.typeText, { color: typeColor }]}>
              {getEventTypeLabel(event.type)}
            </Text>
          </View>

          <Text style={styles.title}>{event.title}</Text>

          <Pressable 
            style={styles.organizer}
            onPress={() => navigate(`/(tabs)/community/profile/${event.organizerId}`)}
          >
            <View style={styles.organizerAvatar}>
              <Text style={styles.organizerAvatarText}>
                {event.organizerName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.organizerLabel}>Organisé par</Text>
              <Text style={styles.organizerName}>{event.organizerName}</Text>
            </View>
          </Pressable>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>{formatDate(event.date)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Clock size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Heure</Text>
                <Text style={styles.infoValue}>{event.time}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <MapPin size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{event.location}</Text>
                <Text style={styles.infoValue}>{event.address}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Users size={20} color={Colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Participants</Text>
                <Text style={styles.infoValue}>
                  {event.attendeesCount} inscrit{event.attendeesCount > 1 ? "s" : ""}
                  {event.maxAttendees && ` / ${event.maxAttendees} places`}
                </Text>
              </View>
            </View>

            {event.price && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Euro size={20} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Tarif</Text>
                  <Text style={styles.infoValue}>{event.price}</Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>À propos</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <Pressable style={styles.shareBtn}>
          <Share2 size={20} color={Colors.text} />
        </Pressable>
        <Pressable
          style={[
            styles.attendBtn,
            attending && styles.attendBtnActive,
            isFull && !attending && styles.attendBtnDisabled,
          ]}
          onPress={handleAttend}
          disabled={isFull && !attending}
        >
          {attending ? (
            <>
              <UserCheck size={20} color="#fff" />
              <Text style={styles.attendBtnText}>Inscrit</Text>
            </>
          ) : (
            <Text style={[
              styles.attendBtnText,
              isFull && styles.attendBtnTextDisabled,
            ]}>
              {isFull ? "Complet" : "Participer"}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  image: {
    width: "100%",
    height: 220,
    backgroundColor: Colors.backgroundSecondary,
  },
  mainContent: {
    padding: 20,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 32,
  },
  organizer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    marginBottom: 20,
  },
  organizerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  organizerAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  organizerLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  infoSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  descriptionSection: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  shareBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.backgroundCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attendBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  attendBtnActive: {
    backgroundColor: Colors.success,
  },
  attendBtnDisabled: {
    backgroundColor: Colors.textMuted,
  },
  attendBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  attendBtnTextDisabled: {
    color: "#fff",
  },
});
