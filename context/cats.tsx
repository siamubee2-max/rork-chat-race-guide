import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type MedicalRecordType = "vaccine" | "operation" | "medication" | "care" | "parasite";

export type MedicalRecord = {
  id: string;
  type: MedicalRecordType;
  title: string;
  date: string;
  nextDueDate?: string;
  notes?: string;
  vetName?: string;
};

export type WeightEntry = {
  id: string;
  date: string;
  weight: number;
  unit: "kg" | "lb";
  notes?: string;
};

export type DailyLog = {
  id: string;
  date: string;
  appetite: "normal" | "increased" | "decreased" | "none";
  water: "normal" | "increased" | "decreased" | "none";
  energy: "normal" | "playful" | "lethargic" | "hyperactive";
  litter: "normal" | "diarrhea" | "constipation" | "blood" | "none";
  vomiting: boolean;
  coughing: boolean;
  sneezing: boolean;
  scratching: boolean;
  notes?: string;
};

export type FeedingSchedule = {
  id: string;
  time: string;
  foodType: string;
  amount: string;
  completed?: boolean;
};

export type CatPhoto = {
  id: string;
  uri: string;
  caption?: string;
  date: string;
};

export type CatProfile = {
  id: string;
  name: string;
  breedId: string | null;
  microchip: string;
  birthDate?: string;
  imageUri?: string;
  gallery?: CatPhoto[];
  weight?: string;
  notes?: string;
  medicalRecords?: MedicalRecord[];
  weightHistory?: WeightEntry[];
  dailyLogs?: DailyLog[];
  feedingSchedule?: FeedingSchedule[];
};

const STORAGE_KEY = "cats_data";

export const [CatsContext, useCats] = createContextHook(() => {
  const queryClient = useQueryClient();

  const catsQuery = useQuery({
    queryKey: ["cats"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as CatProfile[]) : [];
      } catch (e) {
        console.error("Failed to load cats", e);
        return [];
      }
    },
    initialData: [],
  });

  const saveCats = async (cats: CatProfile[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
    return cats;
  };

  const addCatMutation = useMutation({
    mutationFn: async (newCat: CatProfile) => {
      const currentCats = catsQuery.data ?? [];
      const updatedCats = [...currentCats, newCat];
      await saveCats(updatedCats);
      return updatedCats;
    },
    onSuccess: (updatedCats) => {
      queryClient.setQueryData(["cats"], updatedCats);
    },
  });

  const updateCatMutation = useMutation({
    mutationFn: async (updatedCat: CatProfile) => {
      const currentCats = catsQuery.data ?? [];
      const updatedCats = currentCats.map((c) =>
        c.id === updatedCat.id ? updatedCat : c,
      );
      await saveCats(updatedCats);
      return updatedCats;
    },
    onSuccess: (updatedCats) => {
      queryClient.setQueryData(["cats"], updatedCats);
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (catId: string) => {
      const currentCats = catsQuery.data ?? [];
      const updatedCats = currentCats.filter((c) => c.id !== catId);
      await saveCats(updatedCats);
      return updatedCats;
    },
    onSuccess: (updatedCats) => {
      queryClient.setQueryData(["cats"], updatedCats);
    },
  });

  const cats = useMemo(() => catsQuery.data ?? [], [catsQuery.data]);

  return {
    cats,
    isLoading: catsQuery.isLoading,
    addCat: addCatMutation.mutateAsync,
    updateCat: updateCatMutation.mutateAsync,
    deleteCat: deleteCatMutation.mutateAsync,
  };
});
