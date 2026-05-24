import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type { TransactionRead, TransactionSummary } from "./types";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (type?: string) => [...transactionKeys.all, type] as const,
  detail: (id: number) => [...transactionKeys.all, id] as const,
  monthlySummary: (year: number, month: number) =>
    [...transactionKeys.all, "summary", year, month] as const,
};

export function useTransactions(type?: string) {
  return useQuery<TransactionRead[]>({
    queryKey: transactionKeys.list(type),
    queryFn: async () => {
      const { data, error } = await api.GET("/api/transactions", {
        params: { query: type ? { type } : undefined },
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useTransaction(id: number) {
  return useQuery<TransactionRead>({
    queryKey: transactionKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await api.GET(
        "/api/transactions/{transaction_id}",
        {
          params: { path: { transaction_id: id } },
        },
      );
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useMonthlySummary(year: number, month: number) {
  return useQuery<TransactionSummary>({
    queryKey: transactionKeys.monthlySummary(year, month),
    queryFn: async () => {
      const { data, error } = await api.GET(
        "/api/transactions/summary/monthly/{year}/{month}",
        {
          params: { path: { year, month } },
        },
      );
      if (error) throw error;
      return data;
    },
  });
}
