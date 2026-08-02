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

export function MyCoursesEnrollmentPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
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
      {builderPanel === "enrollment" && (
        <div className="space-y-4">
          <p className="text-sm font-bold" style={{ color: P.text }}>
            Enrollment Configuration
          </p>

          {/* Enrollment type radio cards */}
          <div
            className="rounded-2xl border p-3 space-y-2"
            style={{ borderColor: P.border, background: "white" }}
          >
            {[
              {
                id: "open",
                label: "Open",
                tag: "Recommended for most courses",
                tagColor: "#5A7A2A",
                tagBg: "#D8EDCC",
                desc: "Anyone can enroll without approval",
              },
              {
                id: "invitation",
                label: "Invitation",
                tag: "Useful for exclusive cohorts",
                tagColor: "#8A6A1A",
                tagBg: P.goldLight,
                desc: "Learners must be invited by admin or manager",
              },
              {
                id: "paid",
                label: "Paid",
                tag: "For external courses with a fee",
                tagColor: P.darkOlive,
                tagBg: P.lightSage,
                desc: "Learners must purchase access",
              },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setEnrollType(opt.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: enrollType === opt.id ? P.darkOlive : P.border,
                  background: enrollType === opt.id ? P.lightSage : "white",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: enrollType === opt.id ? P.darkOlive : P.textMuted,
                  }}
                >
                  {enrollType === opt.id && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: P.darkOlive }} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold" style={{ color: P.text }}>
                      {opt.label}
                    </p>
                    <span
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: opt.tagBg, color: opt.tagColor }}
                    >
                      {opt.tag}
                    </span>
                  </div>
                  <p className="text-[11px]" style={{ color: P.textMuted }}>
                    {opt.desc}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div
            className="rounded-2xl border p-4 space-y-3"
            style={{ borderColor: P.border, background: "white" }}
          >
            <div>
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                Pre-course Baseline Assessment
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
                Decide whether learners see a baseline quiz before they can enroll.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-2">
              {[
                {
                  id: "disabled" as const,
                  label: "Disabled",
                  desc: "Enroll immediately without a baseline quiz",
                  icon: CheckCircle,
                },
                {
                  id: "optional" as const,
                  label: "Optional",
                  desc: "Learners may skip and still enroll",
                  icon: HelpCircle,
                },
                {
                  id: "mandatory" as const,
                  label: "Mandatory",
                  desc: "Learners must submit before enrollment",
                  icon: Lock,
                },
              ].map(({ id, label, desc, icon: Icon }) => {
                const selected = activePreCourseAssessment === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() =>
                      updateActiveCourseDraft((draft) => ({
                        ...draft,
                        preCourseAssessment: id,
                      }))
                    }
                    className="rounded-xl border-2 p-3 text-left transition-all"
                    style={{
                      borderColor: selected ? P.darkOlive : P.border,
                      background: selected ? P.lightSage : P.bg,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: selected ? P.darkOlive : "white",
                          color: selected ? "white" : P.olive,
                        }}
                      >
                        <Icon size={13} />
                      </span>
                      <span className="text-xs font-bold" style={{ color: P.text }}>
                        {label}
                      </span>
                    </div>
                    <p className="text-[10px] leading-relaxed" style={{ color: P.textMuted }}>
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paid-only fields */}
          {enrollType === "paid" && (
            <div
              className="rounded-2xl border p-4 space-y-4"
              style={{ borderColor: P.border, background: "white" }}
            >
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.text }}>
                  Course Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  defaultValue="0.00"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.text }}>
                  Payment Gateway
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                >
                  <option value="">Select Payment Gateway...</option>
                  <option>Stripe</option>
                  <option>PayPal</option>
                  <option>Flutterwave</option>
                  <option>Telebirr</option>
                  <option>Bank Transfer</option>
                </select>
              </div>
            </div>
          )}

          {/* Existing settings */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Enrollment Capacity", "200"],
              ["Waitlist Limit", "50"],
            ].map(([l, v]) => (
              <div key={l}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  {l}
                </label>
                <input
                  type="number"
                  defaultValue={v}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            ))}
          </div>
          {[
            ["Enable waitlist", "Place learners on a waitlist when course is full", true],
            ["Require manager approval", "Self-enrollments need manager sign-off", false],
            ["Enforce prerequisites", "Block enrollment if prerequisites are not complete", true],
            ["Allow unenrollment", "Learners can drop the course before deadline", true],
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
                <p className="text-[10px]" style={{ color: P.textMuted }}>
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
              Enrollment Deadline
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option>No deadline (open enrollment)</option>
              <option>7 days before start</option>
              <option>14 days before start</option>
              <option>Custom date</option>
            </select>
          </div>
        </div>
      )}
    </>
  );
}
