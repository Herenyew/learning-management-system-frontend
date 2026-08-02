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

export function MyCoursesAttendeesPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
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
      {builderPanel === "attendees" && (
        <div className="space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Attendee Assignment
          </h2>

          {/* Mode toggle cards */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: "individual" as const,
                label: "Individual Assignment",
                desc: "Assign specific employees by name",
              },
              {
                id: "group" as const,
                label: "Group Assignment",
                desc: "Assign by department, role, or program",
              },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setAssignMode(m.id)}
                className="text-left p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: assignMode === m.id ? P.olive : P.border,
                  background: assignMode === m.id ? P.lightSage : "white",
                }}
              >
                <p className="text-sm font-bold" style={{ color: P.text }}>
                  {m.label}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
                  {m.desc}
                </p>
              </button>
            ))}
          </div>

          {/* Group assignment */}
          {assignMode === "group" && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.text }}>
                Assign by Group
              </p>
              <div className="flex flex-wrap gap-2">
                {["Engineering", "Product", "Sales", "Design", "Finance", "All Employees"].map(
                  (g) => {
                    const active = selectedGroups.includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() =>
                          setSelectedGroups((s) =>
                            s.includes(g) ? s.filter((x) => x !== g) : [...s, g],
                          )
                        }
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
                        style={{
                          borderColor: active ? P.olive : P.border,
                          background: active ? P.lightSage : "white",
                          color: active ? P.darkOlive : P.textMid,
                        }}
                      >
                        <div
                          className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: active ? P.olive : P.border,
                            background: active ? P.darkOlive : "white",
                          }}
                        >
                          {active && (
                            <span className="text-white" style={{ fontSize: 8, lineHeight: 1 }}>
                              ✓
                            </span>
                          )}
                        </div>
                        {g}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Individual picker */}
          {assignMode === "individual" && (
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.text }}>
                Choose Employees
              </p>
              <div className="relative">
                <button
                  onClick={() => setEmployeePickerOpen((open) => !open)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left rounded-lg border bg-white transition-all"
                  style={{ borderColor: P.border, color: P.text }}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Users size={15} style={{ color: P.sage }} />
                    <span className="text-sm truncate">
                      {individuals.length
                        ? `${individuals.length} employee${individuals.length === 1 ? "" : "s"} selected`
                        : "Select employees from directory"}
                    </span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${employeePickerOpen ? "rotate-180" : ""}`}
                    style={{ color: P.textMuted }}
                  />
                </button>

                {employeePickerOpen && (
                  <div
                    className="absolute z-30 mt-2 w-full rounded-xl border bg-white p-2 shadow-lg"
                    style={{ borderColor: P.border }}
                  >
                    <div className="relative mb-2">
                      <Search
                        size={13}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: P.sage }}
                      />
                      <input
                        value={employeePickerSearch}
                        onChange={(e) => setEmployeePickerSearch(e.target.value)}
                        placeholder="Search by name, role, or department..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                        style={{ border: `1px solid ${P.border}`, color: P.text }}
                      />
                    </div>
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {employeePickerResults.map((employee) => {
                        const selected = individuals.some(
                          (person) => person.name === employee.name,
                        );
                        return (
                          <button
                            key={employee.id}
                            onClick={() => toggleIndividualEmployee(employee)}
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-all"
                            style={{
                              background: selected ? P.lightSage : "white",
                              color: P.text,
                            }}
                          >
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                              style={{ background: selected ? P.olive : P.sage }}
                            >
                              {employee.name
                                .split(/\s+/)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold truncate">
                                {employee.name}
                              </span>
                              <span
                                className="block text-[11px] truncate"
                                style={{ color: P.textMuted }}
                              >
                                {employee.role} - {employee.dept}
                              </span>
                            </span>
                            {selected && (
                              <Check
                                size={15}
                                className="flex-shrink-0"
                                style={{ color: P.olive }}
                              />
                            )}
                          </button>
                        );
                      })}
                      {employeePickerResults.length === 0 && (
                        <p className="text-xs text-center py-4" style={{ color: P.textMuted }}>
                          No employees found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assigned individuals list */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: P.text }}>
              Assigned Individuals
            </p>
            <div className="space-y-2">
              {individuals.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: P.border, background: "white" }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                    style={{ background: p.color }}
                  >
                    {p.initials}
                  </div>
                  <p className="flex-1 text-sm font-medium" style={{ color: P.text }}>
                    {p.name}
                  </p>
                  <p className="text-xs flex-shrink-0" style={{ color: P.textMuted }}>
                    {p.role} - {p.dept}
                  </p>
                  <button
                    onClick={() => setIndividuals((i) => i.filter((x) => x.name !== p.name))}
                    className="flex-shrink-0 ml-2"
                    style={{ color: P.textMuted }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {individuals.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: P.textMuted }}>
                  No individuals assigned yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
