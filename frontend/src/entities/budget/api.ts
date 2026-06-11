import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type { BudgetRead, BudgetStatus } from "./types";

export const budgetKeys = {
  all: ["budgets"] as const,
  list: () => [...budgetKeys.all, "list"] as const,
  status: (year: number, month: number) =>
    [...budgetKeys.all, "status", year, month] as const,
};

export function useBudgets() {
  return useQuery<BudgetRead[]>({
    queryKey: budgetKeys.list(),
    queryFn: async () => {
      const { data, error } = await api.GET("/api/budgets");
      if (error) throw error;
      return data;
    },
  });
}

export function useBudgetStatus(year: number, month: number) {
  return useQuery<BudgetStatus[]>({
    queryKey: budgetKeys.status(year, month),
    queryFn: async () => {
      const { data, error } = await api.GET(
        "/api/budgets/status/{year}/{month}",
        {
          params: { path: { year, month } },
        },
      );
      if (error) throw error;
      return data;
    },
  });
}
