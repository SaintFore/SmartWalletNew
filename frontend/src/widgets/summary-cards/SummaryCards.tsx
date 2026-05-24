import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  net: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}

export function SummaryCards({
  totalIncome,
  totalExpense,
  net,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="overflow-hidden border-emerald-500/15 bg-gradient-to-br from-emerald-500/12 via-card to-card shadow-lg shadow-emerald-500/5">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Income</span>
            <div className="rounded-2xl bg-emerald-500/15 p-2">
              <TrendingUp className="size-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight text-emerald-500">
            {formatCurrency(totalIncome)}
          </p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-red-500/15 bg-gradient-to-br from-red-500/12 via-card to-card shadow-lg shadow-red-500/5">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Expense</span>
            <div className="rounded-2xl bg-red-500/15 p-2">
              <TrendingDown className="size-5 text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-semibold tracking-tight text-red-500">
            {formatCurrency(totalExpense)}
          </p>
        </CardContent>
      </Card>
      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/12 via-card to-card shadow-lg shadow-primary/5">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Net</span>
            <div className="rounded-2xl bg-primary/15 p-2">
              <DollarSign className="size-5 text-primary" />
            </div>
          </div>
          <p
            className={`text-2xl font-semibold tracking-tight ${
              net >= 0 ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {formatCurrency(net)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
