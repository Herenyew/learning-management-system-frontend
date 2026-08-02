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

type WorkflowStep = { id: string; label: string; role: string; required: boolean };
type Workflow = CrudRow & {
  scope: string;
  triggerOn: string;
  steps: WorkflowStep[];
  description: string;
};

const WF_INIT: Workflow[] = [
  {
    id: "wf1",
    name: "Course Publishing Workflow",
    scope: "Courses",
    triggerOn: "Course submitted for review",
    status: "Active",
    description: "Review chain before a course goes live",
    steps: [
      { id: "s1", label: "Peer Review", role: "Creator (peer)", required: true },
      { id: "s2", label: "HR Sign-off", role: "HR Admin", required: true },
      { id: "s3", label: "L&D Approval", role: "L&D Manager", required: false },
    ],
  },
  {
    id: "wf2",
    name: "TNA Free Training Approval",
    scope: "TNA",
    triggerOn: "Free TNA request submitted",
    status: "Active",
    description: "Single-step manager approval for free training",
    steps: [{ id: "s4", label: "Line Manager", role: "Manager", required: true }],
  },
  {
    id: "wf3",
    name: "TNA Paid Training Approval",
    scope: "TNA",
    triggerOn: "Paid TNA request submitted",
    status: "Active",
    description: "Multi-step approval chain for paid training",
    steps: [
      { id: "s5", label: "Line Manager", role: "Manager", required: true },
      { id: "s6", label: "HR Review", role: "HR Admin", required: true },
      { id: "s7", label: "Finance", role: "Finance Manager", required: true },
      { id: "s8", label: "CEO Sign-off", role: "CEO", required: true },
    ],
  },
  {
    id: "wf4",
    name: "Program Creation Approval",
    scope: "Programs",
    triggerOn: "New program submitted",
    status: "Active",
    description: "HR + L&D sign-off for new learning programs",
    steps: [
      { id: "s9", label: "HR Admin", role: "HR Admin", required: true },
      { id: "s10", label: "L&D Manager", role: "L&D Manager", required: true },
    ],
  },
  {
    id: "wf5",
    name: "Certificate Issuance Review",
    scope: "Certificates",
    triggerOn: "Certificate ready to issue",
    status: "Disabled",
    description: "Optional dual-signatory check before issuance",
    steps: [
      { id: "s11", label: "Primary Signer", role: "CEO", required: true },
      { id: "s12", label: "Secondary Signer", role: "HR Director", required: false },
    ],
  },
];

function WorkflowForm({
  row,
  onSave,
  onClose,
}: {
  row: Workflow | null;
  onSave: (r: Workflow) => void;
  onClose: () => void;
}) {
  const blank: Workflow = {
    id: `wf${Date.now()}`,
    name: "",
    scope: "Courses",
    triggerOn: "",
    status: "Active",
    description: "",
    steps: [],
  };
  const [form, setForm] = useState<Workflow>(row ?? blank);
  const addStep = () =>
    setForm((f) => ({
      ...f,
      steps: [
        ...f.steps,
        { id: `s${Date.now()}`, label: "New Step", role: "HR Admin", required: true },
      ],
    }));
  const removeStep = (sid: string) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((s) => s.id !== sid) }));
  const updateStep = (sid: string, patch: Partial<WorkflowStep>) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s) => (s.id === sid ? { ...s, ...patch } : s)) }));
  return (
    <CrudModal title={row ? "Edit Workflow" : "New Workflow"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Workflow Name" required>
          <Inp
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="e.g. Course Publishing Workflow"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Scope">
            <Sel
              value={form.scope}
              onChange={(v) => setForm({ ...form, scope: v })}
              options={["Courses", "Programs", "TNA", "Certificates", "Enrollment"]}
            />
          </Field>
          <Field label="Status">
            <Sel
              value={form.status}
              onChange={(v) => setForm({ ...form, status: v })}
              options={["Active", "Disabled", "Draft"]}
            />
          </Field>
        </div>
        <Field label="Trigger Event">
          <Inp
            value={form.triggerOn}
            onChange={(v) => setForm({ ...form, triggerOn: v })}
            placeholder="e.g. Course submitted for review"
          />
        </Field>
        <Field label="Description">
          <Textarea
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
            placeholder="Describe when and why this workflow runs…"
          />
        </Field>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Approval Steps
            </p>
            <button
              onClick={addStep}
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={11} /> Add Step
            </button>
          </div>
          <div className="space-y-2">
            {form.steps.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2.5 rounded-xl border"
                style={{ borderColor: P.border, background: P.bg }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: P.olive }}
                >
                  {i + 1}
                </div>
                <input
                  value={s.label}
                  onChange={(e) => updateStep(s.id, { label: e.target.value })}
                  className="flex-1 min-w-0 px-2 py-1 text-xs rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
                <select
                  value={s.role}
                  onChange={(e) => updateStep(s.id, { role: e.target.value })}
                  className="text-xs px-2 py-1 rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                >
                  {[
                    "Manager",
                    "HR Admin",
                    "L&D Manager",
                    "Finance Manager",
                    "CEO",
                    "Department Head",
                    "Creator (peer)",
                    "HR Director",
                  ].map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <label
                  className="flex items-center gap-1 text-[10px] flex-shrink-0"
                  style={{ color: P.textMuted }}
                >
                  <input
                    type="checkbox"
                    checked={s.required}
                    onChange={(e) => updateStep(s.id, { required: e.target.checked })}
                    style={{ accentColor: P.olive }}
                  />{" "}
                  Req.
                </label>
                <button onClick={() => removeStep(s.id)} style={{ color: "#C0392B" }}>
                  <X size={12} />
                </button>
              </div>
            ))}
            {form.steps.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: P.textMuted }}>
                No steps yet — add one above.
              </p>
            )}
          </div>
        </div>
        <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function WorkflowsCrud() {
  const [rows, setRows] = useState<Workflow[]>(WF_INIT);
  return (
    <CrudShell<Workflow>
      title="Approval Workflows"
      sub="Create, edit, disable, and assign multi-step approval workflows — no code changes required"
      icon={GitBranch}
      columns={[
        {
          key: "name",
          label: "Workflow Name",
          sortable: true,
          render: (r) => (
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {r.name}
            </p>
          ),
        },
        {
          key: "scope",
          label: "Scope",
          sortable: true,
          render: (r) => (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {r.scope}
            </span>
          ),
        },
        {
          key: "triggerOn",
          label: "Trigger",
          render: (r) => (
            <p className="text-xs" style={{ color: P.textMuted }}>
              {r.triggerOn}
            </p>
          ),
        },
        {
          key: "steps",
          label: "Steps",
          render: (r) => (
            <p className="text-xs font-mono" style={{ color: P.text }}>
              {(r.steps as WorkflowStep[]).length} steps
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
      filterOptions={{ label: "Status", values: ["Active", "Disabled", "Draft"] }}
      createLabel="New Workflow"
      showArchive={false}
      toggleStatus={{
        enabled: "Active",
        disabled: "Disabled",
        enableLabel: "Enable",
        disableLabel: "Disable",
      }}
      cloneRow={(r) => ({ ...r, id: `wf${Date.now()}`, name: `${r.name} (Copy)`, status: "Draft" })}
      renderForm={(row, onSave, onClose) => (
        <WorkflowForm
          row={row as Workflow | null}
          onSave={onSave as (r: Workflow) => void}
          onClose={onClose}
        />
      )}
    />
  );
}

// ─── 6. Enrollment Rules ─────────────────────────────────────
