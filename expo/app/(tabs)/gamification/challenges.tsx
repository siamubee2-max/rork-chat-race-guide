import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import { Clock, Zap, CheckCircle, Target } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useGamification, Challenge } from "@/context/gamification";

function ChallengeCard({
  challenge,
  index,
}: {
  challenge: Challenge;
  index: number;
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const progress = challenge.target > 0 ? challenge.progress / challenge.target : 0;

  useEffect(() => {
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 800,
        delay,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [progress, index, progressAnim, slideAnim, opacityAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const expiresAt = new Date(challenge.expiresAt);
  const now = new Date();
  const hoursLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
  const daysLeft = Math.floor(hoursLeft / 24);

  const timeLeftText = daysLeft > 0 ? `${daysLeft}j restants` : `${hoursLeft}h restantes`;

  const getActionLabel = (action: Challenge["action"]) => {
    const labels: Record<Challenge["action"], string> = {
      login: "Connexion",
      log: "Journal quotidien",
      weight: "Pesée",
      post: "Publication",
      comment: "Commentaire",
      scan: "Scan",
      reminder: "Rappel",
    };
    return labels[action];
  };

  return (
    <Animated.View
      style={[
        styles.challengeCard,
        challenge.completed && styles.challengeCardCompleted,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.challengeHeader}>
        <View style={styles.challengeLeft}>
          <View
            style={[
              styles.challengeIcon,
              challenge.completed && styles.challengeIconCompleted,
            ]}
          >
            {challenge.completed ? (
              <CheckCircle color="#FFFFFF" size={24} />
            ) : (
              <Target color={Colors.primary} size={24} />
            )}
          </View>
          <View style={styles.challengeInfo}>
            <Text style={styles.challengeTitle}>
              {getActionLabel(challenge.action)}
            </Text>
            <View style={styles.challengeMeta}>
              <Clock color={Colors.textMuted} size={12} />
              <Text style={styles.challengeTime}>{timeLeftText}</Text>
            </View>
          </View>
        </View>
        <View style={styles.xpBadge}>
          <Zap color={Colors.accent} size={14} />
          <Text style={styles.xpValue}>+{challenge.xpReward}</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              challenge.completed && styles.progressFillCompleted,
              { width: progressWidth },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {challenge.progress}/{challenge.target}
        </Text>
      </View>

      {challenge.completed && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedText}>Complété !</Text>
        </View>
      )}
    </Animated.View>
  );
}

export default function ChallengesScreen() {
  const { challenges, stats } = useGamification();

  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");

  const completedDaily = dailyChallenges.filter((c) => c.completed).length;
  const completedWeekly = weeklyChallenges.filter((c) => c.completed).length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{stats.currentStreak}</Text>
          <Text style={styles.summaryLabel}>Jours de suite</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>
            {completedDaily + completedWeekly}/{dailyChallenges.length + weeklyChallenges.length}
          </Text>
          <Text style={styles.summaryLabel}>Défis complétés</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Défis quotidiens</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>
              {completedDaily}/{dailyChallenges.length}
            </Text>
          </View>
        </View>
        {dailyChallenges.map((challenge, index) => (
          <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Défis hebdomadaires</Text>
          <View style={[styles.sectionBadge, styles.sectionBadgeWeekly]}>
            <Text style={[styles.sectionBadgeText, styles.sectionBadgeTextWeekly]}>
              {completedWeekly}/{weeklyChallenges.length}
            </Text>
          </View>
        </View>
        {weeklyChallenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index + dailyChallenges.length}
          />
        ))}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>Astuce</Text>
        <Text style={styles.tipText}>
          Complète tes défis quotidiens pour maintenir ta série et gagner des XP bonus !
          Les défis se réinitialisent chaque jour à minuit.
        </Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundCard,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  sectionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.accentMuted,
  },
  sectionBadgeWeekly: {
    backgroundColor: "rgba(122, 160, 91, 0.2)",
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  sectionBadgeTextWeekly: {
    color: Colors.success,
  },
  challengeCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  challengeCardCompleted: {
    borderColor: Colors.success,
    backgroundColor: "rgba(122, 160, 91, 0.05)",
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  challengeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  challengeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  challengeIconCompleted: {
    backgroundColor: Colors.success,
  },
  challengeInfo: {
    gap: 4,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  challengeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  challengeTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.accentMuted,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.accent,
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressFillCompleted: {
    backgroundColor: Colors.success,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
    minWidth: 32,
    textAlign: "right",
  },
  completedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.success,
  },
  completedText: {
    fontSize: 10,
    fontWeight: "600" as const,
    color: "#FFFFFF",
  },
  tipCard: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.accentMuted,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 32,
  },
});
