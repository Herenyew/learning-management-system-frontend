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

import {
  getQuestionTypeMeta,
  isBuiltInQuestionType,
  type QType,
  type QuestionTypeOption,
  type QuizQuestion,
} from "./quiz.shared";

export function QuestionEditor({
  q,
  questionTypes,
  onSave,
  onClose,
}: {
  q: Partial<QuizQuestion> & { type: QType };
  questionTypes: QuestionTypeOption[];
  onSave: (q: QuizQuestion) => void;
  onClose: () => void;
}) {
  const typeMeta = getQuestionTypeMeta(questionTypes, q.type);
  const isCustomType = !isBuiltInQuestionType(q.type);
  const defaultCorrect =
    q.type === "ShortAnswer" || q.type === "FillBlank" || q.type === "Essay" || isCustomType
      ? ""
      : q.type === "MultiSelect"
        ? []
        : 0;
  const [text, setText] = useState(q.text || "");
  const [options, setOptions] = useState<string[]>(
    q.options?.length ? q.options : ["", "", "", ""],
  );
  const [correct, setCorrect] = useState<number | number[] | string>(q.correct ?? defaultCorrect);
  const [pairs, setPairs] = useState<{ left: string; right: string }[]>(
    q.pairs?.length
      ? q.pairs
      : [
          { left: "", right: "" },
          { left: "", right: "" },
        ],
  );
  const [weight, setWeight] = useState(q.weight ?? 1);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    q.difficulty ?? "Medium",
  );
  const [explanation, setExplanation] = useState(q.explanation || "");

  const addOption = () => setOptions((p) => [...p, ""]);
  const removeOption = (i: number) => setOptions((p) => p.filter((_, j) => j !== i));
  const updateOption = (i: number, v: string) =>
    setOptions((p) => p.map((o, j) => (j === i ? v : o)));
  const toggleMultiCorrect = (i: number) => {
    const arr = Array.isArray(correct) ? correct : [];
    setCorrect(arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i]);
  };
  const addPair = () => setPairs((p) => [...p, { left: "", right: "" }]);
  const updatePair = (i: number, k: "left" | "right", v: string) =>
    setPairs((p) => p.map((pair, j) => (j === i ? { ...pair, [k]: v } : pair)));

  const handleSave = () => {
    onSave({
      id: q.id || `q${Date.now()}`,
      type: q.type,
      text,
      options,
      correct,
      pairs,
      weight,
      difficulty,
      explanation,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(46,58,21,0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between z-10"
          style={{ borderColor: P.border }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: `${typeMeta.color}15` }}
            >
              <typeMeta.icon size={14} style={{ color: typeMeta.color }} />
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: P.textMuted }}
              >
                {typeMeta.label}
              </p>
              <p className="text-sm font-bold" style={{ color: P.text }}>
                {q.id ? "Edit Question" : "New Question"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} style={{ color: P.textMuted }} />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {/* Question text */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Question Text <span style={{ color: "#C0392B" }}>*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Enter your question here…"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none focus:ring-2 resize-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>

          {/* MCQ */}
          {q.type === "MCQ" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Answer Options
                </label>
                <button
                  onClick={addOption}
                  className="text-[11px] font-semibold flex items-center gap-1"
                  style={{ color: P.olive }}
                >
                  <Plus size={11} /> Add Option
                </button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct"
                      checked={correct === i}
                      onChange={() => setCorrect(i)}
                      style={{ accentColor: P.olive, flexShrink: 0 }}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{
                        border: `1px solid ${correct === i ? P.olive : P.border}`,
                        color: P.text,
                      }}
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        className="p-1.5 rounded hover:bg-red-50"
                      >
                        <Trash2 size={11} style={{ color: "#C0392B" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: P.textMuted }}>
                Select the radio button next to the correct answer
              </p>
            </div>
          )}

          {/* True/False */}
          {q.type === "TrueFalse" && (
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Correct Answer
              </label>
              <div className="flex gap-3">
                {["True", "False"].map((opt, i) => (
                  <button
                    key={opt}
                    onClick={() => setCorrect(i)}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all"
                    style={{
                      borderColor: correct === i ? P.olive : P.border,
                      background: correct === i ? P.paleGreen : "white",
                      color: correct === i ? P.darkOlive : P.textMid,
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Select */}
          {q.type === "MultiSelect" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Answer Options (check all correct)
                </label>
                <button
                  onClick={addOption}
                  className="text-[11px] font-semibold flex items-center gap-1"
                  style={{ color: P.olive }}
                >
                  <Plus size={11} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Array.isArray(correct) && correct.includes(i)}
                      onChange={() => toggleMultiCorrect(i)}
                      style={{ accentColor: P.olive, flexShrink: 0 }}
                    />
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{
                        border: `1px solid ${Array.isArray(correct) && correct.includes(i) ? P.olive : P.border}`,
                        color: P.text,
                      }}
                    />
                    {options.length > 2 && (
                      <button onClick={() => removeOption(i)}>
                        <Trash2 size={11} style={{ color: "#C0392B" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Short Answer */}
          {q.type === "ShortAnswer" && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Sample Answer / Keywords
              </label>
              <textarea
                value={typeof correct === "string" ? correct : ""}
                onChange={(e) => setCorrect(e.target.value)}
                rows={2}
                placeholder="Accepted keywords or model answer for auto-grading…"
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none resize-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          )}

          {/* Essay */}
          {q.type === "Essay" && (
            <div className="space-y-3">
              <div
                className="p-3.5 rounded-xl"
                style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
              >
                <p className="text-[11px]" style={{ color: "#8A6A1A" }}>
                  Essay questions are manually graded by instructors. Add a rubric or expected
                  answer outline below.
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Grading Rubric / Expected Answer
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what a full-mark answer looks like…"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none resize-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            </div>
          )}

          {isCustomType && (
            <div className="space-y-3">
              <div
                className="p-3.5 rounded-xl"
                style={{ background: P.lightSage, border: `1px solid ${P.sage}50` }}
              >
                <p className="text-[11px]" style={{ color: P.darkOlive }}>
                  {typeMeta.responseMode === "shortText" &&
                    "This custom type expects a short model answer or keywords."}
                  {typeMeta.responseMode === "longText" &&
                    "This custom type expects a long-form learner response reviewed by an instructor."}
                  {typeMeta.responseMode === "fileEvidence" &&
                    "This custom type can represent a file, evidence, or attachment-based review."}
                  {(!typeMeta.responseMode || typeMeta.responseMode === "rubric") &&
                    "This custom type is graded using a reviewer rubric or expected answer."}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Rubric / Expected Answer
                </label>
                <textarea
                  value={typeof correct === "string" ? correct : ""}
                  onChange={(e) => setCorrect(e.target.value)}
                  rows={typeMeta.responseMode === "shortText" ? 2 : 4}
                  placeholder="Describe the correct answer, rubric, or evidence required..."
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none resize-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            </div>
          )}

          {/* Matching */}
          {q.type === "Matching" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Matching Pairs
                </label>
                <button
                  onClick={addPair}
                  className="text-[11px] font-semibold flex items-center gap-1"
                  style={{ color: P.olive }}
                >
                  <Plus size={11} /> Add Pair
                </button>
              </div>
              <div className="space-y-2">
                {pairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={pair.left}
                      onChange={(e) => updatePair(i, "left", e.target.value)}
                      placeholder="Left item"
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    <span style={{ color: P.sage }}>↔</span>
                    <input
                      value={pair.right}
                      onChange={(e) => updatePair(i, "right", e.target.value)}
                      placeholder="Right item"
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    {pairs.length > 1 && (
                      <button onClick={() => setPairs((p) => p.filter((_, j) => j !== i))}>
                        <Trash2 size={11} style={{ color: "#C0392B" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ordering / DragDrop */}
          {(q.type === "Ordering" || q.type === "DragDrop") && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Items (in correct order)
                </label>
                <button
                  onClick={addOption}
                  className="text-[11px] font-semibold flex items-center gap-1"
                  style={{ color: P.olive }}
                >
                  <Plus size={11} /> Add Item
                </button>
              </div>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: P.olive }}
                    >
                      {i + 1}
                    </div>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Item ${i + 1}`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    {options.length > 2 && (
                      <button onClick={() => removeOption(i)}>
                        <Trash2 size={11} style={{ color: "#C0392B" }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fill in the Blank */}
          {q.type === "FillBlank" && (
            <div>
              <div className="p-3 rounded-xl mb-3" style={{ background: P.lightSage }}>
                <p className="text-[11px]" style={{ color: P.darkOlive }}>
                  Use <strong>[blank]</strong> to mark where the answer goes. E.g.: "The capital of
                  France is [blank]."
                </p>
              </div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Correct Answer(s) for Blanks
              </label>
              <input
                value={typeof correct === "string" ? correct : ""}
                onChange={(e) => setCorrect(e.target.value)}
                placeholder="e.g. Paris (or comma-separate multiple blanks)"
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          )}

          {/* Metadata row */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label
                className="block text-[10px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: P.textMuted }}
              >
                Difficulty
              </label>
              <div className="flex gap-1">
                {(["Easy", "Medium", "Hard"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold border transition-all"
                    style={{
                      borderColor: difficulty === d ? P.olive : P.border,
                      background:
                        difficulty === d
                          ? d === "Easy"
                            ? "#D8EDCC"
                            : d === "Medium"
                              ? P.goldLight
                              : "#FEE2E2"
                          : "white",
                      color:
                        difficulty === d
                          ? d === "Easy"
                            ? "#3A6420"
                            : d === "Medium"
                              ? "#8A6A1A"
                              : "#B91C1C"
                          : P.textMuted,
                    }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                className="block text-[10px] font-semibold uppercase tracking-wide mb-1.5"
                style={{ color: P.textMuted }}
              >
                Point Weight
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min={0.5}
                step={0.5}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Explanation (shown after answer)
            </label>
            <input
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Why is this the correct answer?"
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
        </div>

        <div
          className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-2"
          style={{ borderColor: P.border }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
            style={{ background: P.olive, opacity: text.trim() ? 1 : 0.5 }}
          >
            <CheckCircle size={14} /> Save Question
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Question Bank Modal ───────────────────────────────────────
