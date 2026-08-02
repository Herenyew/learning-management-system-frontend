import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  HardDrive,
  Video,
  FileText,
  HelpCircle,
  Cpu,
  Music,
  Activity,
  ClipboardList,
  MessageSquare,
  Users,
  Link2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  Copy,
  Download,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  Bookmark,
  Wand2,
  Globe,
  AlertCircle,
  Play,
  ExternalLink,
  Mic,
  GitBranch,
  Star,
} from "lucide-react";
import {
  FormField,
  Input,
  ModalHeader,
  NavButtons,
  P,
  StepDots,
  Textarea,
  Toggle,
} from "../contentWorkflow.shared";

import { QuestionBankModal } from "./QuestionBankModal";
import { QuestionEditor } from "./QuestionEditor";
import { QuestionTypeModal } from "./QuestionTypeModal";
import {
  ATTEMPT_SCORING_POLICY_UPDATED_EVENT,
  canCreatorAddCustomQuestionTypes,
  defaultSettings,
  describeAttemptScoringPolicy,
  getCreatorQuestionTypes,
  getQuestionTypeMeta,
  loadAttemptScoringPolicy,
  loadQuestionTypeOptions,
  saveCustomQuestionTypes,
  type AttemptScoringPolicy,
  type QType,
  type QuestionTypeConfig,
  type QuestionTypeOption,
  type QuizQuestion,
  type QuizSettings,
  type SavedQuiz,
} from "./quiz.shared";

export function QuizBuilder({
  initialSettings,
  initialQuestions = [],
  questionTypeConfig,
  onBack,
  onSave,
  sourceLabel,
}: {
  initialSettings: Partial<QuizSettings>;
  initialQuestions?: QuizQuestion[];
  questionTypeConfig?: QuestionTypeConfig[];
  onBack: () => void;
  onSave: (q: SavedQuiz) => void;
  sourceLabel: string;
}) {
  const [builderTab, setBuilderTab] = useState<"settings" | "questions" | "preview">("settings");
  const [attemptScoringPolicy, setAttemptScoringPolicy] = useState<AttemptScoringPolicy>(() =>
    loadAttemptScoringPolicy(),
  );
  const [settings, setSettings] = useState<QuizSettings>(() => {
    const policy = loadAttemptScoringPolicy();
    return {
      ...defaultSettings,
      ...initialSettings,
      attemptScoring: policy.allowCreatorOverride
        ? (initialSettings.attemptScoring ?? policy.enabled)
        : policy.enabled,
    };
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [questionTypes, setQuestionTypes] = useState<QuestionTypeOption[]>(() =>
    loadQuestionTypeOptions(),
  );
  const availableQuestionTypes = getCreatorQuestionTypes(questionTypes, questionTypeConfig);
  const allowCustomQuestionTypes = canCreatorAddCustomQuestionTypes(questionTypeConfig);
  const setSetting = (k: keyof QuizSettings) => (v: any) => setSettings((p) => ({ ...p, [k]: v }));
  const attemptScoringLockedByHr = !attemptScoringPolicy.allowCreatorOverride;

  useEffect(() => {
    const syncAttemptPolicy = () => {
      const nextPolicy = loadAttemptScoringPolicy();
      setAttemptScoringPolicy(nextPolicy);
      if (!nextPolicy.allowCreatorOverride) {
        setSettings((current) => ({ ...current, attemptScoring: nextPolicy.enabled }));
      }
    };

    window.addEventListener("storage", syncAttemptPolicy);
    window.addEventListener(ATTEMPT_SCORING_POLICY_UPDATED_EVENT, syncAttemptPolicy);
    return () => {
      window.removeEventListener("storage", syncAttemptPolicy);
      window.removeEventListener(ATTEMPT_SCORING_POLICY_UPDATED_EVENT, syncAttemptPolicy);
    };
  }, []);

  // Question modals
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingQ, setEditingQ] = useState<(Partial<QuizQuestion> & { type: QType }) | null>(null);

  const addQuestion = (q: QuizQuestion) => {
    setQuestions((p) => [...p, q]);
    setEditingQ(null);
    setShowTypeModal(false);
  };
  const updateQuestion = (q: QuizQuestion) => {
    setQuestions((p) => p.map((x) => (x.id === q.id ? q : x)));
    setEditingQ(null);
  };
  const duplicateQ = (id: string) => {
    const q = questions.find((x) => x.id === id);
    if (q) setQuestions((p) => [...p, { ...q, id: `q${Date.now()}` }]);
  };
  const deleteQ = (id: string) => setQuestions((p) => p.filter((x) => x.id !== id));
  const addFromBank = (q: QuizQuestion) => {
    if (!questions.find((x) => x.id === q.id)) setQuestions((p) => [...p, { ...q }]);
  };
  const addQuestionType = (option: QuestionTypeOption) => {
    setQuestionTypes((current) => {
      const next = current.some((item) => item.type === option.type)
        ? current
        : [...current, option];
      saveCustomQuestionTypes(next);
      return next;
    });
  };

  const totalPoints = questions.reduce((s, q) => s + q.weight, 0);
  const canSave = settings.name.trim() && questions.length > 0;

  const diffBadgeStyle = (d: string) => ({
    background: d === "Easy" ? "#D8EDCC" : d === "Medium" ? P.goldLight : "#FEE2E2",
    color: d === "Easy" ? "#3A6420" : d === "Medium" ? "#8A6A1A" : "#B91C1C",
  });

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center gap-3 flex-shrink-0"
        style={{ borderColor: P.border }}
      >
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg hover:bg-gray-100"
          style={{ color: P.textMuted }}
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: P.textMuted }}
          >
            {sourceLabel}
          </p>
          <p
            className="text-base font-bold truncate"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {settings.name || "Untitled Quiz"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: P.textMuted }}>
          <span className="font-semibold" style={{ color: P.text }}>
            {questions.length}
          </span>{" "}
          Q<span className="mx-1">·</span>
          <span className="font-semibold" style={{ color: P.text }}>
            {totalPoints}
          </span>{" "}
          pts
        </div>
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-gray-100">
          <X size={16} style={{ color: P.textMuted }} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: P.border }}>
        {(["settings", "questions", "preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setBuilderTab(t)}
            className="flex-1 py-2.5 text-xs font-semibold capitalize transition-colors"
            style={
              builderTab === t
                ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                : { color: P.textMuted }
            }
          >
            {t === "questions"
              ? `Questions (${questions.length})`
              : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Settings ── */}
        {builderTab === "settings" && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Quiz Name <span style={{ color: "#C0392B" }}>*</span>
                </label>
                <input
                  value={settings.name}
                  onChange={(e) => setSetting("name")(e.target.value)}
                  placeholder="e.g. AI Fundamentals Assessment"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none focus:ring-2"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Description
                </label>
                <textarea
                  value={settings.desc}
                  onChange={(e) => setSetting("desc")(e.target.value)}
                  rows={2}
                  placeholder="What will this quiz assess?"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none resize-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Pass Threshold (%)
                </label>
                <input
                  type="number"
                  value={settings.passThreshold}
                  onChange={(e) => setSetting("passThreshold")(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={settings.maxAttempts}
                  onChange={(e) => setSetting("maxAttempts")(Number(e.target.value))}
                  min={1}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Retry Rule
                </label>
                <select
                  value={settings.retryRule}
                  onChange={(e) => setSetting("retryRule")(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                >
                  <option value="immediate">Retry immediately</option>
                  <option value="cooldown">24-hour cooldown</option>
                  <option value="unlimited">Unlimited retries</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Time Limit (minutes)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={settings.timeLimitMin}
                    onChange={(e) => setSetting("timeLimitMin")(Number(e.target.value))}
                    disabled={!settings.timeEnabled}
                    className="flex-1 px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                    style={{
                      border: `1px solid ${P.border}`,
                      color: P.text,
                      opacity: settings.timeEnabled ? 1 : 0.4,
                    }}
                  />
                  <button
                    onClick={() => setSetting("timeEnabled")(!settings.timeEnabled)}
                    className="px-3 py-2.5 rounded-xl text-xs font-medium"
                    style={
                      settings.timeEnabled
                        ? { background: P.olive, color: "white" }
                        : { border: `1px solid ${P.border}`, color: P.textMid }
                    }
                  >
                    {settings.timeEnabled ? "On" : "Off"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: P.border }}>
              <p className="text-xs font-bold mb-3" style={{ color: P.textMid }}>
                Quiz Behaviour
              </p>
              {(
                [
                  ["randomize", "Randomize Question Order", "Different order each attempt"],
                  ["showAnswers", "Show Correct Answers After Submit", "Learners see feedback"],
                  ["attemptScoring", "Attempt-Based Scoring", "Different points per retry"],
                  ["negativeMarking", "Negative Marking", "Deduct points for wrong answers"],
                  ["partialScoring", "Partial Scoring", "Award partial marks on multi-select"],
                ] as [keyof QuizSettings, string, string][]
              ).map(([key, label, desc]) => {
                const isAttemptScoring = key === "attemptScoring";
                const isLocked = isAttemptScoring && attemptScoringLockedByHr;
                const rowDesc = isAttemptScoring
                  ? describeAttemptScoringPolicy(attemptScoringPolicy)
                  : desc;

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 rounded-lg transition-colors"
                    style={{
                      background: settings[key] ? `${P.lightSage}80` : P.bg,
                      cursor: isLocked ? "not-allowed" : "pointer",
                      opacity: isLocked && !attemptScoringPolicy.enabled ? 0.7 : 1,
                    }}
                    onClick={() => {
                      if (isLocked) return;
                      setSetting(key)(!(settings[key] as boolean));
                    }}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold" style={{ color: P.text }}>
                          {label}
                        </p>
                        {isAttemptScoring && (
                          <span
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                            style={{ background: P.lightSage, color: P.darkOlive }}
                          >
                            {attemptScoringPolicy.allowCreatorOverride
                              ? "Creator override"
                              : "HR controlled"}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] leading-relaxed" style={{ color: P.textMuted }}>
                        {rowDesc}
                      </p>
                    </div>
                    <div
                      className="rounded-full relative flex-shrink-0 ml-3"
                      style={{
                        width: 36,
                        height: 20,
                        background: settings[key] ? P.olive : P.border,
                      }}
                    >
                      <span
                        className="absolute top-1 w-3.5 h-3.5 rounded-full bg-white shadow transition-all"
                        style={{ left: settings[key] ? 18 : 2 }}
                      />
                    </div>
                  </div>
                );
              })}

              <div
                className="rounded-xl border p-3"
                style={{
                  borderColor: P.border,
                  background: attemptScoringPolicy.enabled ? P.lightSage : P.bg,
                }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: P.text }}>
                  HR Attempt Scoring Policy
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: P.textMuted }}>
                  {describeAttemptScoringPolicy(attemptScoringPolicy)}
                </p>
                {attemptScoringPolicy.enabled && attemptScoringPolicy.mode === "reduced-credit" && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {[
                      ["1st", attemptScoringPolicy.firstAttemptPercent],
                      ["2nd", attemptScoringPolicy.secondAttemptPercent],
                      ["3rd", attemptScoringPolicy.thirdAttemptPercent],
                      ["Later", attemptScoringPolicy.laterAttemptPercent],
                    ].map(([label, percent]) => (
                      <div key={label} className="rounded-lg bg-white px-2 py-1.5 text-center">
                        <p className="text-[9px] font-semibold" style={{ color: P.textMuted }}>
                          {label}
                        </p>
                        <p className="text-xs font-bold" style={{ color: P.text }}>
                          {percent}%
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Questions ── */}
        {builderTab === "questions" && (
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowTypeModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: P.olive }}
              >
                <Plus size={15} /> Add Question
              </button>
              <button
                onClick={() => setShowBankModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                <HelpCircle size={14} /> Add From Question Bank
              </button>
            </div>

            {questions.length === 0 ? (
              <div className="py-16 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: P.lightSage }}
                >
                  <HelpCircle size={28} style={{ color: P.sage }} />
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
                  No questions yet
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  Click "Add Question" to build your quiz, or import from the Question Bank.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {questions.map((q, i) => {
                  const tm = getQuestionTypeMeta(questionTypes, q.type);
                  return (
                    <div
                      key={q.id}
                      className="flex items-start gap-3 p-4 rounded-xl border group transition-colors"
                      style={{ borderColor: P.border, background: "white" }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background = P.bg)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLDivElement).style.background = "white")
                      }
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: P.olive }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug" style={{ color: P.text }}>
                          {q.text || <em style={{ color: P.textMuted }}>No question text</em>}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span
                            className="flex items-center gap-1 text-[10px]"
                            style={{ color: P.textMuted }}
                          >
                            <tm.icon size={10} style={{ color: tm.color }} />
                            {tm.label}
                          </span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={diffBadgeStyle(q.difficulty)}
                          >
                            {q.difficulty}
                          </span>
                          <span className="text-[10px]" style={{ color: P.textMuted }}>
                            {q.weight} pt{q.weight !== 1 ? "s" : ""}
                          </span>
                          {q.explanation && (
                            <span className="text-[10px]" style={{ color: P.sage }}>
                              Has explanation
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingQ(q)}
                          className="p-1.5 rounded-lg hover:bg-white"
                          title="Edit"
                        >
                          <Edit size={13} style={{ color: P.olive }} />
                        </button>
                        <button
                          onClick={() => duplicateQ(q.id)}
                          className="p-1.5 rounded-lg hover:bg-white"
                          title="Duplicate"
                        >
                          <Copy size={13} style={{ color: P.textMuted }} />
                        </button>
                        <button
                          onClick={() => deleteQ(q.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 size={13} style={{ color: "#C0392B" }} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between pt-2 px-1">
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {questions.length} question{questions.length !== 1 ? "s" : ""} · {totalPoints}{" "}
                    total points
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Preview ── */}
        {builderTab === "preview" && (
          <div className="p-6">
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: P.border }}>
              <div
                className="p-5 text-white"
                style={{ background: `linear-gradient(135deg,${P.darkOlive},${P.olive})` }}
              >
                <p
                  className="text-[11px] font-semibold uppercase tracking-widest mb-1"
                  style={{ color: "rgba(231,238,220,0.6)" }}
                >
                  Quiz Preview
                </p>
                <h3
                  className="text-lg font-bold mb-2"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                >
                  {settings.name || "Untitled Quiz"}
                </h3>
                {settings.desc && (
                  <p className="text-xs mb-3" style={{ color: "rgba(231,238,220,0.8)" }}>
                    {settings.desc}
                  </p>
                )}
                <div className="flex gap-4 text-xs">
                  <span>
                    <strong>{questions.length}</strong> Questions
                  </span>
                  <span>
                    <strong>{settings.passThreshold}%</strong> Pass Score
                  </span>
                  <span>
                    <strong>{settings.maxAttempts}</strong> Attempts
                  </span>
                  {settings.timeEnabled && (
                    <span>
                      <strong>{settings.timeLimitMin}min</strong> Time Limit
                    </span>
                  )}
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: P.border }}>
                {questions.slice(0, 3).map((q, i) => {
                  const tm = getQuestionTypeMeta(questionTypes, q.type);
                  return (
                    <div key={q.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: P.olive }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2" style={{ color: P.text }}>
                            {q.text}
                          </p>
                          {q.type === "MCQ" &&
                            q.options
                              .filter((o) => o)
                              .map((opt, oi) => (
                                <div
                                  key={oi}
                                  className="flex items-center gap-2 mb-1 p-2 rounded-lg"
                                  style={{ background: P.bg }}
                                >
                                  <div
                                    className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                                    style={{ borderColor: P.border }}
                                  />
                                  <span className="text-xs" style={{ color: P.text }}>
                                    {opt}
                                  </span>
                                </div>
                              ))}
                          {q.type === "TrueFalse" && (
                            <div className="flex gap-2">
                              {["True", "False"].map((o) => (
                                <div
                                  key={o}
                                  className="px-4 py-2 rounded-lg text-xs border"
                                  style={{ borderColor: P.border, color: P.textMid }}
                                >
                                  {o}
                                </div>
                              ))}
                            </div>
                          )}
                          {(q.type === "ShortAnswer" || q.type === "Essay") && (
                            <div
                              className="h-10 rounded-lg border"
                              style={{ borderColor: P.border, background: P.bg }}
                            />
                          )}
                          <span
                            className="text-[10px] mt-2 inline-block"
                            style={{ color: P.textMuted }}
                          >
                            {tm.label} · {q.weight} pt{q.weight !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {questions.length > 3 && (
                  <div className="px-4 py-3 text-center">
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      +{questions.length - 3} more questions
                    </p>
                  </div>
                )}
                {questions.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-sm" style={{ color: P.textMuted }}>
                      No questions added yet
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t flex items-center gap-2 flex-shrink-0"
        style={{ borderColor: P.border, background: P.bg }}
      >
        {builderTab !== "preview" && (
          <button
            onClick={() => setBuilderTab(builderTab === "settings" ? "questions" : "preview")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            {builderTab === "settings" ? "Next: Questions →" : "Preview Quiz →"}
          </button>
        )}
        <button
          onClick={() =>
            canSave &&
            onSave({
              name: settings.name,
              questionCount: questions.length,
              passScore: settings.passThreshold,
              questions,
              settings: attemptScoringLockedByHr
                ? { ...settings, attemptScoring: attemptScoringPolicy.enabled }
                : settings,
            })
          }
          disabled={!canSave}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
          style={{ background: P.olive, opacity: canSave ? 1 : 0.45 }}
        >
          <CheckCircle size={15} /> Save Quiz — Add to Module
        </button>
      </div>

      {/* Modals */}
      {showTypeModal && (
        <QuestionTypeModal
          questionTypes={availableQuestionTypes}
          allowCustomTypes={allowCustomQuestionTypes}
          onSelect={(type) => {
            setEditingQ({ type });
            setShowTypeModal(false);
          }}
          onAddType={addQuestionType}
          onClose={() => setShowTypeModal(false)}
        />
      )}
      {showBankModal && (
        <QuestionBankModal onAdd={addFromBank} onClose={() => setShowBankModal(false)} />
      )}
      {editingQ && (
        <QuestionEditor
          q={editingQ}
          questionTypes={questionTypes}
          onSave={editingQ.id ? updateQuestion : addQuestion}
          onClose={() => setEditingQ(null)}
        />
      )}
    </div>
  );
}

// ── Full QuizWorkflow ─────────────────────────────────────────
