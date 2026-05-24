import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2 } from "lucide-react";
import {
  categoryCreateSchema,
  type CategoryCreateValues,
} from "@/schemas/category";
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
          onSubmit={handleSubmit(handleFormSubmit)}
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
            <Button type="submit" disabled={isPending}>
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
