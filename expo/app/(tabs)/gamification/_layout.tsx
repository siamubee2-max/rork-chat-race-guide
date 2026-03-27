import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";

export default function GamificationLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "600" as const,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("gamification.profile"),
        }}
      />
      <Stack.Screen
        name="achievements"
        options={{
          title: t("gamification.achievementsTitle"),
        }}
      />
      <Stack.Screen
        name="challenges"
        options={{
          title: t("gamification.challengesTitle"),
        }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{
          title: t("gamification.leaderboard"),
        }}
      />
    </Stack>
  );
}
