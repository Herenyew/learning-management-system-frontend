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

export function MyCoursesPublishingPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
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
      {/* ── Publishing (read-only) ── */}
      {builderPanel === "publishing" && (
        <div className="max-w-xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Publishing Status
          </h2>
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
          >
            <Lock size={16} style={{ color: P.gold, marginTop: 2, flexShrink: 0 }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: "#8A6A1A" }}>
                Publishing Requires HR/Admin Approval
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9A7A20" }}>
                Creators cannot directly publish. Submit for review — HR will approve or reject and
                you'll be notified at each stage.
              </p>
            </div>
          </div>
          <div
            className="bg-white rounded-xl border p-5 space-y-3"
            style={{ borderColor: P.border }}
          >
            {[
              {
                s: "Draft",
                d: "Saved locally, not submitted.",
                done: false,
                current: course.status === "Draft",
              },
              {
                s: "In Review",
                d: "Submitted to HR/Admin for review.",
                done: ["Approved", "Published"].includes(course.status),
                current: course.status === "In Review",
              },
              {
                s: "Approved",
                d: "Approved — pending final publish.",
                done: course.status === "Published",
                current: course.status === "Approved",
              },
              {
                s: "Published",
                d: "Live and visible to learners.",
                done: false,
                current: course.status === "Published",
              },
            ].map(({ s, d, done, current }) => (
              <div
                key={s}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: current ? P.lightSage : P.bg,
                  border: `1px solid ${current ? P.olive : P.border}`,
                }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: done ? "#5A7A2A" : current ? P.olive : P.border }}
                >
                  {done ? (
                    <Check size={12} className="text-white" />
                  ) : (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: current ? "white" : P.textMuted }}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    {s}
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {d}
                  </p>
                </div>
                <Chip
                  label={s}
                  variant={
                    s === "Published"
                      ? "green"
                      : s === "Approved"
                        ? "sage"
                        : s === "In Review"
                          ? "gold"
                          : "neutral"
                  }
                />
              </div>
            ))}
          </div>
          {course.status === "Draft" && (
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: P.olive }}
              data-prototype-action="true"
            >
              <Send size={14} /> Submit for HR Review
            </button>
          )}
        </div>
      )}
    </>
  );
}
