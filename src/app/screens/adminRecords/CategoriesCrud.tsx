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

type Category = CrudRow & { description: string; courseCount: number; order: number };

const CAT_INIT: Category[] = [
  {
    id: "cat1",
    name: "Technology",
    status: "Active",
    description: "AI, cloud, programming, and digital tools",
    courseCount: 12,
    order: 1,
  },
  {
    id: "cat2",
    name: "Leadership",
    status: "Active",
    description: "Strategic thinking, people management",
    courseCount: 8,
    order: 2,
  },
  {
    id: "cat3",
    name: "Compliance",
    status: "Active",
    description: "Regulatory, legal, and governance training",
    courseCount: 6,
    order: 3,
  },
  {
    id: "cat4",
    name: "Soft Skills",
    status: "Active",
    description: "Communication, teamwork, and EQ",
    courseCount: 9,
    order: 4,
  },
  {
    id: "cat5",
    name: "Finance",
    status: "Active",
    description: "Financial modelling, accounting, analysis",
    courseCount: 5,
    order: 5,
  },
  {
    id: "cat6",
    name: "Design",
    status: "Active",
    description: "UX, design thinking, creative problem solving",
    courseCount: 4,
    order: 6,
  },
  {
    id: "cat7",
    name: "Management",
    status: "Active",
    description: "Project management, agile, operations",
    courseCount: 7,
    order: 7,
  },
  {
    id: "cat8",
    name: "Data Science",
    status: "Hidden",
    description: "Analytics, ML, statistics",
    courseCount: 3,
    order: 8,
  },
];

export function CategoriesCrud() {
  const [rows, setRows] = useState<Category[]>(CAT_INIT);
  return (
    <CrudShell<Category>
      title="Course Categories"
      sub="Manage and reorder course categories — no code changes required"
      icon={Layers}
      columns={[
        {
          key: "order",
          label: "Order",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.textMuted }}>
              #{r.order}
            </p>
          ),
        },
        {
          key: "name",
          label: "Category",
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
          key: "courseCount",
          label: "Courses",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.text }}>
              {r.courseCount}
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
      filterOptions={{ label: "Status", values: ["Active", "Hidden", "Archived"] }}
      createLabel="New Category"
      toggleStatus={{
        enabled: "Active",
        disabled: "Hidden",
        enableLabel: "Show",
        disableLabel: "Hide",
      }}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<Category>(
          row ?? {
            id: `cat${Date.now()}`,
            name: "",
            status: "Active",
            description: "",
            courseCount: 0,
            order: rows.length + 1,
          },
        );
        return (
          <CrudModal title={row ? "Edit Category" : "New Category"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Category Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Data Science"
                />
              </Field>
              <Field label="Description">
                <Textarea
                  value={form.description}
                  onChange={(v) => setForm({ ...form, description: v })}
                  placeholder="Describe what this category covers…"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Display Order">
                  <Inp
                    type="number"
                    value={String(form.order)}
                    onChange={(v) => setForm({ ...form, order: Number(v) })}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Hidden", "Archived"]}
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

// ─── 5. Approval Workflows ───────────────────────────────────
