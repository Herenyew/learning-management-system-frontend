import React, { useEffect, useMemo, useState } from "react";
import { XPRulesCrud } from "../../Extensions5";
import { catalogConfigurationApi } from "../../API/catalogConfiguration.api";
import { usePermission } from "../../hooks/usePermission";
import {
  Award,
  Confirm,
  CrudModal,
  Edit,
  Field,
  Inp,
  P,
  Plus,
  SaveBtn,
  Trash2,
} from "../adminRecords/adminRecords.shared";

type LearnerLevel = {
  id: string;
  name: string;
  minXp: number;
  maxXp: number | null;
  color: string;
};

const LEARNER_LEVELS_STORAGE_KEY = "learnos.learner-levels";
const LEGACY_XP_CONFIG_STORAGE_KEY = "learnos_xp_gamification_config";

const DEFAULT_LEARNER_LEVELS: LearnerLevel[] = [
  { id: "level-1", name: "Learner", minXp: 0, maxXp: 999, color: "#6EE7B7" },
  { id: "level-2", name: "Explorer", minXp: 1000, maxXp: 2999, color: "#047857" },
  { id: "level-3", name: "Achiever", minXp: 3000, maxXp: 5999, color: "#C8A85D" },
  { id: "level-4", name: "Expert", minXp: 6000, maxXp: 9999, color: "#4A7A5A" },
  { id: "level-5", name: "Master", minXp: 10000, maxXp: null, color: "#064E3B" },
];

function isLearnerLevel(value: unknown): value is LearnerLevel {
  if (!value || typeof value !== "object") return false;
  const level = value as Record<string, unknown>;
  const minXp = typeof level.minXp === "number" ? level.minXp : level.min;
  const maxXp = level.maxXp === null ? null : (level.maxXp ?? level.max);

  return (
    typeof level.id === "string" &&
    typeof level.name === "string" &&
    typeof minXp === "number" &&
    (maxXp === null || typeof maxXp === "number") &&
    typeof level.color === "string"
  );
}

function normalizeLevel(value: LearnerLevel | Record<string, unknown>): LearnerLevel {
  return {
    id: String(value.id),
    name: String(value.name),
    minXp: Number("minXp" in value ? value.minXp : value.min),
    maxXp:
      ("maxXp" in value ? value.maxXp : value.max) === null
        ? null
        : Number("maxXp" in value ? value.maxXp : value.max),
    color: String(value.color),
  };
}

function loadLearnerLevels(): LearnerLevel[] {
  if (typeof window === "undefined") return DEFAULT_LEARNER_LEVELS;

  try {
    const stored = window.localStorage.getItem(LEARNER_LEVELS_STORAGE_KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(isLearnerLevel)) {
        return parsed.map((level) => normalizeLevel(level));
      }
    }

    const legacy = window.localStorage.getItem(LEGACY_XP_CONFIG_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { levels?: unknown };
      if (Array.isArray(parsed.levels) && parsed.levels.every(isLearnerLevel)) {
        return parsed.levels.map((level) => normalizeLevel(level));
      }
    }
  } catch {
    // Restore defaults when locally stored prototype data is malformed.
  }

  return DEFAULT_LEARNER_LEVELS;
}

function LevelForm({
  row,
  rows,
  onSave,
  onClose,
}: {
  row: LearnerLevel | null;
  rows: LearnerLevel[];
  onSave: (level: LearnerLevel) => void;
  onClose: () => void;
}) {
  const openEndedLevel = [...rows]
    .filter((level) => level.maxXp === null)
    .sort((a, b) => b.minXp - a.minXp)[0];
  const nextMinimum = openEndedLevel
    ? openEndedLevel.minXp + 5000
    : Math.max(0, ...rows.map((level) => level.maxXp ?? level.minXp)) + 1;
  const [form, setForm] = useState<LearnerLevel>(() =>
    row
      ? { ...row }
      : {
          id: `level-${Date.now()}`,
          name: "",
          minXp: nextMinimum,
          maxXp: nextMinimum + 999,
          color: "#047857",
        },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const save = () => {
    const name = form.name.trim();
    const nextErrors: Record<string, string> = {};

    if (!name) nextErrors.name = "Level name is required.";
    else if (
      rows.some(
        (level) => level.id !== form.id && level.name.trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      nextErrors.name = "A learner level with this name already exists.";
    }
    if (!Number.isFinite(form.minXp) || form.minXp < 0) {
      nextErrors.minXp = "Minimum XP must be zero or greater.";
    }
    if (form.maxXp !== null && (!Number.isFinite(form.maxXp) || form.maxXp <= form.minXp)) {
      nextErrors.maxXp = "Maximum XP must be greater than minimum XP, or blank for no limit.";
    }

    const currentMaximum = form.maxXp ?? Number.POSITIVE_INFINITY;
    const overlaps = rows.some((level) => {
      if (level.id === form.id) return false;
      if (!row && level.maxXp === null && level.minXp < form.minXp) return false;
      const levelMaximum = level.maxXp ?? Number.POSITIVE_INFINITY;
      return form.minXp <= levelMaximum && level.minXp <= currentMaximum;
    });
    if (overlaps) nextErrors.range = "This XP range overlaps another learner level.";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    onSave({ ...form, name });
  };

  const error = (field: string) =>
    errors[field] ? (
      <p className="mt-1.5 text-xs" role="alert" style={{ color: "#B91C1C" }}>
        {errors[field]}
      </p>
    ) : null;

  return (
    <CrudModal title={row ? "Edit Learner Level" : "New Learner Level"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Level Name" required>
          <Inp
            value={form.name}
            onChange={(name) => {
              setForm({ ...form, name });
              setErrors((current) => ({ ...current, name: "" }));
            }}
            placeholder="e.g. Explorer"
          />
          {error("name")}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Minimum XP" required>
            <Inp
              type="number"
              value={String(form.minXp)}
              onChange={(value) => {
                setForm({ ...form, minXp: Number(value) });
                setErrors((current) => ({ ...current, minXp: "", range: "" }));
              }}
            />
            {error("minXp")}
          </Field>
          <Field label="Maximum XP">
            <Inp
              type="number"
              value={form.maxXp === null ? "" : String(form.maxXp)}
              onChange={(value) => {
                setForm({ ...form, maxXp: value === "" ? null : Number(value) });
                setErrors((current) => ({ ...current, maxXp: "", range: "" }));
              }}
              placeholder="No limit"
            />
            {error("maxXp")}
          </Field>
        </div>
        {error("range")}
        <Field label="Level Color">
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.color}
              onChange={(event) => setForm({ ...form, color: event.target.value })}
              className="h-10 w-14 cursor-pointer rounded-lg bg-white p-1"
              style={{ border: `1px solid ${P.border}` }}
              aria-label="Level color"
            />
            <span className="font-mono text-xs" style={{ color: P.textMuted }}>
              {form.color.toUpperCase()}
            </span>
          </div>
        </Field>
        <SaveBtn onSave={save} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

function LearnerLevelsTable() {
  const can = usePermission();
  const [levels, setLevels] = React.useState<LearnerLevel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState<LearnerLevel | "new" | null>(null);
  const [deleting, setDeleting] = React.useState<LearnerLevel | null>(null);

  const sortedLevels = React.useMemo(() => [...levels].sort((a, b) => a.minXp - b.minXp), [levels]);

  const load = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await catalogConfigurationApi.listLearningLevels(signal);
      if (!signal?.aborted)
        setLevels(
          data.map((dto) => ({
            id: String(dto.id),
            name: dto.name,
            minXp: dto.minimumXp,
            maxXp: dto.maximumXp ?? null,
            color: dto.badgeColor ?? "#047857",
          })),
        );
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load learner levels.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  const saveLevel = async (saved: LearnerLevel) => {
    const isNew =
      saved.id.startsWith("level-") &&
      !levels.find((l) => l.id === saved.id && !l.id.includes(Date.now().toString().slice(-4)));
    const isExisting = levels.some((l) => l.id === saved.id) && !saved.id.startsWith("level-new");
    const input = {
      name: saved.name,
      minimumXp: saved.minXp,
      maximumXp: saved.maxXp ?? null,
      badgeColor: saved.color,
    };
    try {
      if (isExisting) {
        const dto = await catalogConfigurationApi.updateLearningLevel(Number(saved.id), input);
        setLevels((prev) =>
          prev.map((l) =>
            l.id === saved.id
              ? {
                  id: String(dto.id),
                  name: dto.name,
                  minXp: dto.minimumXp,
                  maxXp: dto.maximumXp ?? null,
                  color: dto.badgeColor ?? saved.color,
                }
              : l,
          ),
        );
      } else {
        const dto = await catalogConfigurationApi.createLearningLevel(input);
        setLevels((prev) => [
          ...prev,
          {
            id: String(dto.id),
            name: dto.name,
            minXp: dto.minimumXp,
            maxXp: dto.maximumXp ?? null,
            color: dto.badgeColor ?? saved.color,
          },
        ]);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to save.");
    }
    setEditing(null);
  };

  const deleteLevel = async (level: LearnerLevel) => {
    try {
      await catalogConfigurationApi.deleteLearningLevel(Number(level.id));
      setLevels((prev) => prev.filter((l) => l.id !== level.id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
    }
    setDeleting(null);
  };

  if (!can("learning_level.view"))
    return (
      <div className="p-4 text-xs text-center" style={{ color: P.textMuted }}>
        No permission to view learning levels.
      </div>
    );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: P.lightSage }}
          >
            <Award size={15} style={{ color: P.olive }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: P.text }}>
              Learner Levels
            </p>
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              Configure learner levels based on accumulated XP points
            </p>
          </div>
        </div>
        {can("learning_level.create") && (
          <button
            onClick={() => setEditing("new")}
            className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
            style={{ background: P.olive }}
          >
            <Plus size={13} /> New Level
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4 text-xs" style={{ color: P.textMuted }}>
          <span className="animate-spin">⟳</span> Loading levels…
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <span>⚠</span>
          {error}
          <button onClick={() => void load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}

      {!loading && (
        <div
          className="overflow-hidden rounded-xl border bg-white"
          style={{ borderColor: P.border }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                  {["Level", "Minimum XP", "Maximum XP", "XP Range", "Actions"].map((label) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: P.textMuted }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedLevels.map((level, index) => (
                  <tr
                    key={level.id}
                    style={{
                      borderBottom:
                        index < sortedLevels.length - 1 ? `1px solid ${P.border}` : undefined,
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ background: level.color }}
                        >
                          {index + 1}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: P.text }}>
                          {level.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: P.textMid }}>
                      {level.minXp.toLocaleString()} XP
                    </td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: P.textMid }}>
                      {level.maxXp === null ? "No limit" : `${level.maxXp.toLocaleString()} XP`}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: P.textMuted }}>
                      {level.minXp.toLocaleString()} – {level.maxXp?.toLocaleString() ?? "∞"} XP
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {can("learning_level.update") && (
                          <button
                            onClick={() => setEditing(level)}
                            title={`Edit ${level.name}`}
                            className="rounded-lg p-1.5 transition-colors hover:bg-emerald-50"
                            style={{ color: P.olive }}
                          >
                            <Edit size={13} />
                          </button>
                        )}
                        {can("learning_level.delete") && (
                          <button
                            onClick={() => setDeleting(level)}
                            title={`Delete ${level.name}`}
                            className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                            style={{ color: "#C0392B" }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {sortedLevels.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-8 text-xs"
                      style={{ color: P.textMuted }}
                    >
                      No learner levels yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <LevelForm
            row={editing === "new" ? null : editing}
            rows={levels}
            onSave={(saved) => void saveLevel(saved)}
            onClose={() => setEditing(null)}
          />
        </div>
      )}
      {deleting && (
        <Confirm
          message={`Delete learner level "${deleting.name}"? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void deleteLevel(deleting)}
        />
      )}
    </section>
  );
}

export function ConfigXPGamification() {
  return (
    <div className="space-y-8">
      <XPRulesCrud />
      <LearnerLevelsTable />
    </div>
  );
}
