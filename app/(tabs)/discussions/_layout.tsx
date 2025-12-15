import { Stack } from "expo-router";
import React from "react";

export default function DiscussionsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Forum",
        }}
      />
      <Stack.Screen
        name="[discussionId]"
        options={{
          title: "Discussion",
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: "Nouvelle discussion",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
