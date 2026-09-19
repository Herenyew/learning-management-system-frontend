import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  Copy,
  LayoutTemplate,
  LoaderCircle,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { ApiClientError } from "../../API/httpClient";
import { programApi } from "../../API/program.api";
import { Permissions } from "../../constants/permission.constant";
import { usePermission } from "../../hooks/usePermission";
import type {
  Program,
  ProgramApprovalRequirements,
  ProgramCourse,
  ProgramTask,
} from "../../models/program.model";
import { P } from "./extended.shared";
import { HRProgramAudienceSection } from "./HRProgramAudienceSection";
import { HRProgramCohortsSection } from "./HRProgramCohortsSection";
import { HRProgramCoursesSection } from "./HRProgramCoursesSection";
import { HRProgramEnrollmentRulesSection } from "./HRProgramEnrollmentRulesSection";
import { HRProgramHistorySection } from "./HRProgramHistorySection";
import { HRProgramMetadataSection } from "./HRProgramMetadataSection";
import { HRProgramMilestonesSection } from "./HRProgramMilestonesSection";
import { HRProgramRewardsSection } from "./HRProgramRewardsSection";
import { programButtonClass } from "./HRProgramSectionShell";
import { HRProgramTasksSection } from "./HRProgramTasksSection";

const formatStatus = (value: string) => value.replace(/_/g, " ");
type ReadinessSnapshot = {
  targetAudienceCount: number;
  courses: ProgramCourse[];
  tasks: ProgramTask[];
};

const readinessIssues = (program: Program, snapshot: ReadinessSnapshot) => {
  const endDate = program.endDate ? new Date(program.endDate) : null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return [
    !program.startDate ? "Set a program start date." : null,
    !program.endDate ? "Set a program end date." : null,
    program.startDate && program.endDate && new Date(program.endDate) <= new Date(program.startDate)
      ? "End date must be after the start date."
      : null,
    endDate && endDate.getTime() < todayUtc ? "End date must be today or in the future." : null,
    snapshot.targetAudienceCount === 0 ? "Add at least one target audience." : null,
    (program._count?.cohorts ?? 0) === 0 ? "Add at least one cohort." : null,
    !snapshot.courses.some((course) => course.isRequired) &&
    !snapshot.tasks.some((task) => task.isRequired)
      ? "Add at least one required course or one required task."
      : null,
  ].filter((item): item is string => Boolean(item));
};

const apiIssues = (reason: unknown): string[] => {
  if (!(reason instanceof ApiClientError) || !reason.details || typeof reason.details !== "object")
    return [];
  const issues = (reason.details as { issues?: unknown }).issues;
  if (!Array.isArray(issues)) return [];
  return issues.flatMap((issue) =>
    issue &&
    typeof issue === "object" &&
    typeof (issue as { message?: unknown }).message === "string"
      ? [(issue as { message: string }).message]
      : [],
  );
};

export function HRProgramDetailScreen({
  navigate,
  programId,
}: {
  navigate: (screen: string, id?: string) => void;
  programId: string | null;
}) {
  const can = usePermission();
  const [program, setProgram] = useState<Program | null>(null);
  const [requirements, setRequirements] = useState<ProgramApprovalRequirements | null>(null);
  const [readiness, setReadiness] = useState<ReadinessSnapshot>({
    targetAudienceCount: 0,
    courses: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [readinessErrors, setReadinessErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState("");
  const [comment, setComment] = useState("");
  const [action, setAction] = useState<
    | "submit"
    | "approve"
    | "reject"
    | "changes"
    | "withdraw"
    | "archive"
    | "restore"
    | "duplicate"
    | "template"
    | null
  >(null);
  const [historyVersion, setHistoryVersion] = useState(0);

  const load = useCallback(
    async (signal?: AbortSignal, showLoading = true) => {
      if (!programId) {
        setLoading(false);
        setError("No program was selected.");
        return;
      }
      if (showLoading) setLoading(true);
      setError("");
      try {
        const [detail, approval, audiences, courses, tasks] = await Promise.all([
          programApi.getById(programId, signal),
          programApi.getApprovalRequirements(programId, signal),
          programApi.targetAudiences.list(programId, signal),
          programApi.courses.list(programId, signal),
          programApi.tasks.list(programId, signal),
        ]);
        if (!signal?.aborted) {
          setProgram(detail);
          setRequirements(approval);
          setReadiness({ targetAudienceCount: audiences.length, courses, tasks });
        }
      } catch (reason: unknown) {
        if (!signal?.aborted)
          setError(reason instanceof Error ? reason.message : "Unable to load program details.");
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

  const refresh = useCallback(async () => {
    await load(undefined, false);
    setHistoryVersion((value) => value + 1);
  }, [load]);
  const pending = requirements?.instance.status === "PENDING";
  const writable = Boolean(
    program?.status === "DRAFT" && !pending && can(Permissions.PROGRAM_UPDATE),
  );
  const canPublish = can(Permissions.PROGRAM_PUBLISH);
  const canReview = Boolean(can(Permissions.PROGRAM_REVIEW) && requirements?.canReview);
  const localReadiness = useMemo(
    () => (program ? readinessIssues(program, readiness) : []),
    [program, readiness],
  );

  const runApproval = async (
    nextAction: "submit" | "approve" | "reject" | "changes" | "withdraw",
  ) => {
    if (!programId || !requirements) return;
    const instanceId = requirements.instance.id;
    const trimmed = comment.trim();
    if ((nextAction === "reject" || nextAction === "changes") && !trimmed) {
      setActionError(
        nextAction === "reject"
          ? "A rejection reason is required."
          : "Describe the required changes.",
      );
      return;
    }
    if (nextAction !== "submit" && instanceId === null) {
      setActionError("No approval instance is available for this action.");
      return;
    }
    setAction(nextAction);
    setActionError("");
    setReadinessErrors([]);
    setSuccess("");
    try {
      const result =
        nextAction === "submit"
          ? await programApi.submitForReview(programId, trimmed || undefined)
          : nextAction === "approve"
            ? await programApi.approve(instanceId!, trimmed || undefined)
            : nextAction === "reject"
              ? await programApi.reject(instanceId!, trimmed)
              : nextAction === "changes"
                ? await programApi.requestChanges(instanceId!, trimmed)
                : await programApi.withdraw(instanceId!, trimmed || undefined);
      setComment("");
      setSuccess(result.message);
      await refresh();
    } catch (reason: unknown) {
      setActionError(
        reason instanceof Error ? reason.message : "Unable to update the approval request.",
      );
      setReadinessErrors(apiIssues(reason));
    } finally {
      setAction(null);
    }
  };

  const saveAsTemplate = async () => {
    if (!program) return;
    const value = window.prompt(
      "Name for the reusable program template:",
      `${program.name} Template`,
    );
    if (value === null) return;
    const name = value.trim();
    if (!name) {
      setActionError("Template name is required.");
      return;
    }

    setAction("template");
    setActionError("");
    setSuccess("");
    try {
      const template = await programApi.saveAsTemplate(program.id, {
        name,
        description: program.description ?? null,
      });
      setSuccess(`Saved “${template.name}” with this program's courses, tasks, and milestones.`);
      setHistoryVersion((current) => current + 1);
    } catch (reason: unknown) {
      setActionError(
        reason instanceof Error ? reason.message : "Unable to save this program as a template.",
      );
    } finally {
      setAction(null);
    }
  };

  const lifecycle = async (nextAction: "archive" | "restore" | "duplicate") => {
    if (!program) return;
    if (
      nextAction === "archive" &&
      !window.confirm(
        `Archive “${program.name}”? Programs with active enrollments cannot be archived.`,
      )
    )
      return;
    let duplicateName: string | undefined;
    if (nextAction === "duplicate") {
      const value = window.prompt(
        "Name for the duplicated program (leave unchanged to use the server-generated copy name):",
        "",
      );
      if (value === null) return;
      duplicateName = value.trim() || undefined;
    }
    setAction(nextAction);
    setActionError("");
    setSuccess("");
    try {
      if (nextAction === "duplicate") {
        const duplicate = await programApi.duplicate(
          program.id,
          duplicateName ? { name: duplicateName } : {},
        );
        navigate("program-detail", String(duplicate.id));
        return;
      }
      const updated =
        nextAction === "archive"
          ? await programApi.archive(program.id)
          : await programApi.restore(program.id);
      setProgram(updated);
      setSuccess(nextAction === "archive" ? "Program archived." : "Program restored as a draft.");
      await refresh();
    } catch (reason: unknown) {
      setActionError(reason instanceof Error ? reason.message : `Unable to ${nextAction} program.`);
    } finally {
      setAction(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center gap-2 p-6 text-sm" style={{ color: P.textMuted }}>
        <LoaderCircle className="animate-spin" size={17} /> Loading program setup…
      </div>
    );
  if (error || !program || !requirements)
    return (
      <div className="max-w-[1000px] space-y-4 p-6">
        <button
          onClick={() => navigate("hr-programs")}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: P.olive }}
        >
          <ChevronLeft size={16} /> Back to Programs
        </button>
        <div
          className="rounded-xl border bg-white p-5 text-sm"
          role="alert"
          style={{ borderColor: "#F2B8B5", color: "#9B2C2C" }}
        >
          {error || "Program not found."}
        </div>
      </div>
    );

  const workflowSteps = [...(requirements.workflow?.steps ?? [])].sort(
    (a, b) => a.approvalOrder - b.approvalOrder,
  );
  const decisions = requirements.instance.decisions;
  const resolvedStepIds = new Set(
    decisions
      .filter((decision) => decision.status === "APPROVED")
      .map((decision) => decision.workflowStepId),
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("hr-programs")}
          className="flex items-center gap-1.5 text-sm"
          style={{ color: P.textMuted }}
        >
          <ChevronLeft size={16} /> Back to Programs
        </button>
        <button
          type="button"
          onClick={() => void refresh()}
          className={programButtonClass}
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <header className="rounded-2xl border bg-white p-6" style={{ borderColor: P.border }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ background: P.lightSage, color: P.olive }}
              >
                {formatStatus(program.status)}
              </span>
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                style={{ background: P.goldLight, color: "#8A6A1A" }}
              >
                Approval: {formatStatus(requirements.instance.status)}
              </span>
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              {program.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6" style={{ color: P.textMuted }}>
              {program.description || "No description provided."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can(Permissions.PROGRAM_TEMPLATE_CREATE) && (
              <button
                type="button"
                disabled={action !== null}
                onClick={() => void saveAsTemplate()}
                className={programButtonClass}
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                <LayoutTemplate size={13} />{" "}
                {action === "template" ? "Saving template…" : "Save as template"}
              </button>
            )}
            {can(Permissions.PROGRAM_CREATE) && (
              <button
                type="button"
                disabled={action !== null}
                onClick={() => void lifecycle("duplicate")}
                className={programButtonClass}
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                <Copy size={13} /> {action === "duplicate" ? "Duplicating…" : "Duplicate"}
              </button>
            )}
            {program.status === "ARCHIVED"
              ? can(Permissions.PROGRAM_UPDATE) && (
                  <button
                    type="button"
                    disabled={action !== null}
                    onClick={() => void lifecycle("restore")}
                    className={`${programButtonClass} text-white`}
                    style={{ background: P.olive }}
                  >
                    <RotateCcw size={13} /> {action === "restore" ? "Restoring…" : "Restore"}
                  </button>
                )
              : can(Permissions.PROGRAM_DELETE) && (
                  <button
                    type="button"
                    disabled={action !== null || pending}
                    onClick={() => void lifecycle("archive")}
                    className={programButtonClass}
                    style={{ background: "#FEE2E2", color: "#B91C1C" }}
                  >
                    <Archive size={13} /> {action === "archive" ? "Archiving…" : "Archive"}
                  </button>
                )}
          </div>
        </div>
      </header>

      {success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800" role="status">
          {success}
        </div>
      )}
      {actionError && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          <p>{actionError}</p>
          {readinessErrors.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
              {readinessErrors.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <HRProgramMetadataSection
        program={program}
        canWrite={writable}
        onSaved={(saved) => {
          setProgram(saved);
          void refresh();
        }}
      />

      <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
        <div className="flex gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ background: P.paleGreen, color: P.olive }}
          >
            <ClipboardCheck size={17} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: P.text }}>
              Approval and publishing
            </h2>
            <p className="mt-0.5 text-[11px]" style={{ color: P.textMuted }}>
              {requirements.workflow
                ? `${requirements.workflow.name}${requirements.currentStep ? ` · current step ${requirements.currentStep}` : ""}`
                : "No default program workflow is configured."}
            </p>
          </div>
        </div>
        {workflowSteps.length > 0 && (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {workflowSteps.map((step) => {
              const approved = resolvedStepIds.has(step.id);
              const current = requirements.currentStep === step.approvalOrder && pending;
              return (
                <div
                  key={step.id}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: current ? P.olive : P.border,
                    background: current ? P.paleGreen : P.bg,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: approved ? "#5A7A2A" : current ? P.olive : P.sage }}
                    >
                      {approved ? "✓" : step.approvalOrder}
                    </span>
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {step.autoApprove
                        ? "Automatic approval"
                        : (step.approverEmployeeName ??
                          step.approverRoleName ??
                          "Unassigned reviewer")}
                    </p>
                  </div>
                  <p className="mt-2 text-[10px]" style={{ color: P.textMuted }}>
                    {step.isRequired ? "Required" : "Optional"}
                    {current ? " · Awaiting review" : approved ? " · Approved" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        )}
        {requirements.workflow && requirements.workflow.reviewers.length > 0 && (
          <p className="mt-3 text-[10px]" style={{ color: P.textMuted }}>
            Current-step reviewers:{" "}
            {requirements.workflow.reviewers.map((reviewer) => reviewer.name).join(", ")}
          </p>
        )}
        {requirements.instance.latestComment && (
          <div
            className="mt-3 flex gap-2 rounded-xl px-3 py-2 text-xs"
            style={{ background: P.goldLight, color: P.textMid }}
          >
            <MessageSquare size={13} className="mt-0.5 shrink-0" />{" "}
            {requirements.instance.latestComment}
          </div>
        )}
        {canPublish && requirements.canSubmit && localReadiness.length > 0 && (
          <div
            className="mt-4 rounded-xl border px-3 py-3"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <p className="flex items-center gap-2 text-xs font-semibold" style={{ color: P.text }}>
              <ShieldAlert size={14} /> Readiness checklist
            </p>
            <ul
              className="mt-2 list-disc space-y-1 pl-5 text-[11px]"
              style={{ color: P.textMuted }}
            >
              {localReadiness.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
            <p className="mt-2 text-[10px]" style={{ color: P.textMuted }}>
              The server performs the authoritative readiness check when submitted.
            </p>
          </div>
        )}
        {(canPublish && (requirements.canSubmit || pending)) || (canReview && pending) ? (
          <div className="mt-4 space-y-3 border-t pt-4" style={{ borderColor: P.border }}>
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={2}
              placeholder="Optional submission/review note; required for rejection or changes…"
              className="w-full resize-y rounded-xl border px-3 py-2 text-sm outline-none"
              style={{ borderColor: P.border, color: P.text }}
            />
            <div className="flex flex-wrap gap-2">
              {canPublish && requirements.canSubmit && (
                <button
                  type="button"
                  onClick={() => void runApproval("submit")}
                  disabled={action !== null}
                  className={`${programButtonClass} text-white`}
                  style={{ background: P.olive }}
                >
                  <Send size={13} /> {action === "submit" ? "Submitting…" : "Submit for approval"}
                </button>
              )}
              {canPublish && pending && requirements.instance.id !== null && (
                <button
                  type="button"
                  onClick={() => void runApproval("withdraw")}
                  disabled={action !== null}
                  className={programButtonClass}
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                >
                  <RotateCcw size={13} /> {action === "withdraw" ? "Withdrawing…" : "Withdraw"}
                </button>
              )}
              {canReview && pending && (
                <>
                  <button
                    type="button"
                    onClick={() => void runApproval("approve")}
                    disabled={action !== null}
                    className={`${programButtonClass} text-white`}
                    style={{ background: "#5A7A2A" }}
                  >
                    <CheckCircle2 size={13} />{" "}
                    {action === "approve"
                      ? "Approving…"
                      : `Approve step ${requirements.currentStep ?? ""}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => void runApproval("changes")}
                    disabled={action !== null || !comment.trim()}
                    className={programButtonClass}
                    style={{ background: P.goldLight, color: "#8A6A1A" }}
                  >
                    <MessageSquare size={13} /> Request changes
                  </button>
                  <button
                    type="button"
                    onClick={() => void runApproval("reject")}
                    disabled={action !== null || !comment.trim()}
                    className={programButtonClass}
                    style={{ background: "#FEE2E2", color: "#B91C1C" }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <HRProgramAudienceSection
          programId={program.id}
          canWrite={writable}
          onChanged={() => void refresh()}
        />
        <HRProgramCohortsSection
          programId={program.id}
          canWrite={writable}
          onChanged={() => void refresh()}
        />
      </div>
      <HRProgramCoursesSection
        programId={program.id}
        canWrite={writable}
        onChanged={() => void refresh()}
      />
      <HRProgramTasksSection
        programId={program.id}
        canWrite={writable}
        onChanged={() => void refresh()}
      />
      <HRProgramMilestonesSection
        programId={program.id}
        canWrite={writable}
        onChanged={() => void refresh()}
      />
      <HRProgramEnrollmentRulesSection
        programId={program.id}
        canWrite={writable}
        onChanged={() => void refresh()}
      />
      <HRProgramRewardsSection
        programId={program.id}
        canWrite={writable}
        onChanged={() => void refresh()}
      />

      <div
        className="rounded-xl border px-4 py-3 text-xs"
        style={{ borderColor: P.border, background: P.bg, color: P.textMuted }}
      >
        <strong style={{ color: P.textMid }}>Runtime operations remain separate:</strong> cohort
        roster enrollment, waitlist execution, automated progress/completion, certificate issuance,
        XP awards, delivery infrastructure, and analytics are handled by their operational services.
      </div>
      <HRProgramHistorySection programId={program.id} refreshToken={historyVersion} />
    </div>
  );
}
