import { Stack } from "expo-router";
import { Colors } from "@/constants/colors";

export default function CommunityLayout() {
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
          title: "Communauté",
        }}
      />
      <Stack.Screen
        name="new-post"
        options={{
          title: "Nouvelle publication",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="post/[postId]"
        options={{
          title: "Publication",
        }}
      />
      <Stack.Screen
        name="events"
        options={{
          title: "Événements",
        }}
      />
      <Stack.Screen
        name="new-event"
        options={{
          title: "Nouvel événement",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="event/[eventId]"
        options={{
          title: "Événement",
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          title: "Messages",
        }}
      />
      <Stack.Screen
        name="chat/[conversationId]"
        options={{
          title: "Conversation",
        }}
      />
      <Stack.Screen
        name="profile/[userId]"
        options={{
          title: "Profil",
        }}
      />
    </Stack>
  );
}
