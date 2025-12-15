import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from "react-native";
import { Lock } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useGamification, Achievement } from "@/context/gamification";

type CategoryFilter = "all" | "cats" | "health" | "social" | "explorer" | "dedication";

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  all: "Tous",
  cats: "Chats",
  health: "Santé",
  social: "Social",
  explorer: "Explorateur",
  dedication: "Fidélité",
};

function AchievementCard({
  achievement,
  isUnlocked,
  index,
}: {
  achievement: Achievement;
  isUnlocked: boolean;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
        delay: index * 50,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, scaleAnim, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        !isUnlocked && styles.achievementCardLocked,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.achievementIcon, !isUnlocked && styles.achievementIconLocked]}>
        {isUnlocked ? (
          <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
        ) : (
          <Lock color={Colors.textMuted} size={24} />
        )}
      </View>
      <Text style={[styles.achievementTitle, !isUnlocked && styles.textLocked]}>
        {achievement.titleKey.split(".").pop()?.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </Text>
      <Text style={[styles.achievementDesc, !isUnlocked && styles.textLocked]} numberOfLines={2}>
        {achievement.descriptionKey.split(".").pop()?.replace(/_desc/g, "").replace(/_/g, " ")}
      </Text>
      <View style={[styles.xpBadge, !isUnlocked && styles.xpBadgeLocked]}>
        <Text style={[styles.xpText, !isUnlocked && styles.textLocked]}>
          +{achievement.xpReward} XP
        </Text>
      </View>
      {isUnlocked && <View style={styles.unlockedBadge} />}
    </Animated.View>
  );
}

export default function AchievementsScreen() {
  const { stats, achievements } = useGamification();
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const filteredAchievements = achievements.filter((a) => {
    if (a.secret && !stats.unlockedAchievements.includes(a.id)) return false;
    if (filter === "all") return true;
    return a.category === filter;
  });

  const unlockedCount = stats.unlockedAchievements.length;
  const totalVisible = achievements.filter((a) => !a.secret || stats.unlockedAchievements.includes(a.id)).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>
            {unlockedCount}/{totalVisible}
          </Text>
        </View>
        <Text style={styles.headerTitle}>Succès débloqués</Text>
        <Text style={styles.headerSubtitle}>
          Continue ton aventure pour débloquer plus de succès !
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {(Object.keys(CATEGORY_LABELS) as CategoryFilter[]).map((category) => (
          <Pressable
            key={category}
            style={[styles.filterButton, filter === category && styles.filterButtonActive]}
            onPress={() => setFilter(category)}
          >
            <Text
              style={[
                styles.filterText,
                filter === category && styles.filterTextActive,
              ]}
            >
              {CATEGORY_LABELS[category]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.achievementsList}
        contentContainerStyle={styles.achievementsGrid}
        showsVerticalScrollIndicator={false}
      >
        {filteredAchievements.map((achievement, index) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            isUnlocked={stats.unlockedAchievements.includes(achievement.id)}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  filterContainer: {
    maxHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  achievementsList: {
    flex: 1,
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 12,
  },
  achievementCard: {
    width: "47%",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    position: "relative",
  },
  achievementCardLocked: {
    backgroundColor: Colors.backgroundSecondary,
    borderColor: Colors.border,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  achievementIconLocked: {
    backgroundColor: Colors.border,
  },
  achievementEmoji: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  textLocked: {
    color: Colors.textMuted,
  },
  xpBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.accentMuted,
  },
  xpBadgeLocked: {
    backgroundColor: Colors.border,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  unlockedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
});
