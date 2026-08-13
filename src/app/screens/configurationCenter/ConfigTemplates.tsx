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
import { ConfigCertifications } from "./ConfigCertifications";

type TemplateCategoryId = "program" | "course" | "quiz" | "email" | "certificate";

const TEMPLATE_CATEGORIES: {
  id: TemplateCategoryId;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
  background: string;
}[] = [
  {
    id: "program",
    label: "Program Templates",
    description: "Reusable structures for learning programs and cohorts",
    icon: Layers,
    color: "#3F651E",
    background: "#E5F4DD",
  },
  {
    id: "course",
    label: "Course Templates",
    description: "Standard course layouts, chapters, and learning content",
    icon: BookOpen,
    color: "#067A5B",
    background: "#DDF6EC",
  },
  {
    id: "quiz",
    label: "Quiz Templates",
    description: "Assessment structures, scoring, and question guidance",
    icon: HelpCircle,
    color: "#8A6A1A",
    background: "#FFF4D6",
  },
  {
    id: "email",
    label: "Email Templates",
    description: "Messages used throughout learner and manager workflows",
    icon: MessageSquare,
    color: "#5B4AB8",
    background: "#EEEAFF",
  },
  {
    id: "certificate",
    label: "Certificate Templates",
    description: "Certificate formats, wording, and issuance details",
    icon: Award,
    color: "#B45309",
    background: "#FFF0D9",
  },
];

export function ConfigTemplates() {
  const [activeCategory, setActiveCategory] = useState<TemplateCategoryId | null>(null);
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editingCourseTemplateId, setEditingCourseTemplateId] = useState<string | null>(null);
  const [courseTemplates, setCourseTemplates] = useState<CourseCreationTemplate[]>(() =>
    loadCourseCreationTemplates(),
  );
  const [quizTemplates, setQuizTemplates] = useState([
    {
      id: "qt1",
      name: "Standard Knowledge Check",
      questions: 10,
      passing: 70,
      retries: 3,
      shuffle: true,
    },
    {
      id: "qt2",
      name: "Compliance Attestation Quiz",
      questions: 15,
      passing: 80,
      retries: 2,
      shuffle: false,
    },
    {
      id: "qt3",
      name: "Pre/Post Assessment",
      questions: 20,
      passing: 60,
      retries: 1,
      shuffle: true,
    },
  ]);
  const [programTemplates, setProgramTemplates] = useState<LearningProgramTemplate[]>(() =>
    loadConfigProgramTemplates(),
  );
  const [editingProgramTemplateId, setEditingProgramTemplateId] = useState<string | null>(null);
  const [programTemplateDraft, setProgramTemplateDraft] =
    useState<LearningProgramTemplateDraft | null>(null);
  const [programTemplateNotice, setProgramTemplateNotice] = useState("");

  const emailTemplates = [
    {
      id: "e1",
      name: "Welcome / Onboarding",
      desc: "Sent to new learners on first login",
      category: "System",
    },
    {
      id: "e2",
      name: "Course Enrollment Confirmed",
      desc: "Confirms a learner has enrolled in a course",
      category: "Course",
    },
    {
      id: "e3",
      name: "Assignment Deadline Reminder",
      desc: "Sent 7, 3, and 1 day before deadlines",
      category: "Reminder",
    },
    {
      id: "e4",
      name: "Course Completion Confirmation",
      desc: "Congratulates learner on completing a course",
      category: "Course",
    },
    {
      id: "e5",
      name: "Certificate Issued",
      desc: "Notifies learner their certificate is ready",
      category: "Certification",
    },
    {
      id: "e6",
      name: "Certificate Expiry Warning",
      desc: "Sent 30 and 7 days before certificate expires",
      category: "Certification",
    },
    {
      id: "e7",
      name: "TNA Request Approved",
      desc: "Informs learner their training request was approved",
      category: "TNA",
    },
    {
      id: "e8",
      name: "TNA Request Rejected",
      desc: "Informs learner of rejection with reason",
      category: "TNA",
    },
    {
      id: "e9",
      name: "Program Enrollment",
      desc: "Welcome message when a learner joins a program",
      category: "Program",
    },
    {
      id: "e10",
      name: "Manager Weekly Team Summary",
      desc: "Digest of team learning activity sent to managers",
      category: "Digest",
    },
  ];

  const catColor = (c: string) =>
    c === "Course"
      ? { bg: P.lightSage, color: P.darkOlive }
      : c === "Certification"
        ? { bg: P.goldLight, color: "#8A6A1A" }
        : c === "TNA"
          ? { bg: "#EDE9FE", color: "#5B21B6" }
          : c === "Program"
            ? { bg: "#D8EDCC", color: "#3A6420" }
            : c === "Reminder"
              ? { bg: "#FEE2E2", color: "#B91C1C" }
              : { bg: P.paleGreen, color: P.textMid };

  const updateCourseTemplates = (
    updater: (templates: CourseCreationTemplate[]) => CourseCreationTemplate[],
  ) => {
    setCourseTemplates((templates) => {
      const next = updater(templates);
      saveCourseCreationTemplates(next);
      return next;
    });
  };

  const updateCourseTemplate = (
    templateId: string,
    updater: (template: CourseCreationTemplate) => CourseCreationTemplate,
  ) => {
    updateCourseTemplates((templates) =>
      templates.map((template) => (template.id === templateId ? updater(template) : template)),
    );
  };

  const flashProgramTemplateNotice = (message: string) => {
    setProgramTemplateNotice(message);
    window.setTimeout(() => setProgramTemplateNotice(""), 3000);
  };

  const updateProgramTemplateLibrary = (
    updater: (templates: LearningProgramTemplate[]) => LearningProgramTemplate[],
  ) => {
    setProgramTemplates((templates) => {
      const next = updater(templates);
      saveConfigProgramTemplates(next);
      return next;
    });
  };

  const openProgramTemplateEditor = (template?: LearningProgramTemplate) => {
    setEditingProgramTemplateId(template?.id ?? null);
    setProgramTemplateDraft(createProgramTemplateDraft(template));
  };

  const updateProgramTemplateDraft = (patch: Partial<LearningProgramTemplateDraft>) => {
    setProgramTemplateDraft((draft) => (draft ? { ...draft, ...patch } : draft));
  };

  const saveProgramTemplateDraft = () => {
    if (!programTemplateDraft) return;
    const taskList = splitTemplateLines(programTemplateDraft.taskText);
    const milestones = splitTemplateLines(programTemplateDraft.milestoneText);
    const template: LearningProgramTemplate = {
      id: editingProgramTemplateId ?? `pt${Date.now()}`,
      name: programTemplateDraft.name.trim() || "Untitled Program Template",
      type: programTemplateDraft.type.trim() || "Leadership",
      targetAudience: programTemplateDraft.targetAudience.trim() || "Managers",
      startDate: programTemplateDraft.startDate,
      endDate: programTemplateDraft.endDate,
      duration: programTemplateDraft.duration.trim() || "8 weeks",
      courseCount: Math.max(0, Number(programTemplateDraft.courseCount) || 0),
      weeks: Math.max(0, Number.parseInt(programTemplateDraft.duration, 10) || 0),
      courses: Math.max(0, Number(programTemplateDraft.courseCount) || 0),
      taskList: taskList.length ? taskList : ["Course completion"],
      milestones: milestones.length ? milestones : ["Completion"],
      active: programTemplateDraft.active,
    };

    updateProgramTemplateLibrary((templates) =>
      editingProgramTemplateId
        ? templates.map((item) => (item.id === editingProgramTemplateId ? template : item))
        : [template, ...templates],
    );
    setEditingProgramTemplateId(null);
    setProgramTemplateDraft(null);
    flashProgramTemplateNotice(`${template.name} saved and available for reuse.`);
  };

  const cloneProgramTemplate = (template: LearningProgramTemplate) => {
    const copy = {
      ...template,
      id: `pt${Date.now()}`,
      name: `${template.name} Copy`,
      active: false,
    };
    updateProgramTemplateLibrary((templates) => [copy, ...templates]);
    flashProgramTemplateNotice(`${template.name} duplicated as a reusable template.`);
  };

  const categoryCounts: Record<TemplateCategoryId, number> = {
    program: programTemplates.length,
    course: courseTemplates.length,
    quiz: quizTemplates.length,
    email: emailTemplates.length,
    certificate: 3,
  };
  const activeCategoryConfig = TEMPLATE_CATEGORIES.find(
    (category) => category.id === activeCategory,
  );

  if (!activeCategory) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TEMPLATE_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="group rounded-2xl border bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ borderColor: P.border }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ background: category.background, color: category.color }}
                  >
                    <Icon size={23} />
                  </span>
                  <span
                    className="rounded-full px-3 py-1 text-[10px] font-bold"
                    style={{ background: P.paleGreen, color: P.olive }}
                  >
                    {categoryCounts[category.id]} templates
                  </span>
                </div>
                <h2 className="mt-5 text-base font-bold" style={{ color: P.text }}>
                  {category.label}
                </h2>
                <p className="mt-1 min-h-10 text-xs leading-5" style={{ color: P.textMuted }}>
                  {category.description}
                </p>
                <span className="mt-5 inline-flex text-xs font-semibold" style={{ color: P.olive }}>
                  Open library <span aria-hidden="true">&nbsp;→</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (activeCategory === "certificate") {
    return (
      <div className="space-y-5">
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <ChevronLeft size={15} /> Back to Template Management
        </button>
        <ConfigCertifications />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setActiveCategory(null)}
          className="flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: P.olive }}
        >
          <ChevronLeft size={15} /> Back to Template Management
        </button>
        <p className="text-sm font-bold" style={{ color: P.text }}>
          {activeCategoryConfig?.label}
        </p>
      </div>
      {activeCategory === "course" && (
        <CfgSection title="Course Templates">
          <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
            Admin/HR can define reusable company course templates. Active templates appear in the
            creator course start flow.
          </p>
          <div className="space-y-2 mb-3">
            {courseTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ borderColor: P.border, background: "white" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: P.lightSage }}
                >
                  <BookOpen size={15} style={{ color: P.olive }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {t.name}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {t.title} · {t.category} · {t.level} · {t.chapters.length} chapters ·{" "}
                    {t.chapters.reduce((sum, chapter) => sum + chapter.contentItems.length, 0)}{" "}
                    items · {t.xpValue} XP · Pass {t.passThreshold}%
                  </p>
                  <p className="text-[10px] mt-0.5 line-clamp-2" style={{ color: P.textMuted }}>
                    {t.description}
                  </p>
                </div>
                <button
                  onClick={() =>
                    setEditingCourseTemplateId(editingCourseTemplateId === t.id ? null : t.id)
                  }
                  className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.textMid }}
                >
                  {editingCourseTemplateId === t.id ? "Done" : "Edit"}
                </button>
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{ background: t.active ? P.lightSage : P.bg, color: P.textMid }}
                >
                  {t.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
          {courseTemplates
            .filter((template) => template.id === editingCourseTemplateId)
            .map((template) => (
              <div
                key={`${template.id}-editor`}
                className="rounded-xl border p-4 space-y-4 mb-3"
                style={{ borderColor: P.olive, background: P.bg }}
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    ["Template Name", "name", template.name],
                    ["Default Course Title", "title", template.title],
                  ].map(([label, key, value]) => (
                    <div key={key}>
                      <label
                        className="block text-xs font-semibold mb-1.5"
                        style={{ color: P.textMid }}
                      >
                        {label}
                      </label>
                      <input
                        value={value}
                        onChange={(e) =>
                          updateCourseTemplate(template.id, (current) => ({
                            ...current,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                        style={{ border: `1px solid ${P.border}`, color: P.text }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Description
                  </label>
                  <textarea
                    value={template.description}
                    onChange={(e) =>
                      updateCourseTemplate(template.id, (current) => ({
                        ...current,
                        description: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white resize-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: P.textMid }}
                    >
                      Level
                    </label>
                    <select
                      value={template.level}
                      onChange={(e) =>
                        updateCourseTemplate(template.id, (current) => ({
                          ...current,
                          level: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    >
                      {["Beginner", "Intermediate", "Advanced", "Expert"].map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: P.textMid }}
                    >
                      Category
                    </label>
                    <select
                      value={template.category}
                      onChange={(e) =>
                        updateCourseTemplate(template.id, (current) => ({
                          ...current,
                          category: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    >
                      {[
                        "Technology",
                        "Leadership",
                        "Compliance",
                        "Soft Skills",
                        "Finance",
                        "Design",
                        "Management",
                      ].map((category) => (
                        <option key={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: P.textMid }}
                    >
                      XP Value
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={template.xpValue}
                      onChange={(e) =>
                        updateCourseTemplate(template.id, (current) => ({
                          ...current,
                          xpValue: Math.max(0, Number(e.target.value) || 0),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: P.textMid }}
                    >
                      Pass Threshold %
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={template.passThreshold}
                      onChange={(e) =>
                        updateCourseTemplate(template.id, (current) => ({
                          ...current,
                          passThreshold: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                        }))
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Chapters & Content Items
                  </label>
                  <textarea
                    value={serializeCourseTemplateChapters(template.chapters)}
                    onChange={(e) =>
                      updateCourseTemplate(template.id, (current) => ({
                        ...current,
                        chapters: parseCourseTemplateChapters(e.target.value),
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white resize-y font-mono"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                    Format: Chapter title | Video: Intro (10 min); Quiz: Knowledge check (5 min)
                  </p>
                </div>
              </div>
            ))}
          <button
            onClick={() => {
              const template = createBlankCourseTemplate();
              updateCourseTemplates((templates) => [...templates, template]);
              setEditingCourseTemplateId(template.id);
            }}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: P.olive }}
          >
            <Plus size={12} /> Create Course Template
          </button>
        </CfgSection>
      )}

      {activeCategory === "quiz" && (
        <CfgSection title="Quiz Templates">
          <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
            Standard assessment configurations. Creators select a quiz template when adding an
            assessment to a course.
          </p>
          <div className="space-y-2 mb-3">
            {quizTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3 p-3 rounded-xl border"
                style={{ borderColor: P.border, background: "white" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: P.goldLight }}
                >
                  <HelpCircle size={15} style={{ color: P.gold }} />
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: P.textMuted }}>
                      Template
                    </p>
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {t.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: P.textMuted }}>
                      Questions
                    </p>
                    <input
                      type="number"
                      defaultValue={t.questions}
                      className="w-14 px-2 py-1 text-xs rounded bg-white text-center"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: P.textMuted }}>
                      Pass %
                    </p>
                    <input
                      type="number"
                      defaultValue={t.passing}
                      className="w-14 px-2 py-1 text-xs rounded bg-white text-center"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold mb-0.5" style={{ color: P.textMuted }}>
                      Retries
                    </p>
                    <input
                      type="number"
                      defaultValue={t.retries}
                      className="w-14 px-2 py-1 text-xs rounded bg-white text-center"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                </div>
                <span className="text-[10px] flex-shrink-0 mt-1" style={{ color: P.textMuted }}>
                  {t.shuffle ? "Shuffled" : "Fixed order"}
                </span>
                <button
                  onClick={() => setQuizTemplates((ts) => ts.filter((x) => x.id !== t.id))}
                  style={{ color: "#C0392B" }}
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() =>
              setQuizTemplates((ts) => [
                ...ts,
                {
                  id: `qt${Date.now()}`,
                  name: "New Quiz Template",
                  questions: 10,
                  passing: 70,
                  retries: 3,
                  shuffle: true,
                },
              ])
            }
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: P.olive }}
          >
            <Plus size={12} /> Add Quiz Template
          </button>
        </CfgSection>
      )}

      {activeCategory === "program" && (
        <CfgSection title="Learning Program Templates">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
              Reusable program structures HR can create, save, and reuse with audience rules,
              program windows, task lists, and milestone checkpoints.
            </p>
            <button
              onClick={() => openProgramTemplateEditor()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white flex-shrink-0"
              style={{ background: P.olive }}
            >
              <Plus size={12} /> Create Template
            </button>
          </div>
          {programTemplateNotice && (
            <div
              className="flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold"
              style={{ background: P.lightSage, borderColor: P.border, color: P.darkOlive }}
            >
              <CheckCircle size={14} /> {programTemplateNotice}
            </div>
          )}
          {programTemplateDraft && (
            <div
              className="rounded-xl border p-4 space-y-4"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold" style={{ color: P.text }}>
                    {editingProgramTemplateId ? "Edit Program Template" : "Create Program Template"}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    Saved templates can be reused when HR creates future programs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingProgramTemplateId(null);
                    setProgramTemplateDraft(null);
                  }}
                  className="p-1.5 rounded-lg"
                  style={{ color: P.textMuted }}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Template Name
                  </label>
                  <input
                    value={programTemplateDraft.name}
                    onChange={(e) => updateProgramTemplateDraft({ name: e.target.value })}
                    placeholder="e.g. Leadership Cohort Template"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Program Type
                  </label>
                  <select
                    value={programTemplateDraft.type}
                    onChange={(e) => updateProgramTemplateDraft({ type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {[
                      "New Employee",
                      "Graduate Trainee",
                      "Leadership",
                      "Technical",
                      "Compliance",
                      "Refresher",
                    ].map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Target Audience
                  </label>
                  <input
                    value={programTemplateDraft.targetAudience}
                    onChange={(e) => updateProgramTemplateDraft({ targetAudience: e.target.value })}
                    placeholder="e.g. New managers, engineers, all employees"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: P.textMid }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={programTemplateDraft.startDate}
                      onChange={(e) => updateProgramTemplateDraft({ startDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: P.textMid }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={programTemplateDraft.endDate}
                      onChange={(e) => updateProgramTemplateDraft({ endDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Default Duration
                  </label>
                  <input
                    value={programTemplateDraft.duration}
                    onChange={(e) => updateProgramTemplateDraft({ duration: e.target.value })}
                    placeholder="e.g. 8 weeks"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Course Count
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={programTemplateDraft.courseCount}
                    onChange={(e) => updateProgramTemplateDraft({ courseCount: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Task List
                  </label>
                  <textarea
                    rows={5}
                    value={programTemplateDraft.taskText}
                    onChange={(e) => updateProgramTemplateDraft({ taskText: e.target.value })}
                    placeholder={"One task per line\nPre-assessment\nCourse completion"}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none resize-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Milestones
                  </label>
                  <textarea
                    rows={5}
                    value={programTemplateDraft.milestoneText}
                    onChange={(e) => updateProgramTemplateDraft({ milestoneText: e.target.value })}
                    placeholder={"One milestone per line\nKickoff\nMidpoint review\nCompletion"}
                    className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none resize-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingProgramTemplateId(null);
                      setProgramTemplateDraft(null);
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{
                      border: `1px solid ${P.border}`,
                      color: P.textMid,
                      background: "white",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveProgramTemplateDraft}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{ background: P.olive }}
                  >
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-2 mb-3">
            {programTemplates.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 p-3 rounded-xl border"
                style={{ borderColor: P.border, background: "white" }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: P.lightSage }}
                >
                  <Layers size={15} style={{ color: P.olive }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {t.name}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {t.type} · {t.weeks} weeks · {t.courses} courses
                  </p>
                  <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                    Audience: {t.targetAudience} · Window: {t.startDate || "No start date"} to{" "}
                    {t.endDate || "No end date"}
                  </p>
                  <p className="text-[10px] mt-1 line-clamp-2" style={{ color: P.textMid }}>
                    Tasks: {t.taskList.join(" · ")} · Milestones: {t.milestones.join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => openProgramTemplateEditor(t)}
                  className="text-xs px-2.5 py-1 rounded-lg flex-shrink-0"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.textMid }}
                >
                  Edit
                </button>
                <button
                  onClick={() => cloneProgramTemplate(t)}
                  className="p-2 rounded-lg flex-shrink-0"
                  title="Duplicate template"
                  style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.olive }}
                >
                  <Copy size={13} />
                </button>
                <span
                  className="rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{ background: t.active ? P.lightSage : P.bg, color: P.textMid }}
                >
                  {t.active ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() =>
                    updateProgramTemplateLibrary((templates) =>
                      templates.filter((item) => item.id !== t.id),
                    )
                  }
                  className="p-2 rounded-lg flex-shrink-0"
                  title="Delete template"
                  style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#C0392B" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => openProgramTemplateEditor()}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: P.olive }}
          >
            <Plus size={12} /> Create Program Template
          </button>
        </CfgSection>
      )}

      {activeCategory === "email" && (
        <CfgSection title="Email Templates">
          <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
            Customise the email content sent for each notification event. Click Edit to open the
            template editor.
          </p>
          {editingEmail ? (
            <div
              className="rounded-xl border p-4 space-y-3"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {emailTemplates.find((e) => e.id === editingEmail)?.name}
                </p>
                <button
                  onClick={() => setEditingEmail(null)}
                  className="text-xs font-medium"
                  style={{ color: P.textMuted }}
                >
                  ✕ Close
                </button>
              </div>
              <CfgField
                label="Subject line"
                value={`[ADIU LearnOS] ${emailTemplates.find((e) => e.id === editingEmail)?.name}`}
              />
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Body
                </label>
                <textarea
                  rows={6}
                  defaultValue={`Dear {{learner_name}},\n\nThis is a notification from ADIU Communication Service PLC's learning platform.\n\n{{message_body}}\n\nBest regards,\nThe L&D Team`}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white focus:outline-none resize-none"
                  style={{
                    border: `1px solid ${P.border}`,
                    color: P.text,
                    fontFamily: "monospace",
                  }}
                />
              </div>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                Available variables:{" "}
                <code className="px-1 py-0.5 rounded" style={{ background: P.lightSage }}>
                  {"{{learner_name}}"}
                </code>{" "}
                <code className="px-1 py-0.5 rounded" style={{ background: P.lightSage }}>
                  {"{{course_name}}"}
                </code>{" "}
                <code className="px-1 py-0.5 rounded" style={{ background: P.lightSage }}>
                  {"{{due_date}}"}
                </code>{" "}
                <code className="px-1 py-0.5 rounded" style={{ background: P.lightSage }}>
                  {"{{manager_name}}"}
                </code>
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingEmail(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: P.olive }}
                >
                  Save Template
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  data-prototype-action="true"
                >
                  Preview Email
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-xs font-medium"
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  data-prototype-action="true"
                >
                  Restore Default
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {emailTemplates.map((t) => {
                const sc = catColor(t.category);
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{ borderColor: P.border, background: "white" }}
                  >
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: sc.bg, color: sc.color }}
                    >
                      {t.category}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {t.name}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {t.desc}
                      </p>
                    </div>
                    <button
                      onClick={() => setEditingEmail(t.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                      style={{ background: P.lightSage, color: P.olive }}
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <CfgField label="Email sender name" value="ADIU LearnOS" />
          <CfgField label="Reply-to address" value="l&d@adiu.com" />
        </CfgSection>
      )}

      <SaveBar />
    </div>
  );
}
