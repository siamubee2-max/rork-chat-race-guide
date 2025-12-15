import { Stack } from "expo-router";

export default function EmergencyLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#111",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Urgences",
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: "Créer une alerte",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
