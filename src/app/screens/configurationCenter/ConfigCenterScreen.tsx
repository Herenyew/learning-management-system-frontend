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
  CertificateTemplatesCrud,
  CourseTemplatesCrud,
  EnrollmentRulesCrud,
  NotificationEventsCrud,
  NotificationsCrud,
  ProgramTemplatesCrud,
  ProgramTypesCrud,
  AssessmentTemplatesCrud,
  WorkflowsCrud,
  XPRulesCrud,
} from "../../Extensions5";
import {
  BookOpen,
  Award,
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
  Shield,
  ShieldCheck,
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
  Activity,
  Cpu,
  Music,
  RefreshCw,
  GitBranch,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
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
  Layers as LayersIcon,
  LayoutGrid,
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

// ─── Backend-mirroring configuration sections ────────────────────────────────
// Sub-tab order follows each backend module's route declaration order.
import { assessmentConfigApi } from "../../API/assessment-config.api";
import { certificateConfigApi } from "../../API/certificate-config.api";
import { enrollmentApi } from "../../API/enrollment.api";
import { audienceApi } from "../../API/audience.api";
import { catalogConfigurationApi } from "../../API/catalogConfiguration.api";
import {
  createEntityCrud,
  StatusBadge,
  type CrudColumn,
  type CrudRow,
} from "../adminRecords/adminRecords.shared";

const slugifyLocal = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const asArray = <T,>(x: unknown): T[] =>
  Array.isArray(x) ? x : ((x as { items?: T[] })?.items ?? []);

function ModuleTabs({ tabs, active, onChange }: { tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap pb-1" role="tablist">
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button key={t.id} role="tab" aria-selected={isActive} onClick={() => onChange(t.id)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors"
            style={isActive ? { background: P.olive, color: "white" } : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

const cfgStatusCol: CrudColumn<CrudRow> = { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> };
const cfgNameCol: CrudColumn<CrudRow> = { key: "name", label: "Name", sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{String(r.name)}</p> };
// ── FACTORY_CONT ──

const CourseCategoriesCrud = createEntityCrud({
  title: "Course Categories",
  sub: "Taxonomy used to organize the course catalog",
  icon: BookOpen,
  viewPermission: "course_category.view",
  load: (s) => catalogConfigurationApi.listCategories({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", color: d.color ?? "", icon: d.icon ?? "", description: d.description ?? "", displayOrder: d.displayOrder ?? "", isVisible: d.isVisible ? "Visible" : "Hidden", status: d.isActive ? "Active" : "Disabled" }),
  columns: [
    cfgNameCol,
    { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> },
    { key: "color", label: "Color", render: (r) => <span className="inline-block w-3 h-3 rounded-full border align-middle" style={{ background: String(r.color || P.olive), borderColor: P.border }} /> },
    { key: "isVisible", label: "Visibility", sortable: true, render: (r) => <StatusBadge status={r.isVisible === "Visible" ? "Active" : "Disabled"} /> },
    { key: "displayOrder", label: "Order" },
    cfgStatusCol,
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Technology" },
    { key: "slug", label: "Slug (auto from name)", type: "text", placeholder: "auto-generated", autoSlugFrom: "name" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "color", label: "Color", type: "color" },
    { key: "icon", label: "Icon", type: "text", placeholder: "e.g. Code (icon key)" },
    { key: "displayOrder", label: "Display Order", type: "number" },
    { key: "isVisible", label: "Visibility", type: "select", options: [{ value: "Visible", label: "Visible" }, { value: "Hidden", label: "Hidden" }] },
  ],
  buildInput: (f) => ({ name: f.name, slug: String(f.slug || slugifyLocal(String(f.name))), description: f.description ? String(f.description) : undefined, color: f.color ? String(f.color) : undefined, icon: f.icon ? String(f.icon) : undefined, displayOrder: f.displayOrder ? Number(f.displayOrder) : undefined, isVisible: f.isVisible === "Visible" }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createCategory(input as any) : catalogConfigurationApi.updateCategory(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteCategory(id),
  setActive: (id, next) => catalogConfigurationApi.updateCategory(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const DifficultyLevelsCrud = createEntityCrud({
  title: "Difficulty Levels",
  sub: "Grading ladder shown on courses",
  icon: LayersIcon,
  viewPermission: "difficulty_level.view",
  load: (s) => catalogConfigurationApi.listDifficultyLevels(s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, code: d.code ?? "", displayOrder: d.displayOrder ?? "", status: d.isActive === false ? "Disabled" : "Active" }),
  columns: [
    cfgNameCol,
    { key: "code", label: "Code", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.code)}</span> },
    { key: "displayOrder", label: "Order" },
    cfgStatusCol,
  ],
  fields: [
    { key: "code", label: "Code", type: "text", required: true, placeholder: "e.g. BEGINNER", autoSlugFrom: "name" },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "displayOrder", label: "Display Order", type: "number" },
  ],
  buildInput: (f) => ({ code: f.code, name: f.name, displayOrder: f.displayOrder ? Number(f.displayOrder) : undefined }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createDifficultyLevel(input as any) : catalogConfigurationApi.updateDifficultyLevel(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteDifficultyLevel(id),
  setActive: (id, next) => catalogConfigurationApi.updateDifficultyLevel(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const ContentTypesTable = createEntityCrud({
  title: "Content Types",
  sub: "Catalog of learning content kinds shown on the course builder",
  icon: FileText,
  viewPermission: "content_type.view",
  load: (s) => catalogConfigurationApi.listContentTypes(s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", category: d.category ?? "", description: d.description ?? "", icon: d.icon ?? "", sortOrder: d.sortOrder ?? "", status: d.isActive === false ? "Disabled" : "Active" }),
  columns: [
    cfgNameCol,
    { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> },
    { key: "category", label: "Group", sortable: true, render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.goldLight, color: "#8A6A1A" }}>{String(r.category || "—")}</span> },
    { key: "sortOrder", label: "Order" },
    cfgStatusCol,
  ],
  fields: [
    { key: "slug", label: "Slug", type: "text", required: true, placeholder: "e.g. video", autoSlugFrom: "name" },
    { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Video" },
    { key: "category", label: "Group", type: "select", required: true, options: [{ value: "RESOURCE", label: "Resource" }, { value: "INTERACTIVE", label: "Interactive" }] },
    { key: "description", label: "Description", type: "textarea" },
    { key: "icon", label: "Icon", type: "text", placeholder: "e.g. Video (icon key)" },
    { key: "sortOrder", label: "Sort Order", type: "number" },
  ],
  buildInput: (f) => ({
    slug: String(f.slug).trim(),
    name: String(f.name).trim(),
    category: String(f.category),
    description: (f.description as string)?.trim() || undefined,
    icon: (f.icon as string)?.trim() || undefined,
    sortOrder: f.sortOrder ? Number(f.sortOrder) : 0,
  }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createContentType(input as any) : catalogConfigurationApi.updateContentType(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteContentType(id),
  setActive: (id, next) => catalogConfigurationApi.updateContentType(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const LearningLevelsCrud = createEntityCrud({
  title: "Learning Levels",
  sub: "XP thresholds and badge colors for learner progression",
  icon: Medal,
  viewPermission: "learning_level.view",
  load: (s) => catalogConfigurationApi.listLearningLevels(s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, minimumXp: d.minimumXp ?? 0, maximumXp: d.maximumXp ?? "", badgeColor: d.badgeColor ?? "", displayOrder: d.displayOrder ?? "", status: "Active" }),
  columns: [
    cfgNameCol,
    { key: "minimumXp", label: "Min XP", render: (r) => <p className="text-xs font-mono" style={{ color: P.gold }}>{String(r.minimumXp)}</p> },
    { key: "maximumXp", label: "Max XP", render: (r) => <p className="text-xs font-mono" style={{ color: P.textMuted }}>{r.maximumXp === "" ? "∞" : String(r.maximumXp)}</p> },
    { key: "displayOrder", label: "Order" },
  ],
  fields: [
    { key: "name", label: "Level Name", type: "text", required: true },
    { key: "minimumXp", label: "Minimum XP", type: "number", required: true },
    { key: "maximumXp", label: "Maximum XP (blank = ∞)", type: "number" },
    { key: "badgeColor", label: "Badge Color (hex)", type: "text", placeholder: "#C8A85D" },
    { key: "displayOrder", label: "Display Order", type: "number" },
  ],
  buildInput: (f) => ({
    name: f.name,
    minimumXp: Number(f.minimumXp) || 0,
    maximumXp: f.maximumXp === "" || f.maximumXp == null ? null : Number(f.maximumXp),
    badgeColor: f.badgeColor || null,
    displayOrder: f.displayOrder ? Number(f.displayOrder) : undefined,
  }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createLearningLevel(input as any) : catalogConfigurationApi.updateLearningLevel(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteLearningLevel(id),
});
// ── FACTORY_CONT2 ──

const AssessmentTypesCrud = createEntityCrud({
  title: "Assessment Types",
  sub: "Classifications used when building assessments",
  icon: HelpCircle,
  viewPermission: "assessment_type.view",
  load: (s) => assessmentConfigApi.assessmentTypes.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, code: d.code ?? "", description: d.description ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "code", label: "Code", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.code)}</span> }, cfgStatusCol],
  fields: [
    { key: "code", label: "Code", type: "text", required: true, placeholder: "e.g. FINAL_EXAM", autoSlugFrom: "name" },
    { key: "name", label: "Name", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ code: f.code, name: f.name, description: f.description || undefined }),
  save: (input, id) => (id == null ? assessmentConfigApi.assessmentTypes.create(input as any) : assessmentConfigApi.assessmentTypes.update(id, input as any)),
  remove: (id) => assessmentConfigApi.assessmentTypes.delete(id),
  setActive: (id, next) => assessmentConfigApi.assessmentTypes.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const AssessmentQuestionTypesCrud = createEntityCrud({
  title: "Assessment Question Types",
  sub: "Kinds of questions available to assessment builders",
  icon: HelpCircle,
  viewPermission: "question_type.view",
  load: (s) => assessmentConfigApi.questionTypes.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", description: d.description ?? "", answerStructure: d.answerStructure ?? "OPTION_BASED", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> }, cfgStatusCol],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "slug", label: "Slug (auto from name)", type: "text", autoSlugFrom: "name" },
    {
      key: "answerStructure",
      label: "Answer Structure",
      type: "select",
      required: true,
      options: [
        { value: "OPTION_BASED", label: "Option Based (Multiple Choice / True-False)" },
        { value: "FREE_TEXT", label: "Free Text (Short Answer / Essay)" },
        { value: "MATCHING_PAIR_BASED", label: "Matching Pair Based (Matching / Drag & Drop)" },
      ],
    },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ name: f.name, slug: f.slug || slugifyLocal(String(f.name)), answerStructure: f.answerStructure || "OPTION_BASED", description: f.description || undefined }),
  save: (input, id) => (id == null ? assessmentConfigApi.questionTypes.create(input as any) : assessmentConfigApi.questionTypes.update(id, input as any)),
  remove: (id) => assessmentConfigApi.questionTypes.delete(id),
  setActive: (id, next) => assessmentConfigApi.questionTypes.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const GradingMethodsCrud = createEntityCrud({
  title: "Grading Methods",
  sub: "Strategies used to score assessments",
  icon: Target,
  viewPermission: "grading_method.view",
  load: (s) => assessmentConfigApi.gradingMethods.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", description: d.description ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> }, cfgStatusCol],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "slug", label: "Slug (auto from name)", type: "text", autoSlugFrom: "name" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ name: f.name, slug: f.slug || slugifyLocal(String(f.name)), description: f.description || undefined }),
  save: (input, id) => (id == null ? assessmentConfigApi.gradingMethods.create(input as any) : assessmentConfigApi.gradingMethods.update(id, input as any)),
  remove: (id) => assessmentConfigApi.gradingMethods.delete(id),
  setActive: (id, next) => assessmentConfigApi.gradingMethods.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});
// ── FACTORY_CONT3 ──

const ProgramCategoriesCrud = createEntityCrud({
  title: "Program Categories",
  sub: "Groups used to organize programs in the catalog",
  icon: LayersIcon,
  viewPermission: "program_category.view",
  load: (s) => catalogConfigurationApi.listProgramCategories(s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, color: d.color ?? "", description: d.description ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "color", label: "Color", render: (r) => <span className="inline-block w-3 h-3 rounded-full border align-middle" style={{ background: String(r.color || P.olive), borderColor: P.border }} /> }, cfgStatusCol],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "color", label: "Color", type: "color" },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ name: f.name, color: f.color || undefined, description: f.description || undefined }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createProgramCategory(input as any) : catalogConfigurationApi.updateProgramCategory(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteProgramCategory(id),
  setActive: (id, next) => catalogConfigurationApi.updateProgramCategory(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const TASK_SUBMISSION_TYPES = ["FILE_UPLOAD", "TEXT_INPUT", "LINK", "QUIZ", "NONE"] as const;
const TASK_LINKED_ENTITIES = ["COURSE_VERSION", "COURSE_CONTENT", "ASSESSMENT", "LIVE_SESSION", "SURVEY", "NONE"] as const;

const TaskTypesCrud = createEntityCrud({
  title: "Task Types",
  sub: "Classifications for tasks inside learning programs",
  icon: LayersIcon,
  viewPermission: "task_type.view",
  load: (s) => catalogConfigurationApi.listTaskTypes(s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, expectedSubmissionType: d.expectedSubmissionType ?? "", linkedEntity: d.linkedEntity ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [
    cfgNameCol,
    { key: "expectedSubmissionType", label: "Submission", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.expectedSubmissionType || "—").replace(/_/g, " ")}</span> },
    { key: "linkedEntity", label: "Links To", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.goldLight, color: "#8A6A1A" }}>{String(r.linkedEntity || "—").replace(/_/g, " ")}</span> },
    cfgStatusCol,
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. Assignment" },
    { key: "description", label: "Description", type: "textarea" },
    { key: "expectedSubmissionType", label: "Expected Submission", type: "select", required: true, options: TASK_SUBMISSION_TYPES.map((v) => ({ value: v, label: v.replace(/_/g, " ") })) },
    { key: "linkedEntity", label: "Linked Entity", type: "select", required: true, options: TASK_LINKED_ENTITIES.map((v) => ({ value: v, label: v.replace(/_/g, " ") })) },
  ],
  buildInput: (f) => ({
    name: f.name,
    description: f.description || undefined,
    expectedSubmissionType: f.expectedSubmissionType,
    linkedEntity: f.linkedEntity,
  }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createTaskType(input as any) : catalogConfigurationApi.updateTaskType(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteTaskType(id),
  setActive: (id, next) => catalogConfigurationApi.updateTaskType(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const ContentFileTypesCrud = createEntityCrud({
  title: "Content File Types",
  sub: "Allowed upload formats for course content",
  icon: FileText,
  viewPermission: "content_file_type.view",
  load: (s) => catalogConfigurationApi.listContentFileTypes(s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", sortOrder: d.sortOrder ?? 0, status: d.isActive ? "Active" : "Disabled" }),
  columns: [
    cfgNameCol,
    { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> },
    { key: "sortOrder", label: "Order" },
    cfgStatusCol,
  ],
  fields: [
    { key: "name", label: "Name", type: "text", required: true, placeholder: "e.g. PDF Document" },
    { key: "sortOrder", label: "Sort Order", type: "number" },
  ],
  buildInput: (f) => ({ name: f.name, slug: slugifyLocal(String(f.name)), sortOrder: f.sortOrder ? Number(f.sortOrder) : undefined }),
  save: (input, id) => (id == null ? catalogConfigurationApi.createContentFileType(input as any) : catalogConfigurationApi.updateContentFileType(id, input as any)),
  remove: (id) => catalogConfigurationApi.deleteContentFileType(id),
  setActive: (id, next) => catalogConfigurationApi.updateContentFileType(id, { isActive: next }).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const CertificateTypesCrud = createEntityCrud({
  title: "Certificate Types",
  sub: "Classifications used by certificate templates",
  icon: Award,
  viewPermission: "certificate_type.view",
  load: (s) => certificateConfigApi.types.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> }, cfgStatusCol],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ name: f.name, slug: slugifyLocal(String(f.name)), description: f.description || undefined }),
  save: (input, id) => (id == null ? certificateConfigApi.types.create(input as any) : certificateConfigApi.types.update(id, input as any)),
  remove: (id) => certificateConfigApi.types.delete(id),
  setActive: (id, next) => certificateConfigApi.types.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});
// ── FACTORY_CONT4 ──

const CredentialSourcesCrud = createEntityCrud({
  title: "Credential Sources",
  sub: "External issuers of credentials recognized by the platform",
  icon: Shield,
  viewPermission: "credential_source.view",
  load: (s) => certificateConfigApi.credentialSources.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> }, cfgStatusCol],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ name: f.name, slug: slugifyLocal(String(f.name)), description: f.description || undefined }),
  save: (input, id) => (id == null ? certificateConfigApi.credentialSources.create(input as any) : certificateConfigApi.credentialSources.update(id, input as any)),
  remove: (id) => certificateConfigApi.credentialSources.delete(id),
  setActive: (id, next) => certificateConfigApi.credentialSources.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const ProviderTypesCrud = createEntityCrud({
  title: "Provider Types",
  sub: "Classifications for external training providers",
  icon: Award,
  viewPermission: "provider_type.view",
  load: (s) => certificateConfigApi.providerTypes.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({ id: String(d.id), name: d.name, slug: d.slug ?? "", status: d.isActive ? "Active" : "Disabled" }),
  columns: [cfgNameCol, { key: "slug", label: "Slug", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.slug)}</span> }, cfgStatusCol],
  fields: [
    { key: "name", label: "Name", type: "text", required: true },
    { key: "description", label: "Description", type: "textarea" },
  ],
  buildInput: (f) => ({ name: f.name, slug: slugifyLocal(String(f.name)), description: f.description || undefined }),
  save: (input, id) => (id == null ? certificateConfigApi.providerTypes.create(input as any) : certificateConfigApi.providerTypes.update(id, input as any)),
  remove: (id) => certificateConfigApi.providerTypes.delete(id),
  setActive: (id, next) => certificateConfigApi.providerTypes.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Active", disabled: "Disabled" },
  filterValues: ["Active", "Disabled"],
});

const ENTITY_TYPES = ["COURSE", "PROGRAM"];

const EnrollmentRulesManaged = createEntityCrud({
  title: "Enrollment Rules",
  sub: "Executable rules that drive auto-enrollment and restrictions",
  icon: UserCheck,
  viewPermission: "enrollment_rule.view",
  load: (s) => enrollmentApi.rules.list({}, s).then((d) => asArray(d)),
  toRow: (d: any) => ({
    id: String(d.id),
    name: d.name ?? `Rule #${d.id}`,
    ruleTypeId: d.ruleTypeId ?? "",
    entityType: d.entityType ?? "",
    description: d.description ?? "",
    priority: d.priority ?? 1,
    courseVersionId: d.courseVersionId ?? "",
    programId: d.programId ?? "",
    targetAudienceId: d.targetAudienceId ?? "",
    conditionExpression: d.conditionExpression ? JSON.stringify(d.conditionExpression) : "",
    status: d.isActive ? "Enabled" : "Disabled",
  }),
  columns: [
    cfgNameCol,
    { key: "ruleTypeId", label: "Rule Type", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.goldLight, color: "#8A6A1A" }}>#{String(r.ruleTypeId || "?")}</span> },
    { key: "entityType", label: "Entity", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.entityType || "—").replace(/_/g, " ")}</span> },
    { key: "priority", label: "Priority", sortable: true, render: (r) => <span className="text-[11px] font-semibold" style={{ color: P.textMid }}>{String(r.priority ?? "—")}</span> },
    cfgStatusCol,
  ],
  fields: [
    { key: "name", label: "Rule Name", type: "text", required: true },
    { key: "ruleTypeId", label: "Rule Type", type: "select", required: true, loadOptions: (signal) => enrollmentApi.ruleTypes.list({}, signal).then((d) => asArray(d).map((rt: any) => ({ value: String(rt.id), label: rt.name }))) },
    { key: "entityType", label: "Entity Type", type: "select", required: true, options: ENTITY_TYPES.map((v) => ({ value: v, label: v.replace(/_/g, " ") })) },
    { key: "courseVersionId", label: "Course Version", type: "select", loadOptions: (signal) => enrollmentApi.courseVersions.list({ limit: 200 }, signal).then((d) => asArray(d).map((x: any) => ({ value: String(x.id), label: x.label }))) },
    { key: "programId", label: "Program", type: "select", loadOptions: (signal) => enrollmentApi.programs.list({ limit: 200 }, signal).then((d) => asArray(d).map((x: any) => ({ value: String(x.id), label: x.label }))) },
    { key: "priority", label: "Priority", type: "number", placeholder: "Higher number sorts first" },
    { key: "targetAudienceId", label: "Target Audience", type: "select", loadOptions: (signal) => audienceApi.groups.list({}, signal).then((g) => asArray(g).map((x: any) => ({ value: String(x.id), label: x.name }))) },
    { key: "description", label: "Description", type: "textarea" },
    { key: "conditionExpression", label: "Condition Expression (JSON)", type: "textarea", placeholder: 'e.g. {"level":"manager"}' },
  ],
  buildInput: (f) => {
    const entityType = f.entityType as "COURSE" | "PROGRAM";
    const toNumberOrNull = (v: unknown): number | null => {
      if (v === "" || v == null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };
    let conditionExpression: Record<string, unknown> | null = null;
    const raw = String(f.conditionExpression ?? "").trim();
    if (raw) {
      try {
        conditionExpression = JSON.parse(raw);
      } catch {
        throw new Error("Condition Expression must be valid JSON.");
      }
    }
    return {
      name: f.name as string,
      ruleTypeId: Number(f.ruleTypeId),
      entityType,
      priority: f.priority === "" || f.priority == null ? undefined : Number(f.priority),
      courseVersionId: entityType === "COURSE" ? toNumberOrNull(f.courseVersionId) : null,
      programId: entityType === "PROGRAM" ? toNumberOrNull(f.programId) : null,
      targetAudienceId: toNumberOrNull(f.targetAudienceId),
      description: (f.description as string) || undefined,
      conditionExpression,
    };
  },
  save: (input, id) => (id == null ? enrollmentApi.rules.create(input as any) : enrollmentApi.rules.update(id, input as any)),
  remove: (id) => enrollmentApi.rules.delete(id),
  setActive: (id, next) => enrollmentApi.rules.update(id, { isActive: next } as any).then(() => undefined),
  toggleLabels: { enabled: "Enabled", disabled: "Disabled" },
  filterValues: ["Enabled", "Disabled"],
});
// ── end generated entity cruds ──

import { ConfigAudience } from "./ConfigAudience";
import { ConfigEnrollment } from "./ConfigEnrollment";
import { ConfigNotifications } from "./ConfigNotifications";
import { ConfigTNA } from "./ConfigTNA";
import { ConfigTrainingEffectiveness } from "./ConfigTrainingEffectiveness";
import { ConfigSystemSettings } from "./ConfigSystemSettings";
import { ConfigBadges } from "./ConfigBadges";
import { ConfigSurvey } from "./ConfigSurvey";
import { ConfigCustomFields } from "./ConfigCustomFields";
import { ConfigRolePermissions } from "./ConfigRolePermissions";
import { ConfigTemplates } from "./ConfigTemplates";

export function ConfigCenterScreen({
  navigate,
  contentTypes,
  setContentTypes,
  questionTypes,
  setQuestionTypes,
  governanceSections,
}: {
  navigate: (s: string) => void;
  contentTypes?: CourseContentTypeConfig[];
  setContentTypes?: React.Dispatch<React.SetStateAction<CourseContentTypeConfig[]>>;
  questionTypes?: QuestionTypeConfig[];
  setQuestionTypes?: React.Dispatch<React.SetStateAction<QuestionTypeConfig[]>>;
  governanceSections?: {
    certificateTemplateCreator?: React.ReactNode;
    catalogConfiguration?: React.ReactNode;
  };
}) {
  type ConfigSection =
    | "access-control"
    | "audience"
    | "course"
    | "assessment"
    | "program"
    | "enrollment"
    | "notifications"
    | "certification"
    | "tna"
    | "effectiveness"
    | "approval-workflows"
    | "custom-fields"
    | "learning-levels"
    | "xp-rules"
    | "badges"
    | "system-settings"
    | "survey-config"
    | "template-management";
  const [active, setActive] = useState<ConfigSection>("access-control");
  const [navigationCollapsed, setNavigationCollapsed] = useState(false);
  const [courseTab, setCourseTab] = useState("difficulty");
  const [assessmentTab, setAssessmentTab] = useState("types");
  const [programTab, setProgramTab] = useState("types");
  const [enrollmentTab, setEnrollmentTab] = useState("rule-types");
  const [notificationTab, setNotificationTab] = useState("modules");
  const [certificationTab, setCertificationTab] = useState("types");

  // Sidebar order mirrors src/routes/index.ts mounting order exactly.
  const NAV: { id: ConfigSection; label: string; icon: React.ElementType; desc: string; group?: string }[] = [
    { id: "access-control", label: "Roles & Access Control", icon: ShieldCheck, desc: "Configure LMS permissions assigned to EMS roles" },
    { id: "audience", label: "Audience Management", icon: Users, desc: "Reusable employee groups, targeting rules, member previews" },
    { id: "course", label: "Course Configuration", icon: BookOpen, desc: "Categories, difficulty levels, content types, course templates" },
    { id: "assessment", label: "Assessment Configuration", icon: HelpCircle, desc: "Types, question types, grading methods, assessment templates" },
    { id: "program", label: "Program Configuration", icon: LayersIcon, desc: "Types, categories, task types, program templates" },
    { id: "enrollment", label: "Enrollment Configuration", icon: UserCheck, desc: "Rule types and enrollment rules" },
    { id: "notifications", label: "Notification Settings", icon: MessageSquare, desc: "Modules, events, templates" },
    { id: "certification", label: "Certification Configuration", icon: Award, desc: "Types, credential sources, provider types, templates" },
    { id: "tna", label: "TNA Configuration", icon: Target, desc: "Request types, funding types, training formats" },
    { id: "effectiveness", label: "Training Effectiveness", icon: TrendingUp, desc: "KPIs, measurement model, reporting" },
    { id: "approval-workflows", label: "Approval Workflows", icon: GitBranch, desc: "Multi-step workflows and approval steps" },
    { id: "custom-fields", label: "Custom Fields", icon: Tag, desc: "Extend entity data with custom field definitions" },
    { id: "learning-levels", label: "Learning Levels", icon: Medal, group: "Gamification", desc: "XP thresholds and badge colors" },
    { id: "xp-rules", label: "XP Rules", icon: Zap, group: "Gamification", desc: "Points awarded for learning actions" },
    { id: "badges", label: "Badge Configuration", icon: Shield, group: "Gamification", desc: "Create and manage achievement badges" },
    { id: "system-settings", label: "System Settings", icon: Settings, desc: "Platform-wide configuration by category" },
    { id: "template-management", label: "Template Management", icon: LayoutGrid, desc: "Centralized template library: course, program, assessment, survey, certificate, notification" },
    { id: "survey-config", label: "Survey Configuration", icon: FileText, desc: "Survey question types and reusable templates" },
  ];

  const CONTENT: Record<ConfigSection, React.ReactNode> = {
    "access-control": <ConfigRolePermissions />,
    audience: <ConfigAudience />,
    course: (
      <div className="space-y-5">
        <ModuleTabs
          tabs={[
            ...(governanceSections?.catalogConfiguration
              ? [{ id: "builder", label: "Categories" }]
              : []),
            { id: "difficulty", label: "Difficulty Levels" },
            { id: "content-types", label: "Content Types" },
            { id: "file-types", label: "File Types" },
          ]}
          active={courseTab}
          onChange={setCourseTab}
        />
        {courseTab === "builder" && governanceSections?.catalogConfiguration}
        {courseTab === "difficulty" && <DifficultyLevelsCrud />}
        {courseTab === "content-types" && <ContentTypesTable />}
        {courseTab === "file-types" && <ContentFileTypesCrud />}
      </div>
    ),
    assessment: (
      <div className="space-y-5">
        <ModuleTabs
          tabs={[
            { id: "types", label: "Assessment Types" },
            { id: "question-types", label: "Question Types" },
            { id: "grading-methods", label: "Grading Methods" },
          ]}
          active={assessmentTab}
          onChange={setAssessmentTab}
        />
        {assessmentTab === "types" && <AssessmentTypesCrud />}
        {assessmentTab === "question-types" && <AssessmentQuestionTypesCrud />}
        {assessmentTab === "grading-methods" && <GradingMethodsCrud />}
      </div>
    ),
    program: (
      <div className="space-y-5">
        <ModuleTabs
          tabs={[
            { id: "types", label: "Program Types" },
            { id: "categories", label: "Categories" },
            { id: "task-types", label: "Task Types" },
          ]}
          active={programTab}
          onChange={setProgramTab}
        />
        {programTab === "types" && <ProgramTypesCrud />}
        {programTab === "categories" && <ProgramCategoriesCrud />}
        {programTab === "task-types" && <TaskTypesCrud />}
      </div>
    ),
    enrollment: (
      <div className="space-y-5">
        <ModuleTabs
          tabs={[
            { id: "rule-types", label: "Rule Types" },
            { id: "rules", label: "Rules" },
          ]}
          active={enrollmentTab}
          onChange={setEnrollmentTab}
        />
        {enrollmentTab === "rule-types" && <EnrollmentRulesCrud />}
        {enrollmentTab === "rules" && <EnrollmentRulesManaged />}
      </div>
    ),
    notifications: (
      <div className="space-y-5">
        <ModuleTabs
          tabs={[
            { id: "modules", label: "Modules & Channels" },
            { id: "events", label: "Events" },
          ]}
          active={notificationTab}
          onChange={setNotificationTab}
        />
        {notificationTab === "modules" && <ConfigNotifications />}
        {notificationTab === "events" && <NotificationEventsCrud />}
      </div>
    ),
    certification: (
      <div className="space-y-5">
        <ModuleTabs
          tabs={[
            { id: "types", label: "Certificate Types" },
            { id: "sources", label: "Credential Sources" },
            { id: "provider-types", label: "Provider Types" },
            ...(governanceSections?.certificateTemplateCreator ? [{ id: "designer", label: "Template Designer" }] : []),
          ]}
          active={certificationTab}
          onChange={setCertificationTab}
        />
        {certificationTab === "types" && <CertificateTypesCrud />}
        {certificationTab === "sources" && <CredentialSourcesCrud />}
        {certificationTab === "provider-types" && <ProviderTypesCrud />}
        {certificationTab === "designer" && governanceSections?.certificateTemplateCreator}
      </div>
    ),
    tna: <ConfigTNA />,
    effectiveness: <ConfigTrainingEffectiveness />,
    "approval-workflows": <WorkflowsCrud />,
    "custom-fields": <ConfigCustomFields />,
    "learning-levels": <LearningLevelsCrud />,
    "xp-rules": <XPRulesCrud />,
    badges: <ConfigBadges />,
    "system-settings": <ConfigSystemSettings />,
    "template-management": <ConfigTemplates />,
    "survey-config": <ConfigSurvey />,
  };

  const current = NAV.find((n) => n.id === active)!;
  const embeddedWorkspaceSections = new Set<ConfigSection>([
    "certification",
    "course",
    "audience",
  ]);
  const isEmbeddedWorkspace = embeddedWorkspaceSections.has(active);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left nav */}
      <aside
        className={`flex-shrink-0 overflow-y-auto space-y-2 transition-all duration-300 ease-in-out ${
          navigationCollapsed ? "w-[72px] p-2" : "w-56 p-4"
        }`}
        style={{ background: "white", borderRight: `1px solid ${P.border}` }}
      >
        <div
          className={`flex items-center py-2 ${
            navigationCollapsed ? "justify-center" : "justify-between px-2"
          }`}
        >
          {!navigationCollapsed && (
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: P.textMuted }}
            >
              Configuration
            </p>
          )}
          <button
            onClick={() => setNavigationCollapsed((collapsed) => !collapsed)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            style={{ borderColor: P.border, color: P.olive, background: "white" }}
            aria-label={
              navigationCollapsed
                ? "Expand configuration navigation"
                : "Collapse configuration navigation"
            }
            title={
              navigationCollapsed
                ? "Expand configuration navigation"
                : "Collapse configuration navigation"
            }
          >
            {navigationCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
        </div>
        {NAV.map(({ id, label, icon: Icon, group }, idx, arr) => {
          const isActive = active === id;
          const showGroupHeader = group !== undefined && arr[idx - 1]?.group !== group;

          return (
            <React.Fragment key={id}>
            {showGroupHeader && (
              <p className="px-3 pt-3 pb-1 text-[9px] font-bold uppercase tracking-widest" style={{ color: P.textMuted }}>
                {group}
              </p>
            )}
            <button
              onClick={() => setActive(id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={navigationCollapsed ? label : undefined}
              title={navigationCollapsed ? label : undefined}
              className={`group relative flex w-full items-center rounded-xl py-3 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(4,120,87,0.10)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 ${
                navigationCollapsed ? "justify-center px-2" : "gap-3 px-3.5"
              }`}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, rgba(209,250,229,0.98), rgba(236,253,245,0.96))",
                      color: P.darkOlive,
                      border: `1px solid ${P.border}`,
                      boxShadow: "0 14px 30px rgba(4,120,87,0.10)",
                    }
                  : {
                      background: "transparent",
                      color: P.textMuted,
                      border: "1px solid transparent",
                    }
              }
            >
              <span
                className={`absolute left-0 top-3 bottom-3 w-1 rounded-full transition-all duration-200 ${
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                }`}
                style={{ background: P.olive }}
              />
              <span
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-all duration-200 group-hover:scale-110"
                style={{
                  background: isActive ? P.olive : P.paleGreen,
                  color: isActive ? "white" : P.textMid,
                }}
              >
                <Icon size={15} />
              </span>
              {!navigationCollapsed && (
                <>
                  <span className="flex-1 text-[13px] font-semibold leading-tight">{label}</span>
                  <ChevronRight
                    size={14}
                    className={`flex-shrink-0 transition-all duration-200 ${
                      isActive
                        ? "opacity-100"
                        : "translate-x-[-4px] opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                    }`}
                  />
                </>
              )}
            </button>
            </React.Fragment>
          );
        })}
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className={`${isEmbeddedWorkspace ? "max-w-[1200px]" : "max-w-[860px]"} space-y-7`}>
          {!isEmbeddedWorkspace && (
            <div>
              <h1
                className="text-lg font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
              >
                {current.label}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: P.textMuted }}>
                {current.desc}
              </p>
            </div>
          )}
          {CONTENT[active]}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. ANALYTICS CENTER
// ─────────────────────────────────────────────────────────────

// ─── Analytics Center — moved to Extensions4.tsx ─────────────
export { AnalyticsCenterScreen } from "../../Extensions4";

// 3. TWO-LEVEL CONTENT MODERATION
// ─────────────────────────────────────────────────────────────
