import {
  CheckCircle,
  ChevronLeft,
  Clock,
  ExternalLink,
  FileText,
  Send,
  Target,
} from "lucide-react";
import { useEffect, useState } from "react";
import { programTaskSubmissionApi } from "../../API/programTaskSubmission.api";
import { programSurveyApi, type ProgramSurvey } from "../../API/programSurvey.api";
import { Chip, PBar } from "../../components/common";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
import type { LearnerProgramEnrollment } from "../../models/enrollment.model";
import type { LearnerProgramTask, PeerReviewQueueItem } from "../../models/submission.model";

export function ProgramsScreen({
  navigate,
  runtimePrograms,
  onProgressChanged,
}: {
  navigate: NavigateFn;
  runtimePrograms: LearnerProgramEnrollment[];
  onProgressChanged?: () => Promise<void>;
}) {
  const [selectedRuntimeId, setSelectedRuntimeId] = useState<number | null>(null);
  const [tasks, setTasks] = useState<LearnerProgramTask[]>([]);
  const [taskDrafts, setTaskDrafts] = useState<Record<number, string>>({});
  const [taskError, setTaskError] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<number | null>(null);
  const [surveys, setSurveys] = useState<Record<number, ProgramSurvey>>({});
  const [surveyDrafts, setSurveyDrafts] = useState<Record<number, Record<number, string>>>({});
  const [peerReviewQueue, setPeerReviewQueue] = useState<PeerReviewQueueItem[]>([]);
  const [peerReviewDrafts, setPeerReviewDrafts] = useState<Record<number, string>>({});
  const runtimeProgram = runtimePrograms.find((item) => item.id === selectedRuntimeId);

  const loadTasks = async (programEnrollmentId: number, signal?: AbortSignal) => {
    try {
      setTasks(await programTaskSubmissionApi.listMine(programEnrollmentId, signal));
      setTaskError(null);
    } catch (error) {
      if (!signal?.aborted) {
        setTaskError(error instanceof Error ? error.message : "Unable to load program tasks.");
      }
    }
  };

  useEffect(() => {
    if (!selectedRuntimeId) {
      setTasks([]);
      return;
    }
    const controller = new AbortController();
    void loadTasks(selectedRuntimeId, controller.signal);
    return () => controller.abort();
  }, [selectedRuntimeId]);

  useEffect(() => {
    const controller = new AbortController();
    programTaskSubmissionApi
      .peerReviewQueue(controller.signal)
      .then(setPeerReviewQueue)
      .catch((error) => {
        if (!controller.signal.aborted)
          setTaskError(error instanceof Error ? error.message : "Unable to load peer reviews.");
      });
    return () => controller.abort();
  }, []);

  const submitPeerReview = async (submissionId: number) => {
    const reviewText = peerReviewDrafts[submissionId]?.trim();
    if (!reviewText) return;
    setSubmittingTaskId(submissionId);
    setTaskError(null);
    try {
      await programTaskSubmissionApi.peerReview(submissionId, { reviewText });
      setPeerReviewQueue((current) =>
        current.filter((submission) => submission.id !== submissionId),
      );
      setPeerReviewDrafts((current) => ({ ...current, [submissionId]: "" }));
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Unable to submit the peer review.");
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const submitTask = async (task: LearnerProgramTask) => {
    if (!selectedRuntimeId) return;
    const value = taskDrafts[task.id]?.trim() ?? "";
    if (!value) return;
    setSubmittingTaskId(task.id);
    setTaskError(null);
    try {
      if (task.taskType.expectedSubmissionType === "TEXT_INPUT") {
        await programTaskSubmissionApi.submitText(selectedRuntimeId, task.id, value);
      } else if (task.taskType.expectedSubmissionType === "LINK") {
        await programTaskSubmissionApi.submitLink(selectedRuntimeId, task.id, value);
      }
      setTaskDrafts((current) => ({ ...current, [task.id]: "" }));
      await Promise.all([loadTasks(selectedRuntimeId), onProgressChanged?.()]);
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Unable to submit this task.");
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const submitFile = async (task: LearnerProgramTask, file: File) => {
    if (!selectedRuntimeId) return;
    setSubmittingTaskId(task.id);
    setTaskError(null);
    try {
      await programTaskSubmissionApi.submitFile(selectedRuntimeId, task.id, file);
      await Promise.all([loadTasks(selectedRuntimeId), onProgressChanged?.()]);
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Unable to upload this file.");
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const loadSurvey = async (task: LearnerProgramTask) => {
    if (!selectedRuntimeId || !task.surveyId) return;
    setSubmittingTaskId(task.id);
    setTaskError(null);
    try {
      const survey = await programSurveyApi.get(selectedRuntimeId, task.surveyId);
      setSurveys((current) => ({ ...current, [task.id]: survey }));
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Unable to load this survey.");
    } finally {
      setSubmittingTaskId(null);
    }
  };

  const submitSurvey = async (task: LearnerProgramTask) => {
    if (!selectedRuntimeId || !task.surveyId) return;
    const survey = surveys[task.id];
    if (!survey) return;
    const drafts = surveyDrafts[task.id] ?? {};
    const missingRequired = survey.questions.some(
      (question) => question.isRequired && !drafts[question.id]?.trim(),
    );
    if (missingRequired) {
      setTaskError("Answer every required survey question.");
      return;
    }
    setSubmittingTaskId(task.id);
    setTaskError(null);
    try {
      await programSurveyApi.submit(
        selectedRuntimeId,
        task.surveyId,
        survey.questions.flatMap((question) => {
          const value = drafts[question.id]?.trim();
          if (!value) return [];
          const rating = question.questionType.slug.toLowerCase().includes("rating");
          return [
            {
              questionId: question.id,
              ...(rating ? { ratingValue: Number(value) } : { textAnswer: value }),
            },
          ];
        }),
      );
      await Promise.all([loadTasks(selectedRuntimeId), onProgressChanged?.()]);
      setSurveys((current) => ({
        ...current,
        [task.id]: { ...survey, response: { id: 0, submittedAt: new Date().toISOString() } },
      }));
    } catch (error) {
      setTaskError(error instanceof Error ? error.message : "Unable to submit this survey.");
    } finally {
      setSubmittingTaskId(null);
    }
  };

  if (runtimeProgram) {
    return (
      <div className="p-8 space-y-6 max-w-[1280px]">
        <button
          onClick={() => setSelectedRuntimeId(null)}
          className="flex items-center gap-2 text-sm font-semibold"
          style={{ color: P.olive }}
        >
          <ChevronLeft size={16} /> Assigned programs
        </button>
        <section
          className="rounded-2xl border bg-white p-6 shadow-sm"
          style={{ borderColor: P.border }}
        >
          <div className="flex flex-wrap gap-2">
            <Chip label={runtimeProgram.cohort?.name ?? "Legacy enrollment"} variant="olive" />
            <Chip label={`Attempt ${runtimeProgram.enrollmentNo}`} variant="sage" />
            <Chip
              label={runtimeProgram.enrollmentStatus.replace(/_/g, " ")}
              variant={runtimeProgram.enrollmentStatus === "COMPLETED" ? "green" : "sage"}
            />
          </div>
          <h1 className="mt-3 text-2xl font-bold" style={{ color: P.text }}>
            {runtimeProgram.program.name}
          </h1>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            {runtimeProgram.program.description ?? "Your assigned learning program."}
          </p>
          <div className="mt-5 flex justify-between text-xs" style={{ color: P.textMuted }}>
            <span>Program progress</span>
            <strong>{Number(runtimeProgram.progressPercentage)}%</strong>
          </div>
          <PBar value={Number(runtimeProgram.progressPercentage)} color={P.olive} height={8} />
        </section>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
            <h2 className="mb-4 text-base font-bold" style={{ color: P.text }}>
              Courses
            </h2>
            <div className="space-y-3">
              {runtimeProgram.enrollments.map((course) => {
                const progress = Number(
                  course.progress?.overallProgress ?? (course.status === "COMPLETED" ? 100 : 0),
                );
                return (
                  <button
                    key={course.id}
                    onClick={() => navigate("player", String(course.id))}
                    className="w-full rounded-xl border p-4 text-left"
                    style={{ borderColor: P.border }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold" style={{ color: P.text }}>
                        {course.courseVersion.course.title}
                      </span>
                      <span className="text-xs" style={{ color: P.olive }}>
                        {progress}%
                      </span>
                    </div>
                    <PBar value={progress} color={P.olive} height={5} />
                  </button>
                );
              })}
            </div>
          </section>
          <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
            <h2 className="mb-4 text-base font-bold" style={{ color: P.text }}>
              Milestones
            </h2>
            <div className="space-y-3">
              {runtimeProgram.milestoneProgresses.length === 0 ? (
                <p className="text-sm" style={{ color: P.textMuted }}>
                  No milestones configured.
                </p>
              ) : (
                runtimeProgram.milestoneProgresses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl p-3"
                    style={{ background: P.paleGreen }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {item.milestone.title}
                      </p>
                      <p className="text-xs" style={{ color: P.textMuted }}>
                        {Number(item.milestone.milestonePercentage)}% target
                      </p>
                    </div>
                    {item.status === "ACHIEVED" ? (
                      <CheckCircle size={18} style={{ color: P.olive }} />
                    ) : (
                      <Clock size={18} style={{ color: P.gold }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
        <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold" style={{ color: P.text }}>
              Program tasks
            </h2>
            <span className="text-xs" style={{ color: P.textMuted }}>
              {tasks.length} configured
            </span>
          </div>
          {taskError && (
            <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {taskError}
            </div>
          )}
          {tasks.length === 0 ? (
            <p className="text-sm" style={{ color: P.textMuted }}>
              No learner tasks are configured for this program.
            </p>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => {
                const latest = task.submissions[0];
                const waived = task.progress?.status === "WAIVED";
                const accepted =
                  waived ||
                  task.progress?.status === "COMPLETED" ||
                  (latest && ["APPROVED", "COMPLETED"].includes(latest.status));
                const canSubmit =
                  !task.isLocked &&
                  !waived &&
                  (!latest || (latest.status === "REJECTED" && task.allowResubmission));
                const linkedCourse = runtimeProgram.enrollments.find(
                  (course) => course.courseVersionId === task.courseVersionId,
                );
                return (
                  <div
                    key={task.id}
                    className="rounded-xl border p-4"
                    style={{ borderColor: task.isBlocking ? P.goldMid : P.border }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg"
                          style={{ background: P.lightSage }}
                        >
                          <FileText size={16} style={{ color: P.olive }} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold" style={{ color: P.text }}>
                              {task.title}
                            </p>
                            {task.isRequired && <Chip label="Required" variant="red" />}
                            {task.isBlocking && <Chip label="Blocking" variant="gold" />}
                            {task.isLocked && (
                              <Chip label={`Phase ${task.phaseNumber ?? 1} locked`} variant="red" />
                            )}
                          </div>
                          <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
                            {task.description ?? task.taskType.name}
                          </p>
                          {task.effectiveDueDate && (
                            <p className="mt-1 text-[11px]" style={{ color: P.textMuted }}>
                              Due {new Date(task.effectiveDueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <Chip
                        label={
                          waived
                            ? "Waived"
                            : accepted
                              ? "Completed"
                              : (latest?.status.replace(/_/g, " ") ?? "Not started")
                        }
                        variant={
                          accepted ? "green" : latest?.status === "REJECTED" ? "red" : "sage"
                        }
                      />
                    </div>
                    {task.isLocked && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                        Complete or receive a waiver for blocking tasks in earlier phases to unlock
                        this task.
                      </p>
                    )}
                    {waived && task.progress?.waiverReason && (
                      <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-xs text-green-700">
                        Waived: {task.progress.waiverReason}
                      </p>
                    )}
                    {latest?.reviewComment && (
                      <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                        Reviewer: {latest.reviewComment}
                      </p>
                    )}
                    {canSubmit && task.taskType.expectedSubmissionType === "TEXT_INPUT" && (
                      <div className="mt-3 flex gap-2">
                        <textarea
                          value={taskDrafts[task.id] ?? ""}
                          onChange={(event) =>
                            setTaskDrafts((current) => ({
                              ...current,
                              [task.id]: event.target.value,
                            }))
                          }
                          rows={3}
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          style={{ borderColor: P.border }}
                          placeholder="Enter your response…"
                        />
                        <button
                          type="button"
                          disabled={submittingTaskId === task.id || !taskDrafts[task.id]?.trim()}
                          onClick={() => void submitTask(task)}
                          className="self-end rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          style={{ background: P.olive }}
                        >
                          <Send size={13} />
                        </button>
                      </div>
                    )}
                    {canSubmit && task.taskType.expectedSubmissionType === "LINK" && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="url"
                          value={taskDrafts[task.id] ?? ""}
                          onChange={(event) =>
                            setTaskDrafts((current) => ({
                              ...current,
                              [task.id]: event.target.value,
                            }))
                          }
                          className="flex-1 rounded-lg border px-3 py-2 text-sm"
                          style={{ borderColor: P.border }}
                          placeholder="https://…"
                        />
                        <button
                          type="button"
                          disabled={submittingTaskId === task.id || !taskDrafts[task.id]?.trim()}
                          onClick={() => void submitTask(task)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                          style={{ background: P.olive }}
                        >
                          <ExternalLink size={13} />
                        </button>
                      </div>
                    )}
                    {canSubmit &&
                      task.taskType.expectedSubmissionType === "QUIZ" &&
                      linkedCourse && (
                        <button
                          type="button"
                          onClick={() => navigate("player", String(linkedCourse.id))}
                          className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold text-white"
                          style={{ background: P.olive }}
                        >
                          Open course assessment
                        </button>
                      )}
                    {canSubmit && task.surveyId && !surveys[task.id] && (
                      <button
                        type="button"
                        disabled={submittingTaskId === task.id}
                        onClick={() => void loadSurvey(task)}
                        className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                        style={{ background: P.olive }}
                      >
                        Open survey
                      </button>
                    )}
                    {canSubmit &&
                      task.surveyId &&
                      surveys[task.id] &&
                      !surveys[task.id].response && (
                        <div
                          className="mt-3 space-y-3 rounded-xl border p-3"
                          style={{ borderColor: P.border }}
                        >
                          <p className="text-xs font-semibold" style={{ color: P.text }}>
                            {surveys[task.id].title}
                          </p>
                          {surveys[task.id].questions.map((question) => {
                            const rating = question.questionType.slug
                              .toLowerCase()
                              .includes("rating");
                            return (
                              <label
                                key={question.id}
                                className="block text-xs"
                                style={{ color: P.textMid }}
                              >
                                {question.questionText}
                                {question.isRequired ? " *" : ""}
                                {rating ? (
                                  <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={surveyDrafts[task.id]?.[question.id] ?? ""}
                                    onChange={(event) =>
                                      setSurveyDrafts((current) => ({
                                        ...current,
                                        [task.id]: {
                                          ...current[task.id],
                                          [question.id]: event.target.value,
                                        },
                                      }))
                                    }
                                    className="mt-1 w-full rounded-lg border px-3 py-2"
                                    style={{ borderColor: P.border }}
                                  />
                                ) : (
                                  <textarea
                                    rows={2}
                                    value={surveyDrafts[task.id]?.[question.id] ?? ""}
                                    onChange={(event) =>
                                      setSurveyDrafts((current) => ({
                                        ...current,
                                        [task.id]: {
                                          ...current[task.id],
                                          [question.id]: event.target.value,
                                        },
                                      }))
                                    }
                                    className="mt-1 w-full rounded-lg border px-3 py-2"
                                    style={{ borderColor: P.border }}
                                  />
                                )}
                              </label>
                            );
                          })}
                          <button
                            type="button"
                            disabled={submittingTaskId === task.id}
                            onClick={() => void submitSurvey(task)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                            style={{ background: P.olive }}
                          >
                            Submit survey
                          </button>
                        </div>
                      )}
                    {task.surveyId && surveys[task.id]?.response && (
                      <p className="mt-3 text-xs" style={{ color: P.olive }}>
                        Survey submitted.
                      </p>
                    )}
                    {canSubmit && task.taskType.expectedSubmissionType === "FILE_UPLOAD" && (
                      <label
                        className="mt-3 inline-flex cursor-pointer items-center rounded-lg px-3 py-2 text-xs font-semibold text-white"
                        style={{ background: P.olive }}
                      >
                        {submittingTaskId === task.id ? "Uploading…" : "Choose file"}
                        <input
                          type="file"
                          className="sr-only"
                          disabled={submittingTaskId === task.id}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.jpg,.jpeg,.png"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void submitFile(task, file);
                            event.currentTarget.value = "";
                          }}
                        />
                      </label>
                    )}
                    {latest?.files?.map((file) => (
                      <p key={file.id} className="mt-2 text-xs" style={{ color: P.textMuted }}>
                        Uploaded: {file.originalFileName}
                      </p>
                    ))}
                    {latest?.status === "UNDER_REVIEW" && (
                      <p className="mt-3 text-xs" style={{ color: P.gold }}>
                        Submitted and awaiting{" "}
                        {task.requiresManagerApproval ? "reviewer approval" : "peer reviews"}.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  }

  if (runtimePrograms.length === 0) {
    return (
      <div className="p-8 max-w-[1280px]">
        <div
          className="rounded-2xl border bg-white p-10 text-center"
          style={{ borderColor: P.border }}
        >
          <Target className="mx-auto mb-3" style={{ color: P.olive }} />
          <h1 className="text-xl font-bold" style={{ color: P.text }}>
            No assigned programs
          </h1>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            Your cohort and program assignments will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-5 max-w-[1280px]">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: P.text }}>
          My Programs
        </h1>
        <p className="text-sm" style={{ color: P.textMuted }}>
          Live enrollment and cohort progress
        </p>
      </div>
      {taskError && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{taskError}</div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {runtimePrograms.map((program) => (
          <button
            key={program.id}
            onClick={() => setSelectedRuntimeId(program.id)}
            className="rounded-2xl border bg-white p-5 text-left shadow-sm"
            style={{ borderColor: P.border }}
          >
            <div className="flex flex-wrap gap-2">
              <Chip label={program.cohort?.name ?? "Legacy enrollment"} variant="olive" />
              <Chip label={`Attempt ${program.enrollmentNo}`} variant="sage" />
              <Chip
                label={program.enrollmentStatus.replace(/_/g, " ")}
                variant={program.enrollmentStatus === "COMPLETED" ? "green" : "sage"}
              />
            </div>
            <h2 className="mt-3 text-base font-bold" style={{ color: P.text }}>
              {program.program.name}
            </h2>
            <p className="mt-2 line-clamp-2 text-xs" style={{ color: P.textMuted }}>
              {program.program.description ?? "Assigned learning program"}
            </p>
            <div className="mt-4 flex justify-between text-xs">
              <span style={{ color: P.textMuted }}>{program.enrollments.length} courses</span>
              <strong style={{ color: P.olive }}>{Number(program.progressPercentage)}%</strong>
            </div>
            <PBar value={Number(program.progressPercentage)} color={P.olive} height={6} />
          </button>
        ))}
      </div>
      <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold" style={{ color: P.text }}>
            Peer reviews available
          </h2>
          <Chip
            label={`${peerReviewQueue.length} open`}
            variant={peerReviewQueue.length ? "gold" : "green"}
          />
        </div>
        {peerReviewQueue.length === 0 ? (
          <p className="text-sm" style={{ color: P.textMuted }}>
            No peer submissions are waiting for your review.
          </p>
        ) : (
          <div className="space-y-3">
            {peerReviewQueue.map((submission) => (
              <div
                key={submission.id}
                className="rounded-xl border p-4"
                style={{ borderColor: P.border }}
              >
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {submission.programTask.title}
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {submission.employee.fullName} · {submission.programTask.program.name}
                </p>
                {submission.textAnswer && (
                  <p
                    className="mt-2 whitespace-pre-wrap rounded-lg p-3 text-xs"
                    style={{ background: P.bg, color: P.textMid }}
                  >
                    {submission.textAnswer}
                  </p>
                )}
                {submission.submissionUrl && (
                  <a
                    href={submission.submissionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 block text-xs underline"
                    style={{ color: P.olive }}
                  >
                    Open submitted link
                  </a>
                )}
                <div className="mt-3 flex gap-2">
                  <input
                    value={peerReviewDrafts[submission.id] ?? ""}
                    onChange={(event) =>
                      setPeerReviewDrafts((current) => ({
                        ...current,
                        [submission.id]: event.target.value,
                      }))
                    }
                    className="flex-1 rounded-lg border px-3 py-2 text-xs"
                    style={{ borderColor: P.border }}
                    placeholder="Write constructive feedback…"
                  />
                  <button
                    type="button"
                    disabled={
                      submittingTaskId === submission.id || !peerReviewDrafts[submission.id]?.trim()
                    }
                    onClick={() => void submitPeerReview(submission.id)}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"
                    style={{ background: P.olive }}
                  >
                    Submit review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
