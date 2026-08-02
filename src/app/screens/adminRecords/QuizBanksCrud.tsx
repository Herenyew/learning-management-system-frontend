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

type QuizBank = CrudRow & { topic: string; questions: number; usedIn: number; difficulty: string };

const QUIZ_INIT: QuizBank[] = [
  {
    id: "qb1",
    name: "AI & Machine Learning",
    topic: "Technology",
    questions: 48,
    usedIn: 3,
    difficulty: "Mixed",
    status: "Active",
  },
  {
    id: "qb2",
    name: "Cybersecurity & GDPR",
    topic: "Compliance",
    questions: 62,
    usedIn: 5,
    difficulty: "Medium",
    status: "Active",
  },
  {
    id: "qb3",
    name: "Data Literacy Fundamentals",
    topic: "Analytics",
    questions: 35,
    usedIn: 2,
    difficulty: "Beginner",
    status: "Active",
  },
  {
    id: "qb4",
    name: "Leadership & Management",
    topic: "Leadership",
    questions: 40,
    usedIn: 4,
    difficulty: "Mixed",
    status: "Active",
  },
  {
    id: "qb5",
    name: "Financial Modeling",
    topic: "Finance",
    questions: 28,
    usedIn: 1,
    difficulty: "Advanced",
    status: "Draft",
  },
  {
    id: "qb6",
    name: "Agile & Scrum",
    topic: "Management",
    questions: 31,
    usedIn: 2,
    difficulty: "Medium",
    status: "Archived",
  },
];

export function QuizBanksCrud() {
  const [rows, setRows] = useState<QuizBank[]>(QUIZ_INIT);
  return (
    <CrudShell<QuizBank>
      title="Quiz Question Banks"
      sub="Manage reusable question banks — create, edit, clone, archive"
      icon={HelpCircle}
      columns={[
        {
          key: "name",
          label: "Bank Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "topic",
          label: "Topic",
          sortable: true,
          render: (r) => (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {r.topic}
            </span>
          ),
        },
        {
          key: "questions",
          label: "Questions",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.text }}>
              {r.questions}
            </p>
          ),
        },
        {
          key: "usedIn",
          label: "Used In",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.textMuted }}>
              {r.usedIn} course{r.usedIn !== 1 ? "s" : ""}
            </p>
          ),
        },
        { key: "difficulty", label: "Difficulty" },
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
      createLabel="New Question Bank"
      cloneRow={(r) => ({
        ...r,
        id: `qb${Date.now()}`,
        name: `${r.name} (Copy)`,
        status: "Draft",
        usedIn: 0,
      })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<QuizBank>(
          row ?? {
            id: `qb${Date.now()}`,
            name: "",
            topic: "Technology",
            questions: 0,
            usedIn: 0,
            difficulty: "Mixed",
            status: "Draft",
          },
        );
        return (
          <CrudModal title={row ? "Edit Question Bank" : "New Question Bank"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Bank Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. AI & Machine Learning"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Topic Area">
                  <Sel
                    value={form.topic}
                    onChange={(v) => setForm({ ...form, topic: v })}
                    options={[
                      "Technology",
                      "Compliance",
                      "Analytics",
                      "Leadership",
                      "Finance",
                      "Management",
                      "Design",
                      "Soft Skills",
                    ]}
                  />
                </Field>
                <Field label="Difficulty">
                  <Sel
                    value={form.difficulty}
                    onChange={(v) => setForm({ ...form, difficulty: v })}
                    options={["Beginner", "Medium", "Advanced", "Mixed"]}
                  />
                </Field>
                <Field label="Question Count">
                  <Inp
                    type="number"
                    value={String(form.questions)}
                    onChange={(v) => setForm({ ...form, questions: Number(v) })}
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

// ─── 10. TNA Request Types ───────────────────────────────────
