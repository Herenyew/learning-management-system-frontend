import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, BookOpen, Plus, Trash2 } from "lucide-react";
import { enrollmentApi, type EnrollmentReferenceOption } from "../../API/enrollment.api";
import { programApi } from "../../API/program.api";
import type { ProgramCourse } from "../../models/program.model";
import { P } from "./extended.shared";
import {
  HRProgramSectionShell,
  SectionMutationError,
  mutationMessage,
  programButtonClass,
  programFieldClass,
} from "./HRProgramSectionShell";

export function HRProgramCoursesSection({
  programId,
  canWrite,
  onChanged,
}: {
  programId: number;
  canWrite: boolean;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<ProgramCourse[]>([]);
  const [options, setOptions] = useState<EnrollmentReferenceOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [required, setRequired] = useState(true);
  const [phaseNumber, setPhaseNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const [courses, references] = await Promise.all([
          programApi.courses.list(programId, signal),
          enrollmentApi.courseVersions.list({ limit: 100 }, signal),
        ]);
        if (!signal?.aborted) {
          setItems(courses);
          setOptions(references);
        }
      } catch (reason: unknown) {
        if (!signal?.aborted) setError(mutationMessage(reason, "Unable to load program courses."));
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

  const add = async () => {
    if (!selectedId) return;
    setSaving(true);
    setMutationError("");
    try {
      await programApi.courses.create(programId, {
        courseVersionId: Number(selectedId),
        phaseNumber,
        isRequired: required,
      });
      setSelectedId("");
      setPhaseNumber(1);
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to attach course."));
    } finally {
      setSaving(false);
    }
  };
  const setCourseRequired = async (item: ProgramCourse, isRequired: boolean) => {
    setSaving(true);
    setMutationError("");
    try {
      await programApi.courses.update(programId, item.id, { isRequired });
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to update course."));
    } finally {
      setSaving(false);
    }
  };
  const setCoursePhase = async (item: ProgramCourse, nextPhase: number) => {
    if (!Number.isInteger(nextPhase) || nextPhase < 1 || nextPhase === item.phaseNumber) return;
    setSaving(true);
    setMutationError("");
    try {
      await programApi.courses.update(programId, item.id, { phaseNumber: nextPhase });
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to update course phase."));
    } finally {
      setSaving(false);
    }
  };
  const reorder = async (index: number, offset: number) => {
    const next = [...items];
    const target = index + offset;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSaving(true);
    setMutationError("");
    try {
      const ordered = await programApi.courses.reorder(programId, {
        orderedIds: next.map((item) => item.id),
      });
      setItems(ordered);
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to reorder courses."));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (item: ProgramCourse) => {
    if (!window.confirm(`Remove “${item.courseVersion.course.title}” from this program?`)) return;
    setSaving(true);
    setMutationError("");
    try {
      await programApi.courses.delete(programId, item.id);
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to remove course."));
    } finally {
      setSaving(false);
    }
  };

  const attached = new Set(items.map((item) => item.courseVersionId));
  return (
    <HRProgramSectionShell
      title="Courses"
      description="Attach published, approved course versions and arrange the learner sequence."
      icon={BookOpen}
      loading={loading}
      error={error}
      onRetry={() => void load()}
    >
      <div className="space-y-3">
        <SectionMutationError message={mutationError} />
        {canWrite && (
          <div
            className="flex flex-wrap items-end gap-2 rounded-xl border p-3"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <label className="min-w-56 flex-1 text-xs font-semibold" style={{ color: P.textMid }}>
              Course version
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className={`${programFieldClass} mt-1`}
                style={{ borderColor: P.border }}
              >
                <option value="">Select a published course…</option>
                {options
                  .filter((option) => !attached.has(option.id))
                  .map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </label>
            <label className="w-24 text-xs font-semibold" style={{ color: P.textMid }}>
              Phase
              <input
                type="number"
                min={1}
                value={phaseNumber}
                onChange={(e) => setPhaseNumber(Math.max(1, Number(e.target.value) || 1))}
                className={`${programFieldClass} mt-1`}
                style={{ borderColor: P.border }}
              />
            </label>
            <label
              className="flex items-center gap-2 px-2 py-2 text-xs font-semibold"
              style={{ color: P.textMid }}
            >
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                style={{ accentColor: P.olive }}
              />{" "}
              Required
            </label>
            <button
              type="button"
              onClick={() => void add()}
              disabled={!selectedId || saving}
              className={`${programButtonClass} text-white`}
              style={{ background: P.olive }}
            >
              <Plus size={13} /> Attach
            </button>
          </div>
        )}
        {items.length ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border p-3"
                style={{ borderColor: P.border }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{ background: P.lightSage, color: P.olive }}
                >
                  {item.displayOrder}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold" style={{ color: P.text }}>
                    {item.courseVersion.course.title}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                    {item.courseVersion.versionLabel ??
                      `v${item.courseVersion.majorVersion}.${item.courseVersion.minorVersion}`}{" "}
                    ·{" "}
                    {item.courseVersion.estimatedDurationMinutes
                      ? `${item.courseVersion.estimatedDurationMinutes} min`
                      : "Duration not set"}
                  </p>
                </div>
                <label
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: P.textMuted }}
                >
                  Phase
                  <input
                    type="number"
                    min={1}
                    value={item.phaseNumber}
                    disabled={!canWrite || saving}
                    onChange={(e) => void setCoursePhase(item, Number(e.target.value))}
                    className="w-14 rounded border px-1 py-0.5"
                    style={{ borderColor: P.border }}
                  />
                </label>
                <label
                  className="flex items-center gap-1 text-[10px]"
                  style={{ color: P.textMuted }}
                >
                  <input
                    type="checkbox"
                    checked={item.isRequired}
                    disabled={!canWrite || saving}
                    onChange={(e) => void setCourseRequired(item, e.target.checked)}
                    style={{ accentColor: P.olive }}
                  />{" "}
                  Required
                </label>
                {canWrite && (
                  <div className="flex">
                    <button
                      type="button"
                      disabled={saving || index === 0}
                      onClick={() => void reorder(index, -1)}
                      className="p-1.5 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={saving || index === items.length - 1}
                      onClick={() => void reorder(index, 1)}
                      className="p-1.5 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void remove(item)}
                      className="p-1.5"
                      title="Remove"
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
          <p
            className="rounded-xl border p-4 text-xs"
            style={{ borderColor: P.border, color: P.textMuted }}
          >
            No courses are attached. Approval readiness requires at least one required course or
            task.
          </p>
        )}
      </div>
    </HRProgramSectionShell>
  );
}
