import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import type { TransactionRead } from "@/entities/transaction";
import { TYPE_LABELS } from "@/entities/transaction";
import type { CategoryRead } from "@/entities/category";
import type { AccountWithBalance } from "@/entities/account";

interface ExportColumn {
  header: string;
  accessor: (t: TransactionRead) => string | number;
}

function buildColumns(
  categories: CategoryRead[],
  accounts: AccountWithBalance[],
): ExportColumn[] {
  return [
    { header: "日期", accessor: (t) => t.date.slice(0, 10) },
    { header: "名称", accessor: (t) => t.name || "" },
    { header: "金额", accessor: (t) => Number(t.amount) },
    { header: "类型", accessor: (t) => TYPE_LABELS[t.type] || t.type },
    {
      header: "分类",
      accessor: (t) => categories.find((c) => c.id === t.category_id)?.name || "",
    },
    {
      header: "账户",
      accessor: (t) => accounts.find((a) => a.id === t.account_id)?.name || "",
    },
    {
      header: "目标账户",
      accessor: (t) =>
        t.to_account_id
          ? accounts.find((a) => a.id === t.to_account_id)?.name || ""
          : "",
    },
    { header: "标签", accessor: (t) => t.tags || "" },
    { header: "备注", accessor: (t) => t.description || "" },
  ];
}

function buildRows(
  data: TransactionRead[],
  columns: ExportColumn[],
): (string | number)[][] {
  return data.map((t) => columns.map((col) => col.accessor(t)));
}

/** Export transactions to CSV with UTF-8 BOM for Excel compatibility */
export function exportToCSV(
  data: TransactionRead[],
  categories: CategoryRead[],
  accounts: AccountWithBalance[],
  filename?: string,
) {
  const columns = buildColumns(categories, accounts);
  const headers = columns.map((c) => c.header);
  const rows = buildRows(data, columns);

  const csvRows = [headers, ...rows].map((row) =>
    row
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );

  const csv = "﻿" + csvRows.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const name = filename || `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  saveAs(blob, name);
}

/** Export transactions to Excel (.xlsx) */
export function exportToXLSX(
  data: TransactionRead[],
  categories: CategoryRead[],
  accounts: AccountWithBalance[],
  filename?: string,
) {
  const columns = buildColumns(categories, accounts);
  const headers = columns.map((c) => c.header);
  const rows = buildRows(data, columns);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Auto-size columns
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map((r) => String(r[i]).length),
    );
    return { wch: Math.min(maxLen + 2, 30) };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "交易记录");

  const name = filename || `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, name);
}
