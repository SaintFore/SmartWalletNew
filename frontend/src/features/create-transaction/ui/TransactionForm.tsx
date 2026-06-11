import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Plus,
  Sparkles,
  ArrowLeftRight,
} from "lucide-react";
import { useForm } from "react-hook-form";

import type { CategoryRead } from "@/entities/category";
import type { AccountWithBalance } from "@/entities/account";
import {
  quickTransactionCreateSchema,
  transactionCreateSchema,
  type QuickTransactionCreateValues,
  type TransactionCreateValues,
} from "@/entities/transaction";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface TransactionFormProps {
  categories: CategoryRead[];
  accounts: AccountWithBalance[];
  onSubmit: (data: TransactionCreateValues) => void;
  onQuickSubmit: (data: QuickTransactionCreateValues) => void;
  isPending: boolean;
  isQuickPending: boolean;
  isError: boolean;
}

function getLastCategoryId(): number | undefined {
  const saved = localStorage.getItem("lastCategoryId");
  return saved ? Number(saved) : undefined;
}

function saveLastCategoryId(id: number) {
  localStorage.setItem("lastCategoryId", String(id));
}

export function TransactionForm({
  categories,
  accounts,
  onSubmit,
  onQuickSubmit,
  isPending,
  isQuickPending,
  isError,
}: TransactionFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const now = new Date();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<TransactionCreateValues>({
    resolver: zodResolver(transactionCreateSchema),
    defaultValues: {
      type: "expense",
      date: now.toISOString().split("T")[0],
      category_id: getLastCategoryId(),
      account_id: accounts.find((account) => account.is_default)?.id ?? accounts[0]?.id,
    },
  });
  const quickForm = useForm<QuickTransactionCreateValues>({
    resolver: zodResolver(quickTransactionCreateSchema),
    defaultValues: {
      text: "",
      date: now.toISOString().split("T")[0],
    },
  });


  const selectedType = watch("type");
  const selectedCategoryId = watch("category_id");
  const selectedAccountId = watch("account_id");

  useEffect(() => {
    if (selectedCategoryId) {
      saveLastCategoryId(selectedCategoryId);
    }
  }, [selectedCategoryId]);
  useEffect(() => {
    const currentAccountId = selectedAccountId;
    if (!currentAccountId && accounts.length > 0) {
      setValue(
        "account_id",
        accounts.find((account) => account.is_default)?.id ?? accounts[0].id,
      );
    }
  }, [accounts, selectedAccountId, setValue]);


  function handleFormSubmit(data: TransactionCreateValues) {
    onSubmit(data);
    reset({
      type: data.type,
      date: data.date,
      category_id: data.category_id,
      account_id: data.account_id,
    });
  }
  function handleQuickSubmit(data: QuickTransactionCreateValues) {
    onQuickSubmit(data);
    quickForm.reset({
      text: "",
      date: data.date,
    });
  }

  return (
    <Card className="overflow-hidden border-primary/15 bg-card/85 shadow-xl shadow-primary/5 backdrop-blur">
      <CardContent className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Add transaction</h2>
            <p className="text-sm text-muted-foreground">Type amount, name, category, then press Enter to save.</p>
          </div>
          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Plus className="size-5" />
          </div>
        </div>
        <form
          onSubmit={quickForm.handleSubmit(handleQuickSubmit)}
          className="mb-5 grid gap-3 rounded-2xl border border-dashed border-primary/25 bg-primary/5 p-3 sm:grid-cols-[1fr_auto]"
        >
          <div>
            <Input
              placeholder="Quick add: 午饭 28 支付宝"
              aria-label="Quick transaction input"
              className="h-12 bg-background/80"
              autoFocus
              {...quickForm.register("text")}
            />
            {quickForm.formState.errors.text && (
              <p className="mt-1 text-xs text-destructive">
                {quickForm.formState.errors.text.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isQuickPending}
            className="h-12 shrink-0 px-5"
          >
            {isQuickPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            AI add
          </Button>
        </form>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Main Row: Amount + Name + Category + Submit */}
          <div className="grid gap-3 lg:grid-cols-[minmax(8rem,0.75fr)_minmax(12rem,1.25fr)_minmax(10rem,1fr)_auto]">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                aria-label="Amount"
                className="h-12 text-xl font-semibold"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <Input
                id="name"
                placeholder="Name, e.g. KFC lunch"
                aria-label="Name"
                className="h-12"
                {...register("name")}
              />
            </div>

            <div className="flex-1">
              <select
                {...register("category_id", { valueAsNumber: true })}
                className="flex h-12 w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-destructive mt-1">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="h-12 shrink-0 px-6">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/70 p-1">
            <Button
              type="button"
              variant={selectedType === "expense" ? "default" : "ghost"}
              size="sm"
              className="h-10"
              onClick={() => setValue("type", "expense")}
            >
              <ArrowDownRight className="size-3" data-icon="inline-start" />
              Expense
            </Button>
            <Button
              type="button"
              variant={selectedType === "income" ? "default" : "ghost"}
              size="sm"
              className="h-10"
              onClick={() => setValue("type", "income")}
            >
              <ArrowUpRight className="size-3" data-icon="inline-start" />
              Income
            </Button>
            <Button
              type="button"
              variant={selectedType === "transfer" ? "default" : "ghost"}
              size="sm"
              className="h-10"
              onClick={() => setValue("type", "transfer")}
            >
              <ArrowLeftRight className="size-3" data-icon="inline-start" />
              Transfer
            </Button>
            <input type="hidden" {...register("type")} />
          </div>

          {/* Advanced Options Toggle */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="size-4 mr-1" />
                Hide Advanced
              </>
            ) : (
              <>
                <ChevronDown className="size-4 mr-1" />
                More Options
              </>
            )}
          </Button>

          {/* Advanced Options */}
          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="date" className="text-xs">
                      Date
                    </Label>
                    <Input id="date" type="date" {...register("date")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="account_id" className="text-xs">
                      Account
                    </Label>
                    <select
                      id="account_id"
                      {...register("account_id", { valueAsNumber: true })}
                      className="flex h-10 w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.icon} {account.name}
                        </option>
                      ))}
                    </select>
                    {errors.account_id && (
                      <p className="mt-1 text-xs text-destructive">
                        {errors.account_id.message}
                      </p>
                    )}
                  </div>
                  {selectedType === "transfer" && (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="to_account_id" className="text-xs">
                        To Account
                      </Label>
                      <select
                        id="to_account_id"
                        {...register("to_account_id", { valueAsNumber: true })}
                        className="flex h-10 w-full rounded-xl border border-input bg-background/80 px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">Select target account</option>
                        {accounts
                          .filter((a) => a.id !== selectedAccountId)
                          .map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.icon} {account.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="tags" className="text-xs">
                      Tags
                    </Label>
                    <Input
                      id="tags"
                      placeholder="e.g. 请客,出差"
                      {...register("tags")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="description" className="text-xs">
                      Description
                    </Label>
                    <Input
                      id="description"
                      placeholder="Optional context"
                      {...register("description")}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isError && (
            <p className="text-sm text-destructive">
              Failed to create transaction.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
