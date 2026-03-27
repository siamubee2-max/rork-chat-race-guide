import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function EmergencyLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#111",
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("emergency.title"),
        }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: t("emergency.createAlert"),
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
