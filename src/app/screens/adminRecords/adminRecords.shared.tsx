// Extensions5.tsx — Configuration-Driven Administration Management
// Shared management shell + per-module list pages for configuration modules.

import React, { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Edit,
  Copy,
  Archive,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  X,
  ChevronUp,
  MoreHorizontal,
  GitBranch,
  Layers,
  BookOpen,
  Award,
  Zap,
  Target,
  MessageSquare,
  FileText,
  Shield,
  UserCheck,
  TrendingUp,
  HelpCircle,
  BarChart2,
  LayoutDashboard,
  Users,
  RefreshCw,
  Download,
  Eye,
  Calendar,
} from "lucide-react";

const P = {
  olive: "#047857",
  darkOlive: "#065F46",
  deepOlive: "#064E3B",
  sage: "#6EE7B7",
  lightSage: "#D1FAE5",
  paleGreen: "#ECFDF5",
  gold: "#C8A85D",
  goldLight: "#FDF5E0",
  goldMid: "#F0E2B8",
  bg: "#F6FEFA",
  text: "#052E26",
  textMid: "#047857",
  textMuted: "#4B7468",
  border: "#A7F3D0",
};

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#D8EDCC", color: "#3A6420" },
    Archived: { bg: P.paleGreen, color: P.textMuted },
    Retired: { bg: "#F1F5F9", color: "#64748B" },
    Draft: { bg: P.goldLight, color: "#8A6A1A" },
    Disabled: { bg: "#FEE2E2", color: "#B91C1C" },
    Enabled: { bg: "#D8EDCC", color: "#3A6420" },
    Published: { bg: "#D8EDCC", color: "#3A6420" },
  };
  const s = map[status] ?? { bg: P.lightSage, color: P.darkOlive };
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

// ─── Confirm dialog ───────────────────────────────────────────

function Confirm({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(46,58,21,0.6)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl border p-6 max-w-sm w-full shadow-xl"
        style={{ borderColor: P.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm font-semibold mb-1.5" style={{ color: P.text }}>
          Confirm Action
        </p>
        <p className="text-xs leading-relaxed mb-5" style={{ color: P.textMid }}>
          {message}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg text-xs font-medium"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: "#C0392B" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Generic Management Shell ─────────────────────────────────

export type CrudRow = { id: string; name: string; status: string; [key: string]: unknown };

export type CrudColumn<T extends CrudRow> = {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type CrudShellProps<T extends CrudRow> = {
  title: string;
  sub: string;
  icon: React.ElementType;
  columns: CrudColumn<T>[];
  rows: T[];
  onRows: (rows: T[]) => void;
  filterKeys?: string[];
  filterOptions?: { label: string; values: string[] };
  createLabel?: string;
  renderForm: (row: T | null, onSave: (r: T) => void, onClose: () => void) => React.ReactNode;
  cloneRow?: (row: T) => T;
  actions?: { label: string; icon: React.ElementType; onClick: (row: T) => void }[];
  duplicateLabel?: string;
  showArchive?: boolean;
  toggleStatus?: {
    enabled: string;
    disabled: string;
    enableLabel?: string;
    disableLabel?: string;
  };
  pageSize?: number;
};

export function CrudShell<T extends CrudRow>({
  title,
  sub,
  icon: Icon,
  columns,
  rows,
  onRows,
  filterOptions,
  createLabel = "Create",
  renderForm,
  cloneRow,
  actions = [],
  duplicateLabel = "Duplicate",
  showArchive = true,
  toggleStatus,
  pageSize = 8,
}: CrudShellProps<T>) {
  const [search, setSearch] = useState("");
  const [filterVal, setFilterVal] = useState("All");
  const [sortKey, setSortKey] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<T | null | "new">(null);
  const [confirming, setConfirming] = useState<{ msg: string; action: () => void } | null>(null);

  const filtered = useMemo(() => {
    let r = rows;
    if (search) r = r.filter((x) => x.name.toLowerCase().includes(search.toLowerCase()));
    if (filterVal !== "All") r = r.filter((x) => x.status === filterVal);
    r = [...r].sort((a, b) => {
      const av = String(a[sortKey] ?? ""),
        bv = String(b[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return r;
  }, [rows, search, filterVal, sortKey, sortDir]);

  const toggleSort = (key: string) => {
    setPage(1);
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const activePage = Math.min(page, totalPages);
  const pageStart = (activePage - 1) * pageSize;
  const pagedRows = filtered.slice(pageStart, pageStart + pageSize);
  const allChecked = pagedRows.length > 0 && pagedRows.every((r) => selected.has(r.id));
  const toggleAll = () =>
    setSelected((s) => {
      const next = new Set(s);
      if (allChecked) pagedRows.forEach((r) => next.delete(r.id));
      else pagedRows.forEach((r) => next.add(r.id));
      return next;
    });
  const toggleOne = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSave = (saved: T) => {
    onRows(
      rows.some((r) => r.id === saved.id)
        ? rows.map((r) => (r.id === saved.id ? saved : r))
        : [...rows, saved],
    );
    setEditing(null);
  };

  const archive = (id: string) =>
    onRows(rows.map((r) => (r.id === id ? ({ ...r, status: "Archived" } as T) : r)));
  const toggleRowStatus = (row: T) => {
    if (!toggleStatus) return;
    const nextStatus =
      row.status === toggleStatus.enabled ? toggleStatus.disabled : toggleStatus.enabled;
    onRows(rows.map((r) => (r.id === row.id ? ({ ...r, status: nextStatus } as T) : r)));
  };
  const del = (id: string) => onRows(rows.filter((r) => r.id !== id));
  const clone = (row: T) => {
    const cloned = cloneRow
      ? cloneRow(row)
      : ({
          ...row,
          id: `${row.id}-${Date.now()}`,
          name: `${row.name} (Copy)`,
          status: "Draft",
        } as T);
    onRows([...rows, cloned]);
  };

  const bulkArchive = () => {
    onRows(rows.map((r) => (selected.has(r.id) ? ({ ...r, status: "Archived" } as T) : r)));
    setSelected(new Set());
  };
  const bulkEnable = () => {
    if (!toggleStatus) return;
    onRows(
      rows.map((r) => (selected.has(r.id) ? ({ ...r, status: toggleStatus.enabled } as T) : r)),
    );
    setSelected(new Set());
  };
  const bulkDisable = () => {
    if (!toggleStatus) return;
    onRows(
      rows.map((r) => (selected.has(r.id) ? ({ ...r, status: toggleStatus.disabled } as T) : r)),
    );
    setSelected(new Set());
  };
  const bulkDelete = () => {
    onRows(rows.filter((r) => !selected.has(r.id)));
    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: P.lightSage }}
          >
            <Icon size={15} style={{ color: P.olive }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: P.text }}>
              {title}
            </p>
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              {sub}
            </p>
          </div>
        </div>
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: P.olive }}
        >
          <Plus size={13} /> {createLabel}
        </button>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: P.sage }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${title.toLowerCase()}…`}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
        </div>
        {filterOptions && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold" style={{ color: P.textMuted }}>
              Status:
            </span>
            {["All", ...filterOptions.values].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setFilterVal(v);
                  setPage(1);
                }}
                className="px-2.5 py-1.5 text-[10px] font-medium rounded-lg transition-colors"
                style={
                  filterVal === v
                    ? { background: P.olive, color: "white" }
                    : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
                }
              >
                {v}
              </button>
            ))}
          </div>
        )}
        <span className="text-[10px] ml-auto" style={{ color: P.textMuted }}>
          {filtered.length
            ? `${pageStart + 1}-${Math.min(pageStart + pagedRows.length, filtered.length)} of ${
                filtered.length
              }`
            : "0"}{" "}
          record{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: P.lightSage, border: `1px solid ${P.sage}` }}
        >
          <span className="text-xs font-semibold" style={{ color: P.darkOlive }}>
            {selected.size} selected
          </span>
          <div className="flex gap-2 ml-auto">
            {showArchive && (
              <button
                onClick={bulkArchive}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium"
                style={{ background: "white", border: `1px solid ${P.border}`, color: P.textMid }}
              >
                <Archive size={11} /> Archive
              </button>
            )}
            {toggleStatus && (
              <>
                <button
                  onClick={bulkEnable}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium"
                  style={{ background: "white", border: `1px solid ${P.border}`, color: P.textMid }}
                >
                  <CheckCircle size={11} /> {toggleStatus.enableLabel ?? "Enable"}
                </button>
                <button
                  onClick={bulkDisable}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium"
                  style={{ background: "white", border: `1px solid ${P.border}`, color: P.textMid }}
                >
                  <AlertCircle size={11} /> {toggleStatus.disableLabel ?? "Disable"}
                </button>
              </>
            )}
            <button
              onClick={() =>
                setConfirming({
                  msg: `Delete ${selected.size} selected item(s)?`,
                  action: bulkDelete,
                })
              }
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium"
              style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#B91C1C" }}
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
          <button onClick={() => setSelected(new Set())} style={{ color: P.textMuted }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th className="pl-4 py-2.5 w-8">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  style={{ accentColor: P.olive }}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="text-left px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: P.textMuted, cursor: col.sortable ? "pointer" : "default" }}
                  onClick={() => col.sortable && toggleSort(String(col.key))}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      sortKey === col.key &&
                      (sortDir === "asc" ? <ChevronUp size={9} /> : <ChevronDown size={9} />)}
                  </span>
                </th>
              ))}
              <th
                className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: P.textMuted }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="text-center py-10 text-xs"
                  style={{ color: P.textMuted }}
                >
                  No records found.{" "}
                  <button
                    onClick={() => setEditing("new")}
                    className="font-semibold"
                    style={{ color: P.olive }}
                  >
                    Create one →
                  </button>
                </td>
              </tr>
            )}
            {pagedRows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#F6FEFA] transition-colors"
                style={{ borderBottom: `1px solid ${P.border}40` }}
              >
                <td className="pl-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggleOne(row.id)}
                    style={{ accentColor: P.olive }}
                  />
                </td>
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-3 py-3">
                    {col.render ? (
                      col.render(row)
                    ) : (
                      <p className="text-xs" style={{ color: P.textMid }}>
                        {String(row[col.key as keyof T] ?? "")}
                      </p>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {actions.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => a.onClick(row)}
                        title={a.label}
                        className="p-1.5 rounded-lg hover:bg-[#ECFDF5] transition-colors"
                        style={{ color: P.textMuted }}
                      >
                        <a.icon size={13} />
                      </button>
                    ))}
                    <button
                      onClick={() => setEditing(row)}
                      title="Edit"
                      className="p-1.5 rounded-lg hover:bg-[#ECFDF5] transition-colors"
                      style={{ color: P.olive }}
                    >
                      <Edit size={13} />
                    </button>
                    <button
                      onClick={() => clone(row)}
                      title={duplicateLabel}
                      className="p-1.5 rounded-lg hover:bg-[#ECFDF5] transition-colors"
                      style={{ color: P.textMuted }}
                    >
                      <Copy size={13} />
                    </button>
                    {toggleStatus && (
                      <button
                        onClick={() => toggleRowStatus(row)}
                        title={
                          row.status === toggleStatus.enabled
                            ? (toggleStatus.disableLabel ?? "Disable")
                            : (toggleStatus.enableLabel ?? "Enable")
                        }
                        className="p-1.5 rounded-lg hover:bg-[#ECFDF5] transition-colors"
                        style={{
                          color: row.status === toggleStatus.enabled ? P.textMuted : P.olive,
                        }}
                      >
                        {row.status === toggleStatus.enabled ? (
                          <AlertCircle size={13} />
                        ) : (
                          <CheckCircle size={13} />
                        )}
                      </button>
                    )}
                    {showArchive && (
                      <button
                        onClick={() => archive(row.id)}
                        title="Archive"
                        className="p-1.5 rounded-lg hover:bg-[#ECFDF5] transition-colors"
                        style={{ color: P.textMuted }}
                      >
                        <Archive size={13} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setConfirming({
                          msg: `Delete "${row.name}"? This cannot be undone.`,
                          action: () => del(row.id),
                        })
                      }
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"
                      style={{ color: "#C0392B" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px]" style={{ color: P.textMuted }}>
            Page {activePage} of {totalPages}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={activePage === 1}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ border: `1px solid ${P.border}`, color: P.textMid, background: "white" }}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <button
                key={pageNumber}
                type="button"
                onClick={() => setPage(pageNumber)}
                className="w-8 h-8 rounded-lg text-xs font-semibold"
                style={
                  activePage === pageNumber
                    ? { background: P.olive, color: "white" }
                    : { border: `1px solid ${P.border}`, color: P.textMid, background: "white" }
                }
              >
                {pageNumber}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={activePage === totalPages}
              className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
              style={{ border: `1px solid ${P.border}`, color: P.textMid, background: "white" }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {editing !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.6)" }}
          onClick={() => setEditing(null)}
        >
          <div onClick={(e) => e.stopPropagation()}>
            {renderForm(editing === "new" ? null : editing, handleSave, () => setEditing(null))}
          </div>
        </div>
      )}

      {confirming && (
        <Confirm
          message={confirming.msg}
          onConfirm={() => {
            confirming.action();
            setConfirming(null);
          }}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  );
}

// ─── Simple modal wrapper ─────────────────────────────────────

export function CrudModal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="bg-white rounded-2xl border shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
      style={{ borderColor: P.border }}
    >
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${P.border}` }}
      >
        <p
          className="text-sm font-bold"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          {title}
        </p>
        <button onClick={onClose} style={{ color: P.textMuted }}>
          <X size={16} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
function Inp({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    />
  );
}
function Sel({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={3}
      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none resize-none"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    />
  );
}
function SaveBtn({ onSave, onClose }: { onSave: () => void; onClose: () => void }) {
  return (
    <div className="flex gap-2 pt-2">
      <button
        onClick={onSave}
        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
        style={{ background: P.olive }}
      >
        Save
      </button>
      <button
        onClick={onClose}
        className="px-5 py-2.5 rounded-xl text-sm"
        style={{ border: `1px solid ${P.border}`, color: P.textMid }}
      >
        Cancel
      </button>
    </div>
  );
}

// ─── 1. Program Types ─────────────────────────────────────────

export {
  AlertCircle,
  Archive,
  Award,
  BarChart2,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Confirm,
  Copy,
  Download,
  Edit,
  Eye,
  Field,
  FileText,
  Filter,
  GitBranch,
  HelpCircle,
  Inp,
  Layers,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  P,
  Plus,
  RefreshCw,
  SaveBtn,
  Search,
  Sel,
  Shield,
  StatusBadge,
  Target,
  Textarea,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
};
