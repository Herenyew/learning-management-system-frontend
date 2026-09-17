import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, CheckSquare, Edit3, Plus, Trash2, X } from "lucide-react";
import { catalogConfigurationApi, type TaskTypeDto } from "../../API/catalogConfiguration.api";
import { programApi } from "../../API/program.api";
import type { CreateProgramTaskInput, ProgramCourse, ProgramTask } from "../../models/program.model";
import { P } from "./extended.shared";
import { HRProgramSectionShell, SectionMutationError, mutationMessage, nullableNumber, programButtonClass, programFieldClass, toDateInput } from "./HRProgramSectionShell";

type Draft = {
  title: string; description: string; taskTypeId: string; linkedEntityId: string;
  dueMode: "date" | "offset"; dueDate: string; dueOffsetDays: string;
  phaseNumber: string; maxSubmissions: string; minimumTimeMinutes: string;
  minimumScore: string; minimumAttendance: string; xpAward: string;
  isRequired: boolean; isBlocking: boolean; allowResubmission: boolean;
  requiresManagerApproval: boolean; peerReviewRequired: boolean; requiredPeerReviewCount: string;
};
const emptyDraft = (): Draft => ({
  title: "", description: "", taskTypeId: "", linkedEntityId: "",
  dueMode: "offset", dueDate: "", dueOffsetDays: "", phaseNumber: "",
  maxSubmissions: "1", minimumTimeMinutes: "", minimumScore: "", minimumAttendance: "", xpAward: "",
  isRequired: true, isBlocking: false, allowResubmission: false,
  requiresManagerApproval: false, peerReviewRequired: false, requiredPeerReviewCount: "3",
});
const linkedId = (task: ProgramTask) => task.courseVersionId ?? task.courseContentId ?? task.assessmentId ?? task.liveSessionId ?? task.surveyId;
const fromTask = (task: ProgramTask): Draft => ({
  title: task.title, description: task.description ?? "", taskTypeId: String(task.taskTypeId),
  linkedEntityId: linkedId(task) ? String(linkedId(task)) : "",
  dueMode: task.dueDate ? "date" : "offset", dueDate: toDateInput(task.dueDate),
  dueOffsetDays: task.dueOffsetDays != null ? String(task.dueOffsetDays) : "",
  phaseNumber: task.phaseNumber != null ? String(task.phaseNumber) : "",
  maxSubmissions: task.maxSubmissions != null ? String(task.maxSubmissions) : "",
  minimumTimeMinutes: task.minimumTimeMinutes != null ? String(task.minimumTimeMinutes) : "",
  minimumScore: task.minimumScore != null ? String(task.minimumScore) : "",
  minimumAttendance: task.minimumAttendance != null ? String(task.minimumAttendance) : "",
  xpAward: task.xpAward != null ? String(task.xpAward) : "",
  isRequired: task.isRequired, isBlocking: task.isBlocking, allowResubmission: task.allowResubmission,
  requiresManagerApproval: task.requiresManagerApproval, peerReviewRequired: task.peerReviewRequired,
  requiredPeerReviewCount: task.requiredPeerReviewCount != null ? String(task.requiredPeerReviewCount) : "",
});

export function HRProgramTasksSection({ programId, canWrite, onChanged }: { programId: number; canWrite: boolean; onChanged: () => void }) {
  const [items, setItems] = useState<ProgramTask[]>([]);
  const [types, setTypes] = useState<TaskTypeDto[]>([]);
  const [courses, setCourses] = useState<ProgramCourse[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const [tasks, taskTypes, programCourses] = await Promise.all([programApi.tasks.list(programId, signal), catalogConfigurationApi.listTaskTypes(signal), programApi.courses.list(programId, signal)]);
      if (!signal?.aborted) { setItems(tasks); setTypes(taskTypes.filter((type) => type.isActive || tasks.some((task) => task.taskTypeId === type.id))); setCourses(programCourses); }
    } catch (reason: unknown) { if (!signal?.aborted) setError(mutationMessage(reason, "Unable to load program tasks.")); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [programId]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);

  const selectedType = useMemo(() => types.find((type) => String(type.id) === draft.taskTypeId), [draft.taskTypeId, types]);
  const closeForm = () => { setDraft(emptyDraft()); setEditingId(null); setShowForm(false); setMutationError(""); };
  const buildInput = (): CreateProgramTaskInput => {
    const input: CreateProgramTaskInput = {
      title: draft.title.trim(), description: draft.description.trim() || null, taskTypeId: Number(draft.taskTypeId),
      courseVersionId: null, courseContentId: null, assessmentId: null, liveSessionId: null, surveyId: null,
      maxSubmissions: nullableNumber(draft.maxSubmissions),
      allowResubmission: draft.allowResubmission,
      isRequired: draft.isRequired,
      isBlocking: draft.isBlocking,
      phaseNumber: nullableNumber(draft.phaseNumber),
      dueDate: draft.dueMode === "date" ? draft.dueDate || null : null,
      dueOffsetDays: draft.dueMode === "offset" ? nullableNumber(draft.dueOffsetDays) : null,
      minimumTimeMinutes: nullableNumber(draft.minimumTimeMinutes),
      minimumScore: nullableNumber(draft.minimumScore),
      minimumAttendance: nullableNumber(draft.minimumAttendance),
      requiresManagerApproval: draft.requiresManagerApproval,
      peerReviewRequired: draft.peerReviewRequired,
      requiredPeerReviewCount: nullableNumber(draft.requiredPeerReviewCount),
      xpAward: nullableNumber(draft.xpAward),
    };
    const value = nullableNumber(draft.linkedEntityId);
    if (selectedType?.linkedEntity === "COURSE_VERSION") input.courseVersionId = value;
    if (selectedType?.linkedEntity === "COURSE_CONTENT") input.courseContentId = value;
    if (selectedType?.linkedEntity === "ASSESSMENT") input.assessmentId = value;
    if (selectedType?.linkedEntity === "LIVE_SESSION") input.liveSessionId = value;
    if (selectedType?.linkedEntity === "SURVEY") input.surveyId = value;
    return input;
  };
  const save = async () => {
    if (!draft.title.trim() || !draft.taskTypeId) return setMutationError("Title and task type are required.");
    if (selectedType?.linkedEntity !== "NONE" && !draft.linkedEntityId) return setMutationError(`This task type requires a ${selectedType?.linkedEntity.toLowerCase().replace(/_/g, " ")} ID.`);
    const percentageFields = [draft.minimumScore, draft.minimumAttendance].filter(Boolean).map(Number);
    if (percentageFields.some((value) => value < 0 || value > 100)) return setMutationError("Minimum score and attendance must be between 0 and 100.");
    if (draft.maxSubmissions && Number(draft.maxSubmissions) < 1) return setMutationError("Maximum submissions must be at least 1.");
    if (draft.peerReviewRequired && (!draft.requiredPeerReviewCount || Number(draft.requiredPeerReviewCount) < 1)) return setMutationError("Required peer review count must be at least 1.");
    setSaving(true); setMutationError("");
    try { const input = buildInput(); if (editingId) await programApi.tasks.update(programId, editingId, input); else await programApi.tasks.create(programId, input); closeForm(); await load(); onChanged(); }
    catch (reason: unknown) { setMutationError(mutationMessage(reason, "Unable to save task.")); }
    finally { setSaving(false); }
  };
  const reorder = async (index: number, offset: number) => {
    const next = [...items]; const target = index + offset; if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; setSaving(true); setMutationError("");
    try { setItems(await programApi.tasks.reorder(programId, { orderedIds: next.map((item) => item.id) })); onChanged(); }
    catch (reason: unknown) { setMutationError(mutationMessage(reason, "Unable to reorder tasks.")); }
    finally { setSaving(false); }
  };
  const remove = async (item: ProgramTask) => {
    if (!window.confirm(`Delete task “${item.title}”?`)) return; setSaving(true); setMutationError("");
    try { await programApi.tasks.delete(programId, item.id); await load(); onChanged(); }
    catch (reason: unknown) { setMutationError(mutationMessage(reason, "Unable to delete task.")); }
    finally { setSaving(false); }
  };

  return <HRProgramSectionShell title="Tasks" description="Add typed requirements, links, due scheduling, phases, blocking rules, and XP awards." icon={CheckSquare} loading={loading} error={error} onRetry={() => void load()} actions={canWrite && !showForm ? <button type="button" onClick={() => setShowForm(true)} className={programButtonClass} style={{ background: P.lightSage, color: P.olive }}><Plus size={13} /> Add task</button> : undefined}>
    <div className="space-y-3"><SectionMutationError message={mutationError} />
      {showForm && <div className="space-y-3 rounded-xl border p-4" style={{ borderColor: P.border, background: P.bg }}><div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>Title<input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label><label className="sm:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>Description<textarea rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} className={`${programFieldClass} mt-1 resize-y`} style={{ borderColor: P.border }} /></label><label className="text-xs font-semibold" style={{ color: P.textMid }}>Task type<select value={draft.taskTypeId} onChange={(e) => setDraft({ ...draft, taskTypeId: e.target.value, linkedEntityId: "" })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }}><option value="">Select type…</option>{types.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</select></label>{selectedType?.linkedEntity === "COURSE_VERSION" ? <label className="text-xs font-semibold" style={{ color: P.textMid }}>Linked course<select value={draft.linkedEntityId} onChange={(e) => setDraft({ ...draft, linkedEntityId: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }}><option value="">Select attached course…</option>{courses.map((course) => <option key={course.courseVersionId} value={course.courseVersionId}>{course.courseVersion.course.title}</option>)}</select></label> : selectedType && selectedType.linkedEntity !== "NONE" ? <label className="text-xs font-semibold" style={{ color: P.textMid }}>{selectedType.linkedEntity.replace(/_/g, " ")} ID<input type="number" min={1} value={draft.linkedEntityId} onChange={(e) => setDraft({ ...draft, linkedEntityId: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label> : <div />}
        <label className="text-xs font-semibold" style={{ color: P.textMid }}>Schedule by<select value={draft.dueMode} onChange={(e) => setDraft({ ...draft, dueMode: e.target.value as Draft["dueMode"], dueDate: "", dueOffsetDays: "" })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }}><option value="offset">Offset from start</option><option value="date">Exact date</option></select></label>{draft.dueMode === "date" ? <label className="text-xs font-semibold" style={{ color: P.textMid }}>Due date<input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label> : <label className="text-xs font-semibold" style={{ color: P.textMid }}>Due offset days<input type="number" min={0} value={draft.dueOffsetDays} onChange={(e) => setDraft({ ...draft, dueOffsetDays: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label>}<label className="text-xs font-semibold" style={{ color: P.textMid }}>Phase number<input type="number" min={1} value={draft.phaseNumber} onChange={(e) => setDraft({ ...draft, phaseNumber: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label><label className="text-xs font-semibold" style={{ color: P.textMid }}>XP award<input type="number" min={0} value={draft.xpAward} onChange={(e) => setDraft({ ...draft, xpAward: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label><label className="text-xs font-semibold" style={{ color: P.textMid }}>Maximum submissions<input type="number" min={1} value={draft.maxSubmissions} onChange={(e) => setDraft({ ...draft, maxSubmissions: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label><label className="text-xs font-semibold" style={{ color: P.textMid }}>Minimum time (minutes)<input type="number" min={0} value={draft.minimumTimeMinutes} onChange={(e) => setDraft({ ...draft, minimumTimeMinutes: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label><label className="text-xs font-semibold" style={{ color: P.textMid }}>Minimum score (%)<input type="number" min={0} max={100} value={draft.minimumScore} onChange={(e) => setDraft({ ...draft, minimumScore: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label><label className="text-xs font-semibold" style={{ color: P.textMid }}>Minimum attendance (%)<input type="number" min={0} max={100} value={draft.minimumAttendance} onChange={(e) => setDraft({ ...draft, minimumAttendance: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label>{draft.peerReviewRequired && <label className="text-xs font-semibold" style={{ color: P.textMid }}>Required peer reviews<input type="number" min={1} value={draft.requiredPeerReviewCount} onChange={(e) => setDraft({ ...draft, requiredPeerReviewCount: e.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} /></label>}</div><div className="flex flex-wrap gap-4"><label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}><input type="checkbox" checked={draft.isRequired} onChange={(e) => setDraft({ ...draft, isRequired: e.target.checked })} style={{ accentColor: P.olive }} /> Required</label><label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}><input type="checkbox" checked={draft.isBlocking} onChange={(e) => setDraft({ ...draft, isBlocking: e.target.checked })} style={{ accentColor: P.olive }} /> Blocking</label><label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}><input type="checkbox" checked={draft.allowResubmission} onChange={(e) => setDraft({ ...draft, allowResubmission: e.target.checked })} style={{ accentColor: P.olive }} /> Allow resubmission</label><label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}><input type="checkbox" checked={draft.requiresManagerApproval} onChange={(e) => setDraft({ ...draft, requiresManagerApproval: e.target.checked })} style={{ accentColor: P.olive }} /> Manager approval</label><label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}><input type="checkbox" checked={draft.peerReviewRequired} onChange={(e) => setDraft({ ...draft, peerReviewRequired: e.target.checked })} style={{ accentColor: P.olive }} /> Peer review</label></div><div className="flex justify-end gap-2"><button type="button" onClick={closeForm} className={programButtonClass} style={{ color: P.textMid }}><X size={13} /> Cancel</button><button type="button" onClick={() => void save()} disabled={saving} className={`${programButtonClass} text-white`} style={{ background: P.olive }}><Check size={13} /> {saving ? "Saving…" : editingId ? "Update" : "Create"}</button></div></div>}
      {items.length ? <div className="space-y-2">{items.map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: P.border }}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: P.lightSage, color: P.olive }}>{item.displayOrder}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-xs font-semibold" style={{ color: P.text }}>{item.title}</p><span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: P.bg, color: P.textMuted }}>{item.taskType.name}</span>{item.isRequired && <span className="text-[9px] font-bold" style={{ color: P.olive }}>REQUIRED</span>}{item.isBlocking && <span className="text-[9px] font-bold text-red-700">BLOCKING</span>}</div><p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>{item.dueDate ? `Due ${toDateInput(item.dueDate)}` : item.dueOffsetDays != null ? `Due day ${item.dueOffsetDays}` : "No due schedule"}{item.phaseNumber ? ` · Phase ${item.phaseNumber}` : ""}{item.maxSubmissions != null ? ` · max ${item.maxSubmissions} submissions` : " · unlimited submissions"}{item.xpAward != null ? ` · ${item.xpAward} XP` : ""} · {item._count.submissions} received</p></div>{canWrite && <div className="flex"><button type="button" disabled={saving || index === 0} onClick={() => void reorder(index, -1)} className="p-1.5 disabled:opacity-30"><ArrowUp size={13} /></button><button type="button" disabled={saving || index === items.length - 1} onClick={() => void reorder(index, 1)} className="p-1.5 disabled:opacity-30"><ArrowDown size={13} /></button><button type="button" onClick={() => { setEditingId(item.id); setDraft(fromTask(item)); setShowForm(true); setMutationError(""); }} className="p-1.5" style={{ color: P.olive }}><Edit3 size={13} /></button><button type="button" disabled={saving} onClick={() => void remove(item)} className="p-1.5" style={{ color: "#C0392B" }}><Trash2 size={13} /></button></div>}</div>)}</div> : !showForm && <p className="rounded-xl border p-4 text-xs" style={{ borderColor: P.border, color: P.textMuted }}>No tasks are configured. Approval readiness requires at least one required task or course.</p>}
    </div>
  </HRProgramSectionShell>;
}
