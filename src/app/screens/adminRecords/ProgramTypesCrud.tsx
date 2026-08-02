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

type ProgType = CrudRow & { description: string; color: string };

const PROG_TYPE_INIT: ProgType[] = [
  {
    id: "pt1",
    name: "New Employee",
    status: "Active",
    description: "Onboarding programs for new hires",
    color: P.olive,
  },
  {
    id: "pt2",
    name: "Graduate Trainee",
    status: "Active",
    description: "Programs for graduate talent pipelines",
    color: "#4A7A5A",
  },
  {
    id: "pt3",
    name: "Leadership",
    status: "Active",
    description: "Leadership development programs",
    color: P.gold,
  },
  {
    id: "pt4",
    name: "Technical",
    status: "Active",
    description: "Technical skills and engineering programs",
    color: P.darkOlive,
  },
  {
    id: "pt5",
    name: "Compliance",
    status: "Active",
    description: "Mandatory regulatory and compliance programs",
    color: "#C0392B",
  },
  {
    id: "pt6",
    name: "Refresher",
    status: "Archived",
    description: "Periodic knowledge refreshers",
    color: P.sage,
  },
];

export function ProgramTypesCrud() {
  const [rows, setRows] = useState<ProgType[]>(PROG_TYPE_INIT);
  return (
    <CrudShell<ProgType>
      title="Program Types"
      sub="Define the types of learning programs available in the system"
      icon={Layers}
      columns={[
        {
          key: "name",
          label: "Type Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "description",
          label: "Description",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.description}
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
      filterOptions={{ label: "Status", values: ["Active", "Archived"] }}
      createLabel="New Program Type"
      cloneRow={(r) => ({ ...r, id: `pt${Date.now()}`, name: `${r.name} (Copy)`, status: "Draft" })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<ProgType>(
          row ?? {
            id: `pt${Date.now()}`,
            name: "",
            status: "Active",
            description: "",
            color: P.olive,
          },
        );
        return (
          <CrudModal title={row ? "Edit Program Type" : "New Program Type"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Type Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Leadership Development"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="Describe this program type…"
                />
              </Field>
              <Field label="Status">
                <Sel
                  value={form.status}
                  onChange={(v) => setForm({ ...form, status: v })}
                  options={["Active", "Draft", "Archived", "Retired"]}
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

// ─── 2. Program Templates ─────────────────────────────────────
