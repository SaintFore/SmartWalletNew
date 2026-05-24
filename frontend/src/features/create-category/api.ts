import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryKeys, type CategoryCreate } from "@/entities/category";
import { api } from "@/shared/api/client";

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: CategoryCreate) => {
      const { data, error } = await api.POST("/api/categories", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
