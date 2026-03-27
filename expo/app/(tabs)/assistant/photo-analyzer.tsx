import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
  Platform,
} from "react-native";
import {
  Camera,
  ImagePlus,
  Sparkles,
  Smile,
  Scale,
  Heart,
  CheckCircle,
  ChevronRight,
  RefreshCw,
  Cat,
} from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { Colors } from "@/constants/colors";
import { useCats } from "@/context/cats";
import { useAI, PhotoAnalysis } from "@/context/ai";

export default function PhotoAnalyzerScreen() {
  const { cats } = useCats();
  const { analyses, analyzePhoto, isAnalyzingPhoto } = useAI();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(
    cats.length > 0 ? cats[0].id : null
  );
  const [currentAnalysis, setCurrentAnalysis] = useState<PhotoAnalysis | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const animateResults = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const pickImage = useCallback(async (useCamera: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission requise", "Veuillez autoriser l'accès à la caméra.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission requise", "Veuillez autoriser l'accès aux photos.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setCurrentAnalysis(null);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image.");
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!selectedImage) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      let base64Image: string;
      
      if (Platform.OS === "web") {
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } else {
        const base64 = await FileSystem.readAsStringAsync(selectedImage, {
          encoding: "base64",
        });
        base64Image = `data:image/jpeg;base64,${base64}`;
      }

      const result = await analyzePhoto({
        imageBase64: base64Image,
        catId: selectedCatId || undefined,
      });
      
      setCurrentAnalysis(result.analysis);
      animateResults();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Analysis failed:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erreur", "L'analyse a échoué. Réessayez avec une autre photo.");
    }
  }, [selectedImage, selectedCatId, analyzePhoto, animateResults]);

  const resetAnalysis = useCallback(() => {
    setSelectedImage(null);
    setCurrentAnalysis(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const getMoodEmoji = (mood: string) => {
    const lower = mood.toLowerCase();
    if (lower.includes("heureux") || lower.includes("content") || lower.includes("joyeux")) return "😸";
    if (lower.includes("détendu") || lower.includes("relax") || lower.includes("calme")) return "😺";
    if (lower.includes("curieux") || lower.includes("alerte")) return "🙀";
    if (lower.includes("fatigué") || lower.includes("endormi") || lower.includes("somnolent")) return "😴";
    if (lower.includes("anxieux") || lower.includes("stress") || lower.includes("inquiet")) return "😿";
    if (lower.includes("joueur") || lower.includes("énergique") || lower.includes("playful")) return "😼";
    return "🐱";
  };

  const getBodyConditionColor = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("idéal") || lower.includes("optimal") || lower.includes("normal")) return Colors.success;
    if (lower.includes("surpoids") || lower.includes("obèse")) return Colors.warning;
    if (lower.includes("maigre") || lower.includes("sous-poids")) return Colors.warning;
    return Colors.info;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Camera color={Colors.primary} size={24} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Analyseur Photo</Text>
          <Text style={styles.headerSubtitle}>
            IA pour détecter humeur et condition physique
          </Text>
        </View>
      </View>

      {cats.length > 1 && (
        <View style={styles.catSelectorContainer}>
          <Text style={styles.catSelectorLabel}>Associer à un chat (optionnel)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catSelectorContent}
          >
            <TouchableOpacity
              style={[
                styles.catPill,
                !selectedCatId && styles.catPillSelected,
              ]}
              onPress={() => {
                setSelectedCatId(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[
                styles.catPillText,
                !selectedCatId && styles.catPillTextSelected,
              ]}>
                Aucun
              </Text>
            </TouchableOpacity>
            {cats.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.catPill,
                  selectedCatId === cat.id && styles.catPillSelected,
                ]}
                onPress={() => {
                  setSelectedCatId(cat.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Text style={[
                  styles.catPillText,
                  selectedCatId === cat.id && styles.catPillTextSelected,
                ]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {!selectedImage ? (
        <View style={styles.uploadSection}>
          <View style={styles.uploadPlaceholder}>
            <Cat color={Colors.textMuted} size={64} />
            <Text style={styles.uploadTitle}>Ajoutez une photo de chat</Text>
            <Text style={styles.uploadSubtitle}>
              Pour une analyse de l&apos;humeur et de la condition physique
            </Text>
          </View>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage(true)}
              activeOpacity={0.8}
            >
              <Camera color="#fff" size={22} />
              <Text style={styles.uploadButtonText}>Prendre une photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.uploadButton, styles.uploadButtonSecondary]}
              onPress={() => pickImage(false)}
              activeOpacity={0.8}
            >
              <ImagePlus color={Colors.primary} size={22} />
              <Text style={[styles.uploadButtonText, styles.uploadButtonTextSecondary]}>
                Galerie
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity style={styles.changeImageButton} onPress={resetAnalysis}>
              <RefreshCw color="#fff" size={18} />
            </TouchableOpacity>
          </View>

          {!currentAnalysis && (
            <TouchableOpacity
              style={[
                styles.analyzeButton,
                isAnalyzingPhoto && styles.analyzeButtonDisabled,
              ]}
              onPress={handleAnalyze}
              disabled={isAnalyzingPhoto}
              activeOpacity={0.8}
            >
              {isAnalyzingPhoto ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.analyzeButtonText}>Analyse en cours...</Text>
                </>
              ) : (
                <>
                  <Sparkles color="#fff" size={20} />
                  <Text style={styles.analyzeButtonText}>Analyser avec l&apos;IA</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {currentAnalysis && (
        <Animated.View
          style={[
            styles.resultsSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.resultsTitle}>Résultats de l&apos;analyse</Text>

          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={[styles.resultIcon, { backgroundColor: Colors.info + "20" }]}>
                <Smile color={Colors.info} size={20} />
              </View>
              <Text style={styles.resultLabel}>Humeur détectée</Text>
            </View>
            <View style={styles.resultContent}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(currentAnalysis.mood || "")}</Text>
              <Text style={styles.resultValue}>{currentAnalysis.mood}</Text>
            </View>
          </View>

          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={[styles.resultIcon, { backgroundColor: getBodyConditionColor(currentAnalysis.bodyCondition || "") + "20" }]}>
                <Scale color={getBodyConditionColor(currentAnalysis.bodyCondition || "")} size={20} />
              </View>
              <Text style={styles.resultLabel}>Condition corporelle</Text>
            </View>
            <Text style={[styles.resultValue, { color: getBodyConditionColor(currentAnalysis.bodyCondition || "") }]}>
              {currentAnalysis.bodyCondition}
            </Text>
          </View>

          {currentAnalysis.healthObservations && currentAnalysis.healthObservations.length > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={[styles.resultIcon, { backgroundColor: Colors.primary + "20" }]}>
                  <Heart color={Colors.primary} size={20} />
                </View>
                <Text style={styles.resultLabel}>Observations</Text>
              </View>
              {currentAnalysis.healthObservations.map((obs, index) => (
                <View key={index} style={styles.observationItem}>
                  <CheckCircle color={Colors.success} size={16} />
                  <Text style={styles.observationText}>{obs}</Text>
                </View>
              ))}
            </View>
          )}

          {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={[styles.resultIcon, { backgroundColor: Colors.accent + "20" }]}>
                  <Sparkles color={Colors.accent} size={20} />
                </View>
                <Text style={styles.resultLabel}>Recommandations</Text>
              </View>
              {currentAnalysis.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <ChevronRight color={Colors.primary} size={16} />
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.newAnalysisButton}
            onPress={resetAnalysis}
          >
            <Text style={styles.newAnalysisButtonText}>Nouvelle analyse</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {analyses.length > 0 && !currentAnalysis && (
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>Analyses récentes</Text>
          {analyses.slice(0, 3).map((analysis) => (
            <View key={analysis.id} style={styles.historyCard}>
              <View style={styles.historyContent}>
                <Text style={styles.historyMood}>
                  {getMoodEmoji(analysis.mood || "")} {analysis.mood}
                </Text>
                <Text style={styles.historyCondition}>{analysis.bodyCondition}</Text>
                <Text style={styles.historyDate}>
                  {new Date(analysis.analyzedAt).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 20,
    gap: 12,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryMuted,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  catSelectorContainer: {
    marginBottom: 20,
  },
  catSelectorLabel: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  catSelectorContent: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  catPillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  catPillText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  catPillTextSelected: {
    color: "#fff",
  },
  uploadSection: {
    alignItems: "center" as const,
  },
  uploadPlaceholder: {
    alignItems: "center" as const,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    padding: 40,
    width: "100%",
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed" as const,
    marginBottom: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center" as const,
  },
  uploadButtons: {
    flexDirection: "row" as const,
    gap: 12,
    width: "100%",
  },
  uploadButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
  },
  uploadButtonSecondary: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  uploadButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#fff",
  },
  uploadButtonTextSecondary: {
    color: Colors.primary,
  },
  imageSection: {
    alignItems: "center" as const,
  },
  imageContainer: {
    position: "relative" as const,
    marginBottom: 16,
  },
  selectedImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
  },
  changeImageButton: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  analyzeButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 8,
    width: "100%",
  },
  analyzeButtonDisabled: {
    opacity: 0.7,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  resultsSection: {
    marginTop: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginBottom: 12,
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  resultContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  moodEmoji: {
    fontSize: 32,
  },
  resultValue: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  observationItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    marginBottom: 8,
  },
  observationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  recommendationItem: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  newAnalysisButton: {
    alignItems: "center" as const,
    paddingVertical: 14,
    marginTop: 8,
  },
  newAnalysisButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  historySection: {
    marginTop: 32,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  historyMood: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.text,
  },
  historyCondition: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    textAlign: "center" as const,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
