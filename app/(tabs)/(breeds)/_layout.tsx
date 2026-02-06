import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function BreedsStackLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      initialRouteName="home"
      screenOptions={{
        headerBackTitle: t("common.back"),
        headerTitle: t("breeds.title"),
      }}
    >
      <Stack.Screen
        name="home"
        options={{
          headerTitle: t("breeds.catBreeds"),
        }}
      />
      <Stack.Screen name="[breedId]" options={{ headerTitle: t("breeds.details") }} />
      <Stack.Screen name="breeders" options={{ headerTitle: t("breeds.breeders") }} />
      <Stack.Screen name="shelters" options={{ headerTitle: t("breeds.shelters") }} />
    </Stack>
  );
}
