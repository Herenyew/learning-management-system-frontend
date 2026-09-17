// Extensions5.tsx — Configuration-Driven Administration Management
// Shared management shell + per-module list pages for configuration modules.

import React, { useState, useMemo, useEffect, useCallback } from "react";
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
  Loader2,
} from "lucide-react";
import { usePermission } from "../../hooks/usePermission";

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
  persistSave?: (row: T) => Promise<T>;
  persistDelete?: (id: string) => Promise<void>;
  filterKeys?: string[];
  filterOptions?: { label: string; values: string[] };
  createLabel?: string;
  renderForm: (row: T | null, onSave: (r: T) => void, onClose: () => void) => React.ReactNode;
  cloneRow?: (row: T) => T;
  actions?: { label: string; icon: React.ElementType; onClick: (row: T) => void }[];
  duplicateLabel?: string;
  showDuplicate?: boolean;
  showArchive?: boolean;
  /** Hide single-row and bulk delete actions (for entities that only deactivate). */
  showDelete?: boolean;
  toggleStatus?: {
    enabled: string;
    disabled: string;
    enableLabel?: string;
    disableLabel?: string;
  };
  /** When provided, status toggles (single row + bulk) are persisted to the backend. */
  persistToggle?: (id: string, nextStatus: string) => Promise<void>;
  pageSize?: number;
};

export function CrudShell<T extends CrudRow>({
  title,
  sub,
  icon: Icon,
  columns,
  rows,
  onRows,
  persistSave,
  persistDelete,
  filterOptions,
  createLabel = "Create",
  renderForm,
  cloneRow,
  actions = [],
  duplicateLabel = "Duplicate",
  showDuplicate = true,
  showArchive = true,
  showDelete = true,
  toggleStatus,
  persistToggle,
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
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

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

  const handleSave = async (saved: T) => {
    try {
      const persisted = persistSave ? await persistSave(saved) : saved;
      onRows(
        rows.some((r) => r.id === persisted.id || r.id === saved.id)
          ? rows.map((r) => (r.id === persisted.id || r.id === saved.id ? persisted : r))
          : [...rows, persisted],
      );
      setEditing(null);
      setActionError("");
      setSuccessMsg(saved.id.startsWith("new-") ? "Record created successfully!" : "Record updated successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (e: any) {
      // The modal stays open so the user can correct the input; the message is
      // surfaced through the shared action-error banner.
      setActionError(e?.message ?? "Failed to save the record.");
    }
  };

  const archive = (id: string) =>
    onRows(rows.map((r) => (r.id === id ? ({ ...r, status: "Archived" } as T) : r)));

  const applyStatusChange = (ids: string[], nextStatus: string) => {
    if (!toggleStatus || ids.length === 0) return;
    const commit = () =>
      onRows(rows.map((r) => (ids.includes(r.id) ? ({ ...r, status: nextStatus } as T) : r)));
    if (!persistToggle) {
      commit();
      return;
    }
    void Promise.all(ids.map((id) => persistToggle(id, nextStatus)))
      .then(() => {
        commit();
        setActionError("");
      })
      .catch((e: any) => {
        setActionError(e?.message ?? "Failed to update status.");
      });
  };

  const toggleRowStatus = (row: T) => {
    if (!toggleStatus) return;
    const nextStatus =
      row.status === toggleStatus.enabled ? toggleStatus.disabled : toggleStatus.enabled;
    applyStatusChange([row.id], nextStatus);
  };
  const del = async (id: string) => {
    try {
      if (persistDelete) await persistDelete(id);
      onRows(rows.filter((r) => r.id !== id));
      setActionError("");
    } catch (e: any) {
      setActionError(e?.message ?? "Failed to delete the record.");
    }
  };
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
    applyStatusChange(
      rows.filter((r) => selected.has(r.id)).map((r) => r.id),
      toggleStatus.enabled,
    );
    setSelected(new Set());
  };
  const bulkDisable = () => {
    if (!toggleStatus) return;
    applyStatusChange(
      rows.filter((r) => selected.has(r.id)).map((r) => r.id),
      toggleStatus.disabled,
    );
    setSelected(new Set());
  };
  const bulkDelete = async () => {
    try {
      if (persistDelete) await Promise.all([...selected].map((id) => persistDelete(id)));
      onRows(rows.filter((r) => !selected.has(r.id)));
      setSelected(new Set());
      setActionError("");
    } catch (e: any) {
      setSelected(new Set());
      setActionError(e?.message ?? "Failed to delete one or more records.");
    }
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
        {createLabel ? (
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: P.olive }}
          >
            <Plus size={13} /> {createLabel}
          </button>
        ) : null}
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
            {showDelete && (
              <button
                onClick={() =>
                  setConfirming({
                    msg: `Delete ${selected.size} selected item(s)?`,
                    action: () => void bulkDelete(),
                  })
                }
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium"
                style={{ background: "#FEE2E2", border: "1px solid #FECACA", color: "#B91C1C" }}
              >
                <Trash2 size={11} /> Delete
              </button>
            )}
          </div>
          <button onClick={() => setSelected(new Set())} style={{ color: P.textMuted }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* API action error banner */}
      {actionError && (
        <div
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"
          role="alert"
        >
          <AlertCircle size={14} className="flex-shrink-0" />
          <span className="flex-1">{actionError}</span>
          <button onClick={() => setActionError("")} aria-label="Dismiss error">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Success message banner */}
      {successMsg && (
        <div
          className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-xs text-green-700"
          role="alert"
        >
          <CheckCircle size={14} className="flex-shrink-0" />
          <span className="flex-1">{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} aria-label="Dismiss success">
            <X size={13} />
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
                    {showDuplicate && (
                      <button
                        onClick={() => clone(row)}
                        title={duplicateLabel}
                        className="p-1.5 rounded-lg hover:bg-[#ECFDF5] transition-colors"
                        style={{ color: P.textMuted }}
                      >
                        <Copy size={13} />
                      </button>
                    )}
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
                    {showDelete && (
                      <button
                        onClick={() =>
                          setConfirming({
                            msg: `Delete "${row.name}"? This cannot be undone.`,
                            action: () => void del(row.id),
                          })
                        }
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-[#FEE2E2] transition-colors"
                        style={{ color: "#C0392B" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
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
            {actionError && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span className="flex-1">{actionError}</span>
                <button onClick={() => setActionError("")} aria-label="Dismiss error">
                  <X size={13} />
                </button>
              </div>
            )}
            {renderForm(
              editing === "new" ? null : editing,
              (row) => void handleSave(row),
              () => setEditing(null),
            )}
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
  step,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  step?: string | number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      step={step}
      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    />
  );
}
function Sel({
  value,
  onChange,
  options,
  placeholder,
  labels,
}: {
  value: string;
  onChange: (v: string) => void;
  /** Accepts plain string options or { value, label } pairs (e.g. entity IDs). */
  options: Array<string | { value: string; label: string }>;
  placeholder?: string;
  labels?: Record<string, string>;
}) {
  const normalized = options.map((o) =>
    typeof o === "string" ? { value: o, label: labels?.[o] ?? o } : o,
  );
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none disabled:opacity-60"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {!placeholder && !normalized.some((o) => o.value === value) && (
        <option value="">—</option>
      )}
      {normalized.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
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

// ─── Generic API-backed entity screen factory ────────────────────────────────
// Generates a complete CrudShell management screen (list/filter/paginate/create/
// edit/delete/toggle) from a declarative config, so every backend sub-resource
// can get a matching frontend tab without duplicating boilerplate.
/**
 * Owns form state in a real component so CrudShell's `renderForm` callbacks can
 * use `(form, setForm)` without calling useState inline — an inline useState
 * inside renderForm changed CrudShell's hook order and crashed React
 * ("Rendered more hooks than during the previous render") whenever the dialog
 * opened or closed.
 */
export function InlineFormState<T,>(props: {
  initial: T;
  children: (form: T, setForm: React.Dispatch<React.SetStateAction<T>>) => React.ReactNode;
}) {
  const [form, setForm] = useState<T>(props.initial);
  return <>{props.children(form, setForm)}</>;
}

export type EntityFieldDef =
  | { key: string; label: string; type: "text" | "number" | "textarea"; required?: boolean; placeholder?: string; autoSlugFrom?: string }
  | { key: string; label: string; type: "select"; required?: boolean; options?: { value: string; label: string }[]; loadOptions?: (signal?: AbortSignal) => Promise<{ value: string; label: string }[]> }
  | { key: string; label: string; type: "color"; required?: boolean };

/** Preset swatches offered by the color field, plus the theme olive fallback. */
export const COLOR_PRESETS = [
  "#047857",
  "#065F46",
  "#C0392B",
  "#8A9A5B",
  "#C8A85D",
  "#8B6914",
  "#4A7A5A",
  "#5A7A2A",
  "#2563EB",
  "#7C3AED",
  "#B91C1C",
  "#0F766E",
];

/** Auto-generates a slug/code value from the name field as the user types. */
export const slugifyLocal = (s: string) =>
  (s ?? "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "");

/**
 * Dropdown whose options are fetched from the backend on mount (via
 * `EntityFieldDef.loadOptions`), instead of being hard-coded in `options`.
 * Renders a loading state while the request is in flight and falls back to
 * `field.options` if provided.
 */
export function AsyncSelectField({
  field,
  value,
  onChange,
}: {
  field: Extract<EntityFieldDef, { type: "select" }>;
  value: unknown;
  onChange: (v: string) => void;
}) {
  const [opts, setOpts] = useState<{ value: string; label: string }[]>(
    field.options ?? [],
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!field.loadOptions) {
      setLoading(false);
      return () => { cancelled = true; };
    }
    const c = new AbortController();
    setLoading(true);
    field
      .loadOptions(c.signal)
      .then((o) => { if (!cancelled) setOpts(o); })
      .catch(() => { if (!cancelled) setOpts([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; c.abort(); };
  }, [field]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs" style={{ color: P.textMuted }}>
        <Loader2 size={13} className="animate-spin" /> Loading options…
      </div>
    );
  }
  return (
    <Sel
      value={String(value ?? "")}
      onChange={onChange}
      options={opts}
      placeholder={field.required ? undefined : "—"}
    />
  );
}


export type EntityCrudConfig<T extends { id: number }> = {
  title: string;
  sub: string;
  icon: React.ElementType;
  viewPermission: string;
  load: (signal?: AbortSignal) => Promise<T[]>;
  /** Map one API record into a CrudShell row (must include id/name/status). */
  toRow: (dto: T) => CrudRow;
  columns: CrudColumn<CrudRow>[];
  fields: EntityFieldDef[];
  /** Build the POST/PATCH payload from validated form values. */
  buildInput: (form: Record<string, unknown>) => Record<string, unknown>;
  /** Persist create (id=null) or update (id set); returns fresh dto. */
  save: (input: Record<string, unknown>, id: number | null) => Promise<T>;
  remove?: (id: number) => Promise<void>;
  /** When provided together with toggleStatus, Activate/Deactivate persists. */
  setActive?: (id: number, nextEnabled: boolean) => Promise<void>;
  toggleLabels?: { enabled: string; disabled: string };
  filterValues?: string[];
  /** Read-only system tables: hides create/edit/delete/toggle. */
  readOnly?: boolean;
};

export function createEntityCrud<T extends { id: number }>(cfg: EntityCrudConfig<T>): React.FC {
  const FieldRenderer = ({
    field,
    value,
    onChange,
  }: {
    field: EntityFieldDef;
    value: unknown;
    onChange: (v: string) => void;
  }) => {
    if (field.type === "select") {
      if (field.loadOptions) {
        return <AsyncSelectField field={field} value={value} onChange={onChange} />;
      }
      return (
        <Sel
          value={String(value ?? "")}
          onChange={onChange}
          options={field.options ?? []}
          placeholder={field.required ? undefined : "—"}
        />
      );
    }
    if (field.type === "textarea") {
      return <Textarea value={String(value ?? "")} onChange={onChange} placeholder={field.placeholder} />;
    }
    if (field.type === "color") {
      const current = typeof value === "string" && value ? value : COLOR_PRESETS[0];
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(current) ? current : COLOR_PRESETS[0]}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded-lg cursor-pointer bg-transparent"
            style={{ border: `1px solid ${P.border}` }}
            title="Custom color"
          />
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(c)}
              className="w-6 h-6 rounded-full flex-shrink-0 transition-transform"
              style={{
                background: c,
                transform: current.toLowerCase() === c.toLowerCase() ? "scale(1.2)" : "scale(1)",
                boxShadow: current.toLowerCase() === c.toLowerCase() ? `0 0 0 2px white, 0 0 0 4px ${c}` : "none",
                border: `1px solid ${P.border}`,
              }}
            />
          ))}
        </div>
      );
    }
    return <Inp type={field.type === "number" ? "number" : "text"} value={String(value ?? "")} onChange={onChange} placeholder={field.placeholder} />;
  };

  // Own component so the form values can live in local useState (fixes typing —
  // mutating a plain object without setState caused controlled inputs to never
  // re-render and therefore reject every keystroke).
  const EntityForm = ({
    row,
    onSave,
    onClose,
  }: {
    row: CrudRow | null;
    onSave: (r: CrudRow) => void;
    onClose: () => void;
  }) => {
    const [values, setValues] = useState<Record<string, unknown>>(() => {
      const blank: Record<string, unknown> = { id: `new-${Date.now()}`, name: "", status: "Active" };
      cfg.fields.forEach((f) => {
        blank[f.key] = row?.[f.key] ?? (f.type === "select" ? f.options?.[0]?.value ?? "" : "");
      });
      return { ...blank, ...(row ?? {}) };
    });
        const handleFieldChange = (f: EntityFieldDef, v: string) => {
      setValues((prev) => {
        const next: Record<string, unknown> = { ...prev };
        next[f.key] = f.type === "number" ? (v === "" ? "" : v) : v;
        // Auto-generate a derivative field (slug/code with autoSlugFrom) whenever
        // its source field (e.g. name) changes. Guard on select first so TS narrows
        // to the text/number/textarea variant that owns autoSlugFrom.
        cfg.fields.forEach((df) => {
          if (df.type === "select" || df.type === "color") return;
          if (df.key === f.key) return;
          if (df.autoSlugFrom && df.autoSlugFrom === f.key) {
            const src = next[f.key];
            if (typeof src === "string" && src.trim()) next[df.key] = slugifyLocal(src);
          }
        });
        return next;
      });
    };
    const submit = () => onSave(values as CrudRow);

    return (
      <CrudModal title={row ? `Edit ${cfg.title.replace(/s$/, "")}` : `New ${cfg.title.replace(/s$/, "")}`} onClose={onClose}>
        <div className="space-y-4">
          {cfg.fields.map((f) => (
            <Field key={f.key} label={f.label} required={f.required}>
              <FieldRenderer
                field={f}
                value={values[f.key]}
                onChange={(v) => handleFieldChange(f, v)}
              />
            </Field>
          ))}
          <SaveBtn onSave={submit} onClose={onClose} />
        </div>
      </CrudModal>
    );
  };
  EntityForm.displayName = `EntityForm(${cfg.title})`;

  const Component: React.FC = () => {
    const can = usePermission();
    const [rows, setRows] = useState<CrudRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (signal?: AbortSignal) => {
      setLoading(true); setError("");
      try {
        const data = await cfg.load(signal);
        if (!signal?.aborted) setRows(data.map((d) => cfg.toRow(d)));
      } catch (e: any) {
        if (!signal?.aborted) setError(e?.message ?? `Failed to load ${cfg.title.toLowerCase()}.`);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    }, []);

    useEffect(() => {
      const c = new AbortController();
      void load(c.signal);
      return () => c.abort();
    }, [load]);

    if (!can(cfg.viewPermission))
      return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view {cfg.title.toLowerCase()}.</div>;
    if (loading)
      return <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}><Loader2 size={15} className="animate-spin" /> Loading…</div>;

    const persistSave = async (row: CrudRow): Promise<CrudRow> => {
      for (const f of cfg.fields) {
        if (f.required && !String(row[f.key] ?? "").trim()) throw new Error(`${f.label} is required.`);
      }
      const form: Record<string, unknown> = {};
      cfg.fields.forEach((f) => { form[f.key] = row[f.key]; });
      const input = cfg.buildInput(form);
      const rawId = String(row.id ?? "");
      const isNew = rawId.startsWith("new-") || rawId.trim() === "";
      // Resolve a real numeric id for update paths. If the saved row carries an id
      // that is neither "new-*" nor a positive integer, fail loudly instead of
      // letting Number() produce NaN and sending a "/:id/NaN" 400 to the backend.
      const id = isNew
        ? null
        : (() => {
            const n = Number(rawId);
            if (!Number.isInteger(n) || n <= 0) {
              throw new Error("Could not save this record because its id is invalid. Reload the list and try again.");
            }
            return n;
          })();
      const dto = await cfg.save(input, id);
      const savedRow = cfg.toRow(dto);
      // Some update endpoints respond with { success, message } instead of the saved
      // entity; toRow then yields a bogus id ("undefined" -> NaN on the next call).
      // If this was an update and the returned row lost its numeric id, keep the
      // pre-edit id so the row remains operable.
      const savedId = Number(savedRow.id);
      if (id != null && (!Number.isInteger(savedId) || savedId <= 0)) {
        return { ...savedRow, id: String(id) };
      }
      return savedRow;
    };

    // Resolve a persisted/row id into the positive integer the API expects for
    // delete/toggle/update calls. Any other shape means the row was never
    // persisted (or its id was lost), so fail with a clear message rather than
    // sending a "/:id/NaN" request and bouncing a 400 off the backend.
    const safeId = (id: string): number => {
      const n = Number(id);
      if (!Number.isInteger(n) || n <= 0) {
        throw new Error("Could not save this record because its id is invalid. Reload the list and try again.");
      }
      return n;
    };

    return (
      <div className="space-y-3">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            <AlertCircle size={14} />{error}
            <button onClick={() => void load()} className="ml-auto underline">Retry</button>
          </div>
        )}
        {!error && (
          <CrudShell<CrudRow>
            title={cfg.title}
            sub={cfg.sub}
            icon={cfg.icon}
            columns={cfg.columns}
            rows={rows}
            onRows={setRows}
            persistSave={cfg.readOnly ? undefined : persistSave}
            persistDelete={cfg.readOnly || !cfg.remove ? undefined : async (id) => cfg.remove!(safeId(id))}
            persistToggle={cfg.setActive ? (id, next) => cfg.setActive!(safeId(id), next === "Active" || next === "Enabled") : undefined}
            toggleStatus={cfg.toggleLabels}
            filterOptions={cfg.filterValues ? { label: "Status", values: cfg.filterValues } : undefined}
            createLabel={cfg.readOnly ? "" : `New ${cfg.title.replace(/s$/, "")}`}
            showArchive={false}
            showDuplicate={false}
            renderForm={(row, onSave, onClose) => <EntityForm row={row} onSave={onSave} onClose={onClose} />}
          />
        )}
      </div>
    );
  };
  Component.displayName = `EntityCrud(${cfg.title})`;
  return Component;
}
