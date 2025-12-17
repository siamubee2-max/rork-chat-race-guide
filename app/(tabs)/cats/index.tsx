import React from "react";
import { router } from "expo-router";
import { Image } from "expo-image";
import { Plus, Cat, Heart } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useCats, type CatProfile } from "@/context/cats";
import { getBreedById } from "@/constants/breeds";
import { Colors } from "@/constants/colors";

export default function CatsListScreen() {
  const { t } = useTranslation();
  const { cats } = useCats();
  const insets = useSafeAreaInsets();

  const onAddCat = () => {
    router.push("/(tabs)/cats/form" as any);
  };

  const onOpenCat = (cat: CatProfile) => {
    router.push(`/(tabs)/cats/${cat.id}` as any);
  };

  const renderItem: ListRenderItem<CatProfile> = ({ item }) => {
    const breed = item.breedId ? getBreedById(item.breedId) : null;
    const breedDisplay = breed?.name ?? t("cats.mixedBreed");

    return (
      <Pressable
        onPress={() => onOpenCat(item)}
        style={({ pressed }) => [
          styles.card,
          pressed ? { transform: [{ scale: 0.98 }], opacity: 0.95 } : null,
        ]}
      >
        <View style={styles.cardContent}>
          <View style={styles.avatar}>
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <Cat color={Colors.textMuted} size={24} />
            )}
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={styles.breedRow}>
              {!breed && <Heart size={12} color={Colors.heart} />}
              <Text style={[styles.details, !breed && styles.mixedBreedText]}>
                {breedDisplay}
              </Text>
              {item.microchip ? <Text style={styles.details}> · {t("cats.chipped")}</Text> : null}
            </View>
            {item.microchip && (
              <Text style={styles.chipText}>{t("cats.chip")} : {item.microchip}</Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Cat color={Colors.textMuted} size={48} />
      </View>
      <Text style={styles.emptyTitle}>{t("cats.noCats")}</Text>
      <Text style={styles.emptyText}>
        {t("cats.noCatsText")}
      </Text>
      <View style={styles.welcomeHint}>
        <Heart size={14} color={Colors.heart} />
        <Text style={styles.welcomeHintText}>{t("cats.allCatsWelcome")}</Text>
      </View>
      <Pressable 
        onPress={onAddCat} 
        style={({ pressed }) => [
          styles.emptyBtn,
          pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] }
        ]}
      >
        <Plus color="#fff" size={20} />
        <Text style={styles.emptyBtnText}>{t("cats.addCat")}</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={cats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          cats.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={EmptyState}
        contentInsetAdjustmentBehavior="automatic"
      />

      {cats.length > 0 && (
        <View
          style={[
            styles.fabContainer,
            { bottom: insets.bottom + 20 },
          ]}
        >
          <Pressable 
            onPress={onAddCat} 
            style={({ pressed }) => [
              styles.fab,
              pressed && { transform: [{ scale: 0.95 }] }
            ]}
          >
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
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 18,
    gap: 14,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.primaryMuted,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text,
  },
  details: {
    marginTop: 2,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  chipText: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  welcomeHint: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginBottom: 24,
    backgroundColor: "rgba(212, 91, 91, 0.1)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  welcomeHintText: {
    fontSize: 13,
    color: Colors.heart,
    fontWeight: "600",
  },
  breedRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    marginTop: 2,
  },
  mixedBreedText: {
    color: Colors.heart,
  },
  fabContainer: {
    position: "absolute",
    right: 20,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
