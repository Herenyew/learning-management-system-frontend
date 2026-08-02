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

type XPRule = CrudRow & { trigger: string; xp: number; category: string; cap: number | null };

const XP_INIT: XPRule[] = [
  {
    id: "xp1",
    name: "Course Completion",
    trigger: "Learner completes a course",
    xp: 300,
    category: "Completion",
    cap: null,
    status: "Active",
  },
  {
    id: "xp2",
    name: "Program Completion",
    trigger: "Learner completes a full program",
    xp: 1200,
    category: "Completion",
    cap: null,
    status: "Active",
  },
  {
    id: "xp3",
    name: "Quiz Pass",
    trigger: "Quiz passed (≥70%)",
    xp: 80,
    category: "Assessment",
    cap: 400,
    status: "Active",
  },
  {
    id: "xp4",
    name: "Quiz High Score",
    trigger: "Quiz score ≥90%",
    xp: 150,
    category: "Assessment",
    cap: null,
    status: "Active",
  },
  {
    id: "xp5",
    name: "Perfect Quiz Score",
    trigger: "Quiz score = 100%",
    xp: 250,
    category: "Assessment",
    cap: null,
    status: "Active",
  },
  {
    id: "xp6",
    name: "Program Milestone",
    trigger: "Learner reaches a program milestone",
    xp: 100,
    category: "Program",
    cap: null,
    status: "Active",
  },
  {
    id: "xp7",
    name: "Early Completion Bonus",
    trigger: "Completed before deadline",
    xp: 50,
    category: "Bonus",
    cap: null,
    status: "Active",
  },
  {
    id: "xp8",
    name: "Streak Bonus — 7 Days",
    trigger: "7-day consecutive learning streak",
    xp: 75,
    category: "Engagement",
    cap: null,
    status: "Active",
  },
  {
    id: "xp9",
    name: "Course Rating Submitted",
    trigger: "Learner submits course rating",
    xp: 20,
    category: "Engagement",
    cap: 100,
    status: "Disabled",
  },
];

export function XPRulesCrud() {
  const [rows, setRows] = useState<XPRule[]>(XP_INIT);
  return (
    <CrudShell<XPRule>
      title="XP Rules"
      sub="Create, edit, and delete XP earning rules — configurable without code changes"
      icon={Zap}
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
        {
          key: "trigger",
          label: "Trigger",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.trigger}
            </p>
          ),
        },
        {
          key: "xp",
          label: "XP Awarded",
          render: (r) => (
            <p className="text-xs font-bold font-mono" style={{ color: P.gold }}>
              {r.xp} XP
            </p>
          ),
        },
        {
          key: "cap",
          label: "Cap",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.textMuted }}>
              {r.cap ?? "None"}
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
      filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
      createLabel="New XP Rule"
      showArchive={false}
      renderForm={(row, onSave, onClose) => {
        const [form, setForm] = useState<XPRule>(
          row ?? {
            id: `xp${Date.now()}`,
            name: "",
            trigger: "",
            xp: 100,
            category: "Completion",
            cap: null,
            status: "Active",
          },
        );
        return (
          <CrudModal title={row ? "Edit XP Rule" : "New XP Rule"} onClose={onClose}>
            <div className="space-y-4">
              <Field label="Rule Name" required>
                <Inp
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  placeholder="e.g. Course Completion"
                />
              </Field>
              <Field label="Trigger Condition">
                <Inp
                  value={form.trigger}
                  onChange={(v) => setForm({ ...form, trigger: v })}
                  placeholder="e.g. Learner completes a course"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <Sel
                    value={form.category}
                    onChange={(v) => setForm({ ...form, category: v })}
                    options={[
                      "Completion",
                      "Assessment",
                      "Program",
                      "Bonus",
                      "Engagement",
                      "Social",
                    ]}
                  />
                </Field>
                <Field label="XP Awarded">
                  <Inp
                    type="number"
                    value={String(form.xp)}
                    onChange={(v) => setForm({ ...form, xp: Number(v) })}
                  />
                </Field>
                <Field label="Cap (leave blank for none)">
                  <Inp
                    type="number"
                    value={form.cap == null ? "" : String(form.cap)}
                    onChange={(v) => setForm({ ...form, cap: v === "" ? null : Number(v) })}
                  />
                </Field>
                <Field label="Status">
                  <Sel
                    value={form.status}
                    onChange={(v) => setForm({ ...form, status: v })}
                    options={["Active", "Disabled"]}
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

// ─── 9. Quiz Question Banks ──────────────────────────────────
