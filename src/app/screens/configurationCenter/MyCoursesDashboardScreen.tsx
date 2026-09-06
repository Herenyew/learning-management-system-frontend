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
import { coursePublishingApi } from "../../API/coursePublishing.api";
import {
  fallbackCreatorCourseThumbnail,
  upsertCreatorSavedCourse,
} from "../../services/creatorCourses.service";
import type { WorkflowOption } from "../../API/coursePublishing.api";
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

// Maps the backend CourseVersion state (synced from GET /courses/versions/my-courses)
// onto the dashboard's display statuses. Courses still awaiting an approver
// decision stay "In Review"; rejected/cancelled ones return to "Draft" for
// revision; only the approval workflow itself can move a course to Published.
const deriveCreatorCourseStatus = (
  course: Pick<SavedCreatorCourse, "publishStatus" | "approvalStatus">,
): CourseMini["status"] => {
  if (course.publishStatus === "PUBLISHED") return "Published";
  if (course.publishStatus === "ARCHIVED") return "Archived";
  if (course.approvalStatus === "REJECTED" || course.approvalStatus === "CANCELLED") {
    return "Draft";
  }
  return "In Review";
};

export function MyCoursesDashboardScreen({
  navigate,
  contentTypes = DEFAULT_CONTENT_TYPE_CONFIG,
  questionTypes = DEFAULT_QUESTION_TYPE_CONFIG,
  onSaveCourse,
  savedCourses = EMPTY_SAVED_CREATOR_COURSES,
  courseCategories = DEFAULT_CREATOR_CATEGORIES,
  courseLevels = DEFAULT_CREATOR_LEVELS,
  deepLinkCourseVersionId,
}: {
  navigate: (s: string) => void;
  contentTypes?: CourseContentTypeConfig[];
  questionTypes?: QuestionTypeConfig[];
  onSaveCourse?: (course: SavedCreatorCourse) => void;
  savedCourses?: SavedCreatorCourse[];
  courseCategories?: CourseTaxonomyOption[];
  courseLevels?: CourseTaxonomyOption[];
  /** courseVersionId extracted from a notification deep link (may be null). */
  deepLinkCourseVersionId?: string | null;
}) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const toCreatorCourseMini = (savedCourse: SavedCreatorCourse): CourseMini => ({
    id: savedCourse.id,
    title: savedCourse.title,
    category: savedCourse.category,
    level: savedCourse.level,
    // Derive the status from the backend-synced approval/publish state instead
    // of hardcoding "In Review" — otherwise a course an approver has already
    // published would show as "In Review" forever.
    status: deriveCreatorCourseStatus(savedCourse),
    enrolled: 0,
    rating: 0,
    thumb: savedCourse.thumbnail,
    feedback: savedCourse.latestFeedback,
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

  // ── Backend status sync ────────────────────────────────────────────────────
  // The dashboard used to render statuses from local state only, so a course
  // an approver had already published still showed "In Review". Re-fetch the
  // authoritative approval/publish state for this creator's CourseVersions:
  //   1. push it onto this browser's saved courses (persisted via the store), and
  //   2. add courses that exist on the backend but not in this browser's
  //      localStorage (e.g. created in another browser/incognito) so the
  //      course list is consistent across sessions and devices.
  const syncedStatusSignatureRef = useRef("");
  useEffect(() => {
    let cancelled = false;
    coursePublishingApi
      .getMyCourseStatuses()
      .then((statuses) => {
        if (cancelled) return;
        // Skip the whole sync (and any store writes) when the backend state is
        // unchanged since the last fetch — prevents a refetch/write loop, since
        // the writes below update the savedCourses store this effect depends on.
        const signature = statuses
          .map((status) => `${status.id}:${status.status}:${status.approvalStatus}`)
          .join("|");
        if (signature && signature === syncedStatusSignatureRef.current) return;
        syncedStatusSignatureRef.current = signature;

        const syncedVersionIds = new Set<number>();

        // 1. Sync the backend state onto locally saved courses.
        for (const status of statuses) {
          const match =
            savedCourses.find((savedCourse) => savedCourse.courseVersionId === status.id) ??
            savedCourses.find(
              (savedCourse) =>
                savedCourse.title.trim().toLowerCase() ===
                status.course.title.trim().toLowerCase(),
            );
          if (!match) continue;
          syncedVersionIds.add(status.id);
          const publishStatus = status.status as SavedCreatorCourse["publishStatus"];
          const approvalStatus = status.approvalStatus as SavedCreatorCourse["approvalStatus"];
          const latestFeedback =
            (status.approvalInstances?.[0]?.decisions?.[0]?.comment as string | undefined) ??
            status.approvalInstances?.[0]?.latestComment ??
            undefined;
          if (match.publishStatus === publishStatus && match.approvalStatus === approvalStatus) {
            if (match.latestFeedback !== latestFeedback) {
              const syncedFeedback: SavedCreatorCourse = {
                ...match,
                courseVersionId: status.id,
                latestFeedback,
              };
              if (onSaveCourse) onSaveCourse(syncedFeedback);
              else upsertCreatorSavedCourse(syncedFeedback);
            }
            continue;
          }
          const synced: SavedCreatorCourse = {
            ...match,
            courseVersionId: status.id,
            publishStatus,
            approvalStatus,
            latestFeedback,
          };
          if (onSaveCourse) onSaveCourse(synced);
          else upsertCreatorSavedCourse(synced);
        }

        // 2. Surface backend-only courses (no localStorage entry in this
        //    browser) so they appear in every session.
        setCourses((items) => {
          const additions: CourseMini[] = [];
          for (const status of statuses) {
            if (syncedVersionIds.has(status.id)) continue;
            const backendId = `backend-${status.id}`;
            const lowerTitle = status.course.title.trim().toLowerCase();
            const feedback =
              (status.approvalInstances?.[0]?.decisions?.[0]?.comment as string | undefined) ??
              status.approvalInstances?.[0]?.latestComment ??
              undefined;
            if (
              items.some((item) => item.id === backendId) ||
              items.some((item) => item.title.trim().toLowerCase() === lowerTitle)
            ) {
              continue;
            }
            additions.push({
              id: backendId,
              title: status.course.title,
              category: "General",
              level: "Beginner",
              status: deriveCreatorCourseStatus({
                publishStatus: status.status as SavedCreatorCourse["publishStatus"],
                approvalStatus: status.approvalStatus as SavedCreatorCourse["approvalStatus"],
              }),
              enrolled: 0,
              rating: 0,
              thumb: fallbackCreatorCourseThumbnail,
              feedback,
            });
          }
          return additions.length > 0 ? [...items, ...additions] : items;
        });
      })
      .catch(() => {
        // Backend unavailable or the user lacks the permission — keep the
        // local display as-is rather than blocking the dashboard.
      });
    return () => {
      cancelled = true;
    };
    // onSaveCourse intentionally excluded: the App-level callback is stable in
    // behavior (upsert by id) and including it would retrigger on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedCourses]);

  // ── Notification deep link ─────────────────────────────────────────────────
  // Creator notifications link to /?screen=my-courses-builder&courseVersionId=X.
  // Open the builder for the matching saved course (matched via the
  // courseVersionId persisted when the course was submitted for review).
  const deepLinkHandledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLinkCourseVersionId || deepLinkHandledRef.current === deepLinkCourseVersionId) return;
    const match = savedCourses.find(
      (savedCourse) => String(savedCourse.courseVersionId) === deepLinkCourseVersionId,
    );
    if (match) {
      deepLinkHandledRef.current = deepLinkCourseVersionId;
      setFilter("All");
      setOpenBuilder(match.id);
    }
  }, [deepLinkCourseVersionId, savedCourses]);

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

  // Courses already submitted to the backend approval workflow in this session
  // (guards against duplicate workflow instances when a course is saved twice).
  const submittedCourseIds = useRef<Set<string>>(new Set());

  // ── Workflow picker ────────────────────────────────────────────────────────
  // Loaded once so the creator can pick which workflow to use when submitting.
  // If there is only one workflow, the picker is skipped automatically.
  const [availableWorkflows, setAvailableWorkflows] = useState<WorkflowOption[]>([]);
  const [pendingSubmit, setPendingSubmit] = useState<{
    courseVersionId: number;
    courseId: string;
  } | null>(null); // non-null = picker modal is open

  useEffect(() => {
    coursePublishingApi.listWorkflows().then(setAvailableWorkflows).catch(() => {
      // Non-critical — falls back to default workflow silently
    });
  }, []);

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
      // Saving submits the course into the approval workflow — the creator
      // cannot self-publish. Only workflow approvers move it to Published.
      status: "In Review",
    };

    setCourses((items) => items.map((item) => (item.id === course.id ? savedCourse : item)));
    setCourseDrafts((drafts) => ({ ...drafts, [course.id]: savedDraft }));
    setFilter("All");
    setOpenBuilder(null);
    const savedCoursePayload: SavedCreatorCourse = {
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
      postCourseAssessment: savedDraft.postCourseAssessment,
      preCourseAssessmentQuestions: savedDraft.preCourseAssessmentQuestions.map((question) => ({
        ...question,
      })),
      postCourseAssessmentQuestions: savedDraft.postCourseAssessmentQuestions.map((question) => ({
        ...question,
      })),
      placement: savedDraft.placement,
      programId: savedDraft.placement === "program" ? savedDraft.programId : undefined,
      programName: savedDraft.placement === "program" ? savedDraft.programName : undefined,
      sourceType: savedDraft.sourceType,
      sourceTemplateId: savedDraft.sourceTemplateId,
      sourceTemplateName: savedDraft.sourceTemplateName,
    };
    onSaveCourse?.(savedCoursePayload);

    // Persist the course to the backend and trigger the approval workflow so
    // the approvers configured on the COURSE workflow get notified. Fire-and-
    // forget: the local save above always succeeds, backend failures are
    // non-blocking (the course can be re-saved to retry).
    //
    // Flow:
    //   1. submitNewDraft  — creates the CourseVersion record in the DB
    //   2. submitForReview — creates the ApprovalWorkflowInstance tied to
    //      that CourseVersion and notifies the configured reviewers via SSE
    //      + email.  Without this second call the reviewers never receive
    //      the COURSE_PUBLISHING_REVIEW_REQUESTED notification and the
    //      HRPublishingScreen shows nothing.
    // Courses synced from the backend (id "backend-<versionId>", created in
    // another browser/session) already have an approval workflow instance —
    // saving them locally must not create a duplicate draft submission.
    const isBackendSyncedCourse = course.id.startsWith("backend-");
    if (!isBackendSyncedCourse && !submittedCourseIds.current.has(course.id)) {
      submittedCourseIds.current.add(course.id);
      coursePublishingApi
        .submitNewDraft({
          title: savedDraft.title,
          description: savedDraft.description,
        })
        .then(async (draft) => {
          if (draft.courseVersionId) {
            // Persist the backend linkage on the saved course so the dashboard
            // can sync this course's approval/publish status later (matched
            // via courseVersionId) and notification deep links can find it.
            onSaveCourse?.({
              ...savedCoursePayload,
              courseVersionId: draft.courseVersionId,
              approvalStatus: "PENDING",
              publishStatus: "DRAFT",
            });
            // If multiple workflows are available, show the picker modal.
            // Otherwise submit immediately with the default.
            if (availableWorkflows.length > 1) {
              setPendingSubmit({ courseVersionId: draft.courseVersionId, courseId: course.id });
              return; // picker modal handles the rest
            }
            // Single (or zero) workflows — submit directly, workflowId optional
            const workflowId = availableWorkflows[0]?.id;
            try {
              const review = await coursePublishingApi.submitForReview(
                draft.courseVersionId,
                undefined,
                workflowId,
              );
              console.info(
                `[course-publishing] ${review.message} (instanceId=${review.instanceId})`,
              );
            } catch (reviewErr) {
              console.warn(
                "[course-publishing] Draft saved but submit-for-review failed:",
                (reviewErr as Error)?.message,
              );
            }
          } else if (draft.workflowConfigured && draft.notifiedReviewerCount > 0) {
            console.info(
              `[course-publishing] ${draft.message} (notified ${draft.notifiedReviewerCount} reviewer(s))`,
            );
          } else {
            console.info(`[course-publishing] ${draft.message}`);
          }
        })
        .catch((err) => {
          submittedCourseIds.current.delete(course.id);
          console.warn("[course-publishing] Failed to submit course draft:", err?.message);
        });
    }
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

    return (
      <>
        <MyCoursesBuilderView ctx={builderContext} />
        {pendingSubmit && (
          <WorkflowPickerModal
            workflows={availableWorkflows}
            onPick={async (workflowId) => {
              const { courseVersionId, courseId } = pendingSubmit;
              setPendingSubmit(null);
              try {
                const review = await coursePublishingApi.submitForReview(
                  courseVersionId,
                  undefined,
                  workflowId,
                );
                console.info(`[course-publishing] ${review.message} (workflow: ${review.workflowName}, instanceId=${review.instanceId})`);
              } catch (err) {
                submittedCourseIds.current.delete(courseId);
                console.warn("[course-publishing] Workflow submit failed:", (err as Error)?.message);
              }
            }}
            onCancel={() => {
              if (pendingSubmit) submittedCourseIds.current.delete(pendingSubmit.courseId);
              setPendingSubmit(null);
            }}
          />
        )}
      </>
    );
  }

  return <MyCoursesDashboardHome ctx={viewContext} />;
}

// ─── WorkflowPickerModal ──────────────────────────────────────────────────────
// Shows when the creator has multiple COURSE_VERSION workflows to choose from.
// If there is only one, this modal is skipped entirely.

function WorkflowPickerModal({
  workflows,
  onPick,
  onCancel,
}: {
  workflows: WorkflowOption[];
  onPick: (workflowId: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [selected, setSelected] = React.useState<number>(workflows[0]?.id ?? 0);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await onPick(selected);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedWf = workflows.find(w => w.id === selected);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15, 23, 42, 0.5)" }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: P.border }}>
          <h2 className="text-base font-bold" style={{ color: P.text }}>
            Choose Approval Workflow
          </h2>
          <p className="text-xs mt-1" style={{ color: P.textMuted }}>
            Select which workflow should review this course before it goes live.
          </p>
        </div>

        {/* Workflow cards */}
        <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
          {workflows.map(wf => {
            const isSelected = wf.id === selected;
            const stepSummary = wf.steps
              .map(s => s.approverRole?.name ?? s.approverEmployeeId ?? "Auto")
              .join(" → ");
            return (
              <button
                key={wf.id}
                type="button"
                onClick={() => setSelected(wf.id)}
                className="w-full text-left rounded-xl border p-4 transition-all"
                style={{
                  borderColor: isSelected ? P.olive : P.border,
                  background:  isSelected ? P.paleGreen : "white",
                }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold" style={{ color: P.text }}>
                    {wf.name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {wf.isDefault && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: P.lightSage, color: P.olive }}>
                        Default
                      </span>
                    )}
                    <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all`}
                      style={{
                        borderColor: isSelected ? P.olive : P.border,
                        background:  isSelected ? P.olive : "white",
                      }}
                    />
                  </div>
                </div>
                {wf.description && (
                  <p className="text-[11px] mb-2" style={{ color: P.textMuted }}>{wf.description}</p>
                )}
                {wf.steps.length > 0 && (
                  <p className="text-[10px] font-medium" style={{ color: P.textMid }}>
                    {wf.steps.length} step{wf.steps.length !== 1 ? "s" : ""}: {stepSummary}
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected summary */}
        {selectedWf && (
          <div className="mx-6 mb-2 px-3 py-2 rounded-lg text-[11px]"
            style={{ background: P.paleGreen, color: P.olive }}>
            <strong>{selectedWf.name}</strong> will be used to review this course.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-6 pb-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!selected || submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: P.olive }}
          >
            {submitting && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. CERTIFICATION MANAGEMENT (merged)
// ─────────────────────────────────────────────────────────────
