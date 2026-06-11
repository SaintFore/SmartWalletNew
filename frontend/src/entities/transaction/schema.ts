import { z } from "zod";

export const transactionCreateSchema = z.object({
  name: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["expense", "income", "transfer"]),
  category_id: z.number().min(1, "Category is required"),
  account_id: z.number().min(1, "Account is required"),
  to_account_id: z.number().optional(),
  description: z.string().optional(),
  raw_input: z.string().optional(),
  tags: z.string().optional(),
  date: z.string().min(1, "Date is required"),
});

export const transactionUpdateSchema = z.object({
  name: z.string().optional(),
  amount: z.number().min(0.01).optional(),
  type: z.enum(["expense", "income", "transfer"]).optional(),
  category_id: z.number().min(1).optional(),
  account_id: z.number().min(1).optional(),
  to_account_id: z.number().optional(),
  description: z.string().optional(),
  raw_input: z.string().optional(),
  tags: z.string().optional(),
  date: z.string().optional(),
});

export type TransactionCreateValues = z.infer<typeof transactionCreateSchema>;
export type TransactionUpdateValues = z.infer<typeof transactionUpdateSchema>;
export const quickTransactionCreateSchema = z.object({
  text: z.string().trim().min(1, "Input is required"),
  date: z.string().optional(),
  description: z.string().optional(),
});

export type QuickTransactionCreateValues = z.infer<
  typeof quickTransactionCreateSchema
>;
