import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import {
  Table2,
  Download,
  FileSpreadsheet,
  FileText,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  X,
  ChevronDown,
  Plus,
  Keyboard,
} from "lucide-react";
import {
  useTransactions,
  type TransactionRead,
  type TransactionFilters,
} from "@/entities/transaction";
import { useAccounts } from "@/entities/account";
import { useCategories } from "@/entities/category";
import { useUpdateTransaction } from "@/features/update-transaction";
import { useDeleteTransaction } from "@/features/delete-transaction";
import { useCreateTransaction } from "@/features/create-transaction";
import { AppLayout } from "@/widgets/app-layout";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Input } from "@/shared/ui/input";
import { Skeleton } from "@/shared/ui/skeleton";
import { ease } from "@/shared/lib/animations";
import { formatCurrency } from "@/shared/lib/format";
import { exportToCSV, exportToXLSX } from "@/shared/lib/export";
import { api } from "@/shared/api/client";
import {
  EditTextCell,
  EditNumberCell,
  EditDateCell,
  EditSelectCell,
  DisplayCell,
  buildUpdatePayload,
  typeOptions,
  categoryOptions,
  accountOptions,
  type NavigateDirection,
} from "@/widgets/spreadsheet/EditableCells";

const TYPE_LABELS: Record<string, string> = {
  expense: "支出",
  income: "收入",
  transfer: "转账",
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  expense: <ArrowDownRight className="size-3 text-red-500" />,
  income: <ArrowUpRight className="size-3 text-emerald-500" />,
  transfer: <ArrowLeftRight className="size-3 text-blue-500" />,
};

const TYPE_COLORS: Record<string, string> = {
  expense: "text-red-500",
  income: "text-emerald-500",
  transfer: "text-blue-500",
};

// Editable column ids (excluding row# and actions)
const EDITABLE_COLS = [
  "date",
  "name",
  "amount",
  "type",
  "category_id",
  "account_id",
  "to_account_id",
  "tags",
  "description",
] as const;

// Quick-add row default values
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface QuickAddDraft {
  date: string;
  name: string;
  amount: string;
  type: "expense" | "income" | "transfer";
  category_id: string;
  account_id: string;
  to_account_id: string;
  tags: string;
  description: string;
}

function emptyQuickAdd(categories: { id: number }[], accounts: { id: number }[]): QuickAddDraft {
  return {
    date: todayStr(),
    name: "",
    amount: "",
    type: "expense",
    category_id: categories[0] ? String(categories[0].id) : "",
    account_id: accounts[0] ? String(accounts[0].id) : "",
    to_account_id: "",
    tags: "",
    description: "",
  };
}

export default function SpreadsheetPage() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    columnId: string;
  } | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ── Focused cell (keyboard navigation) ────────────────────────────────────
  // rowIndex: -1 = quick-add row, 0..n = data rows
  // colIndex: 0 = row#, 1 = date, 2 = name, ... (maps to EDITABLE_COLS[colIndex-1])
  const [focusedCell, setFocusedCell] = useState<{
    rowIndex: number;
    colIndex: number;
  } | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ── Jump-to-row command ───────────────────────────────────────────────────
  const [jumpBuffer, setJumpBuffer] = useState("");
  const [jumpFlash, setJumpFlash] = useState<number | null>(null);

  // ── Quick-add row ─────────────────────────────────────────────────────────
  const [quickAddEditing, setQuickAddEditing] = useState<string | null>(null);

  const {
    data: paginatedData,
    isLoading,
    isError,
  } = useTransactions({ ...filters, limit: pageSize, offset: page * pageSize });
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const createMutation = useCreateTransaction();

  const transactions = paginatedData?.items || [];
  const total = paginatedData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const catOpts = useMemo(() => categoryOptions(categories || []), [categories]);
  const accOpts = useMemo(() => accountOptions(accounts || []), [accounts]);

  const [quickAdd, setQuickAdd] = useState<QuickAddDraft>(
    emptyQuickAdd(categories || [], accounts || []),
  );

  // Reset quick-add when categories/accounts load
  useEffect(() => {
    if (categories?.length && accounts?.length) {
      setQuickAdd((prev) => {
        if (prev.category_id && prev.account_id) return prev;
        return { ...prev, category_id: String(categories[0].id), account_id: String(accounts[0].id) };
      });
    }
  }, [categories, accounts]);

  // ── Column count (for navigation bounds) ──────────────────────────────────
  const totalCols = 1 + EDITABLE_COLS.length + 1; // row# + editable cols + actions

  // ── Inline edit handlers ─────────────────────────────────────────────────
  // Flag to suppress cancelEdit clearing focusedCell during navigation
  const navigatingRef = useRef(false);

  function startEdit(rowId: number, columnId: string) {
    setEditingCell({ rowId, columnId });
  }

  function cancelEdit() {
    setEditingCell(null);
    if (!navigatingRef.current) {
      setFocusedCell(null);
    }
  }

  function saveEdit(rowId: number, columnId: string, value: string) {
    const transaction = transactions.find((t) => t.id === rowId);
    if (!transaction) return;

    const payload = buildUpdatePayload(columnId, value);
    if (!payload) {
      cancelEdit();
      return;
    }

    updateMutation.mutate(
      { id: rowId, body: payload },
      { onSuccess: () => cancelEdit() },
    );
  }

  function handleDelete(id: number) {
    deleteMutation.mutate(id);
  }

  // ── Navigation from edit cells ───────────────────────────────────────────
  const handleNavigate = useCallback(
    (rowIndex: number, colIndex: number, dir: NavigateDirection) => {
      navigatingRef.current = true;
      setEditingCell(null);
      let newRow = rowIndex;
      let newCol = colIndex;
      const numRows = transactions.length;
      if (dir === "up") {
        if (rowIndex === -1) {
          // quick-add row: move to previous column
          newCol = Math.max(1, colIndex - 1);
        } else if (rowIndex === 0) {
          newRow = -1; // wrap to quick-add
        } else {
          newRow = rowIndex - 1;
        }
      }
      if (dir === "down" || dir === "commit-down") {
        if (rowIndex === -1) {
          // quick-add row: move to next column (stay on quick-add)
          if (colIndex < totalCols - 2) {
            newCol = colIndex + 1;
          } else {
            // last column → wrap to first data row
            newRow = numRows > 0 ? 0 : -1;
            newCol = 1;
          }
        } else if (rowIndex >= numRows - 1) {
          newRow = -1; // wrap to quick-add
        } else {
          newRow = rowIndex + 1;
        }
      }
      if (dir === "left") {
        newCol = Math.max(1, colIndex - 1);
      }
      if (dir === "right" || dir === "commit-right") {
        newCol = Math.min(totalCols - 2, colIndex + 1);
      }
      setFocusedCell({ rowIndex: newRow, colIndex: newCol });
      // Reset flag after state updates are batched
      setTimeout(() => { navigatingRef.current = false; }, 0);
    },
    [transactions.length, totalCols],
  );

  // ── Ref for saveQuickAdd (used by keyboard handler) ──────────────────────
  const saveQuickAddRef = useRef<() => void>(() => {});

  // ── Quick-add save ───────────────────────────────────────────────────────
  function saveQuickAdd() {
    const amount = parseFloat(quickAdd.amount);
    if (isNaN(amount) || amount <= 0) return;
    const category_id = parseInt(quickAdd.category_id, 10);
    const account_id = parseInt(quickAdd.account_id, 10);
    if (isNaN(category_id) || isNaN(account_id)) return;

    createMutation.mutate(
      {
        amount,
        type: quickAdd.type,
        category_id,
        account_id,
        date: quickAdd.date,
        name: quickAdd.name.trim() || undefined,
        description: quickAdd.description.trim() || undefined,
        tags: quickAdd.tags.trim() || undefined,
        to_account_id: quickAdd.to_account_id ? parseInt(quickAdd.to_account_id, 10) : undefined,
      },
      {
        onSuccess: () => {
          setQuickAdd(emptyQuickAdd(categories || [], accounts || []));
          setQuickAddEditing(null);
        },
      },
    );
  }

  // Keep saveQuickAddRef in sync
  useEffect(() => {
    saveQuickAddRef.current = saveQuickAdd;
  });

  // ── Refs for stable keyboard handler ──────────────────────────────────────
  const stateRef = useRef({
    focusedCell: focusedCell as { rowIndex: number; colIndex: number } | null,
    editingCell: editingCell as { rowId: number; columnId: string } | null,
    jumpBuffer: jumpBuffer,
    transactions: transactions,
    totalCols: totalCols,
    pageSize: pageSize,
    total: total,
  });

  // Keep refs in sync
  useEffect(() => {
    stateRef.current = {
      focusedCell, editingCell, jumpBuffer, transactions, totalCols, pageSize, total,
    };
  });

  // ── Stable jump-to-row using ref ──────────────────────────────────────────
  const jumpToRowRef = useRef<(rowNum: number) => void>(() => {});
  jumpToRowRef.current = (rowNum: number) => {
    const { total: t, pageSize: ps } = stateRef.current;
    if (rowNum < 1 || rowNum > t) return;
    const targetPage = Math.floor((rowNum - 1) / ps);
    const targetRowIndex = (rowNum - 1) % ps;
    setPage(targetPage);
    setFocusedCell({ rowIndex: targetRowIndex, colIndex: 1 });
    setJumpFlash(rowNum);
    setTimeout(() => setJumpFlash(null), 800);
  };

  // ── Global keyboard handler (registered once) ─────────────────────────────
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const {
        focusedCell: fc,
        editingCell: ec,
        jumpBuffer: jb,
        transactions: txns,
        totalCols: tc,
      } = stateRef.current;

      // ── Alt+E: focus table ─────────────────────────────────────────────
      if (e.altKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setFocusedCell({ rowIndex: 0, colIndex: 1 });
        setEditingCell(null);
        tableContainerRef.current?.focus();
        return;
      }

      // ── Alt+N: save quick-add record ──────────────────────────────────
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        saveQuickAddRef.current();
        return;
      }

      // ── Everything below: only when not in an input and not editing ────
      if (isInputFocused || ec) {
        // Clear jump buffer on any key while in input
        if (jb) setJumpBuffer("");
        return;
      }

      // ── : prefix for explicit jump command ─────────────────────────────
      if (e.key === ":" && !jb) {
        e.preventDefault();
        setJumpBuffer(":");
        return;
      }

      if (jb === ":" && e.key === "Enter") {
        e.preventDefault();
        setJumpBuffer("");
        return;
      }

      if (jb.startsWith(":")) {
        if (e.key === "Escape") {
          e.preventDefault();
          setJumpBuffer("");
          return;
        }
        if (/^\d$/.test(e.key)) {
          e.preventDefault();
          setJumpBuffer((prev) => prev + e.key);
          return;
        }
        if (e.key === "Enter") {
          e.preventDefault();
          const num = parseInt(jb.slice(1), 10);
          if (!isNaN(num)) jumpToRowRef.current(num);
          setJumpBuffer("");
          return;
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          setJumpBuffer((prev) => {
            const next = prev.slice(0, -1);
            return next === ":" ? "" : next;
          });
          return;
        }
        return;
      }

      // ── Direct number + G (vim style) ──────────────────────────────────
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        setJumpBuffer((prev) => prev + e.key);
        return;
      }
      if (e.key === "g" || e.key === "G") {
        if (jb && /^\d+$/.test(jb)) {
          e.preventDefault();
          jumpToRowRef.current(parseInt(jb, 10));
          setJumpBuffer("");
          return;
        }
      }

      // ── Arrow keys / navigation ────────────────────────────────────────
      if (fc) {
        const { rowIndex, colIndex } = fc;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          if (rowIndex === 0) {
            // First data row → wrap to quick-add row
            setFocusedCell({ rowIndex: -1, colIndex });
          } else if (rowIndex === -1) {
            // Quick-add row → wrap to last data row
            setFocusedCell({ rowIndex: txns.length > 0 ? txns.length - 1 : -1, colIndex });
          } else {
            setFocusedCell({ rowIndex: rowIndex - 1, colIndex });
          }
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (rowIndex === -1) {
            // Quick-add row → wrap to first data row
            setFocusedCell({ rowIndex: txns.length > 0 ? 0 : -1, colIndex });
          } else if (rowIndex >= txns.length - 1) {
            // Last data row → wrap to quick-add row
            setFocusedCell({ rowIndex: -1, colIndex });
          } else {
            setFocusedCell({ rowIndex: rowIndex + 1, colIndex });
          }
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setFocusedCell({ rowIndex, colIndex: Math.max(1, colIndex - 1) });
          return;
        }
        if (e.key === "ArrowRight" || e.key === "Tab") {
          e.preventDefault();
          if (e.key === "Tab" && e.shiftKey) {
            setFocusedCell({ rowIndex, colIndex: Math.max(1, colIndex - 1) });
          } else {
            setFocusedCell({ rowIndex, colIndex: Math.min(tc - 2, colIndex + 1) });
          }
          return;
        }
        if (e.key === "Enter" || e.key === "F2") {
          e.preventDefault();
          if (rowIndex === -1) {
            const colId = EDITABLE_COLS[colIndex - 1];
            if (colId) setQuickAddEditing(colId);
          } else {
            const colId = EDITABLE_COLS[colIndex - 1];
            if (colId && txns[rowIndex]) {
              startEdit(txns[rowIndex].id, colId);
            }
          }
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setFocusedCell(null);
          return;
        }
      }

      // ── Clear jump buffer on any other key ─────────────────────────────
      if (jb) {
        setJumpBuffer("");
      }
    }

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, []); // empty deps — registered once, reads from ref

  // ── Export handlers ──────────────────────────────────────────────────────
  const fetchAllTransactions = useCallback(
    async (currentFilters: TransactionFilters): Promise<TransactionRead[]> => {
      const allItems: TransactionRead[] = [];
      let offset = 0;
      const limit = 200;

      while (true) {
        const query: Record<string, string | number | undefined> = { limit, offset };
        if (currentFilters.type) query.type = currentFilters.type;
        if (currentFilters.account_id) query.account_id = currentFilters.account_id;
        if (currentFilters.category_id) query.category_id = currentFilters.category_id;
        if (currentFilters.date_from) query.date_from = currentFilters.date_from;
        if (currentFilters.date_to) query.date_to = currentFilters.date_to;
        if (currentFilters.search) query.search = currentFilters.search;
        if (currentFilters.tag) query.tag = currentFilters.tag;

        const { data, error } = await api.GET("/api/transactions", {
          params: { query },
        });

        if (error) throw error;
        if (!data) break;

        allItems.push(...data.items);
        if (allItems.length >= data.total) break;
        offset += limit;
      }

      return allItems;
    },
    [],
  );

  const handleExport = useCallback(
    async (format: "csv" | "xlsx") => {
      setIsExporting(true);
      setShowExportMenu(false);
      try {
        const allData = await fetchAllTransactions(filters);
        if (format === "csv") {
          exportToCSV(allData, categories || [], accounts || []);
        } else {
          exportToXLSX(allData, categories || [], accounts || []);
        }
      } catch (err) {
        console.error("Export failed:", err);
      } finally {
        setIsExporting(false);
      }
    },
    [filters, categories, accounts, fetchAllTransactions],
  );

  // ── Column definitions ───────────────────────────────────────────────────
  const columnHelper = createColumnHelper<TransactionRead>();

  const columns = useMemo(
    () => [
      // Row number column
      columnHelper.display({
        id: "rowNumber",
        header: "#",
        size: 48,
        cell: (info) => {
          const rowNum = page * pageSize + info.row.index + 1;
          const isFocused = focusedCell?.rowIndex === info.row.index && focusedCell?.colIndex === 0;
          const isFlashing = jumpFlash === rowNum;
          return (
            <div
              className={`text-center text-xs tabular-nums py-1 select-none ${
                isFocused ? "bg-primary/10 font-bold" : ""
              } ${isFlashing ? "bg-primary/20 animate-pulse" : ""} text-muted-foreground`}
            >
              {rowNum}
            </div>
          );
        },
      }),
      // Editable columns
      columnHelper.accessor("date", {
        header: "日期",
        size: 120,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "date";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 1;
          const val = info.getValue().slice(0, 10);

          if (isEditing) {
            return (
              <EditDateCell
                value={val}
                onSave={(v) => saveEdit(rowId, "date", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 1, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 1 }); startEdit(rowId, "date"); }}
              className="tabular-nums"
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("name", {
        header: "名称",
        size: 160,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "name";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 2;
          const val = info.getValue() || "";

          if (isEditing) {
            return (
              <EditTextCell
                value={val}
                onSave={(v) => saveEdit(rowId, "name", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 2, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 2 }); startEdit(rowId, "name"); }}
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("amount", {
        header: "金额",
        size: 120,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "amount";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 3;
          const val = String(info.getValue());
          const type = info.row.original.type;

          if (isEditing) {
            return (
              <EditNumberCell
                value={val}
                onSave={(v) => saveEdit(rowId, "amount", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 3, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              displayValue={
                <span className={`font-medium tabular-nums ${TYPE_COLORS[type]}`}>
                  {TYPE_ICONS[type]} {formatCurrency(info.getValue())}
                </span>
              }
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 3 }); startEdit(rowId, "amount"); }}
              align="right"
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("type", {
        header: "类型",
        size: 90,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "type";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 4;
          const val = info.getValue();

          if (isEditing) {
            return (
              <EditSelectCell
                value={val}
                options={typeOptions()}
                onSave={(v) => saveEdit(rowId, "type", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 4, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              displayValue={
                <Badge variant="secondary" className={`text-xs ${TYPE_COLORS[val]}`}>
                  {TYPE_ICONS[val]} {TYPE_LABELS[val]}
                </Badge>
              }
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 4 }); startEdit(rowId, "type"); }}
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("category_id", {
        header: "分类",
        size: 130,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "category_id";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 5;
          const cat = categories?.find((c) => c.id === info.getValue());
          const val = String(info.getValue());

          if (isEditing) {
            return (
              <EditSelectCell
                value={val}
                options={catOpts}
                onSave={(v) => saveEdit(rowId, "category_id", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 5, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              displayValue={
                <span className="text-sm">
                  {cat?.icon ? `${cat.icon} ` : ""}
                  {cat?.name || "-"}
                </span>
              }
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 5 }); startEdit(rowId, "category_id"); }}
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("account_id", {
        header: "账户",
        size: 120,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "account_id";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 6;
          const acc = accounts?.find((a) => a.id === info.getValue());
          const val = String(info.getValue());

          if (isEditing) {
            return (
              <EditSelectCell
                value={val}
                options={accOpts}
                onSave={(v) => saveEdit(rowId, "account_id", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 6, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              displayValue={
                <span className="text-sm">
                  {acc?.icon ? `${acc.icon} ` : ""}
                  {acc?.name || "-"}
                </span>
              }
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 6 }); startEdit(rowId, "account_id"); }}
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("to_account_id", {
        header: "目标账户",
        size: 120,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "to_account_id";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 7;
          const val = info.getValue() ? String(info.getValue()) : "";
          const acc = info.getValue() ? accounts?.find((a) => a.id === info.getValue()) : null;

          if (isEditing) {
            return (
              <EditSelectCell
                value={val}
                options={[{ value: "", label: "-" }, ...accOpts]}
                onSave={(v) => saveEdit(rowId, "to_account_id", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 7, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              displayValue={
                <span className="text-sm">
                  {acc ? `${acc.icon ? `${acc.icon} ` : ""}${acc.name}` : "-"}
                </span>
              }
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 7 }); startEdit(rowId, "to_account_id"); }}
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("tags", {
        header: "标签",
        size: 120,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "tags";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 8;
          const val = info.getValue() || "";

          if (isEditing) {
            return (
              <EditTextCell
                value={val}
                onSave={(v) => saveEdit(rowId, "tags", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 8, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              displayValue={
                val ? (
                  <div className="flex gap-1 flex-wrap">
                    {val.split(",").map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-muted-foreground italic">-</span>
                )
              }
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 8 }); startEdit(rowId, "tags"); }}
              focused={isFocused}
            />
          );
        },
      }),
      columnHelper.accessor("description", {
        header: "备注",
        size: 160,
        cell: (info) => {
          const ri = info.row.index;
          const rowId = info.row.original.id;
          const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === "description";
          const isFocused = focusedCell?.rowIndex === ri && focusedCell?.colIndex === 9;
          const val = info.getValue() || "";

          if (isEditing) {
            return (
              <EditTextCell
                value={val}
                onSave={(v) => saveEdit(rowId, "description", v)}
                onCancel={cancelEdit}
                onNavigate={(dir) => handleNavigate(ri, 9, dir)}
                disabled={updateMutation.isPending}
              />
            );
          }
          return (
            <DisplayCell
              value={val}
              onEdit={() => { setFocusedCell({ rowIndex: ri, colIndex: 9 }); startEdit(rowId, "description"); }}
              focused={isFocused}
            />
          );
        },
      }),
      // Actions column
      columnHelper.display({
        id: "actions",
        header: "",
        size: 50,
        cell: (info) => (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-60 hover:opacity-100 hover:text-destructive"
            onClick={() => handleDelete(info.row.original.id)}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="size-3.5" />
          </Button>
        ),
      }),
    ],
    [
      editingCell,
      focusedCell,
      categories,
      accounts,
      catOpts,
      accOpts,
      page,
      pageSize,
      jumpFlash,
      updateMutation.isPending,
      deleteMutation.isPending,
    ],
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  // ── Quick-add row renderer ───────────────────────────────────────────────
  function renderQuickAddRow() {
    if (!categories?.length || !accounts?.length) return null;

    function qaCell(colId: string, colIndex: number) {
      const isFocused = focusedCell?.rowIndex === -1 && focusedCell?.colIndex === colIndex;
      const isEditing = quickAddEditing === colId;

      const commonProps = {
        onCancel: () => setQuickAddEditing(null),
        onNavigate: (dir: NavigateDirection) => {
          setQuickAddEditing(null);
          let newRow = -1;
          let newCol = colIndex;
          if (dir === "down" || dir === "commit-down") {
            // On quick-add row: move to next column
            if (colIndex < totalCols - 2) {
              newCol = colIndex + 1;
            } else {
              // last column → wrap to first data row
              newRow = transactions.length > 0 ? 0 : -1;
              newCol = 1;
            }
          }
          if (dir === "up") {
            // On quick-add row: move to previous column
            newCol = Math.max(1, colIndex - 1);
          }
          if (dir === "left") newCol = Math.max(1, colIndex - 1);
          if (dir === "right" || dir === "commit-right") newCol = Math.min(totalCols - 2, colIndex + 1);
          setFocusedCell({ rowIndex: newRow, colIndex: newCol });
        },
        disabled: createMutation.isPending,
      };

      switch (colId) {
        case "date":
          if (isEditing) return <EditDateCell value={quickAdd.date} onSave={(v) => setQuickAdd({ ...quickAdd, date: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.date} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} className="tabular-nums" />;
        case "name":
          if (isEditing) return <EditTextCell value={quickAdd.name} onSave={(v) => setQuickAdd({ ...quickAdd, name: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.name} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        case "amount":
          if (isEditing) return <EditNumberCell value={quickAdd.amount} onSave={(v) => { setQuickAdd({ ...quickAdd, amount: v }); setQuickAddEditing(null); }} {...commonProps} />;
          return <DisplayCell value={quickAdd.amount} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} align="right" />;
        case "type":
          if (isEditing) return <EditSelectCell value={quickAdd.type} options={typeOptions()} onSave={(v) => setQuickAdd({ ...quickAdd, type: v as QuickAddDraft["type"] })} {...commonProps} />;
          return <DisplayCell value={quickAdd.type} displayValue={<Badge variant="secondary" className={`text-xs ${TYPE_COLORS[quickAdd.type]}`}>{TYPE_LABELS[quickAdd.type]}</Badge>} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        case "category_id":
          if (isEditing) return <EditSelectCell value={quickAdd.category_id} options={catOpts} onSave={(v) => setQuickAdd({ ...quickAdd, category_id: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.category_id} displayValue={<span className="text-sm">{categories?.find((c) => String(c.id) === quickAdd.category_id)?.name || "-"}</span>} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        case "account_id":
          if (isEditing) return <EditSelectCell value={quickAdd.account_id} options={accOpts} onSave={(v) => setQuickAdd({ ...quickAdd, account_id: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.account_id} displayValue={<span className="text-sm">{accounts?.find((a) => String(a.id) === quickAdd.account_id)?.name || "-"}</span>} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        case "to_account_id":
          if (isEditing) return <EditSelectCell value={quickAdd.to_account_id} options={[{ value: "", label: "-" }, ...accOpts]} onSave={(v) => setQuickAdd({ ...quickAdd, to_account_id: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.to_account_id} displayValue={<span className="text-sm">{quickAdd.to_account_id ? accounts?.find((a) => String(a.id) === quickAdd.to_account_id)?.name : "-"}</span>} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        case "tags":
          if (isEditing) return <EditTextCell value={quickAdd.tags} onSave={(v) => setQuickAdd({ ...quickAdd, tags: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.tags} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        case "description":
          if (isEditing) return <EditTextCell value={quickAdd.description} onSave={(v) => setQuickAdd({ ...quickAdd, description: v })} {...commonProps} />;
          return <DisplayCell value={quickAdd.description} focused={isFocused} onEdit={() => { setFocusedCell({ rowIndex: -1, colIndex }); setQuickAddEditing(colId); }} />;
        default:
          return null;
      }
    }

    return (
      <TableRow className="bg-primary/[0.03] border-t-2 border-dashed border-primary/20">
        {/* Row # */}
        <TableCell className="h-10 p-0 w-12">
          <div className="text-center text-xs py-1 text-muted-foreground">
            <Plus className="size-3 inline" />
          </div>
        </TableCell>
        {/* date */}
        <TableCell className="h-10 p-0" style={{ width: 120 }}>{qaCell("date", 1)}</TableCell>
        {/* name */}
        <TableCell className="h-10 p-0" style={{ width: 160 }}>{qaCell("name", 2)}</TableCell>
        {/* amount */}
        <TableCell className="h-10 p-0" style={{ width: 120 }}>{qaCell("amount", 3)}</TableCell>
        {/* type */}
        <TableCell className="h-10 p-0" style={{ width: 90 }}>{qaCell("type", 4)}</TableCell>
        {/* category */}
        <TableCell className="h-10 p-0" style={{ width: 130 }}>{qaCell("category_id", 5)}</TableCell>
        {/* account */}
        <TableCell className="h-10 p-0" style={{ width: 120 }}>{qaCell("account_id", 6)}</TableCell>
        {/* to_account */}
        <TableCell className="h-10 p-0" style={{ width: 120 }}>{qaCell("to_account_id", 7)}</TableCell>
        {/* tags */}
        <TableCell className="h-10 p-0" style={{ width: 120 }}>{qaCell("tags", 8)}</TableCell>
        {/* description */}
        <TableCell className="h-10 p-0" style={{ width: 160 }}>{qaCell("description", 9)}</TableCell>
        {/* actions: save button */}
        <TableCell className="h-10 p-0" style={{ width: 50 }}>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-primary hover:text-primary"
            onClick={saveQuickAdd}
            disabled={createMutation.isPending || !quickAdd.amount || parseFloat(quickAdd.amount) <= 0}
            title="保存新记录"
          >
            <Plus className="size-4" />
          </Button>
        </TableCell>
      </TableRow>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </div>
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (isError) {
    return (
      <AppLayout>
        <div className="max-w-[1400px] mx-auto">
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="text-destructive font-medium">加载交易数据失败</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ease}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Table2 className="size-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">电子表格</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                  快速编辑交易记录，支持导出
                  <span className="inline-flex items-center gap-1 text-xs bg-muted rounded px-1.5 py-0.5">
                    <Keyboard className="size-3" />
                    Alt+E 编辑
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted rounded px-1.5 py-0.5">
                    <Keyboard className="size-3" />
                    Alt+N 保存
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-muted rounded px-1.5 py-0.5">
                    <Keyboard className="size-3" />
                    42G 跳转
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="w-fit">
                {total} 条记录
              </Badge>

              {/* Export dropdown */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  disabled={isExporting}
                >
                  <Download className="size-3" data-icon="inline-start" />
                  {isExporting ? "导出中..." : "导出"}
                  <ChevronDown className="size-3" data-icon="inline-end" />
                </Button>
                {showExportMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                    <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border bg-popover p-1 shadow-lg">
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        onClick={() => handleExport("csv")}
                      >
                        <FileText className="size-4 text-emerald-500" />
                        导出 CSV
                      </button>
                      <button
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent"
                        onClick={() => handleExport("xlsx")}
                      >
                        <FileSpreadsheet className="size-4 text-blue-500" />
                        导出 Excel
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ...ease }}
          className="mb-4"
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <Button variant={!filters.type ? "default" : "outline"} size="sm" onClick={() => { setFilters({ ...filters, type: undefined }); setPage(0); }}>全部</Button>
              <Button variant={filters.type === "expense" ? "default" : "outline"} size="sm" onClick={() => { setFilters({ ...filters, type: "expense" }); setPage(0); }}>
                <ArrowDownRight className="size-3" data-icon="inline-start" />支出
              </Button>
              <Button variant={filters.type === "income" ? "default" : "outline"} size="sm" onClick={() => { setFilters({ ...filters, type: "income" }); setPage(0); }}>
                <ArrowUpRight className="size-3" data-icon="inline-start" />收入
              </Button>
              <Button variant={filters.type === "transfer" ? "default" : "outline"} size="sm" onClick={() => { setFilters({ ...filters, type: "transfer" }); setPage(0); }}>
                <ArrowLeftRight className="size-3" data-icon="inline-start" />转账
              </Button>
            </div>

            <select value={filters.account_id || ""} onChange={(e) => { setFilters({ ...filters, account_id: e.target.value ? Number(e.target.value) : undefined }); setPage(0); }} className="h-8 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">所有账户</option>
              {accounts?.map((a) => <option key={a.id} value={a.id}>{a.icon ? `${a.icon} ` : ""}{a.name}</option>)}
            </select>

            <select value={filters.category_id || ""} onChange={(e) => { setFilters({ ...filters, category_id: e.target.value ? Number(e.target.value) : undefined }); setPage(0); }} className="h-8 rounded-md border border-input bg-background px-3 text-sm">
              <option value="">所有分类</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ""}{c.name}</option>)}
            </select>

            <div className="flex items-center gap-1">
              <Input type="date" value={filters.date_from || ""} onChange={(e) => { setFilters({ ...filters, date_from: e.target.value || undefined }); setPage(0); }} className="h-8 w-36" placeholder="开始日期" />
              <span className="text-muted-foreground">-</span>
              <Input type="date" value={filters.date_to || ""} onChange={(e) => { setFilters({ ...filters, date_to: e.target.value || undefined }); setPage(0); }} className="h-8 w-36" placeholder="结束日期" />
            </div>

            {(filters.type || filters.account_id || filters.category_id || filters.date_from || filters.date_to) && (
              <Button variant="ghost" size="sm" onClick={() => { setFilters({}); setPage(0); }}>
                <X className="size-3" data-icon="inline-start" />清除筛选
              </Button>
            )}
          </div>
        </motion.div>

        {/* ── Jump command indicator ───────────────────────────────────────── */}
        {jumpBuffer && (
          <div className="fixed bottom-4 right-4 z-50 bg-popover border rounded-lg px-4 py-2 shadow-lg font-mono text-sm">
            {jumpBuffer}
            <span className="animate-pulse">│</span>
          </div>
        )}

        {/* ── Data Table ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ...ease }}
          className="rounded-xl border bg-card overflow-hidden"
          ref={tableContainerRef}
          tabIndex={-1}
        >
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="bg-muted/50 font-semibold text-xs uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length === 0 && !quickAdd ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    暂无交易记录
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {table.getRowModel().rows.map((row) => {
                    const rowNum = page * pageSize + row.index + 1;
                    const isFlashing = jumpFlash === rowNum;
                    return (
                      <TableRow
                        key={row.id}
                        className={`group ${isFlashing ? "bg-primary/10 animate-pulse" : ""}`}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="h-10 p-0" style={{ width: cell.column.getSize() }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                  {/* Quick-add row */}
                  {renderQuickAddRow()}
                </>
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ...ease }}
          className="flex items-center justify-between mt-4"
        >
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              第 {page + 1} / {totalPages || 1} 页，共 {total} 条
            </p>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={20}>20 条/页</option>
              <option value={50}>50 条/页</option>
              <option value={100}>100 条/页</option>
              <option value={200}>200 条/页</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(0)} disabled={page === 0}>首页</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>上一页</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>下一页</Button>
            <Button variant="outline" size="sm" onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1}>末页</Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
