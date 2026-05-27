import type { components } from "@/shared/api/types";

export type TransactionRead = components["schemas"]["TransactionRead"];
export type TransactionCreate = components["schemas"]["TransactionCreate"];
export type TransactionUpdate = components["schemas"]["TransactionUpdate"];
export type TransactionSummary = components["schemas"]["TransactionSummary"];
export type DailySummary = components["schemas"]["DailySummary"];
export type AccountSummary = components["schemas"]["AccountSummary"];
export type QuickTransactionCreate = components["schemas"]["QuickTransactionCreate"];
export type PaginatedTransactions = components["schemas"]["PaginatedTransactions"];

export interface TransactionFilters {
  type?: string;
  account_id?: number;
  category_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
  offset?: number;
}
