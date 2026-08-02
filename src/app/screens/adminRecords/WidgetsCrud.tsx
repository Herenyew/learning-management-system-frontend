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

type Widget = CrudRow & { kpi: string; section: string; chartType: string };

const WIDGET_INIT: Widget[] = [
  {
    id: "w1",
    name: "Overall Completion Rate",
    kpi: "Completion %",
    section: "Overview",
    chartType: "Gauge",
    status: "Enabled",
  },
  {
    id: "w2",
    name: "Certification Compliance",
    kpi: "Compliance %",
    section: "Overview",
    chartType: "Gauge",
    status: "Enabled",
  },
  {
    id: "w3",
    name: "Top Skill Gaps",
    kpi: "Gap Score",
    section: "Workforce",
    chartType: "Bar Chart",
    status: "Enabled",
  },
  {
    id: "w4",
    name: "Workforce Readiness",
    kpi: "Readiness Score",
    section: "Workforce",
    chartType: "Scorecard",
    status: "Enabled",
  },
  {
    id: "w5",
    name: "Active Learners Trend",
    kpi: "Active Learner Count",
    section: "Engagement",
    chartType: "Line Chart",
    status: "Enabled",
  },
  {
    id: "w6",
    name: "XP Earned This Month",
    kpi: "XP Total",
    section: "Gamification",
    chartType: "Scorecard",
    status: "Enabled",
  },
  {
    id: "w7",
    name: "TNA Approval Backlog",
    kpi: "Pending TNA Requests",
    section: "TNA",
    chartType: "Number",
    status: "Disabled",
  },
  {
    id: "w8",
    name: "Learning ROI",
    kpi: "ROI %",
    section: "Executive",
    chartType: "Trend Line",
    status: "Enabled",
  },
];

export function WidgetsCrud() {
  const [rows, setRows] = useState<Widget[]>(WIDGET_INIT);
  return (
    <CrudShell<Widget>
      title="Dashboard Widgets"
      sub="Configure which KPI widgets appear on the HR and learner dashboards"
      icon={LayoutDashboard}
      columns={[
        {
          key: "name",
          label: "Widget Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "kpi",
          label: "KPI Measured",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.kpi}
            </p>
          ),
        },
        {
          key: "section",
          label: "Section",
          sortable: true,
          render: (r) => (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {r.section}
            </span>
          ),
        },
        { key: "chartType", label: "Chart Type" },
        {
          key: "status",
          label: "Status",
          sortable: true,
          render: (r) => <StatusBadge status={r.status} />,
        },
      ]}
      rows={rows}
      onRows={setRows}
      filterOptions={{ label: "Status", values: ["Enabled", "Disabled"] }}
      createLabel="New Widget"
      showArchive={false}
      toggleStatus={{
        enabled: "Enabled",
        disabled: "Disabled",
        enableLabel: "Enable",
        disableLabel: "Disable",
      }}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<Widget>(
          row ?? {
            id: `w${Date.now()}`,
            name: "",
            kpi: "",
            section: "Overview",
            chartType: "Scorecard",
            status: "Enabled",
          },
        );
        return (
          <CrudModal title={row ? "Edit Widget" : "New Dashboard Widget"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Widget Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Completion Rate"
                />
              </Field>
              <Field label="KPI Measured">
                <Inp
                  value={form.kpi}
                  onChange={(v) => setForm({ ...form, kpi: v })}
                  placeholder="e.g. Completion %"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Dashboard Section">
                  <Sel
                    value={form.section}
                    onChange={(v) => setForm({ ...form, section: v })}
                    options={[
                      "Overview",
                      "Workforce",
                      "Engagement",
                      "Gamification",
                      "TNA",
                      "Executive",
                      "Compliance",
                      "Program",
                    ]}
                  />
                </Field>
                <Field label="Chart Type">
                  <Sel
                    value={form.chartType}
                    onChange={(v) => setForm({ ...form, chartType: v })}
                    options={[
                      "Scorecard",
                      "Gauge",
                      "Bar Chart",
                      "Line Chart",
                      "Pie Chart",
                      "Number",
                      "Trend Line",
                      "Table",
                    ]}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Enabled", "Disabled"]}
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

// ─── Template Management Pages ────────────────────────────────
