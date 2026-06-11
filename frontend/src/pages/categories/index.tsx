import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import {
  useCategories,
  type CategoryCreateValues,
  type CategoryUpdateValues,
} from "@/entities/category";
import { CategoryForm, useCreateCategory } from "@/features/create-category";
import { useDeleteCategory } from "@/features/delete-category";
import { useUpdateCategory } from "@/features/update-category";
import { AppLayout } from "@/widgets/app-layout";
import { CategoryList } from "@/widgets/category-list";
import { ease } from "@/shared/lib/animations";
import { Badge } from "@/shared/ui/badge";
import { Separator } from "@/shared/ui/separator";

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();
  const updateMutation = useUpdateCategory();

  function handleSubmit(data: CategoryCreateValues) {
    createMutation.mutate(data);
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  function handleUpdate(id: number, data: CategoryUpdateValues) {
    updateMutation.mutate({ id, data });
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
            onUpdate={handleUpdate}
            isUpdating={updateMutation.isPending}
          />
        </motion.div>
      </div>
    </AppLayout>
  );
}
