import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Package, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { itemCreateSchema, type ItemCreateValues } from "@/schemas/item";
import { useItems, useCreateItem, useDeleteItem } from "@/hooks/use-items";
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

export default function ItemsPage() {
  const { data: items, isLoading, isError } = useItems();
  const createMutation = useCreateItem();
  const deleteMutation = useDeleteItem();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ItemCreateValues>({
    resolver: zodResolver(itemCreateSchema),
  });

  function onSubmit(data: ItemCreateValues) {
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
            to="/items"
            className="px-5 py-2.5 text-sm font-medium text-foreground bg-accent rounded-full"
          >
            Items
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
          <h1 className="text-3xl font-bold mb-2">Items</h1>
          <p className="text-muted-foreground">
            CRUD demo powered by{" "}
            <span className="font-medium text-foreground">react-query</span> +{" "}
            <span className="font-medium text-foreground">react-hook-form</span>{" "}
            + <span className="font-medium text-foreground">zod</span>
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
              <CardTitle className="text-lg">Add Item</CardTitle>
              <CardDescription>
                Create a new item via <code>POST /api/items</code>
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
                    placeholder="Item name"
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="description" className="sr-only">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="Description (optional)"
                    {...register("description")}
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
                  Failed to create item. Is the API running?
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Items List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...smooth }}
        >
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading items...
            </div>
          )}

          {isError && (
            <Card className="border-destructive/50">
              <CardContent className="py-8 text-center">
                <p className="text-destructive font-medium mb-1">
                  Failed to load items
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure the API is running at{" "}
                  <code>{import.meta.env.VITE_API_BASE_URL}</code>
                </p>
              </CardContent>
            </Card>
          )}

          {items && items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No items yet</p>
                <p className="text-sm text-muted-foreground/60">
                  Add one using the form above
                </p>
              </CardContent>
            </Card>
          )}

          <AnimatePresence mode="popLayout">
            {items?.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={smooth}
              >
                <Card className="mb-3">
                  <CardContent className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(item.id)}
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
