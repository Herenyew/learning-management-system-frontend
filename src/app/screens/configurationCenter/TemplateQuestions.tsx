import React, { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronRight, ChevronUp, Loader2, AlertCircle, Trash2, Pencil, Plus, Check } from "lucide-react";
import { P } from "./shared/theme";
import { surveyConfigApi, type SurveyQuestionTypeDto, type SurveyTemplateQuestionDto, type ConfigJson } from "../../API/survey-config.api";

type QuestionForm = { questionTypeId: string; questionText: string; isRequired: boolean; configJsonText: string };
const emptyForm = (): QuestionForm => ({ questionTypeId: "", questionText: "", isRequired: true, configJsonText: "" });

function parseConfig(text: string): { value?: ConfigJson; error?: string } {
  const t = text.trim();
  if (!t) return { value: undefined };
  try {
    const parsed: unknown = JSON.parse(t);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return { error: "Configuration must be a JSON object, e.g. {\"max\": 5}." };
    return { value: parsed as ConfigJson };
  } catch {
    return { error: "Configuration is not valid JSON." };
  }
}

/**
 * Expandable per-template question builder: list, add, edit, delete and
 * reorder a survey template's questions (Dynamic Question Builder).
 */
export function TemplateQuestionsManager({ templateId, questionTypes, canUpdate }: { templateId: number; questionTypes: SurveyQuestionTypeDto[]; canUpdate: boolean }) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<SurveyTemplateQuestionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm());
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | "reorder" | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { const d = await surveyConfigApi.templateQuestions.list(templateId, signal); if (!signal?.aborted) setQuestions(d); }
    catch (e: any) { if (!signal?.aborted) setError(e?.message ?? "Failed to load questions."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [templateId]);

  useEffect(() => {
    if (!open) return;
    const c = new AbortController(); void load(c.signal);
    return () => c.abort();
  }, [open, load]);

  const toggle = () => {
    setOpen(o => {
      const next = !o;
      if (!next) { setShowForm(false); setEditingId(null); setForm(emptyForm()); setFormError(""); setError(""); }
      return next;
    });
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    const next = [...questions];
    [next[index], next[target]] = [next[target], next[index]];
    setQuestions(next);
    setBusyId("reorder");
    try {
      const d = await surveyConfigApi.templateQuestions.reorder(templateId, { questions: next.map((question, i) => ({ id: question.id, displayOrder: i + 1 })) });
      setQuestions(d);
    } catch (e: any) { setError(e?.message ?? "Failed to reorder questions."); void load(); }
    finally { setBusyId(null); }
  };

  const startEdit = (question: SurveyTemplateQuestionDto) => {
    setEditingId(question.id);
    setForm({ questionTypeId: String(question.questionTypeId), questionText: question.questionText, isRequired: question.isRequired, configJsonText: question.configJson ? JSON.stringify(question.configJson, null, 2) : "" });
    setShowForm(true); setFormError("");
  };

  const handleSave = async () => {
    if (!form.questionText.trim() || !form.questionTypeId) return;
    const cfg = parseConfig(form.configJsonText);
    if (cfg.error) { setFormError(cfg.error); return; }
    setSaving(true); setFormError("");
    try {
      const input = { questionTypeId: Number(form.questionTypeId), questionText: form.questionText.trim(), isRequired: form.isRequired, configJson: cfg.value };
      if (editingId != null) {
        const d = await surveyConfigApi.templateQuestions.update(templateId, editingId, input);
        setQuestions(prev => prev.map(x => (x.id === d.id ? d : x)).sort((a, b) => a.displayOrder - b.displayOrder));
      } else {
        const d = await surveyConfigApi.templateQuestions.create(templateId, input);
        setQuestions(prev => [...prev, d]);
      }
      setShowForm(false); setForm(emptyForm()); setEditingId(null);
    } catch (e: any) { setFormError(e?.message ?? "Failed to save question."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    setBusyId(id);
    try { await surveyConfigApi.templateQuestions.delete(templateId, id); setQuestions(prev => prev.filter(x => x.id !== id)); }
    catch (e: any) { setError(e?.message ?? "Failed to delete question."); }
    finally { setBusyId(null); }
  };

  return (
    <div className="mt-2">
      <button onClick={toggle} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg hover:bg-emerald-50" style={{ color: P.darkOlive }}>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Questions{questions.length > 0 ? ` (${questions.length})` : ""}
      </button>

      {open && (
        <div className="mt-2 space-y-2">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700 flex items-center gap-2">
              <AlertCircle size={12} />{error}
              <button onClick={() => void load()} className="ml-auto underline">Retry</button>
            </div>
          )}
          {loading && <div className="flex items-center gap-2 py-2 text-[11px]" style={{ color: P.textMuted }}><Loader2 size={12} className="animate-spin" /> Loading questions…</div>}
          {!loading && questions.length === 0 && !error && !showForm && (
            <p className="text-[11px] py-1" style={{ color: P.textMuted }}>No questions yet. Add the first question to start building this template.</p>
          )}

          {questions.map((question, i) => (
            <div key={question.id} className="flex items-start gap-2 p-2 rounded-lg border" style={{ borderColor: P.border, background: P.paleGreen }}>
              <span className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold shrink-0" style={{ background: P.lightSage, color: P.darkOlive }}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium break-words" style={{ color: P.text }}>
                  {question.questionText}
                  {question.isRequired && <span className="ml-1" style={{ color: "#C0392B" }}>*</span>}
                </p>
                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: P.goldLight, color: "#8A6A1A" }}>
                  {question.questionType?.name ?? `Type #${question.questionTypeId}`}
                </span>
              </div>
              {canUpdate && (
                <div className="flex items-center gap-0.5 shrink-0">
                  <button onClick={() => void move(i, -1)} disabled={i === 0 || busyId !== null} title="Move up" className="p-1 rounded hover:bg-emerald-50 disabled:opacity-30" style={{ color: P.textMid }}>
                    <ChevronUp size={12} />
                  </button>
                  <button onClick={() => void move(i, 1)} disabled={i === questions.length - 1 || busyId !== null} title="Move down" className="p-1 rounded hover:bg-emerald-50 disabled:opacity-30" style={{ color: P.textMid }}>
                    {busyId === "reorder" ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
                  </button>
                  <button onClick={() => startEdit(question)} title="Edit question" className="p-1 rounded hover:bg-emerald-50" style={{ color: P.olive }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => void handleDelete(question.id)} disabled={busyId === question.id} title="Delete question" className="p-1 rounded hover:bg-red-50 disabled:opacity-50" style={{ color: "#C0392B" }}>
                    {busyId === question.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                  </button>
                </div>
              )}
            </div>
          ))}
          {canUpdate && !showForm && (
            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); setFormError(""); }} className="flex items-center gap-1 text-[11px] font-semibold hover:underline" style={{ color: P.olive }}>
              <Plus size={12} /> Add question
            </button>
          )}

          {showForm && (
            <div className="p-3 rounded-lg border space-y-2" style={{ borderColor: P.border, background: "white" }}>
              {formError && (
                <div className="text-[11px] text-red-600 flex items-center gap-1"><AlertCircle size={11} />{formError}</div>
              )}
              <div className="flex gap-3 items-center">
                <select value={form.questionTypeId} onChange={e => setForm({ ...form, questionTypeId: e.target.value })} className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
                  <option value="">Select question type…</option>
                  {questionTypes.map(qt => <option key={qt.id} value={qt.id}>{qt.name}{qt.isSystem ? " (system)" : ""}{!qt.isActive ? " (inactive)" : ""}</option>)}
                </select>
                <label className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: P.textMid }}>
                  <input type="checkbox" checked={form.isRequired} onChange={e => setForm({ ...form, isRequired: e.target.checked })} style={{ accentColor: P.olive }} />
                  Required
                </label>
              </div>
              <textarea value={form.questionText} onChange={e => setForm({ ...form, questionText: e.target.value })} rows={2} maxLength={5000} placeholder="Question text…" className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none resize-y" style={{ border: `1px solid ${P.border}`, color: P.text }} />
              <details className="text-[11px]" style={{ color: P.textMid }}>
                <summary className="cursor-pointer select-none">Configuration (JSON) — optional</summary>
                <textarea value={form.configJsonText} onChange={e => setForm({ ...form, configJsonText: e.target.value })} rows={3} placeholder='{"options": ["A", "B", "C"]}' className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none font-mono resize-y" style={{ border: `1px solid ${P.border}`, color: P.text }} />
              </details>
              <div className="flex gap-2">
                <button onClick={() => void handleSave()} disabled={!form.questionText.trim() || !form.questionTypeId || saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} {editingId != null ? "Update" : "Add"}
                </button>
                <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm()); setFormError(""); }} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}