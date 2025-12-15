import React from "react";
import { Stack } from "expo-router";

export default function ScanStackLayout() {
  return (
    <Stack
      initialRouteName="home"
      screenOptions={{
        headerBackTitle: "Retour",
        headerTitle: "Scanner",
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="result"
        options={{
          headerTitle: "Résultat",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
