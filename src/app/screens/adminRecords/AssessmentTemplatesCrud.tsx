import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  CrudModal,
  CrudShell,
  Field,
  HelpCircle,
  Inp,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Textarea,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  assessmentConfigApi,
  type AssessmentTemplateDto,
} from "../../API/assessment-config.api";
import { usePermission } from "../../hooks/usePermission";

type ShowCorrectAnswers = "IMMEDIATELY" | "AFTER_SUBMIT" | "NEVER";

const SHOW_CORRECT_LABELS: Record<ShowCorrectAnswers, string> = {
  IMMEDIATELY: "Immediately",
  AFTER_SUBMIT: "After submission",
  NEVER: "Never",
};

type AssessmentTemplateRow = CrudRow & {
  description: string;
  assessmentTypeId: number | "";
  gradingMethodId: number | "";
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number;
  questionCount: number;
  questionBankId: number | "";
  negativeMarking: number;
  showCorrectAnswers: ShowCorrectAnswers;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultImmediately: boolean;
  allowReview: boolean;
  lockdownBrowser: boolean;
  proctoringEnabled: boolean;
  tabSwitchDetection: boolean;
};

function dtoToRow(dto: AssessmentTemplateDto): AssessmentTemplateRow {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    assessmentTypeId: dto.assessmentTypeId,
    gradingMethodId: dto.gradingMethodId,
    passingScore: Number(dto.passingScore ?? 0),
    maxAttempts: Number(dto.maxAttempts ?? 1),
    timeLimitMinutes: Number(dto.timeLimitMinutes ?? 0),
    questionCount: Number(dto.questionCount ?? 0),
    questionBankId: dto.questionBankId ?? "",
    negativeMarking: Number(dto.negativeMarking ?? 0),
    showCorrectAnswers: (dto.showCorrectAnswers as ShowCorrectAnswers) ?? "AFTER_SUBMIT",
    randomizeQuestions: Boolean(dto.randomizeQuestions),
    randomizeOptions: Boolean(dto.randomizeOptions),
    showResultImmediately: Boolean(dto.showResultImmediately),
    allowReview: Boolean(dto.allowReview),
    lockdownBrowser: Boolean(dto.lockdownBrowser),
    proctoringEnabled: Boolean(dto.proctoringEnabled),
    tabSwitchDetection: Boolean(dto.tabSwitchDetection),
    status: dto.isActive ? "Active" : "Disabled",
  };
}

function AssessmentTemplateForm({
  row,
  assessmentTypes,
  gradingMethods,
  onSave,
  onClose,
}: {
  row: AssessmentTemplateRow | null;
  assessmentTypes: { id: number; name: string }[];
  gradingMethods: { id: number; name: string }[];
  onSave: (r: AssessmentTemplateRow) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<AssessmentTemplateRow>(() => {
    if (row) return row;
    return {
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      assessmentTypeId: assessmentTypes[0]?.id ?? "",
      gradingMethodId: gradingMethods[0]?.id ?? "",
      passingScore: 70,
      maxAttempts: 3,
      timeLimitMinutes: 0,
      questionCount: 10,
      questionBankId: "",
      negativeMarking: 0,
      showCorrectAnswers: "AFTER_SUBMIT",
      randomizeQuestions: false,
      randomizeOptions: false,
      showResultImmediately: false,
      allowReview: true,
      lockdownBrowser: false,
      proctoringEnabled: false,
      tabSwitchDetection: false,
      status: "Active",
    };
  });
  return (
    <CrudModal title={row ? "Edit Assessment Template" : "New Assessment Template"} onClose={onClose}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <Field label="Template Name" required>
          <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. End-of-course Knowledge Check" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Describe this assessment template…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Assessment Type" required>
            <Sel value={String(form.assessmentTypeId)} onChange={(v) => setForm({ ...form, assessmentTypeId: v ? Number(v) : "" })} options={assessmentTypes.map((t) => ({ value: String(t.id), label: t.name }))} />
          </Field>
          <Field label="Grading Method" required>
            <Sel value={String(form.gradingMethodId)} onChange={(v) => setForm({ ...form, gradingMethodId: v ? Number(v) : "" })} options={gradingMethods.map((m) => ({ value: String(m.id), label: m.name }))} />
          </Field>
          <Field label="Passing Score (%)">
            <Inp type="number" value={String(form.passingScore)} onChange={(v) => setForm({ ...form, passingScore: Number(v) })} />
          </Field>
          <Field label="Max Attempts">
            <Inp type="number" value={String(form.maxAttempts)} onChange={(v) => setForm({ ...form, maxAttempts: Number(v) })} />
          </Field>
          <Field label="Time Limit (min)">
            <Inp type="number" value={String(form.timeLimitMinutes)} onChange={(v) => setForm({ ...form, timeLimitMinutes: Number(v) })} />
          </Field>
          <Field label="Question Count">
            <Inp type="number" value={String(form.questionCount)} onChange={(v) => setForm({ ...form, questionCount: Number(v) })} />
          </Field>
          <Field label="Question Bank ID">
            <Inp type="number" value={String(form.questionBankId)} onChange={(v) => setForm({ ...form, questionBankId: v ? Number(v) : "" })} placeholder="Optional" />
          </Field>
          <Field label="Negative Marking">
            <Inp type="number" value={String(form.negativeMarking)} onChange={(v) => setForm({ ...form, negativeMarking: Number(v) })} step="0.01" />
          </Field>
          <Field label="Show Correct Answers">
            <Sel value={form.showCorrectAnswers} onChange={(v) => setForm({ ...form, showCorrectAnswers: v as ShowCorrectAnswers })} options={["IMMEDIATELY", "AFTER_SUBMIT", "NEVER"]} labels={SHOW_CORRECT_LABELS} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Randomize Questions">
            <Sel value={form.randomizeQuestions ? "Yes" : "No"} onChange={(v) => setForm({ ...form, randomizeQuestions: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Randomize Options">
            <Sel value={form.randomizeOptions ? "Yes" : "No"} onChange={(v) => setForm({ ...form, randomizeOptions: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Show Result Immediately">
            <Sel value={form.showResultImmediately ? "Yes" : "No"} onChange={(v) => setForm({ ...form, showResultImmediately: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Allow Review">
            <Sel value={form.allowReview ? "Yes" : "No"} onChange={(v) => setForm({ ...form, allowReview: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Lockdown Browser">
            <Sel value={form.lockdownBrowser ? "Yes" : "No"} onChange={(v) => setForm({ ...form, lockdownBrowser: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Proctoring Enabled">
            <Sel value={form.proctoringEnabled ? "Yes" : "No"} onChange={(v) => setForm({ ...form, proctoringEnabled: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Tab Switch Detection">
            <Sel value={form.tabSwitchDetection ? "Yes" : "No"} onChange={(v) => setForm({ ...form, tabSwitchDetection: v === "Yes" })} options={["Yes", "No"]} />
          </Field>
          <Field label="Status">
            <Sel value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Active", "Disabled"]} />
          </Field>
        </div>
        <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function AssessmentTemplatesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<AssessmentTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assessmentTypes, setAssessmentTypes] = useState<{ id: number; name: string }[]>([]);
  const [gradingMethods, setGradingMethods] = useState<{ id: number; name: string }[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await assessmentConfigApi.templates.list({ page: 1, limit: 100 }, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load assessment templates.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  useEffect(() => {
    const c = new AbortController();
    void Promise.all([
      assessmentConfigApi.assessmentTypes.list({}, c.signal).catch(() => []),
      assessmentConfigApi.gradingMethods.list({}, c.signal).catch(() => []),
    ]).then(([ats, gms]) => {
      if (!c.signal.aborted) {
        setAssessmentTypes(ats.map((x: any) => ({ id: x.id, name: x.name })));
        setGradingMethods(gms.map((x: any) => ({ id: x.id, name: x.name })));
      }
    });
    return () => c.abort();
  }, []);

  const typeName = useMemo(() => Object.fromEntries(assessmentTypes.map((t) => [t.id, t.name])), [assessmentTypes]);
  const gradingName = useMemo(() => Object.fromEntries(gradingMethods.map((g) => [g.id, g.name])), [gradingMethods]);

  const persistSave = async (row: AssessmentTemplateRow): Promise<AssessmentTemplateRow> => {
    if (!row.name || row.name.trim().length === 0) throw new Error("Template name is required.");
    if (!row.assessmentTypeId) throw new Error("Please select an assessment type.");
    if (!row.gradingMethodId) throw new Error("Please select a grading method.");
    const input = {
      name: row.name.trim(),
      description: row.description.trim() || undefined,
      assessmentTypeId: Number(row.assessmentTypeId),
      gradingMethodId: Number(row.gradingMethodId),
      passingScore: Number(row.passingScore) || 0,
      maxAttempts: Number(row.maxAttempts) || 1,
      timeLimitMinutes: Number(row.timeLimitMinutes) || undefined,
      questionCount: Number(row.questionCount) || 0,
      questionBankId: Number(row.questionBankId) || undefined,
      negativeMarking: Number(row.negativeMarking) || undefined,
      showCorrectAnswers: row.showCorrectAnswers,
      randomizeQuestions: row.randomizeQuestions,
      randomizeOptions: row.randomizeOptions,
      showResultImmediately: row.showResultImmediately,
      allowReview: row.allowReview,
      lockdownBrowser: row.lockdownBrowser,
      proctoringEnabled: row.proctoringEnabled,
      tabSwitchDetection: row.tabSwitchDetection,
      isActive: row.status === "Active",
    };
    const isNew = row.id.startsWith("new-");
    const dto = isNew
      ? await assessmentConfigApi.templates.create(input)
      : await assessmentConfigApi.templates.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => {
    await assessmentConfigApi.templates.delete(Number(id));
  };

  const persistToggle = async (id: string, nextStatus: string) => {
    await assessmentConfigApi.templates.update(Number(id), { isActive: nextStatus === "Active" });
  };

  if (!can("assessment_template.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view assessment templates.
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}>
        <Loader2 size={15} className="animate-spin" /> Loading assessment templates…
      </div>
    );

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => void load()} className="ml-auto underline">Retry</button>
        </div>
      )}
      {!error && (
        <CrudShell<AssessmentTemplateRow>
          title="Assessment Templates"
          sub="Reusable assessment templates — question counts, pass scores, and attempts"
          icon={HelpCircle}
          columns={[
            { key: "name", label: "Template Name", sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
            { key: "assessmentTypeId", label: "Assessment Type", render: (r) => r.assessmentTypeId ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{typeName[Number(r.assessmentTypeId)] ?? `#${r.assessmentTypeId}`}</span> : "—" },
            { key: "questionCount", label: "Questions", render: (r) => <p className="text-xs font-mono" style={{ color: P.text }}>{r.questionCount}</p> },
            { key: "passingScore", label: "Pass %", render: (r) => <p className="text-xs font-mono" style={{ color: P.textMuted }}>{r.passingScore}%</p> },
            { key: "maxAttempts", label: "Attempts", render: (r) => <p className="text-xs font-mono" style={{ color: P.textMuted }}>{r.maxAttempts}</p> },
            { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
          onRows={setRows}
          persistSave={persistSave}
          persistDelete={persistDelete}
          persistToggle={persistToggle}
          filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
          createLabel="New Template"
          showArchive={false}
          toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Activate", disableLabel: "Deactivate" }}
          cloneRow={(r) => ({ ...r, id: `new-${Date.now()}`, name: `${r.name} (Copy)`, status: "Disabled" })}
          renderForm={(row, onSave, onClose) => (
            <AssessmentTemplateForm
              row={row}
              assessmentTypes={assessmentTypes}
              gradingMethods={gradingMethods}
              onSave={onSave}
              onClose={onClose}
            />
          )}
        />
      )}
    </div>
  );
}
