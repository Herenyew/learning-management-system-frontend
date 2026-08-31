import React, { useCallback, useEffect, useState } from "react";
import { LayoutList, ChevronDown, ChevronRight, ChevronUp, Loader2, AlertCircle, Trash2, Pencil, Plus, Check, X, GripVertical, Eye, EyeOff } from "lucide-react";
import { P } from "./shared/theme";
import { surveyConfigApi, type SurveyQuestionTypeDto, type SurveyTemplateQuestionDto, type ConfigJson } from "../../API/survey-config.api";

// ─── Shared types ───────────────────────────────────────────────────────────

/** A question being edited in the builder (client-side identity via `key`). */
export type BuilderQuestion = {
  key: string;
  questionTypeId: number;
  questionText: string;
  isRequired: boolean;
  configJson: ConfigJson | null;
};

type FieldType = "text" | "number" | "boolean" | "select" | "options";

/** One dynamic form field, defined by a question type's configJson. */
type FieldSpec = {
  key: string;
  label: string;
  type: FieldType;
  default?: unknown;
  choices?: string[];
  minItems?: number;
  itemPlaceholder?: string;
  min?: number;
  max?: number;
  placeholder?: string;
};

// ─── Config helpers (driven by the question type's configJson — no hardcoding) ──

function getFieldSpecs(questionType?: SurveyQuestionTypeDto): FieldSpec[] {
  const cfg = questionType?.configJson as { fields?: FieldSpec[] } | null | undefined;
  const fields = cfg && typeof cfg === "object" ? cfg.fields : undefined;
  return Array.isArray(fields) ? fields.filter(f => f && typeof f.key === "string" && typeof f.type === "string") : [];
}

/** Build a fresh config object with defaults for the given question type. */
function defaultConfigFor(questionType?: SurveyQuestionTypeDto): ConfigJson {
  const config: ConfigJson = {};
  for (const spec of getFieldSpecs(questionType)) {
    if (spec.default !== undefined) config[spec.key] = spec.default;
    else if (spec.type === "options") config[spec.key] = [];
    else if (spec.type === "boolean") config[spec.key] = false;
    else if (spec.type === "select" || spec.type === "text") config[spec.key] = "";
  }
  return config;
}

/** Drop empty option strings / trim strings before persisting. */
function cleanConfig(questionType: SurveyQuestionTypeDto | undefined, config: ConfigJson): ConfigJson {
  const cleaned: ConfigJson = {};
  for (const spec of getFieldSpecs(questionType)) {
    const value = config[spec.key];
    if (value === undefined || value === null || value === "") continue;
    if (spec.type === "options" && Array.isArray(value)) {
      const items = (value as unknown[]).map(v => String(v).trim()).filter(Boolean);
      if (items.length) cleaned[spec.key] = items;
    } else if (spec.type === "text" || spec.type === "select") {
      cleaned[spec.key] = String(value).trim();
    } else {
      cleaned[spec.key] = value;
    }
  }
  return cleaned;
}

/** Validate the editor state against the question type's field specs. */
function validateConfig(questionType: SurveyQuestionTypeDto | undefined, config: ConfigJson): string | null {
  for (const spec of getFieldSpecs(questionType)) {
    const value = config[spec.key];
    if (spec.type === "options") {
      const items = Array.isArray(value) ? (value as unknown[]).map(v => String(v).trim()).filter(Boolean) : [];
      const needed = spec.minItems ?? 1;
      if (items.length < needed) return `"${spec.label}": add at least ${needed} option${needed > 1 ? "s" : ""}.`;
    } else if (spec.type === "number" && typeof value === "number") {
      if (spec.min !== undefined && value < spec.min) return `"${spec.label}" must be ≥ ${spec.min}.`;
      if (spec.max !== undefined && value > spec.max) return `"${spec.label}" must be ≤ ${spec.max}.`;
    }
  }
  return null;
}

// ─── DynamicConfigFields: renders one input per field spec (NO JSON for users) ──

function DynamicConfigFields({ specs, config, onChange }: { specs: FieldSpec[]; config: ConfigJson; onChange: (key: string, value: unknown) => void }) {
  if (!specs.length) return null;
  return (
    <div className="space-y-2">
      {specs.map(spec => {
        const value = config[spec.key];
        if (spec.type === "boolean") {
          return (
            <label key={spec.key} className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}>
              <input type="checkbox" checked={Boolean(value)} onChange={e => onChange(spec.key, e.target.checked)} style={{ accentColor: P.olive }} />
              {spec.label}
            </label>
          );
        }
        if (spec.type === "select") {
          return (
            <label key={spec.key} className="block">
              <span className="text-[11px] font-medium" style={{ color: P.textMid }}>{spec.label}</span>
              <select value={String(value ?? "")} onChange={e => onChange(spec.key, e.target.value)} className="mt-0.5 w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
                <option value="">None</option>
                {(spec.choices ?? []).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          );
        }
        if (spec.type === "options") {
          const items = Array.isArray(value) ? (value as unknown[]).map(String) : [];
          return (
            <div key={spec.key}>
              <span className="text-[11px] font-medium" style={{ color: P.textMid }}>{spec.label}</span>
              <div className="mt-1 space-y-1.5">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-1.5">
                    <input value={item} onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(spec.key, next); }} placeholder={spec.itemPlaceholder ?? "Option text"} className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
                    <button type="button" onClick={() => onChange(spec.key, items.filter((_, j) => j !== i))} title="Remove option" className="px-2 rounded-lg hover:bg-red-50" style={{ color: "#C0392B" }}><X size={13} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => onChange(spec.key, [...items, ""])} className="flex items-center gap-1 text-[11px] font-semibold hover:underline" style={{ color: P.olive }}>
                  <Plus size={11} /> Add option
                </button>
              </div>
            </div>
          );
        }
        // text | number
        return (
          <label key={spec.key} className="block">
            <span className="text-[11px] font-medium" style={{ color: P.textMid }}>{spec.label}</span>
            <input type={spec.type === "number" ? "number" : "text"} value={value === undefined || value === null ? "" : String(value)} min={spec.min} max={spec.max} placeholder={spec.placeholder} onChange={e => onChange(spec.key, spec.type === "number" ? (e.target.value === "" ? undefined : Number(e.target.value)) : e.target.value)} className="mt-0.5 w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
          </label>
        );
      })}
    </div>
  );
}

// ─── TemplatePreview: read-only view of the template as a survey ────────────

function PreviewControl({ config }: { config: ConfigJson | null }) {
  const cfg = config ?? {};
  const options = Array.isArray(cfg.options) ? (cfg.options as unknown[]).map(String).filter(Boolean) : null;

  if (options && options.length) {
    const control = cfg.allowMultiple ? "checkbox" : "radio";
    return (
      <div className="mt-1.5 space-y-1">
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-2 text-xs" style={{ color: P.text }}>
            <input type={control} disabled style={{ accentColor: P.olive }} /> {opt}
          </label>
        ))}
      </div>
    );
  }
  if (typeof cfg.min === "number" && typeof cfg.max === "number" && cfg.max > cfg.min) {
    const step = typeof cfg.step === "number" && cfg.step > 0 ? cfg.step : 1;
    const values: number[] = [];
    for (let v = cfg.min; v <= cfg.max && values.length < 12; v += step) values.push(v);
    return (
      <div className="mt-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {values.map(v => (
            <span key={v} className="flex items-center justify-center w-7 h-7 rounded-lg text-[11px] font-semibold" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>{v}</span>
          ))}
        </div>
        {(Boolean(cfg.minLabel) || Boolean(cfg.maxLabel)) && (
          <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>{String(cfg.minLabel ?? "")} → {String(cfg.maxLabel ?? "")}</p>
        )}
      </div>
    );
  }
  if ("defaultValue" in cfg) {
    const choices = ["Yes", "No", ...(cfg.neutralOption ? ["Neutral"] : [])];
    return (
      <div className="mt-1.5 space-y-1">
        {choices.map(c => (
          <label key={c} className="flex items-center gap-2 text-xs" style={{ color: P.text }}>
            <input type="radio" defaultChecked={cfg.defaultValue === c} disabled style={{ accentColor: P.olive }} /> {c}
          </label>
        ))}
      </div>
    );
  }
  return (
    <div className="mt-1.5">
      <input disabled placeholder={typeof cfg.placeholder === "string" ? cfg.placeholder : "Type your answer…"} maxLength={typeof cfg.maxLength === "number" ? cfg.maxLength : undefined} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
      {typeof cfg.minLength === "number" && cfg.minLength > 0 && (
        <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>Minimum {cfg.minLength} characters.</p>
      )}
    </div>
  );
}

export function TemplatePreview({ questions, questionTypes }: { questions: BuilderQuestion[]; questionTypes: SurveyQuestionTypeDto[] }) {
  if (!questions.length) {
    return <p className="text-[11px] py-2" style={{ color: P.textMuted }}>No questions to preview yet.</p>;
  }
  const nameOf = (id: number) => questionTypes.find(qt => qt.id === id)?.name ?? `Type #${id}`;
  return (
    <div className="p-3 rounded-lg space-y-3" style={{ background: P.paleGreen, border: `1px solid ${P.border}` }}>
      {questions.map((q, i) => (
        <div key={q.key}>
          <p className="text-xs font-medium" style={{ color: P.text }}>
            {i + 1}. {q.questionText}
            {q.isRequired && <span style={{ color: "#C0392B" }}> *</span>}
          </p>
          <p className="text-[10px]" style={{ color: P.textMuted }}>{nameOf(q.questionTypeId)}</p>
          <PreviewControl config={q.configJson} />
        </div>
      ))}
      <p className="text-[10px] pt-1" style={{ color: P.textMuted }}>* Required questions must be answered.</p>
    </div>
  );
}

// ─── QuestionBuilder: controlled list + editor (create AND edit modes) ──────

type EditorState = {
  editingKey: string | null; // null → adding a new question
  questionTypeId: string;
  questionText: string;
  isRequired: boolean;
  config: ConfigJson;
  error: string;
};

export function QuestionBuilder({ questions, onChange, questionTypes, disabled = false }: {
  questions: BuilderQuestion[];
  onChange: (next: BuilderQuestion[]) => void;
  questionTypes: SurveyQuestionTypeDto[];
  disabled?: boolean;
}) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const typeById = useCallback((id: number) => questionTypes.find(qt => qt.id === id), [questionTypes]);
  const specsFor = useCallback((id: number) => getFieldSpecs(typeById(id)), [typeById]);

  const openAdd = () => {
    const first = questionTypes.find(qt => qt.isActive) ?? questionTypes[0];
    setEditor({ editingKey: null, questionTypeId: first ? String(first.id) : "", questionText: "", isRequired: true, config: defaultConfigFor(first), error: "" });
  };

  const openEdit = (q: BuilderQuestion) => {
    const qt = typeById(q.questionTypeId);
    setEditor({ editingKey: q.key, questionTypeId: String(q.questionTypeId), questionText: q.questionText, isRequired: q.isRequired, config: q.configJson ?? defaultConfigFor(qt), error: "" });
  };

  // Business rule 5: changing the question type resets the configuration.
  const changeType = (idStr: string) => {
    setEditor(e => {
      if (!e) return e;
      const qt = typeById(Number(idStr));
      return { ...e, questionTypeId: idStr, config: defaultConfigFor(qt), error: "" };
    });
  };

  const setConfigValue = (key: string, value: unknown) => {
    setEditor(e => (e ? { ...e, config: { ...e.config, [key]: value } } : e));
  };

  const saveEditor = () => {
    if (!editor) return;
    const qt = typeById(Number(editor.questionTypeId));
    if (!qt) { setEditor({ ...editor, error: "Select a question type." }); return; }
    if (!editor.questionText.trim()) { setEditor({ ...editor, error: "Question text is required." }); return; }
    const configError = validateConfig(qt, editor.config);
    if (configError) { setEditor({ ...editor, error: configError }); return; }
    const item: BuilderQuestion = {
      key: editor.editingKey ?? `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      questionTypeId: qt.id,
      questionText: editor.questionText.trim(),
      isRequired: editor.isRequired,
      configJson: cleanConfig(qt, editor.config),
    };
    onChange(editor.editingKey ? questions.map(q => (q.key === item.key ? item : q)) : [...questions, item]);
    setEditor(null);
  };

  const removeQuestion = (key: string) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    onChange(questions.filter(q => q.key !== key));
    if (editor?.editingKey === key) setEditor(null);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const dropAt = (index: number) => {
    if (dragIndex === null || dragIndex === index) { setDragIndex(null); setOverIndex(null); return; }
    const next = [...questions];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(index, 0, moved);
    onChange(next);
    setDragIndex(null);
    setOverIndex(null);
  };

    const nameOf = (id: number) => typeById(id)?.name ?? `Type #${id}`;

  return (
    <div className="space-y-2">
      {questions.length === 0 && !editor && (
        <p className="text-[11px] py-1" style={{ color: P.textMuted }}>No questions yet. Add the first question below.</p>
      )}

      {questions.map((q, i) => (
        <div
          key={q.key}
          draggable={!disabled && editor === null}
          onDragStart={() => setDragIndex(i)}
          onDragOver={e => { e.preventDefault(); setOverIndex(i); }}
          onDragLeave={() => setOverIndex(prev => (prev === i ? null : prev))}
          onDrop={() => dropAt(i)}
          onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
          className="flex items-start gap-2 p-2 rounded-lg border"
          style={{
            borderColor: overIndex === i && dragIndex !== null && dragIndex !== i ? P.olive : P.border,
            background: dragIndex === i ? P.goldLight : P.paleGreen,
            opacity: dragIndex === i ? 0.6 : 1,
          }}
        >
          {!disabled && editor === null && (
            <span title="Drag to reorder" className="flex items-center cursor-grab shrink-0" style={{ color: P.textMuted }}>
              <GripVertical size={13} />
            </span>
          )}
          <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0" style={{ background: P.lightSage, color: P.darkOlive }}>{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium break-words" style={{ color: P.text }}>
              {q.questionText}
              {q.isRequired && <span className="ml-1" style={{ color: "#C0392B" }}>*</span>}
            </p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: P.goldLight, color: "#8A6A1A" }}>
              {nameOf(q.questionTypeId)}
            </span>
          </div>
          {!disabled && editor === null && (
            <div className="flex items-center gap-0.5 shrink-0">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up" className="p-1 rounded hover:bg-emerald-50 disabled:opacity-30" style={{ color: P.textMid }}><ChevronUp size={12} /></button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === questions.length - 1} title="Move down" className="p-1 rounded hover:bg-emerald-50 disabled:opacity-30" style={{ color: P.textMid }}><ChevronDown size={12} /></button>
              <button type="button" onClick={() => openEdit(q)} title="Edit question" className="p-1 rounded hover:bg-emerald-50" style={{ color: P.olive }}><Pencil size={12} /></button>
              <button type="button" onClick={() => removeQuestion(q.key)} title="Delete question" className="p-1 rounded hover:bg-red-50" style={{ color: "#C0392B" }}><Trash2 size={12} /></button>
            </div>
          )}
        </div>
      ))}

      {disabled ? null : editor === null ? (
        <button type="button" onClick={openAdd} disabled={!questionTypes.length} className="flex items-center gap-1 text-[11px] font-semibold hover:underline disabled:opacity-50" style={{ color: P.olive }}>
          <Plus size={12} /> Add question
        </button>
      ) : (
        <div className="p-3 rounded-lg border space-y-2" style={{ borderColor: P.border, background: "white" }}>
          {editor.error && (
            <div className="text-[11px] text-red-600 flex items-center gap-1"><AlertCircle size={11} />{editor.error}</div>
          )}
          <div className="flex gap-3 items-center">
            <select value={editor.questionTypeId} onChange={e => changeType(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
              <option value="">Select question type…</option>
              {questionTypes.map(qt => <option key={qt.id} value={qt.id}>{qt.name}{qt.isSystem ? " (system)" : ""}{!qt.isActive ? " (inactive)" : ""}</option>)}
            </select>
            <label className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: P.textMid }}>
              <input type="checkbox" checked={editor.isRequired} onChange={e => setEditor({ ...editor, isRequired: e.target.checked })} style={{ accentColor: P.olive }} />
              Required
            </label>
          </div>
          <textarea value={editor.questionText} onChange={e => setEditor({ ...editor, questionText: e.target.value })} rows={2} maxLength={5000} placeholder="Question text…" className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none resize-y" style={{ border: `1px solid ${P.border}`, color: P.text }} />
          <DynamicConfigFields specs={specsFor(Number(editor.questionTypeId))} config={editor.config} onChange={setConfigValue} />
          <div className="flex gap-2">
            <button type="button" onClick={saveEditor} disabled={!editor.questionText.trim() || !editor.questionTypeId} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
              <Check size={13} /> {editor.editingKey != null ? "Update question" : "Add question"}
            </button>
            <button type="button" onClick={() => setEditor(null)} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}



