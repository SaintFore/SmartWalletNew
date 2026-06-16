import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Check,
  Pencil,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
import type { TransactionRead, TransactionUpdateValues } from "@/entities/transaction";
import type { CategoryRead } from "@/entities/category";
import type { AccountWithBalance } from "@/entities/account";
import { ease } from "@/shared/lib/animations";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { Badge } from "@/shared/ui/badge";
import { formatCurrency } from "@/shared/lib/format";

interface TransactionListProps {
  transactions: TransactionRead[];
  categories: CategoryRead[];
  accounts: AccountWithBalance[];
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
  type: "expense" | "income" | "transfer";
  category_id: string;
  account_id: string;
  to_account_id: string;
  date: string;
  description: string;
  tags: string;
}

function formatDateHeader(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "今天";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "昨天";
  }
  return date.toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function groupTransactionsByDate(transactions: TransactionRead[]): Map<string, TransactionRead[]> {
  const groups = new Map<string, TransactionRead[]>();
  for (const t of transactions) {
    const dateKey = t.date.slice(0, 10);
    const group = groups.get(dateKey) || [];
    group.push(t);
    groups.set(dateKey, group);
  }
  return groups;
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
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(transactions),
    [transactions],
  );
  const categoriesMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

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

  function startEditing(transaction: TransactionRead) {
    setDraft({
      id: transaction.id,
      name: transaction.name ?? "",
      amount: String(transaction.amount),
      type: transaction.type as "expense" | "income" | "transfer",
      category_id: String(transaction.category_id),
      account_id: String(transaction.account_id),
      to_account_id: transaction.to_account_id ? String(transaction.to_account_id) : "",
      date: transaction.date.slice(0, 10),
      description: transaction.description ?? "",
      tags: transaction.tags ?? "",
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
      to_account_id: draft.to_account_id ? parseInt(draft.to_account_id, 10) : undefined,
      date: draft.date,
      description: draft.description.trim() || undefined,
      tags: draft.tags.trim() || undefined,
    });
    setDraft(null);
  }

  function getTypeIcon(type: string) {
    if (type === "income") return <ArrowUpRight className="size-5 text-emerald-500" />;
    if (type === "transfer") return <ArrowLeftRight className="size-5 text-blue-500" />;
    return <ArrowDownRight className="size-5 text-red-500" />;
  }

  function getTypeColor(type: string) {
    if (type === "income") return "bg-emerald-500/15";
    if (type === "transfer") return "bg-blue-500/15";
    return "bg-red-500/15";
  }

  function getAmountColor(type: string) {
    if (type === "income") return "text-emerald-500";
    if (type === "transfer") return "text-blue-500";
    return "text-red-500";
  }

  function getAmountPrefix(type: string) {
    if (type === "income") return "+";
    if (type === "transfer") return "→";
    return "-";
  }

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="popLayout">
        {Array.from(groupedTransactions.entries()).map(([dateKey, dayTransactions]) => (
          <motion.div
            key={dateKey}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={ease}
          >
            <div className="mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {formatDateHeader(dateKey)}
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {dayTransactions.map((transaction, i) => {
                const category = categoriesMap.get(transaction.category_id);
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
                            <div className="grid grid-cols-3 gap-3">
                              <select
                                value={draft.type}
                                onChange={(e) =>
                                  setDraft({
                                    ...draft,
                                    type: e.target.value as "expense" | "income" | "transfer",
                                  })
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                              >
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                                <option value="transfer">Transfer</option>
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
                            </div>
                            {draft.type === "transfer" && (
                              <select
                                value={draft.to_account_id}
                                onChange={(e) =>
                                  setDraft({ ...draft, to_account_id: e.target.value })
                                }
                                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                              >
                                <option value="" disabled>
                                  To Account
                                </option>
                                {accounts
                                  .filter((a) => String(a.id) !== draft.account_id)
                                  .map((a) => (
                                    <option key={a.id} value={a.id}>
                                      {a.name}
                                    </option>
                                  ))}
                              </select>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                aria-label="Date"
                                type="date"
                                value={draft.date}
                                onChange={(e) =>
                                  setDraft({ ...draft, date: e.target.value })
                                }
                                className="h-9"
                              />
                              <Input
                                aria-label="Tags"
                                value={draft.tags}
                                onChange={(e) =>
                                  setDraft({ ...draft, tags: e.target.value })
                                }
                                className="h-9"
                                placeholder="Tags (comma separated)"
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
                                className={`size-11 rounded-2xl flex items-center justify-center shadow-inner ${getTypeColor(transaction.type)}`}
                              >
                                {category?.icon ? (
                                  <span className="text-xl">{category.icon}</span>
                                ) : (
                                  getTypeIcon(transaction.type)
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">
                                    {transaction.name || category?.name || "Untitled"}
                                  </p>
                                  {transaction.type === "transfer" && (
                                    <Badge variant="outline" className="text-xs text-blue-500 border-blue-500/30">
                                      Transfer
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {transaction.description && (
                                    <p className="text-xs text-muted-foreground">
                                      {transaction.description}
                                    </p>
                                  )}
                                  {transaction.tags && (
                                    <div className="flex gap-1">
                                      {transaction.tags.split(",").map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                          {tag.trim()}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p
                                className={`font-semibold tracking-tight ${getAmountColor(transaction.type)}`}
                              >
                                {getAmountPrefix(transaction.type)}
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
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
