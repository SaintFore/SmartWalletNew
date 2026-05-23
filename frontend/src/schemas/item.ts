import { z } from "zod";

export const itemCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

export const itemUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

export type ItemCreateValues = z.infer<typeof itemCreateSchema>;
export type ItemUpdateValues = z.infer<typeof itemUpdateSchema>;
