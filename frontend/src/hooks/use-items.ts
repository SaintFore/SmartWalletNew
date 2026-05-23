import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { components } from "@/api/types";

type ItemRead = components["schemas"]["ItemRead"];
type ItemCreate = components["schemas"]["ItemCreate"];

const ITEMS_KEY = ["items"];

export function useItems() {
  return useQuery<ItemRead[]>({
    queryKey: ITEMS_KEY,
    queryFn: async () => {
      const { data, error } = await api.GET("/api/items");
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ItemCreate) => {
      const { data, error } = await api.POST("/api/items", { body });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => {
      const { error } = await api.DELETE("/api/items/{item_id}", {
        params: { path: { item_id: itemId } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
