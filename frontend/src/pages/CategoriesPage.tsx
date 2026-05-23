import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  FolderOpen,
  Loader2,
  ArrowLeft,
  Wallet,
  PieChart,
  Search,
} from "lucide-react";
import { Link } from "react-router";
import {
  categoryCreateSchema,
  type CategoryCreateValues,
} from "@/schemas/category";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
} from "@/hooks/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

function CategoriesPageSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card"
        >
          <Skeleton className="size-12 rounded-lg" />
          <div className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}

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
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, ...ease }}
        className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Wallet className="size-5 text-primary" />
            <span className="font-semibold text-lg">SmartWallet</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-accent"
          >
            <ArrowLeft className="size-3.5" />
            Back to Home
          </Link>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {categories?.length || 0}{" "}
              {categories?.length === 1 ? "category" : "categories"}
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5" />
                Add New Category
              </CardTitle>
              <CardDescription>
                Create a category to organize your transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col gap-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Groceries, Entertainment"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="icon">Icon (optional)</Label>
                    <Input
                      id="icon"
                      placeholder="e.g., 🛒, 🎮"
                      {...register("icon")}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <Loader2
                        className="size-4 animate-spin"
                        data-icon="inline-start"
                      />
                    ) : (
                      <Plus className="size-4" data-icon="inline-start" />
                    )}
                    Add Category
                  </Button>
                </div>
              </form>
              {createMutation.isError && (
                <p className="text-sm text-destructive mt-4">
                  Failed to create category. Please check your connection and
                  try again.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="mb-8" />

        {/* Categories List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium">Your Categories</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="pl-9 w-64"
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && <CategoriesPageSkeleton />}

          {/* Error State */}
          {isError && (
            <Card className="border-destructive/50">
              <CardContent className="p-6 text-center">
                <p className="text-destructive font-medium mb-1">
                  Failed to load categories
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure the API is running at{" "}
                  <code className="px-1.5 py-0.5 rounded bg-muted text-xs">
                    {import.meta.env.VITE_API_BASE_URL}
                  </code>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {categories && categories.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="size-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No categories yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Create your first category to start organizing your
                  transactions.
                </p>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("name")?.focus()}
                >
                  <Plus className="size-4" data-icon="inline-start" />
                  Create First Category
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Categories Grid */}
          <AnimatePresence mode="popLayout">
            {categories && categories.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category, i) => (
                  <motion.div
                    key={category.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05, ...ease }}
                  >
                    <Card className="group hover:border-border hover:shadow-md transition-all h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {category.icon ? (
                              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                                {category.icon}
                              </div>
                            ) : (
                              <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
                                <FolderOpen className="size-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-base">
                                {category.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: {category.id}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(category.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                          >
                            <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Category
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
