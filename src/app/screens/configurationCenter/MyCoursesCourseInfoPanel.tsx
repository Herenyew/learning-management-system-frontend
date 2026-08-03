// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useRef, useState } from "react";
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

const COURSE_PROGRAM_OPTIONS = [
  { id: "adiu-onboarding", name: "ADIU Onboarding Program" },
  { id: "future-leaders", name: "Future Leaders Initiative" },
  { id: "regulatory-2025", name: "2025 Regulatory Compliance Pack" },
  { id: "engineering-excellence", name: "Engineering Excellence Track" },
  { id: "graduate-talent", name: "Graduate Talent Program" },
] as const;

export function MyCoursesCourseInfoPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
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

  const coursePlacement = courseDetails?.placement ?? "standalone";
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [thumbnailError, setThumbnailError] = useState("");

  const changeThumbnail = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setThumbnailError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setThumbnailError("Thumbnail must be 2 MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateActiveCourseDraft((draft) => ({ ...draft, thumbnail: reader.result as string }));
      setThumbnailError("");
    };
    reader.onerror = () => setThumbnailError("Could not read that image.");
    reader.readAsDataURL(file);
  };

  const updateCoursePlacement = (placement: "standalone" | "program") => {
    const defaultProgram = COURSE_PROGRAM_OPTIONS[0];
    updateActiveCourseDraft((draft) =>
      placement === "program"
        ? {
            ...draft,
            placement,
            programId: draft.programId ?? defaultProgram.id,
            programName: draft.programName ?? defaultProgram.name,
          }
        : {
            ...draft,
            placement,
            programId: undefined,
            programName: undefined,
          },
    );
  };

  const selectProgram = (programId: string) => {
    const selected =
      COURSE_PROGRAM_OPTIONS.find((program) => program.id === programId) ??
      COURSE_PROGRAM_OPTIONS[0];
    updateActiveCourseDraft((draft) => ({
      ...draft,
      placement: "program",
      programId: selected.id,
      programName: selected.name,
    }));
  };

  return (
    <>
      {/* ── Course Information ── */}
      {builderPanel === "info" && (
        <div className="max-w-2xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Course Information
          </h2>
          {courseDetails && courseDetails.sourceLabel !== "Existing Course" && (
            <div
              className="flex items-start gap-2 rounded-xl border px-4 py-3"
              style={{ borderColor: P.border, background: P.paleGreen }}
            >
              <Bookmark size={14} className="mt-0.5 flex-shrink-0" style={{ color: P.olive }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  Started from {courseDetails.sourceLabel}
                </p>
                <p className="text-[11px]" style={{ color: P.textMuted }}>
                  This is an editable course copy. Changes here will not modify the reusable company
                  template.
                </p>
              </div>
            </div>
          )}

          {/* Thumbnail preview */}
          <div className="relative rounded-xl overflow-hidden" style={{ height: 160 }}>
            <img
              src={courseDetails?.thumbnail ?? course.thumb}
              alt={`${courseDetails?.title ?? course.title} thumbnail`}
              className="w-full h-full object-cover"
              style={{ filter: "brightness(0.75)" }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <input
                ref={thumbnailInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={changeThumbnail}
              />
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                style={{ background: "rgba(0,0,0,0.5)" }}
                onClick={() => thumbnailInputRef.current?.click()}
                aria-label="Upload a course thumbnail from this device"
                data-prototype-action="true"
              >
                <Upload size={15} /> Change Thumbnail
              </button>
            </div>
          </div>
          {thumbnailError && (
            <p className="mt-2 text-xs text-red-600" role="alert">
              {thumbnailError}
            </p>
          )}

          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={courseDetails?.title ?? course.title}
                onChange={(event) =>
                  updateActiveCourseDraft((draft) => ({ ...draft, title: event.target.value }))
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={courseDetails?.description ?? ""}
                onChange={(event) =>
                  updateActiveCourseDraft((draft) => ({
                    ...draft,
                    description: event.target.value,
                  }))
                }
                placeholder="Describe what learners will gain…"
                className="w-full px-3 py-2 text-sm rounded-lg resize-none bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-semibold" style={{ color: P.textMid }}>
                Course placement <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={coursePlacement === "standalone"}
                  onClick={() => updateCoursePlacement("standalone")}
                  className="rounded-lg border p-3 text-left transition-colors"
                  style={{
                    borderColor: coursePlacement === "standalone" ? P.olive : P.border,
                    background: coursePlacement === "standalone" ? P.paleGreen : "#fff",
                  }}
                >
                  <span className="block text-sm font-semibold" style={{ color: P.text }}>
                    Standalone course
                  </span>
                  <span className="mt-1 block text-[11px]" style={{ color: P.textMuted }}>
                    Set visibility and enrollment for this course.
                  </span>
                </button>
                <button
                  type="button"
                  aria-pressed={coursePlacement === "program"}
                  onClick={() => updateCoursePlacement("program")}
                  className="rounded-lg border p-3 text-left transition-colors"
                  style={{
                    borderColor: coursePlacement === "program" ? P.olive : P.border,
                    background: coursePlacement === "program" ? P.paleGreen : "#fff",
                  }}
                >
                  <span className="block text-sm font-semibold" style={{ color: P.text }}>
                    Learning program
                  </span>
                  <span className="mt-1 block text-[11px]" style={{ color: P.textMuted }}>
                    Inherit learners from a selected program.
                  </span>
                </button>
              </div>
              {coursePlacement === "program" && (
                <div
                  className="rounded-lg border p-3"
                  style={{ borderColor: P.border, background: P.paleGreen }}
                >
                  <label
                    className="mb-1.5 block text-xs font-semibold"
                    style={{ color: P.textMid }}
                  >
                    Learning program <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={courseDetails?.programId ?? COURSE_PROGRAM_OPTIONS[0].id}
                    onChange={(event) => selectProgram(event.target.value)}
                    className="w-full rounded-lg bg-white px-3 py-2 text-sm focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {COURSE_PROGRAM_OPTIONS.map((program) => (
                      <option key={program.id} value={program.id}>
                        {program.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-[11px]" style={{ color: P.textMuted }}>
                    Program learners receive this course automatically. Visibility and enrollment
                    are inherited.
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={courseDetails?.category ?? course.category}
                  onChange={(event) =>
                    updateActiveCourseDraft((draft) => ({
                      ...draft,
                      category: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                >
                  {categoryOptions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={courseDetails?.level ?? course.level}
                  onChange={(event) =>
                    updateActiveCourseDraft((draft) => ({
                      ...draft,
                      level: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                >
                  {levelOptions.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Estimated Duration
              </label>
              <input
                value={courseDetails?.duration ?? "8h 30m"}
                onChange={(event) =>
                  updateActiveCourseDraft((draft) => ({
                    ...draft,
                    duration: event.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>

            {/* Contact Person — searchable dropdown */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Contact Person <span className="text-red-500">*</span>
              </label>
              <p className="text-[10px] mb-1.5" style={{ color: P.textMuted }}>
                Select from employee directory. Populated from HR database.
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowContactDrop(!showContactDrop)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg bg-white"
                  style={{
                    border: `1px solid ${selectedContact ? P.olive : P.border}`,
                    color: P.text,
                  }}
                >
                  {selectedContact ? (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: P.olive }}
                      >
                        {selectedContact.name[0]}
                      </div>
                      <span className="font-medium">{selectedContact.name}</span>
                      <span className="text-xs" style={{ color: P.textMuted }}>
                        · {selectedContact.dept}
                      </span>
                    </div>
                  ) : (
                    <span style={{ color: P.textMuted }}>Select Contact Person ▼</span>
                  )}
                  <ChevronDown size={14} style={{ color: P.textMuted }} />
                </button>
                {showContactDrop && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-xl border overflow-hidden"
                    style={{ borderColor: P.border }}
                  >
                    <div className="p-2" style={{ borderBottom: `1px solid ${P.border}` }}>
                      <div className="relative">
                        <Search
                          size={12}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2"
                          style={{ color: P.sage }}
                        />
                        <input
                          value={contactSearch}
                          onChange={(e) => setContactSearch(e.target.value)}
                          placeholder="Search employees…"
                          className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                          style={{ border: `1px solid ${P.border}`, color: P.text }}
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredEmployees.map((emp) => (
                        <button
                          key={emp.id}
                          onClick={() => {
                            setSelectedContact(emp);
                            setShowContactDrop(false);
                            setContactSearch("");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F6FEFA] transition-colors text-left"
                          style={{ borderBottom: `1px solid ${P.border}50` }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                            style={{ background: P.sage }}
                          >
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: P.text }}>
                              {emp.name}
                            </p>
                            <p className="text-[10px]" style={{ color: P.textMuted }}>
                              {emp.role} · {emp.dept}
                            </p>
                          </div>
                          {selectedContact?.id === emp.id && (
                            <Check size={13} className="ml-auto" style={{ color: P.olive }} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedContact && (
                <div className="mt-2 p-3 rounded-lg" style={{ background: P.lightSage }}>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {selectedContact.name}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {selectedContact.role} · {selectedContact.dept} · {selectedContact.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Prerequisite Courses */}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Prerequisite Courses
              </label>
              <div className="flex gap-2 mb-2">
                {[
                  ["all", "Complete ALL selected"],
                  ["any", "Complete ANY one"],
                ].map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setPrereqMode(v as "all" | "any")}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={
                      prereqMode === v
                        ? { background: P.olive, color: "white" }
                        : {
                            background: "white",
                            border: `1px solid ${P.border}`,
                            color: P.textMid,
                          }
                    }
                  >
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {prereqs.map((p) => (
                  <div
                    key={p}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ background: P.lightSage, color: P.darkOlive }}
                  >
                    <Check size={10} /> {p}
                    <button onClick={() => setPrereqs((prev) => prev.filter((x) => x !== p))}>
                      <X size={10} className="ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: P.sage }}
                />
                <input
                  value={prereqSearch}
                  onChange={(e) => setPrereqSearch(e.target.value)}
                  placeholder="Search and add prerequisite course…"
                  className="w-full pl-7 pr-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
                {prereqSearch && (
                  <div
                    className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-xl shadow-lg border overflow-hidden"
                    style={{ borderColor: P.border }}
                  >
                    {filteredCourses.slice(0, 4).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          if (!prereqs.includes(c.title)) setPrereqs((p) => [...p, c.title]);
                          setPrereqSearch("");
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#F6FEFA] text-left"
                        style={{ borderBottom: `1px solid ${P.border}50` }}
                      >
                        <img src={c.thumb} alt="" className="w-8 h-5 rounded object-cover" />
                        <p className="text-xs" style={{ color: P.text }}>
                          {c.title}
                        </p>
                        {prereqs.includes(c.title) && (
                          <Check size={12} className="ml-auto" style={{ color: P.olive }} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
