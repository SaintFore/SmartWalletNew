import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionKeys, type TransactionCreate } from "@/entities/transaction";
import { api } from "@/shared/api/client";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: TransactionCreate) => {
      const { data, error } = await api.POST("/api/transactions", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
