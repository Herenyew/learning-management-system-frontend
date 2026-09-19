import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, ChevronLeft, Clock, Trophy, X } from "lucide-react";
import { assessmentAttemptApi } from "../../API/assessmentAttempt.api";
import { learnerEnrollmentApi } from "../../API/learnerEnrollment.api";
import { PBar } from "../../components/common";
import { P } from "../../constants/theme.constants";
import type {
  AssessmentAnswerInput,
  AssessmentAttempt,
  AssessmentAttemptResult,
  AssessmentQuestion,
} from "../../models/assessment.model";
import type { NavigateFn } from "../../models/app.model";

const answerFromAttempt = (attempt: AssessmentAttempt) =>
  Object.fromEntries(
    attempt.answers.map(
      ({ id: _id, questionVersionId, reviewStatus: _reviewStatus, ...answer }) => [
        questionVersionId,
        answer as AssessmentAnswerInput,
      ],
    ),
  ) as Record<number, AssessmentAnswerInput>;

const answered = (question: AssessmentQuestion, answer?: AssessmentAnswerInput) => {
  if (!answer) return false;
  if ("optionIds" in answer) return answer.optionIds.length > 0;
  if ("answerText" in answer) return answer.answerText.trim().length > 0;
  if ("blanks" in answer) {
    return (
      answer.blanks.length === question.blankIndexes.length &&
      answer.blanks.every((blank) => blank.typedText.trim().length > 0)
    );
  }
  return answer.matches.length === question.leftItems.length;
};

export function QuizScreen({
  navigate,
  enrollmentId,
  onCompleted,
}: {
  navigate: NavigateFn;
  enrollmentId: number | null;
  onCompleted?: () => Promise<void>;
}) {
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [result, setResult] = useState<AssessmentAttemptResult | null>(null);
  const [answers, setAnswers] = useState<Record<number, AssessmentAnswerInput>>({});
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedAll, setCompletedAll] = useState(false);

  const loadAssessment = async (signal?: AbortSignal) => {
    if (!enrollmentId) {
      setError("Open this assessment from an active course enrollment.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setAttempt(null);
    setResult(null);
    setCompletedAll(false);
    try {
      const detail = await learnerEnrollmentApi.getProgress(enrollmentId, signal);
      const assessments = detail.courseVersion.assessments ?? [];
      const activeAssessment = assessments.find((item) =>
        item.attempts.some((itemAttempt) => itemAttempt.status === "IN_PROGRESS"),
      );
      const pendingAssessment = assessments.find(
        (item) => item.attempts[0]?.status === "SUBMITTED",
      );
      const nextAssessment = assessments.find(
        (item) =>
          !item.attempts.some(
            (itemAttempt) => itemAttempt.status === "GRADED" && itemAttempt.passed,
          ) && item.attempts.length < item.maxAttempts,
      );
      const exhaustedAssessment = assessments.find(
        (item) =>
          !item.attempts.some(
            (itemAttempt) => itemAttempt.status === "GRADED" && itemAttempt.passed,
          ) && item.attempts.length >= item.maxAttempts,
      );

      if (pendingAssessment) {
        setResult(await assessmentAttemptApi.result(pendingAssessment.attempts[0].id, signal));
      } else if (activeAssessment || nextAssessment) {
        const next = await assessmentAttemptApi.start(
          (activeAssessment ?? nextAssessment)!.id,
          enrollmentId,
        );
        setAttempt(next);
        setAnswers(answerFromAttempt(next));
        setQuestionIndex(0);
      } else if (exhaustedAssessment?.attempts[0]) {
        setResult(await assessmentAttemptApi.result(exhaustedAssessment.attempts[0].id, signal));
      } else {
        setCompletedAll(true);
      }
    } catch (loadError) {
      if (!signal?.aborted) {
        setError(loadError instanceof Error ? loadError.message : "Unable to load the assessment.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadAssessment(controller.signal);
    return () => controller.abort();
  }, [enrollmentId]);

  const question = attempt?.questions[questionIndex];
  const currentAnswer = question ? answers[question.questionVersionId] : undefined;
  const completedCount =
    attempt?.questions.filter((item) => answered(item, answers[item.questionVersionId])).length ??
    0;

  const updateAnswer = (value: AssessmentAnswerInput) => {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.questionVersionId]: value }));
  };

  const saveCurrent = async () => {
    if (!attempt || !question || !currentAnswer) return;
    await assessmentAttemptApi.saveAnswer(attempt.id, question.questionVersionId, currentAnswer);
  };

  const move = async (direction: -1 | 1) => {
    setSaving(true);
    setError(null);
    try {
      await saveCurrent();
      setQuestionIndex((current) =>
        Math.min(attempt!.questions.length - 1, Math.max(0, current + direction)),
      );
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this answer.");
    } finally {
      setSaving(false);
    }
  };

  const submit = async () => {
    if (!attempt) return;
    setSaving(true);
    setError(null);
    try {
      await saveCurrent();
      const submitted = await assessmentAttemptApi.submit(attempt.id);
      setResult(submitted);
      setAttempt(null);
      await onCompleted?.();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to submit the assessment.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={{ background: P.bg, color: P.textMuted }}
      >
        Loading assessment…
      </div>
    );
  }

  if (error && !attempt && !result) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: P.bg }}>
        <div
          className="max-w-md rounded-2xl border bg-white p-7 text-center"
          style={{ borderColor: P.border }}
        >
          <AlertCircle className="mx-auto mb-3" style={{ color: "#B91C1C" }} />
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            {error}
          </p>
          <button
            className="mt-5 rounded-lg px-4 py-2 text-xs font-semibold"
            style={{ border: `1px solid ${P.border}` }}
            onClick={() => navigate("player")}
          >
            Back to course
          </button>
        </div>
      </div>
    );
  }

  if (completedAll) {
    return (
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: P.bg }}>
        <div
          className="max-w-md rounded-2xl border bg-white p-8 text-center"
          style={{ borderColor: P.border }}
        >
          <CheckCircle size={42} className="mx-auto mb-3" style={{ color: P.olive }} />
          <h2 className="text-xl font-bold" style={{ color: P.text }}>
            All assessments completed
          </h2>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            There are no remaining required assessments for this enrollment.
          </p>
          <button
            className="mt-5 rounded-lg px-5 py-2 text-sm font-semibold text-white"
            style={{ background: P.olive }}
            onClick={() => navigate("player")}
          >
            Back to course
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    const pending = result.status === "SUBMITTED";
    const passed = result.passed === true;
    return (
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: P.bg }}>
        <div
          className="max-w-lg w-full rounded-2xl border bg-white p-8 text-center shadow-lg"
          style={{ borderColor: P.border }}
        >
          {pending ? (
            <Clock size={44} className="mx-auto mb-4" style={{ color: P.gold }} />
          ) : passed ? (
            <Trophy size={44} className="mx-auto mb-4" style={{ color: P.olive }} />
          ) : (
            <AlertCircle size={44} className="mx-auto mb-4" style={{ color: "#B91C1C" }} />
          )}
          <h2 className="text-2xl font-bold" style={{ color: P.text }}>
            {pending
              ? "Awaiting instructor review"
              : passed
                ? "Assessment passed"
                : result.status === "EXPIRED"
                  ? "Attempt expired"
                  : "Assessment not passed"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            {pending
              ? "Your written responses were submitted successfully. Your authoritative result will appear after grading."
              : result.percentage == null
                ? "No score is available for this attempt."
                : `Authoritative score: ${result.percentage.toFixed(2)}% (${result.score ?? 0}/${result.totalMarks} marks)`}
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              onClick={() => navigate("player")}
            >
              Back to course
            </button>
            {!pending && passed && (
              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: P.olive }}
                onClick={() => void loadAssessment()}
              >
                Next assessment
              </button>
            )}
            {!pending && !passed && (
              <button
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
                style={{ background: P.olive }}
                onClick={() => void loadAssessment()}
              >
                Retake if available
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!attempt || !question) return null;
  const isLast = questionIndex === attempt.questions.length - 1;
  const canContinue = answered(question, currentAnswer);
  const selectedOptionIds =
    currentAnswer && "optionIds" in currentAnswer ? currentAnswer.optionIds : [];
  const blankAnswers = currentAnswer && "blanks" in currentAnswer ? currentAnswer.blanks : [];
  const matchAnswers = currentAnswer && "matches" in currentAnswer ? currentAnswer.matches : [];
  const textAnswer = currentAnswer && "answerText" in currentAnswer ? currentAnswer.answerText : "";

  return (
    <div className="flex-1 flex flex-col p-6" style={{ background: P.bg }}>
      <div className="mx-auto mb-6 flex w-full max-w-3xl items-center justify-between">
        <div>
          <p className="text-xs" style={{ color: P.textMuted }}>
            Attempt {attempt.attemptNo}
          </p>
          <h2 className="text-base font-bold" style={{ color: P.text }}>
            {attempt.title}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {attempt.durationMinutes != null && (
            <span className="flex items-center gap-1 text-xs" style={{ color: P.textMuted }}>
              <Clock size={13} /> {attempt.durationMinutes} minutes
            </span>
          )}
          <button
            onClick={() => navigate("player")}
            className="flex items-center gap-1 text-xs"
            style={{ color: P.textMuted }}
          >
            <X size={14} /> Exit
          </button>
        </div>
      </div>

      <div className="mx-auto mb-6 w-full max-w-3xl">
        <div className="mb-1.5 flex justify-between text-xs" style={{ color: P.textMuted }}>
          <span>
            Question {questionIndex + 1} of {attempt.questions.length}
          </span>
          <span>{completedCount} answered</span>
        </div>
        <PBar
          value={(completedCount / attempt.questions.length) * 100}
          color={P.olive}
          height={6}
        />
      </div>

      <div className="mx-auto w-full max-w-3xl">
        {error && (
          <div className="mb-3 rounded-lg bg-red-50 px-4 py-2 text-xs text-red-700">{error}</div>
        )}
        <div
          className="rounded-2xl border bg-white p-7 shadow-sm"
          style={{ borderColor: P.border }}
        >
          <p className="mb-6 text-base font-semibold leading-relaxed" style={{ color: P.text }}>
            {question.questionText}
          </p>

          {["multiple_choice", "true_false"].includes(question.type) && (
            <div className="space-y-3">
              {question.options.map((option) => {
                const selected = selectedOptionIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => updateAnswer({ optionIds: [option.id] })}
                    className="w-full rounded-xl border-2 p-4 text-left text-sm"
                    style={{
                      borderColor: selected ? P.olive : P.border,
                      background: selected ? P.lightSage : "white",
                      color: P.textMid,
                    }}
                  >
                    {option.optionLabel ? `${option.optionLabel}. ` : ""}
                    {option.optionText}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "multi_select" && (
            <div className="space-y-3">
              {question.options.map((option) => {
                const selected = selectedOptionIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      updateAnswer({
                        optionIds: selected
                          ? selectedOptionIds.filter((id) => id !== option.id)
                          : [...selectedOptionIds, option.id],
                      })
                    }
                    className="w-full rounded-xl border-2 p-4 text-left text-sm"
                    style={{
                      borderColor: selected ? P.olive : P.border,
                      background: selected ? P.lightSage : "white",
                      color: P.textMid,
                    }}
                  >
                    {selected ? "☑" : "☐"} {option.optionText}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "fill_blank" && (
            <div className="space-y-3">
              {question.blankIndexes.map((blankIndex) => {
                const value =
                  blankAnswers.find((blank) => blank.blankIndex === blankIndex)?.typedText ?? "";
                return (
                  <label
                    key={blankIndex}
                    className="block text-xs font-semibold"
                    style={{ color: P.textMid }}
                  >
                    Blank {blankIndex + 1}
                    <input
                      value={value}
                      onChange={(event) =>
                        updateAnswer({
                          blanks: [
                            ...blankAnswers.filter((blank) => blank.blankIndex !== blankIndex),
                            { blankIndex, typedText: event.target.value },
                          ].sort((a, b) => a.blankIndex - b.blankIndex),
                        })
                      }
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm font-normal"
                      style={{ borderColor: P.border }}
                    />
                  </label>
                );
              })}
            </div>
          )}

          {["matching", "drag_drop"].includes(question.type) && (
            <div className="space-y-3">
              {question.leftItems.map((left) => {
                const value =
                  matchAnswers.find((match) => match.leftPairId === left.id)?.rightPairId ?? "";
                return (
                  <label
                    key={left.id}
                    className="grid grid-cols-2 items-center gap-3 text-sm"
                    style={{ color: P.textMid }}
                  >
                    <span>{left.value}</span>
                    <select
                      value={value}
                      onChange={(event) =>
                        updateAnswer({
                          matches: [
                            ...matchAnswers.filter((match) => match.leftPairId !== left.id),
                            { leftPairId: left.id, rightPairId: Number(event.target.value) },
                          ],
                        })
                      }
                      className="rounded-lg border px-3 py-2"
                      style={{ borderColor: P.border }}
                    >
                      <option value="">Select match…</option>
                      {question.rightItems.map((right) => (
                        <option key={right.id} value={right.id}>
                          {right.value}
                        </option>
                      ))}
                    </select>
                  </label>
                );
              })}
            </div>
          )}

          {["short_answer", "essay"].includes(question.type) && (
            <textarea
              value={textAnswer}
              onChange={(event) => updateAnswer({ answerText: event.target.value })}
              rows={question.type === "essay" ? 8 : 4}
              className="w-full rounded-xl border p-3 text-sm"
              style={{ borderColor: P.border }}
              placeholder="Enter your response…"
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => void move(-1)}
            disabled={questionIndex === 0 || saving}
            className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm disabled:opacity-40"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            <ChevronLeft size={15} /> Previous
          </button>
          <button
            onClick={() => (isLast ? void submit() : void move(1))}
            disabled={!canContinue || saving}
            className="rounded-lg px-6 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: P.olive }}
          >
            {saving ? "Saving…" : isLast ? "Submit assessment" : "Save & next"}
          </button>
        </div>
      </div>
    </div>
  );
}
