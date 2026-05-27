import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type { PaginatedTransactions, TransactionRead, TransactionSummary, TransactionFilters } from "./types";

export const transactionKeys = {
  all: ["transactions"] as const,
  list: (filters?: TransactionFilters) => [...transactionKeys.all, filters] as const,
  detail: (id: number) => [...transactionKeys.all, id] as const,
  monthlySummary: (year: number, month: number) =>
    [...transactionKeys.all, "summary", year, month] as const,
};

export function useTransactions(filters?: TransactionFilters) {
  return useQuery<PaginatedTransactions>({
    queryKey: transactionKeys.list(filters),
    queryFn: async () => {
      const query: Record<string, string | number | undefined> = {};
      if (filters?.type) query.type = filters.type;
      if (filters?.account_id) query.account_id = filters.account_id;
      if (filters?.category_id) query.category_id = filters.category_id;
      if (filters?.date_from) query.date_from = filters.date_from;
      if (filters?.date_to) query.date_to = filters.date_to;
      if (filters?.search) query.search = filters.search;
      if (filters?.limit) query.limit = filters.limit;
      if (filters?.offset) query.offset = filters.offset;

      const { data, error } = await api.GET("/api/transactions", {
        params: { query: Object.keys(query).length > 0 ? query : undefined },
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
