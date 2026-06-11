import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CreditCard, Pencil, Star, Trash2, WalletCards, X } from "lucide-react";

import type { AccountUpdateValues, AccountWithBalance } from "@/entities/account";
import { ease } from "@/shared/lib/animations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { formatCurrency } from "@/shared/lib/format";

interface AccountListProps {
  accounts: AccountWithBalance[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
  onUpdate: (id: number, data: AccountUpdateValues) => void;
  isUpdating: boolean;
}

interface AccountDraft {
  id: number;
  name: string;
  icon: string;
  is_default: boolean;
}

type AccountItem = AccountWithBalance;

function AccountListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AccountList({
  accounts,
  isLoading,
  isError,
  onDelete,
  isDeleting,
  onUpdate,
  isUpdating,
}: AccountListProps) {
  const [draft, setDraft] = useState<AccountDraft | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AccountItem | null>(null);

  if (isLoading) {
    return <AccountListSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center">
          <p className="text-destructive font-medium">Failed to load accounts</p>
        </CardContent>
      </Card>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <WalletCards className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No accounts yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first account before adding transactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  function startEditing(account: AccountItem) {
    setDraft({
      id: account.id,
      name: account.name,
      icon: account.icon ?? "",
      is_default: account.is_default,
    });
  }

  function saveDraft() {
    if (!draft) return;

    const name = draft.name.trim();
    if (!name) return;

    onUpdate(draft.id, {
      name,
      icon: draft.icon.trim() || null,
      is_default: draft.is_default,
    });
    setDraft(null);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {accounts.map((account, i) => {
          const isEditing = draft?.id === account.id;
          return (
            <motion.div
              key={account.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05, ...ease }}
            >
              <Card className="group h-full overflow-hidden border-border/70 bg-card/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-5">
                  {isEditing && draft ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-[4rem_1fr] gap-3">
                        <Input
                          aria-label="Account icon"
                          value={draft.icon}
                          onChange={(event) =>
                            setDraft({ ...draft, icon: event.target.value })
                          }
                          className="h-11 text-center text-xl"
                          maxLength={8}
                        />
                        <Input
                          aria-label="Account name"
                          value={draft.name}
                          onChange={(event) =>
                            setDraft({ ...draft, name: event.target.value })
                          }
                          className="h-11"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={draft.is_default}
                          onChange={(event) =>
                            setDraft({
                              ...draft,
                              is_default: event.target.checked,
                            })
                          }
                          className="size-4 accent-primary"
                        />
                        Default account
                      </label>
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
                          disabled={isUpdating || !draft.name.trim()}
                        >
                          <Check className="size-4" data-icon="inline-start" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {account.icon ? (
                          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-inner">
                            {account.icon}
                          </div>
                        ) : (
                          <div className="size-14 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                            <CreditCard className="size-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{account.name}</p>
                            {account.is_default && (
                              <Badge variant="secondary" className="gap-1">
                                <Star className="size-3 fill-current" />
                                默认
                              </Badge>
                            )}
                          </div>
                          <p className={`text-lg font-semibold tracking-tight ${
                            Number(account.balance) >= 0 ? "text-emerald-500" : "text-red-500"
                          }`}>
                            {formatCurrency(Number(account.balance))}
                          </p>
                        </div>
                      </div>
                      <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                        {!account.is_default && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating || isDeleting}
                            onClick={() =>
                              onUpdate(account.id, { is_default: true })
                            }
                            className="size-8"
                            title="Make default"
                          >
                            <Star className="size-4 text-muted-foreground hover:text-primary" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isUpdating || isDeleting}
                          onClick={() => startEditing(account)}
                          className="size-8"
                        >
                          <Pencil className="size-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        {account.has_transactions ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                className="size-8"
                              >
                                <Trash2 className="size-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              该账户存在交易记录，无法删除
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isDeleting || isUpdating}
                            onClick={() => setPendingDelete(account)}
                            className="size-8"
                          >
                            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除账户？</AlertDialogTitle>
            <AlertDialogDescription>
              删除后无法恢复。如果该账户存在交易记录，将无法删除。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  onDelete(pendingDelete.id);
                  setPendingDelete(null);
                }
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
