import { z } from "zod";

export const transactionCreateSchema = z.object({
  name: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["expense", "income"]),
  category_id: z.number().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export const transactionUpdateSchema = z.object({
  name: z.string().optional(),
  amount: z.number().min(0.01).optional(),
  type: z.enum(["expense", "income"]).optional(),
  category_id: z.number().min(1).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
});

export type TransactionCreateValues = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateValues = z.infer<typeof transactionUpdateSchema>;
