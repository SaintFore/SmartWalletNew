import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Wallet,
} from "lucide-react";
import { useMonthlySummary } from "@/entities/transaction";
import { useCategories } from "@/entities/category";
import { AppLayout } from "@/widgets/app-layout";
import { BarChart, LineChart, PieChart } from "@/widgets/charts";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Card, CardContent } from "@/shared/ui/card";
import { Separator } from "@/shared/ui/separator";
import { formatCurrency } from "@/shared/lib/format";

const ease = { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const };

function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1];
}

export default function AnalyticsPage() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const { data: summary, isLoading } = useMonthlySummary(
    selectedYear,
    selectedMonth,
  );
  const { data: categories } = useCategories();

  const prevMonth = selectedMonth === 1 ? 12 : selectedMonth - 1;
  const prevYear = selectedMonth === 1 ? selectedYear - 1 : selectedYear;
  const { data: prevSummary } = useMonthlySummary(prevYear, prevMonth);

  // 计算环比变化
  const incomeChange = prevSummary
    ? ((Number(summary?.total_income || 0) - Number(prevSummary.total_income)) /
        (Number(prevSummary.total_income) || 1)) *
      100
    : 0;
  const expenseChange = prevSummary
    ? ((Number(summary?.total_expense || 0) - Number(prevSummary.total_expense)) /
        (Number(prevSummary.total_expense) || 1)) *
      100
    : 0;

  // 获取分类详情
  const categoryDetails =
    summary?.by_category
      .map((cat) => {
        const category = categories?.find((c) => c.id === cat.category_id);
        return {
          ...cat,
          icon: category?.icon || "📦",
          name: category?.name || "Unknown",
        };
      })
      .sort((a, b) => Number(b.total) - Number(a.total)) || [];

  // 准备饼图数据
  const pieData = categoryDetails.map((cat) => ({
    name: cat.name,
    value: Number(cat.total),
  }));

  // 准备柱状图数据
  const barData = categoryDetails.slice(0, 6).map((cat) => ({
    name: cat.name,
    value: Number(cat.total),
  }));
  const lineData =
    summary?.by_day.map((day) => ({
      name: new Date(day.date).getDate().toString(),
      value: Number(day.total_expense),
    })) || [];


  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
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
                <BarChart3 className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Analytics</h1>
                <p className="text-sm text-muted-foreground">
                  Visual insights into your financial health
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 1) {
                    setSelectedMonth(12);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                }}
              >
                ←
              </Button>
              <Badge variant="secondary" className="px-4 py-1.5">
                <Calendar className="size-3.5 mr-1.5" />
                {getMonthName(selectedMonth)} {selectedYear}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedMonth === 12) {
                    setSelectedMonth(1);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                }}
              >
                →
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...ease }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="size-5 text-emerald-500" />
                </div>
                {incomeChange !== 0 && (
                  <Badge
                    variant={incomeChange > 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {incomeChange > 0 ? "+" : ""}
                    {incomeChange.toFixed(1)}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-semibold text-emerald-500 mt-1">
                {formatCurrency(summary?.total_income || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="size-5 text-red-500" />
                </div>
                {expenseChange !== 0 && (
                  <Badge
                    variant={expenseChange < 0 ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {expenseChange > 0 ? "+" : ""}
                    {expenseChange.toFixed(1)}%
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Total Expense</p>
              <p className="text-2xl font-semibold text-red-500 mt-1">
                {formatCurrency(summary?.total_expense || 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="size-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Net Balance</p>
              <p
                className={`text-2xl font-semibold mt-1 ${
                  Number(summary?.net || 0) >= 0 ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {formatCurrency(summary?.net || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="mb-8" />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...ease }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="size-5 text-primary" />
                  <h3 className="font-medium">Expense Distribution</h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : pieData.length > 0 ? (
                  <div className="flex flex-col items-center">
                    <PieChart
                      data={pieData}
                      width={280}
                      height={280}
                      innerRadius={60}
                    />
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {pieData.slice(0, 6).map((item, i) => {
                        const colors = [
                          "bg-blue-500",
                          "bg-emerald-500",
                          "bg-violet-500",
                          "bg-amber-500",
                          "bg-rose-500",
                          "bg-cyan-500",
                        ];
                        return (
                          <div
                            key={item.name}
                            className="flex items-center gap-1.5"
                          >
                            <div
                              className={`size-2.5 rounded-full ${colors[i % colors.length]}`}
                            />
                            <span className="text-xs text-muted-foreground">
                              {item.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No expense data
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ...ease }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="size-5 text-primary" />
                  <h3 className="font-medium">Top Categories</h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : barData.length > 0 ? (
                  <BarChart data={barData} width={400} height={280} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No category data
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...ease }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="size-5 text-primary" />
                <h3 className="font-medium">Daily Expense Trend</h3>
              </div>
              {isLoading ? (
                <div className="flex items-center justify-center h-72">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : lineData.length > 0 ? (
                <LineChart
                  data={lineData}
                  width={760}
                  height={300}
                  color="rgb(239 68 68)"
                />
              ) : (
                <div className="flex items-center justify-center h-72 text-muted-foreground">
                  No daily expense data
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="mb-8" />

        {/* Account Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, ...ease }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="size-5 text-primary" />
                  <h3 className="font-medium">Expense by Account</h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (summary?.by_account?.length ?? 0) > 0 ? (
                  <BarChart
                    data={summary!.by_account.map((a) => ({
                      name: a.account_name,
                      value: Number(a.total_expense),
                    }))}
                    width={400}
                    height={280}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No account data
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, ...ease }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wallet className="size-5 text-primary" />
                  <h3 className="font-medium">Income by Account</h3>
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (summary?.by_account?.length ?? 0) > 0 ? (
                  <BarChart
                    data={summary!.by_account.map((a) => ({
                      name: a.account_name,
                      value: Number(a.total_income),
                      color: "rgb(16 185 129)",
                    }))}
                    width={400}
                    height={280}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    No account data
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Account Details Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, ...ease }}
          className="mb-8"
        >
          <h2 className="text-lg font-medium mb-6">Account Breakdown</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (summary?.by_account?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary!.by_account.map((account, i) => (
                <motion.div
                  key={account.account_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.05, ...ease }}
                >
                  <Card className="hover:border-border hover:shadow-sm transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Wallet className="size-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{account.account_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {account.count} transactions
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-muted-foreground">Income</p>
                          <p className="text-sm font-medium text-emerald-500">
                            {formatCurrency(account.total_income)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expense</p>
                          <p className="text-sm font-medium text-red-500">
                            {formatCurrency(account.total_expense)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Net</p>
                          <p
                            className={`text-sm font-medium ${
                              Number(account.net) >= 0
                                ? "text-emerald-500"
                                : "text-red-500"
                            }`}
                          >
                            {formatCurrency(account.net)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Wallet className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-medium text-lg mb-2">No account data</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start adding transactions to see account analytics.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>

        <Separator className="mb-8" />

        {/* Category Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, ...ease }}
        >
          <h2 className="text-lg font-medium mb-6">Category Breakdown</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-6 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categoryDetails.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryDetails.map((cat, i) => (
                <motion.div
                  key={cat.category_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.05, ...ease }}
                >
                  <Card className="hover:border-border hover:shadow-sm transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl">
                            {cat.icon}
                          </div>
                          <div>
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {cat.count} transactions
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(cat.total)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <PieChartIcon className="size-12 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="font-medium text-lg mb-2">No data available</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Start adding transactions to see your analytics.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
