import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Image,
} from "react-native";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useGamification, LeaderboardEntry, LEVELS } from "@/context/gamification";

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: "1", username: "CatLover92", level: 8, xp: 2850, rank: 1, avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
  { id: "2", username: "WhiskersMom", level: 7, xp: 2100, rank: 2, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
  { id: "3", username: "MeowMaster", level: 7, xp: 1950, rank: 3, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
  { id: "4", username: "FelineFan", level: 6, xp: 1500, rank: 4, avatarUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100" },
  { id: "5", username: "PurrfectLife", level: 5, xp: 1200, rank: 5 },
  { id: "6", username: "KittyKing", level: 5, xp: 1050, rank: 6 },
  { id: "7", username: "CatWhisperer", level: 4, xp: 780, rank: 7 },
  { id: "8", username: "FluffyFriend", level: 4, xp: 650, rank: 8, avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
  { id: "9", username: "NyanNyan", level: 3, xp: 420, rank: 9 },
  { id: "10", username: "TabbyTales", level: 3, xp: 350, rank: 10 },
];

function LeaderboardRow({
  entry,
  isCurrentUser,
  index,
}: {
  entry: LeaderboardEntry;
  isCurrentUser: boolean;
  index: number;
}) {
  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const delay = index * 80;
    Animated.parallel([
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
  }, [index, slideAnim, opacityAnim]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown color="#FFD700" size={20} />;
    if (rank === 2) return <Medal color="#C0C0C0" size={20} />;
    if (rank === 3) return <Medal color="#CD7F32" size={20} />;
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return null;
  };

  const levelInfo = LEVELS.find((l) => l.level === entry.level) || LEVELS[0];

  return (
    <Animated.View
      style={[
        styles.leaderboardRow,
        isCurrentUser && styles.leaderboardRowCurrent,
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.rankBadge, getRankStyle(entry.rank)]}>
        {getRankIcon(entry.rank) || (
          <Text style={styles.rankText}>{entry.rank}</Text>
        )}
      </View>

      <View style={styles.avatarContainer}>
        {entry.avatarUrl ? (
          <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {entry.username.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.levelIndicator}>
          <Text style={styles.levelIndicatorText}>{entry.level}</Text>
        </View>
      </View>

      <View style={styles.userInfo}>
        <Text style={[styles.username, isCurrentUser && styles.usernameCurrent]}>
          {entry.username}
          {isCurrentUser && " (Vous)"}
        </Text>
        <Text style={styles.levelTitle}>{levelInfo.title}</Text>
      </View>

      <View style={styles.xpContainer}>
        <TrendingUp color={Colors.primary} size={14} />
        <Text style={styles.xpValue}>{entry.xp.toLocaleString()}</Text>
      </View>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const { stats, currentLevelInfo } = useGamification();
  const userRank = 15;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.podium}>
          {MOCK_LEADERBOARD.slice(0, 3).map((entry, index) => {
            const order = [1, 0, 2];
            const actualEntry = MOCK_LEADERBOARD[order[index]];
            const heights = [100, 130, 80];
            const positions = ["left", "center", "right"] as const;
            
            return (
              <View
                key={actualEntry.id}
                style={[styles.podiumItem, styles[`podium${positions[index].charAt(0).toUpperCase() + positions[index].slice(1)}` as keyof typeof styles]]}
              >
                <View style={styles.podiumAvatarContainer}>
                  {actualEntry.avatarUrl ? (
                    <Image
                      source={{ uri: actualEntry.avatarUrl }}
                      style={[
                        styles.podiumAvatar,
                        index === 1 && styles.podiumAvatarFirst,
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.podiumAvatarPlaceholder,
                        index === 1 && styles.podiumAvatarFirst,
                      ]}
                    >
                      <Text style={styles.podiumAvatarText}>
                        {actualEntry.username.charAt(0)}
                      </Text>
                    </View>
                  )}
                  {index === 1 && (
                    <Crown
                      color="#FFD700"
                      size={24}
                      style={styles.podiumCrown}
                    />
                  )}
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {actualEntry.username}
                </Text>
                <Text style={styles.podiumXp}>{actualEntry.xp} XP</Text>
                <View
                  style={[
                    styles.podiumBar,
                    { height: heights[index] },
                    index === 0 && styles.podiumBarSilver,
                    index === 1 && styles.podiumBarGold,
                    index === 2 && styles.podiumBarBronze,
                  ]}
                >
                  <Text style={styles.podiumRank}>{actualEntry.rank}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.yourRankCard}>
        <View style={styles.yourRankLeft}>
          <Trophy color={Colors.primary} size={24} />
          <View>
            <Text style={styles.yourRankLabel}>Votre classement</Text>
            <Text style={styles.yourRankValue}>#{userRank}</Text>
          </View>
        </View>
        <View style={styles.yourRankRight}>
          <Text style={styles.yourXp}>{stats.totalXp} XP</Text>
          <Text style={styles.yourLevel}>{currentLevelInfo.title}</Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.listTitle}>Top 10</Text>
        {MOCK_LEADERBOARD.map((entry, index) => (
          <LeaderboardRow
            key={entry.id}
            entry={entry}
            isCurrentUser={false}
            index={index}
          />
        ))}
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
  header: {
    backgroundColor: Colors.backgroundCard,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    borderTopWidth: 0,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingTop: 20,
    paddingHorizontal: 20,
    height: 240,
  },
  podiumItem: {
    alignItems: "center",
    width: 100,
  },
  podiumLeft: {
    marginRight: -10,
  },
  podiumCenter: {
    zIndex: 1,
  },
  podiumRight: {
    marginLeft: -10,
  },
  podiumAvatarContainer: {
    position: "relative",
    marginBottom: 8,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: Colors.backgroundCard,
  },
  podiumAvatarFirst: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderColor: "#FFD700",
  },
  podiumAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: Colors.backgroundCard,
  },
  podiumAvatarText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  podiumCrown: {
    position: "absolute",
    top: -16,
    left: "50%",
    marginLeft: -12,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 2,
    maxWidth: 90,
  },
  podiumXp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  podiumBar: {
    width: 70,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 12,
  },
  podiumBarGold: {
    backgroundColor: "#FFD700",
  },
  podiumBarSilver: {
    backgroundColor: "#C0C0C0",
  },
  podiumBarBronze: {
    backgroundColor: "#CD7F32",
  },
  podiumRank: {
    fontSize: 24,
    fontWeight: "800" as const,
    color: "#FFFFFF",
  },
  yourRankCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    margin: 16,
    padding: 16,
    backgroundColor: Colors.primaryMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  yourRankLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  yourRankLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  yourRankValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.primary,
  },
  yourRankRight: {
    alignItems: "flex-end",
  },
  yourXp: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  yourLevel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  listSection: {
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginBottom: 12,
  },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderboardRowCurrent: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankGold: {
    backgroundColor: "rgba(255, 215, 0, 0.2)",
  },
  rankSilver: {
    backgroundColor: "rgba(192, 192, 192, 0.2)",
  },
  rankBronze: {
    backgroundColor: "rgba(205, 127, 50, 0.2)",
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.textSecondary,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  levelIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.backgroundCard,
  },
  levelIndicatorText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: "#FFFFFF",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  usernameCurrent: {
    color: Colors.primary,
  },
  levelTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  xpContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  xpValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  bottomPadding: {
    height: 32,
  },
});
