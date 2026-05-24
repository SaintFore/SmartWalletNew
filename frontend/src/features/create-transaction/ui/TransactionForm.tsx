import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  transactionCreateSchema,
  type TransactionCreateValues,
} from "@/entities/transaction";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Card, CardContent } from "@/shared/ui/card";

interface Category {
  id: number;
  name: string;
  icon?: string | null;
}

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (data: TransactionCreateValues) => void;
  isPending: boolean;
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
  onSubmit,
  isPending,
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
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("category_id");

  useEffect(() => {
    if (selectedCategoryId) {
      saveLastCategoryId(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  function handleFormSubmit(data: TransactionCreateValues) {
    onSubmit(data);
    reset({
      type: data.type,
      date: data.date,
      category_id: data.category_id,
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
                autoFocus
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
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/70 p-1">
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
