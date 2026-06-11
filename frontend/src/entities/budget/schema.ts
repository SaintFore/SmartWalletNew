import { z } from "zod";

export const budgetCreateSchema = z.object({
  category_id: z.number().min(1, "Category is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
});

export const budgetUpdateSchema = z.object({
  category_id: z.number().min(1).optional(),
  amount: z.number().min(0.01).optional(),
});

export type BudgetCreateValues = z.infer<typeof budgetCreateSchema>;
export type BudgetUpdateValues = z.infer<typeof budgetUpdateSchema>;
