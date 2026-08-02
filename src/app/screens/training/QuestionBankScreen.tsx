import React, { useState } from "react";
import {
  AICard,
  ASSIGNMENTS,
  ASSIGNMENT_COURSES,
  ASSIGNMENT_EXPECTED_SUBMISSIONS,
  ASSIGNMENT_TYPE_LABELS,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Bar,
  BarChart2,
  BookOpen,
  Building,
  CALENDAR_EVENTS,
  Calendar,
  CartesianGrid,
  Cell,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Chip,
  Clock,
  Copy,
  Cpu,
  DEFAULT_QUESTION_TYPE_CONFIG,
  Download,
  EFFECTIVENESS_DATA,
  EFFECTIVENESS_TREND,
  EMPTY_ASSIGNMENT_DRAFT,
  EMPTY_SURVEY_DRAFT,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  LIVE_SESSIONS,
  Layers,
  Line,
  LineChart,
  Link,
  Lock,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAM_TYPES,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  PRESET_QUESTION_TYPES,
  QUESTION_BANK,
  QUESTION_TYPE_OPTIONS,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SURVEYS,
  SURVEY_COURSES,
  SURVEY_QUESTION_SETS,
  SURVEY_TOTALS_BY_COURSE,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Star,
  StatCard,
  Target,
  ThumbsDown,
  ThumbsUp,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  X,
  XAxis,
  YAxis,
  Zap,
  canAddQuestionBankCustomTypes,
  formatAssignmentDueDate,
  getConfiguredQuestionBankTypes,
  getSurveyQuestionSet,
  questionTypeLabel,
  questionTypeVariant,
} from "./training.shared";
import type {
  Assignment,
  AssignmentDraft,
  AssignmentStatus,
  AssignmentSubmission,
  AssignmentSubmissionType,
  QuestionBankQuestion,
  QuestionBankType,
  QuestionTypeConfig,
  QuestionTypeOption,
  Survey,
  SurveyDraft,
  SurveyQuestion,
  SurveyQuestionSet,
  SurveyQuestionType,
  SurveySubmission,
} from "./training.shared";

function AddQuestionModal({
  topics,
  questionTypes,
  allowCustomTypes,
  onAdd,
  onAddQuestionType,
  onClose,
}: {
  topics: string[];
  questionTypes: QuestionTypeOption[];
  allowCustomTypes: boolean;
  onAdd: (question: QuestionBankQuestion) => void;
  onAddQuestionType: (option: QuestionTypeOption) => void;
  onClose: () => void;
}) {
  const topicOptions = topics.filter((item) => item !== "All");
  const [type, setType] = useState<QuestionBankType>(questionTypes[0]?.type ?? "MCQ");
  const [text, setText] = useState("");
  const [topic, setTopic] = useState(topicOptions[0] ?? "AI & ML");
  const [difficulty, setDifficulty] = useState<QuestionBankQuestion["difficulty"]>("Medium");
  const [weight, setWeight] = useState(1);
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [correctChoice, setCorrectChoice] = useState(0);
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<"True" | "False">("True");
  const [shortAnswer, setShortAnswer] = useState("");
  const [blankAnswer, setBlankAnswer] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeHint, setNewTypeHint] = useState("");
  const [typeNotice, setTypeNotice] = useState("");
  const [matchingPairs, setMatchingPairs] = useState([
    { left: "", right: "" },
    { left: "", right: "" },
    { left: "", right: "" },
  ]);
  const [orderingSteps, setOrderingSteps] = useState(["", "", "", ""]);

  const updateChoice = (index: number, value: string) => {
    setChoices((current) => current.map((choice, i) => (i === index ? value : choice)));
  };

  const updateMatchingPair = (index: number, key: "left" | "right", value: string) => {
    setMatchingPairs((current) =>
      current.map((pair, i) => (i === index ? { ...pair, [key]: value } : pair)),
    );
  };

  const updateOrderingStep = (index: number, value: string) => {
    setOrderingSteps((current) => current.map((step, i) => (i === index ? value : step)));
  };

  const isPresetType = PRESET_QUESTION_TYPES.includes(
    type as (typeof PRESET_QUESTION_TYPES)[number],
  );
  const filledChoices = choices.filter((choice) => choice.trim());
  const filledPairs = matchingPairs.filter((pair) => pair.left.trim() && pair.right.trim());
  const filledSteps = orderingSteps.filter((step) => step.trim());
  const hasAnswerConfig =
    type === "TrueFalse" ||
    (type === "MCQ" && filledChoices.length >= 2 && choices[correctChoice]?.trim()) ||
    (type === "ShortAnswer" && shortAnswer.trim()) ||
    (type === "FillBlank" && blankAnswer.trim()) ||
    (type === "Matching" && filledPairs.length >= 2) ||
    (type === "Ordering" && filledSteps.length >= 2) ||
    (!isPresetType && customAnswer.trim());
  const canSave = questionTypes.length > 0 && text.trim() && hasAnswerConfig;

  const answerSummary = () => {
    if (type === "MCQ") return `Correct: ${choices[correctChoice]}`;
    if (type === "TrueFalse") return `Correct: ${trueFalseAnswer}`;
    if (type === "ShortAnswer") return `Expected answer: ${shortAnswer}`;
    if (type === "FillBlank") return `Blank answer: ${blankAnswer}`;
    if (type === "Matching") return `${filledPairs.length} matching pairs`;
    if (type === "Ordering") return `${filledSteps.length} ordered steps`;
    return `Rubric: ${customAnswer}`;
  };

  const addCustomQuestionType = () => {
    const label = newTypeName.trim();
    if (!label) return;

    const existing = questionTypes.find(
      (option) =>
        option.label.toLowerCase() === label.toLowerCase() ||
        option.type.toLowerCase() === label.toLowerCase(),
    );

    if (existing) {
      setType(existing.type);
      setTypeNotice(`${existing.label} is already available.`);
      setNewTypeName("");
      setNewTypeHint("");
      return;
    }

    const option: QuestionTypeOption = {
      type: label,
      label,
      hint: newTypeHint.trim() || "Custom answer setup with reviewer rubric",
      custom: true,
    };

    onAddQuestionType(option);
    setType(option.type);
    setTypeNotice(`${option.label} question type added.`);
    setNewTypeName("");
    setNewTypeHint("");
  };

  const handleSave = () => {
    if (!canSave) return;
    onAdd({
      id: `q-${Date.now()}`,
      text: text.trim(),
      type,
      topic,
      difficulty,
      weight: Math.max(1, Math.min(5, Number(weight) || 1)),
      usedIn: 0,
      answerSummary: answerSummary(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(46,58,21,0.55)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: P.border }}
        >
          <div>
            <p
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Add Question
            </p>
            <p className="text-xs" style={{ color: P.textMuted }}>
              Choose a question type and configure its answer
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} style={{ color: P.textMuted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
              Question Type
            </label>
            {questionTypes.length ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {questionTypes.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => setType(option.type)}
                    className="text-left rounded-xl p-3 transition-colors"
                    style={
                      type === option.type
                        ? { border: `1px solid ${P.olive}`, background: P.lightSage }
                        : { border: `1px solid ${P.border}`, background: "white" }
                    }
                  >
                    <p className="text-xs font-bold" style={{ color: P.text }}>
                      {option.label}
                      {option.custom && (
                        <span
                          className="ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                          style={{ background: P.goldLight, color: "#8A6A1A" }}
                        >
                          Custom
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] mt-1 leading-relaxed" style={{ color: P.textMuted }}>
                      {option.hint}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div
                className="rounded-xl border p-4 text-sm"
                style={{ borderColor: P.border, background: P.bg, color: P.textMuted }}
              >
                No question types are currently enabled for course creators.
              </div>
            )}
            {allowCustomTypes && (
              <div
                className="mt-3 rounded-xl border p-3"
                style={{ borderColor: P.border, background: P.bg }}
              >
                <p className="text-xs font-semibold mb-2" style={{ color: P.text }}>
                  Add a new question type
                </p>
                <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={newTypeName}
                    onChange={(e) => {
                      setNewTypeName(e.target.value);
                      setTypeNotice("");
                    }}
                    placeholder="e.g. Scenario Analysis"
                    className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <input
                    value={newTypeHint}
                    onChange={(e) => setNewTypeHint(e.target.value)}
                    placeholder="Short hint for this type"
                    className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <button
                    type="button"
                    onClick={addCustomQuestionType}
                    disabled={!newTypeName.trim()}
                    className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{
                      background: newTypeName.trim() ? P.olive : P.sage,
                      opacity: newTypeName.trim() ? 1 : 0.65,
                    }}
                  >
                    Add Type
                  </button>
                </div>
                {typeNotice && (
                  <p className="text-[10px] mt-2" style={{ color: P.textMuted }}>
                    {typeNotice}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Question
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                type === "FillBlank"
                  ? "e.g. The process of training a model on labeled data is called ____."
                  : "Write the question learners will see..."
              }
              className="w-full min-h-[92px] px-3 py-2.5 text-sm rounded-xl bg-white resize-none focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {topicOptions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) =>
                  setDifficulty(e.target.value as QuestionBankQuestion["difficulty"])
                }
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {["Easy", "Medium", "Hard"].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Weight
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          </div>

          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: P.border }}>
            <p className="text-xs font-bold" style={{ color: P.text }}>
              Answer Setup
            </p>

            {type === "MCQ" && (
              <div className="space-y-2">
                {choices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={correctChoice === index}
                      onChange={() => setCorrectChoice(index)}
                      style={{ accentColor: P.olive }}
                    />
                    <input
                      value={choice}
                      onChange={(e) => updateChoice(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                ))}
              </div>
            )}

            {type === "TrueFalse" && (
              <div className="flex gap-2">
                {(["True", "False"] as const).map((answer) => (
                  <button
                    key={answer}
                    onClick={() => setTrueFalseAnswer(answer)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold"
                    style={
                      trueFalseAnswer === answer
                        ? { background: P.olive, color: "white" }
                        : { border: `1px solid ${P.border}`, color: P.textMid, background: "white" }
                    }
                  >
                    {answer}
                  </button>
                ))}
              </div>
            )}

            {type === "ShortAnswer" && (
              <input
                value={shortAnswer}
                onChange={(e) => setShortAnswer(e.target.value)}
                placeholder="Expected answer or scoring rubric"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            )}

            {type === "FillBlank" && (
              <input
                value={blankAnswer}
                onChange={(e) => setBlankAnswer(e.target.value)}
                placeholder="Correct word or phrase for the blank"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            )}

            {type === "Matching" && (
              <div className="space-y-2">
                {matchingPairs.map((pair, index) => (
                  <div key={index} className="grid sm:grid-cols-2 gap-2">
                    <input
                      value={pair.left}
                      onChange={(e) => updateMatchingPair(index, "left", e.target.value)}
                      placeholder={`Term ${index + 1}`}
                      className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    <input
                      value={pair.right}
                      onChange={(e) => updateMatchingPair(index, "right", e.target.value)}
                      placeholder={`Match ${index + 1}`}
                      className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                ))}
              </div>
            )}

            {type === "Ordering" && (
              <div className="space-y-2">
                {orderingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs font-bold w-5" style={{ color: P.textMuted }}>
                      {index + 1}
                    </span>
                    <input
                      value={step}
                      onChange={(e) => updateOrderingStep(index, e.target.value)}
                      placeholder={`Step ${index + 1}`}
                      className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                ))}
              </div>
            )}

            {!isPresetType && (
              <div className="space-y-2">
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Custom question types use a reviewer rubric or expected answer.
                </p>
                <textarea
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  placeholder="Describe the correct answer, scoring rubric, or evaluation notes"
                  className="w-full min-h-[88px] px-3 py-2 text-sm rounded-lg bg-white resize-none focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-6 py-4 flex gap-2" style={{ borderColor: P.border }}>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
            style={{ background: P.olive, opacity: canSave ? 1 : 0.5 }}
          >
            <CheckCircle size={14} /> Save Question
          </button>
        </div>
      </div>
    </div>
  );
}

export function QuestionBankScreen({
  navigate,
  questionTypes: questionTypeConfig = DEFAULT_QUESTION_TYPE_CONFIG,
}: {
  navigate: (s: string) => void;
  questionTypes?: QuestionTypeConfig[];
}) {
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [questions, setQuestions] = useState<QuestionBankQuestion[]>(QUESTION_BANK);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [customQuestionTypes, setCustomQuestionTypes] = useState<QuestionTypeOption[]>([]);
  const questionTypes = getConfiguredQuestionBankTypes(
    [...QUESTION_TYPE_OPTIONS, ...customQuestionTypes],
    questionTypeConfig,
  );
  const allowCustomQuestionTypes = canAddQuestionBankCustomTypes(questionTypeConfig);

  const topics = ["All", "AI & ML", "Data Science", "Compliance", "Leadership", "Finance"];
  const filtered = questions.filter(
    (q) =>
      (topic === "All" || q.topic === topic) &&
      (difficulty === "All" || q.difficulty === difficulty) &&
      (search === "" || q.text.toLowerCase().includes(search.toLowerCase())),
  );
  const addedThisSession = questions.length - QUESTION_BANK.length;
  const totalQuestionCount = 117 + questions.length;
  const topicsCovered = Math.max(8, new Set(questions.map((q) => q.topic)).size);
  const mostUsed = [...questions].sort((a, b) => b.usedIn - a.usedIn)[0]?.topic ?? "Compliance";

  const addQuestion = (question: QuestionBankQuestion) => {
    setQuestions((current) => [question, ...current]);
    setSearch("");
    setTopic("All");
    setDifficulty("All");
  };

  const addQuestionType = (option: QuestionTypeOption) => {
    setCustomQuestionTypes((current) =>
      current.some((item) => item.type.toLowerCase() === option.type.toLowerCase())
        ? current
        : [...current, option],
    );
  };

  const copyQuestion = (question: QuestionBankQuestion) => {
    setQuestions((current) => [
      {
        ...question,
        id: `${question.id}-copy-${Date.now()}`,
        text: `${question.text} (Copy)`,
        usedIn: 0,
      },
      ...current,
    ]);
  };

  const deleteQuestion = (id: string) => {
    setQuestions((current) => current.filter((question) => question.id !== id));
  };

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Question Bank"
        sub="Reusable question library for quiz and assessment building"
        actions={
          <button
            onClick={() => setShowAddQuestion(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> Add Question
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Questions"
          value={totalQuestionCount.toString()}
          sub={addedThisSession > 0 ? `${addedThisSession} added this session` : "+12 this month"}
          icon={HelpCircle}
          color={P.olive}
          bg={P.lightSage}
          trend="up"
        />
        <StatCard
          label="Topics Covered"
          value={topicsCovered.toString()}
          icon={BookOpen}
          color={P.gold}
          bg={P.goldLight}
        />
        <StatCard
          label="Avg. Difficulty"
          value="Medium"
          icon={Target}
          color={P.darkOlive}
          bg={P.lightSage}
        />
        <StatCard label="Most Used" value={mostUsed} icon={Star} color="#5A7A2A" bg="#D8EDCC" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: P.sage }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none bg-white"
            style={{ border: `1px solid ${P.border}`, color: P.text, width: 220 }}
          />
        </div>
        <div className="flex gap-1.5">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={
                topic === t
                  ? { background: P.olive, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {["All", "Easy", "Medium", "Hard"].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={
                difficulty === d
                  ? { background: P.text, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Question
              </th>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Type
              </th>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Topic
              </th>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Difficulty
              </th>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Weight
              </th>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Used In
              </th>
              <th
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((q) => (
              <tr
                key={q.id}
                className="hover:bg-[#F6FEFA] transition-colors"
                style={{ borderBottom: `1px solid ${P.border}50` }}
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-medium" style={{ color: P.text }}>
                    {q.text}
                  </p>
                  {q.answerSummary && (
                    <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                      {q.answerSummary}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Chip
                    label={questionTypeLabel(q.type, questionTypes)}
                    variant={questionTypeVariant(q.type)}
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {q.topic}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <Chip
                    label={q.difficulty}
                    variant={
                      q.difficulty === "Easy" ? "green" : q.difficulty === "Medium" ? "gold" : "red"
                    }
                  />
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono" style={{ color: P.textMid }}>
                    {q.weight}x
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {q.usedIn} quizzes
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1.5">
                    <button
                      className="p-1.5 rounded hover:bg-[#ECFDF5]"
                      data-prototype-action="true"
                    >
                      <Edit size={12} style={{ color: P.sage }} />
                    </button>
                    <button
                      onClick={() => copyQuestion(q)}
                      className="p-1.5 rounded hover:bg-[#ECFDF5]"
                    >
                      <Copy size={12} style={{ color: P.sage }} />
                    </button>
                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 rounded hover:bg-red-50"
                    >
                      <Trash2 size={12} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddQuestion && (
        <AddQuestionModal
          topics={topics}
          questionTypes={questionTypes}
          allowCustomTypes={allowCustomQuestionTypes}
          onAdd={addQuestion}
          onAddQuestionType={addQuestionType}
          onClose={() => setShowAddQuestion(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. PROGRAM OVERVIEW DASHBOARD (HR)
// ─────────────────────────────────────────────────────────────
