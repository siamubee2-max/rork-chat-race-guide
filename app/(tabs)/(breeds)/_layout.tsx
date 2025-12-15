import React from "react";
import { Stack } from "expo-router";

export default function BreedsStackLayout() {
  return (
    <Stack
      initialRouteName="home"
      screenOptions={{
        headerBackTitle: "Retour",
        headerTitle: "Races",
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          headerTitle: "Races de chats",
        }}
      />
      <Stack.Screen name="[breedId]" options={{ headerTitle: "Détails" }} />
      <Stack.Screen name="breeders" options={{ headerTitle: "Élevages" }} />
    </Stack>
  );
}
