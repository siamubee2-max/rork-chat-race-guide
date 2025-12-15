import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function GamificationLayout() {
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
          title: "Mon Profil",
        }}
      />
      <Stack.Screen
        name="achievements"
        options={{
          title: "Succès",
        }}
      />
      <Stack.Screen
        name="challenges"
        options={{
          title: "Défis",
        }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{
          title: "Classement",
        }}
      />
    </Stack>
  );
}
