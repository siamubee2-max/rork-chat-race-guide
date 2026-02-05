import React, { useCallback, useMemo, useState } from "react";
import { router } from "expo-router";
import { MessageCircle, Plus } from "lucide-react-native";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { useDiscussions, type Discussion } from "@/context/discussions";
import { PremiumGate } from "@/components/PremiumGate";

const DISCUSSION_CARD_HEIGHT = 120;
const DISCUSSION_CARD_MARGIN = 12;

const CATEGORY_COLORS: Record<string, string> = {
  general: "#4A90E2",
  health: "#E85D75",
  behavior: "#9B59B6",
  nutrition: "#F39C12",
  advice: "#1ABC9C",
};

export default function DiscussionsScreen() {
  const { discussions, isLoading } = useDiscussions();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t, i18n } = useTranslation();

  const CATEGORIES = [
    { id: "general", label: t("discussions.categories.general"), color: "#4A90E2" },
    { id: "health", label: t("discussions.categories.health"), color: "#E85D75" },
    { id: "behavior", label: t("discussions.categories.behavior"), color: "#9B59B6" },
    { id: "nutrition", label: t("discussions.categories.nutrition"), color: "#F39C12" },
    { id: "advice", label: t("discussions.categories.advice"), color: "#1ABC9C" },
  ];

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("discussions.justNow");
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return d.toLocaleDateString(i18n.language, { day: "numeric", month: "short" });
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORY_COLORS[categoryId] || "#999";
  };

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const handleNewDiscussion = useCallback(() => {
    router.push("/(tabs)/discussions/new" as any);
  }, []);

  const filteredDiscussions = useMemo(
    () =>
      selectedCategory
        ? discussions.filter((d) => d.category === selectedCategory)
        : discussions,
    [discussions, selectedCategory]
  );

  const renderItem: ListRenderItem<Discussion> = useCallback(
    ({ item }) => {
    const categoryColor = getCategoryColor(item.category);

    return (
      <Pressable
        onPress={() => router.push(`/(tabs)/discussions/${item.id}` as any)}
        style={({ pressed }) => [
          styles.card,
          pressed ? { transform: [{ scale: 0.98 }] } : null,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: categoryColor + "20" }]}>
            <Text style={[styles.badgeText, { color: categoryColor }]}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>
          <Text style={styles.time}>{formatDate(item.lastMessageAt)}</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.author}>{item.userName}</Text>
          <View style={styles.messageCount}>
            <MessageCircle color="#999" size={14} />
            <Text style={styles.messageCountText}>{item.messagesCount}</Text>
          </View>
        </View>
      </Pressable>
    );
    },
    [t, i18n, getCategoryColor, getCategoryLabel]
  );

  const keyExtractor = useCallback((item: Discussion) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: DISCUSSION_CARD_HEIGHT,
      offset: (DISCUSSION_CARD_HEIGHT + DISCUSSION_CARD_MARGIN) * index,
      index,
    }),
    []
  );

  const renderCategoryChip = useCallback(
    ({ item }: { item: typeof CATEGORIES[0] }) => (
      <Pressable
        onPress={() =>
          setSelectedCategory(selectedCategory === item.id ? null : item.id)
        }
        style={[
          styles.categoryChip,
          selectedCategory === item.id && {
            backgroundColor: item.color,
          },
        ]}
      >
        <Text
          style={[
            styles.categoryChipText,
            selectedCategory === item.id && styles.categoryChipTextActive,
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    ),
    [selectedCategory]
  );

  const categoryKeyExtractor = useCallback(
    (item: typeof CATEGORIES[0]) => item.id,
    []
  );

  const EmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <MessageCircle color="#ccc" size={48} />
      </View>
      <Text style={styles.emptyTitle}>{t("discussions.noDiscussions")}</Text>
      <Text style={styles.emptyText}>
        {t("discussions.beFirstToStart")}
      </Text>
    </View>
  ), [t]);

  const listContentStyle = useMemo(
    () => [
      styles.listContent,
      filteredDiscussions.length === 0 && styles.listContentEmpty,
    ],
    [filteredDiscussions.length]
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      </View>
    );
  }

  return (
    <PremiumGate>
      <View style={styles.screen}>
        <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={categoryKeyExtractor}
          contentContainerStyle={styles.categoriesContent}
          renderItem={renderCategoryChip}
        />
      </View>

      <FlatList
        data={filteredDiscussions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={filteredDiscussions.length > 0 ? getItemLayout : undefined}
        contentContainerStyle={listContentStyle}
        ListEmptyComponent={EmptyState}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
        <Pressable onPress={handleNewDiscussion} style={styles.fab}>
          <Plus color="#fff" size={24} />
        </Pressable>
      </View>
      </View>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#999",
  },
  categories: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  categoryChipTextActive: {
    color: "#fff",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#F9F9FB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  author: {
    fontSize: 13,
    color: "#666",
  },
  messageCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  messageCountText: {
    fontSize: 13,
    color: "#999",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 32,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F5F5F5",
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
  },
  fabContainer: {
    position: "absolute",
    right: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4A90E2",
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

});
