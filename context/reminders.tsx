import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type ReminderType = 
  | "vaccine" 
  | "medication" 
  | "vet_appointment" 
  | "grooming" 
  | "deworming" 
  | "flea_treatment"
  | "food"
  | "litter"
  | "other";

export type ReminderFrequency = 
  | "once" 
  | "daily" 
  | "weekly" 
  | "monthly" 
  | "yearly";

export type Reminder = {
  id: string;
  catId?: string;
  catName?: string;
  type: ReminderType;
  title: string;
  description?: string;
  dueDate: string;
  frequency: ReminderFrequency;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
};

const STORAGE_KEY = "reminders_data";

export const [RemindersContext, useReminders] = createContextHook(() => {
  const queryClient = useQueryClient();

  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as Reminder[]) : [];
      } catch (e) {
        console.error("Failed to load reminders", e);
        return [];
      }
    },
    initialData: [],
  });

  const saveReminders = async (reminders: Reminder[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
    return reminders;
  };

  const addReminderMutation = useMutation({
    mutationFn: async (newReminder: Reminder) => {
      const currentReminders = remindersQuery.data ?? [];
      const updatedReminders = [...currentReminders, newReminder];
      await saveReminders(updatedReminders);
      return updatedReminders;
    },
    onSuccess: (updatedReminders) => {
      queryClient.setQueryData(["reminders"], updatedReminders);
    },
  });

  const updateReminderMutation = useMutation({
    mutationFn: async (updatedReminder: Reminder) => {
      const currentReminders = remindersQuery.data ?? [];
      const updatedReminders = currentReminders.map((r) =>
        r.id === updatedReminder.id ? updatedReminder : r,
      );
      await saveReminders(updatedReminders);
      return updatedReminders;
    },
    onSuccess: (updatedReminders) => {
      queryClient.setQueryData(["reminders"], updatedReminders);
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const currentReminders = remindersQuery.data ?? [];
      const updatedReminders = currentReminders.filter((r) => r.id !== reminderId);
      await saveReminders(updatedReminders);
      return updatedReminders;
    },
    onSuccess: (updatedReminders) => {
      queryClient.setQueryData(["reminders"], updatedReminders);
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async (reminderId: string) => {
      const currentReminders = remindersQuery.data ?? [];
      const updatedReminders = currentReminders.map((r) =>
        r.id === reminderId
          ? { ...r, completed: !r.completed, completedAt: !r.completed ? new Date().toISOString() : undefined }
          : r,
      );
      await saveReminders(updatedReminders);
      return updatedReminders;
    },
    onSuccess: (updatedReminders) => {
      queryClient.setQueryData(["reminders"], updatedReminders);
    },
  });

  const reminders = useMemo(() => remindersQuery.data ?? [], [remindersQuery.data]);

  const upcomingReminders = useMemo(() => {
    const now = new Date();
    return reminders
      .filter((r) => !r.completed && new Date(r.dueDate) >= now)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [reminders]);

  const overdueReminders = useMemo(() => {
    const now = new Date();
    return reminders
      .filter((r) => !r.completed && new Date(r.dueDate) < now)
      .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
  }, [reminders]);

  return {
    reminders,
    upcomingReminders,
    overdueReminders,
    isLoading: remindersQuery.isLoading,
    addReminder: addReminderMutation.mutateAsync,
    updateReminder: updateReminderMutation.mutateAsync,
    deleteReminder: deleteReminderMutation.mutateAsync,
    toggleComplete: toggleCompleteMutation.mutateAsync,
  };
});
