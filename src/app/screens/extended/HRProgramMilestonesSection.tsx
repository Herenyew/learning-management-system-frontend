import { useCallback, useEffect, useState } from "react";
import { Check, Edit3, Flag, Plus, Trash2, X } from "lucide-react";
import { programApi } from "../../API/program.api";
import type { ProgramMilestone, ProgramMilestoneInput } from "../../models/program.model";
import { P } from "./extended.shared";
import {
  HRProgramSectionShell,
  SectionMutationError,
  mutationMessage,
  nullableNumber,
  programButtonClass,
  programFieldClass,
  toDateInput,
} from "./HRProgramSectionShell";

type Draft = {
  title: string;
  percentage: string;
  scheduleMode: "date" | "offset";
  targetDate: string;
  targetOffsetDays: string;
  overdueAction: string;
  reminders: string;
  completionExpression: string;
};
const emptyDraft = (): Draft => ({
  title: "",
  percentage: "",
  scheduleMode: "offset",
  targetDate: "",
  targetOffsetDays: "",
  overdueAction: "",
  reminders: "",
  completionExpression: "",
});
const fromMilestone = (item: ProgramMilestone): Draft => ({
  title: item.title,
  percentage: String(item.milestonePercentage),
  scheduleMode: item.targetDate ? "date" : "offset",
  targetDate: toDateInput(item.targetDate),
  targetOffsetDays: item.targetOffsetDays != null ? String(item.targetOffsetDays) : "",
  overdueAction: item.overdueAction ?? "",
  reminders: item.reminderOffsetsDays.join(", "),
  completionExpression: item.completionExpression ? JSON.stringify(item.completionExpression) : "",
});

export function HRProgramMilestonesSection({
  programId,
  canWrite,
  onChanged,
}: {
  programId: number;
  canWrite: boolean;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<ProgramMilestone[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const data = await programApi.milestones.list(programId, signal);
        if (!signal?.aborted) setItems(data);
      } catch (reason: unknown) {
        if (!signal?.aborted) setError(mutationMessage(reason, "Unable to load milestones."));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [programId],
  );
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);
  const closeForm = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(false);
    setMutationError("");
  };
  const save = async () => {
    if (!draft.title.trim()) return setMutationError("Milestone title is required.");
    const percentage = Number(draft.percentage);
    if (!(percentage >= 1 && percentage <= 100))
      return setMutationError("Milestone percentage must be between 1 and 100.");
    let completionExpression: Record<string, unknown> | null = null;
    if (draft.completionExpression.trim()) {
      try {
        const parsed: unknown = JSON.parse(draft.completionExpression);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
        completionExpression = parsed as Record<string, unknown>;
      } catch {
        return setMutationError("Completion expression must be a JSON object.");
      }
    }
    const reminders = draft.reminders
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map(Number);
    if (reminders.some((value) => !Number.isInteger(value) || value < 0))
      return setMutationError(
        "Reminder offsets must be non-negative whole numbers separated by commas.",
      );
    const input: ProgramMilestoneInput = {
      title: draft.title.trim(),
      milestonePercentage: percentage,
      targetDate: draft.scheduleMode === "date" ? draft.targetDate || null : null,
      targetOffsetDays:
        draft.scheduleMode === "offset" ? nullableNumber(draft.targetOffsetDays) : null,
      overdueAction: draft.overdueAction.trim() || null,
      reminderOffsetsDays: reminders,
      completionExpression,
    };
    setSaving(true);
    setMutationError("");
    try {
      if (editingId) await programApi.milestones.update(programId, editingId, input);
      else await programApi.milestones.create(programId, input);
      closeForm();
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to save milestone."));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item: ProgramMilestone) => {
    if (!window.confirm(`Delete milestone “${item.title}”?`)) return;
    setSaving(true);
    setMutationError("");
    try {
      await programApi.milestones.delete(programId, item.id);
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to delete milestone."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <HRProgramSectionShell
      title="Milestones"
      description="Define progress checkpoints using an exact target date or an offset from program start."
      icon={Flag}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        canWrite && !showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className={programButtonClass}
            style={{ background: P.lightSage, color: P.olive }}
          >
            <Plus size={13} /> Add milestone
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        <SectionMutationError message={mutationError} />
        {showForm && (
          <div
            className="space-y-3 rounded-xl border p-4"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Title
                <input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                />
              </label>
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Progress percentage
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={draft.percentage}
                  onChange={(e) => setDraft({ ...draft, percentage: e.target.value })}
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                />
              </label>
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Schedule by
                <select
                  value={draft.scheduleMode}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      scheduleMode: e.target.value as Draft["scheduleMode"],
                      targetDate: "",
                      targetOffsetDays: "",
                    })
                  }
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                >
                  <option value="offset">Offset from start</option>
                  <option value="date">Exact date</option>
                </select>
              </label>
              {draft.scheduleMode === "date" ? (
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Target date
                  <input
                    type="date"
                    value={draft.targetDate}
                    onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
                    className={`${programFieldClass} mt-1`}
                    style={{ borderColor: P.border }}
                  />
                </label>
              ) : (
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Target offset days
                  <input
                    type="number"
                    min={0}
                    value={draft.targetOffsetDays}
                    onChange={(e) => setDraft({ ...draft, targetOffsetDays: e.target.value })}
                    className={`${programFieldClass} mt-1`}
                    style={{ borderColor: P.border }}
                  />
                </label>
              )}
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Overdue action
                <input
                  value={draft.overdueAction}
                  onChange={(e) => setDraft({ ...draft, overdueAction: e.target.value })}
                  placeholder="e.g. REMIND"
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                />
              </label>
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Reminder offsets (days)
                <input
                  value={draft.reminders}
                  onChange={(e) => setDraft({ ...draft, reminders: e.target.value })}
                  placeholder="14, 7, 1"
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                />
              </label>
              <label className="sm:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>
                Completion expression (JSON object)
                <textarea
                  rows={2}
                  value={draft.completionExpression}
                  onChange={(e) => setDraft({ ...draft, completionExpression: e.target.value })}
                  placeholder='{"requiredCoursesComplete": true}'
                  className={`${programFieldClass} mt-1 resize-y font-mono text-xs`}
                  style={{ borderColor: P.border }}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className={programButtonClass}
                style={{ color: P.textMid }}
              >
                <X size={13} /> Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void save()}
                className={`${programButtonClass} text-white`}
                style={{ background: P.olive }}
              >
                <Check size={13} /> {saving ? "Saving…" : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        )}
        {items.length ? (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{ borderColor: P.border }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: P.lightSage, color: P.olive }}
                >
                  {Number(item.milestonePercentage)}%
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {item.title}
                  </p>
                  <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
                    {item.targetDate
                      ? `Target ${toDateInput(item.targetDate)}`
                      : item.targetOffsetDays != null
                        ? `Target day ${item.targetOffsetDays}`
                        : "No target schedule"}{" "}
                    · {item._count.progresses} progress records
                    {item.overdueAction ? ` · ${item.overdueAction}` : ""}
                  </p>
                </div>
                {canWrite && (
                  <div className="flex">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(item.id);
                        setDraft(fromMilestone(item));
                        setShowForm(true);
                        setMutationError("");
                      }}
                      className="p-1.5"
                      style={{ color: P.olive }}
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void remove(item)}
                      className="p-1.5"
                      style={{ color: "#C0392B" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p
              className="rounded-xl border p-4 text-xs"
              style={{ borderColor: P.border, color: P.textMuted }}
            >
              No milestones are configured.
            </p>
          )
        )}
      </div>
    </HRProgramSectionShell>
  );
}
