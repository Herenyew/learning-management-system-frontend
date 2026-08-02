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
import type { MyCoursesDashboardViewContext } from "./MyCoursesDashboard.types";

export function MyCoursesDashboardHome({ ctx }: { ctx: MyCoursesDashboardViewContext }) {
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
    <div className="p-6 space-y-5 max-w-[1200px]">
      {showCourseTemplateChooser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
          onClick={() => setShowCourseTemplateChooser(false)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white border shadow-2xl overflow-hidden"
            style={{ borderColor: P.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 px-5 py-4"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <div>
                <p className="text-base font-bold" style={{ color: P.text }}>
                  Create Course
                </p>
                <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                  Start with an editable copy of a company template or build a custom course from
                  scratch.
                </p>
              </div>
              <button
                onClick={() => setShowCourseTemplateChooser(false)}
                className="p-1.5 rounded-lg"
                style={{ color: P.textMuted, border: `1px solid ${P.border}` }}
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5 space-y-4 max-h-[72vh] overflow-y-auto">
              <button
                onClick={() => createDraftCourse(createCustomCourseDraft())}
                className="w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:shadow-md"
                style={{ borderColor: P.olive, background: P.paleGreen }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: P.olive }}
                >
                  <Plus size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    Custom Course Creation
                  </p>
                  <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                    Start with a blank draft and define your own course title, chapters, content,
                    XP, and pass threshold.
                  </p>
                </div>
                <ChevronRight size={16} style={{ color: P.olive }} />
              </button>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: P.textMuted }}
                  >
                    Company Course Templates
                  </p>
                  <Chip label={`${activeCompanyCourseTemplates.length} active`} variant="sage" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {activeCompanyCourseTemplates.map((template) => {
                    const itemCount = template.chapters.reduce(
                      (sum, chapter) => sum + chapter.contentItems.length,
                      0,
                    );

                    return (
                      <button
                        key={template.id}
                        onClick={() => createDraftCourse(createCourseDraftFromTemplate(template))}
                        className="rounded-xl border p-4 text-left transition-all hover:shadow-md bg-white"
                        style={{ borderColor: P.border }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: P.lightSage }}
                          >
                            <BookOpen size={15} style={{ color: P.olive }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold" style={{ color: P.text }}>
                              {template.name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                              {template.title}
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] mt-3 line-clamp-2" style={{ color: P.textMuted }}>
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <Chip label={template.category} variant="neutral" />
                          <Chip label={template.level} variant="neutral" />
                          <Chip label={`${template.chapters.length} chapters`} variant="sage" />
                          <Chip label={`${itemCount} items`} variant="sage" />
                        </div>
                        <div
                          className="flex items-center justify-between mt-3 pt-3"
                          style={{ borderTop: `1px solid ${P.border}` }}
                        >
                          <span className="text-[11px] font-semibold" style={{ color: P.olive }}>
                            {template.xpValue} XP
                          </span>
                          <span className="text-[11px] font-semibold" style={{ color: P.textMid }}>
                            Pass {template.passThreshold}%
                          </span>
                        </div>
                        <div
                          className="mt-3 rounded-lg px-3 py-2 text-[11px] font-semibold"
                          style={{ background: P.paleGreen, color: P.olive }}
                        >
                          Use editable copy
                        </div>
                      </button>
                    );
                  })}
                  {!activeCompanyCourseTemplates.length && (
                    <div
                      className="sm:col-span-2 rounded-xl border p-4 text-xs"
                      style={{ borderColor: P.border, color: P.textMuted, background: P.bg }}
                    >
                      No active company templates yet. HR/Admin can activate templates from
                      Configuration Center.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <PageHeader
        title="My Courses"
        sub="Manage, edit, and track all courses you have created"
        actions={
          <button
            onClick={openCourseTemplateChooser}
            className="flex items-center gap-1.5 px-4 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> Create New Course
          </button>
        }
      />

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Published", value: statusCounts.Published ?? 0, color: "#5A7A2A" },
          { label: "In Review", value: statusCounts["In Review"] ?? 0, color: P.gold },
          { label: "Draft", value: statusCounts.Draft ?? 0, color: P.textMid },
          { label: "Archived", value: statusCounts.Archived ?? 0, color: P.textMuted },
        ].map(({ label, value, color }) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className="bg-white rounded-xl border p-4 text-left transition-all hover:shadow-md"
            style={{ borderColor: filter === label ? P.olive : P.border }}
          >
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color }}
            >
              {value}
            </p>
            <p className="text-xs font-medium mt-0.5" style={{ color: P.textMuted }}>
              {label}
            </p>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2"
            style={{ color: P.sage }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your courses…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
        </div>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={
                filter === s
                  ? { background: P.olive, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-stretch">
              <div className="w-36 flex-shrink-0 relative overflow-hidden">
                <img
                  src={c.thumb}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.78)" }}
                />
              </div>
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {c.title}
                  </p>
                  <Chip
                    label={c.status}
                    variant={
                      c.status === "Published"
                        ? "green"
                        : c.status === "In Review"
                          ? "gold"
                          : c.status === "Draft"
                            ? "neutral"
                            : "neutral"
                    }
                  />
                </div>
                <p className="text-xs mb-2" style={{ color: P.textMuted }}>
                  {c.category} · {c.level}
                </p>
                <div className="flex items-center gap-4 text-[11px]" style={{ color: P.textMuted }}>
                  {c.enrolled > 0 && (
                    <span className="flex items-center gap-1">
                      <Users size={11} />
                      {c.enrolled.toLocaleString()} enrolled
                    </span>
                  )}
                  {c.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star size={11} className="text-amber-500 fill-amber-500" />
                      {c.rating}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 p-4 flex-shrink-0 justify-center">
                <button
                  onClick={() => openCourseBuilder(c.id, "info")}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: P.olive }}
                >
                  Open Builder
                </button>
                <button
                  onClick={() => openCourseBuilder(c.id, "analytics")}
                  className="px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                >
                  Analytics
                </button>
                {c.status === "Published" && (
                  <button
                    onClick={() =>
                      setCourses((items) =>
                        items.map((item) =>
                          item.id === c.id ? { ...item, status: "Archived" } : item,
                        ),
                      )
                    }
                    className="px-4 py-2 rounded-lg text-xs font-medium"
                    style={{ border: `1px solid ${P.border}`, color: "#C0392B" }}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
