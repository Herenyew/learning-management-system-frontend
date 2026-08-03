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

type SavedReport = CrudRow & {
  category: string;
  groupBy: string;
  schedule: string;
  lastRun: string;
};

const REPORT_INIT: SavedReport[] = [
  {
    id: "r1",
    name: "Monthly Compliance Summary",
    category: "Certification",
    groupBy: "Department",
    schedule: "Monthly",
    lastRun: "Jan 28, 2025",
    status: "Active",
  },
  {
    id: "r2",
    name: "Department Completion Breakdown",
    category: "Learning",
    groupBy: "Department",
    schedule: "Weekly",
    lastRun: "Jan 27, 2025",
    status: "Active",
  },
  {
    id: "r3",
    name: "TNA Budget Utilisation",
    category: "TNA & Workforce",
    groupBy: "Department",
    schedule: "Quarterly",
    lastRun: "Jan 1, 2025",
    status: "Active",
  },
  {
    id: "r4",
    name: "Certificate Expiry Alert",
    category: "Certification",
    groupBy: "Learner",
    schedule: "Weekly",
    lastRun: "Jan 27, 2025",
    status: "Active",
  },
  {
    id: "r5",
    name: "Assessment Pass Rate Trend",
    category: "Assessment",
    groupBy: "Course",
    schedule: "Monthly",
    lastRun: "Jan 1, 2025",
    status: "Active",
  },
  {
    id: "r6",
    name: "Executive KPI Dashboard",
    category: "Executive",
    groupBy: "Organisation",
    schedule: "Monthly",
    lastRun: "Jan 1, 2025",
    status: "Draft",
  },
];

export function ReportsCrud() {
  const [rows, setRows] = useState<SavedReport[]>(REPORT_INIT);
  return (
    <CrudShell<SavedReport>
      title="Saved Reports"
      sub="Create, save, edit, clone, and schedule reports across all analytics categories"
      icon={BarChart2}
      columns={[
        {
          key: "name",
          label: "Report Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "category",
          label: "Category",
          sortable: true,
          render: (r) => (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {r.category}
            </span>
          ),
        },
        { key: "groupBy", label: "Group By" },
        {
          key: "schedule",
          label: "Schedule",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.schedule}
            </p>
          ),
        },
        {
          key: "lastRun",
          label: "Last Run",
          render: (r) => (
            <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
              {r.lastRun}
            </p>
          ),
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
      filterOptions={{ label: "Status", values: ["Active", "Draft", "Archived"] }}
      createLabel="New Report"
      showArchive={false}
      cloneRow={(r) => ({ ...r, id: `r${Date.now()}`, name: `${r.name} (Copy)`, status: "Draft" })}
      actions={[
        {
          label: "Schedule",
          icon: Calendar,
          onClick: (r) => alert(`Schedule settings opened for: ${r.name}`),
        },
        {
          label: "Export",
          icon: Download,
          onClick: (r) => alert(`Export prepared for: ${r.name}`),
        },
      ]}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<SavedReport>(
          row ?? {
            id: `r${Date.now()}`,
            name: "",
            category: "Learning",
            groupBy: "Department",
            schedule: "Monthly",
            lastRun: "—",
            status: "Draft",
          },
        );
        return (
          <CrudModal title={row ? "Edit Report" : "New Saved Report"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Report Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Monthly Compliance Summary"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Sel
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                    options={[
                      "Learning",
                      "Program",
                      "Assessment",
                      "Certification",
                      "TNA & Workforce",
                      "Effectiveness",
                      "Executive",
                    ]}
                  />
                </Field>
                <Field label="Group By">
                  <Sel
                    value={form.groupBy}
                    onChange={(v) => setForm({ ...form, groupBy: v })}
                    options={[
                      "Department",
                      "Course",
                      "Program",
                      "Learner",
                      "Role",
                      "Manager",
                      "Organisation",
                    ]}
                  />
                </Field>
                <Field label="Schedule">
                  <Sel
                    value={form.schedule}
                    onChange={(v) => setForm({ ...form, schedule: v })}
                    options={["Manual", "Daily", "Weekly", "Monthly", "Quarterly", "Never"]}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Draft", "Archived"]}
                  />
                </Field>
              </div>
              <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
            </div>
          </CrudModal>
        );
      }}
    />
  );
}

// ─── 12. Dashboard Widgets ────────────────────────────────────
