import { useState, useRef, useEffect } from "react";
import {
  type TransactionUpdateValues,
  TYPE_OPTIONS,
  type SelectOption,
} from "@/entities/transaction";
import type { CategoryRead } from "@/entities/category";
import type { AccountWithBalance } from "@/entities/account";

export type NavigateDirection = "up" | "down" | "left" | "right" | "commit-down" | "commit-right";

interface CellProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  onNavigate?: (dir: NavigateDirection) => void;
  disabled?: boolean;
}

// ── Text cell ────────────────────────────────────────────────────────────────
export function EditTextCell({ value, onSave, onCancel, onNavigate, disabled }: CellProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function commit(): boolean {
    if (committedRef.current) return false;
    committedRef.current = true;
    if (draft !== value) {
      onSave(draft);
      return true;
    }
    onCancel();
    return false;
  }

  return (
    <input
      ref={ref}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          onNavigate?.(e.shiftKey ? "up" : "down");
        }
        if (e.key === "Escape") { e.preventDefault(); committedRef.current = true; onCancel(); }
        if (e.key === "Tab") {
          e.preventDefault();
          commit();
          onNavigate?.(e.shiftKey ? "left" : "right");
        }
      }}
      disabled={disabled}
      className="h-full w-full bg-transparent px-2 py-1 text-sm outline-none border border-primary/40 rounded-sm focus:border-primary"
    />
  );
}

// ── Number cell ──────────────────────────────────────────────────────────────
export function EditNumberCell({ value, onSave, onCancel, onNavigate, disabled }: CellProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  function commit(): boolean {
    if (committedRef.current) return false;
    const num = parseFloat(draft);
    if (!isNaN(num) && num > 0 && draft !== value) {
      committedRef.current = true;
      onSave(draft);
      return true;
    }
    committedRef.current = true;
    onCancel();
    return false;
  }

  return (
    <input
      ref={ref}
      type="number"
      step="0.01"
      min="0.01"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const ok = commit();
          if (ok) onNavigate?.(e.shiftKey ? "up" : "down");
        }
        if (e.key === "Escape") { e.preventDefault(); committedRef.current = true; onCancel(); }
        if (e.key === "Tab") {
          e.preventDefault();
          const ok = commit();
          if (ok) onNavigate?.(e.shiftKey ? "left" : "right");
        }
      }}
      disabled={disabled}
      className="h-full w-full bg-transparent px-2 py-1 text-sm outline-none border border-primary/40 rounded-sm focus:border-primary tabular-nums"
    />
  );
}

// ── Date cell ────────────────────────────────────────────────────────────────
export function EditDateCell({ value, onSave, onCancel, onNavigate, disabled }: CellProps) {
  const [draft, setDraft] = useState(value.slice(0, 10));
  const ref = useRef<HTMLInputElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    ref.current?.focus();
    try { ref.current?.showPicker?.(); } catch { /* noop */ }
  }, []);

  function commit(): boolean {
    if (committedRef.current) return false;
    committedRef.current = true;
    if (draft && draft !== value.slice(0, 10)) {
      onSave(draft);
      return true;
    }
    onCancel();
    return false;
  }

  return (
    <input
      ref={ref}
      type="date"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          onNavigate?.(e.shiftKey ? "up" : "down");
        }
        if (e.key === "Escape") { e.preventDefault(); committedRef.current = true; onCancel(); }
        if (e.key === "Tab") {
          e.preventDefault();
          commit();
          onNavigate?.(e.shiftKey ? "left" : "right");
        }
      }}
      disabled={disabled}
      className="h-full w-full bg-transparent px-2 py-1 text-sm outline-none border border-primary/40 rounded-sm focus:border-primary"
    />
  );
}

// ── Select cell (for enum / FK fields) ───────────────────────────────────────
interface EditSelectCellProps extends Omit<CellProps, "value"> {
  value: string;
  options: SelectOption[];
}

export function EditSelectCell({
  value,
  onSave,
  onCancel,
  onNavigate,
  options,
  disabled,
}: EditSelectCellProps) {
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLSelectElement>(null);
  const committedRef = useRef(false);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  function commit() {
    if (committedRef.current) return;
    committedRef.current = true;
    if (draft !== value) onSave(draft);
    else onCancel();
  }

  return (
    <select
      ref={ref}
      value={draft}
      onChange={(e) => {
        if (committedRef.current) return;
        committedRef.current = true;
        setDraft(e.target.value);
        if (e.target.value !== value) {
          onSave(e.target.value);
        } else {
          onCancel();
        }
      }}
      onBlur={() => commit()}
      onKeyDown={(e) => {
        if (e.key === "Escape") { e.preventDefault(); committedRef.current = true; onCancel(); }
        if (e.key === "Tab") {
          e.preventDefault();
          commit();
          onNavigate?.(e.shiftKey ? "left" : "right");
        }
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
          onNavigate?.(e.shiftKey ? "up" : "down");
        }
      }}
      disabled={disabled}
      className="h-full w-full bg-transparent px-2 py-1 text-sm outline-none border border-primary/40 rounded-sm focus:border-primary"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Display cell (click to edit) ─────────────────────────────────────────────
interface DisplayCellProps {
  value: string;
  displayValue?: React.ReactNode;
  className?: string;
  onEdit: () => void;
  align?: "left" | "right" | "center";
  focused?: boolean;
}

export function DisplayCell({
  value,
  displayValue,
  className = "",
  onEdit,
  align = "left",
  focused = false,
}: DisplayCellProps) {
  const alignClass =
    align === "right"
      ? "text-right justify-end"
      : align === "center"
        ? "text-center justify-center"
        : "";

  return (
    <div
      onClick={onEdit}
      className={`flex items-center h-full w-full cursor-pointer px-2 py-1 rounded-sm transition-colors hover:bg-muted/60 min-h-[32px] ${alignClass} ${focused ? "ring-2 ring-primary ring-inset bg-primary/5" : ""} ${className}`}
    >
      {displayValue ?? (value || <span className="text-muted-foreground italic">-</span>)}
    </div>
  );
}

// ── Helper: build update payload from column + value ─────────────────────────
export function buildUpdatePayload(
  columnId: string,
  rawValue: string,
): TransactionUpdateValues | null {
  switch (columnId) {
    case "name":
      return { name: rawValue.trim() || undefined };
    case "amount": {
      const amount = parseFloat(rawValue);
      if (isNaN(amount) || amount <= 0) return null;
      return { amount };
    }
    case "type":
      return { type: rawValue as "expense" | "income" | "transfer" };
    case "category_id": {
      const id = parseInt(rawValue, 10);
      if (isNaN(id) || id < 1) return null;
      return { category_id: id };
    }
    case "account_id": {
      const id = parseInt(rawValue, 10);
      if (isNaN(id) || id < 1) return null;
      return { account_id: id };
    }
    case "to_account_id": {
      if (!rawValue) return { to_account_id: undefined };
      const id = parseInt(rawValue, 10);
      if (isNaN(id) || id < 1) return null;
      return { to_account_id: id };
    }
    case "date":
      return { date: rawValue };
    case "description":
      return { description: rawValue.trim() || undefined };
    case "tags":
      return { tags: rawValue.trim() || undefined };
    default:
      return null;
  }
}

// ── Option builders ──────────────────────────────────────────────────────────
export { TYPE_OPTIONS, type SelectOption };

export function categoryOptions(categories: CategoryRead[]): SelectOption[] {
  return categories.map((c) => ({
    value: String(c.id),
    label: c.icon ? `${c.icon} ${c.name}` : c.name,
  }));
}

export function accountOptions(accounts: AccountWithBalance[]): SelectOption[] {
  return accounts.map((a) => ({
    value: String(a.id),
    label: a.icon ? `${a.icon} ${a.name}` : a.name,
  }));
}
