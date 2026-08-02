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

export function SurveysScreen({ navigate }: { navigate: (s: string) => void }) {
  const [surveys, setSurveys] = useState<Survey[]>(SURVEYS);
  const [showSurveyCreator, setShowSurveyCreator] = useState(false);
  const [surveyDraft, setSurveyDraft] = useState<SurveyDraft>(EMPTY_SURVEY_DRAFT);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  const selectedSurvey = surveys.find((survey) => survey.id === selectedSurveyId) ?? null;
  const activeSurveys = surveys.filter((survey) => survey.status === "Active");
  const totalResponses = surveys.reduce((sum, survey) => sum + survey.responses, 0);
  const totalExpected = surveys.reduce((sum, survey) => sum + survey.total, 0);
  const averageScore =
    surveys.length > 0
      ? surveys.reduce((sum, survey) => sum + survey.avgScore, 0) / surveys.length
      : 0;
  const selectedDraftQuestionSet = getSurveyQuestionSet(surveyDraft.questionSetId);

  const openSurveyCreator = () => {
    setSurveyDraft({ ...EMPTY_SURVEY_DRAFT });
    setShowSurveyCreator(true);
  };

  const createSurvey = () => {
    if (!surveyDraft.title.trim()) return;

    const questionSet = getSurveyQuestionSet(surveyDraft.questionSetId);

    setSurveys((current) => [
      {
        id: `survey-${Date.now()}`,
        title: surveyDraft.title.trim(),
        course: surveyDraft.course,
        type: questionSet.type,
        responses: 0,
        total: SURVEY_TOTALS_BY_COURSE[surveyDraft.course] ?? 0,
        avgScore: 0,
        status: "Active",
        daysPost: questionSet.type.includes("L3") ? 45 : undefined,
        anonymous: surveyDraft.anonymous,
        questionSet,
        submissions: [],
      },
      ...current,
    ]);

    setShowSurveyCreator(false);
    setSurveyDraft({ ...EMPTY_SURVEY_DRAFT });
  };

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Surveys & Feedback"
        sub="Kirkpatrick L1 reaction surveys, L3 manager behavior surveys, and course feedback"
        actions={
          <button
            onClick={openSurveyCreator}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> Create Survey
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Active Surveys"
          value={String(activeSurveys.length)}
          icon={MessageSquare}
          color={P.olive}
          bg={P.lightSage}
        />
        <StatCard
          label="Total Responses"
          value={String(totalResponses)}
          sub={`${totalExpected > 0 ? Math.round((totalResponses / totalExpected) * 100) : 0}% response rate`}
          icon={Users}
          color="#5A7A2A"
          bg="#D8EDCC"
          trend="up"
        />
        <StatCard
          label="Avg. Satisfaction"
          value={`${averageScore.toFixed(1)}/5`}
          icon={Star}
          color={P.gold}
          bg={P.goldLight}
        />
      </div>

      <div className="space-y-3">
        {surveys.map((sv) => (
          <div
            key={sv.id}
            className="bg-white rounded-xl border p-5"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: sv.type.includes("L1")
                    ? P.lightSage
                    : sv.type.includes("L2")
                      ? P.goldLight
                      : "#D8EDCC",
                }}
              >
                <MessageSquare
                  size={18}
                  style={{
                    color: sv.type.includes("L1")
                      ? P.olive
                      : sv.type.includes("L2")
                        ? P.gold
                        : "#5A7A2A",
                  }}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {sv.title}
                  </p>
                  <Chip
                    label={sv.type}
                    variant={
                      sv.type.includes("L1") ? "sage" : sv.type.includes("L2") ? "gold" : "green"
                    }
                  />
                  <Chip label={sv.status} variant={sv.status === "Active" ? "sage" : "neutral"} />
                  <Chip label={sv.anonymous ? "Anonymous" : "Identified"} variant="neutral" />
                </div>
                <p className="text-xs mb-3" style={{ color: P.textMuted }}>
                  Course: {sv.course} -{" "}
                  {sv.daysPost ? `Sent ${sv.daysPost} days post-completion` : sv.questionSet.timing}
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-32">
                      <div
                        className="flex justify-between text-[10px] mb-1"
                        style={{ color: P.textMuted }}
                      >
                        <span>Response Rate</span>
                        <span>
                          {sv.responses}/{sv.total}
                        </span>
                      </div>
                      <PBar
                        value={sv.total > 0 ? (sv.responses / sv.total) * 100 : 0}
                        color={P.olive}
                        height={4}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i <= Math.round(sv.avgScore)
                            ? "text-amber-500 fill-amber-500"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                    <span className="text-xs font-semibold ml-1" style={{ color: P.text }}>
                      {sv.avgScore}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedSurveyId(sv.id)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: P.lightSage, color: P.olive }}
                >
                  View Submissions
                </button>
                <button
                  className="p-2 rounded-lg"
                  style={{ border: `1px solid ${P.border}` }}
                  data-prototype-action="true"
                >
                  <Download size={13} style={{ color: P.textMuted }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Survey builder preview */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
          Survey Builder - Post-Course Reaction (L1)
        </p>
        <div className="space-y-4 max-w-2xl">
          {[
            { q: "How satisfied are you with the overall course quality?", type: "Rating" },
            {
              q: "The course content was relevant to my role and responsibilities.",
              type: "Likert",
            },
            { q: "What did you find most valuable about this course?", type: "Text" },
            { q: "Would you recommend this course to a colleague?", type: "NPS" },
          ].map(({ q, type }, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: P.olive }}
              >
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium" style={{ color: P.text }}>
                  {q}
                </p>
                <Chip label={type} variant="neutral" />
              </div>
              <div className="flex gap-1.5">
                <button className="p-1.5 rounded" data-prototype-action="true">
                  <Edit size={11} style={{ color: P.sage }} />
                </button>
                <button className="p-1.5 rounded" data-prototype-action="true">
                  <Trash2 size={11} style={{ color: "#C0392B" }} />
                </button>
              </div>
            </div>
          ))}
          <button
            className="flex items-center gap-1.5 text-xs font-medium"
            style={{ color: P.olive }}
            data-prototype-action="true"
          >
            <Plus size={12} /> Add Question
          </button>
        </div>
      </div>
      {showSurveyCreator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.72)" }}
          onClick={() => setShowSurveyCreator(false)}
        >
          <div
            className="bg-white rounded-2xl border w-full max-w-3xl max-h-[88vh] overflow-y-auto"
            style={{ borderColor: P.border }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 p-5 border-b"
              style={{ borderColor: P.border }}
            >
              <div>
                <h3 className="text-base font-bold" style={{ color: P.text }}>
                  Create Survey
                </h3>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  Choose a question set and decide whether responses are anonymous.
                </p>
              </div>
              <button
                onClick={() => setShowSurveyCreator(false)}
                className="p-2 rounded-lg"
                style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                aria-label="Close survey creator"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Survey Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={surveyDraft.title}
                  onChange={(event) =>
                    setSurveyDraft((current) => ({ ...current, title: event.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  placeholder="e.g. AI & ML Post-Course Feedback"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Course
                  </label>
                  <select
                    value={surveyDraft.course}
                    onChange={(event) =>
                      setSurveyDraft((current) => ({ ...current, course: event.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {SURVEY_COURSES.map((course) => (
                      <option key={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Question Set
                  </label>
                  <select
                    value={surveyDraft.questionSetId}
                    onChange={(event) =>
                      setSurveyDraft((current) => ({
                        ...current,
                        questionSetId: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {SURVEY_QUESTION_SETS.map((set) => (
                      <option key={set.id} value={set.id}>
                        {set.name} - {set.type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label
                className="flex items-center justify-between gap-4 p-3 rounded-xl cursor-pointer"
                style={{ background: P.bg }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    Anonymous Responses
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    Hide learner identity in exported and on-screen survey results.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={surveyDraft.anonymous}
                  onChange={(event) =>
                    setSurveyDraft((current) => ({
                      ...current,
                      anonymous: event.target.checked,
                    }))
                  }
                  style={{ accentColor: P.olive, width: 18, height: 18 }}
                />
              </label>

              <div className="rounded-xl border p-4" style={{ borderColor: P.border }}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {selectedDraftQuestionSet.name}
                  </p>
                  <Chip label={selectedDraftQuestionSet.type} variant="sage" />
                  <Chip label={selectedDraftQuestionSet.timing} variant="neutral" />
                </div>
                <div className="space-y-2">
                  {selectedDraftQuestionSet.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ background: P.bg }}
                    >
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                        style={{ background: P.olive }}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: P.text }}>
                          {question.prompt}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Chip label={question.type} variant="neutral" />
                          {question.required && <Chip label="Required" variant="gold" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 p-5 pt-0">
              <button
                onClick={() => setShowSurveyCreator(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={createSurvey}
                disabled={!surveyDraft.title.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed"
                style={{ background: surveyDraft.title.trim() ? P.olive : P.sage }}
              >
                Create Survey
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedSurvey && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.72)" }}
          onClick={() => setSelectedSurveyId(null)}
        >
          <div
            className="bg-white rounded-2xl border w-full max-w-4xl max-h-[88vh] overflow-y-auto"
            style={{ borderColor: P.border }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 p-5 border-b"
              style={{ borderColor: P.border }}
            >
              <div>
                <h3 className="text-base font-bold" style={{ color: P.text }}>
                  {selectedSurvey.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  {selectedSurvey.course} - {selectedSurvey.questionSet.timing}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Chip label={selectedSurvey.type} variant="sage" />
                  <Chip
                    label={selectedSurvey.anonymous ? "Anonymous" : "Identified"}
                    variant="neutral"
                  />
                  <Chip label={selectedSurvey.status} variant="green" />
                </div>
              </div>
              <button
                onClick={() => setSelectedSurveyId(null)}
                className="p-2 rounded-lg"
                style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                aria-label="Close survey submissions"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Responses"
                  value={String(selectedSurvey.responses)}
                  sub={`Of ${selectedSurvey.total} expected`}
                  icon={Users}
                  color={P.olive}
                  bg={P.lightSage}
                />
                <StatCard
                  label="Response Rate"
                  value={`${selectedSurvey.total > 0 ? Math.round((selectedSurvey.responses / selectedSurvey.total) * 100) : 0}%`}
                  icon={TrendingUp}
                  color="#5A7A2A"
                  bg="#D8EDCC"
                />
                <StatCard
                  label="Avg. Score"
                  value={`${selectedSurvey.avgScore.toFixed(1)}/5`}
                  icon={Star}
                  color={P.gold}
                  bg={P.goldLight}
                />
                <StatCard
                  label="Identity"
                  value={selectedSurvey.anonymous ? "Hidden" : "Visible"}
                  icon={Lock}
                  color={P.darkOlive}
                  bg={P.paleGreen}
                />
              </div>

              <div className="rounded-xl border p-4" style={{ borderColor: P.border }}>
                <p className="text-sm font-bold mb-3" style={{ color: P.text }}>
                  Survey Content - {selectedSurvey.questionSet.name}
                </p>
                <div className="space-y-3">
                  {selectedSurvey.questionSet.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="grid grid-cols-1 lg:grid-cols-[1fr_180px] gap-3 p-3 rounded-xl"
                      style={{ background: P.bg }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ background: P.olive }}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: P.text }}>
                            {question.prompt}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Chip label={question.type} variant="neutral" />
                            {question.required && <Chip label="Required" variant="gold" />}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs lg:text-right" style={{ color: P.textMuted }}>
                        {question.type === "Text"
                          ? `${Math.max(0, Math.round(selectedSurvey.responses * 0.38))} written comments`
                          : `${selectedSurvey.avgScore.toFixed(1)} avg response`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
                <div
                  className="flex items-center justify-between gap-3 px-4 py-3 border-b"
                  style={{ borderColor: P.border }}
                >
                  <div>
                    <p className="text-sm font-bold" style={{ color: P.text }}>
                      Available Submissions
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                      {selectedSurvey.anonymous
                        ? "Respondent identity is hidden for this survey."
                        : "Respondent identity is visible for HR review."}
                    </p>
                  </div>
                  <Chip
                    label={`${selectedSurvey.submissions.length} shown`}
                    variant={selectedSurvey.anonymous ? "neutral" : "sage"}
                  />
                </div>

                {selectedSurvey.submissions.length === 0 ? (
                  <div className="p-5 text-sm" style={{ color: P.textMuted }}>
                    No survey submissions have been received yet.
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: P.border }}>
                    {selectedSurvey.submissions.map((submission, submissionIndex) => (
                      <div key={submission.id} className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <Av
                            initials={
                              selectedSurvey.anonymous
                                ? `A${submissionIndex + 1}`
                                : submission.initials
                            }
                            size={34}
                            color={selectedSurvey.anonymous ? P.textMuted : P.sage}
                          />
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold" style={{ color: P.text }}>
                                {selectedSurvey.anonymous
                                  ? `Anonymous Respondent ${submissionIndex + 1}`
                                  : submission.respondent}
                              </p>
                              {!selectedSurvey.anonymous && (
                                <Chip label={submission.department} variant="sage" />
                              )}
                              <Chip label={submission.submittedAt} variant="neutral" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pl-0 sm:pl-12">
                          {selectedSurvey.questionSet.questions.map((question) => (
                            <div
                              key={`${submission.id}-${question.id}`}
                              className="rounded-lg p-3"
                              style={{ background: P.bg }}
                            >
                              <p className="text-xs font-semibold" style={{ color: P.text }}>
                                {question.prompt}
                              </p>
                              <p className="text-xs mt-1.5" style={{ color: P.textMid }}>
                                {submission.answers[question.id] ?? "No response provided"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
