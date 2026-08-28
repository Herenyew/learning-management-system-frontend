import React, { useEffect, useState, useCallback } from "react";
import { Plus, Loader2, AlertCircle, Trash2, Check, ToggleLeft } from "lucide-react";
import { P } from "./configuration.shared";
import { customFieldsApi, type CustomFieldDto, type CustomFieldTarget, type CustomFieldType } from "../../API/custom-fields.api";
import { usePermission } from "../../hooks/usePermission";

const TARGETS: CustomFieldTarget[] = ["COURSE", "PROGRAM", "TNA_REQUEST", "ENROLLMENT", "CERTIFICATE", "USER_PROFILE", "CONTENT"];
const TARGET_LABELS: Record<CustomFieldTarget, string> = { COURSE: "Course", PROGRAM: "Program", TNA_REQUEST: "TNA Request", ENROLLMENT: "Enrollment", CERTIFICATE: "Certificate", USER_PROFILE: "User Profile", CONTENT: "Content" };
const FIELD_TYPES: CustomFieldType[] = ["TEXT", "NUMBER", "SINGLE_SELECT", "MULTI_SELECT", "BOOLEAN"];
const TYPE_LABELS: Record<CustomFieldType, string> = { TEXT: "Text", NUMBER: "Number", SINGLE_SELECT: "Single Select", MULTI_SELECT: "Multi Select", BOOLEAN: "Toggle" };

type FieldForm = { name: string; fieldKey: string; description: string; fieldType: CustomFieldType; isRequired: boolean; };
const emptyForm = (): FieldForm => ({ name: "", fieldKey: "", description: "", fieldType: "TEXT", isRequired: false });

export function ConfigCustomFields() {
  const can = usePermission();
  const [fields, setFields] = useState<CustomFieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTarget, setActiveTarget] = useState<CustomFieldTarget>("COURSE");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FieldForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Fetch custom fields
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { const d = await customFieldsApi.list({ target: activeTarget }, signal); if (!signal?.aborted) setFields(d); }
    catch (e: any) { if (!signal?.aborted) setError(e?.message ?? "Failed to load custom fields."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [activeTarget]);

  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);

  const handleSave = async () => {
    if (!form.name.trim() || !form.fieldKey.trim()) return;
    setSaving(true);
    try {
      const d = await customFieldsApi.create({
        name: form.name.trim(),
        fieldKey: form.fieldKey.trim(),
        target: activeTarget,
        description: form.description.trim() || undefined,
        fieldType: form.fieldType,
        isRequired: form.isRequired,  // ← ADD THIS
      });
      setFields(prev => [...prev, d]);
      setShowForm(false);
      setForm(emptyForm());
    } catch (e: any) {
      setError(e?.message ?? "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try { await customFieldsApi.delete(id); setFields(prev => prev.filter(f => f.id !== id)); }
    catch (e: any) { setError(e?.message ?? "Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const handleToggleActive = async (field: CustomFieldDto) => {
    try { const d = await customFieldsApi.update(field.id, { isActive: !field.isActive }); setFields(prev => prev.map(f => f.id === d.id ? d : f)); }
    catch (e: any) { setError(e?.message ?? "Failed to update."); }
  };

  if (!can("custom_field.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view custom fields.</div>;

  const autoKey = (name: string) => name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-base font-bold" style={{ color: P.text }}>Custom Fields</h2>
          <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>Add extra data fields to entities across the LMS.</p>
        </div>
        {can("custom_field.create") && (
          <button onClick={() => { setShowForm(true); setForm(emptyForm()); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: P.olive }}>
            <Plus size={13} /> Add Field
          </button>
        )}
      </div>

      {/* Target tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {TARGETS.map(t => (
          <button key={t} onClick={() => { setActiveTarget(t); setShowForm(false); }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            style={activeTarget === t ? { background: P.olive, color: "white" } : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }}>
            {TARGET_LABELS[t]}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: P.sage }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>New Custom Field — {TARGET_LABELS[activeTarget]}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {/* ─── Label ─────────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>Label *</p>
              <input
                value={form.name}
                onChange={e => {
                  const v = e.target.value;
                  setForm(f => ({ ...f, name: v, fieldKey: autoKey(v) }));
                }}
                placeholder="e.g. Department Budget Code"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>

            {/* ─── Field Key ──────────────────────────────────────── */}
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>Field Key *</p>
              <input
                value={form.fieldKey}
                onChange={e => setForm(f => ({ ...f, fieldKey: e.target.value }))}
                placeholder="e.g. dept_budget_code"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none font-mono"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          </div>

          {/* ─── DESCRIPTION ────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>Description</p>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Used for budget tracking and reporting"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>

          {/* ─── Field Type ──────────────────────────────────────── */}
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>Field Type</p>
            <select
              value={form.fieldType}
              onChange={e => setForm(f => ({ ...f, fieldType: e.target.value as CustomFieldType }))}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              {FIELD_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
          {/* ─── Required Toggle ────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>
              Required
            </label>
            <button
              onClick={() => setForm(f => ({ ...f, isRequired: !f.isRequired }))}
              className="w-10 h-5 rounded-full relative transition-colors"
              style={{ background: form.isRequired ? P.olive : "#CBD5E1" }}
            >
              <span
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                style={{ left: form.isRequired ? "22px" : "2px" }}
              />
            </button>
            <span className="text-xs" style={{ color: form.isRequired ? P.olive : P.textMuted }}>
              {form.isRequired ? "Yes" : "No"}
            </span>
          </div>

          {/* ─── Buttons ──────────────────────────────────────────── */}
          <div className="flex gap-2">
            <button
              onClick={() => void handleSave()}
              disabled={!form.name.trim() || !form.fieldKey.trim() || saving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: P.olive }}
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Save
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2"><AlertCircle size={14} />{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>}
      {loading && <div className="flex items-center gap-2 py-8 text-xs" style={{ color: P.textMuted }}><Loader2 size={14} className="animate-spin" /> Loading fields…</div>}

      {!loading && fields.length === 0 && !error && (
        <div className="flex flex-col items-center py-10 gap-2">
          <ToggleLeft size={24} style={{ color: P.textMuted }} />
          <p className="text-sm font-semibold" style={{ color: P.text }}>No custom fields for {TARGET_LABELS[activeTarget]}</p>
          <p className="text-xs" style={{ color: P.textMuted }}>Add a field above to extend {TARGET_LABELS[activeTarget].toLowerCase()} records.</p>
        </div>
      )}

      {!loading && fields.length > 0 && (
        <div className="overflow-hidden rounded-xl border" style={{ borderColor: P.border }}>
          <table className="w-full">
            <thead><tr style={{ borderBottom: `1px solid ${P.border}`, background: P.bg }}>
              {["Label", "Field Key", "Type", "Required", "Active", ""].map(h => <th key={h} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: P.textMuted }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {fields.map(f => (
                <tr key={f.id} className="border-b last:border-0" style={{ borderColor: `${P.border}40` }}>
                  <td className="px-4 py-3"><p className="text-xs font-semibold" style={{ color: P.text }}>{f.label}</p>{f.description && <p className="text-[10px]" style={{ color: P.textMuted }}>{f.description}</p>}</td>
                  <td className="px-4 py-3"><code className="text-[11px]" style={{ color: P.textMid }}>{f.fieldKey}</code></td>
                  <td className="px-4 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{TYPE_LABELS[f.fieldType as CustomFieldType] ?? f.fieldType}</span></td>
                  <td className="px-4 py-3"><span className="text-[10px]" style={{ color: f.isRequired ? P.olive : P.textMuted }}>{f.isRequired ? "Yes" : "No"}</span></td>
                  <td className="px-4 py-3">
                    <button onClick={() => void handleToggleActive(f)} disabled={!can("custom_field.update")} className="w-8 h-4 rounded-full relative transition-colors disabled:opacity-50" style={{ background: f.isActive ? P.olive : "#CBD5E1" }}>
                      <span className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all" style={{ left: f.isActive ? "18px" : "2px" }} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {can("custom_field.delete") && (
                      <button onClick={() => void handleDelete(f.id)} disabled={deletingId === f.id} className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#C0392B" }}>
                        {deletingId === f.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
