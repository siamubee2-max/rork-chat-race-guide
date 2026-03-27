import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors } from "@/constants/colors";

export default function CommunityLayout() {
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
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: t("community.title"),
        }}
      />
      <Stack.Screen
        name="new-post"
        options={{
          title: t("community.newPost"),
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="post/[postId]"
        options={{
          title: t("community.post"),
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: t("community.events"),
        }}
      />
      <Stack.Screen
        name="new-event"
        options={{
          title: t("community.newEvent"),
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="event/[eventId]"
        options={{
          title: t("community.event"),
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          title: t("community.messages"),
        }}
      />
      <Stack.Screen
        name="chat/[conversationId]"
        options={{
          title: t("community.conversation"),
        }}
      />
      <Stack.Screen
        name="profile/[userId]"
        options={{
          title: t("community.profile"),
        }}
      />
    </Stack>
  );
}
