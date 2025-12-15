import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type EmergencyType = "lost" | "injured" | "found";

export type EmergencyAlert = {
  id: string;
  type: EmergencyType;
  catId?: string;
  catName: string;
  catBreed?: string;
  catImageUri?: string;
  location: string;
  description: string;
  contactPhone: string;
  contactEmail?: string;
  date: string;
  microchip?: string;
  resolved: boolean;
};

const STORAGE_KEY = "emergency_alerts";

export const [EmergencyContext, useEmergency] = createContextHook(() => {
  const queryClient = useQueryClient();

  const alertsQuery = useQuery({
    queryKey: ["emergency-alerts"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as EmergencyAlert[]) : [];
      } catch (e) {
        console.error("Failed to load emergency alerts", e);
        return [];
      }
    },
    initialData: [],
  });

  const saveAlerts = async (alerts: EmergencyAlert[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    return alerts;
  };

  const addAlertMutation = useMutation({
    mutationFn: async (newAlert: EmergencyAlert) => {
      const currentAlerts = alertsQuery.data ?? [];
      const updatedAlerts = [newAlert, ...currentAlerts];
      await saveAlerts(updatedAlerts);
      return updatedAlerts;
    },
    onSuccess: (updatedAlerts) => {
      queryClient.setQueryData(["emergency-alerts"], updatedAlerts);
    },
  });

  const updateAlertMutation = useMutation({
    mutationFn: async (updatedAlert: EmergencyAlert) => {
      const currentAlerts = alertsQuery.data ?? [];
      const updatedAlerts = currentAlerts.map((a) =>
        a.id === updatedAlert.id ? updatedAlert : a,
      );
      await saveAlerts(updatedAlerts);
      return updatedAlerts;
    },
    onSuccess: (updatedAlerts) => {
      queryClient.setQueryData(["emergency-alerts"], updatedAlerts);
    },
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const currentAlerts = alertsQuery.data ?? [];
      const updatedAlerts = currentAlerts.filter((a) => a.id !== alertId);
      await saveAlerts(updatedAlerts);
      return updatedAlerts;
    },
    onSuccess: (updatedAlerts) => {
      queryClient.setQueryData(["emergency-alerts"], updatedAlerts);
    },
  });

  const alerts = useMemo(() => alertsQuery.data ?? [], [alertsQuery.data]);

  return {
    alerts,
    isLoading: alertsQuery.isLoading,
    addAlert: addAlertMutation.mutateAsync,
    updateAlert: updateAlertMutation.mutateAsync,
    deleteAlert: deleteAlertMutation.mutateAsync,
  };
});
