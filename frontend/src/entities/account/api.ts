import { useQuery } from "@tanstack/react-query";

import { api } from "@/shared/api/client";
import type { AccountRead } from "./types";

export const accountKeys = {
  all: ["accounts"] as const,
};

export function useAccounts() {
  return useQuery<AccountRead[]>({
    queryKey: accountKeys.all,
    queryFn: async () => {
      const { data, error } = await api.GET("/api/accounts");
      if (error) throw error;
      return data;
    },
  });
}
