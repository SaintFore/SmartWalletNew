import { useMutation, useQueryClient } from "@tanstack/react-query";
import { accountKeys } from "@/entities/account";
import { budgetKeys } from "@/entities/budget";
import {
  transactionKeys,
  type QuickTransactionCreate,
  type TransactionCreate,
} from "@/entities/transaction";
import { api } from "@/shared/api/client";

function invalidateRelatedQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: transactionKeys.all });
  queryClient.invalidateQueries({ queryKey: accountKeys.all });
  queryClient.invalidateQueries({ queryKey: budgetKeys.all });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: TransactionCreate) => {
      const { data, error } = await api.POST("/api/transactions", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateRelatedQueries(queryClient),
  });
}

export function useCreateQuickTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: QuickTransactionCreate) => {
      const { data, error } = await api.POST("/api/transactions/quick", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => invalidateRelatedQueries(queryClient),
  });
}
