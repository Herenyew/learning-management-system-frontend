// ============================================================
// ConfigSystemSettings — managed, type-safe, company-scoped
// System Settings.
//
// • 7 tabs (General, Enrollment, Notifications, Certification,
//   Gamification, Security, Integrations)
// • Global Cancel / Save Changes actions
// • Type-safe inputs driven by valueType (STRING/NUMBER/BOOLEAN/JSON)
// • Color picker + hex input for color settings
// • Core (registered) settings cannot be deleted or deactivated
// • Advanced Mode (Super Admin only) — collapsible custom-key creation
// • Branding settings (logo, name, theme, colors, maintenance) apply
//   immediately after Save — no full page refresh.
// ============================================================

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Loader2,
  AlertCircle,
  Save,
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Lock,
  KeyRound,
} from "lucide-react";
import { P } from "./configuration.shared";
import {
  systemSettingsApi,
  type SystemSettingDto,
  type SettingCategory,
  type SettingValueType,
  type BulkUpdateItemInput,
} from "../../API/system-settings.api";
import {
  CATEGORY_ORDER,
  CATEGORY_LABELS,
  SETTINGS_META_BY_KEY,
  CORE_SETTING_KEYS,
  COLOR_KEYS,
} from "../../constants/system-settings.registry";
import { applySettingsToBranding } from "../../services/branding.service";
import { usePermission } from "../../hooks/usePermission";
import { Chip } from "./shared";

// (file is rewritten in full — see end of file for the main component)

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function serializeValue(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function isCoreSetting(key: string): boolean {
  return CORE_SETTING_KEYS.has(key);
}

function isColorSetting(key: string): boolean {
  return COLOR_KEYS.has(key);
}

const COLOR_PRESETS = [
  "#3B82F6",
  "#047857",
  "#0F766E",
  "#7C3AED",
  "#DB2777",
  "#D97706",
  "#64748B",
  "#10B981",
];

function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color.trim());
}

// ─────────────────────────────────────────────────────────────
// Color picker + hex input
// ─────────────────────────────────────────────────────────────

function ColorField({
  value,
  disabled,
  onChange,
}: {
  value: string;
  disabled: boolean;
  onChange: (next: string) => void;
}) {
  const hex = isValidHex(value) ? value : "#000000";
  const [hexDraft, setHexDraft] = useState(value || "#000000");

  useEffect(() => {
    setHexDraft(value || "#000000");
  }, [value]);

  const commitHex = (raw: string) => {
    const normalized = raw.trim().startsWith("#") ? raw.trim() : `#${raw.trim()}`;
    setHexDraft(raw);
    if (isValidHex(normalized)) onChange(normalized);
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex-shrink-0">
        <span
          className="block w-9 h-9 rounded-xl border"
          style={{
            background: hex,
            borderColor: P.border,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
          }}
        />
        <input
          type="color"
          value={hex}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Pick a color"
        />
      </div>
      <input
        value={hexDraft}
        disabled={disabled}
        onChange={(e) => commitHex(e.target.value)}
        onBlur={(e) => {
          const n = e.target.value.trim();
          if (isValidHex(n)) setHexDraft(n);
          else setHexDraft(hex);
        }}
        className="w-28 px-3 py-2 text-xs rounded-lg bg-white focus:outline-none font-mono disabled:opacity-60"
        style={{ border: `1px solid ${P.border}`, color: P.text }}
        placeholder="#RRGGBB"
      />
      <div className="flex items-center gap-1.5">
        {COLOR_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onChange(preset)}
            className="w-5 h-5 rounded-full border transition-transform hover:scale-110 disabled:opacity-50"
            style={{ background: preset, borderColor: preset === hex ? P.darkOlive : P.border }}
            title={preset}
            aria-label={`Use color ${preset}`}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Single setting row card
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// valueType-aware input renderer
// ─────────────────────────────────────────────────────────────

function SettingRow({
  setting,
  value,
  canEdit,
  canDelete,
  isDirty,
  collapsed,
  onToggleCollapsed,
  onChange,
  onDelete,
}: {
  setting: SystemSettingDto;
  value: unknown;
  canEdit: boolean;
  canDelete: boolean;
  isDirty: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onChange: (next: unknown) => void;
  onDelete: () => void;
}) {
  const meta = SETTINGS_META_BY_KEY.get(setting.settingKey);
  const core = isCoreSetting(setting.settingKey);
  const label = meta?.label ?? setting.settingKey;
  const description = meta?.description ?? setting.description;

  return (
    <div
      className="rounded-xl border bg-white transition-shadow"
      style={{
        borderColor: isDirty ? P.olive : P.border,
        boxShadow: isDirty ? "0 8px 24px rgba(4,120,87,0.08)" : "none",
      }}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mt-0.5 flex-shrink-0 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: P.textMuted }}
          aria-expanded={!collapsed}
        >
          {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs font-bold" style={{ color: P.text }}>
              {label}
            </p>
            <span
              className="font-mono text-[9px] px-1.5 py-0.5 rounded-md"
              style={{ background: P.paleGreen, color: P.textMuted }}
            >
              {setting.settingKey}
            </span>
            <span
              className="font-mono text-[9px] text-[10px] px-1.5 py-0.5 rounded-md"
              style={{ background: "#F1F5F9", color: "#64748B" }}
            >
              {setting.valueType}
            </span>
            {core && <Chip label="Core" variant="green" />}
            {!core && setting.createdBy != null && <Chip label="Custom" variant="blue" />}
            {isDirty && <Chip label="Unsaved" variant="gold" />}
          </div>
          {description && (
            <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
              {description}
            </p>
          )}
        </div>

        {canDelete && !core && setting.id > 0 && (
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  `Delete custom setting "${setting.settingKey}"? This cannot be undone.`,
                )
              )
                onDelete();
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0 disabled:opacity-50"
            style={{ color: "#C0392B" }}
            title="Delete custom setting"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 pb-4" style={{ borderTop: `1px dashed ${P.border}` }}>
          <div className="pt-3">
            <SettingInput setting={setting} value={value} disabled={!canEdit} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}

function SettingInput({
  setting,
  value,
  disabled,
  onChange,
}: {
  setting: SystemSettingDto;
  value: unknown;
  disabled: boolean;
  onChange: (next: unknown) => void;
}) {
  const meta = SETTINGS_META_BY_KEY.get(setting.settingKey);
  const valueType = meta?.valueType ?? setting.valueType;
  const fieldClass =
    "w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed";
  const fieldStyle: React.CSSProperties = { border: `1px solid ${P.border}`, color: P.text };

  // Colors → color picker + hex input
  if (isColorSetting(setting.settingKey)) {
    return (
      <ColorField value={String(value ?? "")} disabled={disabled} onChange={(v) => onChange(v)} />
    );
  }

  // STRING with options → select
  if (valueType === "STRING" && meta?.options?.length) {
    return (
      <select
        value={String(value ?? "")}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
        style={fieldStyle}
      >
        {meta.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // JSON with options → multi-select chips
  if (valueType === "JSON" && meta?.options?.length) {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="flex flex-wrap gap-1.5">
        {meta.options.map((opt) => {
          const on = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange(on ? selected.filter((v) => v !== opt.value) : [...selected, opt.value])
              }
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-60"
              style={
                on
                  ? { background: P.olive, color: "white", borderColor: P.olive }
                  : { background: "white", color: P.textMid, borderColor: P.border }
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  // BOOLEAN → toggle switch
  if (valueType === "BOOLEAN") {
    const on = Boolean(value);
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(!on)}
          className="w-10 h-5 rounded-full relative transition-colors disabled:opacity-60 flex-shrink-0"
          style={{ background: on ? P.olive : "#CBD5E1" }}
          aria-pressed={on}
        >
          <span
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
            style={{ left: on ? "22px" : "2px" }}
          />
        </button>
        <span className="text-xs font-medium" style={{ color: on ? P.darkOlive : P.textMuted }}>
          {on ? "Enabled" : "Disabled"}
        </span>
      </div>
    );
  }

  // NUMBER → number input (nullable keys allow clearing → null)
  if (valueType === "NUMBER") {
    return (
      <input
        type="number"
        value={value == null ? "" : String(value)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} font-mono`}
        style={fieldStyle}
      />
    );
  }

  // JSON (no options) → JSON editor textarea
  if (valueType === "JSON") {
    return (
      <textarea
        value={typeof value === "string" ? value : serializeValue(value)}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        spellCheck={false}
        className={`${fieldClass} font-mono resize-y`}
        style={fieldStyle}
        placeholder="[] or { … }"
      />
    );
  }

  // Custom theme colors → color picker panel
  if (setting.settingKey === "custom_theme_colors") {
    const parseColors = (): Record<string, string> => {
      try {
        const v =
          typeof value === "string"
            ? JSON.parse(value || "{}")
            : (value as Record<string, string>) || {};
        return typeof v === "object" && v !== null ? v : {};
      } catch {
        return {};
      }
    };
    const colors = parseColors();
    const colorKeys = [
      { key: "background", label: "Background" },
      { key: "foreground", label: "Text" },
      { key: "card", label: "Card" },
      { key: "primary", label: "Primary" },
      { key: "secondary", label: "Secondary" },
      { key: "muted", label: "Muted" },
      { key: "accent", label: "Accent" },
      { key: "border", label: "Border" },
      { key: "sidebar", label: "Sidebar" },
    ];
    const updateColor = (k: string, hex: string) => {
      const next = { ...colors, [k]: hex };
      onChange(JSON.stringify(next));
    };
    return (
      <div className="grid grid-cols-3 gap-3">
        {colorKeys.map(({ key, label }) => {
          const hex = colors[key] || "#000000";
          return (
            <div key={key} className="space-y-1">
              <p className="text-[10px] font-medium" style={{ color: P.textMuted }}>
                {label}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="relative flex-shrink-0">
                  <span
                    className="block w-7 h-7 rounded-lg border"
                    style={{ background: hex, borderColor: P.border }}
                  />
                  <input
                    type="color"
                    value={hex}
                    disabled={disabled}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <input
                  value={hex}
                  disabled={disabled}
                  onChange={(e) =>
                    updateColor(
                      key,
                      e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`,
                    )
                  }
                  className="flex-1 px-2 py-1 text-[10px] rounded bg-white focus:outline-none font-mono"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // STRING (free text)
  return (
    <input
      type="text"
      value={value == null ? "" : String(value)}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={fieldClass}
      style={fieldStyle}
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Advanced Mode — custom setting creator (Super Admin only)
// ─────────────────────────────────────────────────────────────

const VALUE_TYPE_OPTIONS: { value: SettingValueType; label: string }[] = [
  { value: "STRING", label: "String" },
  { value: "NUMBER", label: "Number" },
  { value: "BOOLEAN", label: "Boolean" },
  { value: "JSON", label: "JSON" },
];

function AdvancedCreateForm({
  category,
  onCreated,
}: {
  category: SettingCategory;
  onCreated: (setting: SystemSettingDto) => void;
}) {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<{
    settingKey: string;
    valueType: SettingValueType;
    settingValue: string;
    description: string;
  }>({ settingKey: "", valueType: "STRING", settingValue: "", description: "" });

  const canSubmit =
    /^[a-z][a-z0-9_.-]{1,149}$/.test(form.settingKey.trim()) && form.settingValue.trim() !== "";

  const buildValue = (): unknown => {
    const { valueType, settingValue } = form;
    const raw = settingValue.trim();
    if (valueType === "NUMBER") return raw === "" ? null : Number(raw);
    if (valueType === "BOOLEAN") return raw === "true" ? true : raw === "false" ? false : raw;
    if (valueType === "JSON") {
      try {
        return JSON.parse(raw);
      } catch {
        return raw; // let the backend surface the validation error
      }
    }
    return raw;
  };

  const handleCreate = async () => {
    setCreating(true);
    setError("");
    try {
      const created = await systemSettingsApi.create({
        category,
        settingKey: form.settingKey.trim(),
        settingValue: buildValue(),
        valueType: form.valueType,
        description: form.description.trim() || undefined,
      });
      setForm({ settingKey: "", valueType: "STRING", settingValue: "", description: "" });
      setOpen(false);
      onCreated(created);
    } catch (e: any) {
      setError(e?.message ?? "Failed to create the setting.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="rounded-xl border bg-white overflow-hidden" style={{ borderColor: P.gold }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
        style={{ background: P.goldLight }}
      >
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        <KeyRound size={14} style={{ color: "#8A6A1A" }} />
        <span className="text-xs font-bold" style={{ color: "#6B5212" }}>
          Advanced Mode — Create Custom Setting
        </span>
        <span
          className="ml-auto text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1"
          style={{ color: "#8A6A1A" }}
        >
          <Lock size={10} /> Super Admin only
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: P.textMuted }}
              >
                Key *
              </label>
              <input
                value={form.settingKey}
                onChange={(e) => setForm((f) => ({ ...f, settingKey: e.target.value }))}
                placeholder="e.g. custom.policy.key"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none font-mono"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wider mb-1"
                style={{ color: P.textMuted }}
              >
                Type *
              </label>
              <select
                value={form.valueType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valueType: e.target.value as SettingValueType }))
                }
                className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {VALUE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: P.textMuted }}
            >
              Value *
            </label>
            {form.valueType === "BOOLEAN" ? (
              <div className="flex gap-2">
                {["true", "false"].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, settingValue: v }))}
                    className="px-3 py-2 rounded-lg text-xs font-semibold border"
                    style={
                      form.settingValue === v
                        ? { background: P.olive, color: "white", borderColor: P.olive }
                        : { background: "white", color: P.textMid, borderColor: P.border }
                    }
                  >
                    {v === "true" ? "true" : "false"}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                value={form.settingValue}
                onChange={(e) => setForm((f) => ({ ...f, settingValue: e.target.value }))}
                rows={form.valueType === "JSON" ? 4 : 2}
                spellCheck={false}
                placeholder={
                  form.valueType === "NUMBER"
                    ? "e.g. 50"
                    : form.valueType === "JSON"
                      ? 'e.g. ["value1", "value2"]'
                      : "e.g. my-value"
                }
                className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none font-mono resize-y"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            )}
          </div>
          <div>
            <label
              className="block text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ color: P.textMuted }}
            >
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
              className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              <AlertCircle size={13} /> {error}
            </div>
          )}
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={!canSubmit || creating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: P.olive }}
          >
            {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Create
            Setting
          </button>
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────
// Main System Settings screen
// ─────────────────────────────────────────────────────────────

export function ConfigSystemSettings() {
  const can = usePermission();
  const [settings, setSettings] = useState<SystemSettingDto[]>([]);
  const [drafts, setDrafts] = useState<Record<string, unknown>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<SettingCategory>("GENERAL");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const canView = can("system_setting.view");
  const canEdit = can("system_setting.update");
  // Super Admin only — custom/free-text key creation (Advanced mode).
  const isSuperAdmin = can("system_config.manage");
  const canCreate = can("system_setting.create") && isSuperAdmin;
  const canDelete = can("system_setting.delete") && isSuperAdmin;

  // ── data loading ────────────────────────────────────────────
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await systemSettingsApi.list({ pageSize: 300 }, signal);
      if (signal?.aborted) return;
      setSettings(data);
      setDrafts({});
      // Live branding: apply persisted settings as soon as they arrive.
      applySettingsToBranding(data);
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load settings.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // ── derived ─────────────────────────────────────────────────
  const settingsByKey = useMemo(() => new Map(settings.map((s) => [s.settingKey, s])), [settings]);

  const dirtyKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const setting of settings) {
      const draft = drafts[setting.settingKey];
      if (draft === undefined) continue;
      if (serializeValue(draft) !== serializeValue(setting.settingValue))
        keys.add(setting.settingKey);
    }
    return keys;
  }, [settings, drafts]);

  const hasDirty = dirtyKeys.size > 0;

  const handleChange = (key: string, next: unknown) => {
    setDrafts((prev) => ({ ...prev, [key]: next }));
  };

  const handleCancel = () => {
    setDrafts({});
    setError("");
  };

  const handleSave = async () => {
    if (!hasDirty) return;
    setSaving(true);
    setError("");
    try {
      const items: BulkUpdateItemInput[] = [];
      for (const key of dirtyKeys) {
        const setting = settingsByKey.get(key);
        if (!setting) continue;
        const value = drafts[key];
        if (setting.id > 0) items.push({ id: setting.id, settingValue: value });
        else items.push({ settingKey: key, settingValue: value });
      }

      const updated = await systemSettingsApi.bulkUpdate(items);
      const byKey = new Map(updated.map((s) => [s.settingKey, s]));
      setSettings((prev) =>
        prev.map((s) => (byKey.has(s.settingKey) ? byKey.get(s.settingKey)! : s)),
      );
      setDrafts({});
      // Live branding: theme / colors / logo / name / maintenance apply immediately.
      applySettingsToBranding(updated);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await systemSettingsApi.delete(id);
      setSettings((prev) => prev.filter((s) => s.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete the setting.");
    }
  };

  const handleCreated = (created: SystemSettingDto) => {
    setSettings((prev) => [...prev, created]);
  };

  if (!canView) {
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view system settings.
      </div>
    );
  }

  const categorySettings = settings.filter((s) => s.category === activeCategory);
  const toggleCollapsed = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showActions = canEdit || hasDirty;

  return (
    <div className="flex flex-col h-full">
      {/* Loading overlay */}
      {loading && (
        <div className="flex-1 flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin" style={{ color: P.olive }} />
        </div>
      )}

      {/* Error banner */}
      {error && !loading && (
        <div className="m-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Main content (hidden while loading) */}
      {!loading && (
        <>
          {/* Header */}
          <div className="p-6 border-b" style={{ borderBottomColor: P.border }}>
            <div className="flex items-center gap-3">
              <Settings size={20} style={{ color: P.olive }} />
              <h2 className="text-xl font-bold" style={{ color: P.text }}>
                System Settings
              </h2>
              {!canEdit && <Lock size={14} style={{ color: P.textMuted }} />}
            </div>
            <p className="text-sm mt-1" style={{ color: P.textMuted }}>
              Company-scoped configuration — core settings are managed and cannot be deleted.
            </p>
          </div>

          {/* Category tabs */}
          <div
            className="px-6 py-3 border-b overflow-x-auto"
            style={{ borderBottomColor: P.border }}
          >
            <div className="flex items-center gap-1.5 min-w-max">
              {CATEGORY_ORDER.map((cat) => {
                const count = settings.filter((s) => s.category === cat).length;
                const active = cat === activeCategory;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat);
                      setCollapsed({});
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap"
                    style={{
                      background: active ? P.olive : P.paleGreen,
                      color: active ? "white" : P.textMid,
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                    {count > 0 && <span className="ml-1.5 text-[9px] opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {categorySettings.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: P.textMuted }}>
                  No settings configured for this category.
                </div>
              ) : (
                categorySettings.map((setting) => {
                  const draft = drafts[setting.settingKey];
                  const value = draft !== undefined ? draft : setting.settingValue;
                  const isDirty = dirtyKeys.has(setting.settingKey);
                  const collapsedState = !!collapsed[setting.settingKey];

                  return (
                    <SettingRow
                      key={setting.id ?? setting.settingKey}
                      setting={setting}
                      value={value}
                      canEdit={canEdit}
                      canDelete={canDelete}
                      isDirty={isDirty}
                      collapsed={collapsedState}
                      onToggleCollapsed={() => toggleCollapsed(setting.settingKey)}
                      onChange={(next) => handleChange(setting.settingKey, next)}
                      onDelete={() => handleDelete(setting.id)}
                    />
                  );
                })
              )}
            </div>

            {/* Advanced Mode — Super Admin only */}
            {canCreate && (
              <AdvancedCreateForm category={activeCategory} onCreated={handleCreated} />
            )}
          </div>

          {/* Save / Cancel actions */}
          {showActions && (
            <div
              className="p-4 border-t flex items-center justify-between"
              style={{ borderTopColor: P.border, background: P.paleGreen }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleCancel()}
                  disabled={!hasDirty || saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                  style={{
                    border: `1px solid ${P.border}`,
                    color: P.textMid,
                    backgroundColor: "white",
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={!hasDirty || saving}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors flex items-center gap-1.5"
                  style={{
                    background: hasDirty && !saving ? P.olive : P.borderMid,
                    opacity: hasDirty && !saving ? 1 : 0.5,
                  }}
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  Save Changes
                </button>
              </div>
              {hasDirty && (
                <span className="text-[11px]" style={{ color: P.textMuted }}>
                  {dirtyKeys.size} change{dirtyKeys.size === 1 ? "" : "s"} pending
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
