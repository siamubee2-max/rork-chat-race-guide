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
  bathroom: "normal" | "diarrhea" | "constipation" | "blood" | "none";
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

export type DogPhoto = {
  id: string;
  uri: string;
  caption?: string;
  date: string;
};

export type DogProfile = {
  id: string;
  name: string;
  breedId: string | null;
  microchip: string;
  birthDate?: string;
  imageUri?: string;
  gallery?: DogPhoto[];
  weight?: string;
  notes?: string;
  medicalRecords?: MedicalRecord[];
  weightHistory?: WeightEntry[];
  dailyLogs?: DailyLog[];
  feedingSchedule?: FeedingSchedule[];
};

// Keep backward-compatible aliases
export type CatPhoto = DogPhoto;
export type CatProfile = DogProfile;

const STORAGE_KEY = "dogs_data";

export const [CatsContext, useCats] = createContextHook(() => {
  const queryClient = useQueryClient();

  const dogsQuery = useQuery({
    queryKey: ["dogs"],
    queryFn: async () => {
      try {
        // Try new key first, fall back to old key for migration
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored) as DogProfile[];
        const oldStored = await AsyncStorage.getItem("cats_data");
        return oldStored ? (JSON.parse(oldStored) as DogProfile[]) : [];
      } catch (e) {
        console.error("Failed to load dogs", e);
        return [];
      }
    },
    initialData: [],
  });

  const saveDogs = async (dogs: DogProfile[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dogs));
    return dogs;
  };

  const addCatMutation = useMutation({
    mutationFn: async (newDog: DogProfile) => {
      const currentDogs = dogsQuery.data ?? [];
      const updatedDogs = [...currentDogs, newDog];
      await saveDogs(updatedDogs);
      return updatedDogs;
    },
    onSuccess: (updatedDogs) => {
      queryClient.setQueryData(["dogs"], updatedDogs);
    },
  });

  const updateCatMutation = useMutation({
    mutationFn: async (updatedDog: DogProfile) => {
      const currentDogs = dogsQuery.data ?? [];
      const updatedDogs = currentDogs.map((d) =>
        d.id === updatedDog.id ? updatedDog : d,
      );
      await saveDogs(updatedDogs);
      return updatedDogs;
    },
    onSuccess: (updatedDogs) => {
      queryClient.setQueryData(["dogs"], updatedDogs);
    },
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (dogId: string) => {
      const currentDogs = dogsQuery.data ?? [];
      const updatedDogs = currentDogs.filter((d) => d.id !== dogId);
      await saveDogs(updatedDogs);
      return updatedDogs;
    },
    onSuccess: (updatedDogs) => {
      queryClient.setQueryData(["dogs"], updatedDogs);
    },
  });

  const dogs = useMemo(() => dogsQuery.data ?? [], [dogsQuery.data]);

  return {
    cats: dogs,
    dogs,
    isLoading: dogsQuery.isLoading,
    addCat: addCatMutation.mutateAsync,
    updateCat: updateCatMutation.mutateAsync,
    deleteCat: deleteCatMutation.mutateAsync,
    addDog: addCatMutation.mutateAsync,
    updateDog: updateCatMutation.mutateAsync,
    deleteDog: deleteCatMutation.mutateAsync,
  };
});

// Alias for backward compatibility
export const DogsContext = CatsContext;
export const useDogs = useCats;
