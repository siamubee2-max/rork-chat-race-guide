import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function ScanStackLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName="home"
      screenOptions={{
        headerBackTitle: t("common.back"),
        headerTitle: t("scan.scanner"),
      }}
    >
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen
        name="camera"
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          headerTitle: t("scan.result"),
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
