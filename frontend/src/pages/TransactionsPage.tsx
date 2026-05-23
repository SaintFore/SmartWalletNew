import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router";
import {
  transactionCreateSchema,
  type TransactionCreateValues,
} from "@/schemas/transaction";
import {
  useTransactions,
  useCreateTransaction,
  useDeleteTransaction,
  useMonthlySummary,
} from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function TransactionsPageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card"
        >
          <Skeleton className="size-12 rounded-lg" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
      ))}
    </div>
  );
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

  // 获取当前年月
  const now = new Date();
  const { data: summary } = useMonthlySummary(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransactionCreateValues>({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      type: "expense",
      date: now.toISOString().split("T")[0],
    },
  });

  const selectedType = watch("type");

  function onSubmit(data: TransactionCreateValues) {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, ...ease }}
        className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            <span className="font-semibold text-lg">SmartWallet</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="size-3.5" />
            Back to Home
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ease}
          className="mb-8"
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
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Income</p>
                    <p className="text-xl font-semibold text-emerald-500">
                      {formatCurrency(summary.total_income)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <TrendingDown className="size-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expense</p>
                    <p className="text-xl font-semibold text-red-500">
                      {formatCurrency(summary.total_expense)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="size-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net</p>
                    <p
                      className={`text-xl font-semibold ${
                        summary.net >= 0 ? "text-emerald-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(summary.net)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Create Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5" />
                Add Transaction
              </CardTitle>
              <CardDescription>Record a new income or expense</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Description</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Lunch, Salary"
                      {...register("name")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register("amount", { valueAsNumber: true })}
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="type">Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          selectedType === "expense" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() =>
                          register("type").onChange({
                            target: { value: "expense" },
                          })
                        }
                      >
                        <ArrowDownRight
                          className="size-4"
                          data-icon="inline-start"
                        />
                        Expense
                      </Button>
                      <Button
                        type="button"
                        variant={
                          selectedType === "income" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() =>
                          register("type").onChange({
                            target: { value: "income" },
                          })
                        }
                      >
                        <ArrowUpRight
                          className="size-4"
                          data-icon="inline-start"
                        />
                        Income
                      </Button>
                    </div>
                    <input type="hidden" {...register("type")} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="category_id">Category</Label>
                    <select
                      id="category_id"
                      {...register("category_id", { valueAsNumber: true })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select category</option>
                      {categories?.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && (
                      <p className="text-sm text-destructive">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" {...register("date")} />
                    {errors.date && (
                      <p className="text-sm text-destructive">
                        {errors.date.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="description">Notes (optional)</Label>
                    <Input
                      id="description"
                      placeholder="Additional notes"
                      {...register("description")}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <Loader2
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <Plus className="size-4" data-icon="inline-start" />
                    )}
                    Add Transaction
                  </Button>
                </div>
              </form>
              {createMutation.isError && (
                <p className="text-sm text-destructive mt-4">
                  Failed to create transaction. Please check your connection and
                  try again.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="mb-8" />

        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...ease }}
        >
          <div className="flex items-center justify-between mb-6">
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

          {/* Loading State */}
          {isLoading && <TransactionsPageSkeleton />}

          {/* Error State */}
          {isError && (
            <Card className="border-destructive/50">
              <CardContent className="p-6 text-center">
                <p className="text-destructive font-medium mb-1">
                  Failed to load transactions
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure the API is running at{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                    {import.meta.env.VITE_API_BASE_URL}
                  </code>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {transactions && transactions.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calendar className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">
                  No transactions yet
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Start tracking your finances by adding your first transaction.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Transactions List */}
          <AnimatePresence mode="popLayout">
            {transactions && transactions.length > 0 && (
              <div className="flex flex-col gap-3">
                {transactions.map((transaction, i) => {
                  const category = categories?.find(
                    (c) => c.id === transaction.category_id,
                  );
                  return (
                    <motion.div
                      key={transaction.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.05, ...ease }}
                    >
                      <Card className="group hover:border-border hover:shadow-sm transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`size-12 rounded-xl flex items-center justify-center ${
                                  transaction.type === "income"
                                    ? "bg-emerald-500/10"
                                    : "bg-red-500/10"
                                }`}
                              >
                                {category?.icon ? (
                                  <span className="text-2xl">
                                    {category.icon}
                                  </span>
                                ) : transaction.type === "income" ? (
                                  <ArrowUpRight className="size-6 text-emerald-500" />
                                ) : (
                                  <ArrowDownRight className="size-6 text-red-500" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">
                                  {transaction.name || "Untitled"}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{category?.name || "Unknown"}</span>
                                  <span>•</span>
                                  <span>{formatDate(transaction.date)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <p
                                className={`font-semibold ${
                                  transaction.type === "income"
                                    ? "text-emerald-500"
                                    : "text-red-500"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={deleteMutation.isPending}
                                onClick={() =>
                                  deleteMutation.mutate(transaction.id)
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                              >
                                <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
