import React, { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { Camera, Save, Trash2, X, Heart } from "lucide-react-native";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useCats } from "@/context/cats";
import { BREEDS } from "@/constants/breeds";
import { generateUUID } from "@/utils/polyfills";

export default function CatFormScreen() {
  const { t } = useTranslation();
  const { catId } = useLocalSearchParams<{ catId: string }>();
  const { cats, addCat, updateCat, deleteCat } = useCats();
  const insets = useSafeAreaInsets();

  const isEditing = !!catId;
  const existingCat = cats.find((c) => c.id === catId);

  const [name, setName] = useState(existingCat?.name ?? "");
  const [breedId, setBreedId] = useState<string | null>(
    existingCat?.breedId ?? null,
  );
  const [microchip, setMicrochip] = useState(existingCat?.microchip ?? "");
  const [imageUri, setImageUri] = useState<string | undefined>(
    existingCat?.imageUri,
  );
  const [notes, setNotes] = useState(existingCat?.notes ?? "");

  // Simple breed selector state
  const [showBreedSelect, setShowBreedSelect] = useState(false);

  useEffect(() => {
    if (existingCat) {
      setName(existingCat.name);
      setBreedId(existingCat.breedId);
      setMicrochip(existingCat.microchip);
      setImageUri(existingCat.imageUri);
      setNotes(existingCat.notes ?? "");
    }
  }, [existingCat]);

  const onPickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch {
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erreur", "Le nom est obligatoire");
      return;
    }

    const payload = {
      id: isEditing && catId ? catId : generateUUID(),
      name: name.trim(),
      breedId: breedId || null,
      microchip: microchip.trim(),
      imageUri,
      notes: notes.trim(),
      medicalRecords: existingCat?.medicalRecords ?? [],
    };

    try {
      if (isEditing) {
        await updateCat(payload);
      } else {
        await addCat(payload);
      }
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible de sauvegarder");
    }
  };

  const onDelete = () => {
    if (!catId) return;
    Alert.alert(
      "Supprimer",
      "Êtes-vous sûr de vouloir supprimer ce chat ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCat(catId);
              router.back();
            } catch {
              Alert.alert("Erreur", "Impossible de supprimer");
            }
          },
        },
      ],
    );
  };

  const selectedBreedName =
    BREEDS.find((b) => b.id === breedId)?.name ?? t("cats.selectBreed");

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          {/* Welcome Banner for all cats */}
          {!isEditing && (
            <View style={styles.welcomeBanner}>
              <Heart size={16} color="#E91E63" />
              <Text style={styles.welcomeText}>{t("cats.allCatsWelcome")}</Text>
            </View>
          )}

          {/* Image Picker */}
          <View style={styles.imageSection}>
            <Pressable onPress={onPickImage} style={styles.imagePicker}>
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={styles.image}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Camera color="#666" size={32} />
                  <Text style={styles.imagePlaceholderText}>{t("cats.addPhoto")}</Text>
                </View>
              )}
            </Pressable>
            {imageUri && (
              <Pressable
                onPress={() => setImageUri(undefined)}
                style={styles.removeImageBtn}
              >
                <X color="#fff" size={14} />
              </Pressable>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("cats.catNameRequired")}</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder={t("cats.catNamePlaceholder")}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("cats.selectBreedOptional")}</Text>
            <Pressable
              onPress={() => setShowBreedSelect(!showBreedSelect)}
              style={styles.selectInput}
            >
              <Text
                style={[
                  styles.selectText,
                  !breedId && { color: "#999" },
                ]}
              >
                {selectedBreedName}
              </Text>
            </Pressable>
            {showBreedSelect && (
              <View style={styles.breedList}>
                <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                  <Pressable
                    onPress={() => {
                      setBreedId(null);
                      setShowBreedSelect(false);
                    }}
                    style={[styles.breedItem, styles.breedItemHighlight]}
                  >
                    <Text style={styles.breedItemTextHighlight}>{t("cats.noBreedOption")}</Text>
                  </Pressable>
                  {BREEDS.map((breed) => (
                    <Pressable
                      key={breed.id}
                      onPress={() => {
                        setBreedId(breed.id);
                        setShowBreedSelect(false);
                      }}
                      style={styles.breedItem}
                    >
                      <Text style={styles.breedItemText}>{breed.name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("cats.microchip")}</Text>
            <TextInput
              style={styles.input}
              value={microchip}
              onChangeText={setMicrochip}
              placeholder={t("cats.microchipPlaceholder")}
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
            <Text style={styles.helperText}>
              {t("cats.microchipHelp")}
            </Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t("cats.notes")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t("cats.notesPlaceholder")}
              placeholderTextColor="#999"
              multiline
            />
          </View>

          {isEditing && (
            <Pressable onPress={onDelete} style={styles.deleteBtn}>
              <Trash2 color="#FF3B30" size={20} />
              <Text style={styles.deleteText}>{t("cats.deleteCat")}</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Pressable onPress={onSave} style={styles.saveBtn}>
          <Save color="#fff" size={20} />
          <Text style={styles.saveText}>{t("common.save")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 24,
    position: "relative",
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F2F2F7",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  removeImageBtn: {
    position: "absolute",
    top: 0,
    right: "30%", // approx center offset
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 6,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
  },
  selectInput: {
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectText: {
    fontSize: 16,
    color: "#000",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 6,
    marginLeft: 4,
  },
  breedList: {
    marginTop: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 12,
    overflow: "hidden",
  },
  breedItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  breedItemText: {
    fontSize: 16,
    color: "#000",
  },
  breedItemHighlight: {
    backgroundColor: "#FFF0F5",
  },
  breedItemTextHighlight: {
    fontSize: 16,
    color: "#E91E63",
    fontWeight: "600",
  },
  welcomeBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FFF0F5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: "#E91E63",
    fontWeight: "600",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  saveBtn: {
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
    padding: 16,
    backgroundColor: "#FFF0F0",
    borderRadius: 16,
  },
  deleteText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});
