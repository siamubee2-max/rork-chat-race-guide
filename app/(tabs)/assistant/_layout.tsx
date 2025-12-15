import { Stack } from "expo-router";
import React from "react";
import { Colors } from "@/constants/colors";

export default function AssistantLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Assistant IA",
        }}
      />
      <Stack.Screen
        name="insights"
        options={{
          title: "Analyses IA",
        }}
      />
      <Stack.Screen
        name="photo-analyzer"
        options={{
          title: "Analyseur Photo",
        }}
      />
      <Stack.Screen
        name="behavior"
        options={{
          title: "Comportement",
        }}
      />
    </Stack>
  );
}
