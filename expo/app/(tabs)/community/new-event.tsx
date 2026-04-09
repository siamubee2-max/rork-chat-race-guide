import React, { useState } from "react";
import { router , useRouter } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useSocial, type CatEvent } from "@/context/social";
import { Colors } from "@/constants/colors";

const EVENT_TYPES: { id: CatEvent["type"]; label: string; color: string }[] = [
  { id: "meetup", label: "Rencontre", color: Colors.primary },
  { id: "adoption", label: "Adoption", color: Colors.success },
  { id: "show", label: "Exposition", color: Colors.accent },
  { id: "workshop", label: "Atelier", color: Colors.info },
  { id: "charity", label: "Caritatif", color: "#E85D75" },
];

export default function NewEventScreen() {
  const router = useRouter();
  const { createEvent } = useSocial();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CatEvent["type"]>("meetup");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState("");
  const [maxAttendees, setMaxAttendees] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !date || !time || !location.trim() || !address.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      Alert.alert("Erreur", "Format de date invalide. Utilisez AAAA-MM-JJ");
      return;
    }

    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(time)) {
      Alert.alert("Erreur", "Format d'heure invalide (HH:MM)");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        type,
        date,
        time,
        location: location.trim(),
        address: address.trim(),
        maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : undefined,
        price: price.trim() || undefined,
      });
      router.back();
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Erreur", "Impossible de créer l'événement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = title.trim() && description.trim() && date && time && location.trim() && address.trim() && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.label}>Type d&apos;événement *</Text>
          <View style={styles.typeGrid}>
            {EVENT_TYPES.map(eventType => (
              <Pressable
                key={eventType.id}
                style={[
                  styles.typeOption,
                  type === eventType.id && { 
                    backgroundColor: eventType.color,
                    borderColor: eventType.color,
                  },
                ]}
                onPress={() => setType(eventType.id)}
              >
                <Text style={[
                  styles.typeOptionText,
                  type === eventType.id && styles.typeOptionTextActive,
                ]}>
                  {eventType.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Rencontre des félins parisiens"
            placeholderTextColor={Colors.textMuted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Décrivez votre événement..."
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={1000}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={Colors.textMuted}
              value={date}
              onChangeText={setDate}
              maxLength={10}
            />
          </View>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.label}>Heure *</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={Colors.textMuted}
              value={time}
              onChangeText={setTime}
              maxLength={5}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Lieu *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Parc Monceau"
            placeholderTextColor={Colors.textMuted}
            value={location}
            onChangeText={setLocation}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Adresse *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 35 Boulevard de Courcelles, 75008 Paris"
            placeholderTextColor={Colors.textMuted}
            value={address}
            onChangeText={setAddress}
            maxLength={200}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.label}>Places max</Text>
            <TextInput
              style={styles.input}
              placeholder="Illimité"
              placeholderTextColor={Colors.textMuted}
              value={maxAttendees}
              onChangeText={setMaxAttendees}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
          <View style={[styles.section, styles.flex1]}>
            <Text style={styles.label}>Tarif</Text>
            <TextInput
              style={styles.input}
              placeholder="Gratuit"
              placeholderTextColor={Colors.textMuted}
              value={price}
              onChangeText={setPrice}
              maxLength={20}
            />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? "Création..." : "Créer l'événement"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  typeOptionTextActive: {
    color: "#fff",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
