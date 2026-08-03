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

type CourseRow = CrudRow & {
  category: string;
  level: string;
  duration: string;
  instructor: string;
  version: string;
};

const COURSE_ROWS_INIT: CourseRow[] = [
  {
    id: "c1",
    name: "AI & ML for Business Leaders",
    category: "Technology",
    level: "Intermediate",
    duration: "8h 30m",
    instructor: "Dr. Sarah Chen",
    status: "Published",
    version: "v3.1",
  },
  {
    id: "c2",
    name: "Data-Driven Leadership",
    category: "Leadership",
    level: "Advanced",
    duration: "6h 15m",
    instructor: "Marcus Johnson",
    status: "Published",
    version: "v2.4",
  },
  {
    id: "c3",
    name: "Cybersecurity Fundamentals",
    category: "Compliance",
    level: "Beginner",
    duration: "4h 00m",
    instructor: "Priya Sharma",
    status: "Published",
    version: "v5.0",
  },
  {
    id: "c4",
    name: "Effective Communication",
    category: "Soft Skills",
    level: "Beginner",
    duration: "3h 45m",
    instructor: "James Okafor",
    status: "Published",
    version: "v2.1",
  },
  {
    id: "c5",
    name: "Financial Modeling & Valuation",
    category: "Finance",
    level: "Advanced",
    duration: "12h 00m",
    instructor: "Sofia Andersen",
    status: "Draft",
    version: "v1.0",
  },
  {
    id: "c6",
    name: "Design Thinking Workshop",
    category: "Design",
    level: "Intermediate",
    duration: "5h 20m",
    instructor: "Lena Mueller",
    status: "Published",
    version: "v3.0",
  },
  {
    id: "c7",
    name: "Agile & Scrum Mastery",
    category: "Management",
    level: "Intermediate",
    duration: "9h 10m",
    instructor: "Ravi Patel",
    status: "Archived",
    version: "v4.2",
  },
  {
    id: "c8",
    name: "ESG & Corporate Strategy",
    category: "Leadership",
    level: "Intermediate",
    duration: "4h 30m",
    instructor: "Emma Williams",
    status: "Published",
    version: "v1.5",
  },
];

export function CoursesCrud() {
  const [rows, setRows] = useState<CourseRow[]>(COURSE_ROWS_INIT);
  return (
    <CrudShell<CourseRow>
      title="Courses"
      sub="Course administration for create, edit, version, clone, archive, and retire actions"
      icon={BookOpen}
      columns={[
        {
          key: "name",
          label: "Course Name",
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
        { key: "duration", label: "Duration" },
        {
          key: "instructor",
          label: "Instructor",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.instructor}
            </p>
          ),
        },
        {
          key: "version",
          label: "Version",
          render: (r) => (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded"
              style={{ background: P.bg, color: P.textMid }}
            >
              {r.version}
            </span>
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
      filterOptions={{ label: "Status", values: ["Published", "Draft", "Archived", "Retired"] }}
      createLabel="New Course"
      cloneRow={(r) => ({
        ...r,
        id: `c${Date.now()}`,
        name: `${r.name} (Copy)`,
        status: "Draft",
        version: "v1.0",
      })}
      actions={[
        {
          label: "New Version",
          icon: RefreshCw,
          onClick: (r) => {
            /* bump version */ alert(`Version bump for: ${r.name}`);
          },
        },
      ]}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<CourseRow>(
          row ?? {
            id: `c${Date.now()}`,
            name: "",
            category: "Technology",
            level: "Beginner",
            duration: "",
            instructor: "",
            status: "Draft",
            version: "v1.0",
          },
        );
        return (
          <CrudModal title={row ? "Edit Course" : "New Course"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Course Title" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Introduction to Data Analytics"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Sel
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                    options={[
                      "Technology",
                      "Leadership",
                      "Compliance",
                      "Soft Skills",
                      "Finance",
                      "Design",
                      "Management",
                      "Data Science",
                    ]}
                  />
                </Field>
                <Field label="Level">
                  <Sel
                    value={form.level}
                    onChange={(v) => setForm({ ...form, level: v })}
                    options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                  />
                </Field>
                <Field label="Duration">
                  <Inp
                    value={form.duration}
                    onChange={(v) => setForm({ ...form, duration: v })}
                    placeholder="e.g. 4h 30m"
                  />
                </Field>
                <Field label="Instructor">
                  <Inp
                    value={form.instructor}
                    onChange={(v) => setForm({ ...form, instructor: v })}
                    placeholder="Full name"
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Draft", "Published", "Archived", "Retired"]}
                  />
                </Field>
                <Field label="Version">
                  <Inp
                    value={form.version}
                    onChange={(v) => setForm({ ...form, version: v })}
                    placeholder="e.g. v1.0"
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

// ─── 4. Course Categories ────────────────────────────────────
