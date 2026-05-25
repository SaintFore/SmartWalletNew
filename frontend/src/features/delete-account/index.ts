import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountKeys } from "@/entities/account";
import { api } from "@/shared/api/client";

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: number) => {
      const { error } = await api.DELETE("/api/accounts/{account_id}", {
        params: { path: { account_id: accountId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
