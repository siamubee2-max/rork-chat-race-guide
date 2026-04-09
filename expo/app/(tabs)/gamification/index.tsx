import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";
import { navigate, navigateWithParams, navigateReplace } from "@/utils/navigate";
import {
  Trophy,
  Target,
  Users,
  Flame,
  Star,
  ChevronRight,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useGamification, ACHIEVEMENTS } from "@/context/gamification";
import { PremiumGate } from "@/components/PremiumGate";

const { width } = Dimensions.get("window");

export default function GamificationScreen() {
  const { stats, currentLevelInfo, challenges, updateStreak } = useGamification();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    updateStreak();
    
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: currentLevelInfo.progress,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentLevelInfo.progress, updateStreak, progressAnim, scaleAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const unlockedCount = stats.unlockedAchievements.length;
  const totalAchievements = ACHIEVEMENTS.filter((a) => !a.secret).length;
  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");
  const completedDaily = dailyChallenges.filter((c) => c.completed).length;
  const completedWeekly = weeklyChallenges.filter((c) => c.completed).length;

  return (
    <PremiumGate>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={[styles.profileCard, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelNumber}>{stats.level}</Text>
        </View>
        <Text style={styles.levelTitle}>{currentLevelInfo.title}</Text>
        <Text style={styles.xpText}>{stats.totalXp} XP</Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>
              {currentLevelInfo.progressXp} / {currentLevelInfo.requiredXp} XP
            </Text>
            {currentLevelInfo.nextLevel && (
              <Text style={styles.nextLevelLabel}>
                Niveau {currentLevelInfo.nextLevel.level}
              </Text>
            )}
          </View>
        </View>
      </Animated.View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.accentMuted }]}>
            <Flame color={Colors.accent} size={24} />
          </View>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Jours de suite</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: Colors.primaryMuted }]}>
            <Star color={Colors.primary} size={24} />
          </View>
          <Text style={styles.statValue}>{stats.longestStreak}</Text>
          <Text style={styles.statLabel}>Record</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: "rgba(107, 154, 196, 0.2)" }]}>
            <Award color={Colors.info} size={24} />
          </View>
          <Text style={styles.statValue}>{unlockedCount}</Text>
          <Text style={styles.statLabel}>Succès</Text>
        </View>
      </View>

      <Pressable
        style={styles.menuCard}
        onPress={() => navigate("/gamification/challenges")}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.accentMuted }]}>
            <Target color={Colors.accent} size={24} />
          </View>
          <View>
            <Text style={styles.menuTitle}>Défis du jour</Text>
            <Text style={styles.menuSubtitle}>
              {completedDaily}/{dailyChallenges.length} complétés
            </Text>
          </View>
        </View>
        <View style={styles.menuRight}>
          <View style={styles.miniProgress}>
            {dailyChallenges.map((c, i) => (
              <View
                key={i}
                style={[
                  styles.miniProgressDot,
                  c.completed && styles.miniProgressDotFilled,
                ]}
              />
            ))}
          </View>
          <ChevronRight color={Colors.textMuted} size={20} />
        </View>
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => navigate("/gamification/challenges")}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(122, 160, 91, 0.2)" }]}>
            <Zap color={Colors.success} size={24} />
          </View>
          <View>
            <Text style={styles.menuTitle}>Défis de la semaine</Text>
            <Text style={styles.menuSubtitle}>
              {completedWeekly}/{weeklyChallenges.length} complétés
            </Text>
          </View>
        </View>
        <View style={styles.menuRight}>
          <View style={styles.miniProgress}>
            {weeklyChallenges.map((c, i) => (
              <View
                key={i}
                style={[
                  styles.miniProgressDot,
                  c.completed && styles.miniProgressDotFilled,
                  { backgroundColor: c.completed ? Colors.success : Colors.border },
                ]}
              />
            ))}
          </View>
          <ChevronRight color={Colors.textMuted} size={20} />
        </View>
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => navigate("/gamification/achievements")}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, { backgroundColor: Colors.primaryMuted }]}>
            <Trophy color={Colors.primary} size={24} />
          </View>
          <View>
            <Text style={styles.menuTitle}>Mes Succès</Text>
            <Text style={styles.menuSubtitle}>
              {unlockedCount}/{totalAchievements} débloqués
            </Text>
          </View>
        </View>
        <ChevronRight color={Colors.textMuted} size={20} />
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => navigate("/gamification/leaderboard")}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, { backgroundColor: "rgba(107, 154, 196, 0.2)" }]}>
            <Users color={Colors.info} size={24} />
          </View>
          <View>
            <Text style={styles.menuTitle}>Classement</Text>
            <Text style={styles.menuSubtitle}>Voir la communauté</Text>
          </View>
        </View>
        <ChevronRight color={Colors.textMuted} size={20} />
      </Pressable>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Mon activité</Text>
        <View style={styles.activityGrid}>
          <View style={styles.activityItem}>
            <TrendingUp color={Colors.textSecondary} size={18} />
            <Text style={styles.activityValue}>{stats.totalCats}</Text>
            <Text style={styles.activityLabel}>Chats</Text>
          </View>
          <View style={styles.activityItem}>
            <TrendingUp color={Colors.textSecondary} size={18} />
            <Text style={styles.activityValue}>{stats.totalWeightLogs}</Text>
            <Text style={styles.activityLabel}>Pesées</Text>
          </View>
          <View style={styles.activityItem}>
            <TrendingUp color={Colors.textSecondary} size={18} />
            <Text style={styles.activityValue}>{stats.totalDailyLogs}</Text>
            <Text style={styles.activityLabel}>Suivis</Text>
          </View>
          <View style={styles.activityItem}>
            <TrendingUp color={Colors.textSecondary} size={18} />
            <Text style={styles.activityValue}>{stats.totalPosts}</Text>
            <Text style={styles.activityLabel}>Posts</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomPadding} />
      </ScrollView>
    </PremiumGate>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileCard: {
    margin: 16,
    padding: 24,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  levelBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  levelNumber: {
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  xpText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  nextLevelLabel: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: "600" as const,
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  menuSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  menuRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  miniProgress: {
    flexDirection: "row",
    gap: 4,
  },
  miniProgressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  miniProgressDotFilled: {
    backgroundColor: Colors.accent,
  },
  activitySection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  activityItem: {
    width: (width - 44) / 2,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 8,
  },
  activityLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 4,
  },
  bottomPadding: {
    height: 32,
  },
});
