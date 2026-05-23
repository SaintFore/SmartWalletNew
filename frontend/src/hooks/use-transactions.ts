import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { components } from "@/api/types";

type TransactionRead = components["schemas"]["TransactionRead"];
type TransactionCreate = components["schemas"]["TransactionCreate"];
type TransactionUpdate = components["schemas"]["TransactionUpdate"];
type TransactionSummary = components["schemas"]["TransactionSummary"];

const TRANSACTIONS_KEY = ["transactions"];

export function useTransactions(type?: string) {
  return useQuery<TransactionRead[]>({
    queryKey: [...TRANSACTIONS_KEY, type],
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
    queryKey: [...TRANSACTIONS_KEY, id],
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
    queryKey: [...TRANSACTIONS_KEY, "summary", year, month],
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

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: TransactionCreate) => {
      const { data, error } = await api.POST("/api/transactions", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: number;
      body: TransactionUpdate;
    }) => {
      const { data, error } = await api.PATCH(
        "/api/transactions/{transaction_id}",
        {
          params: { path: { transaction_id: id } },
          body,
        },
      );
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: number) => {
      const { error } = await api.DELETE("/api/transactions/{transaction_id}", {
        params: { path: { transaction_id: transactionId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_KEY });
    },
  });
}
