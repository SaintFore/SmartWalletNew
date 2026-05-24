import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type { CategoryRead } from "./types";

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useCategories() {
  return useQuery<CategoryRead[]>({
    queryKey: categoryKeys.all,
    queryFn: async () => {
      const { data, error } = await api.GET("/api/categories");
      if (error) throw error;
      return data;
    },
  });
}
