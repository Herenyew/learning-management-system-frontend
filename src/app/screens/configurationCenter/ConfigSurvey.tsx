import React, { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Loader2,
  AlertCircle,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
} from "lucide-react";
import { P, CfgSection } from "./configuration.shared";
import {
  surveyConfigApi,
  type SurveyQuestionTypeDto,
  type ConfigJson,
} from "../../API/survey-config.api";
import { usePermission } from "../../hooks/usePermission";

type FieldType = "text" | "number" | "boolean" | "select" | "options";
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

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes/No" },
  { value: "select", label: "Dropdown" },
  { value: "options", label: "Options List" },
];

function emptyFieldSpec(): FieldSpec {
  return { key: "", label: "", type: "text" };
}

function FieldBuilder({
  qt,
  editingFields,
  onAddField,
  onUpdateField,
  onRemoveField,
  onMoveField,
  onSave,
  onCancel,
  saving,
}: {
  qt: SurveyQuestionTypeDto;
  editingFields: Record<number, FieldSpec[]>;
  onAddField: (qtId: number) => void;
  onUpdateField: (qtId: number, idx: number, patch: Partial<FieldSpec>) => void;
  onRemoveField: (qtId: number, idx: number) => void;
  onMoveField: (qtId: number, idx: number, dir: -1 | 1) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const fields = editingFields[qt.id] ?? [];
  return (
    <div className="border-t p-3 space-y-2" style={{ borderColor: P.border }}>
      <p className="text-[11px] font-semibold" style={{ color: P.textMid }}>
        Field Builder — define what fields appear when &ldquo;{qt.name}&rdquo; is selected
      </p>
      {fields.map((field, idx) => (
        <div
          key={idx}
          className="p-2 rounded-lg border space-y-2"
          style={{ borderColor: P.border, background: P.paleGreen }}
        >
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMoveField(qt.id, idx, -1)}
              disabled={idx === 0}
              className="p-0.5 rounded hover:bg-emerald-50 disabled:opacity-30"
              style={{ color: P.textMid }}
            >
              <ChevronUp size={11} />
            </button>
            <button
              onClick={() => onMoveField(qt.id, idx, 1)}
              disabled={idx === fields.length - 1}
              className="p-0.5 rounded hover:bg-emerald-50 disabled:opacity-30"
              style={{ color: P.textMid }}
            >
              <ChevronDown size={11} />
            </button>
            <input
              value={field.key}
              onChange={(e) =>
                onUpdateField(qt.id, idx, { key: e.target.value.replace(/[^a-zA-Z0-9_]/g, "") })
              }
              placeholder="field_key"
              className="flex-1 px-2 py-1 text-xs rounded bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
            <select
              value={field.type}
              onChange={(e) => onUpdateField(qt.id, idx, { type: e.target.value as FieldType })}
              className="px-2 py-1 text-xs rounded bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              {FIELD_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>
                  {ft.label}
                </option>
              ))}
            </select>
            <button
              onClick={() => onRemoveField(qt.id, idx)}
              className="p-0.5 rounded hover:bg-red-50"
              style={{ color: "#C0392B" }}
            >
              <X size={12} />
            </button>
          </div>
          <input
            value={field.label}
            onChange={(e) => onUpdateField(qt.id, idx, { label: e.target.value })}
            placeholder="Field label"
            className="w-full px-2 py-1 text-xs rounded bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
          {field.type === "number" && (
            <div className="flex gap-2">
              <input
                type="number"
                value={field.min ?? ""}
                onChange={(e) =>
                  onUpdateField(qt.id, idx, {
                    min: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="Min"
                className="flex-1 px-2 py-1 text-xs rounded bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <input
                type="number"
                value={field.max ?? ""}
                onChange={(e) =>
                  onUpdateField(qt.id, idx, {
                    max: e.target.value === "" ? undefined : Number(e.target.value),
                  })
                }
                placeholder="Max"
                className="flex-1 px-2 py-1 text-xs rounded bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          )}
          {field.type === "select" && (
            <input
              value={(field.choices ?? []).join(", ")}
              onChange={(e) =>
                onUpdateField(qt.id, idx, {
                  choices: e.target.value
                    ? e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [],
                })
              }
              placeholder="Choices (comma-separated)"
              className="w-full px-2 py-1 text-xs rounded bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          )}
          {field.type === "options" && (
            <input
              value={field.itemPlaceholder ?? ""}
              onChange={(e) => onUpdateField(qt.id, idx, { itemPlaceholder: e.target.value })}
              placeholder="Item placeholder (e.g. Option text)"
              className="w-full px-2 py-1 text-xs rounded bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          )}
          {field.type === "text" && (
            <input
              value={field.placeholder ?? ""}
              onChange={(e) => onUpdateField(qt.id, idx, { placeholder: e.target.value })}
              placeholder="Placeholder text"
              className="w-full px-2 py-1 text-xs rounded bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          )}
          {field.type === "boolean" && (
            <label className="flex items-center gap-1.5 text-[11px]" style={{ color: P.textMid }}>
              <span>Default:</span>
              <select
                value={field.default === true ? "true" : "false"}
                onChange={(e) => onUpdateField(qt.id, idx, { default: e.target.value === "true" })}
                className="px-2 py-1 text-xs rounded bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </label>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onAddField(qt.id)}
          className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
          style={{ color: P.olive }}
        >
          <Plus size={11} /> Add field
        </button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
          style={{ background: P.olive }}
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1 rounded-lg text-xs"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ConfigSurvey() {
  const can = usePermission();
  const [questionTypes, setQuestionTypes] = useState<SurveyQuestionTypeDto[]>([]);
  const [loadingQT, setLoadingQT] = useState(true);
  const [errorQT, setErrorQT] = useState("");
  const [newQTName, setNewQTName] = useState("");
  const [addingQT, setAddingQT] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingFields, setEditingFields] = useState<Record<number, FieldSpec[]>>({});
  const [editingQTId, setEditingQTId] = useState<number | null>(null);
  const [savingFields, setSavingFields] = useState<number | null>(null);

  const startEditFields = (qt: SurveyQuestionTypeDto) => {
    setEditingQTId(qt.id);
    const cfg = qt.configJson as { fields?: FieldSpec[] } | null;
    const fields = Array.isArray(cfg?.fields) ? cfg.fields.map((f) => ({ ...f })) : [];
    setEditingFields((prev) => ({ ...prev, [qt.id]: fields }));
  };

  const addField = (qtId: number) => {
    setEditingFields((prev) => ({ ...prev, [qtId]: [...(prev[qtId] ?? []), emptyFieldSpec()] }));
  };

  const updateField = (qtId: number, idx: number, patch: Partial<FieldSpec>) => {
    setEditingFields((prev) => {
      const fields = [...(prev[qtId] ?? [])];
      fields[idx] = { ...fields[idx], ...patch };
      return { ...prev, [qtId]: fields };
    });
  };

  const removeField = (qtId: number, idx: number) => {
    setEditingFields((prev) => ({
      ...prev,
      [qtId]: (prev[qtId] ?? []).filter((_, i) => i !== idx),
    }));
  };

  const moveField = (qtId: number, idx: number, dir: -1 | 1) => {
    setEditingFields((prev) => {
      const fields = [...(prev[qtId] ?? [])];
      const target = idx + dir;
      if (target < 0 || target >= fields.length) return prev;
      [fields[idx], fields[target]] = [fields[target], fields[idx]];
      return { ...prev, [qtId]: fields };
    });
  };

  const handleSaveFields = async (qtId: number) => {
    const fields = (editingFields[qtId] ?? []).filter((f) => f.key.trim() && f.label.trim());
    setSavingFields(qtId);
    try {
      const configJson: ConfigJson = fields.length ? { fields } : {};
      const d = await surveyConfigApi.questionTypes.update(qtId, { configJson });
      setQuestionTypes((prev) => prev.map((q) => (q.id === d.id ? d : q)));
      setEditingQTId(null);
      setEditingFields((prev) => {
        const next = { ...prev };
        delete next[qtId];
        return next;
      });
    } catch (e: any) {
      setErrorQT(e?.message ?? "Failed to save fields.");
    } finally {
      setSavingFields(null);
    }
  };

  const loadQT = useCallback(async (signal?: AbortSignal) => {
    setLoadingQT(true);
    setErrorQT("");
    try {
      const d = await surveyConfigApi.questionTypes.list({}, signal);
      if (!signal?.aborted) setQuestionTypes(d);
    } catch (e: any) {
      if (!signal?.aborted) setErrorQT(e?.message ?? "Failed to load.");
    } finally {
      if (!signal?.aborted) setLoadingQT(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void loadQT(c.signal);
    return () => c.abort();
  }, [loadQT]);

  const handleAddQT = async () => {
    if (!newQTName.trim()) return;
    setAddingQT(true);
    try {
      const slug = newQTName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const d = await surveyConfigApi.questionTypes.create({ name: newQTName.trim(), slug });
      setQuestionTypes((prev) => [...prev, d]);
      setNewQTName("");
    } catch (e: any) {
      setErrorQT(e?.message ?? "Failed to add.");
    } finally {
      setAddingQT(false);
    }
  };

  const handleDeleteQT = async (id: number) => {
    setDeletingId(id);
    try {
      await surveyConfigApi.questionTypes.delete(id);
      setQuestionTypes((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setErrorQT(e?.message ?? "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!can("survey_question_type.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view survey configuration.
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Survey Question Types */}
      <CfgSection title="Survey Question Types">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Define question types available when building survey templates (e.g. Rating Scale, Open
          Text, Multiple Choice).
        </p>
        {loadingQT && (
          <div className="flex items-center gap-2 py-3 text-xs" style={{ color: P.textMuted }}>
            <Loader2 size={13} className="animate-spin" /> Loading…
          </div>
        )}
        {errorQT && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2 mb-2">
            <AlertCircle size={13} />
            {errorQT}
            <button onClick={() => void loadQT()} className="ml-auto underline">
              Retry
            </button>
          </div>
        )}
        {!loadingQT && (
          <div className="space-y-2 mb-3">
            {questionTypes.map((qt) => {
              const fieldCount = ((qt.configJson as { fields?: FieldSpec[] } | null)?.fields ?? [])
                .length;
              const isEditing = editingQTId === qt.id;
              return (
                <div
                  key={qt.id}
                  className="rounded-xl border"
                  style={{ borderColor: P.border, background: "white" }}
                >
                  <div className="flex items-center gap-2 p-3">
                    <span className="flex-1 text-xs font-medium" style={{ color: P.text }}>
                      {qt.name}
                    </span>
                    {fieldCount > 0 && (
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full"
                        style={{ background: P.lightSage, color: P.darkOlive }}
                      >
                        {fieldCount} field{fieldCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {qt.isSystem && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full"
                        style={{ background: P.goldLight, color: "#8A6A1A" }}
                      >
                        system
                      </span>
                    )}
                    <button
                      onClick={() => startEditFields(qt)}
                      title="Configure fields"
                      className="p-1 rounded hover:bg-emerald-50"
                      style={{ color: P.olive }}
                    >
                      <Settings2 size={13} />
                    </button>
                    {!qt.isSystem && can("survey_question_type.delete") && (
                      <button
                        onClick={() => void handleDeleteQT(qt.id)}
                        disabled={deletingId === qt.id}
                      >
                        {deletingId === qt.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Trash2 size={12} />
                        )}
                      </button>
                    )}
                  </div>
                  {isEditing && (
                    <FieldBuilder
                      qt={qt}
                      editingFields={editingFields}
                      onAddField={addField}
                      onUpdateField={updateField}
                      onRemoveField={removeField}
                      onMoveField={moveField}
                      onSave={() => void handleSaveFields(qt.id)}
                      onCancel={() => {
                        setEditingQTId(null);
                        setEditingFields((prev) => {
                          const next = { ...prev };
                          delete next[qt.id];
                          return next;
                        });
                      }}
                      saving={savingFields === qt.id}
                    />
                  )}
                </div>
              );
            })}
            {questionTypes.length === 0 && (
              <p className="text-xs py-3 text-center" style={{ color: P.textMuted }}>
                No question types yet.
              </p>
            )}
          </div>
        )}
        {can("survey_question_type.create") && (
          <div className="flex gap-2">
            <input
              value={newQTName}
              onChange={(e) => setNewQTName(e.target.value)}
              placeholder="Add question type… (e.g. Rating Scale)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newQTName.trim()) void handleAddQT();
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
            <button
              onClick={() => void handleAddQT()}
              disabled={!newQTName.trim() || addingQT}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: P.olive }}
            >
              {addingQT ? <Loader2 size={14} className="animate-spin" /> : "Add"}
            </button>
          </div>
        )}
      </CfgSection>
    </div>
  );
}
