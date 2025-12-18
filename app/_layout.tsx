import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

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
import { UserLocationProvider } from "@/context/user-location";
import '@/i18n/config';

SplashScreen.preventAutoHideAsync();

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx:58',message:'RootLayout mounting',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    console.log("[RootLayout] mount");

    (async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx:64',message:'Before SplashScreen.hideAsync',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        await SplashScreen.hideAsync();
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx:67',message:'SplashScreen.hideAsync success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        console.log("[RootLayout] splash hidden");
      } catch (e) {
        // #region agent log
        const errorMsg = e instanceof Error ? e.message : String(e);
        fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx:71',message:'SplashScreen.hideAsync error',data:{error:errorMsg},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        console.log("[RootLayout] SplashScreen.hideAsync error", e);
      }
    })();
  }, []);

  // #region agent log
  {(()=>{fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx:72',message:'RootLayout rendering providers',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});return null;})()}
  // #endregion
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
                                    <UserLocationProvider>
                                      {/* #region agent log */}
                                      {(()=>{fetch('http://127.0.0.1:7242/ingest/bd03eb35-54e1-47b5-a23a-c26416383972',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx:88',message:'Rendering RootLayoutNav',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});return null;})()}
                                      {/* #endregion */}
                                      <RootLayoutNav />
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
