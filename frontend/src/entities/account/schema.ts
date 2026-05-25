import { z } from "zod";

export const accountCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().optional(),
  is_default: z.boolean(),
});

export const accountUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  icon: z.string().nullable().optional(),
  is_default: z.boolean().optional(),
});

export type AccountCreateValues = z.infer<typeof accountCreateSchema>;
export type AccountUpdateValues = z.infer<typeof accountUpdateSchema>;
