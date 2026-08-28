import React, { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle, X, Plus, ListOrdered, Trash2, Check } from "lucide-react";
import { CrudModal, CrudShell, Field, Inp, P, SaveBtn, Sel, StatusBadge, Textarea, GitBranch } from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  approvalWorkflowsApi,
  type ApprovalWorkflowDto,
  type ApprovalWorkflowStepDto,
  type CreateApprovalWorkflowStepInput,
  type WorkflowEntityType,
} from "../../API/approval-workflows.api";
import { usePermission } from "../../hooks/usePermission";

type Workflow = CrudRow & { scope: string; triggerOn: string; description: string };

function dtoToRow(dto: ApprovalWorkflowDto): Workflow {
  return {
    id: String(dto.id),
    name: dto.name,
    scope: dto.entityType,
    triggerOn: dto.description ?? "",
    description: dto.description ?? "",
    status: dto.isActive ? "Active" : "Disabled",
  };
}

const ENTITY_TYPES: WorkflowEntityType[] = ["COURSE", "COURSE_VERSION", "LEARNING_PROGRAM", "TNA_REQUEST", "CERTIFICATE", "LIVE_SESSION"];

// ─── Step drafts ──────────────────────────────────────────────────────────────

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

// ─── Steps manager modal ──────────────────────────────────────────────────────

function StepsManager({ workflow, onClose }: { workflow: Workflow; onClose: () => void }) {
  const can = usePermission();
  const [steps, setSteps] = useState<StepDraft[] | null>(null); // null = loading
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  useEffect(() => {
    const c = new AbortController();
    approvalWorkflowsApi.steps
      .list(Number(workflow.id), c.signal)
      .then((dtos) => { if (!c.signal.aborted) setSteps(dtos.map(stepToDraft)); })
      .catch((e: any) => { if (!c.signal.aborted) { setError(e?.message ?? "Failed to load steps."); setSteps([]); } });
    return () => c.abort();
  }, [workflow.id]);

  const patchStep = (key: string, patch: Partial<StepDraft>) =>
    setSteps((prev) => prev?.map((s) => (s.key === key ? { ...s, ...patch } : s)) ?? prev);

  const validate = (s: StepDraft): string => {
    if (!(Number(s.approvalOrder) >= 1)) return "Approval order must be 1 or greater.";
    if (!s.approverRoleId.trim() && !s.approverEmployeeId.trim()) return "Provide an approver role ID or an approver employee ID.";
    return "";
  };

  const saveStep = async (s: StepDraft) => {
    const problem = validate(s);
    if (problem) { setError(problem); return; }
    setBusyKey(s.key); setError("");
    try {
      const input = buildStepInput(s);
      const dto = s.id == null
        ? await approvalWorkflowsApi.steps.create(Number(workflow.id), input)
        : await approvalWorkflowsApi.steps.update(Number(workflow.id), s.id, input);
      setSteps((prev) => prev?.map((x) => (x.key === s.key ? stepToDraft(dto) : x)) ?? prev);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save the step.");
    } finally {
      setBusyKey("");
    }
  };

  const removeStep = async (s: StepDraft) => {
    setBusyKey(s.key); setError("");
    try {
      if (s.id != null) await approvalWorkflowsApi.steps.delete(Number(workflow.id), s.id);
      setSteps((prev) => prev?.filter((x) => x.key !== s.key) ?? prev);
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete the step.");
    } finally {
      setBusyKey("");
    }
  };

  const addStep = () =>
    setSteps((prev) => {
      const maxOrder = Math.max(0, ...(prev ?? []).map((s) => Number(s.approvalOrder) || 0));
      return [...(prev ?? []), { key: `new-${Date.now()}`, id: null, approvalOrder: maxOrder + 1, approverRoleId: "", approverEmployeeId: "", isRequired: true, autoApprove: false, timeoutDays: "" }];
    });

  const sorted = [...(steps ?? [])].sort((a, b) => (Number(a.approvalOrder) || 0) - (Number(b.approvalOrder) || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(46,58,21,0.6)" }} onClick={onClose}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white rounded-2xl border shadow-xl max-h-[85vh] overflow-y-auto" style={{ borderColor: P.border }}>
          <div className="flex items-center justify-between px-6 py-4 sticky top-0 bg-white z-10" style={{ borderBottom: `1px solid ${P.border}` }}>
            <div>
              <p className="text-sm font-bold" style={{ color: P.text }}>Approval Steps</p>
              <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>{workflow.name}</p>
            </div>
            <button onClick={onClose} aria-label="Close steps manager" style={{ color: P.textMuted }}><X size={16} /></button>
          </div>
          <div className="p-5 space-y-3">
            {steps === null && (
              <div className="flex items-center justify-center gap-2 py-10 text-xs" style={{ color: P.textMuted }}>
                <Loader2 size={15} className="animate-spin" /> Loading steps…
              </div>
            )}
            {steps !== null && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2" role="alert">
                <AlertCircle size={14} />{error}
                <button onClick={() => setError("")} className="ml-auto"><X size={13} /></button>
              </div>
            )}
            {steps !== null && sorted.length === 0 && !error && (
              <p className="text-xs py-6 text-center" style={{ color: P.textMuted }}>
                No approval steps yet. Add the first step below.
              </p>
            )}
            {sorted.map((s, i) => (
              <div key={s.key} className="rounded-xl border p-3 space-y-2" style={{ borderColor: P.border, background: s.id == null ? P.bg : "white" }}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[11px] font-bold" style={{ color: P.darkOlive }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background: P.olive }}>{i + 1}</span>
                    {s.id == null ? "New step (unsaved)" : `Step #${s.id}`}
                  </span>
                  {can("approval_workflow_step.delete") && (
                    <button onClick={() => void removeStep(s)} disabled={busyKey === s.key} title="Delete step" className="p-1 rounded-lg hover:bg-red-50 disabled:opacity-50" style={{ color: "#C0392B" }}>
                      {busyKey === s.key ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <label className="col-span-1 block">
                    <span className="block text-[10px] font-semibold mb-1" style={{ color: P.textMid }}>Order *</span>
                    <input type="number" min={1} value={String(s.approvalOrder)} onChange={(e) => patchStep(s.key, { approvalOrder: Number(e.target.value) })} className="w-full px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
                  </label>
                  <label className="col-span-1 block">
                    <span className="block text-[10px] font-semibold mb-1" style={{ color: P.textMid }}>Role ID</span>
                    <input value={s.approverRoleId} onChange={(e) => patchStep(s.key, { approverRoleId: e.target.value })} placeholder="e.g. 3" className="w-full px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
                  </label>
                  <label className="col-span-1 block">
                    <span className="block text-[10px] font-semibold mb-1" style={{ color: P.textMid }}>Employee ID</span>
                    <input value={s.approverEmployeeId} onChange={(e) => patchStep(s.key, { approverEmployeeId: e.target.value })} placeholder="EMP-001" className="w-full px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
                  </label>
                  <label className="col-span-1 block">
                    <span className="block text-[10px] font-semibold mb-1" style={{ color: P.textMid }}>Timeout (days)</span>
                    <input type="number" value={s.timeoutDays} onChange={(e) => patchStep(s.key, { timeoutDays: e.target.value })} className="w-full px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
                  </label>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-1.5 text-[11px]" style={{ color: P.textMid }}>
                      <input type="checkbox" checked={s.isRequired} onChange={(e) => patchStep(s.key, { isRequired: e.target.checked })} style={{ accentColor: P.olive }} /> Required
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px]" style={{ color: P.textMid }}>
                      <input type="checkbox" checked={s.autoApprove} onChange={(e) => patchStep(s.key, { autoApprove: e.target.checked })} style={{ accentColor: P.olive }} /> Auto-approve on timeout
                    </label>
                  </div>
                  {can("approval_workflow_step.create") && can("approval_workflow_step.update") && (
                    <button onClick={() => void saveStep(s)} disabled={busyKey === s.key} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
                      {busyKey === s.key ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} {s.id == null ? "Create Step" : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {can("approval_workflow_step.create") && steps !== null && (
              <button onClick={addStep} className="flex w-full items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed text-xs font-semibold transition-colors hover:bg-emerald-50" style={{ borderColor: P.sage, color: P.olive }}>
                <Plus size={13} /> Add Step
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function WorkflowForm({ row, onSave, onClose }: { row: Workflow | null; onSave: (r: Workflow) => void; onClose: () => void }) {
  const blank: Workflow = { id: `new-${Date.now()}`, name: "", scope: "COURSE", triggerOn: "", status: "Active", description: "" };
  const [form, setForm] = useState<Workflow>(row ?? blank);
  return (
    <CrudModal title={row ? "Edit Workflow" : "New Workflow"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Workflow Name" required><Inp value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Course Publishing Workflow" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entity Type">
            <select value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </Field>
          <Field label="Status"><Sel value={form.status} onChange={v => setForm({ ...form, status: v })} options={["Active", "Disabled"]} /></Field>
        </div>
        <Field label="Description"><Textarea value={form.description} onChange={v => setForm({ ...form, description: v, triggerOn: v })} placeholder="Describe when this workflow runs…" /></Field>
        <p className="text-[11px] rounded-xl px-3 py-2.5" style={{ background: P.paleGreen, color: P.textMid }}>
          Save the workflow first, then use the <strong>Steps</strong> action in the table to define its approval steps.
        </p>
        <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function WorkflowsCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stepsFor, setStepsFor] = useState<Workflow | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const data = await approvalWorkflowsApi.list({}, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load workflows.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);

  if (!can("approval_workflow.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view approval workflows.</div>;
  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}><Loader2 size={15} className="animate-spin" /> Loading workflows…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2"><AlertCircle size={14} />{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>;

  const persistSave = async (row: Workflow): Promise<Workflow> => {
    if (!row.name || row.name.trim().length === 0) throw new Error("Workflow name is required.");
    const input = { name: row.name.trim(), entityType: row.scope as WorkflowEntityType, description: row.description, isActive: row.status === "Active" };
    const isNew = row.id.startsWith("new-");
    const dto = isNew ? await approvalWorkflowsApi.create(input) : await approvalWorkflowsApi.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => { await approvalWorkflowsApi.delete(Number(id)); };

  return (
    <div className="space-y-3">
      <CrudShell<Workflow>
        title="Approval Workflows" sub="Create and manage multi-step approval workflows" icon={GitBranch}
        columns={[
          { key: "name", label: "Workflow Name", sortable: true, render: r => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
          { key: "scope", label: "Entity Type", sortable: true, render: r => <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.scope).replace(/_/g, " ")}</span> },
          { key: "description", label: "Description", render: r => <p className="text-xs" style={{ color: P.textMuted }}>{r.description}</p> },
          { key: "status", label: "Status", sortable: true, render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={rows} onRows={setRows} persistSave={persistSave} persistDelete={persistDelete}
        filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
        createLabel="New Workflow" showArchive={false}
        actions={[
          {
            label: "Manage Steps",
            icon: ListOrdered,
            onClick: (row) => {
              if (String(row.id).startsWith("new-")) { setError("Save the workflow before managing its steps."); return; }
              setStepsFor(row as Workflow);
            },
          },
        ]}
        toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Enable", disableLabel: "Disable" }}
        persistToggle={(id, nextStatus) => approvalWorkflowsApi.update(Number(id), { isActive: nextStatus === "Active" }).then(() => undefined)}
        cloneRow={r => ({ ...r, id: `new-${Date.now()}`, name: `${r.name} (Copy)`, status: "Disabled" })}
        renderForm={(row, onSave, onClose) => <WorkflowForm row={row as Workflow | null} onSave={onSave as (r: Workflow) => void} onClose={onClose} />}
      />
      {stepsFor && can("approval_workflow_step.view") && (
        <StepsManager workflow={stepsFor} onClose={() => setStepsFor(null)} />
      )}
    </div>
  );
}
