import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";

export default function PracticalLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: "700",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("practical.title"),
        }}
      />
      <Stack.Screen
        name="reminders"
        options={{
          title: t("practical.reminders"),
        }}
      />
      <Stack.Screen
        name="reminder-form"
        options={{
          title: t("practical.newReminder"),
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="expenses"
        options={{
          title: t("practical.expenses"),
        }}
      />
      <Stack.Screen
        name="expense-form"
        options={{
          title: t("practical.newExpense"),
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="shopping"
        options={{
          title: t("practical.shoppingList"),
        }}
      />
      <Stack.Screen
        name="food-calculator"
        options={{
          title: t("practical.foodCalculator"),
        }}
      />
      <Stack.Screen
        name="travel"
        options={{
          title: t("practical.travelWithCat"),
        }}
      />
      <Stack.Screen
        name="first-aid"
        options={{
          title: t("practical.firstAid"),
        }}
      />
    </Stack>
  );
}
