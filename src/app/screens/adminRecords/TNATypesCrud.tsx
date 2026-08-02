import React, { useMemo, useState } from "react";
import {
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
  CrudModal,
  CrudShell,
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
} from "./adminRecords.shared";
import type { CrudColumn, CrudRow } from "./adminRecords.shared";

type TNAType = CrudRow & { budgetCap: string; requiresApproval: boolean; approvalChain: string };

const TNA_TYPE_INIT: TNAType[] = [
  {
    id: "tna1",
    name: "Free Training Request",
    status: "Active",
    budgetCap: "—",
    requiresApproval: false,
    approvalChain: "Manager only",
  },
  {
    id: "tna2",
    name: "Paid Training Request",
    status: "Active",
    budgetCap: "$5,000/yr",
    requiresApproval: true,
    approvalChain: "Manager + HR + Finance + CEO",
  },
  {
    id: "tna3",
    name: "Retrospective Training",
    status: "Disabled",
    budgetCap: "$2,000",
    requiresApproval: true,
    approvalChain: "Manager + HR",
  },
];

export function TNATypesCrud() {
  const [rows, setRows] = useState<TNAType[]>(TNA_TYPE_INIT);
  return (
    <CrudShell<TNAType>
      title="TNA Request Types"
      sub="Define free, paid, and other training request types with their approval chains"
      icon={Target}
      columns={[
        {
          key: "name",
          label: "Request Type",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        { key: "budgetCap", label: "Budget Cap" },
        {
          key: "approvalChain",
          label: "Approval Chain",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.approvalChain}
            </p>
          ),
        },
        {
          key: "requiresApproval",
          label: "Requires Approval",
          render: (r) => <StatusBadge status={r.requiresApproval ? "Yes" : "No"} />,
        },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rows={rows}
      onRows={setRows}
      filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
      createLabel="New Request Type"
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<TNAType>(
          row ?? {
            id: `tna${Date.now()}`,
            name: "",
            status: "Active",
            budgetCap: "—",
            requiresApproval: false,
            approvalChain: "Manager only",
          },
        );
        return (
          <CrudModal
            title={row ? "Edit TNA Request Type" : "New TNA Request Type"}
            onClose={onClose}
          >
            <div className="space-y-4">
              <Field label="Request Type Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Paid Training Request"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Budget Cap">
                  <Inp
                    value={form.budgetCap}
                    onChange={(v) => setForm({ ...form, budgetCap: v })}
                    placeholder="e.g. $5,000/yr or —"
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Disabled"]}
                  />
                </Field>
              </div>
              <Field label="Approval Chain">
                <Inp
                  value={form.approvalChain}
                  onChange={(v) => setForm({ ...form, approvalChain: v })}
                  placeholder="e.g. Manager + HR + Finance"
                />
              </Field>
              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: P.bg }}>
                <input
                  type="checkbox"
                  checked={form.requiresApproval}
                  onChange={(e) => setForm({ ...form, requiresApproval: e.target.checked })}
                  style={{ accentColor: P.olive }}
                />
                <p className="text-xs font-medium" style={{ color: P.textMid }}>
                  Requires approval before training can proceed
                </p>
              </div>
              <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
            </div>
          </CrudModal>
        );
      }}
    />
  );
}

// ─── 11. Saved Reports ────────────────────────────────────────
