import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Smartphone,
  Moon,
  Sun,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Plus,
  LayoutDashboard,
} from "lucide-react";
import { useDarkMode } from "@/shared/lib/use-dark-mode";
import { useCategories } from "@/entities/category";
import { useMonthlySummary, useTransactions } from "@/entities/transaction";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

export default function LandingPage() {
  const { dark, toggle } = useDarkMode();
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions();
  const now = new Date();
  const { data: summary } = useMonthlySummary(
    now.getFullYear(),
    now.getMonth() + 1,
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,var(--accent),transparent_32rem),linear-gradient(180deg,var(--background),var(--secondary))] text-foreground">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, ...ease }}
        className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-primary/10 p-2 text-primary shadow-inner">
              <Wallet className="size-5" />
            </div>
            <div>
              <span className="font-semibold text-lg leading-none">SmartWallet</span>
              <p className="text-xs text-muted-foreground">Spend with clarity</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link to="/categories">Categories</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/transactions">Transactions</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/analytics">Analytics</Link>
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.05] rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500/[0.05] rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ease}
          >
            <Badge variant="secondary" className="mb-4">
              <Zap className="size-3.5" data-icon="inline-start" />
              Smart Financial Management
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, ...ease }}
            className="text-4xl md:text-5xl font-semibold tracking-tight mb-4"
          >
            Take Control of
            <br />
            <span className="text-primary">Your Finances</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...ease }}
            className="text-lg text-muted-foreground max-w-xl mx-auto mb-8"
          >
            Track expenses, categorize transactions, and achieve your financial
            goals with intelligent insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...ease }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button size="lg" asChild>
              <Link to="/transactions">
                <Plus className="size-4" data-icon="inline-start" />
                Add Transaction
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/categories">
                <LayoutDashboard className="size-4" data-icon="inline-start" />
                Manage Categories
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, ...ease }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <Card>
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="size-5 text-emerald-500" />
                </div>
                <p className="text-sm text-muted-foreground">Income</p>
                <p className="text-xl font-semibold text-emerald-500">
                  {summary ? formatCurrency(summary.total_income) : "¥0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center mx-auto mb-2">
                  <TrendingDown className="size-5 text-red-500" />
                </div>
                <p className="text-sm text-muted-foreground">Expense</p>
                <p className="text-xl font-semibold text-red-500">
                  {summary ? formatCurrency(summary.total_expense) : "¥0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Net</p>
                <p
                  className={`text-xl font-semibold ${
                    summary && summary.net >= 0
                      ? "text-emerald-500"
                      : "text-red-500"
                  }`}
                >
                  {summary ? formatCurrency(summary.net) : "¥0.00"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                  <PieChart className="size-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-xl font-semibold">
                  {categories?.length || 0}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* Recent Transactions */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={ease}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Recent Transactions</h2>
              <Button variant="ghost" asChild>
                <Link to="/transactions">
                  View All
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {transactions && transactions.length > 0 ? (
            <div className="flex flex-col gap-3">
              {transactions.slice(0, 5).map((transaction, i) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, ...ease }}
                >
                  <Card className="hover:border-border hover:shadow-sm transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`size-10 rounded-lg flex items-center justify-center ${
                              transaction.type === "income"
                                ? "bg-emerald-500/10"
                                : "bg-red-500/10"
                            }`}
                          >
                            {transaction.type === "income" ? (
                              <ArrowUpRight className="size-5 text-emerald-500" />
                            ) : (
                              <ArrowDownRight className="size-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.name || "Untitled"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.date).toLocaleDateString(
                                "zh-CN",
                              )}
                            </p>
                          </div>
                        </div>
                        <p
                          className={`font-semibold ${
                            transaction.type === "income"
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground/60 mb-4">
                  Start tracking your finances
                </p>
                <Button asChild>
                  <Link to="/transactions">
                    <Plus className="size-4 mr-1" />
                    Add First Transaction
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto" />

      {/* Quick Categories */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={ease}
            className="mb-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Categories</h2>
              <Button variant="ghost" asChild>
                <Link to="/categories">
                  Manage
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {categories && categories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {categories.slice(0, 8).map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, ...ease }}
                >
                  <Card className="hover:border-border hover:shadow-sm transition-all cursor-pointer">
                    <CardContent className="p-4 text-center">
                      {category.icon ? (
                        <span className="text-3xl">{category.icon}</span>
                      ) : (
                        <PieChart className="size-8 text-muted-foreground mx-auto" />
                      )}
                      <p className="font-medium text-sm mt-2">
                        {category.name}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <PieChart className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">No categories yet</p>
                <p className="text-sm text-muted-foreground/60 mb-4">
                  Create categories to organize transactions
                </p>
                <Button asChild>
                  <Link to="/categories">
                    <Plus className="size-4 mr-1" />
                    Create First Category
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={ease}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-semibold mb-2">
              Why Choose SmartWallet?
            </h2>
            <p className="text-muted-foreground">
              Powerful features to simplify your financial life
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: PieChart,
                title: "Smart Categories",
                desc: "Organize with intelligent categorization",
              },
              {
                icon: TrendingUp,
                title: "Track Progress",
                desc: "Visualize your financial health",
              },
              {
                icon: Shield,
                title: "Secure",
                desc: "Your data is encrypted and protected",
              },
              {
                icon: Smartphone,
                title: "Mobile First",
                desc: "Access anywhere, anytime",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...ease }}
              >
                <Card className="h-full hover:border-border hover:shadow-md transition-all">
                  <CardContent className="p-5 text-center">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="size-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="size-4 text-primary" />
            <span className="font-semibold">SmartWallet</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 SmartWallet. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
