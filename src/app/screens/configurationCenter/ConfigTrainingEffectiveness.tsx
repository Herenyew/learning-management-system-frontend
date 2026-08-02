// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useState } from "react";
import {
  ContentWorkflowModal,
  DEFAULT_QUESTION_TYPE_CONFIG,
  describeAttemptScoringPolicy,
  loadAttemptScoringPolicy,
  saveAttemptScoringPolicy,
  type AttemptScoringMode,
  type AttemptScoringPolicy,
  type ContentAttachment,
  type ContentType,
  type QuestionTypeConfig,
  SavedContentItem,
  QuizOnlyModal,
  QuizRow,
  QuizPreviewModal,
} from "../../Extensions6";
import {
  EnrollmentRulesCrud,
  ReportsCrud,
  WidgetsCrud,
  WorkflowsCrud,
  XPRulesCrud,
} from "../../Extensions5";
import {
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Play,
  Video,
  FileText,
  HelpCircle,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Copy,
  Archive,
  Send,
  Link,
  UserCheck,
  Layers,
  Shield,
  Eye,
  Settings,
  Zap,
  Lock,
  Users,
  Clock,
  Filter,
  MoreHorizontal,
  Flag,
  Upload,
  User,
  LayoutDashboard,
  Activity,
  Cpu,
  Music,
  RefreshCw,
  GitBranch,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  Trophy,
  Medal,
  Check,
  Wand2,
  PlusCircle,
  FileCheck,
  Bookmark,
  AlertTriangle,
  Image as ImageIcon,
  MousePointer2,
  Move,
  Palette,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AICard,
  ANALYTICS_TREND,
  Av,
  CERT_TEMPLATES,
  CERT_TEMPLATE_STORAGE_KEY,
  CONTENT_TYPES,
  CONTENT_TYPE_ICONS,
  COURSES_MINI,
  COURSE_COMMENTS,
  COURSE_TEMPLATE_STORAGE_KEY,
  CREATOR_CERTIFICATE_TEMPLATES,
  CertificateTemplateReviewModal,
  CertificationTemplate,
  CfgField,
  CfgSection,
  CfgToggle,
  Chip,
  CourseContentTypeConfig,
  CourseCreationTemplate,
  CourseDraftDetails,
  CourseMini,
  CourseTemplateChapter,
  CourseTemplateContentItem,
  CreatorCertificateTemplate,
  DEFAULT_CONFIG_PROGRAM_TEMPLATES,
  DEFAULT_CONTENT_TYPE_CONFIG,
  DEFAULT_COURSE_CREATION_TEMPLATES,
  EMPLOYEES,
  EXTERNAL_PROVIDERS,
  LearningProgramTemplate,
  LearningProgramTemplateDraft,
  MODERATION_ITEMS,
  ModerationItem,
  P,
  PBar,
  PROGRAM_TEMPLATE_CONFIG_STORAGE_KEY,
  PageHeader,
  PreCourseAssessmentPolicy,
  SaveBar,
  SavedCreatorCourse,
  VERSIONS,
  contentSourceLabelFor,
  createBlankCourseTemplate,
  createCourseContentItemFromSaved,
  createCourseDraftFromTemplate,
  createCustomCourseDraft,
  createExistingCourseDraft,
  createProgramTemplateDraft,
  createSavedCreatorCourseDraft,
  getContentItemAttachments,
  loadConfigProgramTemplates,
  loadCourseCreationTemplates,
  normalizeConfigProgramTemplate,
  parseCourseTemplateChapters,
  saveConfigProgramTemplates,
  saveCourseCreationTemplates,
  serializeCourseTemplateChapters,
  splitTemplateLines,
} from "./configuration.shared";

export function ConfigTrainingEffectiveness() {
  const [preQuestions, setPreQuestions] = useState([
    {
      id: "pq1",
      text: "What is your current knowledge level on this topic?",
      type: "Scale (1–5)",
      required: true,
    },
    {
      id: "pq2",
      text: "What do you hope to achieve from this course?",
      type: "Open text",
      required: false,
    },
    {
      id: "pq3",
      text: "How confident are you in applying this skill at work today?",
      type: "Scale (1–5)",
      required: true,
    },
  ]);
  const [postQuestions, setPostQuestions] = useState([
    {
      id: "poq1",
      text: "How would you rate your knowledge level now?",
      type: "Scale (1–5)",
      required: true,
    },
    {
      id: "poq2",
      text: "How confident are you in applying what you learned?",
      type: "Scale (1–5)",
      required: true,
    },
    {
      id: "poq3",
      text: "Would you recommend this course to a colleague?",
      type: "Yes / No",
      required: true,
    },
    {
      id: "poq4",
      text: "What would you improve about this course?",
      type: "Open text",
      required: false,
    },
  ]);
  const [kirkpatrickLevels, setKirkpatrickLevels] = useState([
    {
      id: "k1",
      level: "Level 1",
      name: "Reaction",
      desc: "Measure how learners felt about the training — satisfaction, relevance, and engagement.",
      enabled: true,
      trigger: "On course completion",
      weight: 10,
      questions: [
        "Overall course rating (1–5)",
        "Was the content relevant to your role?",
        "How engaging was the format?",
        "Trainer / facilitator rating (if applicable)",
      ],
    },
    {
      id: "k2",
      level: "Level 2",
      name: "Learning",
      desc: "Measure knowledge and skill gain via pre/post assessment comparison.",
      enabled: true,
      trigger: "Pre-enroll + Post-complete",
      weight: 30,
      questions: [
        "Pre-assessment score",
        "Post-assessment score",
        "Knowledge lift calculation",
        "Quiz pass/fail outcome",
      ],
    },
    {
      id: "k3",
      level: "Level 3",
      name: "Behaviour",
      desc: "Measure observable on-the-job behaviour change — collected from the learner and their manager.",
      enabled: true,
      trigger: "30 days after completion",
      weight: 40,
      questions: [
        "Are you applying what you learned? (Learner)",
        "Have you observed behaviour change? (Manager)",
        "Confidence in skill application (1–5)",
        "Barriers to application (open text)",
      ],
    },
    {
      id: "k4",
      level: "Level 4",
      name: "Results",
      desc: "Link training to business outcomes — KPI improvement, error reduction, productivity gains.",
      enabled: false,
      trigger: "90 days after completion (manual)",
      weight: 20,
      questions: [
        "Target KPI or business metric",
        "Baseline value (pre-training)",
        "Current value (post-training)",
        "Attribution confidence (HR notes)",
      ],
    },
  ]);
  const [behaviorItems, setBehaviorItems] = useState([
    {
      id: "b1",
      text: "I am applying the skills from this course in my daily work",
      respondent: "Learner",
      required: true,
    },
    {
      id: "b2",
      text: "I have shared key learnings with my team",
      respondent: "Learner",
      required: false,
    },
    {
      id: "b3",
      text: "The learner is demonstrating the skills covered in the course",
      respondent: "Manager",
      required: true,
    },
    {
      id: "b4",
      text: "I have noticed a measurable improvement in this area",
      respondent: "Manager",
      required: false,
    },
    {
      id: "b5",
      text: "What specific behaviours have you observed? (open)",
      respondent: "Manager",
      required: false,
    },
  ]);
  const [calcRules, setCalcRules] = useState([
    {
      id: "cr1",
      label: "Knowledge Lift Score",
      formula: "Post-score − Pre-score",
      weight: 30,
      active: true,
    },
    {
      id: "cr2",
      label: "Reaction Score",
      formula: "Average of Level 1 survey ratings",
      weight: 10,
      active: true,
    },
    {
      id: "cr3",
      label: "Behaviour Change Score",
      formula: "Average of Level 3 manager + learner ratings",
      weight: 40,
      active: true,
    },
    {
      id: "cr4",
      label: "Completion Rate Contribution",
      formula: "(Completions ÷ Enrollments) × 100",
      weight: 20,
      active: true,
    },
    {
      id: "cr5",
      label: "Results / KPI Score",
      formula: "(Post-KPI − Pre-KPI) ÷ Pre-KPI × 100",
      weight: 0,
      active: false,
    },
  ]);
  const totalWeight = calcRules.filter((r) => r.active).reduce((s, r) => s + r.weight, 0);

  return (
    <div className="space-y-5">
      {/* Pre-Course Assessments */}
      <CfgSection title="Pre-Course Assessments">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Collected before a learner begins a course. Establishes a baseline for measuring knowledge
          gain (Kirkpatrick Level 2).
        </p>
        <CfgToggle
          label="Enable pre-course assessments"
          desc="Learners complete a short survey/quiz before accessing course content"
          defaultOn
        />
        <CfgField
          label="Pre-assessment trigger"
          options={["On enrollment", "On first content access", "Both"]}
        />
        <CfgToggle
          label="Block course access until pre-assessment is submitted"
          desc="Learner must complete the pre-assessment before any content unlocks"
        />
        <CfgToggle
          label="Show pre-assessment score to learner"
          desc="Learner can see their baseline score before starting"
          defaultOn
        />

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Pre-Assessment Questions
            </p>
            <button
              onClick={() =>
                setPreQuestions((q) => [
                  ...q,
                  { id: `pq${Date.now()}`, text: "", type: "Scale (1–5)", required: false },
                ])
              }
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={11} /> Add Question
            </button>
          </div>
          {preQuestions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-center gap-2 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <span
                className="text-[10px] font-bold w-5 text-center flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                {i + 1}
              </span>
              <input
                defaultValue={q.text}
                placeholder="Question text…"
                className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <select
                defaultValue={q.type}
                className="text-xs px-2 py-1.5 rounded-lg bg-white flex-shrink-0"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {["Scale (1–5)", "Scale (1–10)", "Yes / No", "MCQ", "Open text"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <label
                className="flex items-center gap-1 text-[10px] flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={q.required}
                  style={{ accentColor: P.olive }}
                />{" "}
                Req.
              </label>
              <button
                onClick={() => setPreQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                style={{ color: "#C0392B" }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </CfgSection>

      {/* Post-Course Assessments */}
      <CfgSection title="Post-Course Assessments">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Collected immediately after completion. Measures reaction (Level 1) and learning (Level 2)
          in a single touchpoint.
        </p>
        <CfgToggle
          label="Enable post-course assessments"
          desc="Learners complete a survey/quiz after finishing a course"
          defaultOn
        />
        <CfgField
          label="Post-assessment trigger"
          options={["On course completion", "On certificate issuance", "Manual by HR"]}
        />
        <CfgField
          label="Post-assessment deadline (days after completion)"
          value="7"
          type="number"
        />
        <CfgToggle
          label="Block certificate until post-assessment is submitted"
          desc="Learner cannot access their certificate until they complete the post-survey"
          defaultOn
        />
        <CfgToggle
          label="Show knowledge lift score to learner"
          desc="Learner sees their Pre → Post improvement"
          defaultOn
        />

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Post-Assessment Questions
            </p>
            <button
              onClick={() =>
                setPostQuestions((q) => [
                  ...q,
                  { id: `poq${Date.now()}`, text: "", type: "Scale (1–5)", required: false },
                ])
              }
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={11} /> Add Question
            </button>
          </div>
          {postQuestions.map((q, i) => (
            <div
              key={q.id}
              className="flex items-center gap-2 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <span
                className="text-[10px] font-bold w-5 text-center flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                {i + 1}
              </span>
              <input
                defaultValue={q.text}
                placeholder="Question text…"
                className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <select
                defaultValue={q.type}
                className="text-xs px-2 py-1.5 rounded-lg bg-white flex-shrink-0"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {["Scale (1–5)", "Scale (1–10)", "Yes / No", "MCQ", "Open text", "NPS (0–10)"].map(
                  (t) => (
                    <option key={t}>{t}</option>
                  ),
                )}
              </select>
              <label
                className="flex items-center gap-1 text-[10px] flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={q.required}
                  style={{ accentColor: P.olive }}
                />{" "}
                Req.
              </label>
              <button
                onClick={() => setPostQuestions((qs) => qs.filter((x) => x.id !== q.id))}
                style={{ color: "#C0392B" }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </CfgSection>

      {/* Kirkpatrick Surveys */}
      <CfgSection title="Kirkpatrick Surveys">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Configure each level of the Kirkpatrick Model. Enabled levels are automatically scheduled
          at the configured trigger point.
        </p>
        <div className="space-y-3">
          {kirkpatrickLevels.map((k) => (
            <div
              key={k.id}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: k.enabled ? P.sage : P.border }}
            >
              {/* Level header */}
              <div
                className="flex items-start gap-3 p-4"
                style={{ background: k.enabled ? "white" : P.bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold text-white"
                  style={{ background: k.enabled ? P.olive : P.textMuted }}
                >
                  {k.level.split(" ")[1]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p
                      className="text-xs font-bold"
                      style={{ color: k.enabled ? P.text : P.textMuted }}
                    >
                      {k.level} — {k.name}
                    </p>
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: P.lightSage, color: P.darkOlive }}
                    >
                      Weight: {k.weight}%
                    </span>
                  </div>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {k.desc}
                  </p>
                  <p className="text-[10px] mt-1 font-medium" style={{ color: P.olive }}>
                    ⏱ Trigger: {k.trigger}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setKirkpatrickLevels((ls) =>
                      ls.map((x) => (x.id === k.id ? { ...x, enabled: !x.enabled } : x)),
                    )
                  }
                  className="rounded-full relative transition-colors flex-shrink-0 mt-1"
                  style={{ background: k.enabled ? P.olive : P.border, width: 36, height: 20 }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                    style={{ left: k.enabled ? "18px" : "2px" }}
                  />
                </button>
              </div>

              {/* Level detail */}
              {k.enabled && (
                <div
                  className="px-4 pb-4 pt-1"
                  style={{ borderTop: `1px solid ${P.border}40`, background: "white" }}
                >
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label
                        className="block text-[10px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: P.textMuted }}
                      >
                        Trigger
                      </label>
                      <select
                        defaultValue={k.trigger}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white"
                        style={{ border: `1px solid ${P.border}`, color: P.text }}
                      >
                        {[
                          "On course completion",
                          "24 hours after completion",
                          "7 days after completion",
                          "30 days after completion",
                          "90 days after completion (manual)",
                          "Pre-enroll + Post-complete",
                        ].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-[10px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: P.textMuted }}
                      >
                        Weight in Effectiveness Score
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          defaultValue={k.weight}
                          onChange={(e) =>
                            setKirkpatrickLevels((ls) =>
                              ls.map((x) =>
                                x.id === k.id ? { ...x, weight: Number(e.target.value) } : x,
                              ),
                            )
                          }
                          className="w-20 px-2.5 py-1.5 text-xs rounded-lg bg-white text-right"
                          style={{ border: `1px solid ${P.border}`, color: P.text }}
                        />
                        <span className="text-xs" style={{ color: P.textMuted }}>
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: P.textMuted }}
                  >
                    Measured data points
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {k.questions.map((q) => (
                      <span
                        key={q}
                        className="text-[10px] px-2 py-1 rounded-lg"
                        style={{ background: P.lightSage, color: P.darkOlive }}
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          className="flex items-center justify-between mt-3 p-3 rounded-lg"
          style={{ background: totalWeight === 100 ? "#D8EDCC" : "#FEE2E2" }}
        >
          <p
            className="text-xs font-semibold"
            style={{ color: totalWeight === 100 ? "#3A6420" : "#B91C1C" }}
          >
            Total weight across enabled levels: <strong>{totalWeight}%</strong>
          </p>
          {totalWeight !== 100 && (
            <p className="text-[10px]" style={{ color: "#B91C1C" }}>
              Weights must sum to 100%
            </p>
          )}
          {totalWeight === 100 && (
            <p className="text-[10px]" style={{ color: "#3A6420" }}>
              ✓ Balanced
            </p>
          )}
        </div>
      </CfgSection>

      {/* Behaviour Follow-Up Surveys */}
      <CfgSection title="Behaviour Follow-Up Surveys">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Sent to the learner and their line manager at a set interval after course completion
          (Kirkpatrick Level 3). Measures whether training has translated into on-the-job behaviour
          change.
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <CfgField label="Send to learner (days after completion)" value="30" type="number" />
          <CfgField label="Send to manager (days after completion)" value="30" type="number" />
          <CfgField label="Survey reminder if not completed (days)" value="7" type="number" />
          <CfgField
            label="Minimum manager responses for statistical reporting"
            value="3"
            type="number"
          />
        </div>
        <CfgToggle label="Enable behaviour follow-up surveys" defaultOn />
        <CfgToggle
          label="Allow anonymous learner responses"
          desc="Manager cannot see which specific learner submitted which response"
          defaultOn
        />
        <CfgToggle
          label="Send follow-up to all courses or mandatory only"
          desc="When off, only courses flagged by HR trigger a behaviour survey"
        />

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Behaviour Survey Items
            </p>
            <button
              onClick={() =>
                setBehaviorItems((b) => [
                  ...b,
                  { id: `b${Date.now()}`, text: "", respondent: "Learner", required: false },
                ])
              }
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={11} /> Add Item
            </button>
          </div>
          {behaviorItems.map((b, i) => (
            <div
              key={b.id}
              className="flex items-center gap-2 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <span
                className="text-[10px] font-bold w-5 text-center flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                {i + 1}
              </span>
              <input
                defaultValue={b.text}
                placeholder="Behaviour statement…"
                className="flex-1 min-w-0 px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <select
                defaultValue={b.respondent}
                className="text-xs px-2 py-1.5 rounded-lg bg-white flex-shrink-0"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                <option>Learner</option>
                <option>Manager</option>
                <option>Both</option>
              </select>
              <label
                className="flex items-center gap-1 text-[10px] flex-shrink-0"
                style={{ color: P.textMuted }}
              >
                <input
                  type="checkbox"
                  defaultChecked={b.required}
                  style={{ accentColor: P.olive }}
                />{" "}
                Req.
              </label>
              <button
                onClick={() => setBehaviorItems((bs) => bs.filter((x) => x.id !== b.id))}
                style={{ color: "#C0392B" }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      </CfgSection>

      {/* Effectiveness Calculation Rules */}
      <CfgSection title="Effectiveness Calculation Rules">
        <p className="text-[11px] mb-4" style={{ color: P.textMuted }}>
          Define how the overall Effectiveness Score is calculated. Each active component
          contributes a weighted percentage. Weights across active rules must sum to 100%.
        </p>

        <div className="space-y-2 mb-3">
          {calcRules.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{
                borderColor: r.active ? P.sage : P.border,
                background: r.active ? "white" : P.bg,
              }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold"
                  style={{ color: r.active ? P.text : P.textMuted }}
                >
                  {r.label}
                </p>
                <p className="text-[10px] font-mono" style={{ color: P.textMuted }}>
                  {r.formula}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input
                  type="number"
                  defaultValue={r.weight}
                  onChange={(e) =>
                    setCalcRules((rs) =>
                      rs.map((x) => (x.id === r.id ? { ...x, weight: Number(e.target.value) } : x)),
                    )
                  }
                  disabled={!r.active}
                  className="w-14 px-2 py-1.5 text-xs rounded-lg text-right"
                  style={{
                    border: `1px solid ${P.border}`,
                    color: r.active ? P.text : P.textMuted,
                    background: "white",
                  }}
                />
                <span className="text-[10px]" style={{ color: P.textMuted }}>
                  %
                </span>
              </div>
              <button
                onClick={() =>
                  setCalcRules((rs) =>
                    rs.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)),
                  )
                }
                className="rounded-full relative transition-colors flex-shrink-0"
                style={{ background: r.active ? P.olive : P.border, width: 36, height: 20 }}
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
                  style={{ left: r.active ? "18px" : "2px" }}
                />
              </button>
            </div>
          ))}
        </div>

        <div
          className="flex items-center justify-between p-3 rounded-lg"
          style={{ background: totalWeight === 100 ? "#D8EDCC" : "#FEE2E2" }}
        >
          <p
            className="text-xs font-semibold"
            style={{ color: totalWeight === 100 ? "#3A6420" : "#B91C1C" }}
          >
            Total: <strong>{totalWeight}%</strong>{" "}
            {totalWeight !== 100
              ? `(${totalWeight > 100 ? "over" : "under"} by ${Math.abs(totalWeight - 100)}%)`
              : ""}
          </p>
          {totalWeight === 100 && (
            <p className="text-[10px]" style={{ color: "#3A6420" }}>
              ✓ Weights balanced — score calculation is valid
            </p>
          )}
        </div>

        <div className="pt-1 space-y-3">
          <CfgField label="Effectiveness score alert threshold (%)" value="60" type="number" />
          <CfgToggle label="Alert HR when a course's score drops below threshold" defaultOn />
          <CfgToggle label="Include effectiveness score in HR analytics dashboard" defaultOn />
          <CfgToggle
            label="Show effectiveness score to course creators"
            desc="Creators see aggregate (anonymised) results for their own courses"
            defaultOn
          />
          <CfgToggle
            label="Show effectiveness score to learners"
            desc="Learners see their personal pre/post lift score on course completion"
          />
          <CfgField
            label="Minimum data points to show a score (avoid skewed results)"
            value="5"
            type="number"
          />
        </div>
      </CfgSection>

      <SaveBar />
    </div>
  );
}

// ─── Main ConfigCenterScreen ──────────────────────────────────
