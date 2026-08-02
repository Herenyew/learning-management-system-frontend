import React, { useState } from "react";
import { AICard, PBar } from "../../components/common";
import { QUIZ_QUESTIONS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
import {
  calculateQuizXpAward,
  loadXpGamificationConfig,
  recordQuizXpAward,
  type QuizXpAwardResult,
} from "../../services/quizXp.service";
import { AlertCircle, Sparkles, Trophy, X, Zap } from "lucide-react";
export function QuizScreen({ navigate }: { navigate: NavigateFn }) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(QUIZ_QUESTIONS.length).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [quizXpConfig] = useState(loadXpGamificationConfig);
  const [xpAward, setXpAward] = useState<QuizXpAwardResult | null>(null);
  const q = QUIZ_QUESTIONS[qIndex];
  const score = submitted ? answers.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length : 0;
  const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100);
  const passScore = quizXpConfig.minimumQuizPassScore;
  const passed = pct >= passScore;

  const handleNext = () => {
    const updated = [...answers];
    updated[qIndex] = selected;
    setAnswers(updated);
    if (qIndex < QUIZ_QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      setSelected(answers[qIndex + 1]);
      setShowHint(false);
    } else {
      const finalScore = updated.filter((a, i) => a === QUIZ_QUESTIONS[i].correct).length;
      const finalPct = Math.round((finalScore / QUIZ_QUESTIONS.length) * 100);
      const award = calculateQuizXpAward("ai-foundations-module-1", finalPct, quizXpConfig);
      recordQuizXpAward("ai-foundations-module-1", award);
      setXpAward(award);
      setSubmitted(true);
    }
  };

  const resetQuiz = () => {
    setQIndex(0);
    setSelected(null);
    setAnswers(Array(QUIZ_QUESTIONS.length).fill(null));
    setSubmitted(false);
    setShowHint(false);
    setXpAward(null);
  };

  if (submitted)
    return (
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: P.bg }}>
        <div
          className="bg-white rounded-2xl border p-8 max-w-lg w-full text-center shadow-lg"
          style={{ borderColor: P.border }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: passed ? "#D8EDCC" : "#FEE2E2" }}
          >
            {passed ? (
              <Trophy size={36} style={{ color: "#5A7A2A" }} />
            ) : (
              <AlertCircle size={36} style={{ color: "#C0392B" }} />
            )}
          </div>
          <h2
            className="text-2xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {passed ? "Great job!" : "Keep practicing!"}
          </h2>
          <p className="text-sm mb-5" style={{ color: P.textMuted }}>
            You scored <strong>{pct}%</strong> on the AI Foundations quiz
          </p>
          <div className="flex justify-center gap-8 mb-6">
            {[
              [`${score}/${QUIZ_QUESTIONS.length}`, "Correct"],
              [`${pct}%`, "Score"],
            ].map(([v, l]) => (
              <div key={l}>
                <p
                  className="text-3xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                >
                  {v}
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {l}
                </p>
              </div>
            ))}
          </div>
          {xpAward && (
            <div
              className="rounded-xl border p-4 mb-4 text-left"
              style={{ borderColor: P.border, background: P.paleGreen }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: xpAward.earned > 0 ? P.goldLight : P.lightSage }}
                >
                  <Zap size={15} style={{ color: xpAward.earned > 0 ? P.gold : P.olive }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {xpAward.enabled
                      ? xpAward.earned > 0
                        ? `+${xpAward.earned} XP awarded`
                        : xpAward.alreadyAwarded
                          ? "Quiz XP already awarded"
                          : "No quiz XP awarded"
                      : "Quiz XP disabled"}
                  </p>
                  <p className="text-[11px]" style={{ color: P.textMuted }}>
                    Pass threshold: {passScore}%
                  </p>
                </div>
              </div>
              {xpAward.breakdown.length > 0 && (
                <div className="mt-3 space-y-1">
                  {xpAward.breakdown.map((line) => (
                    <p key={line} className="text-[11px]" style={{ color: P.textMid }}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
          <AICard title="AI Performance Analysis">
            <p className="text-xs leading-relaxed" style={{ color: "#7A5A10" }}>
              {passed
                ? "Strong performance! You demonstrated solid understanding of ML classification. Your weakest area was bias detection — consider revisiting Module 4."
                : "Your understanding of supervised vs. unsupervised learning needs work. I recommend re-watching Chapter 2 before retaking."}
            </p>
          </AICard>
          <div className="flex gap-2 mt-5">
            <button
              onClick={() => navigate("player")}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              Back to Course
            </button>
            <button
              onClick={() => {
                if (passed) navigate("certificates");
                else resetQuiz();
              }}
              className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold"
              style={{ background: P.olive }}
            >
              {passed ? "Get Certificate →" : "Retake Quiz"}
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col p-6" style={{ background: P.bg }}>
      <div className="flex items-center justify-between mb-6 max-w-3xl mx-auto w-full">
        <div>
          <p className="text-xs mb-0.5" style={{ color: P.textMuted }}>
            AI & ML for Business Leaders
          </p>
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Module 1 Assessment
          </h2>
        </div>
        <button
          onClick={() => navigate("player")}
          className="text-xs flex items-center gap-1"
          style={{ color: P.textMuted }}
        >
          <X size={14} /> Exit
        </button>
      </div>

      <div className="max-w-3xl mx-auto w-full mb-6">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: P.textMuted }}>
          <span>
            Question {qIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <span>{Math.round((qIndex / QUIZ_QUESTIONS.length) * 100)}% complete</span>
        </div>
        <PBar value={(qIndex / QUIZ_QUESTIONS.length) * 100} color={P.olive} height={6} />
        <div className="flex gap-1.5 mt-2">
          {QUIZ_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full"
              style={{ background: i < qIndex ? P.olive : i === qIndex ? P.sage : P.lightSage }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-3xl mx-auto w-full">
        <div
          className="bg-white rounded-2xl border p-7 mb-4 shadow-sm"
          style={{ borderColor: P.border }}
        >
          <p
            className="text-base font-semibold leading-relaxed mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {q.q}
          </p>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                style={
                  selected === i
                    ? { borderColor: P.olive, background: P.lightSage }
                    : { borderColor: P.border }
                }
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={
                    selected === i
                      ? { background: P.olive, color: "white" }
                      : { background: P.lightSage, color: P.textMid }
                  }
                >
                  {["A", "B", "C", "D"][i]}
                </div>
                <p className="text-sm" style={{ color: P.textMid }}>
                  {opt}
                </p>
              </button>
            ))}
          </div>
        </div>
        {showHint && (
          <AICard title="AI Hint (–5 XP)">
            <p className="text-xs leading-relaxed" style={{ color: "#7A5A10" }}>
              Think about what differentiates supervised from unsupervised learning — the presence
              or absence of <strong>labeled training examples</strong> is the key distinguishing
              factor here.
            </p>
          </AICard>
        )}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => setShowHint(true)}
            disabled={showHint}
            className="flex items-center gap-1.5 text-xs font-medium disabled:opacity-40"
            style={{ color: P.gold }}
          >
            <Sparkles size={13} /> AI Hint (–5 XP)
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setQIndex(Math.max(0, qIndex - 1));
                setSelected(answers[Math.max(0, qIndex - 1)]);
              }}
              disabled={qIndex === 0}
              className="px-4 py-2 rounded-lg text-sm disabled:opacity-40"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={selected === null}
              className="px-6 py-2 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
              style={{ background: P.olive }}
            >
              {qIndex < QUIZ_QUESTIONS.length - 1 ? "Next →" : "Submit Quiz"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7. CERTIFICATES ──────────────────────────────────────────
