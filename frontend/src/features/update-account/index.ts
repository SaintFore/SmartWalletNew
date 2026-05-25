import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountKeys, type AccountUpdateValues } from "@/entities/account";
import { api } from "@/shared/api/client";

interface UpdateAccountVariables {
  id: number;
  data: AccountUpdateValues;
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateAccountVariables) => {
      const { data: updatedAccount, error } = await api.PATCH(
        "/api/accounts/{account_id}",
        {
          params: { path: { account_id: id } },
          body: data,
        },
      );
      if (error) throw error;
      return updatedAccount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
