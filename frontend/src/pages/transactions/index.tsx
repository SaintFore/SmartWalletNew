import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Download, X } from "lucide-react";
import {
  useMonthlySummary,
  useTransactions,
  type TransactionCreateValues,
  type TransactionUpdateValues,
  type QuickTransactionCreateValues,
  type TransactionFilters,
} from "@/entities/transaction";
import {
  TransactionForm,
  useCreateQuickTransaction,
  useCreateTransaction,
} from "@/features/create-transaction";
import { useDeleteTransaction } from "@/features/delete-transaction";
import { useUpdateTransaction } from "@/features/update-transaction";
import { useAccounts } from "@/entities/account";
import { useCategories } from "@/entities/category";
import { AppLayout } from "@/widgets/app-layout";
import { SummaryCards } from "@/widgets/summary-cards";
import { TransactionList } from "@/widgets/transaction-list";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";
import { Input } from "@/shared/ui/input";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };


export default function TransactionsPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(0);
  const limit = 20;

  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useTransactions({ ...filters, limit, offset: page * limit });
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const createMutation = useCreateTransaction();
  const quickCreateMutation = useCreateQuickTransaction();
  const deleteMutation = useDeleteTransaction();
  const updateMutation = useUpdateTransaction();

  const now = new Date();
  const { data: summary } = useMonthlySummary(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  const transactions = paginatedData?.items || [];
  const total = paginatedData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  function handleSubmit(data: TransactionCreateValues) {
    createMutation.mutate(data);
  }
  function handleQuickSubmit(data: QuickTransactionCreateValues) {
    quickCreateMutation.mutate(data);
  }


  function handleUpdate(id: number, data: TransactionUpdateValues) {
    updateMutation.mutate({ id, body: data });
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  const handleExportCSV = useCallback(() => {
    if (!transactions.length) return;

    const headers = ["日期", "名称", "金额", "类型", "分类", "账户", "备注"];
    const rows = transactions.map((t) => {
      const category = categories?.find((c) => c.id === t.category_id);
      const account = accounts?.find((a) => a.id === t.account_id);
      return [
        t.date.slice(0, 10),
        t.name || "",
        t.amount,
        t.type === "income" ? "收入" : "支出",
        category?.name || "",
        account?.name || "",
        t.description || "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

    const csv = "﻿" + [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transactions, categories, accounts]);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ease}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Transactions</h1>
                <p className="text-sm text-muted-foreground">
                  Track your income and expenses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-fit">
                {total} transactions
              </Badge>
              <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={transactions.length === 0}>
                <Download className="size-3" data-icon="inline-start" />
                导出CSV
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...ease }}
            className="mb-6"
          >
            <SummaryCards
              totalIncome={summary.total_income}
              totalExpense={summary.total_expense}
              net={summary.net}
            />
          </motion.div>
        )}


        {/* Transaction Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...ease }}
          className="mb-8"
        >
          <TransactionForm
            categories={categories || []}
            accounts={accounts || []}
            onSubmit={handleSubmit}
            onQuickSubmit={handleQuickSubmit}
            isPending={createMutation.isPending}
            isQuickPending={quickCreateMutation.isPending}
            isError={createMutation.isError}
          />
        </motion.div>

        <Separator className="mb-6" />

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
          className="mb-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={!filters.type ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilters({ ...filters, type: undefined }); setPage(0); }}
              >
                全部
              </Button>
              <Button
                variant={filters.type === "expense" ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilters({ ...filters, type: "expense" }); setPage(0); }}
              >
                <ArrowDownRight className="size-3" data-icon="inline-start" />
                支出
              </Button>
              <Button
                variant={filters.type === "income" ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilters({ ...filters, type: "income" }); setPage(0); }}
              >
                <ArrowUpRight className="size-3" data-icon="inline-start" />
                收入
              </Button>
            </div>

            <select
              value={filters.account_id || ""}
              onChange={(e) => {
                setFilters({ ...filters, account_id: e.target.value ? Number(e.target.value) : undefined });
                setPage(0);
              }}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">所有账户</option>
              {accounts?.map((a) => (
                <option key={a.id} value={a.id}>{a.icon ? `${a.icon} ` : ""}{a.name}</option>
              ))}
            </select>

            <select
              value={filters.category_id || ""}
              onChange={(e) => {
                setFilters({ ...filters, category_id: e.target.value ? Number(e.target.value) : undefined });
                setPage(0);
              }}
              className="h-8 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">所有分类</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <Input
                type="date"
                value={filters.date_from || ""}
                onChange={(e) => { setFilters({ ...filters, date_from: e.target.value || undefined }); setPage(0); }}
                className="h-8 w-36"
                placeholder="开始日期"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={filters.date_to || ""}
                onChange={(e) => { setFilters({ ...filters, date_to: e.target.value || undefined }); setPage(0); }}
                className="h-8 w-36"
                placeholder="结束日期"
              />
            </div>

            {(filters.type || filters.account_id || filters.category_id || filters.date_from || filters.date_to) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setFilters({}); setPage(0); }}
              >
                <X className="size-3" data-icon="inline-start" />
                清除筛选
              </Button>
            )}
          </div>
        </motion.div>

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...ease }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">交易记录</h2>
          </div>

          <TransactionList
            transactions={transactions}
            categories={categories || []}
            accounts={accounts || []}
            isLoading={isLoading}
            isError={isError}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                第 {page + 1} / {totalPages} 页，共 {total} 条
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  上一页
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
