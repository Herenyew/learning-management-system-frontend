import { useEffect, useState } from "react";
import { Check, Edit3, FilePenLine, X } from "lucide-react";
import { catalogConfigurationApi, type ProgramCategoryDto, type ProgramTypeDto } from "../../API/catalogConfiguration.api";
import { programApi } from "../../API/program.api";
import type { CreateProgramInput, Program, ProgramOwnerOption, ProgramVisibility, UpdateProgramInput } from "../../models/program.model";
import { P } from "./extended.shared";
import {
  HRProgramSectionShell,
  SectionMutationError,
  mutationMessage,
  nullableNumber,
  programButtonClass,
  programFieldClass,
  toDateInput,
} from "./HRProgramSectionShell";

type Draft = {
  name: string;
  description: string;
  programTypeId: string;
  programCategoryId: string;
  ownerEmployeeId: string;
  visibility: ProgramVisibility;
  startDate: string;
  endDate: string;
  rollingEnrollment: boolean;
  maxEnrollments: string;
};

const fromProgram = (program: Program): Draft => ({
  name: program.name,
  description: program.description ?? "",
  programTypeId: String(program.programTypeId),
  programCategoryId: program.programCategoryId ? String(program.programCategoryId) : "",
  ownerEmployeeId: program.ownerEmployeeId,
  visibility: program.visibility,
  startDate: toDateInput(program.startDate),
  endDate: toDateInput(program.endDate),
  rollingEnrollment: program.rollingEnrollment,
  maxEnrollments: program.maxEnrollments ? String(program.maxEnrollments) : "",
});

export function HRProgramMetadataSection({
  program,
  canWrite,
  onSaved,
}: {
  program: Program;
  canWrite: boolean;
  onSaved: (program: Program) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => fromProgram(program));
  const [types, setTypes] = useState<ProgramTypeDto[]>([]);
  const [categories, setCategories] = useState<ProgramCategoryDto[]>([]);
  const [owners, setOwners] = useState<ProgramOwnerOption[]>([]);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setDraft(fromProgram(program)), [program]);

  useEffect(() => {
    if (!editing || types.length) return;
    const controller = new AbortController();
    setReferenceLoading(true);
    Promise.all([
      catalogConfigurationApi.listProgramTypes(controller.signal),
      catalogConfigurationApi.listProgramCategories(controller.signal),
      programApi.listOwnerOptions(controller.signal),
    ]).then(([nextTypes, nextCategories, nextOwners]) => {
      if (!controller.signal.aborted) {
        setTypes(nextTypes.filter((item) => item.isActive || item.id === program.programTypeId));
        setCategories(nextCategories.filter((item) => item.isActive || item.id === program.programCategoryId));
        setOwners(nextOwners);
      }
    }).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(mutationMessage(reason, "Unable to load program options."));
    }).finally(() => {
      if (!controller.signal.aborted) setReferenceLoading(false);
    });
    return () => controller.abort();
  }, [editing, program.programCategoryId, program.programTypeId, types.length]);

  const save = async () => {
    setError("");
    if (!draft.name.trim()) return setError("Program name is required.");
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) return setError("End date must be after start date.");
    const nextValues: CreateProgramInput = {
      name: draft.name.trim(),
      description: draft.description.trim() || null,
      programTypeId: Number(draft.programTypeId),
      programCategoryId: draft.programCategoryId ? Number(draft.programCategoryId) : null,
      ownerEmployeeId: draft.ownerEmployeeId,
      visibility: draft.visibility,
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
      rollingEnrollment: draft.rollingEnrollment,
      maxEnrollments: nullableNumber(draft.maxEnrollments),
    };
    const currentValues: CreateProgramInput = {
      name: program.name,
      description: program.description ?? null,
      programTypeId: program.programTypeId,
      programCategoryId: program.programCategoryId ?? null,
      ownerEmployeeId: program.ownerEmployeeId,
      visibility: program.visibility,
      startDate: toDateInput(program.startDate) || null,
      endDate: toDateInput(program.endDate) || null,
      rollingEnrollment: program.rollingEnrollment,
      maxEnrollments: program.maxEnrollments ?? null,
    };
    const input = Object.fromEntries(
      (Object.keys(nextValues) as Array<keyof CreateProgramInput>)
        .filter((key) => nextValues[key] !== currentValues[key])
        .map((key) => [key, nextValues[key]]),
    ) as UpdateProgramInput;
    if (Object.keys(input).length === 0) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const saved = await programApi.update(program.id, input);
      onSaved(saved);
      setEditing(false);
    } catch (reason: unknown) {
      setError(mutationMessage(reason, "Unable to update program metadata."));
    } finally {
      setSaving(false);
    }
  };

  const metadata = [
    ["Program Type", program.programType?.name ?? `Type #${program.programTypeId}`],
    ["Category", program.programCategory?.name ?? "Not set"],
    ["HR Owner", program.owner?.fullName ?? program.ownerEmployee?.fullName ?? program.ownerEmployeeId],
    ["Visibility", program.visibility.replace(/_/g, " ")],
    ["Start Date", program.startDate ? new Date(program.startDate).toLocaleDateString() : "Not set"],
    ["End Date", program.endDate ? new Date(program.endDate).toLocaleDateString() : "Not set"],
    ["Duration", program.durationDays ? `${program.durationDays} days` : "Not scheduled"],
    ["Capacity", program.maxEnrollments ? `${program.maxEnrollments} learners` : "No limit"],
    ["Enrollment", program.rollingEnrollment ? "Rolling" : "Fixed"],
  ];

  return (
    <HRProgramSectionShell
      title="Program metadata"
      description={canWrite ? "Core details can be edited while the program is a draft with no pending review." : "Core program details and schedule."}
      icon={FilePenLine}
      actions={canWrite && !editing ? <button type="button" onClick={() => { setError(""); setEditing(true); }} className={programButtonClass} style={{ background: P.lightSage, color: P.olive }}><Edit3 size={13} /> Edit</button> : undefined}
    >
      {editing ? (
        <div className="space-y-4">
          <SectionMutationError message={error} />
          <div className="grid gap-3 md:grid-cols-2">
            <label className="md:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>Name<input className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            <label className="md:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>Description<textarea rows={3} className={`${programFieldClass} mt-1.5 resize-y`} style={{ borderColor: P.border }} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>Program type<select className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} disabled={referenceLoading} value={draft.programTypeId} onChange={(event) => setDraft({ ...draft, programTypeId: event.target.value })}>{types.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>Category<select className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} disabled={referenceLoading} value={draft.programCategoryId} onChange={(event) => setDraft({ ...draft, programCategoryId: event.target.value })}><option value="">No category</option>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>HR owner<select className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} disabled={referenceLoading} value={draft.ownerEmployeeId} onChange={(event) => setDraft({ ...draft, ownerEmployeeId: event.target.value })}>{owners.map((item) => <option key={item.id} value={item.id}>{item.name}{item.email ? ` — ${item.email}` : ""}</option>)}</select></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>Visibility<select className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} value={draft.visibility} onChange={(event) => setDraft({ ...draft, visibility: event.target.value as ProgramVisibility })}>{["PUBLIC", "COMPANY", "ENROLLED_ONLY", "INVITATION_ONLY"].map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>Start date<input type="date" className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>End date<input type="date" className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></label>
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>Maximum enrollments<input type="number" min={1} className={`${programFieldClass} mt-1.5`} style={{ borderColor: P.border }} value={draft.maxEnrollments} onChange={(event) => setDraft({ ...draft, maxEnrollments: event.target.value })} /></label>
            <label className="flex items-center gap-2 self-end rounded-lg border px-3 py-2.5 text-xs font-semibold" style={{ borderColor: P.border, color: P.textMid }}><input type="checkbox" checked={draft.rollingEnrollment} onChange={(event) => setDraft({ ...draft, rollingEnrollment: event.target.checked })} style={{ accentColor: P.olive }} /> Rolling enrollment</label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setDraft(fromProgram(program)); setEditing(false); setError(""); }} disabled={saving} className={programButtonClass} style={{ border: `1px solid ${P.border}`, color: P.textMid }}><X size={13} /> Cancel</button>
            <button type="button" onClick={() => void save()} disabled={saving || referenceLoading} className={`${programButtonClass} text-white`} style={{ background: P.olive }}><Check size={13} /> {saving ? "Saving…" : "Save metadata"}</button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{metadata.map(([label, value]) => <div key={label} className="rounded-xl border p-3" style={{ borderColor: P.border, background: P.bg }}><p className="text-[10px] font-bold uppercase" style={{ color: P.textMuted }}>{label}</p><p className="mt-1 text-xs font-semibold" style={{ color: P.textMid }}>{value}</p></div>)}</div>
      )}
    </HRProgramSectionShell>
  );
}
