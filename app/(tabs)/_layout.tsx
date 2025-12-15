import React from "react";
import { Tabs } from "expo-router";
import { Home, Heart, Users, Sparkles, Grid3x3 } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          paddingTop: 12,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="(scan)"
        options={{
          title: "Accueil",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cats"
        options={{
          title: "Mes Chats",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "Social",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "Plus",
          tabBarIcon: ({ color, size }) => <Grid3x3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="(breeds)"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="discussions"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="vets"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="practical"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="gamification"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
