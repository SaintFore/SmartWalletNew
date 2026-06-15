import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

/** Transaction type labels (Chinese) */
export const TYPE_LABELS: Record<string, string> = {
  expense: "支出",
  income: "收入",
  transfer: "转账",
};

/** Transaction type icons */
export const TYPE_ICONS: Record<string, React.ReactNode> = {
  expense: <ArrowDownRight className="size-3 text-red-500" />,
  income: <ArrowUpRight className="size-3 text-emerald-500" />,
  transfer: <ArrowLeftRight className="size-3 text-blue-500" />,
};

/** Transaction type text colors */
export const TYPE_COLORS: Record<string, string> = {
  expense: "text-red-500",
  income: "text-emerald-500",
  transfer: "text-blue-500",
};

/** Transaction type select options */
export const TYPE_OPTIONS: SelectOption[] = [
  { value: "expense", label: "支出" },
  { value: "income", label: "收入" },
  { value: "transfer", label: "转账" },
];
