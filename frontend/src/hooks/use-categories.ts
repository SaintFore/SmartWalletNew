import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { components } from "@/api/types";

type CategoryRead = components["schemas"]["CategoryRead"];
type CategoryCreate = components["schemas"]["CategoryCreate"];

const CATEGORIES_KEY = ["categories"];

export function useCategories() {
  return useQuery<CategoryRead[]>({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET("/api/categories");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CategoryCreate) => {
      const { data, error } = await api.POST("/api/categories", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: number) => {
      const { error } = await api.DELETE("/api/categories/{category_id}", {
        params: { path: { category_id: categoryId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_KEY });
    },
  });
}
