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
import { MyCoursesCourseInfoPanel } from "./MyCoursesCourseInfoPanel";
import { MyCoursesContentPanel } from "./MyCoursesContentPanel";
import { MyCoursesVersionPanel } from "./MyCoursesVersionPanel";
import { MyCoursesPublishingPanel } from "./MyCoursesPublishingPanel";
import { MyCoursesGenericPanels } from "./MyCoursesGenericPanels";

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

export function MyCoursesBuilderView({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
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

  const builderNav =
    courseDetails?.placement === "program"
      ? BUILDER_NAV.filter(
          ({ id }) =>
            !["attendees", "visibility", "enrollment"].includes(id),
        )
      : BUILDER_NAV;

  useEffect(() => {
    if (
      courseDetails?.placement === "program" &&
      ["attendees", "visibility", "enrollment"].includes(builderPanel)
    ) {
      setBuilderPanel("info");
    }
  }, [builderPanel, courseDetails?.placement, setBuilderPanel]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Builder left nav */}
      <div
        className="w-[220px] flex-shrink-0 bg-white flex flex-col"
        style={{ borderRight: `1px solid ${P.border}` }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <button
            onClick={() => setOpenBuilder(null)}
            className="flex items-center gap-1.5 text-xs mb-2"
            style={{ color: P.textMuted }}
          >
            <ChevronLeft size={13} /> My Courses
          </button>
          <p className="text-xs font-bold leading-tight" style={{ color: P.text }}>
            {courseDetails?.title ?? course.title}
          </p>
          <Chip
            label={course.status}
            variant={
              course.status === "Published"
                ? "green"
                : course.status === "In Review"
                  ? "gold"
                  : course.status === "Draft"
                    ? "neutral"
                    : "neutral"
            }
          />
        </div>
        <nav className="flex-1 overflow-y-auto py-1">
          {builderNav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setBuilderPanel(id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
              style={
                builderPanel === id
                  ? {
                      background: P.lightSage,
                      color: P.olive,
                      borderLeft: `2px solid ${P.olive}`,
                      paddingLeft: 10,
                    }
                  : { color: P.textMuted }
              }
            >
              <Icon size={14} className="flex-shrink-0" />
              <span className="text-[12px] font-medium">{label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: `1px solid ${P.border}` }}>
          <button
            onClick={saveActiveCourse}
            className="w-full py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: P.olive }}
            data-prototype-action="true"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Builder content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        <MyCoursesCourseInfoPanel ctx={ctx} />
        <MyCoursesContentPanel ctx={ctx} />
        <MyCoursesVersionPanel ctx={ctx} />
        <MyCoursesPublishingPanel ctx={ctx} />
        <MyCoursesGenericPanels ctx={ctx} />
      </div>
      {activeCertificateTemplateReview && (
        <CertificateTemplateReviewModal
          template={activeCertificateTemplateReview}
          courseTitle={courseDetails?.title ?? course.title}
          score={certScore}
          selected={certTemplate === activeCertificateTemplateReview.id}
          onUse={() => {
            setCertTemplate(activeCertificateTemplateReview.id);
            setCertTemplateReview(null);
          }}
          onClose={() => setCertTemplateReview(null)}
        />
      )}
    </div>
  );
}
