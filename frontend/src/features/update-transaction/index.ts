import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  transactionKeys,
  type TransactionUpdate,
} from "@/entities/transaction";
import { api } from "@/shared/api/client";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: TransactionUpdate }) => {
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
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}
