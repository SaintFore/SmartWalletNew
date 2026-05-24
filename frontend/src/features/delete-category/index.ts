import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryKeys } from "@/entities/category";
import { api } from "@/shared/api/client";

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
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
