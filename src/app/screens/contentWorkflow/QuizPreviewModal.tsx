import React from "react";
import { CheckCircle, HelpCircle, X } from "lucide-react";
import { P } from "./contentWorkflow.shared";
import type { SavedContentItem } from "./ContentWorkflowModal";

export function QuizPreviewModal({
  item,
  onClose,
}: {
  item: SavedContentItem;
  onClose: () => void;
}) {
  const qd = item.quizData;
  const questions = qd?.questions || [];
  const settings = qd?.settings;
  const passScore = qd?.passScore ?? 70;
  const [currentQ, setCurrentQ] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, number | number[] | string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const q = questions[currentQ];
  const total = questions.length;
  const setAnswer = (val: number | number[] | string) =>
    setAnswers((p) => ({ ...p, [currentQ]: val }));
  const toggleMulti = (i: number) => {
    const cur = (answers[currentQ] as number[]) || ([] as number[]);
    setAnswer(cur.includes(i) ? cur.filter((x: number) => x !== i) : [...cur, i]);
  };
  const isCorrect = (qi: number) => {
    const qq = questions[qi];
    const ans = answers[qi];
    if (qq.type === "MCQ" || qq.type === "TrueFalse") return ans === qq.correct;
    if (qq.type === "MultiSelect") {
      const a = ((ans as number[]) || []).slice().sort().join(",");
      const c = (Array.isArray(qq.correct) ? (qq.correct as number[]) : [])
        .slice()
        .sort()
        .join(",");
      return a === c;
    }
    return false;
  };
  const score = submitted ? questions.filter((_, i) => isCorrect(i)).length : 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = pct >= passScore;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(46,58,21,0.75)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 text-white rounded-t-2xl relative overflow-hidden flex-shrink-0"
          style={{ background: `linear-gradient(135deg,${P.darkOlive},${P.olive})` }}
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)",
              backgroundSize: "10px 10px",
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X size={14} className="text-white" />
          </button>
          <div className="relative">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: "rgba(231,238,220,0.55)" }}
            >
              Quiz Preview
            </p>
            <h3
              className="text-base font-bold mb-2"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              {item.title}
            </h3>
            <div className="flex gap-3 text-xs" style={{ color: "rgba(231,238,220,0.8)" }}>
              <span>
                <strong className="text-white">{total}</strong> Q
              </span>
              <span>
                <strong className="text-white">{passScore}%</strong> Pass
              </span>
              {settings?.timeEnabled && (
                <span>
                  <strong className="text-white">{settings.timeLimitMin}min</strong>
                </span>
              )}
              <span>
                <strong className="text-white">{settings?.maxAttempts ?? 3}</strong> Attempts
              </span>
            </div>
          </div>
        </div>
        {/* Progress */}
        {total > 0 && !submitted && (
          <div
            className="px-5 py-2 flex items-center gap-3 flex-shrink-0"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <div className="flex-1 h-1.5 rounded-full" style={{ background: P.lightSage }}>
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentQ + 1) / total) * 100}%`, background: P.olive }}
              />
            </div>
            <span className="text-[10px] font-mono flex-shrink-0" style={{ color: P.textMuted }}>
              {currentQ + 1} / {total}
            </span>
          </div>
        )}
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {total === 0 ? (
            <div className="py-12 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: P.lightSage }}
              >
                <HelpCircle size={24} style={{ color: P.sage }} />
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
                No questions in this quiz
              </p>
              <p className="text-xs" style={{ color: P.textMuted }}>
                Edit the quiz to add questions.
              </p>
            </div>
          ) : submitted ? (
            <div className="text-center py-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold text-white"
                style={{ background: passed ? P.olive : "#C0392B" }}
              >
                {pct}%
              </div>
              <p className="text-lg font-bold mb-1" style={{ color: passed ? P.olive : "#C0392B" }}>
                {passed ? "Passed! 🎉" : "Not Passed"}
              </p>
              <p className="text-sm mb-4" style={{ color: P.textMuted }}>
                {score} of {total} correct · Pass score: {passScore}%
              </p>
              <div className="space-y-2 text-left">
                {questions.map((qq, qi) => {
                  const ok = isCorrect(qi);
                  return (
                    <div
                      key={qi}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{
                        background: ok ? "#ECFDF5" : "#FEF2F2",
                        border: `1px solid ${ok ? "#A7F3D0" : "#FECACA"}`,
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: ok ? "#059669" : "#C0392B" }}
                      >
                        {ok ? (
                          <CheckCircle size={11} className="text-white" />
                        ) : (
                          <X size={11} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug" style={{ color: P.text }}>
                          {qq.text}
                        </p>
                        {qq.explanation && (
                          <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                            {qq.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : q ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: P.olive }}
                >
                  {currentQ + 1}
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      q.difficulty === "Easy"
                        ? "#D8EDCC"
                        : q.difficulty === "Medium"
                          ? P.goldLight
                          : "#FEE2E2",
                    color:
                      q.difficulty === "Easy"
                        ? "#3A6420"
                        : q.difficulty === "Medium"
                          ? "#8A6A1A"
                          : "#B91C1C",
                  }}
                >
                  {q.difficulty}
                </span>
              </div>
              <p className="text-sm font-semibold leading-relaxed mb-4" style={{ color: P.text }}>
                {q.text}
              </p>
              {q.type === "MCQ" &&
                q.options.filter(Boolean).map((opt, oi) => (
                  <label
                    key={oi}
                    onClick={() => setAnswer(oi)}
                    className="flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all"
                    style={{
                      border: `2px solid ${answers[currentQ] === oi ? P.olive : P.border}`,
                      background: answers[currentQ] === oi ? P.paleGreen : "white",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: answers[currentQ] === oi ? P.olive : P.border }}
                    >
                      {answers[currentQ] === oi && (
                        <div className="w-2 h-2 rounded-full" style={{ background: P.olive }} />
                      )}
                    </div>
                    <span className="text-sm" style={{ color: P.text }}>
                      {opt}
                    </span>
                  </label>
                ))}
              {q.type === "TrueFalse" &&
                ["True", "False"].map((opt, oi) => (
                  <label
                    key={oi}
                    onClick={() => setAnswer(oi)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl mb-2 cursor-pointer transition-all"
                    style={{
                      border: `2px solid ${answers[currentQ] === oi ? P.olive : P.border}`,
                      background: answers[currentQ] === oi ? P.paleGreen : "white",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: answers[currentQ] === oi ? P.olive : P.border }}
                    >
                      {answers[currentQ] === oi && (
                        <div className="w-2 h-2 rounded-full" style={{ background: P.olive }} />
                      )}
                    </div>
                    <span className="text-sm font-medium" style={{ color: P.text }}>
                      {opt}
                    </span>
                  </label>
                ))}
              {q.type === "MultiSelect" &&
                q.options.filter(Boolean).map((opt, oi) => {
                  const sel = ((answers[currentQ] as number[]) || []).includes(oi);
                  return (
                    <label
                      key={oi}
                      onClick={() => toggleMulti(oi)}
                      className="flex items-center gap-3 p-3 rounded-xl mb-2 cursor-pointer transition-all"
                      style={{
                        border: `2px solid ${sel ? P.olive : P.border}`,
                        background: sel ? P.paleGreen : "white",
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          background: sel ? P.olive : "white",
                          border: `2px solid ${sel ? P.olive : P.border}`,
                        }}
                      >
                        {sel && <CheckCircle size={10} className="text-white" />}
                      </div>
                      <span className="text-sm" style={{ color: P.text }}>
                        {opt}
                      </span>
                    </label>
                  );
                })}
              {(q.type === "ShortAnswer" || q.type === "Essay") && (
                <textarea
                  rows={q.type === "Essay" ? 5 : 2}
                  value={(answers[currentQ] as string) || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your answer here…"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl resize-none bg-white focus:outline-none focus:ring-2"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              )}
              {q.type === "FillBlank" && (
                <input
                  value={(answers[currentQ] as string) || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Fill in the blank…"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-white focus:outline-none focus:ring-2"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              )}
              {q.type === "Matching" && q.pairs && (
                <div className="space-y-2">
                  {q.pairs.map((pair, pi) => (
                    <div
                      key={pi}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: P.bg, border: `1px solid ${P.border}` }}
                    >
                      <span className="flex-1 text-xs font-medium" style={{ color: P.text }}>
                        {pair.left}
                      </span>
                      <span style={{ color: P.sage }}>↔</span>
                      <span className="flex-1 text-xs" style={{ color: P.textMuted }}>
                        {pair.right}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
        {/* Footer */}
        <div
          className="px-5 py-3.5 flex gap-2 flex-shrink-0"
          style={{ borderTop: `1px solid ${P.border}`, background: P.bg }}
        >
          {total === 0 || submitted ? (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: P.olive }}
            >
              Close Preview
            </button>
          ) : (
            <>
              <button
                onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                className="px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                ← Prev
              </button>
              {currentQ < total - 1 ? (
                <button
                  onClick={() => setCurrentQ((q) => q + 1)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: P.olive }}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setSubmitted(true)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: P.olive }}
                >
                  Submit Quiz
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Standalone quiz-only modal (used from module "Add Quiz" button) ──
