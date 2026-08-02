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
import type { MyCoursesBuilderViewContext } from "./MyCoursesDashboard.types";

const BUILDER_NAV = [
  { id: "info", label: "Course Information", icon: FileText },
  { id: "attendees", label: "Attendees", icon: Users },
  { id: "content", label: "Content & Chapters", icon: Layers },
  { id: "certification", label: "Certification", icon: Award },
  { id: "visibility", label: "Visibility", icon: Eye },
  { id: "enrollment", label: "Enrollment", icon: UserCheck },
  { id: "xp", label: "XP Configuration", icon: Zap },
  { id: "publishing", label: "Publishing", icon: Globe },
  { id: "moderation", label: "Moderation", icon: Shield },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
  { id: "versions", label: "Version Control", icon: GitBranch },
];

type CourseTaxonomyOption = {
  name: string;
  active?: boolean;
  order?: number;
};

const DEFAULT_CREATOR_CATEGORIES: CourseTaxonomyOption[] = [
  "Technology",
  "Leadership",
  "Compliance",
  "Soft Skills",
  "Finance",
  "Design",
  "Management",
].map((name) => ({ name, active: true }));

const DEFAULT_CREATOR_LEVELS: CourseTaxonomyOption[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
].map((name, index) => ({ name, active: true, order: index + 1 }));

export function MyCoursesCertificationPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
  const {
    activeCertificateTemplateReview,
    activeCompanyCourseTemplates,
    activeContentChapter,
    activePreCourseAssessment,
    activeQuizModule,
    allowedCreatorContentTypes,
    assignMode,
    builderPanel,
    canAddQuiz,
    categoryOptions,
    certEnabled,
    certScore,
    certTemplate,
    certTemplateReview,
    contactSearch,
    course,
    courseDetails,
    courseEndQuizzes,
    createDraftCourse,
    currentCourseEndQuizzes,
    employeePickerOpen,
    employeePickerResults,
    employeePickerSearch,
    enrollType,
    filter,
    filtered,
    filteredCourses,
    filteredEmployees,
    individuals,
    levelOptions,
    moduleQuizzes,
    navigate,
    openCourseBuilder,
    openCourseTemplateChooser,
    prereqMode,
    prereqSearch,
    prereqs,
    previewQuiz,
    questionTypes,
    quizConfig,
    quizOption,
    quizStep,
    saveActiveCourse,
    search,
    selectedCategory,
    selectedContact,
    selectedGroups,
    selectedLevel,
    setActiveContentChapter,
    setActiveQuizModule,
    setAssignMode,
    setBuilderPanel,
    setCertEnabled,
    setCertScore,
    setCertTemplate,
    setCertTemplateReview,
    setContactSearch,
    setCourseEndQuizzes,
    setCourses,
    setEmployeePickerOpen,
    setEmployeePickerSearch,
    setEnrollType,
    setFilter,
    setIndividuals,
    setModuleQuizzes,
    setOpenBuilder,
    setPrereqMode,
    setPrereqSearch,
    setPrereqs,
    setPreviewQuiz,
    setQuizConfig,
    setQuizOption,
    setQuizStep,
    setSearch,
    setSelectedContact,
    setSelectedGroups,
    setShowAddItem,
    setShowContactDrop,
    setShowCourseQuizWorkflow,
    setShowCourseTemplateChooser,
    setShowQuizModal,
    setShowQuizWorkflow,
    setUseCustomConfig,
    setVisibilityScope,
    showAddItem,
    showContactDrop,
    showCourseQuizWorkflow,
    showCourseTemplateChooser,
    showQuizModal,
    showQuizWorkflow,
    statusCounts,
    statuses,
    toggleIndividualEmployee,
    updateActiveCourseDraft,
    updateCertScore,
    useCustomConfig,
    visibilityScope,
  } = ctx;

  return (
    <>
      {builderPanel === "certification" && (
        <div className="space-y-5">
          {/* ── Certification Configuration (from image) ── */}
          <div
            className="rounded-2xl border p-5 space-y-5"
            style={{ borderColor: P.border, background: "white" }}
          >
            <p className="text-sm font-bold" style={{ color: P.text }}>
              Certification Configuration
            </p>

            {/* Enable Certificate */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  Enable Certificate
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
                  Award a certificate upon course completion
                </p>
              </div>
              <button
                onClick={() => setCertEnabled((v) => !v)}
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2 transition-colors"
                style={{
                  background: certEnabled ? P.darkOlive : "white",
                  borderColor: certEnabled ? P.darkOlive : P.border,
                }}
              >
                {certEnabled && (
                  <span className="text-white font-bold" style={{ fontSize: 11, lineHeight: 1 }}>
                    ✓
                  </span>
                )}
              </button>
            </div>

            {/* Minimum Certification Score */}
            <div>
              <p className="text-xs font-semibold mb-2.5" style={{ color: P.text }}>
                Minimum Certification Score (%) <span className="text-red-500">*</span>
              </p>
              <div
                className="rounded-xl border p-3 space-y-3"
                style={{ borderColor: P.border, background: P.bg }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={certScore}
                    onChange={(e) => updateCertScore(Number(e.target.value))}
                    className="flex-1"
                    style={{ accentColor: P.darkOlive }}
                  />
                  <div className="relative w-24 flex-shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      value={certScore}
                      onChange={(e) => updateCertScore(Number(e.target.value))}
                      className="w-full pr-7 pl-3 py-2 rounded-lg text-sm font-semibold bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: P.textMuted }}
                    >
                      %
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[0, 50, 60, 70, 75, 80, 90, 100].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateCertScore(s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                      style={{
                        borderColor: certScore === s ? P.darkOlive : P.border,
                        background: certScore === s ? P.darkOlive : "white",
                        color: certScore === s ? "white" : P.textMid,
                      }}
                    >
                      {s}%
                    </button>
                  ))}
                </div>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Accepts any whole-number score from 0% to 100%.
                </p>
              </div>
            </div>
            {/* Certificate Template */}
            <div>
              <p className="text-xs font-semibold mb-2.5" style={{ color: P.text }}>
                Certificate Template
              </p>
              <div className="space-y-2">
                {CREATOR_CERTIFICATE_TEMPLATES.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      setCertTemplate(t.id);
                      setCertTemplateReview(t.id);
                    }}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all text-left"
                    style={{
                      borderColor: certTemplate === t.id ? P.darkOlive : P.border,
                      background: certTemplate === t.id ? P.lightSage : "white",
                    }}
                  >
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{
                        borderColor: certTemplate === t.id ? P.darkOlive : P.border,
                      }}
                    >
                      {certTemplate === t.id && (
                        <div className="w-2 h-2 rounded-full" style={{ background: P.darkOlive }} />
                      )}
                    </div>
                    {/* Certificate thumbnail */}
                    <div
                      className="w-10 h-7 rounded flex-shrink-0"
                      style={{
                        background: `linear-gradient(135deg,${t.accent},${P.paleGreen})`,
                        border: `1px solid ${P.border}`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {t.name}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                        Signers: {t.signers.join(", ")}
                      </p>
                    </div>
                    <Eye size={14} className="flex-shrink-0" style={{ color: P.sage }} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Additional settings (existing) ── */}
          <div className="space-y-3">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Additional Settings
            </p>
            {[
              [
                "Enable certificate expiry",
                "Certificate has a validity period and must be renewed",
                false,
              ],
              [
                "Notify learner on issuance",
                "Send an email when the certificate is generated",
                true,
              ],
              [
                "Notify line manager on issuance",
                "Manager receives a copy of the certificate",
                false,
              ],
              [
                "Allow manual issuance by HR",
                "HR can issue a certificate outside of auto-completion",
                false,
              ],
            ].map(([l, d, v]) => (
              <div
                key={l as string}
                className="flex items-start justify-between p-3 rounded-lg gap-3"
                style={{ background: P.bg }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                    {l as string}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                    {d as string}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={v as boolean}
                  style={{
                    accentColor: P.olive,
                    width: 15,
                    height: 15,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Validity Period (months, leave blank for no expiry)
              </label>
              <input
                type="number"
                placeholder="e.g. 24"
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
