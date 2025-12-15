import { Stack } from "expo-router";
import React from "react";

export default function CatsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Retour",
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Mes Chats",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="form"
        options={{
          presentation: "modal",
          title: "Ajouter un chat",
        }}
      />
      <Stack.Screen
        name="[catId]"
        options={{
          title: "",
          headerBackTitle: "Mes Chats",
        }}
      />
      <Stack.Screen
        name="record-form"
        options={{
          presentation: "modal",
          title: "Enregistrement",
        }}
      />
    </Stack>
  );
}
