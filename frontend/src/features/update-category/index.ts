import { useMutation, useQueryClient } from "@tanstack/react-query";

import { categoryKeys, type CategoryUpdateValues } from "@/entities/category";
import { api } from "@/shared/api/client";

interface UpdateCategoryVariables {
  id: number;
  data: CategoryUpdateValues;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: UpdateCategoryVariables) => {
      const { data: updatedCategory, error } = await api.PATCH(
        "/api/categories/{category_id}",
        {
          params: { path: { category_id: id } },
          body: data,
        },
      );
      if (error) throw error;
      return updatedCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
  });
}
