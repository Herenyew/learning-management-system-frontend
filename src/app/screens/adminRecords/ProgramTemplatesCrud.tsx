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

type ProgTemplate = CrudRow & {
  type: string;
  duration: string;
  courses: number;
  description: string;
};

const PROG_TMPL_INIT: ProgTemplate[] = [
  {
    id: "ptmpl1",
    name: "New Hire Onboarding",
    type: "New Employee",
    duration: "6 weeks",
    courses: 6,
    status: "Active",
    description: "Standard onboarding for all new hires",
  },
  {
    id: "ptmpl2",
    name: "Leadership Development",
    type: "Leadership",
    duration: "12 weeks",
    courses: 8,
    status: "Active",
    description: "Core leadership competency program",
  },
  {
    id: "ptmpl3",
    name: "Annual Compliance Pack",
    type: "Compliance",
    duration: "4 weeks",
    courses: 5,
    status: "Active",
    description: "Mandatory yearly compliance training",
  },
  {
    id: "ptmpl4",
    name: "Graduate Talent Track",
    type: "Graduate Trainee",
    duration: "24 weeks",
    courses: 12,
    status: "Active",
    description: "Full-year graduate immersion program",
  },
  {
    id: "ptmpl5",
    name: "Engineering Excellence",
    type: "Technical",
    duration: "16 weeks",
    courses: 9,
    status: "Draft",
    description: "Deep technical skills for engineers",
  },
];

export function ProgramTemplatesCrud() {
  const [rows, setRows] = useState<ProgTemplate[]>(PROG_TMPL_INIT);
  return (
    <CrudShell<ProgTemplate>
      title="Program Templates"
      sub="Reusable program structures HR can instantiate quickly"
      icon={FileText}
      columns={[
        {
          key: "name",
          label: "Template Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "type",
          label: "Type",
          sortable: true,
          render: (r) => (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {r.type}
            </span>
          ),
        },
        { key: "duration", label: "Duration" },
        {
          key: "courses",
          label: "Courses",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.text }}>
              {r.courses}
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
      createLabel="New Template"
      cloneRow={(r) => ({
        ...r,
        id: `ptmpl${Date.now()}`,
        name: `${r.name} (Copy)`,
        status: "Draft",
      })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<ProgTemplate>(
          row ?? {
            id: `ptmpl${Date.now()}`,
            name: "",
            type: "New Employee",
            duration: "",
            courses: 0,
            status: "Draft",
            description: "",
          },
        );
        return (
          <CrudModal title={row ? "Edit Template" : "New Program Template"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Template Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Engineering Excellence Track"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Program Type">
                  <Sel
                    value={form.type}
                    onChange={(v) => setForm({ ...form, type: v })}
                    options={[
                      "New Employee",
                      "Graduate Trainee",
                      "Leadership",
                      "Technical",
                      "Compliance",
                    ]}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Draft", "Archived"]}
                  />
                </Field>
                <Field label="Duration">
                  <Inp
                    value={form.duration}
                    onChange={(v) => setForm({ ...form, duration: v })}
                    placeholder="e.g. 8 weeks"
                  />
                </Field>
                <Field label="Number of Courses">
                  <Inp
                    type="number"
                    value={String(form.courses)}
                    onChange={(v) => setForm({ ...form, courses: Number(v) })}
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="Describe the program template…"
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

// ─── 3. Courses ───────────────────────────────────────────────
