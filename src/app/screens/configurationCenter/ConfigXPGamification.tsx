// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useState } from "react";
import {
  ContentWorkflowModal,
  DEFAULT_QUESTION_TYPE_CONFIG,
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

type QuizXpAwardBasis = "completion" | "performance" | "combined";

type QuizXpRulesConfig = {
  enabled: boolean;
  basis: QuizXpAwardBasis;
  completionXp: number;
  passXp: number;
  perfectScoreXp: number;
  firstAttemptOnly: boolean;
  requirePassForXp: boolean;
};

type CourseXpCompletionRequirements = {
  minimumContentCompletion: number;
  requiredModules: "all" | "mandatory" | "percentage";
  requiredModulePercentage: number;
  requireQuizPass: boolean;
  requireManagerConfirmation: boolean;
};

type XPGamificationConfig = {
  courseXpCompletionRequirements: CourseXpCompletionRequirements;
  minimumQuizPassScore: number;
  quizXpRules: QuizXpRulesConfig;
};

const XP_GAMIFICATION_CONFIG_STORAGE_KEY = "learnos_xp_gamification_config";

const DEFAULT_QUIZ_XP_RULES: QuizXpRulesConfig = {
  enabled: true,
  basis: "combined",
  completionXp: 40,
  passXp: 80,
  perfectScoreXp: 150,
  firstAttemptOnly: true,
  requirePassForXp: true,
};

const DEFAULT_COURSE_XP_COMPLETION_REQUIREMENTS: CourseXpCompletionRequirements = {
  minimumContentCompletion: 100,
  requiredModules: "all",
  requiredModulePercentage: 100,
  requireQuizPass: true,
  requireManagerConfirmation: false,
};

const loadXpGamificationConfig = (): XPGamificationConfig => {
  const fallback: XPGamificationConfig = {
    courseXpCompletionRequirements: DEFAULT_COURSE_XP_COMPLETION_REQUIREMENTS,
    minimumQuizPassScore: 70,
    quizXpRules: DEFAULT_QUIZ_XP_RULES,
  };

  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(XP_GAMIFICATION_CONFIG_STORAGE_KEY);
    if (!stored) return fallback;

    const parsed = JSON.parse(stored) as Partial<XPGamificationConfig>;
    const parsedBasis = parsed.quizXpRules?.basis;
    const safeBasis: QuizXpAwardBasis =
      parsedBasis === "completion" || parsedBasis === "performance" || parsedBasis === "combined"
        ? parsedBasis
        : DEFAULT_QUIZ_XP_RULES.basis;

    return {
      courseXpCompletionRequirements: {
        ...DEFAULT_COURSE_XP_COMPLETION_REQUIREMENTS,
        ...(parsed.courseXpCompletionRequirements ?? {}),
      },
      minimumQuizPassScore:
        typeof parsed.minimumQuizPassScore === "number" ? parsed.minimumQuizPassScore : 70,
      quizXpRules: {
        ...DEFAULT_QUIZ_XP_RULES,
        ...(parsed.quizXpRules ?? {}),
        basis: safeBasis,
      },
    };
  } catch {
    return fallback;
  }
};

export function ConfigXPGamification() {
  const [levels, setLevels] = useState([
    { id: "l1", name: "Learner", min: 0, max: 999, color: "#6EE7B7" },
    { id: "l2", name: "Explorer", min: 1000, max: 2999, color: "#047857" },
    { id: "l3", name: "Achiever", min: 3000, max: 5999, color: "#C8A85D" },
    { id: "l4", name: "Expert", min: 6000, max: 9999, color: "#4A7A5A" },
    { id: "l5", name: "Master", min: 10000, max: 99999, color: "#064E3B" },
  ]);
  const [xpGamificationConfig, setXpGamificationConfig] =
    useState<XPGamificationConfig>(loadXpGamificationConfig);
  const [attemptScoringPolicy, setAttemptScoringPolicy] =
    useState<AttemptScoringPolicy>(loadAttemptScoringPolicy);

  const { courseXpCompletionRequirements, minimumQuizPassScore, quizXpRules } =
    xpGamificationConfig;
  const updateCourseXpCompletionRequirements = <K extends keyof CourseXpCompletionRequirements>(
    key: K,
    value: CourseXpCompletionRequirements[K],
  ) => {
    setXpGamificationConfig((config) => ({
      ...config,
      courseXpCompletionRequirements: {
        ...config.courseXpCompletionRequirements,
        [key]: value,
      },
    }));
  };
  const updateCompletionPercentRequirement = (
    key: "minimumContentCompletion" | "requiredModulePercentage",
    value: number,
  ) => {
    updateCourseXpCompletionRequirements(
      key,
      Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0)),
    );
  };
  const updateQuizXpRules = <K extends keyof QuizXpRulesConfig>(
    key: K,
    value: QuizXpRulesConfig[K],
  ) => {
    setXpGamificationConfig((config) => ({
      ...config,
      quizXpRules: { ...config.quizXpRules, [key]: value },
    }));
  };
  const updateMinimumQuizPassScore = (value: number) => {
    setXpGamificationConfig((config) => ({
      ...config,
      minimumQuizPassScore: Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)),
    }));
  };
  const updateAttemptScoringPolicy = <K extends keyof AttemptScoringPolicy>(
    key: K,
    value: AttemptScoringPolicy[K],
  ) => {
    setAttemptScoringPolicy((policy) => ({ ...policy, [key]: value }));
  };
  const updateAttemptScoringPercent = (
    key:
      | "firstAttemptPercent"
      | "secondAttemptPercent"
      | "thirdAttemptPercent"
      | "laterAttemptPercent",
    value: number,
  ) => {
    updateAttemptScoringPolicy(
      key,
      Math.max(0, Math.min(100, Number.isFinite(value) ? Math.round(value) : 0)),
    );
  };
  const saveXpGamificationConfig = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        XP_GAMIFICATION_CONFIG_STORAGE_KEY,
        JSON.stringify({
          ...xpGamificationConfig,
          levels,
        }),
      );
    }
    saveAttemptScoringPolicy(attemptScoringPolicy);
  };
  const completionRuleActive =
    quizXpRules.enabled && (quizXpRules.basis === "completion" || quizXpRules.basis === "combined");
  const performanceRuleActive =
    quizXpRules.enabled &&
    (quizXpRules.basis === "performance" || quizXpRules.basis === "combined");
  const perfectScoreTotal =
    (completionRuleActive ? quizXpRules.completionXp : 0) +
    (performanceRuleActive ? quizXpRules.passXp + quizXpRules.perfectScoreXp : 0);

  return (
    <div className="space-y-7">
      <CfgSection title="XP Eligibility">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Content Completion %
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={courseXpCompletionRequirements.minimumContentCompletion}
              onChange={(event) =>
                updateCompletionPercentRequirement(
                  "minimumContentCompletion",
                  Number(event.target.value),
                )
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Required Modules
            </label>
            <select
              value={courseXpCompletionRequirements.requiredModules}
              onChange={(event) =>
                updateCourseXpCompletionRequirements(
                  "requiredModules",
                  event.target.value as CourseXpCompletionRequirements["requiredModules"],
                )
              }
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option value="all">All modules</option>
              <option value="mandatory">Mandatory modules only</option>
              <option value="percentage">Configured module percentage</option>
            </select>
          </div>
          {courseXpCompletionRequirements.requiredModules === "percentage" && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Module Completion %
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={courseXpCompletionRequirements.requiredModulePercentage}
                onChange={(event) =>
                  updateCompletionPercentRequirement(
                    "requiredModulePercentage",
                    Number(event.target.value),
                  )
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              [
                "requireQuizPass",
                "Required quizzes must pass",
                `Uses ${minimumQuizPassScore}% pass score.`,
              ],
              ["requireManagerConfirmation", "Manager confirmation", "Manager releases XP."],
            ] as ["requireQuizPass" | "requireManagerConfirmation", string, string][]
          ).map(([key, label, desc]) => (
            <button
              key={key}
              type="button"
              onClick={() =>
                updateCourseXpCompletionRequirements(key, !courseXpCompletionRequirements[key])
              }
              className="flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                borderColor: courseXpCompletionRequirements[key] ? P.olive : P.border,
                background: courseXpCompletionRequirements[key] ? P.lightSage : P.bg,
              }}
            >
              <span>
                <span className="block text-xs font-semibold" style={{ color: P.text }}>
                  {label}
                </span>
                <span className="block text-[10px]" style={{ color: P.textMuted }}>
                  {desc}
                </span>
              </span>
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: courseXpCompletionRequirements[key] ? P.olive : "white",
                  border: `1px solid ${courseXpCompletionRequirements[key] ? P.olive : P.border}`,
                }}
              >
                {courseXpCompletionRequirements[key] && <Check size={13} className="text-white" />}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: P.border, background: P.bg }}>
          <p className="text-xs font-semibold mb-1" style={{ color: P.text }}>
            XP unlocks when
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: P.textMuted }}>
            {courseXpCompletionRequirements.minimumContentCompletion}% content is complete,{" "}
            {courseXpCompletionRequirements.requiredModules === "all"
              ? "all modules are done"
              : courseXpCompletionRequirements.requiredModules === "mandatory"
                ? "mandatory modules are done"
                : `${courseXpCompletionRequirements.requiredModulePercentage}% of modules are done`}
            {courseXpCompletionRequirements.requireQuizPass
              ? `, quizzes pass ${minimumQuizPassScore}%`
              : ""}
            {courseXpCompletionRequirements.requireManagerConfirmation
              ? ", and manager confirms"
              : ""}
            .
          </p>
        </div>
      </CfgSection>

      {/* Base XP */}
      <CfgSection title="Course XP">
        <div className="grid sm:grid-cols-2 gap-4">
          <CfgField label="Completion XP" value="300" type="number" />
          <CfgField label="Mandatory Course Multiplier" value="1.5" type="number" />
        </div>
      </CfgSection>

      {/* Quiz XP Rules */}
      <CfgSection title="Quiz XP">
        <div
          className="flex items-center justify-between gap-3 rounded-xl p-3"
          style={{ background: P.bg }}
        >
          <div>
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              Enable quiz XP
            </p>
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              Fixed XP, score XP, or both.
            </p>
          </div>
          <button
            onClick={() => updateQuizXpRules("enabled", !quizXpRules.enabled)}
            className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
            style={{ background: quizXpRules.enabled ? P.olive : P.border }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
              style={{ left: quizXpRules.enabled ? "24px" : "4px" }}
            />
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
            Award Basis
          </p>
          <div className="grid sm:grid-cols-3 gap-2">
            {(
              [
                ["completion", "Quiz Completion", "Fixed XP on finish."],
                ["performance", "Quiz Performance", "Score-based XP."],
                ["combined", "Completion + Performance", "Fixed + score XP."],
              ] as [QuizXpAwardBasis, string, string][]
            ).map(([basis, label, desc]) => (
              <button
                key={basis}
                onClick={() => updateQuizXpRules("basis", basis)}
                disabled={!quizXpRules.enabled}
                className="text-left rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  borderColor: quizXpRules.basis === basis ? P.olive : P.border,
                  background: quizXpRules.basis === basis ? P.lightSage : "white",
                  opacity: quizXpRules.enabled ? 1 : 0.55,
                }}
              >
                <p className="text-xs font-bold" style={{ color: P.text }}>
                  {label}
                </p>
                <p className="text-[10px] mt-1 leading-relaxed" style={{ color: P.textMuted }}>
                  {desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {completionRuleActive && (
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                XP on Quiz Completion
              </label>
              <input
                type="number"
                min={0}
                value={quizXpRules.completionXp}
                onChange={(event) =>
                  updateQuizXpRules("completionXp", Math.max(0, Number(event.target.value) || 0))
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          )}
          {performanceRuleActive && (
            <>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  XP on Passing Score
                </label>
                <input
                  type="number"
                  min={0}
                  value={quizXpRules.passXp}
                  onChange={(event) =>
                    updateQuizXpRules("passXp", Math.max(0, Number(event.target.value) || 0))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Perfect Score Bonus XP
                </label>
                <input
                  type="number"
                  min={0}
                  value={quizXpRules.perfectScoreXp}
                  onChange={(event) =>
                    updateQuizXpRules(
                      "perfectScoreXp",
                      Math.max(0, Number(event.target.value) || 0),
                    )
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            </>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["firstAttemptOnly", "First passed attempt only", "No repeat XP on retakes."],
              ["requirePassForXp", "Require pass score", "Learner must pass first."],
            ] as [
              keyof Pick<QuizXpRulesConfig, "firstAttemptOnly" | "requirePassForXp">,
              string,
              string,
            ][]
          ).map(([key, label, desc]) => (
            <button
              key={key}
              onClick={() => updateQuizXpRules(key, !quizXpRules[key])}
              disabled={!quizXpRules.enabled}
              className="flex items-center justify-between gap-3 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                background: quizXpRules[key] ? P.lightSage : P.bg,
                border: `1px solid ${quizXpRules[key] ? P.sage : P.border}`,
                opacity: quizXpRules.enabled ? 1 : 0.55,
              }}
            >
              <span>
                <span className="block text-xs font-semibold" style={{ color: P.text }}>
                  {label}
                </span>
                <span className="block text-[10px]" style={{ color: P.textMuted }}>
                  {desc}
                </span>
              </span>
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: quizXpRules[key] ? P.olive : "white",
                  border: `1px solid ${quizXpRules[key] ? P.olive : P.border}`,
                }}
              >
                {quizXpRules[key] && <Check size={13} className="text-white" />}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: P.border, background: P.bg }}>
          <p className="text-xs font-semibold mb-1" style={{ color: P.text }}>
            Preview
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: P.textMuted }}>
            {quizXpRules.enabled
              ? `100% quiz: up to ${perfectScoreTotal} XP. Pass starts at ${minimumQuizPassScore}%.`
              : "Quiz XP is off."}
          </p>
        </div>
      </CfgSection>

      {/* Attempt-Based Scoring Policy */}
      <CfgSection title="Attempt Scoring">
        <div
          className="flex items-center justify-between gap-3 rounded-xl p-3"
          style={{ background: P.bg }}
        >
          <div>
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              Enable attempt scoring
            </p>
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              Set retake credit.
            </p>
          </div>
          <button
            onClick={() => updateAttemptScoringPolicy("enabled", !attemptScoringPolicy.enabled)}
            className="w-11 h-6 rounded-full relative transition-colors flex-shrink-0"
            style={{ background: attemptScoringPolicy.enabled ? P.olive : P.border }}
          >
            <span
              className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
              style={{ left: attemptScoringPolicy.enabled ? "24px" : "4px" }}
            />
          </button>
        </div>

        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
            Scoring Mode
          </p>
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-2">
            {(
              [
                ["full-credit", "Full Credit", "All attempts count."],
                ["reduced-credit", "Reduced Credit", "Retries reduce credit."],
                ["best-score", "Best Score", "Highest score wins."],
                ["latest-score", "Latest Score", "Newest score wins."],
              ] as [AttemptScoringMode, string, string][]
            ).map(([mode, label, desc]) => (
              <button
                key={mode}
                onClick={() => updateAttemptScoringPolicy("mode", mode)}
                disabled={!attemptScoringPolicy.enabled}
                className="text-left rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                style={{
                  borderColor: attemptScoringPolicy.mode === mode ? P.olive : P.border,
                  background: attemptScoringPolicy.mode === mode ? P.lightSage : "white",
                  opacity: attemptScoringPolicy.enabled ? 1 : 0.55,
                }}
              >
                <p className="text-xs font-bold" style={{ color: P.text }}>
                  {label}
                </p>
                <p className="text-[10px] mt-1 leading-relaxed" style={{ color: P.textMuted }}>
                  {desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3">
          {(
            [
              ["firstAttemptPercent", "1st Attempt Credit %"],
              ["secondAttemptPercent", "2nd Attempt Credit %"],
              ["thirdAttemptPercent", "3rd Attempt Credit %"],
              ["laterAttemptPercent", "Later Attempts Credit %"],
            ] as [
              (
                | "firstAttemptPercent"
                | "secondAttemptPercent"
                | "thirdAttemptPercent"
                | "laterAttemptPercent"
              ),
              string,
            ][]
          ).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                {label}
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={attemptScoringPolicy[key]}
                onChange={(event) => updateAttemptScoringPercent(key, Number(event.target.value))}
                disabled={
                  !attemptScoringPolicy.enabled || attemptScoringPolicy.mode !== "reduced-credit"
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{
                  border: `1px solid ${P.border}`,
                  color: P.text,
                  opacity:
                    attemptScoringPolicy.enabled && attemptScoringPolicy.mode === "reduced-credit"
                      ? 1
                      : 0.55,
                }}
              />
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["allowCreatorOverride", "Allow course creators to override", "Per-quiz override."],
              [
                "showPolicyToLearners",
                "Show scoring policy to learners",
                "Show before quiz starts.",
              ],
            ] as [
              keyof Pick<AttemptScoringPolicy, "allowCreatorOverride" | "showPolicyToLearners">,
              string,
              string,
            ][]
          ).map(([key, label, desc]) => (
            <button
              key={key}
              onClick={() => updateAttemptScoringPolicy(key, !attemptScoringPolicy[key])}
              disabled={!attemptScoringPolicy.enabled}
              className="flex items-center justify-between gap-3 rounded-xl p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{
                background: attemptScoringPolicy[key] ? P.lightSage : P.bg,
                border: `1px solid ${attemptScoringPolicy[key] ? P.sage : P.border}`,
                opacity: attemptScoringPolicy.enabled ? 1 : 0.55,
              }}
            >
              <span>
                <span className="block text-xs font-semibold" style={{ color: P.text }}>
                  {label}
                </span>
                <span className="block text-[10px]" style={{ color: P.textMuted }}>
                  {desc}
                </span>
              </span>
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                style={{
                  background: attemptScoringPolicy[key] ? P.olive : "white",
                  border: `1px solid ${attemptScoringPolicy[key] ? P.olive : P.border}`,
                }}
              >
                {attemptScoringPolicy[key] && <Check size={13} className="text-white" />}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: P.border, background: P.bg }}>
          <p className="text-xs font-semibold mb-1" style={{ color: P.text }}>
            Preview
          </p>
          <p className="text-[11px] leading-relaxed" style={{ color: P.textMuted }}>
            {attemptScoringPolicy.enabled
              ? attemptScoringPolicy.mode === "reduced-credit"
                ? `${attemptScoringPolicy.firstAttemptPercent}/${attemptScoringPolicy.secondAttemptPercent}/${attemptScoringPolicy.thirdAttemptPercent}/${attemptScoringPolicy.laterAttemptPercent}% credit by attempt.`
                : attemptScoringPolicy.mode === "best-score"
                  ? "Best score counts."
                  : attemptScoringPolicy.mode === "latest-score"
                    ? "Latest score counts."
                    : "All attempts count."
              : "Attempt scoring is off."}{" "}
            {attemptScoringPolicy.allowCreatorOverride
              ? "Creators can override."
              : "HR controlled."}
          </p>
        </div>
      </CfgSection>

      <XPRulesCrud />

      {/* Completion Criteria */}
      <CfgSection title="Completion">
        <div className="grid sm:grid-cols-2 gap-4">
          <CfgField label="Video Watch %" value="80" type="number" />
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Quiz Pass Score %
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={minimumQuizPassScore}
              onChange={(event) => updateMinimumQuizPassScore(Number(event.target.value))}
              className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          <CfgField
            label="Required Modules"
            options={["All modules", "80% of modules", "Mandatory modules only"]}
          />
          <CfgField label="Retry Limit" value="3" type="number" />
        </div>
        <CfgToggle
          label="Require all tasks to be submitted"
          desc="Blocks completion until tasks are done"
          defaultOn
        />
        <CfgToggle label="Manager must confirm completion" desc="Adds sign-off before XP" />
      </CfgSection>

      {/* XP Thresholds */}
      <CfgSection title="Levels">
        <div className="space-y-2">
          {levels.map((lvl, i) => (
            <div
              key={lvl.id}
              className="flex items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: lvl.color }}
              />
              <input
                defaultValue={lvl.name}
                className="flex-1 min-w-0 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <input
                type="number"
                defaultValue={lvl.min}
                className="w-24 px-2.5 py-1.5 text-xs rounded-lg bg-white text-right"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <span className="text-[10px]" style={{ color: P.textMuted }}>
                to
              </span>
              <input
                type="number"
                defaultValue={lvl.max === 99999 ? undefined : lvl.max}
                placeholder="∞"
                className="w-24 px-2.5 py-1.5 text-xs rounded-lg bg-white text-right"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <span className="text-[10px]" style={{ color: P.textMuted }}>
                XP
              </span>
              {levels.length > 1 && (
                <button
                  onClick={() => setLevels((l) => l.filter((x) => x.id !== lvl.id))}
                  style={{ color: "#C0392B" }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() =>
            setLevels((l) => [
              ...l,
              { id: `l${Date.now()}`, name: "New Level", min: 0, max: 0, color: P.sage },
            ])
          }
          className="flex items-center gap-1.5 text-xs font-semibold mt-1"
          style={{ color: P.olive }}
        >
          <Plus size={12} /> Add Level
        </button>
      </CfgSection>

      <SaveBar onSave={saveXpGamificationConfig} />
    </div>
  );
}

// ─── Stub config pages ────────────────────────────────────────
