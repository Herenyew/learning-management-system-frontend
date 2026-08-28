import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle, Save, Settings, Plus, Trash2, X } from "lucide-react";
import { P } from "./configuration.shared";
import { systemSettingsApi, type SystemSettingDto, type SettingCategory, type UpdateSystemSettingInput } from "../../API/system-settings.api";
import { usePermission } from "../../hooks/usePermission";

const CATEGORIES: SettingCategory[] = ["GENERAL", "ENROLLMENT", "NOTIFICATIONS", "CERTIFICATION", "GAMIFICATION", "SECURITY", "INTEGRATIONS"];
const CAT_LABELS: Record<SettingCategory, string> = { GENERAL: "General", ENROLLMENT: "Enrollment", NOTIFICATIONS: "Notifications", CERTIFICATION: "Certification", GAMIFICATION: "Gamification", SECURITY: "Security", INTEGRATIONS: "Integrations" };

function SettingRow({ setting, canEdit, canDelete, onSave, onDelete }: { setting: SystemSettingDto; canEdit: boolean; canDelete: boolean; onSave: (id: number, input: UpdateSystemSettingInput) => Promise<void>; onDelete: (id: number) => Promise<void> }) {
  const [draft, setDraft] = useState(JSON.stringify(setting.settingValue));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const isDirty = draft !== JSON.stringify(setting.settingValue);
  const isBoolean = typeof setting.settingValue === "boolean";
  const isNumber = typeof setting.settingValue === "number";

  const handleSave = async () => {
    setSaving(true); setError("");
    try {
      let parsed: unknown;
      try { parsed = JSON.parse(draft); } catch { parsed = draft; }
      await onSave(setting.id, { settingValue: parsed });
    } catch (e: any) { setError(e?.message ?? "Failed to save."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete setting "${setting.settingKey}"? This cannot be undone.`)) return;
    setDeleting(true); setError("");
    try { await onDelete(setting.id); }
    catch (e: any) { setError(e?.message ?? "Failed to delete."); }
    finally { setDeleting(false); }
  };

  return (
    <div className="p-4 rounded-xl border bg-white space-y-2" style={{ borderColor: P.border }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold font-mono" style={{ color: P.text }}>{setting.settingKey}</p>
          {setting.description && <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>{setting.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {canEdit && isDirty && (
            <button onClick={() => void handleSave()} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
            </button>
          )}
          {canDelete && (
            <button onClick={() => void handleDelete()} disabled={deleting} title="Delete setting" className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50" style={{ color: "#C0392B" }}>
              {deleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
          )}
        </div>
      </div>
      {isBoolean ? (
        <div className="flex items-center gap-2">
          <button onClick={() => canEdit && setDraft(draft === "true" ? "false" : "true")} disabled={!canEdit}
            className="w-10 h-5 rounded-full relative transition-colors disabled:opacity-60" style={{ background: draft === "true" ? P.olive : "#CBD5E1" }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all" style={{ left: draft === "true" ? "22px" : "2px" }} />
          </button>
          <span className="text-xs" style={{ color: P.textMuted }}>{draft === "true" ? "Enabled" : "Disabled"}</span>
        </div>
      ) : (
        <input value={draft} onChange={e => setDraft(e.target.value)} disabled={!canEdit} type={isNumber ? "number" : "text"}
          className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none disabled:opacity-60 font-mono"
          style={{ border: `1px solid ${P.border}`, color: P.text }} />
      )}
      {error && <p className="text-[10px] text-red-600">{error}</p>}
    </div>
  );
}

export function ConfigSystemSettings() {
  const can = usePermission();
  const [settings, setSettings] = useState<SystemSettingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState<SettingCategory>("GENERAL");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ settingKey: "", settingValue: "", description: "" });

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { const d = await systemSettingsApi.list({}, signal); if (!signal?.aborted) setSettings(d); }
    catch (e: any) { if (!signal?.aborted) setError(e?.message ?? "Failed to load settings."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, []);

  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);

  const handleSave = async (id: number, input: UpdateSystemSettingInput) => {
    const updated = await systemSettingsApi.update(id, input);
    setSettings(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleCreate = async () => {
    if (!createForm.settingKey.trim()) { setError("Setting key is required."); return; }
    setCreating(true); setError("");
    try {
      let parsedValue: unknown;
      try { parsedValue = JSON.parse(createForm.settingValue); } catch { parsedValue = createForm.settingValue; }
      const created = await systemSettingsApi.create({
        category: activeCategory,
        settingKey: createForm.settingKey.trim(),
        settingValue: parsedValue,
        description: createForm.description.trim() || undefined,
      });
      setSettings(prev => [created, ...prev]);
      setCreateForm({ settingKey: "", settingValue: "", description: "" });
      setShowCreate(false);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create the setting.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    await systemSettingsApi.delete(id);
    setSettings(prev => prev.filter(s => s.id !== id));
  };

  if (!can("system_setting.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view system settings.</div>;

  const filtered = settings.filter(s => s.category === activeCategory);
  const canEdit = can("system_setting.update");
  const canCreate = can("system_setting.create");
  const canDelete = can("system_setting.delete");

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            style={activeCategory === cat ? { background: P.olive, color: "white" } : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }}>
            {CAT_LABELS[cat]}
          </button>
        ))}
        {canCreate && (
          <button onClick={() => setShowCreate(v => !v)} className="flex items-center gap-1 px-3 py-1.5 ml-auto rounded-lg text-xs font-semibold text-white"
            style={{ background: showCreate ? "#C0392B" : P.olive }}>
            {showCreate ? <><X size={12} /> Cancel</> : <><Plus size={12} /> New Setting</>}
          </button>
        )}
      </div>

      {showCreate && canCreate && (
        <div className="rounded-xl border bg-white p-4 space-y-3" style={{ borderColor: P.sage }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>New setting in {CAT_LABELS[activeCategory]}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={createForm.settingKey} onChange={e => setCreateForm(f => ({ ...f, settingKey: e.target.value }))} placeholder="Setting key * (e.g. max.enrollment.per.user)" className="px-3 py-2 text-xs rounded-lg bg-white focus:outline-none font-mono" style={{ border: `1px solid ${P.border}`, color: P.text }} />
            <input value={createForm.settingValue} onChange={e => setCreateForm(f => ({ ...f, settingValue: e.target.value }))} placeholder='Value * (e.g. 5, "text", true)' className="px-3 py-2 text-xs rounded-lg bg-white focus:outline-none font-mono" style={{ border: `1px solid ${P.border}`, color: P.text }} />
          </div>
          <input value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
          <button onClick={() => void handleCreate()} disabled={!createForm.settingKey.trim() || !createForm.settingValue.trim() || creating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Create Setting
          </button>
        </div>
      )}

      {loading && <div className="flex items-center gap-2 py-8 text-xs" style={{ color: P.textMuted }}><Loader2 size={14} className="animate-spin" /> Loading settings…</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2"><AlertCircle size={14} />{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>}

      {!loading && filtered.length === 0 && !error && (
        <div className="flex flex-col items-center py-12 gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: P.lightSage }}><Settings size={18} style={{ color: P.olive }} /></div>
          <p className="text-sm font-semibold" style={{ color: P.text }}>No settings in {CAT_LABELS[activeCategory]}</p>
          <p className="text-xs" style={{ color: P.textMuted }}>Settings for this category will appear here once configured.</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(s => <SettingRow key={s.id} setting={s} canEdit={canEdit} canDelete={canDelete} onSave={handleSave} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}
