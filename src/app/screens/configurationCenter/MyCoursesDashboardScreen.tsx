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

import { MyCoursesBuilderView } from "./MyCoursesBuilderView";
import { MyCoursesDashboardHome } from "./MyCoursesDashboardHome";
import type {
  MyCoursesBuilderViewContext,
  MyCoursesDashboardViewContext,
} from "./MyCoursesDashboard.types";

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

const EMPTY_SAVED_CREATOR_COURSES: SavedCreatorCourse[] = [];

export function MyCoursesDashboardScreen({
  navigate,
  contentTypes = DEFAULT_CONTENT_TYPE_CONFIG,
  questionTypes = DEFAULT_QUESTION_TYPE_CONFIG,
  onSaveCourse,
  savedCourses = EMPTY_SAVED_CREATOR_COURSES,
  courseCategories = DEFAULT_CREATOR_CATEGORIES,
  courseLevels = DEFAULT_CREATOR_LEVELS,
}: {
  navigate: (s: string) => void;
  contentTypes?: CourseContentTypeConfig[];
  questionTypes?: QuestionTypeConfig[];
  onSaveCourse?: (course: SavedCreatorCourse) => void;
  savedCourses?: SavedCreatorCourse[];
  courseCategories?: CourseTaxonomyOption[];
  courseLevels?: CourseTaxonomyOption[];
}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const toCreatorCourseMini = (savedCourse: SavedCreatorCourse): CourseMini => ({
    id: savedCourse.id,
    title: savedCourse.title,
    category: savedCourse.category,
    level: savedCourse.level,
    status: "Published",
    enrolled: 0,
    rating: 0,
    thumb: savedCourse.thumbnail,
  });
  const mergeSavedCreatorCourses = (items: CourseMini[]) => [
    ...savedCourses.map(toCreatorCourseMini),
    ...items.filter((item) => !savedCourses.some((savedCourse) => savedCourse.id === item.id)),
  ];
  const [courses, setCourses] = useState<CourseMini[]>(() =>
    mergeSavedCreatorCourses(COURSES_MINI),
  );
  const [openBuilder, setOpenBuilder] = useState<string | null>(null);
  const [builderPanel, setBuilderPanel] = useState("info");
  const [showCourseTemplateChooser, setShowCourseTemplateChooser] = useState(false);
  const [companyCourseTemplates, setCompanyCourseTemplates] = useState<CourseCreationTemplate[]>(
    () => loadCourseCreationTemplates(),
  );
  const [courseDrafts, setCourseDrafts] = useState<Record<string, CourseDraftDetails>>({});
  const [showAddItem, setShowAddItem] = useState(false);
  const [activeContentChapter, setActiveContentChapter] = useState<string | null>(null);
  const [showQuizWorkflow, setShowQuizWorkflow] = useState(false);
  const [activeQuizModule, setActiveQuizModule] = useState<string | null>(null);
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, SavedContentItem[]>>({});
  const [courseEndQuizzes, setCourseEndQuizzes] = useState<Record<string, SavedContentItem[]>>({});
  const [showCourseQuizWorkflow, setShowCourseQuizWorkflow] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState<SavedContentItem | null>(null);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizOption, setQuizOption] = useState<"template" | "duplicate" | "custom">("template");
  const [quizStep, setQuizStep] = useState<1 | 2 | 3>(1);
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [quizConfig, setQuizConfig] = useState({
    negativeMarking: false,
    negativeRatio: false,
    varyPerAttempt: true,
    attempt1Full: false,
    attempt2Reduced: false,
    attempt3Min: false,
    timeLimitMin: 30,
    perQuestionSec: 90,
    section1Min: 10,
    section2Min: 15,
    section3Min: 20,
  });
  const [contactSearch, setContactSearch] = useState("");
  const [selectedContact, setSelectedContact] = useState<(typeof EMPLOYEES)[0] | null>(
    EMPLOYEES[0],
  );
  const [showContactDrop, setShowContactDrop] = useState(false);
  const [prereqs, setPrereqs] = useState<string[]>(["Cybersecurity Basics"]);
  const [prereqSearch, setPrereqSearch] = useState("");
  const [prereqMode, setPrereqMode] = useState<"all" | "any">("all");
  // Enrollment panel state
  const [enrollType, setEnrollType] = useState("open");
  // Visibility panel state
  const [visibilityScope, setVisibilityScope] = useState("everyone");
  // Certification panel state
  const [certEnabled, setCertEnabled] = useState(true);
  const [certScore, setCertScore] = useState(80);
  const [certTemplate, setCertTemplate] = useState("standard");
  const [certTemplateReview, setCertTemplateReview] = useState<string | null>(null);
  const updateCertScore = (value: number) => {
    const nextScore = Number.isFinite(value) ? value : 0;
    setCertScore(Math.min(100, Math.max(0, Math.round(nextScore))));
  };
  // Attendees panel state (must be at top level — Rules of Hooks)
  const [assignMode, setAssignMode] = useState<"individual" | "group">("group");
  const [selectedGroups, setSelectedGroups] = useState<string[]>([
    "Engineering",
    "Product",
    "Sales",
    "All Employees",
  ]);
  const [employeePickerOpen, setEmployeePickerOpen] = useState(false);
  const [employeePickerSearch, setEmployeePickerSearch] = useState("");
  const [individuals, setIndividuals] = useState<
    Array<{ name: string; initials: string; role: string; dept: string; color: string }>
  >([]);

  const statuses = ["All", "Published", "In Review", "Draft", "Archived"];

  useEffect(() => {
    setCourses((items) => mergeSavedCreatorCourses(items));
  }, [savedCourses]);

  const filtered = courses.filter(
    (c) =>
      (filter === "All" || c.status === filter) &&
      (!search || c.title.toLowerCase().includes(search.toLowerCase())),
  );

  const course = openBuilder ? (courses.find((c) => c.id === openBuilder) ?? null) : null;
  const filteredEmployees = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      e.dept.toLowerCase().includes(contactSearch.toLowerCase()),
  );
  const employeePickerResults = EMPLOYEES.filter((employee) => {
    const searchTerm = employeePickerSearch.trim().toLowerCase();
    return (
      !searchTerm ||
      employee.name.toLowerCase().includes(searchTerm) ||
      employee.role.toLowerCase().includes(searchTerm) ||
      employee.dept.toLowerCase().includes(searchTerm)
    );
  });
  const filteredCourses = courses.filter(
    (c) => c.id !== openBuilder && c.title.toLowerCase().includes(prereqSearch.toLowerCase()),
  );
  const allowedCreatorContentTypes = contentTypes
    .filter((type) => type.enabled && type.allowCreator)
    .map((type) => type.label);
  const canAddQuiz = allowedCreatorContentTypes.includes("Quiz");
  const currentCourseEndQuizzes = course ? (courseEndQuizzes[course.id] ?? []) : [];
  const activeCertificateTemplateReview = CREATOR_CERTIFICATE_TEMPLATES.find(
    (template) => template.id === certTemplateReview,
  );
  const savedCourseDetails = course
    ? savedCourses.find((savedCourse) => savedCourse.id === course.id)
    : undefined;
  const courseDetails = course
    ? (courseDrafts[course.id] ??
      (savedCourseDetails
        ? createSavedCreatorCourseDraft(savedCourseDetails)
        : createExistingCourseDraft(course)))
    : null;
  const selectedCategory = courseDetails?.category ?? course?.category ?? "";
  const selectedLevel = courseDetails?.level ?? course?.level ?? "";
  const categoryOptions = Array.from(
    new Set([
      ...courseCategories
        .filter((category) => category.active !== false)
        .map((category) => category.name)
        .filter(Boolean),
      selectedCategory,
    ]),
  ).filter(Boolean);
  const levelOptions = Array.from(
    new Set([
      ...[...courseLevels]
        .filter((level) => level.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((level) => level.name)
        .filter(Boolean),
      selectedLevel,
    ]),
  ).filter(Boolean);
  const activePreCourseAssessment = courseDetails?.preCourseAssessment ?? "optional";
  const activeCompanyCourseTemplates = companyCourseTemplates.filter((template) => template.active);
  const statusCounts = statuses.reduce<Record<string, number>>((counts, status) => {
    counts[status] =
      status === "All" ? courses.length : courses.filter((c) => c.status === status).length;
    return counts;
  }, {});

  const openCourseBuilder = (courseId: string, panel = "info") => {
    const draft = courseDrafts[courseId];
    const savedCourse = savedCourses.find((saved) => saved.id === courseId);
    if (draft) updateCertScore(draft.passThreshold);
    else if (savedCourse) updateCertScore(savedCourse.passThreshold);
    setOpenBuilder(courseId);
    setBuilderPanel(panel);
  };

  const toggleIndividualEmployee = (employee: (typeof EMPLOYEES)[number]) => {
    setIndividuals((current) => {
      if (current.some((person) => person.name === employee.name)) {
        return current.filter((person) => person.name !== employee.name);
      }

      const initials = employee.name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

      return [
        ...current,
        {
          name: employee.name,
          initials,
          role: employee.role,
          dept: employee.dept,
          color: current.length % 2 === 0 ? P.sage : P.olive,
        },
      ];
    });
  };

  const openCourseTemplateChooser = () => {
    setCompanyCourseTemplates(loadCourseCreationTemplates());
    setShowCourseTemplateChooser(true);
  };

  const createDraftCourse = (draft: CourseDraftDetails) => {
    const newCourse: CourseMini = {
      id: `draft-${Date.now()}`,
      title: draft.title,
      category: draft.category,
      level: draft.level,
      status: "Draft",
      enrolled: 0,
      rating: 0,
      thumb: draft.thumbnail,
    };

    setCourses((items) => [newCourse, ...items]);
    setCourseDrafts((drafts) => ({ ...drafts, [newCourse.id]: draft }));
    updateCertScore(draft.passThreshold);
    setOpenBuilder(newCourse.id);
    setBuilderPanel("info");
    setShowCourseTemplateChooser(false);
  };

  const updateActiveCourseDraft = (updater: (draft: CourseDraftDetails) => CourseDraftDetails) => {
    if (!course) return;

    setCourseDrafts((drafts) => {
      const savedCourse = savedCourses.find((saved) => saved.id === course.id);
      const currentDraft =
        drafts[course.id] ??
        (savedCourse
          ? createSavedCreatorCourseDraft(savedCourse)
          : createExistingCourseDraft(course));
      return { ...drafts, [course.id]: updater(currentDraft) };
    });
  };

  const saveActiveCourse = () => {
    if (!course || !courseDetails) return;

    const savedDraft: CourseDraftDetails = {
      ...courseDetails,
      title: courseDetails.title.trim() || "Untitled Course",
      description: courseDetails.description.trim() || "Course description pending.",
      duration: courseDetails.duration.trim() || "8h 30m",
    };
    const lessonCount = savedDraft.chapters.reduce(
      (sum, chapter) => sum + chapter.contentItems.length,
      0,
    );
    const savedCourse: CourseMini = {
      ...course,
      title: savedDraft.title,
      category: savedDraft.category,
      level: savedDraft.level,
      thumb: savedDraft.thumbnail,
      status: "Published",
    };

    setCourses((items) => items.map((item) => (item.id === course.id ? savedCourse : item)));
    setCourseDrafts((drafts) => ({ ...drafts, [course.id]: savedDraft }));
    setFilter("All");
    setOpenBuilder(null);
    onSaveCourse?.({
      id: course.id,
      title: savedDraft.title,
      description: savedDraft.description,
      category: savedDraft.category,
      level: savedDraft.level,
      duration: savedDraft.duration,
      chapters: savedDraft.chapters.map((chapter) => ({
        ...chapter,
        contentItems: chapter.contentItems.map((item) => ({ ...item })),
      })),
      thumbnail: savedDraft.thumbnail,
      lessons: Math.max(lessonCount, 1),
      xpValue: savedDraft.xpValue,
      passThreshold: savedDraft.passThreshold,
      preCourseAssessment: savedDraft.preCourseAssessment,
      placement: savedDraft.placement,
      programId: savedDraft.placement === "program" ? savedDraft.programId : undefined,
      programName: savedDraft.placement === "program" ? savedDraft.programName : undefined,
      sourceType: savedDraft.sourceType,
      sourceTemplateId: savedDraft.sourceTemplateId,
      sourceTemplateName: savedDraft.sourceTemplateName,
    });
  };

  const viewContext: MyCoursesDashboardViewContext = {
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
    contentTypes,
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
  };

  if (course && courseDetails) {
    const builderContext: MyCoursesBuilderViewContext = {
      ...viewContext,
      course,
      courseDetails,
    };

    return <MyCoursesBuilderView ctx={builderContext} />;
  }

  return <MyCoursesDashboardHome ctx={viewContext} />;
}

// ─────────────────────────────────────────────────────────────
// 5. CERTIFICATION MANAGEMENT (merged)
// ─────────────────────────────────────────────────────────────
