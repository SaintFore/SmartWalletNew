import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import {
  categoryCreateSchema,
  type CategoryCreateValues,
} from "@/entities/category";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface CategoryFormProps {
  onSubmit: (data: CategoryCreateValues) => void;
  isPending: boolean;
  isError: boolean;
}

export function CategoryForm({
  onSubmit,
  isPending,
  isError,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryCreateValues>({
    resolver: zodResolver(categoryCreateSchema),
  });

  function handleFormSubmit(data: CategoryCreateValues) {
    onSubmit(data);
    reset();
  }

  return (
    <Card className="overflow-hidden border-primary/15 bg-card/85 shadow-xl shadow-primary/5 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-xl">
          <span className="rounded-2xl bg-primary/10 p-2 text-primary">
            <Plus className="size-5" />
          </span>
          Add New Category
        </CardTitle>
        <CardDescription>
          Create reusable buckets so every transaction lands in the right place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex flex-col gap-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Groceries, Entertainment"
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
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                placeholder="e.g., 🛒, 🎮"
                className="h-11"
                {...register("icon")}
              />
            </div>
          </div>
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
              Add Category
            </Button>
          </div>
        </form>
        {isError && (
          <p className="text-sm text-destructive mt-4">
            Failed to create category.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
