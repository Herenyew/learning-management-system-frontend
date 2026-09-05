// WorkflowsCrud.tsx — Approval Workflows configuration (system primary-color theme)
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  AlertCircle,
  X,
  Trash2,
  Clock,
  Search,
  Upload,
  Pencil,
  GitBranch,
  BookOpen,
  Layers,
  Award,
  Video,
  ClipboardCheck,
  CheckCircle2,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutGrid,
  Play,
  Pause,
  Check,
  Plus,
} from "lucide-react";
import type {
  ApprovalWorkflowDto,
  ApprovalWorkflowStepDto,
  CreateApprovalWorkflowStepInput,
  RoleOption,
  EmployeeOption,
  WorkflowEntityType,
} from "../../API/approval-workflows.api";
import { approvalWorkflowsApi } from "../../API/approval-workflows.api";
import { usePermission } from "../../hooks/usePermission";
import { P } from "../../constants/theme.constants";

// ─── System theme (derived from the primary color set in System Settings) ────
const BLUE = () => P.olive;
const BLUE_HOVER = () => P.darkOlive;
const BLUE_SOFT = () => P.lightSage;
const BLUE_BORDER = () => P.border;
const TEXT = () => P.text;
const TEXT_MID = () => P.textMid;
const TEXT_MUTED = () => P.textMuted;
const BORDER = () => P.border;
const BG_SOFT = () => P.paleGreen;
const GREEN = "#16A34A";
const GREEN_SOFT = "#E8F7EE";
const RED = "#DC2626";
const RED_SOFT = "#FDECEC";

type Workflow = {
  id: string;
  name: string;
  description: string;
  entityType: WorkflowEntityType;
  isDefault: boolean;
  steps: ApprovalWorkflowStepDto[];
  status: "Active" | "Disabled";
};

function dtoToRow(dto: ApprovalWorkflowDto): Workflow {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    entityType: dto.entityType,
    isDefault: dto.isDefault,
    steps: dto.steps ?? [],
    status: dto.isActive ? "Active" : "Disabled",
  };
}

const ENTITY_TYPES: WorkflowEntityType[] = [
  "COURSE",
  "COURSE_VERSION",
  "LEARNING_PROGRAM",
  "TNA_REQUEST",
  "CERTIFICATE",
  "LIVE_SESSION",
];

const ENTITY_ICONS: Record<WorkflowEntityType, React.ElementType> = {
  COURSE: BookOpen,
  COURSE_VERSION: BookOpen,
  LEARNING_PROGRAM: Layers,
  TNA_REQUEST: ClipboardCheck,
  CERTIFICATE: Award,
  LIVE_SESSION: Video,
};

// ─── Status pill (click toggles active/disabled) ──────────────────────────────

function StatusPill({
  status,
  onToggle,
}: {
  status: "Active" | "Disabled";
  onToggle?: () => void;
}) {
  const active = status === "Active";
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={!onToggle}
      title={onToggle ? `Click to ${active ? "disable" : "enable"}` : undefined}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-opacity hover:opacity-80"
      style={{ background: active ? GREEN_SOFT : RED_SOFT, color: active ? GREEN : RED }}
    >
      {active ? <CheckCircle2 size={12} /> : <PauseCircle size={12} />}
      {active ? "Active" : "Disabled"}
    </button>
  );
}

// ─── Approval steps pipeline (table display) ──────────────────────────────────

function StepsFlowChain({ steps }: { steps: ApprovalWorkflowStepDto[] }) {
  if (!steps || steps.length === 0) {
    return (
      <span className="text-[11px] italic" style={{ color: TEXT_MUTED() }}>
        No approval steps yet
      </span>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      {steps.map((s, i) => {
        const approverName =
          s.approverRole?.name ??
          s.approver?.fullName ??
          (s.approverEmployeeId
            ? `Employee ${s.approverEmployeeId}`
            : s.approverRoleId
              ? `Role #${s.approverRoleId}`
              : "Auto-approve");
        return (
          <React.Fragment key={s.id}>
            {i > 0 && (
              <ChevronRight size={11} style={{ color: TEXT_MUTED() }} className="shrink-0" />
            )}
            <div
              className="flex items-center gap-1.5 rounded-full pl-0.5 pr-2 py-0.5 bg-white"
              style={{ border: `1px solid ${BLUE_BORDER()}` }}
              title={[
                `Step ${i + 1} — ${approverName}`,
                s.isRequired ? "Required" : "Optional",
                s.autoApprove ? "Auto-approves on timeout" : null,
                s.timeoutDays ? `Timeout: ${s.timeoutDays} days` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            >
              <span
                className="w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                style={{ background: BLUE() }}
              >
                {i + 1}
              </span>
              <span className="text-[11px] font-medium whitespace-nowrap" style={{ color: TEXT() }}>
                {approverName}
              </span>
              {!s.isRequired && (
                <span
                  className="text-[8px] uppercase tracking-wide"
                  style={{ color: TEXT_MUTED() }}
                >
                  opt
                </span>
              )}
              {s.autoApprove && (
                <Clock size={9} className="shrink-0" style={{ color: TEXT_MUTED() }} />
              )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step drafts ──────────────────────────────────────────────────────────────

// Must match MIN_APPROVAL_STEPS / MAX_APPROVAL_STEPS in the backend DTO.
const MIN_STEPS = 1;
const MAX_STEPS = 10;

type StepDraft = {
  key: string;
  id: number | null; // null = not persisted yet
  approvalOrder: number;
  approverRoleId: string;
  approverEmployeeId: string;
  isRequired: boolean;
  autoApprove: boolean;
  timeoutDays: string;
};

const stepToDraft = (dto: ApprovalWorkflowStepDto): StepDraft => ({
  key: `s-${dto.id}`,
  id: dto.id,
  approvalOrder: dto.approvalOrder,
  approverRoleId: dto.approverRoleId != null ? String(dto.approverRoleId) : "",
  approverEmployeeId: dto.approverEmployeeId ?? "",
  isRequired: dto.isRequired,
  autoApprove: dto.autoApprove,
  timeoutDays: dto.timeoutDays != null ? String(dto.timeoutDays) : "",
});

function buildStepInput(s: StepDraft): CreateApprovalWorkflowStepInput {
  return {
    approvalOrder: Number(s.approvalOrder) || 1,
    ...(s.approverRoleId.trim() ? { approverRoleId: Number(s.approverRoleId) } : {}),
    ...(s.approverEmployeeId.trim() ? { approverEmployeeId: s.approverEmployeeId.trim() } : {}),
    isRequired: s.isRequired,
    autoApprove: s.autoApprove,
    ...(s.timeoutDays.trim() ? { timeoutDays: Number(s.timeoutDays) } : {}),
  };
}

// ─── Approval steps editor (embedded in the workflow form) ────────────────────
// Pure draft editor — all steps are persisted together with the workflow.

function StepsEditor({
  steps,
  onStepsChange,
}: {
  steps: StepDraft[];
  onStepsChange: (next: StepDraft[]) => void;
}) {
  const can = usePermission();
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [empQuery, setEmpQuery] = useState("");
  const [empResults, setEmpResults] = useState<EmployeeOption[]>([]);
  const [empLoading, setEmpLoading] = useState(false);
  const [empSearchKey, setEmpSearchKey] = useState<string | null>(null);
  const [empNames, setEmpNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const c = new AbortController();
    approvalWorkflowsApi
      .roleOptions()
      .then((data) => {
        if (!c.signal.aborted) setRoleOptions(data);
      })
      .catch(() => {
        /* keep empty */
      })
      .finally(() => {
        if (!c.signal.aborted) setRolesLoading(false);
      });
    return () => c.abort();
  }, []);

  useEffect(() => {
    if (!empSearchKey || !empQuery.trim()) {
      setEmpResults([]);
      setEmpLoading(false);
      return;
    }
    setEmpLoading(true);
    const c = new AbortController();
    const t = setTimeout(() => {
      approvalWorkflowsApi
        .employeeOptions(empQuery.trim(), c.signal)
        .then((data) => {
          if (!c.signal.aborted) setEmpResults(data);
        })
        .catch(() => {
          if (!c.signal.aborted) setEmpResults([]);
        })
        .finally(() => {
          if (!c.signal.aborted) setEmpLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [empQuery, empSearchKey]);

  useEffect(() => {
    for (const s of steps) {
      const id = s.approverEmployeeId.trim();
      if (!id || empNames[id]) continue;
      approvalWorkflowsApi
        .employeeOptions(id)
        .then((data) => {
          const match = data.find((e) => e.id === id);
          if (match) {
            setEmpNames((prev) => (prev[id] ? prev : { ...prev, [id]: match.fullName }));
          }
        })
        .catch(() => {
          /* keep the raw ID as the label */
        });
    }
  }, [steps, empNames]);

  const patchStep = (key: string, patch: Partial<StepDraft>) =>
    onStepsChange(steps.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const addStep = () => {
    const maxOrder = Math.max(0, ...steps.map((s) => Number(s.approvalOrder) || 0));
    onStepsChange([
      ...steps,
      {
        key: `new-${Date.now()}`,
        id: null,
        approvalOrder: maxOrder + 1,
        approverRoleId: "",
        approverEmployeeId: "",
        isRequired: true,
        autoApprove: false,
        timeoutDays: "",
      },
    ]);
  };

  const removeStep = (key: string) => onStepsChange(steps.filter((s) => s.key !== key));
  const canManage = can("approval_workflow_step.create") || can("approval_workflow_step.update");
  const sorted = useMemo(
    () =>
      [...steps].sort((a, b) => (Number(a.approvalOrder) || 0) - (Number(b.approvalOrder) || 0)),
    [steps],
  );

  const inputCls = "w-full px-2.5 py-2 text-xs rounded-lg bg-white focus:outline-none";
  const inputStyle = { border: `1px solid ${BORDER()}`, color: TEXT() };
  const labelCls = "block text-[10px] font-semibold uppercase tracking-wide mb-1";

  return (
    <div className="space-y-2">
      {sorted.map((s, idx) => (
        <div
          key={s.key}
          className="flex items-start gap-3 rounded-xl p-3"
          style={{ background: BG_SOFT(), border: `1px solid ${BORDER()}` }}
        >
          <span
            className="w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center shrink-0 mt-1"
            style={{ background: BLUE() }}
          >
            {idx + 1}
          </span>

          <div className="flex-1 space-y-2.5">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className={`block ${labelCls}`} style={{ color: TEXT_MID() }}>
                  Order
                </span>
                <input
                  type="number"
                  min={1}
                  value={String(s.approvalOrder)}
                  onChange={(e) => patchStep(s.key, { approvalOrder: Number(e.target.value) })}
                  className={inputCls}
                  style={inputStyle}
                />
              </label>
              <label className="block">
                <span className={`block ${labelCls}`} style={{ color: TEXT_MID() }}>
                  Timeout (days)
                </span>
                <input
                  type="number"
                  value={s.timeoutDays}
                  onChange={(e) => patchStep(s.key, { timeoutDays: e.target.value })}
                  className={inputCls}
                  style={inputStyle}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className={`block ${labelCls}`} style={{ color: TEXT_MID() }}>
                  Approver Role
                </span>
                {rolesLoading ? (
                  <div
                    className="flex items-center gap-1 text-xs py-2"
                    style={{ color: TEXT_MUTED() }}
                  >
                    <Loader2 size={11} className="animate-spin" /> Loading roles…
                  </div>
                ) : (
                  <select
                    value={s.approverRoleId}
                    onChange={(e) => patchStep(s.key, { approverRoleId: e.target.value })}
                    className={inputCls}
                    style={inputStyle}
                  >
                    <option value="">— Select a role —</option>
                    {roleOptions.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                )}
              </label>

              <div className="relative">
                <span className={`block ${labelCls}`} style={{ color: TEXT_MID() }}>
                  Approver Employee
                </span>
                <input
                  type="text"
                  placeholder={s.approverEmployeeId ? "" : "Start typing to search"}
                  value={
                    empSearchKey === s.key
                      ? empQuery
                      : s.approverEmployeeId
                        ? (empNames[s.approverEmployeeId] ?? s.approverEmployeeId)
                        : ""
                  }
                  onChange={(e) => {
                    setEmpSearchKey(s.key);
                    const next = e.target.value;
                    setEmpQuery(next);
                    if (next === "") patchStep(s.key, { approverEmployeeId: "" });
                  }}
                  onFocus={() => {
                    setEmpSearchKey(s.key);
                    setEmpQuery(
                      s.approverEmployeeId
                        ? (empNames[s.approverEmployeeId] ?? s.approverEmployeeId)
                        : "",
                    );
                  }}
                  onBlur={() => {
                    setEmpSearchKey(null);
                    setEmpResults([]);
                    setEmpQuery("");
                  }}
                  className={inputCls}
                  style={inputStyle}
                />
                {empLoading && empSearchKey === s.key && (
                  <Loader2
                    size={11}
                    className="animate-spin absolute right-2 top-[52%]"
                    style={{ color: TEXT_MUTED() }}
                  />
                )}
                {empSearchKey === s.key && empResults.length > 0 && (
                  <div
                    className="absolute z-20 left-0 right-0 mt-1 max-h-44 overflow-y-auto rounded-lg bg-white shadow-lg"
                    style={{ border: `1px solid ${BORDER()}` }}
                  >
                    {empResults.map((emp) => (
                      <button
                        key={emp.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          patchStep(s.key, { approverEmployeeId: emp.id });
                          setEmpSearchKey(null);
                          setEmpResults([]);
                          setEmpQuery("");
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50"
                        style={{ color: TEXT() }}
                      >
                        <span className="font-medium">{emp.fullName}</span>
                        {emp.departmentName ? (
                          <span style={{ color: TEXT_MUTED() }}> · {emp.departmentName}</span>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: TEXT_MID() }}
              >
                <input
                  type="checkbox"
                  checked={s.isRequired}
                  onChange={(e) => patchStep(s.key, { isRequired: e.target.checked })}
                  style={{ accentColor: BLUE() }}
                />
                Required
              </label>
              <label
                className="flex items-center gap-1.5 text-[11px]"
                style={{ color: TEXT_MID() }}
              >
                <input
                  type="checkbox"
                  checked={s.autoApprove}
                  onChange={(e) => patchStep(s.key, { autoApprove: e.target.checked })}
                  style={{ accentColor: BLUE() }}
                />
                Auto-approve on timeout
              </label>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => removeStep(s.key)}
              title="Remove step"
              className="p-1.5 rounded-lg hover:bg-red-50 mt-0.5"
              style={{ color: RED }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      ))}

      {canManage && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={addStep}
            disabled={steps.length >= MAX_STEPS}
            title={
              steps.length >= MAX_STEPS
                ? `A workflow can have at most ${MAX_STEPS} approval steps.`
                : undefined
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ border: `1px solid ${BLUE_BORDER()}`, color: BLUE(), background: BLUE_SOFT() }}
          >
            <Plus size={12} /> Add step
          </button>
          <span className="text-[11px]" style={{ color: TEXT_MUTED() }}>
            {steps.length}/{MAX_STEPS} steps · minimum {MIN_STEPS}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Workflow form modal ──────────────────────────────────────────────────────

function WorkflowModal({
  row,
  onClose,
  onSaved,
}: {
  row: Workflow | null;
  onClose: () => void;
  onSaved: (w: Workflow) => void;
}) {
  const isNew = row == null || row.id.startsWith("new-");
  const [form, setForm] = useState<Workflow>(
    row ?? {
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      entityType: "COURSE",
      isDefault: false,
      steps: [],
      status: "Active",
    },
  );
  const [steps, setSteps] = useState<StepDraft[] | null>(row ? null : []);
  const [originalIds, setOriginalIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew || !row) {
      setSteps([]);
      return;
    }
    const c = new AbortController();
    approvalWorkflowsApi.steps
      .list(Number(row.id), c.signal)
      .then((dtos) => {
        if (c.signal.aborted) return;
        setSteps(dtos.map(stepToDraft));
        setOriginalIds(new Set(dtos.map((d) => d.id)));
      })
      .catch((e: any) => {
        if (!c.signal.aborted) {
          setError(e?.message ?? "Failed to load steps.");
          setSteps([]);
        }
      });
    return () => c.abort();
  }, [row, isNew]);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Workflow name is required.");
      return;
    }
    if (steps === null) {
      setError("Steps are still loading. Please wait a moment.");
      return;
    }
    if (steps.length < MIN_STEPS) {
      setError(
        `A workflow needs at least ${MIN_STEPS} approval step. Click "Add step" to create one.`,
      );
      return;
    }
    if (steps.length > MAX_STEPS) {
      setError(`A workflow can have at most ${MAX_STEPS} approval steps.`);
      return;
    }
    const invalid = steps.find(
      (s) => !s.approverRoleId.trim() && !s.approverEmployeeId.trim() && !s.autoApprove,
    );
    if (invalid) {
      setError(
        "Every approval step needs an approver role or an approver employee (unless auto-approve is enabled).",
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      const input = {
        name: form.name.trim(),
        entityType: form.entityType,
        description: form.description,
        isActive: form.status === "Active",
      };
      const dto = isNew
        ? await approvalWorkflowsApi.create(input)
        : await approvalWorkflowsApi.update(Number(row!.id), input);
      const workflowId = dto.id;

      for (const s of steps) {
        const stepInput = buildStepInput(s);
        if (s.id == null) await approvalWorkflowsApi.steps.create(workflowId, stepInput);
        else await approvalWorkflowsApi.steps.update(workflowId, s.id, stepInput);
      }
      const keptIds = new Set(steps.filter((s) => s.id != null).map((s) => s.id as number));
      for (const id of originalIds) {
        if (!keptIds.has(id)) await approvalWorkflowsApi.steps.delete(workflowId, id);
      }

      // Re-fetch the persisted workflow (including its steps with approver
      // names) so the table reflects the saved steps immediately — without
      // this, the new steps only appear after a manual refresh.
      const fresh = await approvalWorkflowsApi.getById(workflowId);
      onSaved(dtoToRow(fresh));
    } catch (e: any) {
      setError(e?.message ?? "Failed to save the workflow.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg bg-white focus:outline-none";
  const inputStyle = { border: `1px solid ${BORDER()}`, color: TEXT() };
  const labelCls = "block text-xs font-semibold mb-1.5";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <span
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: BLUE_SOFT(), color: BLUE() }}
          >
            <Plus size={18} strokeWidth={2.5} />
          </span>
          <h2 className="text-lg font-bold flex-1" style={{ color: TEXT() }}>
            {isNew ? "New Workflow" : (row?.name ?? "Workflow")}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100"
            style={{ color: TEXT_MID() }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {error && (
            <div
              className="rounded-xl px-3 py-2 text-xs flex items-center gap-2"
              style={{ background: RED_SOFT, color: RED }}
              role="alert"
            >
              <AlertCircle size={12} />
              {error}
              <button onClick={() => setError("")} className="ml-auto">
                <X size={11} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className={`block ${labelCls}`} style={{ color: TEXT() }}>
                Workflow name <span style={{ color: RED }}>*</span>
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Course publishing"
                className={inputCls}
                style={inputStyle}
              />
            </label>
            <label className="block">
              <span className={`block ${labelCls}`} style={{ color: TEXT() }}>
                Entity type <span style={{ color: RED }}>*</span>
              </span>
              <select
                value={form.entityType}
                onChange={(e) =>
                  setForm({ ...form, entityType: e.target.value as WorkflowEntityType })
                }
                className={inputCls}
                style={inputStyle}
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={`block ${labelCls}`} style={{ color: TEXT() }}>
                Status
              </span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Workflow["status"] })}
                className={inputCls}
                style={inputStyle}
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className={`block ${labelCls}`} style={{ color: TEXT() }}>
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe when this workflow runs..."
              rows={3}
              className={`${inputCls} resize-y`}
              style={inputStyle}
            />
          </label>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <h3 className="text-sm font-bold" style={{ color: TEXT() }}>
                Approval Steps
              </h3>
              <span className="text-[11px]" style={{ color: TEXT_MUTED() }}>
                Order of approvers this workflow routes through.
              </span>
            </div>
            {steps === null ? (
              <div
                className="flex items-center justify-center gap-2 py-6 text-xs"
                style={{ color: TEXT_MUTED() }}
              >
                <Loader2 size={13} className="animate-spin" /> Loading steps…
              </div>
            ) : (
              <StepsEditor steps={steps} onStepsChange={setSteps} />
            )}
          </div>

          <div
            className="flex justify-end gap-2 pt-2"
            style={{ borderTop: `1px solid ${BORDER()}` }}
          >
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-sm font-medium"
              style={{ border: `1px solid ${BORDER()}`, color: TEXT_MID() }}
            >
              Cancel
            </button>
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: saving ? BLUE_HOVER() : BLUE() }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
              {saving ? "Saving…" : "Save Workflow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 5;

export function WorkflowsCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Disabled">("All");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Workflow | null | "new">(null);
  const [confirmDelete, setConfirmDelete] = useState<Workflow | null>(null);
  const [actionError, setActionError] = useState("");
  const topRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await approvalWorkflowsApi.list({}, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load workflows.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  const filtered = useMemo(() => {
    let r = rows;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (x) => x.name.toLowerCase().includes(q) || x.description.toLowerCase().includes(q),
      );
    }
    if (filter !== "All") r = r.filter((x) => x.status === filter);
    return r;
  }, [rows, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const activeCount = rows.filter((r) => r.status === "Active").length;
  const disabledCount = rows.length - activeCount;

  const persistToggle = async (row: Workflow) => {
    const next = row.status === "Active" ? "Disabled" : "Active";
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    try {
      await approvalWorkflowsApi.update(Number(row.id), {
        isActive: next === "Active",
      });
      setActionError("");
    } catch (e: any) {
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: row.status } : r)));
      setActionError(e?.message ?? "Failed to update status.");
    }
  };

  const persistDelete = async (row: Workflow) => {
    try {
      await approvalWorkflowsApi.delete(Number(row.id));
      setRows((rs) => rs.filter((r) => r.id !== row.id));
      setConfirmDelete(null);
      setActionError("");
    } catch (e: any) {
      setActionError(e?.message ?? "Failed to delete the workflow.");
    }
  };

  const exportCsv = () => {
    const header = "Workflow Name,Entity Type,Description,Steps,Status\n";
    const lines = filtered.map((r) => {
      const stepsLabel = r.steps
        .map(
          (s, i) =>
            `${i + 1}. ${s.approverRole?.name ?? s.approver?.fullName ?? s.approverEmployeeId ?? "Auto-approve"}`,
        )
        .join(" -> ");
      return [r.name, r.entityType, r.description.replace(/,/g, ";"), stepsLabel, r.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "approval-workflows.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!can("approval_workflow.view")) {
    return (
      <div className="p-6 text-sm text-center" style={{ color: TEXT_MUTED() }}>
        You don't have permission to view approval workflows.
      </div>
    );
  }

  const iconBtn = "p-2 rounded-lg transition-colors";

  return (
    <div
      ref={topRef}
      className="bg-white rounded-2xl shadow-sm p-6"
      style={{ border: `1px solid ${BORDER()}` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <span
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: BLUE_SOFT(), color: BLUE() }}
          >
            <GitBranch size={20} />
          </span>
          <div>
            <h1 className="text-xl font-bold" style={{ color: TEXT() }}>
              Approval Workflows
            </h1>
            <p className="text-xs flex items-center gap-1.5" style={{ color: TEXT_MUTED() }}>
              Multi-step workflows and approval steps
              <span
                className="inline-block w-2 h-2 rounded-full ml-1"
                style={{ background: GREEN }}
              />
              <span style={{ color: TEXT_MID() }}>
                {activeCount} active · {disabledCount} disabled
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
            style={{ border: `1px solid ${BORDER()}`, color: TEXT_MID() }}
          >
            <Upload size={14} /> Export
          </button>
          {can("approval_workflow.create") && (
            <button
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white"
              style={{ background: BLUE() }}
            >
              <Plus size={14} /> New Workflow
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: TEXT_MUTED() }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search approval workflows..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl focus:outline-none"
            style={{ background: BG_SOFT(), border: `1px solid ${BORDER()}`, color: TEXT() }}
          />
        </div>
        <div
          className="flex items-center rounded-xl overflow-hidden"
          style={{ border: `1px solid ${BORDER()}` }}
        >
          {(
            [
              { key: "All", icon: LayoutGrid },
              { key: "Active", icon: Play },
              { key: "Disabled", icon: Pause },
            ] as const
          ).map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                setFilter(key);
                setPage(1);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold"
              style={{
                background: filter === key ? BLUE_SOFT() : "white",
                color: filter === key ? BLUE() : TEXT_MID(),
              }}
            >
              <Icon size={12} /> {key}
            </button>
          ))}
        </div>
      </div>

      {/* Errors */}
      {(error || actionError) && (
        <div
          className="rounded-xl px-4 py-3 mb-4 text-xs flex items-center gap-2"
          style={{ background: RED_SOFT, color: RED }}
        >
          <AlertCircle size={13} />
          {error ?? actionError}
          {error && (
            <button onClick={() => void load()} className="ml-auto underline">
              Retry
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER()}` }}>
        <table className="w-full">
          <thead>
            <tr style={{ background: BG_SOFT() }}>
              {["Workflow Name", "Entity Type", "Approval Steps", "Status", "Actions"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[11px] font-bold uppercase tracking-wider px-4 py-3"
                  style={{ color: TEXT_MID() }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-xs"
                  style={{ color: TEXT_MUTED() }}
                >
                  <Loader2 size={15} className="animate-spin inline mr-2" /> Loading workflows…
                </td>
              </tr>
            ) : pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-xs"
                  style={{ color: TEXT_MUTED() }}
                >
                  No workflows found.
                </td>
              </tr>
            ) : (
              pagedRows.map((r) => {
                const Icon = ENTITY_ICONS[r.entityType] ?? GitBranch;
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${BORDER()}` }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: BLUE_SOFT(), color: BLUE() }}
                        >
                          <Icon size={16} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: TEXT() }}>
                            {r.name}
                            {r.isDefault && (
                              <span
                                className="ml-2 text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded"
                                style={{ background: BLUE_SOFT(), color: BLUE() }}
                              >
                                Default
                              </span>
                            )}
                          </p>
                          {r.description && (
                            <p className="text-[11px]" style={{ color: TEXT_MUTED() }}>
                              {r.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-block text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md"
                        style={{ background: BLUE_SOFT(), color: BLUE() }}
                      >
                        {r.entityType.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StepsFlowChain steps={r.steps} />
                    </td>
                    <td className="px-4 py-3.5">
                      {can("approval_workflow.update") ? (
                        <StatusPill status={r.status} onToggle={() => void persistToggle(r)} />
                      ) : (
                        <StatusPill status={r.status} />
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {can("approval_workflow.update") && (
                          <button
                            onClick={() => setEditing(r)}
                            title="Edit workflow"
                            className={iconBtn}
                            style={{ color: BLUE() }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_SOFT())}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {can("approval_workflow.delete") && (
                          <button
                            onClick={() => setConfirmDelete(r)}
                            title="Delete workflow"
                            className={iconBtn}
                            style={{ color: RED }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = RED_SOFT)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-xs flex items-center gap-1.5" style={{ color: TEXT_MUTED() }}>
          <FileText size={12} /> Showing {filtered.length} workflow
          {filtered.length === 1 ? "" : "s"}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={activePage <= 1}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ border: `1px solid ${BORDER()}`, color: TEXT_MID() }}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center"
              style={
                p === activePage
                  ? { background: BLUE(), color: "white" }
                  : { border: `1px solid ${BORDER()}`, color: TEXT_MID() }
              }
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={activePage >= totalPages}
            className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-40"
            style={{ border: `1px solid ${BORDER()}`, color: TEXT_MID() }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Modals */}
      {editing != null && (
        <WorkflowModal
          row={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setRows((rs) =>
              rs.some((r) => r.id === saved.id)
                ? rs.map((r) => (r.id === saved.id ? saved : r))
                : [...rs, saved],
            );
            setEditing(null);
          }}
        />
      )}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(15, 23, 42, 0.45)" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmDelete(null);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold mb-1" style={{ color: TEXT() }}>
              Delete workflow
            </h3>
            <p className="text-xs mb-5" style={{ color: TEXT_MID() }}>
              Are you sure you want to delete <strong>{confirmDelete.name}</strong>? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-full text-sm"
                style={{ border: `1px solid ${BORDER()}`, color: TEXT_MID() }}
              >
                Cancel
              </button>
              <button
                onClick={() => void persistDelete(confirmDelete)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: RED }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
