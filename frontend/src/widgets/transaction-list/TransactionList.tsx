import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  Check,
  Pencil,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
import type { TransactionUpdateValues } from "@/entities/transaction";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatCurrency } from "@/shared/lib/format";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface Transaction {
  id: number;
  name?: string | null;
  amount: number;
  type: string;
  category_id: number;
  account_id: number;
  date: string;
  description?: string | null;
}

interface Category {
  id: number;
  name: string;
  icon?: string | null;
}

interface Account {
  id: number;
  name: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  onUpdate: (id: number, data: TransactionUpdateValues) => void;
  isUpdating: boolean;
}

interface TransactionDraft {
  id: number;
  name: string;
  amount: string;
  type: "expense" | "income";
  category_id: string;
  account_id: string;
  date: string;
  description: string;
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
  accounts,
  isLoading,
  isError,
  onDelete,
  isDeleting,
  onUpdate,
  isUpdating,
}: TransactionListProps) {
  const [draft, setDraft] = useState<TransactionDraft | null>(null);

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

  function startEditing(transaction: Transaction) {
    setDraft({
      id: transaction.id,
      name: transaction.name ?? "",
      amount: String(transaction.amount),
      type: transaction.type as "expense" | "income",
      category_id: String(transaction.category_id),
      account_id: String(transaction.account_id),
      date: transaction.date.slice(0, 10),
      description: transaction.description ?? "",
    });
  }

  function saveDraft() {
    if (!draft) return;

    const amount = parseFloat(draft.amount);
    if (isNaN(amount) || amount <= 0) return;
    const category_id = parseInt(draft.category_id, 10);
    if (isNaN(category_id) || category_id < 1) return;
    const account_id = parseInt(draft.account_id, 10);
    if (isNaN(account_id) || account_id < 1) return;

    onUpdate(draft.id, {
      name: draft.name.trim() || undefined,
      amount,
      type: draft.type,
      category_id,
      account_id,
      date: draft.date,
      description: draft.description.trim() || undefined,
    });
    setDraft(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {transactions.map((transaction, i) => {
          const category = categories.find(
            (c) => c.id === transaction.category_id,
          );
          const isEditing = draft?.id === transaction.id;
          return (
            <motion.div
              key={transaction.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.03, ...ease }}
            >
              <Card className="group overflow-hidden border-border/70 bg-card/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-4">
                  {isEditing && draft ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          aria-label="Amount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={draft.amount}
                          onChange={(e) =>
                            setDraft({ ...draft, amount: e.target.value })
                          }
                          className="h-9"
                          placeholder="Amount"
                        />
                        <Input
                          aria-label="Name"
                          value={draft.name}
                          onChange={(e) =>
                            setDraft({ ...draft, name: e.target.value })
                          }
                          className="h-9"
                          placeholder="Name (optional)"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={draft.type}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              type: e.target.value as "expense" | "income",
                            })
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                        <select
                          value={draft.category_id}
                          onChange={(e) =>
                            setDraft({ ...draft, category_id: e.target.value })
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="" disabled>
                            Category
                          </option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.icon ? `${c.icon} ` : ""}
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={draft.account_id}
                          onChange={(e) =>
                            setDraft({ ...draft, account_id: e.target.value })
                          }
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                        >
                          <option value="" disabled>
                            Account
                          </option>
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                        <Input
                          aria-label="Date"
                          type="date"
                          value={draft.date}
                          onChange={(e) =>
                            setDraft({ ...draft, date: e.target.value })
                          }
                          className="h-9"
                        />
                      </div>
                      <Input
                        aria-label="Description"
                        value={draft.description}
                        onChange={(e) =>
                          setDraft({ ...draft, description: e.target.value })
                        }
                        className="h-9"
                        placeholder="Description (optional)"
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDraft(null)}
                          disabled={isUpdating}
                        >
                          <X className="size-4" data-icon="inline-start" />
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={saveDraft}
                          disabled={
                            isUpdating ||
                            !draft.amount ||
                            parseFloat(draft.amount) <= 0
                          }
                        >
                          <Check className="size-4" data-icon="inline-start" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-11 rounded-2xl flex items-center justify-center shadow-inner ${
                            transaction.type === "income"
                              ? "bg-emerald-500/15"
                              : "bg-red-500/15"
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
                          <p className="font-medium">
                            {transaction.name || category?.name || "Untitled"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(transaction.date)}
                            {transaction.description
                              ? ` · ${transaction.description}`
                              : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`font-semibold tracking-tight ${
                            transaction.type === "income"
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating || isDeleting}
                            onClick={() => startEditing(transaction)}
                            className="size-8"
                          >
                            <Pencil className="size-3 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting || isUpdating}
                            onClick={() => onDelete(transaction.id)}
                            className="size-8"
                          >
                            <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
