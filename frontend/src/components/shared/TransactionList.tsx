import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Trash2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface Transaction {
  id: number;
  name?: string | null;
  amount: number;
  type: string;
  category_id: number;
  date: string;
}

interface Category {
  id: number;
  name: string;
  icon?: string | null;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
  });
}

function TransactionListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card"
        >
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TransactionList({
  transactions,
  categories,
  isLoading,
  isError,
  onDelete,
  isDeleting,
}: TransactionListProps) {
  if (isLoading) {
    return <TransactionListSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center">
          <p className="text-destructive font-medium">
            Failed to load transactions
          </p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Calendar className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No transactions yet</h3>
          <p className="text-sm text-muted-foreground">
            Start tracking by adding your first transaction.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, i) => {
          const category = categories.find(
            (c) => c.id === transaction.category_id,
          );
          return (
            <motion.div
              key={transaction.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, ...ease }}
            >
              <Card className="group hover:border-border hover:shadow-sm transition-all">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-lg flex items-center justify-center ${
                          transaction.type === "income"
                            ? "bg-emerald-500/10"
                            : "bg-red-500/10"
                        }`}
                      >
                        {category?.icon ? (
                          <span className="text-xl">{category.icon}</span>
                        ) : transaction.type === "income" ? (
                          <ArrowUpRight className="size-5 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="size-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.name || category?.name || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        disabled={isDeleting}
                        onClick={() => onDelete(transaction.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                      >
                        <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
