import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountKeys, type AccountCreateValues } from "@/entities/account";
import { api } from "@/shared/api/client";

export { AccountForm } from "./ui/AccountForm";

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: AccountCreateValues) => {
      const { data, error } = await api.POST("/api/accounts", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountKeys.all });
    },
  });
}
