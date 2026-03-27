import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

export type ExpenseCategory = 
  | "food" 
  | "vet" 
  | "medication" 
  | "accessories" 
  | "grooming" 
  | "boarding" 
  | "insurance"
  | "litter"
  | "toys"
  | "other";

export type Expense = {
  id: string;
  catId?: string;
  catName?: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
  receipt?: string;
  createdAt: string;
};

const STORAGE_KEY = "expenses_data";

export const [ExpensesContext, useExpenses] = createContextHook(() => {
  const queryClient = useQueryClient();

  const expensesQuery = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? (JSON.parse(stored) as Expense[]) : [];
      } catch (e) {
        console.error("Failed to load expenses", e);
        return [];
      }
    },
    initialData: [],
  });

  const saveExpenses = async (expenses: Expense[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return expenses;
  };

  const addExpenseMutation = useMutation({
    mutationFn: async (newExpense: Expense) => {
      const currentExpenses = expensesQuery.data ?? [];
      const updatedExpenses = [...currentExpenses, newExpense];
      await saveExpenses(updatedExpenses);
      return updatedExpenses;
    },
    onSuccess: (updatedExpenses) => {
      queryClient.setQueryData(["expenses"], updatedExpenses);
    },
  });

  const updateExpenseMutation = useMutation({
    mutationFn: async (updatedExpense: Expense) => {
      const currentExpenses = expensesQuery.data ?? [];
      const updatedExpenses = currentExpenses.map((e) =>
        e.id === updatedExpense.id ? updatedExpense : e,
      );
      await saveExpenses(updatedExpenses);
      return updatedExpenses;
    },
    onSuccess: (updatedExpenses) => {
      queryClient.setQueryData(["expenses"], updatedExpenses);
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: string) => {
      const currentExpenses = expensesQuery.data ?? [];
      const updatedExpenses = currentExpenses.filter((e) => e.id !== expenseId);
      await saveExpenses(updatedExpenses);
      return updatedExpenses;
    },
    onSuccess: (updatedExpenses) => {
      queryClient.setQueryData(["expenses"], updatedExpenses);
    },
  });

  const expenses = useMemo(() => expensesQuery.data ?? [], [expensesQuery.data]);

  const totalByCategory = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      food: 0,
      vet: 0,
      medication: 0,
      accessories: 0,
      grooming: 0,
      boarding: 0,
      insurance: 0,
      litter: 0,
      toys: 0,
      other: 0,
    };
    expenses.forEach((e) => {
      totals[e.category] += e.amount;
    });
    return totals;
  }, [expenses]);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses
      .filter((e) => new Date(e.date) >= startOfMonth)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalThisYear = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    return expenses
      .filter((e) => new Date(e.date) >= startOfYear)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  return {
    expenses,
    totalByCategory,
    totalThisMonth,
    totalThisYear,
    isLoading: expensesQuery.isLoading,
    addExpense: addExpenseMutation.mutateAsync,
    updateExpense: updateExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
  };
});
