import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";

export default function AssistantLayout() {
  const { t } = useTranslation();

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
          title: t("assistant.aiAssistant"),
        }}
      />
      <Stack.Screen
        name="insights"
        options={{
          title: t("assistant.aiAnalysis"),
        }}
      />
      <Stack.Screen
        name="photo-analyzer"
        options={{
          title: t("assistant.photoAnalyzer"),
        }}
      />
      <Stack.Screen
        name="behavior"
        options={{
          title: t("assistant.behavior"),
        }}
      />
    </Stack>
  );
}
