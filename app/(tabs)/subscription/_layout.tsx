import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SubscriptionLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: t('common.back'),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t('subscription.title'),
        }}
      />
    </Stack>
  );
}
