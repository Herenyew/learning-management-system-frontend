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

type CourseTemplateRow = CrudRow & {
  category: string;
  level: string;
  chapters: number;
  items: number;
  xp: number;
  passThreshold: number;
};

const COURSE_TEMPLATE_INIT: CourseTemplateRow[] = [
  {
    id: "ct1",
    name: "Standard Self-Paced Course",
    category: "Technology",
    level: "Intermediate",
    chapters: 3,
    items: 7,
    xp: 450,
    passThreshold: 80,
    status: "Active",
  },
  {
    id: "ct2",
    name: "Compliance Mandatory Course",
    category: "Compliance",
    level: "Beginner",
    chapters: 3,
    items: 6,
    xp: 300,
    passThreshold: 90,
    status: "Active",
  },
  {
    id: "ct3",
    name: "Live Workshop",
    category: "Leadership",
    level: "Intermediate",
    chapters: 3,
    items: 6,
    xp: 350,
    passThreshold: 70,
    status: "Active",
  },
  {
    id: "ct4",
    name: "Microlearning Module",
    category: "Soft Skills",
    level: "Beginner",
    chapters: 1,
    items: 2,
    xp: 150,
    passThreshold: 60,
    status: "Archived",
  },
];

export function CourseTemplatesCrud() {
  const [rows, setRows] = useState<CourseTemplateRow[]>(COURSE_TEMPLATE_INIT);
  return (
    <CrudShell<CourseTemplateRow>
      title="Course Templates"
      sub="Reusable course creation templates with default chapters, XP, and pass thresholds"
      icon={BookOpen}
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
        { key: "level", label: "Level", sortable: true },
        { key: "chapters", label: "Chapters" },
        { key: "items", label: "Items" },
        {
          key: "xp",
          label: "XP",
          render: (r) => (
            <p className="text-xs font-mono font-semibold" style={{ color: P.gold }}>
              {r.xp}
            </p>
          ),
        },
        {
          key: "passThreshold",
          label: "Pass %",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.textMuted }}>
              {r.passThreshold}%
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
      duplicateLabel="Clone"
      actions={[
        { label: "Preview", icon: Eye, onClick: (r) => alert(`Preview opened for: ${r.name}`) },
      ]}
      cloneRow={(r) => ({ ...r, id: `ct${Date.now()}`, name: `${r.name} (Copy)`, status: "Draft" })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<CourseTemplateRow>(
          row ?? {
            id: `ct${Date.now()}`,
            name: "",
            category: "Technology",
            level: "Beginner",
            chapters: 1,
            items: 1,
            xp: 300,
            passThreshold: 70,
            status: "Draft",
          },
        );
        return (
          <CrudModal title={row ? "Edit Course Template" : "New Course Template"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Template Name" required>
                <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Sel
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                    options={["Technology", "Leadership", "Compliance", "Soft Skills", "Finance"]}
                  />
                </Field>
                <Field label="Level">
                  <Sel
                    value={form.level}
                    onChange={(v) => setForm({ ...form, level: v })}
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                  />
                </Field>
                <Field label="Chapters">
                  <Inp
                    type="number"
                    value={String(form.chapters)}
                    onChange={(v) => setForm({ ...form, chapters: Number(v) })}
                  />
                </Field>
                <Field label="Content Items">
                  <Inp
                    type="number"
                    value={String(form.items)}
                    onChange={(v) => setForm({ ...form, items: Number(v) })}
                  />
                </Field>
                <Field label="XP Value">
                  <Inp
                    type="number"
                    value={String(form.xp)}
                    onChange={(v) => setForm({ ...form, xp: Number(v) })}
                  />
                </Field>
                <Field label="Pass Threshold %">
                  <Inp
                    type="number"
                    value={String(form.passThreshold)}
                    onChange={(v) => setForm({ ...form, passThreshold: Number(v) })}
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
