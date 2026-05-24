import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { AppLayout } from "@/components/AppLayout";
import { CategoryList, CategoryForm } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { CategoryCreateValues } from "@/schemas/category";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  function handleSubmit(data: CategoryCreateValues) {
    createMutation.mutate(data);
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
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
                <PieChart className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Categories</h1>
                <p className="text-sm text-muted-foreground">
                  Organize your transactions with smart categories
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">
              {categories?.length || 0} categories
            </Badge>
          </div>
        </motion.div>

        {/* Create Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...ease }}
          className="mb-8"
        >
          <CategoryForm
            onSubmit={handleSubmit}
            isPending={createMutation.isPending}
            isError={createMutation.isError}
          />
        </motion.div>

        <Separator className="mb-8" />

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
        >
          <h2 className="text-lg font-medium mb-6">Your Categories</h2>
          <CategoryList
            categories={categories || []}
            isLoading={isLoading}
            isError={isError}
            onDelete={handleDelete}
            isDeleting={deleteMutation.isPending}
          />
        </motion.div>
      </div>
    </AppLayout>
  );
}
