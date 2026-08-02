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

type EnrollRule = CrudRow & { ruleType: string; condition: string; action: string; scope: string };

const ENROLL_INIT: EnrollRule[] = [
  {
    id: "er1",
    name: "Auto-enroll on hire",
    ruleType: "Auto Enrollment",
    condition: "New employee joins",
    action: "Assign ADIU Onboarding Program",
    scope: "All",
    status: "Enabled",
  },
  {
    id: "er2",
    name: "Role-based course assignment",
    ruleType: "Auto Enrollment",
    condition: "Role is set or changed",
    action: "Assign role-specific courses",
    scope: "All",
    status: "Enabled",
  },
  {
    id: "er3",
    name: "Annual compliance refresh",
    ruleType: "Auto Enrollment",
    condition: "Year rollover",
    action: "Re-assign compliance courses",
    scope: "All",
    status: "Enabled",
  },
  {
    id: "er4",
    name: "AI & ML prerequisite",
    ruleType: "Prerequisite",
    condition: "Enroll: AI & ML for Leaders",
    action: "Require: Data Fundamentals first",
    scope: "Course",
    status: "Enabled",
  },
  {
    id: "er5",
    name: "Engineering Excellence waitlist",
    ruleType: "Waitlist",
    condition: "Engineering Excellence full",
    action: "Add to waitlist, notify on vacancy",
    scope: "Program",
    status: "Enabled",
  },
  {
    id: "er6",
    name: "Manager approval gate",
    ruleType: "Approval Gate",
    condition: "Self-enroll in paid course",
    action: "Require manager approval",
    scope: "Paid Courses",
    status: "Disabled",
  },
  {
    id: "er7",
    name: "Capacity cap: 200 seats",
    ruleType: "Capacity Limit",
    condition: "Enrollment reaches 200",
    action: "Close enrollment, offer waitlist",
    scope: "Default",
    status: "Enabled",
  },
];

export function EnrollmentRulesCrud() {
  const [rows, setRows] = useState<EnrollRule[]>(ENROLL_INIT);
  return (
    <CrudShell<EnrollRule>
      title="Enrollment Rules"
      sub="Create, edit, and disable enrollment rules — prerequisites, capacity, waitlists, auto-enrollment"
      icon={UserCheck}
      columns={[
        {
          key: "name",
          label: "Rule Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "ruleType",
          label: "Type",
          sortable: true,
          render: (r) => (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: P.goldLight, color: "#8A6A1A" }}
            >
              {r.ruleType}
            </span>
          ),
        },
        {
          key: "condition",
          label: "Condition",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.condition}
            </p>
          ),
        },
        {
          key: "action",
          label: "Action",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.action}
            </p>
          ),
        },
        { key: "scope", label: "Scope" },
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
      createLabel="New Rule"
      showArchive={false}
      toggleStatus={{
        enabled: "Enabled",
        disabled: "Disabled",
        enableLabel: "Enable",
        disableLabel: "Disable",
      }}
      cloneRow={(r) => ({
        ...r,
        id: `er${Date.now()}`,
        name: `${r.name} (Copy)`,
        status: "Disabled",
      })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<EnrollRule>(
          row ?? {
            id: `er${Date.now()}`,
            name: "",
            ruleType: "Auto Enrollment",
            condition: "",
            action: "",
            scope: "All",
            status: "Enabled",
          },
        );
        return (
          <CrudModal title={row ? "Edit Enrollment Rule" : "New Enrollment Rule"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Rule Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Auto-enroll on hire"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rule Type">
                  <Sel
                    value={form.ruleType}
                    onChange={(v) => setForm({ ...form, ruleType: v })}
                    options={[
                      "Auto Enrollment",
                      "Prerequisite",
                      "Waitlist",
                      "Capacity Limit",
                      "Approval Gate",
                      "Conditional Path",
                    ]}
                  />
                </Field>
                <Field label="Scope">
                  <Sel
                    value={form.scope}
                    onChange={(v) => setForm({ ...form, scope: v })}
                    options={["All", "Course", "Program", "Paid Courses", "Default"]}
                  />
                </Field>
              </div>
              <Field label="Condition">
                <Inp
                  value={form.condition}
                  onChange={(v) => setForm({ ...form, condition: v })}
                  placeholder="e.g. New employee joins"
                />
              </Field>
              <Field label="Action">
                <Inp
                  value={form.action}
                  onChange={(v) => setForm({ ...form, action: v })}
                  placeholder="e.g. Assign onboarding program"
                />
              </Field>
              <Field label="Status">
                <Sel
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={["Enabled", "Disabled"]}
                />
              </Field>
              <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
            </div>
          </CrudModal>
        );
      }}
    />
  );
}

// ─── 7. Notification Templates ───────────────────────────────
