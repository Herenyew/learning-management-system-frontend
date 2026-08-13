import React, { useEffect, useMemo, useState } from "react";
import { XPRulesCrud } from "../../Extensions5";
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
  const [levels, setLevels] = useState<LearnerLevel[]>(loadLearnerLevels);
  const [editing, setEditing] = useState<LearnerLevel | "new" | null>(null);
  const [deleting, setDeleting] = useState<LearnerLevel | null>(null);
  const sortedLevels = useMemo(() => [...levels].sort((a, b) => a.minXp - b.minXp), [levels]);

  useEffect(() => {
    window.localStorage.setItem(LEARNER_LEVELS_STORAGE_KEY, JSON.stringify(levels));
  }, [levels]);

  const saveLevel = (saved: LearnerLevel) => {
    setLevels((current) => {
      const exists = current.some((level) => level.id === saved.id);
      if (exists) {
        return current.map((level) => (level.id === saved.id ? saved : level));
      }

      const cappedLevels = current.map((level) =>
        level.maxXp === null && level.minXp < saved.minXp
          ? { ...level, maxXp: saved.minXp - 1 }
          : level,
      );
      return [...cappedLevels, saved];
    });
    setEditing(null);
  };

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
        <button
          onClick={() => setEditing("new")}
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white"
          style={{ background: P.olive }}
        >
          <Plus size={13} /> New Level
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white" style={{ borderColor: P.border }}>
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
                      <button
                        onClick={() => setEditing(level)}
                        title={`Edit ${level.name}`}
                        aria-label={`Edit ${level.name}`}
                        className="rounded-lg p-1.5 transition-colors hover:bg-emerald-50"
                        style={{ color: P.olive }}
                      >
                        <Edit size={13} />
                      </button>
                      <button
                        onClick={() => setDeleting(level)}
                        title={`Delete ${level.name}`}
                        aria-label={`Delete ${level.name}`}
                        className="rounded-lg p-1.5 transition-colors hover:bg-red-50"
                        style={{ color: "#C0392B" }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <LevelForm
            row={editing === "new" ? null : editing}
            rows={levels}
            onSave={saveLevel}
            onClose={() => setEditing(null)}
          />
        </div>
      )}
      {deleting && (
        <Confirm
          message={`Delete learner level "${deleting.name}"? This cannot be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            setLevels((current) => current.filter((level) => level.id !== deleting.id));
            setDeleting(null);
          }}
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
