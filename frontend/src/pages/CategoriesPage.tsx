import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Package, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { categoryCreateSchema, type CategoryCreateValues } from "@/schemas/category";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const smooth = { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const };

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryCreateValues>({
    resolver: zodResolver(categoryCreateSchema),
  });

  function onSubmit(data: CategoryCreateValues) {
    createMutation.mutate(data, {
      onSuccess: () => reset(),
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, ...smooth }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-1 bg-background/90 backdrop-blur-xl rounded-full px-2 py-2 shadow-lg shadow-black/5 border border-border"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-accent"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Home
          </Link>
          <Link
            to="/categories"
            className="px-5 py-2.5 text-sm font-medium text-foreground bg-accent rounded-full"
          >
            Categories
          </Link>
        </motion.div>
      </motion.nav>

      <div className="max-w-2xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={smooth}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Categories</h1>
          <p className="text-muted-foreground">
            Manage your transaction categories
          </p>
        </motion.div>

        {/* Create Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...smooth }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Add Category</CardTitle>
              <CardDescription>
                Create a new category via <code>POST /api/categories</code>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="name" className="sr-only">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Category name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="icon" className="sr-only">
                    Icon
                  </Label>
                  <Input
                    id="icon"
                    placeholder="Icon (emoji)"
                    {...register("icon")}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="shrink-0"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add
                </Button>
              </form>
              {createMutation.isError && (
                <p className="text-sm text-destructive mt-2">
                  Failed to create category. Is the API running?
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...smooth }}
        >
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading categories...
            </div>
          )}

          {isError && (
            <Card className="border-destructive/50">
              <CardContent className="py-8 text-center">
                <p className="text-destructive font-medium mb-1">
                  Failed to load categories
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure the API is running at{" "}
                  <code>{import.meta.env.VITE_API_BASE_URL}</code>
                </p>
              </CardContent>
            </Card>
          )}

          {categories && categories.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No categories yet</p>
                <p className="text-sm text-muted-foreground/60">
                  Add one using the form above
                </p>
              </CardContent>
            </Card>
          )}

          <AnimatePresence mode="popLayout">
            {categories?.map((category) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={smooth}
              >
                <Card className="mb-3">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {category.icon && (
                        <span className="text-2xl">{category.icon}</span>
                      )}
                      <p className="font-medium">{category.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Tech note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, ...smooth }}
          className="text-center text-xs text-muted-foreground mt-8"
        >
          API types auto-generated by{" "}
          <span className="font-medium">openapi-typescript</span>
        </motion.p>
      </div>
    </div>
  );
}
