import createContextHook from "@nkzw/create-context-hook";
import * as Notifications from "expo-notifications";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const NOTIFICATIONS_ENABLED_KEY = "notifications_enabled";

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.log("[Notifications] setNotificationHandler error:", e);
}

export type ScheduledNotification = {
  id: string;
  reminderId: string;
  title: string;
  body: string;
  scheduledDate: string;
};

export const [NotificationsContext, useNotifications] = createContextHook(() => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const router = useRouter();

  useEffect(() => {
    void loadNotificationSettings();
    void checkPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("[Notifications] Notification received:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("[Notifications] Notification response:", response);
      const data = response.notification.request.content.data;
      if (data?.route && typeof data.route === 'string') {
        router.push(data.route as "/");
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  const loadNotificationSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      setNotificationsEnabled(enabled === "true");
    } catch (error) {
      console.error("[Notifications] Error loading settings:", error);
    }
  };

  const checkPermissions = async () => {
    if (Platform.OS === "web") {
      setPermissionStatus("web");
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
    console.log("[Notifications] Permission status:", status);
  };

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web") {
      console.log("[Notifications] Web platform - skipping permissions");
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") {
        console.log("[Notifications] Permission not granted");
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("reminders", {
          name: "Reminders",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B35",
        });

        await Notifications.setNotificationChannelAsync("community", {
          name: "Community",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
      });
      setExpoPushToken(token.data);
      console.log("[Notifications] Push token:", token.data);

      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
      setNotificationsEnabled(true);

      return true;
    } catch (error) {
      console.error("[Notifications] Error requesting permissions:", error);
      return false;
    }
  }, []);

  const disableNotifications = useCallback(async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
      setNotificationsEnabled(false);
      console.log("[Notifications] Notifications disabled");
    } catch (error) {
      console.error("[Notifications] Error disabling notifications:", error);
    }
  }, []);

  const scheduleReminderNotification = useCallback(
    async (
      reminderId: string,
      title: string,
      body: string,
      triggerDate: Date,
      route?: string
    ): Promise<string | null> => {
      if (Platform.OS === "web") {
        console.log("[Notifications] Web platform - skipping schedule");
        return null;
      }

      if (!notificationsEnabled) {
        console.log("[Notifications] Notifications not enabled");
        return null;
      }

      try {
        const now = new Date();
        if (triggerDate <= now) {
          console.log("[Notifications] Trigger date is in the past, skipping");
          return null;
        }

        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            data: { reminderId, route: route || "/practical/reminders" },
          },
          trigger: {
            date: triggerDate,
            channelId: "reminders",
          },
        });

        console.log("[Notifications] Scheduled notification:", identifier);
        return identifier;
      } catch (error) {
        console.error("[Notifications] Error scheduling notification:", error);
        return null;
      }
    },
    [notificationsEnabled]
  );

  const cancelNotification = useCallback(async (identifier: string) => {
    if (Platform.OS === "web") return;

    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
      console.log("[Notifications] Cancelled notification:", identifier);
    } catch (error) {
      console.error("[Notifications] Error cancelling notification:", error);
    }
  }, []);

  const cancelAllNotifications = useCallback(async () => {
    if (Platform.OS === "web") return;

    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("[Notifications] Cancelled all notifications");
    } catch (error) {
      console.error("[Notifications] Error cancelling all notifications:", error);
    }
  }, []);

  const getScheduledNotifications = useCallback(async () => {
    if (Platform.OS === "web") return [];

    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      console.log("[Notifications] Scheduled notifications:", scheduled.length);
      return scheduled;
    } catch (error) {
      console.error("[Notifications] Error getting scheduled notifications:", error);
      return [];
    }
  }, []);

  const sendInstantNotification = useCallback(
    async (title: string, body: string, data?: Record<string, unknown>) => {
      if (Platform.OS === "web") {
        console.log("[Notifications] Web platform - skipping instant notification");
        return null;
      }

      if (!notificationsEnabled) {
        console.log("[Notifications] Notifications not enabled");
        return null;
      }

      try {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            sound: true,
            data,
          },
          trigger: null,
        });

        console.log("[Notifications] Sent instant notification:", identifier);
        return identifier;
      } catch (error) {
        console.error("[Notifications] Error sending instant notification:", error);
        return null;
      }
    },
    [notificationsEnabled]
  );

  const setBadgeCount = useCallback(async (count: number) => {
    if (Platform.OS === "web") return;

    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error("[Notifications] Error setting badge count:", error);
    }
  }, []);

  return useMemo(() => ({
    expoPushToken,
    notificationsEnabled,
    permissionStatus,
    requestPermissions,
    disableNotifications,
    scheduleReminderNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    sendInstantNotification,
    setBadgeCount,
  }), [
    expoPushToken,
    notificationsEnabled,
    permissionStatus,
    requestPermissions,
    disableNotifications,
    scheduleReminderNotification,
    cancelNotification,
    cancelAllNotifications,
    getScheduledNotifications,
    sendInstantNotification,
    setBadgeCount,
  ]);
});
