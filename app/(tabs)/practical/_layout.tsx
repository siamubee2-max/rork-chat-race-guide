import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function PracticalLayout() {
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
          title: "Pratique",
        }}
      />
      <Stack.Screen
        name="reminders"
        options={{
          title: "Rappels",
        }}
      />
      <Stack.Screen
        name="reminder-form"
        options={{
          title: "Nouveau rappel",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="expenses"
        options={{
          title: "Dépenses",
        }}
      />
      <Stack.Screen
        name="expense-form"
        options={{
          title: "Nouvelle dépense",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="shopping"
        options={{
          title: "Liste de courses",
        }}
      />
      <Stack.Screen
        name="food-calculator"
        options={{
          title: "Calculateur nourriture",
        }}
      />
      <Stack.Screen
        name="travel"
        options={{
          title: "Voyage avec chat",
        }}
      />
      <Stack.Screen
        name="first-aid"
        options={{
          title: "Premiers secours",
        }}
      />
    </Stack>
  );
}
