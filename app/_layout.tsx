import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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
import { StripeProvider } from "@/context/stripe";
import { GamificationContext } from "@/context/gamification";
import { AIContext } from "@/context/ai";
import { ScanImageProvider } from "@/context/scan-image";
import '@/i18n/config';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Retour",
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
          title: "À propos",
          presentation: "modal",
        }}
      />
      <Stack.Screen name="+not-found" options={{ title: "Introuvable" }} />
      <Stack.Screen name="auth/login" options={{ headerShown: true }} />
      <Stack.Screen name="auth/signup" options={{ headerShown: true }} />
      <Stack.Screen name="auth/forgot-password" options={{ headerShown: true }} />
      <Stack.Screen name="language-select" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    console.log("[RootLayout] mount");

    (async () => {
      try {
        await SplashScreen.hideAsync();
        console.log("[RootLayout] splash hidden");
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
              <StripeProvider>
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
                                    <RootLayoutNav />
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
              </StripeProvider>
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
