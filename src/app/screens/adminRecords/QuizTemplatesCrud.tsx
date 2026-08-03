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

type QuizTemplateRow = CrudRow & {
  questionSet: string;
  questions: number;
  passThreshold: number;
  attempts: number;
  randomised: string;
};

const QUIZ_TEMPLATE_INIT: QuizTemplateRow[] = [
  {
    id: "qt1",
    name: "Standard Knowledge Check",
    questionSet: "Mixed course bank",
    questions: 10,
    passThreshold: 70,
    attempts: 3,
    randomised: "Yes",
    status: "Active",
  },
  {
    id: "qt2",
    name: "Compliance Attestation Quiz",
    questionSet: "Compliance bank",
    questions: 15,
    passThreshold: 80,
    attempts: 2,
    randomised: "No",
    status: "Active",
  },
  {
    id: "qt3",
    name: "Pre/Post Assessment",
    questionSet: "Baseline assessment set",
    questions: 20,
    passThreshold: 60,
    attempts: 1,
    randomised: "Yes",
    status: "Draft",
  },
];

export function QuizTemplatesCrud() {
  const [rows, setRows] = useState<QuizTemplateRow[]>(QUIZ_TEMPLATE_INIT);
  return (
    <CrudShell<QuizTemplateRow>
      title="Quiz Templates"
      sub="Reusable quiz configurations with question sets, pass thresholds, and attempts"
      icon={HelpCircle}
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
        { key: "questionSet", label: "Question Set" },
        { key: "questions", label: "Questions" },
        {
          key: "passThreshold",
          label: "Pass %",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.textMuted }}>
              {r.passThreshold}%
            </p>
          ),
        },
        { key: "attempts", label: "Attempts" },
        { key: "randomised", label: "Randomised" },
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
      cloneRow={(r) => ({ ...r, id: `qt${Date.now()}`, name: `${r.name} (Copy)`, status: "Draft" })}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<QuizTemplateRow>(
          row ?? {
            id: `qt${Date.now()}`,
            name: "",
            questionSet: "Mixed course bank",
            questions: 10,
            passThreshold: 70,
            attempts: 3,
            randomised: "Yes",
            status: "Draft",
          },
        );
        return (
          <CrudModal title={row ? "Edit Quiz Template" : "New Quiz Template"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Template Name" required>
                <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              </Field>
              <Field label="Question Set">
                <Inp
                  value={form.questionSet}
                  onChange={(v) => setForm({ ...form, questionSet: v })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Questions">
                  <Inp
                    type="number"
                    value={String(form.questions)}
                    onChange={(v) => setForm({ ...form, questions: Number(v) })}
                  />
                </Field>
                <Field label="Pass Threshold %">
                  <Inp
                    type="number"
                    value={String(form.passThreshold)}
                    onChange={(v) => setForm({ ...form, passThreshold: Number(v) })}
                  />
                </Field>
                <Field label="Attempts">
                  <Inp
                    type="number"
                    value={String(form.attempts)}
                    onChange={(v) => setForm({ ...form, attempts: Number(v) })}
                  />
                </Field>
                <Field label="Randomise Questions">
                  <Sel
                    value={form.randomised}
                    onChange={(v) => setForm({ ...form, randomised: v })}
                    options={["Yes", "No"]}
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
