import { motion, AnimatePresence } from "framer-motion";
import { Trash2, FolderOpen } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Skeleton } from "@/shared/ui/skeleton";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

interface Category {
  id: number;
  name: string;
  icon?: string | null;
}

interface CategoryListProps {
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

function CategoryListSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="size-12 rounded-xl" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CategoryList({
  categories,
  isLoading,
  isError,
  onDelete,
  isDeleting,
}: CategoryListProps) {
  if (isLoading) {
    return <CategoryListSkeleton />;
  }

  if (isError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-6 text-center">
          <p className="text-destructive font-medium">
            Failed to load categories
          </p>
        </CardContent>
      </Card>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="size-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No categories yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first category to start organizing your transactions.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {categories.map((category, i) => (
          <motion.div
            key={category.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: i * 0.05, ...ease }}
          >
            <Card className="group h-full overflow-hidden border-border/70 bg-card/80 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {category.icon ? (
                      <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-inner">
                        {category.icon}
                      </div>
                    ) : (
                      <div className="size-14 rounded-2xl bg-muted flex items-center justify-center shadow-inner">
                        <FolderOpen className="size-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Personal bucket
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeleting}
                    onClick={() => onDelete(category.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity size-8"
                  >
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
