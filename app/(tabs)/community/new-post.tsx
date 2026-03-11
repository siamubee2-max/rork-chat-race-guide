import React, { useState } from "react";
import { router } from "expo-router";
import { Image as ImageIcon, MapPin, Cat, X } from "lucide-react-native";
import {
  Image,
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
import * as ImagePicker from "expo-image-picker";

import { useSocial } from "@/context/social";
import { useCats } from "@/context/dogs";
import { Colors } from "@/constants/colors";

const SAMPLE_IMAGES = [
  "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800",
  "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800",
  "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=800",
  "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800",
  "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800",
];

export default function NewPostScreen() {
  const { createPost } = useSocial();
  const { cats } = useCats();
  const insets = useSafeAreaInsets();
  
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCat = cats.find(c => c.id === selectedCatId);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const useSampleImage = () => {
    const randomImage = SAMPLE_IMAGES[Math.floor(Math.random() * SAMPLE_IMAGES.length)];
    setImageUrl(randomImage);
  };

  const handleSubmit = async () => {
    if (!imageUrl || !caption.trim()) {
      Alert.alert("Erreur", "Veuillez ajouter une image et une légende");
      return;
    }

    setIsSubmitting(true);
    try {
      await createPost(
        imageUrl,
        caption.trim(),
        selectedCat?.name,
        selectedCat?.breedId || undefined,
        location.trim() || undefined
      );
      router.back();
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Erreur", "Impossible de créer la publication");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = imageUrl && caption.trim() && !isSubmitting;

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
        <View style={styles.imageSection}>
          {imageUrl ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUrl }} style={styles.previewImage} />
              <Pressable 
                style={styles.removeImage}
                onPress={() => setImageUrl("")}
              >
                <X size={20} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon size={48} color={Colors.textMuted} />
              <Text style={styles.imagePlaceholderText}>
                Ajouter une photo de votre chien
              </Text>
              <View style={styles.imageButtons}>
                <Pressable style={styles.imageBtn} onPress={pickImage}>
                  <Text style={styles.imageBtnText}>Galerie</Text>
                </Pressable>
                <Pressable 
                  style={[styles.imageBtn, styles.imageBtnSecondary]} 
                  onPress={useSampleImage}
                >
                  <Text style={styles.imageBtnTextSecondary}>Photo exemple</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Légende</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Décrivez ce moment avec votre chien..."
            placeholderTextColor={Colors.textMuted}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        {cats.length > 0 && (
          <View style={styles.formSection}>
            <Text style={styles.label}>
              <Cat size={16} color={Colors.text} /> Identifier votre chat
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catsRow}
            >
              {cats.map(cat => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.catChip,
                    selectedCatId === cat.id && styles.catChipActive,
                  ]}
                  onPress={() => setSelectedCatId(
                    selectedCatId === cat.id ? null : cat.id
                  )}
                >
                  <Text style={[
                    styles.catChipText,
                    selectedCatId === cat.id && styles.catChipTextActive,
                  ]}>
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.label}>
            <MapPin size={16} color={Colors.text} /> Lieu (optionnel)
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Paris, France"
            placeholderTextColor={Colors.textMuted}
            value={location}
            onChangeText={setLocation}
            maxLength={50}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 20 }]}>
        <Pressable
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? "Publication..." : "Publier"}
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
    padding: 16,
  },
  imageSection: {
    marginBottom: 24,
  },
  imagePlaceholder: {
    aspectRatio: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
  },
  imagePlaceholderText: {
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 12,
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imageBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  imageBtnSecondary: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  imageBtnTextSecondary: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  imagePreview: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
  },
  removeImage: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  formSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  captionInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.text,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "right",
    marginTop: 6,
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
  catsRow: {
    gap: 10,
  },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  catChipTextActive: {
    color: "#fff",
  },
  footer: {
    padding: 16,
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
