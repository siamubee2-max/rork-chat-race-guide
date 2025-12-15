import { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import * as Haptics from "expo-haptics";
import { generateText } from "@rork-ai/toolkit-sdk";
import { Cat, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { useScanImage } from "@/context/scan-image";
import { BREEDS, type BreedId } from "@/constants/breeds";

type CandidateBreed = {
  id: string;
  name: string;
  confidenceLabel: string;
  why: string;
};

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function findBreedMatch(aiName: string): { id: BreedId; name: string } | null {
  const normalized = normalizeString(aiName);
  
  // Mapping des noms français courants vers les IDs
  const frenchMappings: Record<string, BreedId> = {
    "chategeen": "aegean",
    "egeen": "aegean",
    "chateuropeen": "european-shorthair",
    "europeen": "european-shorthair",
    "europeenshorthair": "european-shorthair",
    "siamois": "siamese",
    "persan": "persian",
    "chartreux": "chartreux",
    "sacredebirman": "birman",
    "sacredebirmaniel": "birman",
    "birman": "birman",
    "angora": "turkish-angora",
    "angoraturc": "turkish-angora",
    "bleuerusse": "russian-blue",
    "russebleu": "russian-blue",
    "norvegien": "norwegian",
    "forestiernorvegien": "norwegian",
    "siberien": "siberian",
    "abyssin": "abyssinian",
    "gouttiere": "gouttiere",
    "chatdemaison": "gouttiere",
    "chatdegouttiere": "gouttiere",
    "chatcommun": "gouttiere",
    "sanspedigree": "gouttiere",
    "croise": "gouttiere",
    "tigre": "gouttiere",
    "roux": "gouttiere-roux",
    "chatroux": "gouttiere-roux",
    "noietblanc": "gouttiere-noir-blanc",
    "egyptienmau": "egyptian-mau",
    "maueegyptien": "egyptian-mau",
    "scottishfold": "scottish-fold",
    "americanshorthair": "american-shorthair",
    "americain": "american-shorthair",
    "britishshorthair": "british-shorthair",
    "britannique": "british-shorthair",
  };
  
  // 1. Vérifier le mapping français
  if (frenchMappings[normalized]) {
    const breed = BREEDS.find(b => b.id === frenchMappings[normalized]);
    if (breed) return { id: breed.id, name: breed.name };
  }
  
  // 2. Correspondance exacte par ID
  const exactById = BREEDS.find(b => normalizeString(b.id.replace(/-/g, "")) === normalized);
  if (exactById) return { id: exactById.id, name: exactById.name };
  
  // 3. Correspondance exacte par nom
  const exactByName = BREEDS.find(b => normalizeString(b.name) === normalized);
  if (exactByName) return { id: exactByName.id, name: exactByName.name };
  
  // 4. Correspondance partielle par nom
  const partialByName = BREEDS.find(b => 
    normalizeString(b.name).includes(normalized) || 
    normalized.includes(normalizeString(b.name))
  );
  if (partialByName) return { id: partialByName.id, name: partialByName.name };
  
  // 5. Correspondance par mots clés
  const words = normalized.split(/\s+/);
  for (const word of words) {
    if (word.length < 3) continue;
    const match = BREEDS.find(b => 
      normalizeString(b.name).includes(word) || 
      normalizeString(b.id).includes(word)
    );
    if (match) return { id: match.id, name: match.name };
  }
  
  console.log("No breed match found for:", aiName, "normalized:", normalized);
  return null;
}

export default function ScanResultScreen() {
  const { imageData, clearImage } = useScanImage();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateBreed[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log("ScanResult imageData:", imageData ? 'present' : 'missing');
    if (!imageData?.base64) {
      console.log("No image data provided");
      setError("Aucune image fournie");
      setIsAnalyzing(false);
      return;
    }

    const imageBase64 = imageData.base64;
    let isMounted = true;

    const analyzeImage = async () => {
      try {
        if (!isMounted) return;
        setIsAnalyzing(true);
        setError(null);

        // Small delay to allow UI to render loading state and avoid freezing immediately
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log("Starting AI analysis, base64 length:", imageBase64.length);

        const prompt = `Analyse cette image d'un chat et identifie sa race. 
Fournis exactement 3 races possibles avec leurs niveaux de confiance (Élevée, Moyenne, ou Faible).
Pour chaque race, explique brièvement pourquoi cette race correspond aux caractéristiques visibles dans l'image.

Format ta réponse EXACTEMENT comme ceci (une race par ligne):
Race: [Nom de la race] | Confiance: [Élevée/Moyenne/Faible] | Raison: [Explication courte]
Race: [Nom de la race] | Confiance: [Élevée/Moyenne/Faible] | Raison: [Explication courte]
Race: [Nom de la race] | Confiance: [Élevée/Moyenne/Faible] | Raison: [Explication courte]

Exemple:
Race: Maine Coon | Confiance: Élevée | Raison: Grand gabarit, queue très fournie, plumet aux oreilles.
Race: British Shorthair | Confiance: Moyenne | Raison: Tête ronde, joues pleines, pelage dense.
Race: Persan | Confiance: Faible | Raison: Pelage long et épais visible.`;

        const base64ImageData = `data:image/jpeg;base64,${imageBase64}`;

        let response: string;
        try {
          response = await generateText({
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: prompt },
                  { type: "image", image: base64ImageData },
                ],
              },
            ],
          });
          console.log("AI Response received:", response?.substring(0, 200));
        } catch (aiError) {
          console.error("AI generateText error:", aiError);
          throw new Error("Impossible de contacter l'IA. Vérifiez votre connexion.");
        }

        if (!isMounted) return;

        if (!response || typeof response !== 'string') {
          console.error("Invalid AI response:", response);
          throw new Error("Réponse invalide de l'IA.");
        }

        const lines = response
          .split("\n")
          .filter((line) => line.trim().startsWith("Race:"));
        const parsedCandidates: CandidateBreed[] = [];

        for (const line of lines) {
          try {
            const raceMatch = line.match(/Race:\s*([^|]+)/);
            const confidenceMatch = line.match(/Confiance:\s*([^|]+)/);
            const reasonMatch = line.match(/Raison:\s*(.+)$/);

            if (raceMatch && confidenceMatch && reasonMatch) {
              const raceName = raceMatch[1].trim();
              const breedMatch = findBreedMatch(raceName);
              
              if (breedMatch) {
                // Éviter les doublons
                if (!parsedCandidates.some(c => c.id === breedMatch.id)) {
                  parsedCandidates.push({
                    id: breedMatch.id,
                    name: breedMatch.name,
                    confidenceLabel: confidenceMatch[1].trim(),
                    why: reasonMatch[1].trim(),
                  });
                }
              } else {
                // Fallback: utiliser le nom AI mais avec ID normalisé
                const fallbackId = raceName
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, "-");
                parsedCandidates.push({
                  id: fallbackId,
                  name: raceName,
                  confidenceLabel: confidenceMatch[1].trim(),
                  why: reasonMatch[1].trim(),
                });
              }
            }
          } catch (parseError) {
            console.warn("Error parsing line:", line, parseError);
          }
        }

        if (!isMounted) return;

        if (parsedCandidates.length > 0) {
          console.log("Parsed candidates:", parsedCandidates);
          setCandidates(parsedCandidates);
          // Pre-select the first candidate to simplify UX
          setSelectedId(parsedCandidates[0].id);
        } else {
          console.log("No candidates parsed, using fallback");
          const fallback = {
            id: "european-shorthair",
            name: "Chat Européen",
            confidenceLabel: "Moyenne",
            why: "Morphologie standard et couleur de pelage commune.",
          };
          setCandidates([fallback]);
          setSelectedId(fallback.id);
        }
      } catch (err) {
        console.error("Analysis error:", err);
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : "Erreur lors de l'analyse. Veuillez réessayer.";
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setIsAnalyzing(false);
        }
      }
    };

    analyzeImage();

    return () => {
      isMounted = false;
      clearImage();
    };
  }, [imageData, clearImage]);

  const onSelect = useCallback(async (id: string) => {
    setSelectedId(id);
    try {
      await Haptics.selectionAsync();
    } catch {}
  }, []);

  const onOpenSheet = useCallback(async () => {
    if (!selectedId) return;
    try {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
    } catch {}
    
    console.log("Navigating to breed details:", selectedId);
    
    // Use direct path string for better reliability across tabs
    router.push(`/(tabs)/(breeds)/${selectedId}`);
  }, [selectedId]);

  const selected = candidates.find((c) => c.id === selectedId) ?? null;

  const renderItem: ListRenderItem<CandidateBreed> = useCallback(
    ({ item }) => {
      const isActive = item.id === selectedId;
      return (
        <Pressable
          onPress={() => onSelect(item.id)}
          style={({ pressed }) => [
            styles.row,
            isActive ? styles.rowActive : null,
            pressed ? { opacity: 0.9 } : null,
          ]}
          testID={`scanCandidate-${item.id}`}
        >
          <View style={styles.rowLeft}>
            <View style={[styles.avatar, isActive ? styles.avatarActive : null]}>
              <Cat color={isActive ? "#fff" : "#111"} size={18} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, isActive && { color: "#fff" }]}>
                {item.name}
              </Text>
              <Text
                style={[
                  styles.rowSubtitle,
                  isActive && { color: "rgba(255,255,255,0.8)" },
                ]}
                numberOfLines={2}
              >
                {item.why}
              </Text>
            </View>
          </View>
          <View style={styles.rowRight}>
            <Text
              style={[
                styles.confidence,
                isActive && { color: "rgba(255,255,255,0.6)" },
              ]}
            >
              {item.confidenceLabel}
            </Text>
            <ChevronRight
              color={isActive ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.35)"}
              size={18}
            />
          </View>
        </Pressable>
      );
    },
    [onSelect, selectedId],
  );

  return (
    <View style={styles.screen} testID="scanResultScreen">
      {imageData?.uri && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageData.uri }}
            style={styles.image}
            contentFit="cover"
          />
        </View>
      )}

      {isAnalyzing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111" />
          <Text style={styles.loadingText}>
            Analyse de l&apos;image en cours...
          </Text>
          <Text style={styles.loadingSubtext}>
            Notre IA identifie la race de votre chat
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.errorBtn,
              pressed ? { opacity: 0.8 } : null,
            ]}
          >
            <Text style={styles.errorBtnText}>Réessayer</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.title}>Races identifiées</Text>
            <Text style={styles.subtitle}>
              Sélectionnez la race qui correspond le mieux pour voir sa fiche
              détaillée.
            </Text>
          </View>

          <FlatList
            data={candidates}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            testID="scanCandidatesList"
            style={styles.list}
          />

          <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
            <Pressable
              onPress={onOpenSheet}
              disabled={!selected}
              style={({ pressed }) => [
                styles.cta,
                !selected ? styles.ctaDisabled : null,
                pressed && selected ? { transform: [{ scale: 0.99 }] } : null,
              ]}
              testID="scanOpenBreedSheet"
            >
              <Text style={styles.ctaText}>
                {selected
                  ? `Voir la fiche : ${selected.name}`
                  : "Sélectionnez une race"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.secondary,
                pressed ? { opacity: 0.8 } : null,
              ]}
              testID="scanBack"
            >
              <Text style={styles.secondaryText}>Nouvelle analyse</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
    color: "rgba(0,0,0,0.95)",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(0,0,0,0.65)",
    lineHeight: 19,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 10,
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "800",
    color: "rgba(0,0,0,0.9)",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "rgba(0,0,0,0.7)",
    textAlign: "center",
    marginBottom: 20,
  },
  errorBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorBtnText: {
    color: "#fff",
    fontWeight: "800",
  },
  row: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: "#F7F7FA",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowActive: {
    backgroundColor: "#111",
    borderColor: "rgba(0,0,0,0.25)",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    paddingRight: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  avatarActive: {
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontWeight: "900",
    color: "rgba(0,0,0,0.92)",
  },
  rowSubtitle: {
    marginTop: 4,
    color: "rgba(0,0,0,0.6)",
    fontSize: 13,
    lineHeight: 18,
  },
  rowRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  confidence: {
    fontSize: 12,
    fontWeight: "800",
    color: "rgba(0,0,0,0.55)",
  },
  cta: {
    marginHorizontal: 16,
    marginTop: "auto",
    backgroundColor: "#111",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaDisabled: {
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  ctaText: {
    color: "#fff",
    fontWeight: "900",
  },
  secondary: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  secondaryText: {
    fontWeight: "800",
    color: "rgba(0,0,0,0.75)",
  },
});
