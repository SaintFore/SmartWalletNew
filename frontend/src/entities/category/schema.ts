import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  icon: z.string().nullable().optional(),
});

export type CategoryCreateValues = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateValues = z.infer<typeof categoryUpdateSchema>;
