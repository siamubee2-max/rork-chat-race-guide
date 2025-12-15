import React, { useMemo, useState } from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Search, Globe, Cat } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

import { BREEDS, type BreedProfile } from "@/constants/breeds";
import { Colors } from "@/constants/colors";

type BreedRow = {
  id: BreedProfile["id"];
  name: string;
  origin: string;
  temperamentLabel: string;
  imageUri: string;
};

export default function BreedsHomeScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState<string>("");

  const data = useMemo((): BreedRow[] => {
    const q = query.trim().toLowerCase();
    const base = BREEDS.map((b) => ({
      id: b.id,
      name: b.name,
      origin: b.origin,
      temperamentLabel: b.temperament.slice(0, 3).join(" · "),
      imageUri: b.imageUri,
    }));

    if (!q) return base;
    return base.filter((b) => {
      const hay = `${b.name} ${b.origin} ${b.temperamentLabel}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const renderItem: ListRenderItem<BreedRow> = ({ item }) => {
    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(tabs)/(breeds)/[breedId]" as any,
            params: { breedId: item.id },
          } as any)
        }
        style={({ pressed }) => [
          styles.card,
          pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
        ]}
        testID={`breedCard-${item.id}`}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={styles.cardImage}
          contentFit="cover"
          transition={120}
        />
        <LinearGradient
          colors={["rgba(0, 0, 0, 0.55)", "rgba(0, 0, 0, 0.15)", "rgba(0, 0, 0, 0.4)"]}
          locations={[0, 0.4, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.cardOverlay}
        />

        <View style={styles.cardContentTop}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {item.origin}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.screen} testID="breedsHomeScreen">
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Cat color={Colors.primary} size={24} />
        </View>
        <Text style={styles.title}>{t('breeds.title')}</Text>
        <Text style={styles.subtitle}>
          {t('breeds.subtitle')}
        </Text>
      </View>

      <View style={styles.searchWrap} testID="breedsSearchWrap">
        <Search color={Colors.textMuted} size={18} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('breeds.searchPlaceholder')}
          placeholderTextColor={Colors.textLight}
          style={styles.searchInput}
          autoCorrect={false}
          testID="breedsSearchInput"
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.mapButton,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
        ]}
        onPress={() => router.push("/(tabs)/(breeds)/breeders" as any)}
      >
        <Globe color="#fff" size={18} />
        <Text style={styles.mapButtonText}>{t('breeds.worldMap')}</Text>
      </Pressable>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        testID="breedsList"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 18,
  },
  header: {
    marginBottom: 16,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
    color: Colors.text,
  },
  subtitle: {
    marginTop: 6,
    color: Colors.textSecondary,
    lineHeight: 20,
    fontSize: 15,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.backgroundCard,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  listContent: {
    paddingTop: 14,
    paddingBottom: 10,
    gap: 14,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  mapButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: Colors.text,
    aspectRatio: 1,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  cardContentTop: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.2,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
