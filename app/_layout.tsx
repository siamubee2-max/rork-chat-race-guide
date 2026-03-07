import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";
import Purchases from "react-native-purchases";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CatsContext } from "@/context/cats";
import { DiscussionsProvider } from "@/context/discussions";
import { AuthProvider } from "@/context/auth";
import { EmergencyContext } from "@/context/emergency";
import { SocialProvider } from "@/context/social";
import { RemindersContext } from "@/context/reminders";
import { ExpensesContext } from "@/context/expenses";
import { ShoppingContext } from "@/context/shopping";
import { LanguageProvider } from "@/context/language";

import { GamificationContext } from "@/context/gamification";
import { AIContext } from "@/context/ai";
import { ScanImageProvider } from "@/context/scan-image";
import { UserLocationProvider } from "@/context/user-location";
import { NotificationsContext } from "@/context/notifications";
import '@/i18n/config';

void SplashScreen.preventAutoHideAsync();

function getRCApiKey() {
  if (__DEV__ || Platform.OS === "web") return process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
  return Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY,
  });
}

const rcKey = getRCApiKey();
if (rcKey) {
  Purchases.configure({ apiKey: rcKey });
  console.log("[RevenueCat] Configured");
} else {
  console.warn("[RevenueCat] No API key found");
}

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: t("common.back"),
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: "700",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          title: t("common.about"),
          presentation: "modal",
        }}
      />
      <Stack.Screen name="+not-found" options={{ title: t("common.notFound") }} />
      <Stack.Screen name="auth/login" options={{ headerShown: true }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: true }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: true }} />
      <Stack.Screen name="language-select" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    void (async () => {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.log("[RootLayout] SplashScreen.hideAsync error", e);
      }
    })();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.root}>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
                <CatsContext>
                  <DiscussionsProvider>
                    <EmergencyContext>
                      <RemindersContext>
                        <ExpensesContext>
                          <ShoppingContext>
                            <SocialProvider>
                              <GamificationContext>
                                <AIContext>
                                  <ScanImageProvider>
                                    <UserLocationProvider>
                                      <NotificationsContext>
                                        <RootLayoutNav />
                                      </NotificationsContext>
                                    </UserLocationProvider>
                                  </ScanImageProvider>
                                </AIContext>
                              </GamificationContext>
                            </SocialProvider>
                          </ShoppingContext>
                        </ExpensesContext>
                      </RemindersContext>
                    </EmergencyContext>
                  </DiscussionsProvider>
                </CatsContext>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
