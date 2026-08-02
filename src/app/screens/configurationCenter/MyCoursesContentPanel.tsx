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

export function MyCoursesContentPanel({ ctx }: { ctx: MyCoursesBuilderViewContext }) {
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
      {/* ── Content & Chapters ── */}
      {builderPanel === "content" && (
        <div className="max-w-2xl space-y-4">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Content & Chapters
          </h2>
          <div className="space-y-3">
            {(courseDetails?.chapters ?? []).map((chapter) => {
              const mod = chapter.title;

              return (
                <div
                  key={mod}
                  className="bg-white rounded-xl border overflow-hidden"
                  style={{ borderColor: P.border }}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ background: P.paleGreen }}
                  >
                    <p className="text-xs font-bold flex-1" style={{ color: P.text }}>
                      {mod}
                    </p>
                    <button
                      className="text-[10px] font-medium"
                      style={{ color: P.olive }}
                      data-prototype-action="true"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        updateActiveCourseDraft((draft) => ({
                          ...draft,
                          chapters: draft.chapters.filter((item) => item.title !== mod),
                        }))
                      }
                      className="p-1 rounded"
                    >
                      <Trash2 size={12} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                  <div className="divide-y" style={{ borderColor: P.border }}>
                    {chapter.contentItems.length ? (
                      chapter.contentItems.map((item) => {
                        const Icon =
                          item.type === "Video"
                            ? Video
                            : item.type === "Document"
                              ? FileText
                              : item.type === "Quiz"
                                ? HelpCircle
                                : item.type === "SCORM / xAPI"
                                  ? Cpu
                                  : item.type === "Audio"
                                    ? Music
                                    : item.type === "Interactive Video"
                                      ? Activity
                                      : item.type === "Assignment"
                                        ? FileCheck
                                        : item.type === "Survey"
                                          ? MessageSquare
                                          : item.type === "Live Session"
                                            ? Users
                                            : Link;
                        const iconColor =
                          item.type === "Video" || item.type === "Live Session"
                            ? P.olive
                            : item.type === "Document"
                              ? P.darkOlive
                              : item.type === "Quiz"
                                ? P.gold
                                : P.sage;
                        const attachments = getContentItemAttachments(item);

                        return (
                          <div key={`${mod}-${item.type}-${item.title}`} className="px-4 py-2.5">
                            <div className="flex items-center gap-3">
                              <Icon size={13} style={{ color: iconColor }} />
                              <p className="text-xs flex-1 min-w-0" style={{ color: P.text }}>
                                {item.title}
                              </p>
                              <span
                                className="text-[10px] font-mono flex-shrink-0"
                                style={{ color: P.textMuted }}
                              >
                                {item.duration}
                              </span>
                              <Chip label={item.type} variant="neutral" />
                              <button className="p-1" data-prototype-action="true">
                                <Edit size={11} style={{ color: P.sage }} />
                              </button>
                            </div>
                            {attachments.length > 0 && (
                              <div className="mt-2 ml-6 flex flex-wrap gap-1.5">
                                {attachments.map((attachment, attachmentIndex) => {
                                  const AttachmentIcon =
                                    attachment.source === "External link"
                                      ? Link
                                      : attachment.source === "Device upload"
                                        ? Upload
                                        : FileText;

                                  return (
                                    <div
                                      key={`${attachment.name}-${attachmentIndex}`}
                                      className="inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2 py-1"
                                      style={{
                                        borderColor: P.border,
                                        background: P.bg,
                                        color: P.textMuted,
                                      }}
                                    >
                                      <AttachmentIcon
                                        size={11}
                                        className="flex-shrink-0"
                                        style={{ color: P.sage }}
                                      />
                                      <span
                                        className="max-w-[190px] truncate text-[10px] font-medium"
                                        style={{ color: P.text }}
                                      >
                                        {attachment.name}
                                      </span>
                                      <span
                                        className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                                        style={{
                                          background: P.lightSage,
                                          color: P.olive,
                                        }}
                                      >
                                        {attachment.source}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-xs" style={{ color: P.textMuted }}>
                        No content items added yet.
                      </div>
                    )}
                    {(moduleQuizzes[mod] || []).map((item, idx) => (
                      <QuizRow
                        key={idx}
                        item={item}
                        onPreview={() => setPreviewQuiz(item)}
                        onDelete={() =>
                          setModuleQuizzes((p) => ({
                            ...p,
                            [mod]: (p[mod] || []).filter((_, i) => i !== idx),
                          }))
                        }
                      />
                    ))}
                  </div>
                  <div
                    className="px-4 py-2.5 flex items-center gap-3"
                    style={{ borderTop: `1px solid ${P.border}` }}
                  >
                    <button
                      onClick={() => {
                        setActiveContentChapter(mod);
                        setShowAddItem(true);
                      }}
                      disabled={allowedCreatorContentTypes.length === 0}
                      className="flex items-center gap-1.5 text-xs font-medium"
                      style={{
                        color: allowedCreatorContentTypes.length === 0 ? P.textMuted : P.olive,
                      }}
                    >
                      <PlusCircle size={13} /> Add Item
                    </button>
                    {canAddQuiz && (
                      <>
                        <div className="w-px h-3.5" style={{ background: P.border }} />
                        <button
                          onClick={() => {
                            setActiveQuizModule(mod);
                            setShowQuizWorkflow(true);
                          }}
                          className="flex items-center gap-1.5 text-xs font-medium"
                          style={{ color: "#C8A85D" }}
                        >
                          <HelpCircle size={13} /> Add Quiz
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <button
              onClick={() =>
                updateActiveCourseDraft((draft) => ({
                  ...draft,
                  chapters: [
                    ...draft.chapters,
                    {
                      title: `Chapter ${draft.chapters.length + 1}: New Chapter`,
                      contentItems: [],
                    },
                  ],
                }))
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium w-full"
              style={{ border: `2px dashed ${P.sage}`, color: P.olive }}
            >
              <Plus size={13} /> Add Module / Chapter
            </button>
            {(canAddQuiz || currentCourseEndQuizzes.length > 0) && (
              <div
                className="bg-white rounded-xl border overflow-hidden"
                style={{ borderColor: P.border }}
              >
                <div
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ background: P.goldLight }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "#C8A85D22" }}
                  >
                    <HelpCircle size={14} style={{ color: P.gold }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold" style={{ color: P.text }}>
                      End-of-Course Chapter Quiz
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Appears after learners complete all modules and uses the same setup as
                      chapter-wise quizzes.
                    </p>
                  </div>
                  <Chip
                    label={currentCourseEndQuizzes.length ? "Configured" : "Required"}
                    variant={currentCourseEndQuizzes.length ? "green" : "gold"}
                  />
                </div>
                <div className="divide-y" style={{ borderColor: P.border }}>
                  {currentCourseEndQuizzes.length ? (
                    currentCourseEndQuizzes.map((item, idx) => (
                      <QuizRow
                        key={`${item.title}-${idx}`}
                        item={item}
                        onPreview={() => setPreviewQuiz(item)}
                        onDelete={() =>
                          setCourseEndQuizzes((p) => ({
                            ...p,
                            [course.id]: (p[course.id] || []).filter((_, i) => i !== idx),
                          }))
                        }
                      />
                    ))
                  ) : (
                    <div className="px-4 py-3 text-xs" style={{ color: P.textMuted }}>
                      No course-end quiz added yet.
                    </div>
                  )}
                </div>
                <div
                  className="px-4 py-2.5"
                  style={{ borderTop: `1px solid ${P.border}`, background: P.bg }}
                >
                  <button
                    onClick={() => setShowCourseQuizWorkflow(true)}
                    className="flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: "#C8A85D" }}
                  >
                    <HelpCircle size={13} />
                    {currentCourseEndQuizzes.length ? "Add Another Course Quiz" : "Add Course Quiz"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Item Modal */}
          {showAddItem && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
              onClick={() => {
                setShowAddItem(false);
                setShowQuizModal(false);
                setActiveContentChapter(null);
              }}
            >
              <ContentWorkflowModal
                allowedTypes={allowedCreatorContentTypes}
                questionTypeConfig={questionTypes}
                onClose={() => {
                  setShowAddItem(false);
                  setShowQuizModal(false);
                  setActiveContentChapter(null);
                }}
                onSaveItem={(item) => {
                  const targetChapter =
                    activeContentChapter ?? courseDetails?.chapters[0]?.title ?? null;
                  if (targetChapter) {
                    updateActiveCourseDraft((draft) => ({
                      ...draft,
                      chapters: draft.chapters.map((chapter) =>
                        chapter.title === targetChapter
                          ? {
                              ...chapter,
                              contentItems: [
                                ...chapter.contentItems,
                                createCourseContentItemFromSaved(item),
                              ],
                            }
                          : chapter,
                      ),
                    }));
                  }
                  setShowAddItem(false);
                  setShowQuizModal(false);
                  setActiveContentChapter(null);
                }}
              />
            </div>
          )}
          {/* Quiz preview modal */}
          {previewQuiz && (
            <QuizPreviewModal item={previewQuiz} onClose={() => setPreviewQuiz(null)} />
          )}

          {/* Add Quiz modal — opened from per-module "Add Quiz" button */}
          {canAddQuiz && showQuizWorkflow && activeQuizModule && (
            <QuizOnlyModal
              moduleName={activeQuizModule}
              questionTypeConfig={questionTypes}
              onClose={() => {
                setShowQuizWorkflow(false);
                setActiveQuizModule(null);
              }}
              onSave={(item) => {
                setModuleQuizzes((p) => ({
                  ...p,
                  [activeQuizModule]: [...(p[activeQuizModule] || []), item],
                }));
                setShowQuizWorkflow(false);
                setActiveQuizModule(null);
              }}
            />
          )}
          {canAddQuiz && showCourseQuizWorkflow && (
            <QuizOnlyModal
              moduleName={`${courseDetails?.title ?? course.title} · End-of-Course Quiz`}
              questionTypeConfig={questionTypes}
              onClose={() => setShowCourseQuizWorkflow(false)}
              onSave={(item) => {
                setCourseEndQuizzes((p) => ({
                  ...p,
                  [course.id]: [...(p[course.id] || []), item],
                }));
                setShowCourseQuizWorkflow(false);
              }}
            />
          )}
        </div>
      )}
    </>
  );
}
