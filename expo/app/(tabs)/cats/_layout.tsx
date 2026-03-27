import { Stack } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";

export default function CatsLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: t("cats.back"),
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("cats.title"),
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="form"
        options={{
          presentation: "modal",
          title: t("cats.addCat"),
        }}
      />
      <Stack.Screen
        name="[catId]"
        options={{
          title: "",
          headerBackTitle: t("cats.title"),
        }}
      />
      <Stack.Screen
        name="record-form"
        options={{
          presentation: "modal",
          title: t("cats.record"),
        }}
      />
      <Stack.Screen
        name="health-dashboard"
        options={{
          title: "Santé",
          headerBackTitle: "Retour",
        }}
      />
      <Stack.Screen
        name="weight-form"
        options={{
          presentation: "modal",
          title: "Poids",
        }}
      />
      <Stack.Screen
        name="weight-chart"
        options={{
          title: "Évolution du poids",
          headerBackTitle: "Retour",
        }}
      />
      <Stack.Screen
        name="daily-log-form"
        options={{
          presentation: "modal",
          title: "Journal quotidien",
        }}
      />
      <Stack.Screen
        name="daily-logs"
        options={{
          title: "Journal quotidien",
          headerBackTitle: "Retour",
        }}
      />
    </Stack>
  );
}
