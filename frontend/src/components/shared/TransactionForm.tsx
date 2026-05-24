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
} from "@/schemas/transaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card>
      <CardContent className="p-4">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Main Row: Amount + Category + Submit */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="text-lg font-semibold"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive mt-1">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="flex-1">
              <select
                {...register("category_id", { valueAsNumber: true })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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

            <Button type="submit" disabled={isPending} className="shrink-0">
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Add
            </Button>
          </div>

          {/* Type Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={selectedType === "expense" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setValue("type", "expense")}
            >
              <ArrowDownRight className="size-3" data-icon="inline-start" />
              Expense
            </Button>
            <Button
              type="button"
              variant={selectedType === "income" ? "default" : "outline"}
              size="sm"
              className="flex-1"
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
                    <Label htmlFor="name" className="text-xs">
                      Description
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g., Lunch at KFC"
                      {...register("name")}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="date" className="text-xs">
                      Date
                    </Label>
                    <Input id="date" type="date" {...register("date")} />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="description" className="text-xs">
                      Notes
                    </Label>
                    <Input
                      id="description"
                      placeholder="Optional notes"
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
