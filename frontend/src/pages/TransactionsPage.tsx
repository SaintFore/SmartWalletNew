import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, DollarSign, Zap } from "lucide-react";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useMonthlySummary,
} from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { AppLayout } from "@/components/AppLayout";
import {
  SummaryCards,
  TransactionList,
  TransactionForm,
} from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { TransactionCreateValues } from "@/schemas/transaction";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

function quickAdd(name: string, categoryId: number, createMutation: any) {
  const now = new Date();
  createMutation.mutate({
    name,
    amount: 0,
    type: "expense",
    category_id: categoryId,
    date: now.toISOString().split("T")[0],
  });
}

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const {
    data: transactions,
    isLoading,
    isError,
  } = useTransactions(typeFilter);
  const { data: categories } = useCategories();
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();

  const now = new Date();
  const { data: summary } = useMonthlySummary(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  function handleSubmit(data: TransactionCreateValues) {
    createMutation.mutate(data);
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

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
            <Badge variant="secondary" className="w-fit">
              {transactions?.length || 0} transactions
            </Badge>
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

        {/* Quick Add Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ...ease }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap className="size-4 text-primary" />
            <span className="text-sm font-medium">Quick Add</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories?.slice(0, 6).map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                size="sm"
                onClick={() => quickAdd(cat.name, cat.id, createMutation)}
                disabled={createMutation.isPending}
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </div>
        </motion.div>

        <Separator className="mb-6" />

        {/* Transaction Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
          className="mb-8"
        >
          <TransactionForm
            categories={categories || []}
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            isError={createMutation.isError}
          />
        </motion.div>

        <Separator className="mb-6" />

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...ease }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Transactions</h2>
            <div className="flex gap-2">
              <Button
                variant={typeFilter === undefined ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(undefined)}
              >
                All
              </Button>
              <Button
                variant={typeFilter === "expense" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("expense")}
              >
                <ArrowDownRight className="size-3" data-icon="inline-start" />
                Expense
              </Button>
              <Button
                variant={typeFilter === "income" ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter("income")}
              >
                <ArrowUpRight className="size-3" data-icon="inline-start" />
                Income
              </Button>
            </div>
          </div>

          <TransactionList
            transactions={transactions || []}
            categories={categories || []}
            isLoading={isLoading}
            isError={isError}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </motion.div>
      </div>
    </AppLayout>
  );
}
