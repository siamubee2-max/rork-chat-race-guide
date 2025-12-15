import React, { useState } from "react";
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

import { useDiscussions, type Discussion } from "@/context/discussions";

const CATEGORIES = [
  { id: "general", label: "Général", color: "#4A90E2" },
  { id: "health", label: "Santé", color: "#E85D75" },
  { id: "behavior", label: "Comportement", color: "#9B59B6" },
  { id: "nutrition", label: "Alimentation", color: "#F39C12" },
  { id: "advice", label: "Conseils", color: "#1ABC9C" },
];

export default function DiscussionsScreen() {
  const { discussions, isLoading } = useDiscussions();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const formatDate = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}j`;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const getCategoryColor = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.color || "#999";
  };

  const getCategoryLabel = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId)?.label || categoryId;
  };

  const handleNewDiscussion = () => {
    router.push("/(tabs)/discussions/new" as any);
  };

  const filteredDiscussions = selectedCategory
    ? discussions.filter((d) => d.category === selectedCategory)
    : discussions;

  const renderItem: ListRenderItem<Discussion> = ({ item }) => {
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
  };

  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <MessageCircle color="#ccc" size={48} />
      </View>
      <Text style={styles.emptyTitle}>Aucune discussion</Text>
      <Text style={styles.emptyText}>
        Soyez le premier à démarrer une conversation !
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.categories}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoriesContent}
          renderItem={({ item }) => (
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
          )}
        />
      </View>

      <FlatList
        data={filteredDiscussions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          filteredDiscussions.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={EmptyState}
      />

      <View style={[styles.fabContainer, { bottom: insets.bottom + 20 }]}>
        <Pressable onPress={handleNewDiscussion} style={styles.fab}>
          <Plus color="#fff" size={24} />
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
