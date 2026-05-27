import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, WalletCards } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  accountCreateSchema,
  type AccountCreateValues,
} from "@/entities/account";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface AccountFormProps {
  onSubmit: (data: AccountCreateValues) => void;
  isPending: boolean;
  errorMessage?: string;
}

export function AccountForm({
  onSubmit,
  isPending,
  errorMessage,
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AccountCreateValues>({
    resolver: zodResolver(accountCreateSchema),
    defaultValues: { is_default: false },
  });

  function handleFormSubmit(data: AccountCreateValues) {
    onSubmit({
      ...data,
      name: data.name.trim(),
      icon: data.icon?.trim() || undefined,
    });
    reset({ name: "", icon: "", is_default: false });
  }

  return (
    <Card className="overflow-hidden border-primary/15 bg-card/85 shadow-xl shadow-primary/5 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="rounded-2xl bg-primary/10 p-2 text-primary">
            <WalletCards className="size-5" />
          </span>
          Add New Account
        </CardTitle>
        <CardDescription>
          Create wallets, bank cards, or payment accounts for transaction entry.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-name">Account Name</Label>
              <Input
                id="account-name"
                placeholder="e.g., Cash, Alipay, Bank Card"
                className="h-11"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="account-icon">Icon (optional)</Label>
              <Input
                id="account-icon"
                placeholder="e.g., 💵, 💳"
                className="h-11"
                maxLength={8}
                {...register("icon")}
              />
            </div>
          </div>
          <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              {...register("is_default")}
            />
            <span>Use as the default account for new transactions</span>
          </label>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending} className="h-11 px-5">
              {isPending ? (
                <Loader2
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
              ) : (
                <Plus className="size-4" data-icon="inline-start" />
              )}
              Add Account
            </Button>
          </div>
        </form>
        {errorMessage && (
          <p className="text-sm text-destructive mt-4">{errorMessage}</p>
        )}
      </CardContent>
    </Card>
  );
}
