import React, { useState, useRef } from "react";
import { router , useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Share2 } from "lucide-react-native";
import { captureRef } from "react-native-view-shot";

import { useEmergency, type EmergencyType } from "@/context/emergency";
import { useCats } from "@/context/cats";

const EMERGENCY_TYPES: { value: EmergencyType; label: string; color: string }[] = [
  { value: "lost", label: "Chat perdu", color: "#FF6B6B" },
  { value: "injured", label: "Chat blessé", color: "#FF8C42" },
  { value: "found", label: "Chat trouvé", color: "#4ECDC4" },
];

export default function CreateEmergencyScreen() {
  const router = useRouter();
  const { addAlert } = useEmergency();
  const { cats } = useCats();
  const insets = useSafeAreaInsets();
  const posterRef = useRef<View>(null);

  const [selectedType, setSelectedType] = useState<EmergencyType>("lost");
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [catName, setCatName] = useState<string>("");
  const [catBreed, setCatBreed] = useState<string>("");
  const [catImageUri, setCatImageUri] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>("");
  const [contactEmail, setContactEmail] = useState<string>("");
  const [microchip, setMicrochip] = useState<string>("");
  const [showPoster, setShowPoster] = useState<boolean>(false);

  const handleCatSelection = (catId: string) => {
    setSelectedCatId(catId);
    const cat = cats.find((c) => c.id === catId);
    if (cat) {
      setCatName(cat.name);
      setCatImageUri(cat.imageUri || "");
      setMicrochip(cat.microchip || "");
    }
  };

  const handleCreateAlert = async () => {
    if (!catName.trim()) {
      Alert.alert("Erreur", "Veuillez entrer le nom du chat");
      return;
    }
    if (!location.trim()) {
      Alert.alert("Erreur", "Veuillez entrer le lieu");
      return;
    }
    if (!contactPhone.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un numéro de téléphone");
      return;
    }

    const newAlert = {
      id: Date.now().toString(),
      type: selectedType,
      catId: selectedCatId || undefined,
      catName: catName.trim(),
      catBreed: catBreed.trim() || undefined,
      catImageUri: catImageUri || undefined,
      location: location.trim(),
      description: description.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim() || undefined,
      microchip: microchip.trim() || undefined,
      date: new Date().toISOString(),
      resolved: false,
    };

    await addAlert(newAlert);
    setShowPoster(true);
  };

  const handleSharePoster = async () => {
    if (!posterRef.current) return;

    try {
      const uri = await captureRef(posterRef, {
        format: "png",
        quality: 1,
      });

      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.download = `alerte-${catName.toLowerCase().replace(/\s/g, "-")}.png`;
        link.href = uri;
        link.click();
      } else {
        Alert.alert(
          "Affiche générée",
          "Utilisez une capture d'écran pour partager cette affiche"
        );
      }
    } catch (error) {
      console.error("Error sharing poster:", error);
      Alert.alert("Erreur", "Impossible de partager l'affiche");
    }
  };

  const handleFinish = () => {
    router.back();
  };

  if (showPoster) {
    const typeInfo = EMERGENCY_TYPES.find((t) => t.value === selectedType);

    return (
      <View style={styles.posterScreen}>
        <ScrollView contentContainerStyle={styles.posterContainer}>
          <Text style={styles.posterTitle}>Affiche créée !</Text>
          <Text style={styles.posterSubtitle}>
            Partagez cette affiche sur vos réseaux sociaux
          </Text>

          <View ref={posterRef} collapsable={false} style={styles.poster}>
            <View style={[styles.posterHeader, { backgroundColor: typeInfo?.color }]}>
              <Text style={styles.posterHeaderText}>
                {selectedType === "lost" && "CHAT PERDU"}
                {selectedType === "injured" && "CHAT BLESSÉ"}
                {selectedType === "found" && "CHAT TROUVÉ"}
              </Text>
            </View>

            {catImageUri ? (
              <Image
                source={{ uri: catImageUri }}
                style={styles.posterImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.posterImagePlaceholder}>
                <Text style={styles.posterImagePlaceholderText}>Pas de photo</Text>
              </View>
            )}

            <View style={styles.posterContent}>
              <Text style={styles.posterCatName}>{catName}</Text>
              {catBreed && <Text style={styles.posterCatBreed}>{catBreed}</Text>}

              {microchip && (
                <View style={styles.posterChipBadge}>
                  <Text style={styles.posterChipText}>Puce: {microchip}</Text>
                </View>
              )}

              <View style={styles.posterSection}>
                <Text style={styles.posterLabel}>Lieu:</Text>
                <Text style={styles.posterValue}>{location}</Text>
              </View>

              {description && (
                <View style={styles.posterSection}>
                  <Text style={styles.posterLabel}>Description:</Text>
                  <Text style={styles.posterValue}>{description}</Text>
                </View>
              )}

              <View style={styles.posterContact}>
                <Text style={styles.posterContactTitle}>Contact</Text>
                <Text style={styles.posterContactText}>{contactPhone}</Text>
                {contactEmail && (
                  <Text style={styles.posterContactText}>{contactEmail}</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.posterActions}>
            <Pressable
              onPress={handleSharePoster}
              style={styles.shareButton}
            >
              <Share2 color="#fff" size={20} />
              <Text style={styles.shareButtonText}>Partager</Text>
            </Pressable>

            <Pressable
              onPress={handleFinish}
              style={styles.finishButton}
            >
              <Text style={styles.finishButtonText}>Terminer</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + 20 },
        ]}
      >
        <Text style={styles.sectionTitle}>Type d&apos;urgence</Text>
        <View style={styles.typesGrid}>
          {EMERGENCY_TYPES.map((type) => (
            <Pressable
              key={type.value}
              onPress={() => setSelectedType(type.value)}
              style={[
                styles.typeCard,
                selectedType === type.value && {
                  backgroundColor: type.color,
                  borderColor: type.color,
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  selectedType === type.value && styles.typeTextActive,
                ]}
              >
                {type.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Sélectionner un chat (optionnel)</Text>
        <View style={styles.catsGrid}>
          {cats.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleCatSelection(cat.id)}
              style={[
                styles.catCard,
                selectedCatId === cat.id && styles.catCardActive,
              ]}
            >
              {cat.imageUri && (
                <Image
                  source={{ uri: cat.imageUri }}
                  style={styles.catCardImage}
                  contentFit="cover"
                />
              )}
              <Text style={styles.catCardName}>{cat.name}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Informations du chat</Text>
        
        <Text style={styles.label}>Nom du chat *</Text>
        <TextInput
          style={styles.input}
          value={catName}
          onChangeText={setCatName}
          placeholder="Ex: Minou"
        />

        <Text style={styles.label}>Race</Text>
        <TextInput
          style={styles.input}
          value={catBreed}
          onChangeText={setCatBreed}
          placeholder="Ex: Maine Coon"
        />

        <Text style={styles.label}>Numéro de puce</Text>
        <TextInput
          style={styles.input}
          value={microchip}
          onChangeText={setMicrochip}
          placeholder="Ex: 250268500123456"
        />

        <Text style={styles.label}>Lieu *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Ex: Rue de la Paix, Paris"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez les circonstances, signes distinctifs..."
          multiline
          numberOfLines={4}
        />

        <Text style={styles.sectionTitle}>Contact</Text>
        
        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="Ex: 06 12 34 56 78"
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="Ex: email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Pressable onPress={handleCreateAlert} style={styles.createButton}>
          <Text style={styles.createButtonText}>Créer l&apos;alerte</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111",
    marginTop: 20,
    marginBottom: 12,
  },
  typesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  typeCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  typeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  typeTextActive: {
    color: "#fff",
  },
  catsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  catCard: {
    width: 100,
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  catCardActive: {
    borderColor: "#111",
    backgroundColor: "#F5F5F5",
  },
  catCardImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  catCardName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111",
    backgroundColor: "#FAFAFA",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  createButton: {
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  posterScreen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  posterContainer: {
    padding: 20,
    alignItems: "center",
  },
  posterTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  posterSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  poster: {
    width: 350,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  posterHeader: {
    paddingVertical: 20,
    alignItems: "center",
  },
  posterHeaderText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 2,
  },
  posterImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#f5f5f5",
  },
  posterImagePlaceholder: {
    width: "100%",
    height: 300,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "center",
  },
  posterImagePlaceholderText: {
    fontSize: 16,
    color: "#999",
  },
  posterContent: {
    padding: 20,
  },
  posterCatName: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    marginBottom: 4,
  },
  posterCatBreed: {
    fontSize: 18,
    color: "#666",
    marginBottom: 12,
  },
  posterChipBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  posterChipText: {
    fontSize: 14,
    color: "#1E40AF",
    fontWeight: "700",
  },
  posterSection: {
    marginBottom: 12,
  },
  posterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#666",
    marginBottom: 4,
  },
  posterValue: {
    fontSize: 16,
    color: "#111",
    lineHeight: 22,
  },
  posterContact: {
    marginTop: 20,
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  posterContactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  posterContactText: {
    fontSize: 18,
    color: "#DC2626",
    fontWeight: "600",
    marginTop: 4,
  },
  posterActions: {
    marginTop: 24,
    gap: 12,
    width: "100%",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DC2626",
    paddingVertical: 16,
    borderRadius: 12,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  finishButton: {
    backgroundColor: "#E5E5E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
});
