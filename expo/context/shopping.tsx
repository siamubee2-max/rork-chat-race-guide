import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type ShoppingCategory = 
  | "food" 
  | "litter" 
  | "toys" 
  | "accessories" 
  | "grooming" 
  | "medication"
  | "other";

export type ShoppingItem = {
  id: string;
  category: ShoppingCategory;
  name: string;
  quantity?: number;
  notes?: string;
  checked: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
};

const STORAGE_KEY = "shopping_data";

export const [ShoppingContext, useShopping] = createContextHook(() => {
  const queryClient = useQueryClient();

  const shoppingQuery = useQuery({
    queryKey: ["shopping"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as ShoppingItem[]) : [];
      } catch (e) {
        console.error("Failed to load shopping list", e);
        return [];
      }
    },
    initialData: [],
  });

  const saveItems = async (items: ShoppingItem[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return items;
  };

  const addItemMutation = useMutation({
    mutationFn: async (newItem: ShoppingItem) => {
      const currentItems = shoppingQuery.data ?? [];
      const updatedItems = [...currentItems, newItem];
      await saveItems(updatedItems);
      return updatedItems;
    },
    onSuccess: (updatedItems) => {
      queryClient.setQueryData(["shopping"], updatedItems);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: ShoppingItem) => {
      const currentItems = shoppingQuery.data ?? [];
      const updatedItems = currentItems.map((i) =>
        i.id === updatedItem.id ? updatedItem : i,
      );
      await saveItems(updatedItems);
      return updatedItems;
    },
    onSuccess: (updatedItems) => {
      queryClient.setQueryData(["shopping"], updatedItems);
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const currentItems = shoppingQuery.data ?? [];
      const updatedItems = currentItems.filter((i) => i.id !== itemId);
      await saveItems(updatedItems);
      return updatedItems;
    },
    onSuccess: (updatedItems) => {
      queryClient.setQueryData(["shopping"], updatedItems);
    },
  });

  const toggleCheckMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const currentItems = shoppingQuery.data ?? [];
      const updatedItems = currentItems.map((i) =>
        i.id === itemId ? { ...i, checked: !i.checked } : i,
      );
      await saveItems(updatedItems);
      return updatedItems;
    },
    onSuccess: (updatedItems) => {
      queryClient.setQueryData(["shopping"], updatedItems);
    },
  });

  const clearCheckedMutation = useMutation({
    mutationFn: async () => {
      const currentItems = shoppingQuery.data ?? [];
      const updatedItems = currentItems.filter((i) => !i.checked);
      await saveItems(updatedItems);
      return updatedItems;
    },
    onSuccess: (updatedItems) => {
      queryClient.setQueryData(["shopping"], updatedItems);
    },
  });

  const items = useMemo(() => shoppingQuery.data ?? [], [shoppingQuery.data]);

  const uncheckedItems = useMemo(() => 
    items.filter((i) => !i.checked).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }), 
    [items]
  );

  const checkedItems = useMemo(() => items.filter((i) => i.checked), [items]);

  return {
    items,
    uncheckedItems,
    checkedItems,
    isLoading: shoppingQuery.isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
    toggleCheck: toggleCheckMutation.mutateAsync,
    clearChecked: clearCheckedMutation.mutateAsync,
  };
});
