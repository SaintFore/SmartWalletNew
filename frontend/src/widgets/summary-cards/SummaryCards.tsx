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
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="size-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <p className="text-lg font-semibold text-emerald-500">
            {formatCurrency(totalIncome)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="size-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Expense</span>
          </div>
          <p className="text-lg font-semibold text-red-500">
            {formatCurrency(totalExpense)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="size-4 text-primary" />
            <span className="text-xs text-muted-foreground">Net</span>
          </div>
          <p
            className={`text-lg font-semibold ${
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
