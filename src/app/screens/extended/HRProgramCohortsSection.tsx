import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit3,
  History,
  Layers,
  ListPlus,
  LoaderCircle,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { programApi } from "../../API/program.api";
import type {
  ProgramCohort,
  ProgramCohortBulkEnrollmentOutcome,
  ProgramCohortRoster,
  ProgramCohortRosterEnrollment,
  ProgramCohortWaitlist,
  ProgramCohortWaitlistEntry,
} from "../../models/program.model";
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

type Draft = { name: string; capacity: string; startDate: string; endDate: string };

const emptyDraft = (): Draft => ({ name: "", capacity: "", startDate: "", endDate: "" });
const fromCohort = (cohort: ProgramCohort): Draft => ({
  name: cohort.name,
  capacity: cohort.capacity ? String(cohort.capacity) : "",
  startDate: toDateInput(cohort.startDate),
  endDate: toDateInput(cohort.endDate),
});

const parseEmployeeIds = (value: string): string[] =>
  Array.from(
    new Set(
      value
        .split(/[\n,]/)
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

const humanize = (value: string): string =>
  value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

const formatDateTime = (value: string | null): string =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";

const statusStyle = (status: string) => {
  const normalized = status.toUpperCase();
  if (
    normalized === "COMPLETED" ||
    normalized === "ACTIVE" ||
    normalized === "ENROLLED" ||
    normalized === "ACCEPTED"
  ) {
    return { background: "#D8EDCC", color: "#3A6420" };
  }
  if (normalized === "IN_PROGRESS" || normalized === "OFFERED") {
    return { background: P.lightSage, color: P.olive };
  }
  if (normalized === "WAITLISTED" || normalized === "WAITING" || normalized === "PENDING") {
    return { background: P.goldLight, color: "#7A5A10" };
  }
  if (
    normalized === "FAILED" ||
    normalized === "CANCELLED" ||
    normalized === "WITHDRAWN" ||
    normalized === "EXPIRED"
  ) {
    return { background: "#FEE2E2", color: "#B91C1C" };
  }
  return { background: P.bg, color: P.textMuted };
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={statusStyle(status)}
    >
      {humanize(status)}
    </span>
  );
}

function BulkOutcomes({ outcomes }: { outcomes: ProgramCohortBulkEnrollmentOutcome[] }) {
  if (!outcomes.length) return null;

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: P.border, background: P.bg }}>
      <p className="mb-2 text-[11px] font-semibold" style={{ color: P.textMid }}>
        Bulk enrollment outcomes
      </p>
      <div className="max-h-36 space-y-1.5 overflow-y-auto">
        {outcomes.map((outcome, index) => {
          const successful = outcome.success ?? !outcome.error;
          const detail = outcome.error || outcome.message || outcome.status;
          return (
            <div
              key={`${outcome.employeeId}-${index}`}
              className="flex items-start justify-between gap-3 rounded-lg bg-white px-3 py-2 text-[11px]"
            >
              <span className="font-mono" style={{ color: P.text }}>
                {outcome.employeeId}
              </span>
              <span className="text-right" style={{ color: successful ? "#3A6420" : "#B91C1C" }}>
                {detail || (successful ? "Enrolled" : "Not enrolled")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RosterRow({
  enrollment,
  canWrite,
  removing,
  onRemove,
}: {
  enrollment: ProgramCohortRosterEnrollment;
  canWrite: boolean;
  removing: boolean;
  onRemove: () => void;
}) {
  const progress = Math.max(0, Math.min(100, Number(enrollment.progressPercentage) || 0));

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: P.border }}>
      <div className="flex flex-wrap items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: P.paleGreen, color: P.olive }}
        >
          {enrollment.employee.fullName
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join("")
            .toUpperCase() || "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {enrollment.employee.fullName}
            </p>
            <StatusBadge status={enrollment.enrollmentStatus} />
            {!enrollment.employee.isActive && <StatusBadge status="INACTIVE" />}
          </div>
          <p className="mt-0.5 text-[10px] font-mono" style={{ color: P.textMuted }}>
            {enrollment.employeeId}
          </p>
        </div>
        {canWrite && (
          <button
            type="button"
            onClick={onRemove}
            disabled={removing}
            className={`${programButtonClass} border`}
            style={{ borderColor: "#FECACA", color: "#B91C1C" }}
          >
            {removing ? <LoaderCircle className="animate-spin" size={13} /> : <Trash2 size={13} />}
            Remove
          </button>
        )}
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[10px]" style={{ color: P.textMuted }}>
          <span>Program progress</span>
          <span className="font-semibold" style={{ color: P.textMid }}>
            {progress}%
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full" style={{ background: P.lightSage }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, background: P.olive }}
          />
        </div>
      </div>

      <div className="mt-3">
        <p
          className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: P.textMuted }}
        >
          Linked course enrollments ({enrollment.enrollments.length})
        </p>
        {enrollment.enrollments.length ? (
          <div className="grid gap-1.5 md:grid-cols-2">
            {enrollment.enrollments.map((courseEnrollment) => (
              <div
                key={courseEnrollment.id}
                className="flex min-w-0 items-center justify-between gap-2 rounded-lg px-2.5 py-2"
                style={{ background: P.bg }}
              >
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-medium" style={{ color: P.textMid }}>
                    {courseEnrollment.courseVersion.course.title}
                  </p>
                  <p className="truncate text-[9px] font-mono" style={{ color: P.textMuted }}>
                    {courseEnrollment.courseVersion.course.code ||
                      `Course #${courseEnrollment.courseVersion.course.id}`}
                  </p>
                </div>
                <StatusBadge status={courseEnrollment.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[10px]" style={{ color: P.textMuted }}>
            No linked course enrollments were returned.
          </p>
        )}
      </div>
    </div>
  );
}

function WaitlistEntryRow({
  entry,
  canWrite,
  disabled,
  action,
  onCancel,
  onAccept,
}: {
  entry: ProgramCohortWaitlistEntry;
  canWrite: boolean;
  disabled: boolean;
  action: "cancel" | "accept" | null;
  onCancel: () => void;
  onAccept: () => void;
}) {
  const active = entry.status === "WAITING" || entry.status === "OFFERED";
  const eventLabel =
    entry.status === "OFFERED"
      ? `Offer expires ${formatDateTime(entry.offerExpiresAt)}`
      : entry.status === "ACCEPTED"
        ? `Accepted ${formatDateTime(entry.acceptedAt)}`
        : entry.status === "EXPIRED"
          ? `Expired ${formatDateTime(entry.expiredAt)}`
          : entry.status === "CANCELLED"
            ? `Cancelled ${formatDateTime(entry.cancelledAt)}`
            : `Joined ${formatDateTime(entry.createdAt)}`;

  return (
    <div className="rounded-xl border p-4" style={{ borderColor: P.border }}>
      <div className="flex flex-wrap items-start gap-3">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold"
          style={{ background: P.paleGreen, color: P.olive }}
          aria-label={`Waitlist position ${entry.position}`}
        >
          {entry.position}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {entry.employee.fullName}
            </p>
            <StatusBadge status={entry.status} />
            {!entry.employee.isActive && <StatusBadge status="INACTIVE" />}
          </div>
          <p className="mt-0.5 text-[10px] font-mono" style={{ color: P.textMuted }}>
            {entry.employeeId}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[10px]" style={{ color: P.textMuted }}>
            <Clock size={10} aria-hidden="true" /> {eventLabel}
          </p>
        </div>
        {canWrite && active && (
          <div className="flex flex-wrap gap-2">
            {entry.status === "OFFERED" && (
              <button
                type="button"
                onClick={onAccept}
                disabled={disabled || action != null}
                className={`${programButtonClass} text-white`}
                style={{ background: P.olive }}
              >
                {action === "accept" ? (
                  <LoaderCircle className="animate-spin" size={13} />
                ) : (
                  <Check size={13} />
                )}
                Accept offer
              </button>
            )}
            <button
              type="button"
              onClick={onCancel}
              disabled={disabled || action != null}
              className={`${programButtonClass} border`}
              style={{ borderColor: "#FECACA", color: "#B91C1C" }}
            >
              {action === "cancel" ? (
                <LoaderCircle className="animate-spin" size={13} />
              ) : (
                <X size={13} />
              )}
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CohortRosterPanel({
  programId,
  cohort,
  canWrite,
  onClose,
  onRosterChanged,
}: {
  programId: number;
  cohort: ProgramCohort;
  canWrite: boolean;
  onClose: () => void;
  onRosterChanged: () => Promise<void>;
}) {
  const [view, setView] = useState<"roster" | "waitlist">("roster");
  const [roster, setRoster] = useState<ProgramCohortRoster | null>(null);
  const [waitlist, setWaitlist] = useState<ProgramCohortWaitlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitlistLoading, setWaitlistLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [waitlistAction, setWaitlistAction] = useState<{
    entryId: number | null;
    type: "join" | "cancel" | "process" | "accept";
  } | null>(null);
  const [error, setError] = useState("");
  const [waitlistError, setWaitlistError] = useState("");
  const [success, setSuccess] = useState("");
  const [singleEmployeeId, setSingleEmployeeId] = useState("");
  const [bulkEmployeeIds, setBulkEmployeeIds] = useState("");
  const [waitlistEmployeeId, setWaitlistEmployeeId] = useState("");
  const [bulkOutcomes, setBulkOutcomes] = useState<ProgramCohortBulkEnrollmentOutcome[]>([]);

  const loadRoster = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");
      try {
        const data = await programApi.cohorts.getRoster(programId, cohort.id, signal);
        if (!signal?.aborted) setRoster(data);
      } catch (reason: unknown) {
        if (!signal?.aborted)
          setError(mutationMessage(reason, "Unable to load the cohort roster."));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [cohort.id, programId],
  );

  const loadWaitlist = useCallback(
    async (signal?: AbortSignal) => {
      setWaitlistLoading(true);
      setWaitlistError("");
      try {
        const data = await programApi.cohorts.getWaitlist(programId, cohort.id, signal);
        if (!signal?.aborted) setWaitlist(data);
      } catch (reason: unknown) {
        if (!signal?.aborted) {
          setWaitlistError(mutationMessage(reason, "Unable to load the cohort waitlist."));
        }
      } finally {
        if (!signal?.aborted) setWaitlistLoading(false);
      }
    },
    [cohort.id, programId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void Promise.all([loadRoster(controller.signal), loadWaitlist(controller.signal)]);
    return () => controller.abort();
  }, [loadRoster, loadWaitlist]);

  const capacity = roster?.cohort.capacity ?? cohort.capacity;
  const enrollmentCount = roster?.enrollmentCount ?? cohort._count.enrollments;
  const availableSeats = capacity == null ? null : Math.max(0, capacity - enrollmentCount);
  const parsedBulkEmployeeIds = useMemo(() => parseEmployeeIds(bulkEmployeeIds), [bulkEmployeeIds]);

  const refreshAfterMutation = async () => {
    await Promise.all([loadRoster(), loadWaitlist(), onRosterChanged()]);
  };

  const enrollOne = async () => {
    const employeeId = singleEmployeeId.trim();
    if (!employeeId) {
      setError("Enter an employee ID to enroll.");
      return;
    }

    setMutating(true);
    setError("");
    setSuccess("");
    setBulkOutcomes([]);
    try {
      const result = await programApi.cohorts.enroll(programId, cohort.id, { employeeId });
      setSingleEmployeeId("");
      setSuccess(
        `${employeeId} enrolled successfully. ${result.linkedCourseEnrollmentIds.length} linked course enrollment${result.linkedCourseEnrollmentIds.length === 1 ? "" : "s"} created.`,
      );
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setError(mutationMessage(reason, "Unable to enroll the employee."));
    } finally {
      setMutating(false);
    }
  };

  const enrollBulk = async () => {
    if (!parsedBulkEmployeeIds.length) {
      setError("Enter at least one employee ID. Separate IDs with commas or new lines.");
      return;
    }

    setMutating(true);
    setError("");
    setSuccess("");
    setBulkOutcomes([]);
    try {
      const result = await programApi.cohorts.bulkEnroll(programId, cohort.id, {
        employeeIds: parsedBulkEmployeeIds,
      });
      const summary = Object.entries(result.summary)
        .filter(([, value]) => typeof value === "number")
        .map(([key, value]) => `${humanize(key)}: ${value}`)
        .join(" · ");
      setBulkEmployeeIds("");
      setBulkOutcomes(result.outcomes);
      setSuccess(
        `Bulk enrollment processed for ${parsedBulkEmployeeIds.length} employee${parsedBulkEmployeeIds.length === 1 ? "" : "s"}.${summary ? ` ${summary}.` : ""}`,
      );
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setError(mutationMessage(reason, "Unable to process bulk enrollment."));
    } finally {
      setMutating(false);
    }
  };

  const activeWaitlistEntries = useMemo(
    () =>
      waitlist?.entries.filter(
        (entry) => entry.status === "WAITING" || entry.status === "OFFERED",
      ) ?? [],
    [waitlist],
  );
  const historicalWaitlistEntries = useMemo(
    () =>
      waitlist?.entries.filter(
        (entry) => entry.status !== "WAITING" && entry.status !== "OFFERED",
      ) ?? [],
    [waitlist],
  );

  const removeEnrollment = async (enrollment: ProgramCohortRosterEnrollment) => {
    if (
      !window.confirm(
        `Remove ${enrollment.employee.fullName} (${enrollment.employeeId}) from “${cohort.name}”? Linked course enrollments may also be removed.`,
      )
    ) {
      return;
    }

    setRemovingId(enrollment.id);
    setError("");
    setSuccess("");
    setBulkOutcomes([]);
    try {
      await programApi.cohorts.removeEnrollment(programId, cohort.id, enrollment.id);
      setSuccess(`${enrollment.employee.fullName} was removed from the cohort.`);
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setError(mutationMessage(reason, "Unable to remove the enrollment."));
    } finally {
      setRemovingId(null);
    }
  };

  const joinWaitlist = async () => {
    const employeeId = waitlistEmployeeId.trim();
    if (!employeeId) {
      setWaitlistError("Enter an employee ID to add to the waitlist.");
      return;
    }
    if (employeeId.length > 20) {
      setWaitlistError("Employee IDs cannot exceed 20 characters.");
      return;
    }

    setWaitlistAction({ entryId: null, type: "join" });
    setWaitlistError("");
    setSuccess("");
    try {
      const result = await programApi.cohorts.joinWaitlist(programId, cohort.id, {
        employeeId,
      });
      setWaitlistEmployeeId("");
      setSuccess(
        `${result.entry.employee.fullName} joined the waitlist at position ${result.entry.position}. Maximum active entries: ${result.settings.waitlistSize}; offers expire after ${result.settings.responseHours} hours.`,
      );
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setWaitlistError(mutationMessage(reason, "Unable to add the employee to the waitlist."));
    } finally {
      setWaitlistAction(null);
    }
  };

  const cancelWaitlistEntry = async (entry: ProgramCohortWaitlistEntry) => {
    if (
      !window.confirm(
        `Cancel waitlist entry #${entry.position} for ${entry.employee.fullName} (${entry.employeeId})?`,
      )
    ) {
      return;
    }

    setWaitlistAction({ entryId: entry.id, type: "cancel" });
    setWaitlistError("");
    setSuccess("");
    try {
      await programApi.cohorts.cancelWaitlistEntry(programId, cohort.id, entry.id);
      setSuccess(`${entry.employee.fullName}'s waitlist entry was cancelled.`);
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setWaitlistError(mutationMessage(reason, "Unable to cancel the waitlist entry."));
    } finally {
      setWaitlistAction(null);
    }
  };

  const processWaitlist = async () => {
    if (
      !window.confirm(
        "Process expired offers and offer the next available seat to the earliest waiting learner?",
      )
    ) {
      return;
    }

    setWaitlistAction({ entryId: null, type: "process" });
    setWaitlistError("");
    setSuccess("");
    try {
      const result = await programApi.cohorts.processWaitlist(programId, cohort.id);
      const offered = result.offered
        ? ` Offer sent to ${result.offered.employee.fullName} at position ${result.offered.position}.`
        : " No learner was offered a seat.";
      setSuccess(
        `Waitlist processed. ${result.expired} expired offer${result.expired === 1 ? "" : "s"}.${offered}`,
      );
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setWaitlistError(mutationMessage(reason, "Unable to process the waitlist."));
    } finally {
      setWaitlistAction(null);
    }
  };

  const acceptWaitlistEntry = async (entry: ProgramCohortWaitlistEntry) => {
    if (
      !window.confirm(
        `Accept the offered seat for ${entry.employee.fullName} (${entry.employeeId}) and create their program enrollment?`,
      )
    ) {
      return;
    }

    setWaitlistAction({ entryId: entry.id, type: "accept" });
    setWaitlistError("");
    setSuccess("");
    try {
      const result = await programApi.cohorts.acceptWaitlistEntry(programId, cohort.id, entry.id);
      setSuccess(
        `${entry.employee.fullName}'s offer was ${result.idempotent ? "already accepted" : "accepted"}. ${result.linkedCourseEnrollmentIds.length} linked course enrollment${result.linkedCourseEnrollmentIds.length === 1 ? "" : "s"} available.`,
      );
      await refreshAfterMutation();
    } catch (reason: unknown) {
      setWaitlistError(mutationMessage(reason, "Unable to accept the waitlist offer."));
    } finally {
      setWaitlistAction(null);
    }
  };

  return (
    <div className="rounded-2xl border p-4" style={{ borderColor: P.sage, background: "white" }}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Users size={16} style={{ color: P.olive }} />
            <h3 className="text-sm font-bold" style={{ color: P.text }}>
              {cohort.name} cohort operations
            </h3>
          </div>
          <p className="mt-1 text-[11px]" style={{ color: P.textMuted }}>
            {enrollmentCount} enrolled ·{" "}
            {capacity == null
              ? "No capacity limit"
              : `${availableSeats} of ${capacity} seats available`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void refreshAfterMutation()}
            disabled={
              loading || waitlistLoading || mutating || removingId != null || waitlistAction != null
            }
            className={programButtonClass}
            style={{ color: P.olive }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            type="button"
            onClick={onClose}
            className={programButtonClass}
            style={{ color: P.textMid }}
          >
            <X size={13} /> Close
          </button>
        </div>
      </div>

      <div
        className="mt-4 flex gap-1 rounded-xl p-1"
        style={{ background: P.bg }}
        role="tablist"
        aria-label="Cohort operations"
      >
        {(
          [
            { id: "roster", label: `Roster (${enrollmentCount})`, icon: Users },
            {
              id: "waitlist",
              label: `Waitlist (${waitlist?.activeCount ?? 0})`,
              icon: History,
            },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => {
              setView(id);
              setError("");
              setWaitlistError("");
              setSuccess("");
            }}
            className={`${programButtonClass} flex-1`}
            style={{
              background: view === id ? "white" : "transparent",
              color: view === id ? P.olive : P.textMuted,
              boxShadow: view === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {view === "roster" && canWrite && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <div
            className="rounded-xl border p-3"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>
              Enroll one employee by ID
              <div className="mt-2 flex gap-2">
                <input
                  value={singleEmployeeId}
                  onChange={(event) => setSingleEmployeeId(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void enrollOne();
                  }}
                  disabled={mutating || removingId != null}
                  className={programFieldClass}
                  style={{ borderColor: P.border }}
                  placeholder="Employee ID"
                />
                <button
                  type="button"
                  onClick={() => void enrollOne()}
                  disabled={mutating || removingId != null}
                  className={`${programButtonClass} shrink-0 text-white`}
                  style={{ background: P.olive }}
                >
                  {mutating ? (
                    <LoaderCircle className="animate-spin" size={13} />
                  ) : (
                    <UserPlus size={13} />
                  )}
                  Enroll
                </button>
              </div>
            </label>
          </div>

          <div
            className="rounded-xl border p-3"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <label className="text-xs font-semibold" style={{ color: P.textMid }}>
              Bulk enroll by employee ID
              <textarea
                value={bulkEmployeeIds}
                onChange={(event) => setBulkEmployeeIds(event.target.value)}
                disabled={mutating || removingId != null}
                rows={3}
                className={`${programFieldClass} mt-2 resize-y`}
                style={{ borderColor: P.border }}
                placeholder={"EMP-001, EMP-002\nEMP-003"}
              />
            </label>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                Comma or new-line separated · {parsedBulkEmployeeIds.length} unique ID
                {parsedBulkEmployeeIds.length === 1 ? "" : "s"}
              </p>
              <button
                type="button"
                onClick={() => void enrollBulk()}
                disabled={mutating || removingId != null || !parsedBulkEmployeeIds.length}
                className={`${programButtonClass} shrink-0 text-white`}
                style={{ background: P.olive }}
              >
                {mutating ? (
                  <LoaderCircle className="animate-spin" size={13} />
                ) : (
                  <ListPlus size={13} />
                )}
                Enroll IDs
              </button>
            </div>
          </div>
        </div>
      )}

      {!canWrite && (
        <p
          className="mt-4 rounded-xl px-3 py-2 text-[11px]"
          style={{ background: P.bg, color: P.textMuted }}
        >
          Cohort operations are read-only. Program write permission is required to enroll, remove,
          or manage waitlisted learners.
        </p>
      )}

      {(view === "roster" ? error : waitlistError) && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {view === "roster" ? error : waitlistError}
        </div>
      )}
      {success && (
        <div
          className="mt-3 rounded-lg px-3 py-2 text-xs"
          style={{ background: "#D8EDCC", color: "#3A6420" }}
          role="status"
        >
          {success}
        </div>
      )}
      {view === "roster" && (
        <div className="mt-3">
          <BulkOutcomes outcomes={bulkOutcomes} />
        </div>
      )}

      {view === "roster" && (
        <div className="mt-4">
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-xs" style={{ color: P.textMuted }}>
              <LoaderCircle className="animate-spin" size={15} /> Loading roster…
            </div>
          ) : !roster ? (
            <p
              className="rounded-xl border p-4 text-xs"
              style={{ borderColor: P.border, color: P.textMuted }}
            >
              Roster data is unavailable.
            </p>
          ) : roster.enrollments.length ? (
            <div className="space-y-2">
              {roster.enrollments.map((enrollment) => (
                <RosterRow
                  key={enrollment.id}
                  enrollment={enrollment}
                  canWrite={canWrite}
                  removing={removingId === enrollment.id}
                  onRemove={() => void removeEnrollment(enrollment)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border p-6 text-center" style={{ borderColor: P.border }}>
              <Users className="mx-auto mb-2" size={22} style={{ color: P.sage }} />
              <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                No learners are enrolled in this cohort.
              </p>
              <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
                {canWrite
                  ? "Use an employee ID above to create the first enrollment."
                  : "The roster will appear here when learners are enrolled."}
              </p>
            </div>
          )}
        </div>
      )}

      {view === "waitlist" && (
        <div className="mt-4 space-y-4" role="tabpanel" aria-label="Cohort waitlist">
          {canWrite && (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div
                className="rounded-xl border p-3"
                style={{ borderColor: P.border, background: P.bg }}
              >
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Add employee to waitlist by ID
                  <div className="mt-2 flex gap-2">
                    <input
                      value={waitlistEmployeeId}
                      onChange={(event) => setWaitlistEmployeeId(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void joinWaitlist();
                      }}
                      maxLength={20}
                      disabled={waitlistAction != null || mutating || removingId != null}
                      className={programFieldClass}
                      style={{ borderColor: P.border }}
                      placeholder="Employee ID"
                    />
                    <button
                      type="button"
                      onClick={() => void joinWaitlist()}
                      disabled={waitlistAction != null || mutating || removingId != null}
                      className={`${programButtonClass} shrink-0 text-white`}
                      style={{ background: P.olive }}
                    >
                      {waitlistAction?.type === "join" ? (
                        <LoaderCircle className="animate-spin" size={13} />
                      ) : (
                        <UserPlus size={13} />
                      )}
                      Join waitlist
                    </button>
                  </div>
                </label>
                <p className="mt-2 text-[10px]" style={{ color: P.textMuted }}>
                  The backend accepts active company employees only and requires enrollment capacity
                  to be full.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void processWaitlist()}
                disabled={waitlistAction != null || mutating || removingId != null}
                className={`${programButtonClass} self-stretch border px-4`}
                style={{ borderColor: P.sage, background: P.lightSage, color: P.olive }}
              >
                {waitlistAction?.type === "process" ? (
                  <LoaderCircle className="animate-spin" size={14} />
                ) : (
                  <Play size={14} />
                )}
                Process / promote
              </button>
            </div>
          )}

          {waitlistLoading ? (
            <div className="flex items-center gap-2 py-6 text-xs" style={{ color: P.textMuted }}>
              <LoaderCircle className="animate-spin" size={15} /> Loading waitlist…
            </div>
          ) : !waitlist ? (
            <p
              className="rounded-xl border p-4 text-xs"
              style={{ borderColor: P.border, color: P.textMuted }}
            >
              Waitlist data is unavailable.
            </p>
          ) : (
            <>
              <section aria-labelledby={`cohort-${cohort.id}-active-waitlist`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h4
                      id={`cohort-${cohort.id}-active-waitlist`}
                      className="text-xs font-bold"
                      style={{ color: P.text }}
                    >
                      Active waitlist
                    </h4>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Waiting and offered entries, ordered by stable position.
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
                    style={{ background: P.goldLight, color: "#7A5A10" }}
                  >
                    {waitlist.activeCount} active
                  </span>
                </div>
                {activeWaitlistEntries.length ? (
                  <div className="space-y-2">
                    {activeWaitlistEntries.map((entry) => {
                      const entryAction =
                        waitlistAction?.entryId === entry.id &&
                        (waitlistAction.type === "cancel" || waitlistAction.type === "accept")
                          ? waitlistAction.type
                          : null;
                      return (
                        <WaitlistEntryRow
                          key={entry.id}
                          entry={entry}
                          canWrite={canWrite}
                          disabled={waitlistAction != null || mutating || removingId != null}
                          action={entryAction}
                          onCancel={() => void cancelWaitlistEntry(entry)}
                          onAccept={() => void acceptWaitlistEntry(entry)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div
                    className="rounded-xl border p-5 text-center"
                    style={{ borderColor: P.border }}
                  >
                    <History className="mx-auto mb-2" size={20} style={{ color: P.sage }} />
                    <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                      No active waitlist entries.
                    </p>
                  </div>
                )}
              </section>

              <section aria-labelledby={`cohort-${cohort.id}-waitlist-history`}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div>
                    <h4
                      id={`cohort-${cohort.id}-waitlist-history`}
                      className="text-xs font-bold"
                      style={{ color: P.text }}
                    >
                      History
                    </h4>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Accepted, expired, and cancelled entries retain their original positions.
                    </p>
                  </div>
                  <span className="text-[10px]" style={{ color: P.textMuted }}>
                    {historicalWaitlistEntries.length} historical
                  </span>
                </div>
                {historicalWaitlistEntries.length ? (
                  <div className="space-y-2">
                    {historicalWaitlistEntries.map((entry) => (
                      <WaitlistEntryRow
                        key={entry.id}
                        entry={entry}
                        canWrite={false}
                        disabled
                        action={null}
                        onCancel={() => undefined}
                        onAccept={() => undefined}
                      />
                    ))}
                  </div>
                ) : (
                  <p
                    className="rounded-xl border p-4 text-center text-xs"
                    style={{ borderColor: P.border, color: P.textMuted }}
                  >
                    No historical waitlist entries.
                  </p>
                )}
              </section>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function HRProgramCohortsSection({
  programId,
  canWrite,
  onChanged,
}: {
  programId: number;
  canWrite: boolean;
  onChanged: () => void;
}) {
  const [items, setItems] = useState<ProgramCohort[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedRosterId, setSelectedRosterId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal, showLoading = true) => {
      if (showLoading) setLoading(true);
      setError("");
      try {
        const data = await programApi.cohorts.list(programId, signal);
        if (!signal?.aborted) setItems(data);
      } catch (reason: unknown) {
        if (!signal?.aborted) setError(mutationMessage(reason, "Unable to load cohorts."));
      } finally {
        if (!signal?.aborted && showLoading) setLoading(false);
      }
    },
    [programId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const selectedCohort = items.find((item) => item.id === selectedRosterId) ?? null;

  const closeForm = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(false);
    setMutationError("");
  };

  const save = async () => {
    if (!draft.name.trim()) return setMutationError("Cohort name is required.");
    if (draft.startDate && draft.endDate && draft.endDate <= draft.startDate) {
      return setMutationError("End date must be after start date.");
    }
    const input = {
      name: draft.name.trim(),
      capacity: nullableNumber(draft.capacity),
      startDate: draft.startDate || null,
      endDate: draft.endDate || null,
    };
    setSaving(true);
    setMutationError("");
    try {
      if (editingId) await programApi.cohorts.update(programId, editingId, input);
      else await programApi.cohorts.create(programId, input);
      closeForm();
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to save cohort."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: ProgramCohort) => {
    if (!window.confirm(`Delete cohort “${item.name}”?`)) return;
    setSaving(true);
    setMutationError("");
    try {
      await programApi.cohorts.delete(programId, item.id);
      if (selectedRosterId === item.id) setSelectedRosterId(null);
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to delete cohort."));
    } finally {
      setSaving(false);
    }
  };

  const rosterChanged = async () => {
    await load(undefined, false);
    onChanged();
  };

  return (
    <HRProgramSectionShell
      title="Cohorts"
      description="Schedule learner groups within the program dates. At least one cohort is required for approval readiness."
      icon={Layers}
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
            <Plus size={13} /> Add cohort
          </button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        <SectionMutationError message={mutationError} />

        {showForm && (
          <div
            className="rounded-xl border p-4"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="sm:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>
                Name
                <input
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </label>
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Capacity
                <input
                  type="number"
                  min={1}
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                  value={draft.capacity}
                  onChange={(event) => setDraft({ ...draft, capacity: event.target.value })}
                />
              </label>
              <span />
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                Start date
                <input
                  type="date"
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                  value={draft.startDate}
                  onChange={(event) => setDraft({ ...draft, startDate: event.target.value })}
                />
              </label>
              <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                End date
                <input
                  type="date"
                  className={`${programFieldClass} mt-1`}
                  style={{ borderColor: P.border }}
                  value={draft.endDate}
                  onChange={(event) => setDraft({ ...draft, endDate: event.target.value })}
                />
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
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
                onClick={() => void save()}
                disabled={saving}
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
            {items.map((item) => {
              const rosterOpen = selectedRosterId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl border"
                  style={{ borderColor: rosterOpen ? P.sage : P.border }}
                >
                  <div className="flex flex-wrap items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {item.name}
                      </p>
                      <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
                        {item.startDate ? toDateInput(item.startDate) : "Open start"} →{" "}
                        {item.endDate ? toDateInput(item.endDate) : "Open end"} ·{" "}
                        {item._count.enrollments} enrolled ·{" "}
                        {item.capacity ? `${item.capacity} capacity` : "No capacity limit"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedRosterId(rosterOpen ? null : item.id)}
                      className={programButtonClass}
                      style={{
                        background: rosterOpen ? P.olive : P.lightSage,
                        color: rosterOpen ? "white" : P.olive,
                      }}
                      aria-expanded={rosterOpen}
                    >
                      <Users size={13} /> Manage roster{" "}
                      {rosterOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {canWrite && (
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(item.id);
                            setDraft(fromCohort(item));
                            setShowForm(true);
                            setMutationError("");
                          }}
                          className="rounded-lg p-2"
                          title="Edit cohort"
                          style={{ color: P.olive }}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void remove(item)}
                          disabled={saving}
                          className="rounded-lg p-2"
                          title="Delete cohort"
                          style={{ color: "#C0392B" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          !showForm && (
            <p
              className="rounded-xl border p-4 text-xs"
              style={{ borderColor: P.border, color: P.textMuted }}
            >
              No cohorts have been configured.
            </p>
          )
        )}

        {selectedCohort && (
          <CohortRosterPanel
            key={selectedCohort.id}
            programId={programId}
            cohort={selectedCohort}
            canWrite={canWrite}
            onClose={() => setSelectedRosterId(null)}
            onRosterChanged={rosterChanged}
          />
        )}
      </div>
    </HRProgramSectionShell>
  );
}
