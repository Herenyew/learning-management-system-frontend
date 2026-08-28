import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, AlertCircle, Trash2, Check, ChevronDown, Pencil } from "lucide-react";
import { P, CfgSection } from "./configuration.shared";
import { surveyConfigApi, type SurveyQuestionTypeDto, type SurveyTemplateDto, type SurveyType, type KirkpatrickLevel, type CreateSurveyTemplateInput } from "../../API/survey-config.api";
import { usePermission } from "../../hooks/usePermission";

const SURVEY_TYPES: SurveyType[] = ["PRE_COURSE", "POST_COURSE", "MANAGER_FOLLOWUP"];
const KK_LEVELS: KirkpatrickLevel[] = ["L1_REACTION", "L2_LEARNING", "L3_BEHAVIOR", "L4_RESULTS"];
const SURVEY_TYPE_LABELS: Record<SurveyType, string> = { PRE_COURSE: "Pre-Course", POST_COURSE: "Post-Course", MANAGER_FOLLOWUP: "Manager Follow-up" };
const KK_LABELS: Record<KirkpatrickLevel, string> = { L1_REACTION: "L1 Reaction", L2_LEARNING: "L2 Learning", L3_BEHAVIOR: "L3 Behaviour", L4_RESULTS: "L4 Results" };

type TemplateForm = { name: string; description: string; surveyType: SurveyType; kirkpatrickLevel: KirkpatrickLevel; isAnonymous: boolean; availableDays: string };
const emptyTemplate = (): TemplateForm => ({ name: "", description: "", surveyType: "POST_COURSE", kirkpatrickLevel: "L1_REACTION", isAnonymous: false, availableDays: "" });

export function ConfigSurvey() {
  const can = usePermission();
  const [questionTypes, setQuestionTypes] = useState<SurveyQuestionTypeDto[]>([]);
  const [templates, setTemplates] = useState<SurveyTemplateDto[]>([]);
  const [loadingQT, setLoadingQT] = useState(true);
  const [loadingT, setLoadingT] = useState(true);
  const [errorQT, setErrorQT] = useState("");
  const [errorT, setErrorT] = useState("");
  const [newQTName, setNewQTName] = useState("");
  const [addingQT, setAddingQT] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [templateForm, setTemplateForm] = useState<TemplateForm>(emptyTemplate());
  const [savingT, setSavingT] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingTId, setEditingTId] = useState<number | null>(null);

  const loadQT = useCallback(async (signal?: AbortSignal) => {
    setLoadingQT(true); setErrorQT("");
    try { const d = await surveyConfigApi.questionTypes.list({}, signal); if (!signal?.aborted) setQuestionTypes(d); }
    catch (e: any) { if (!signal?.aborted) setErrorQT(e?.message ?? "Failed to load."); }
    finally { if (!signal?.aborted) setLoadingQT(false); }
  }, []);

  const loadT = useCallback(async (signal?: AbortSignal) => {
    setLoadingT(true); setErrorT("");
    try { const d = await surveyConfigApi.templates.list({}, signal); if (!signal?.aborted) setTemplates(d); }
    catch (e: any) { if (!signal?.aborted) setErrorT(e?.message ?? "Failed to load."); }
    finally { if (!signal?.aborted) setLoadingT(false); }
  }, []);

  useEffect(() => { const c = new AbortController(); void loadQT(c.signal); void loadT(c.signal); return () => c.abort(); }, [loadQT, loadT]);

  const handleAddQT = async () => {
    if (!newQTName.trim()) return;
    setAddingQT(true);
    try {
      const slug = newQTName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const d = await surveyConfigApi.questionTypes.create({ name: newQTName.trim(), slug });
      setQuestionTypes(prev => [...prev, d]); setNewQTName("");
    } catch (e: any) { setErrorQT(e?.message ?? "Failed to add."); }
    finally { setAddingQT(false); }
  };

  const handleDeleteQT = async (id: number) => {
    setDeletingId(id);
    try { await surveyConfigApi.questionTypes.delete(id); setQuestionTypes(prev => prev.filter(x => x.id !== id)); }
    catch (e: any) { setErrorQT(e?.message ?? "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) return;
    setSavingT(true);
    try {
      const input: CreateSurveyTemplateInput = { name: templateForm.name.trim(), description: templateForm.description.trim() || undefined, surveyType: templateForm.surveyType, kirkpatrickLevel: templateForm.kirkpatrickLevel, isAnonymous: templateForm.isAnonymous, availableDays: templateForm.availableDays ? Number(templateForm.availableDays) : undefined };
      if (editingTId != null) {
        // Updates affect only this template record — surveys created from it are untouched.
        const d = await surveyConfigApi.templates.update(editingTId, input);
        setTemplates(prev => prev.map(t => (t.id === d.id ? d : t)));
      } else {
        const d = await surveyConfigApi.templates.create(input);
        setTemplates(prev => [...prev, d]);
      }
      setShowTemplateForm(false); setTemplateForm(emptyTemplate()); setEditingTId(null);
    } catch (e: any) { setErrorT(e?.message ?? "Failed to save."); }
    finally { setSavingT(false); }
  };

  const startEditTemplate = (t: SurveyTemplateDto) => {
    setEditingTId(t.id);
    setTemplateForm({ name: t.name, description: t.description ?? "", surveyType: t.surveyType, kirkpatrickLevel: t.kirkpatrickLevel, isAnonymous: t.isAnonymous, availableDays: t.availableDays != null ? String(t.availableDays) : "" });
    setShowTemplateForm(true);
    setErrorT("");
  };

  const handleDeleteTemplate = async (id: number) => {
    setDeletingId(id);
    try { await surveyConfigApi.templates.delete(id); setTemplates(prev => prev.filter(x => x.id !== id)); }
    catch (e: any) { setErrorT(e?.message ?? "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  if (!can("survey_question_type.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view survey configuration.</div>;

  return (
    <div className="space-y-5">
      {/* Survey Question Types */}
      <CfgSection title="Survey Question Types">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>Define question types available when building survey templates (e.g. Rating Scale, Open Text, Multiple Choice).</p>
        {loadingQT && <div className="flex items-center gap-2 py-3 text-xs" style={{ color: P.textMuted }}><Loader2 size={13} className="animate-spin" /> Loading…</div>}
        {errorQT && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2 mb-2"><AlertCircle size={13} />{errorQT}<button onClick={() => void loadQT()} className="ml-auto underline">Retry</button></div>}
        {!loadingQT && (
          <div className="flex flex-wrap gap-2 mb-3">
            {questionTypes.map(qt => (
              <div key={qt.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: qt.isSystem ? P.goldLight : P.lightSage, color: qt.isSystem ? "#8A6A1A" : P.darkOlive }}>
                {qt.name}
                {qt.isSystem && <span className="text-[9px] opacity-70">(system)</span>}
                {!qt.isSystem && can("survey_question_type.delete") && (
                  <button onClick={() => void handleDeleteQT(qt.id)} disabled={deletingId === qt.id}>
                    {deletingId === qt.id ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                  </button>
                )}
              </div>
            ))}
            {questionTypes.length === 0 && <p className="text-xs" style={{ color: P.textMuted }}>No question types yet.</p>}
          </div>
        )}
        {can("survey_question_type.create") && (
          <div className="flex gap-2">
            <input value={newQTName} onChange={e => setNewQTName(e.target.value)} placeholder="Add question type… (e.g. Rating Scale)"
              onKeyDown={e => { if (e.key === "Enter" && newQTName.trim()) void handleAddQT(); }}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
            <button onClick={() => void handleAddQT()} disabled={!newQTName.trim() || addingQT}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
              {addingQT ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </button>
          </div>
        )}
      </CfgSection>

      {/* Survey Templates */}
      <CfgSection title="Survey Templates">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px]" style={{ color: P.textMuted }}>Reusable survey templates mapped to Kirkpatrick evaluation levels.</p>
          {can("survey_template.create") && (
            <button onClick={() => { setEditingTId(null); setTemplateForm(emptyTemplate()); setShowTemplateForm(true); }} className="flex items-center gap-1 text-xs font-semibold" style={{ color: P.olive }}><Plus size={12} /> New Template</button>
          )}
        </div>
        {errorT && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2 mb-2"><AlertCircle size={13} />{errorT}<button onClick={() => void loadT()} className="ml-auto underline">Retry</button></div>}

        {showTemplateForm && (
          <div className="rounded-xl border bg-white p-4 space-y-3 mb-3" style={{ borderColor: P.sage }}>
            <p className="text-sm font-semibold" style={{ color: P.text }}>{editingTId != null ? "Edit Survey Template" : "New Survey Template"}</p>
            <input value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} placeholder="Template name *" className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>Survey Type</p>
                <select value={templateForm.surveyType} onChange={e => setTemplateForm({ ...templateForm, surveyType: e.target.value as SurveyType })} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
                  {SURVEY_TYPES.map(t => <option key={t} value={t}>{SURVEY_TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>Kirkpatrick Level</p>
                <select value={templateForm.kirkpatrickLevel} onChange={e => setTemplateForm({ ...templateForm, kirkpatrickLevel: e.target.value as KirkpatrickLevel })} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
                  {KK_LEVELS.map(l => <option key={l} value={l}>{KK_LABELS[l]}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}>
              <input type="checkbox" checked={templateForm.isAnonymous} onChange={e => setTemplateForm({ ...templateForm, isAnonymous: e.target.checked })} style={{ accentColor: P.olive }} />
              Anonymous responses
            </label>
            <div className="flex gap-2">
              <button onClick={() => void handleSaveTemplate()} disabled={!templateForm.name.trim() || savingT} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
                {savingT ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
              </button>
              <button onClick={() => { setShowTemplateForm(false); setTemplateForm(emptyTemplate()); setEditingTId(null); }} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
            </div>
          </div>
        )}

        {loadingT && <div className="flex items-center gap-2 py-3 text-xs" style={{ color: P.textMuted }}><Loader2 size={13} className="animate-spin" /> Loading templates…</div>}
        {!loadingT && templates.length === 0 && !errorT && <p className="text-xs py-3 text-center" style={{ color: P.textMuted }}>No templates yet. Create one above.</p>}
        {!loadingT && templates.length > 0 && (
          <div className="space-y-2">
            {templates.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: P.border, background: "white" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>{t.name}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{SURVEY_TYPE_LABELS[t.surveyType]}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: P.goldLight, color: "#8A6A1A" }}>{KK_LABELS[t.kirkpatrickLevel]}</span>
                    {t.isAnonymous && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>Anonymous</span>}
                  </div>
                </div>
                {can("survey_template.update") && (
                  <button onClick={() => startEditTemplate(t)} title="Edit template" className="p-1.5 rounded-lg hover:bg-emerald-50" style={{ color: P.olive }}>
                    <Pencil size={13} />
                  </button>
                )}
                {can("survey_template.delete") && (
                  <button onClick={() => void handleDeleteTemplate(t.id)} disabled={deletingId === t.id} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#C0392B" }}>
                    {deletingId === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CfgSection>
    </div>
  );
}
