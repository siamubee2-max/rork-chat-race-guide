import React from "react";
import { Tabs } from "expo-router";
import { Home, Heart, Users, Sparkles, Grid3x3 } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

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
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: isTablet ? 13 : 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="(scan)"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cats"
        options={{
          title: t("tabs.myCats"),
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t("tabs.social"),
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t("tabs.assistant"),
          tabBarIcon: ({ color, size }) => <Sparkles color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t("tabs.more"),
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
