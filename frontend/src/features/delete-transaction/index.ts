import { useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionKeys } from "@/entities/transaction";
import { api } from "@/shared/api/client";

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
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
