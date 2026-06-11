import { motion } from "framer-motion";
import { WalletCards } from "lucide-react";

import {
  useAccounts,
  type AccountCreateValues,
  type AccountUpdateValues,
} from "@/entities/account";
import { AccountForm, useCreateAccount } from "@/features/create-account";
import { useDeleteAccount } from "@/features/delete-account";
import { useUpdateAccount } from "@/features/update-account";
import { AppLayout } from "@/widgets/app-layout";
import { AccountList } from "@/widgets/account-list";
import { ease } from "@/shared/lib/animations";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";

export default function AccountsPage() {
  const { data: accounts, isLoading, isError } = useAccounts();
  const createMutation = useCreateAccount();
  const updateMutation = useUpdateAccount();
  const deleteMutation = useDeleteAccount();

  function handleSubmit(data: AccountCreateValues) {
    createMutation.mutate(data);
  }

  const createErrorMessage = createMutation.isError
    ? (createMutation.error as { detail?: string })?.detail ||
      "创建账户失败"
    : undefined;

  function handleUpdate(id: number, data: AccountUpdateValues) {
    updateMutation.mutate({ id, data });
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ease}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <WalletCards className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Accounts</h1>
                <p className="text-sm text-muted-foreground">
                  Manage cash, cards, wallets, and the default payment account
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              {accounts?.length || 0} accounts
            </Badge>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...ease }}
          className="mb-8"
        >
          <AccountForm
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            errorMessage={createErrorMessage}
          />
        </motion.div>

        <Separator className="mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
        >
          <h2 className="text-lg font-medium mb-6">Your Accounts</h2>
          <AccountList
            accounts={accounts || []}
            isLoading={isLoading}
            isError={isError}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
          />
        </motion.div>
      </div>
    </AppLayout>
  );
}
