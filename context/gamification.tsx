import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback } from "react";

export type AchievementId =
  | "first_cat"
  | "cat_collector"
  | "cat_master"
  | "first_weight"
  | "weight_streak_7"
  | "weight_streak_30"
  | "first_log"
  | "log_streak_7"
  | "log_streak_30"
  | "first_vaccine"
  | "health_guardian"
  | "first_post"
  | "social_butterfly"
  | "community_star"
  | "first_event"
  | "event_organizer"
  | "first_scan"
  | "breed_expert"
  | "emergency_prepared"
  | "reminder_master"
  | "budget_tracker"
  | "early_adopter"
  | "loyal_user_30"
  | "loyal_user_100"
  | "helper"
  | "influencer";

export type Achievement = {
  id: AchievementId;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  xpReward: number;
  category: "cats" | "health" | "social" | "explorer" | "dedication";
  requirement: number;
  secret?: boolean;
};

export type Challenge = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  type: "daily" | "weekly" | "special";
  xpReward: number;
  target: number;
  progress: number;
  completed: boolean;
  expiresAt: string;
  action: "weight" | "log" | "post" | "comment" | "scan" | "login" | "reminder";
};

export type LeaderboardEntry = {
  id: string;
  username: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  rank: number;
};

export type UserStats = {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  totalCats: number;
  totalWeightLogs: number;
  totalDailyLogs: number;
  totalPosts: number;
  totalComments: number;
  totalScans: number;
  joinedDate: string;
  unlockedAchievements: AchievementId[];
  completedChallenges: string[];
};

export const ACHIEVEMENTS: Achievement[] = [
  // Cats category
  { id: "first_cat", titleKey: "gamification.achievements.first_cat", descriptionKey: "gamification.achievements.first_cat_desc", icon: "🐱", xpReward: 50, category: "cats", requirement: 1 },
  { id: "cat_collector", titleKey: "gamification.achievements.cat_collector", descriptionKey: "gamification.achievements.cat_collector_desc", icon: "🐈", xpReward: 150, category: "cats", requirement: 3 },
  { id: "cat_master", titleKey: "gamification.achievements.cat_master", descriptionKey: "gamification.achievements.cat_master_desc", icon: "👑", xpReward: 500, category: "cats", requirement: 5 },
  
  // Health category
  { id: "first_weight", titleKey: "gamification.achievements.first_weight", descriptionKey: "gamification.achievements.first_weight_desc", icon: "⚖️", xpReward: 30, category: "health", requirement: 1 },
  { id: "weight_streak_7", titleKey: "gamification.achievements.weight_streak_7", descriptionKey: "gamification.achievements.weight_streak_7_desc", icon: "📊", xpReward: 100, category: "health", requirement: 7 },
  { id: "weight_streak_30", titleKey: "gamification.achievements.weight_streak_30", descriptionKey: "gamification.achievements.weight_streak_30_desc", icon: "🏆", xpReward: 300, category: "health", requirement: 30 },
  { id: "first_log", titleKey: "gamification.achievements.first_log", descriptionKey: "gamification.achievements.first_log_desc", icon: "📝", xpReward: 30, category: "health", requirement: 1 },
  { id: "log_streak_7", titleKey: "gamification.achievements.log_streak_7", descriptionKey: "gamification.achievements.log_streak_7_desc", icon: "🔥", xpReward: 100, category: "health", requirement: 7 },
  { id: "log_streak_30", titleKey: "gamification.achievements.log_streak_30", descriptionKey: "gamification.achievements.log_streak_30_desc", icon: "⭐", xpReward: 300, category: "health", requirement: 30 },
  { id: "first_vaccine", titleKey: "gamification.achievements.first_vaccine", descriptionKey: "gamification.achievements.first_vaccine_desc", icon: "💉", xpReward: 50, category: "health", requirement: 1 },
  { id: "health_guardian", titleKey: "gamification.achievements.health_guardian", descriptionKey: "gamification.achievements.health_guardian_desc", icon: "🛡️", xpReward: 200, category: "health", requirement: 10 },
  
  // Social category
  { id: "first_post", titleKey: "gamification.achievements.first_post", descriptionKey: "gamification.achievements.first_post_desc", icon: "💬", xpReward: 40, category: "social", requirement: 1 },
  { id: "social_butterfly", titleKey: "gamification.achievements.social_butterfly", descriptionKey: "gamification.achievements.social_butterfly_desc", icon: "🦋", xpReward: 150, category: "social", requirement: 10 },
  { id: "community_star", titleKey: "gamification.achievements.community_star", descriptionKey: "gamification.achievements.community_star_desc", icon: "🌟", xpReward: 400, category: "social", requirement: 50 },
  { id: "first_event", titleKey: "gamification.achievements.first_event", descriptionKey: "gamification.achievements.first_event_desc", icon: "🎉", xpReward: 60, category: "social", requirement: 1 },
  { id: "event_organizer", titleKey: "gamification.achievements.event_organizer", descriptionKey: "gamification.achievements.event_organizer_desc", icon: "🎪", xpReward: 200, category: "social", requirement: 5 },
  { id: "helper", titleKey: "gamification.achievements.helper", descriptionKey: "gamification.achievements.helper_desc", icon: "🤝", xpReward: 150, category: "social", requirement: 20 },
  { id: "influencer", titleKey: "gamification.achievements.influencer", descriptionKey: "gamification.achievements.influencer_desc", icon: "📢", xpReward: 500, category: "social", requirement: 100 },
  
  // Explorer category
  { id: "first_scan", titleKey: "gamification.achievements.first_scan", descriptionKey: "gamification.achievements.first_scan_desc", icon: "📷", xpReward: 30, category: "explorer", requirement: 1 },
  { id: "breed_expert", titleKey: "gamification.achievements.breed_expert", descriptionKey: "gamification.achievements.breed_expert_desc", icon: "🔍", xpReward: 200, category: "explorer", requirement: 20 },
  { id: "emergency_prepared", titleKey: "gamification.achievements.emergency_prepared", descriptionKey: "gamification.achievements.emergency_prepared_desc", icon: "🚑", xpReward: 100, category: "explorer", requirement: 1 },
  { id: "reminder_master", titleKey: "gamification.achievements.reminder_master", descriptionKey: "gamification.achievements.reminder_master_desc", icon: "⏰", xpReward: 100, category: "explorer", requirement: 10 },
  { id: "budget_tracker", titleKey: "gamification.achievements.budget_tracker", descriptionKey: "gamification.achievements.budget_tracker_desc", icon: "💰", xpReward: 100, category: "explorer", requirement: 10 },
  
  // Dedication category
  { id: "early_adopter", titleKey: "gamification.achievements.early_adopter", descriptionKey: "gamification.achievements.early_adopter_desc", icon: "🚀", xpReward: 100, category: "dedication", requirement: 1, secret: true },
  { id: "loyal_user_30", titleKey: "gamification.achievements.loyal_user_30", descriptionKey: "gamification.achievements.loyal_user_30_desc", icon: "💎", xpReward: 200, category: "dedication", requirement: 30 },
  { id: "loyal_user_100", titleKey: "gamification.achievements.loyal_user_100", descriptionKey: "gamification.achievements.loyal_user_100_desc", icon: "👑", xpReward: 500, category: "dedication", requirement: 100 },
];

export const LEVELS = [
  { level: 1, title: "Chaton Curieux", requiredXp: 0 },
  { level: 2, title: "Ami des Félins", requiredXp: 100 },
  { level: 3, title: "Gardien de Chat", requiredXp: 250 },
  { level: 4, title: "Expert Félin", requiredXp: 500 },
  { level: 5, title: "Maître Chat", requiredXp: 850 },
  { level: 6, title: "Légende des Chats", requiredXp: 1300 },
  { level: 7, title: "Chuchoteur de Chats", requiredXp: 1900 },
  { level: 8, title: "Sage Félin", requiredXp: 2600 },
  { level: 9, title: "Protecteur des Chats", requiredXp: 3500 },
  { level: 10, title: "Divinité Féline", requiredXp: 5000 },
];

const STORAGE_KEY = "gamification_data";

const getDefaultStats = (): UserStats => ({
  totalXp: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: new Date().toISOString().split("T")[0],
  totalCats: 0,
  totalWeightLogs: 0,
  totalDailyLogs: 0,
  totalPosts: 0,
  totalComments: 0,
  totalScans: 0,
  joinedDate: new Date().toISOString(),
  unlockedAchievements: [],
  completedChallenges: [],
});

const generateDailyChallenges = (): Challenge[] => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  return [
    {
      id: `daily_login_${today.toISOString().split("T")[0]}`,
      titleKey: "gamification.challenges.daily_login",
      descriptionKey: "gamification.challenges.daily_login_desc",
      type: "daily",
      xpReward: 10,
      target: 1,
      progress: 0,
      completed: false,
      expiresAt: tomorrow.toISOString(),
      action: "login",
    },
    {
      id: `daily_log_${today.toISOString().split("T")[0]}`,
      titleKey: "gamification.challenges.daily_log",
      descriptionKey: "gamification.challenges.daily_log_desc",
      type: "daily",
      xpReward: 20,
      target: 1,
      progress: 0,
      completed: false,
      expiresAt: tomorrow.toISOString(),
      action: "log",
    },
    {
      id: `daily_weight_${today.toISOString().split("T")[0]}`,
      titleKey: "gamification.challenges.daily_weight",
      descriptionKey: "gamification.challenges.daily_weight_desc",
      type: "daily",
      xpReward: 15,
      target: 1,
      progress: 0,
      completed: false,
      expiresAt: tomorrow.toISOString(),
      action: "weight",
    },
  ];
};

const generateWeeklyChallenges = (): Challenge[] => {
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + (7 - nextWeek.getDay()));
  nextWeek.setHours(23, 59, 59, 999);

  const weekId = `${today.getFullYear()}_${Math.ceil((today.getTime() - new Date(today.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))}`;

  return [
    {
      id: `weekly_posts_${weekId}`,
      titleKey: "gamification.challenges.weekly_posts",
      descriptionKey: "gamification.challenges.weekly_posts_desc",
      type: "weekly",
      xpReward: 75,
      target: 3,
      progress: 0,
      completed: false,
      expiresAt: nextWeek.toISOString(),
      action: "post",
    },
    {
      id: `weekly_logs_${weekId}`,
      titleKey: "gamification.challenges.weekly_logs",
      descriptionKey: "gamification.challenges.weekly_logs_desc",
      type: "weekly",
      xpReward: 100,
      target: 5,
      progress: 0,
      completed: false,
      expiresAt: nextWeek.toISOString(),
      action: "log",
    },
    {
      id: `weekly_comments_${weekId}`,
      titleKey: "gamification.challenges.weekly_comments",
      descriptionKey: "gamification.challenges.weekly_comments_desc",
      type: "weekly",
      xpReward: 50,
      target: 5,
      progress: 0,
      completed: false,
      expiresAt: nextWeek.toISOString(),
      action: "comment",
    },
  ];
};

export const [GamificationContext, useGamification] = createContextHook(() => {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ["gamification_stats"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored) as UserStats;
        }
        const defaultStats = getDefaultStats();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStats));
        return defaultStats;
      } catch (e) {
        console.error("Failed to load gamification stats", e);
        return getDefaultStats();
      }
    },
    initialData: getDefaultStats(),
  });

  const challengesQuery = useQuery({
    queryKey: ["gamification_challenges"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem("gamification_challenges");
        if (stored) {
          const challenges = JSON.parse(stored) as Challenge[];
          const now = new Date();
          const validChallenges = challenges.filter(
            (c) => new Date(c.expiresAt) > now
          );
          if (validChallenges.length < 6) {
            const daily = generateDailyChallenges();
            const weekly = generateWeeklyChallenges();
            const newChallenges = [...daily, ...weekly];
            await AsyncStorage.setItem(
              "gamification_challenges",
              JSON.stringify(newChallenges)
            );
            return newChallenges;
          }
          return validChallenges;
        }
        const daily = generateDailyChallenges();
        const weekly = generateWeeklyChallenges();
        const newChallenges = [...daily, ...weekly];
        await AsyncStorage.setItem(
          "gamification_challenges",
          JSON.stringify(newChallenges)
        );
        return newChallenges;
      } catch (e) {
        console.error("Failed to load challenges", e);
        return [...generateDailyChallenges(), ...generateWeeklyChallenges()];
      }
    },
    initialData: [],
  });

  const saveStats = async (stats: UserStats) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    return stats;
  };

  const saveChallenges = async (challenges: Challenge[]) => {
    await AsyncStorage.setItem(
      "gamification_challenges",
      JSON.stringify(challenges)
    );
    return challenges;
  };

  const calculateLevel = (xp: number): number => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].requiredXp) {
        return LEVELS[i].level;
      }
    }
    return 1;
  };

  const addXpMutation = useMutation({
    mutationFn: async (xpAmount: number) => {
      const currentStats = statsQuery.data;
      const newXp = currentStats.totalXp + xpAmount;
      const newLevel = calculateLevel(newXp);
      const updatedStats = {
        ...currentStats,
        totalXp: newXp,
        level: newLevel,
      };
      await saveStats(updatedStats);
      return updatedStats;
    },
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(["gamification_stats"], updatedStats);
    },
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: async (achievementId: AchievementId) => {
      const currentStats = statsQuery.data;
      if (currentStats.unlockedAchievements.includes(achievementId)) {
        return currentStats;
      }
      const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
      if (!achievement) return currentStats;

      const newXp = currentStats.totalXp + achievement.xpReward;
      const newLevel = calculateLevel(newXp);
      const updatedStats = {
        ...currentStats,
        totalXp: newXp,
        level: newLevel,
        unlockedAchievements: [...currentStats.unlockedAchievements, achievementId],
      };
      await saveStats(updatedStats);
      return updatedStats;
    },
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(["gamification_stats"], updatedStats);
    },
  });

  const updateStatMutation = useMutation({
    mutationFn: async (update: Partial<UserStats>) => {
      const currentStats = statsQuery.data;
      const updatedStats = { ...currentStats, ...update };
      await saveStats(updatedStats);
      return updatedStats;
    },
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(["gamification_stats"], updatedStats);
    },
  });

  const updateChallengeMutation = useMutation({
    mutationFn: async ({
      action,
      amount = 1,
    }: {
      action: Challenge["action"];
      amount?: number;
    }) => {
      const currentChallenges = challengesQuery.data;
      const currentStats = statsQuery.data;
      let xpEarned = 0;

      const updatedChallenges = currentChallenges.map((challenge) => {
        if (challenge.action === action && !challenge.completed) {
          const newProgress = Math.min(
            challenge.progress + amount,
            challenge.target
          );
          const completed = newProgress >= challenge.target;
          if (completed && !challenge.completed) {
            xpEarned += challenge.xpReward;
          }
          return { ...challenge, progress: newProgress, completed };
        }
        return challenge;
      });

      await saveChallenges(updatedChallenges);

      if (xpEarned > 0) {
        const newXp = currentStats.totalXp + xpEarned;
        const newLevel = calculateLevel(newXp);
        const updatedStats = {
          ...currentStats,
          totalXp: newXp,
          level: newLevel,
        };
        await saveStats(updatedStats);
        queryClient.setQueryData(["gamification_stats"], updatedStats);
      }

      return updatedChallenges;
    },
    onSuccess: (updatedChallenges) => {
      queryClient.setQueryData(["gamification_challenges"], updatedChallenges);
    },
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      const currentStats = statsQuery.data;
      const today = new Date().toISOString().split("T")[0];
      const lastActive = currentStats.lastActiveDate;

      if (lastActive === today) {
        return currentStats;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      let newStreak = currentStats.currentStreak;
      if (lastActive === yesterdayStr) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }

      const longestStreak = Math.max(newStreak, currentStats.longestStreak);
      const updatedStats = {
        ...currentStats,
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
      };
      await saveStats(updatedStats);
      return updatedStats;
    },
    onSuccess: (updatedStats) => {
      queryClient.setQueryData(["gamification_stats"], updatedStats);
    },
  });

  const stats = useMemo(() => statsQuery.data, [statsQuery.data]);
  const challenges = useMemo(() => challengesQuery.data, [challengesQuery.data]);

  const currentLevelInfo = useMemo(() => {
    const level = LEVELS.find((l) => l.level === stats.level) || LEVELS[0];
    const nextLevel = LEVELS.find((l) => l.level === stats.level + 1);
    const xpForCurrentLevel = level.requiredXp;
    const xpForNextLevel = nextLevel?.requiredXp || level.requiredXp;
    const progressXp = stats.totalXp - xpForCurrentLevel;
    const requiredXp = xpForNextLevel - xpForCurrentLevel;
    const progress = requiredXp > 0 ? progressXp / requiredXp : 1;

    return {
      ...level,
      nextLevel,
      progressXp,
      requiredXp,
      progress: Math.min(Math.max(progress, 0), 1),
    };
  }, [stats]);

  const unlockAchievementAsync = unlockAchievementMutation.mutateAsync;
  const updateStatAsync = updateStatMutation.mutateAsync;
  const updateChallengeAsync = updateChallengeMutation.mutateAsync;
  const updateStreakAsync = updateStreakMutation.mutateAsync;

  const checkAndUnlockAchievements = useCallback(
    async (statType: keyof UserStats, value: number) => {
      const achievementMap: Partial<Record<keyof UserStats, AchievementId[]>> = {
        totalCats: ["first_cat", "cat_collector", "cat_master"],
        totalWeightLogs: ["first_weight"],
        totalDailyLogs: ["first_log"],
        totalPosts: ["first_post", "social_butterfly", "community_star"],
        totalScans: ["first_scan", "breed_expert"],
      };

      const possibleAchievements = achievementMap[statType] || [];
      for (const achievementId of possibleAchievements) {
        const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (
          achievement &&
          value >= achievement.requirement &&
          !stats.unlockedAchievements.includes(achievementId)
        ) {
          await unlockAchievementAsync(achievementId);
        }
      }
    },
    [stats.unlockedAchievements, unlockAchievementAsync]
  );

  const trackAction = useCallback(
    async (action: Challenge["action"], statKey?: keyof UserStats) => {
      await updateChallengeAsync({ action });
      await updateStreakAsync();

      if (statKey) {
        const currentValue = (stats[statKey] as number) || 0;
        const newValue = currentValue + 1;
        await updateStatAsync({ [statKey]: newValue });
        await checkAndUnlockAchievements(statKey, newValue);
      }
    },
    [
      updateChallengeAsync,
      updateStreakAsync,
      updateStatAsync,
      checkAndUnlockAchievements,
      stats,
    ]
  );

  return {
    stats,
    challenges,
    currentLevelInfo,
    achievements: ACHIEVEMENTS,
    levels: LEVELS,
    isLoading: statsQuery.isLoading,
    addXp: addXpMutation.mutateAsync,
    unlockAchievement: unlockAchievementMutation.mutateAsync,
    updateStat: updateStatMutation.mutateAsync,
    updateStreak: updateStreakMutation.mutateAsync,
    trackAction,
  };
});

export function useAchievementProgress(achievementId: AchievementId) {
  const { stats, achievements } = useGamification();
  const achievement = achievements.find((a) => a.id === achievementId);
  const isUnlocked = stats.unlockedAchievements.includes(achievementId);

  return { achievement, isUnlocked };
}
