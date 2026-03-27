import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function DiscussionsLayout() {
  const { t } = useTranslation();

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
          title: t("discussions.forum"),
        }}
      />
      <Stack.Screen
        name="[discussionId]"
        options={{
          title: t("discussions.discussion"),
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: t("discussions.newDiscussion"),
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
