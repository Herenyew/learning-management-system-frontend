// Extensions2.tsx — Training Calendar, Effectiveness, Live Sessions,
// Program Dashboard, Question Bank, Surveys, Assignments, Cert Providers
// Olive / Sage / Gold enterprise palette — matches App.tsx

import { useState } from "react";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  Share2,
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
  Filter,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  X,
  Copy,
  Archive,
  RefreshCw,
  Send,
  Link,
  UserCheck,
  Layers,
  Shield,
  Eye,
  Settings,
  MoreHorizontal,
  Flag,
  Zap,
  Lock,
  Bell,
  Cpu,
  Building,
  PlusCircle,
  Upload,
  ThumbsUp,
  ThumbsDown,
  User,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DEFAULT_QUESTION_TYPE_CONFIG, type QuestionTypeConfig } from "../../Extensions6";

// ─── Palette ─────────────────────────────────────────────────
const P = {
  olive: "#047857",
  darkOlive: "#065F46",
  deepOlive: "#064E3B",
  sage: "#6EE7B7",
  lightSage: "#D1FAE5",
  paleGreen: "#ECFDF5",
  gold: "#C8A85D",
  goldLight: "#FDF5E0",
  goldMid: "#F0E2B8",
  bg: "#F6FEFA",
  text: "#052E26",
  textMid: "#047857",
  textMuted: "#4B7468",
  border: "#A7F3D0",
};

// ─── Shared micro-components ──────────────────────────────────
function Av({
  initials,
  size = 32,
  color = P.olive,
}: {
  initials: string;
  size?: number;
  color?: string;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
function Chip({ label, variant = "sage" }: { label: string; variant?: string }) {
  const s: Record<string, React.CSSProperties> = {
    sage: { background: P.lightSage, color: P.darkOlive, borderColor: "#C4D4A8" },
    gold: { background: P.goldLight, color: "#8A6A1A", borderColor: "#E8D090" },
    red: { background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA" },
    green: { background: "#D8EDCC", color: "#3A6420", borderColor: "#B4D4A0" },
    blue: { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    neutral: { background: P.paleGreen, color: P.textMuted, borderColor: P.border },
  };
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={s[variant] ?? s.neutral}
    >
      {label}
    </span>
  );
}
function PBar({
  value,
  color = P.olive,
  height = 5,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: P.lightSage }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}
function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = P.olive,
  bg = P.lightSage,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  bg?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
          {label}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: bg }}
        >
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-xs mt-1 flex items-center gap-1"
          style={{ color: trend === "up" ? "#5A7A2A" : trend === "down" ? "#C0392B" : P.textMuted }}
        >
          {trend === "up" && <TrendingUp size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          {sub}
        </p>
      )}
    </div>
  );
}
function AICard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: `linear-gradient(135deg,${P.goldLight},${P.goldMid}50)`,
        border: `1px solid ${P.gold}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: P.gold }}
        >
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#7A5A10" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          {title}
        </h1>
        {sub && (
          <p className="text-sm line-clamp-1 max-w-3xl" style={{ color: P.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─── Mock data ────────────────────────────────────────────────

const CALENDAR_EVENTS = [
  {
    id: "e1",
    title: "AI & ML for Business Leaders",
    type: "course",
    date: "2025-01-15",
    deadline: true,
    color: P.olive,
  },
  {
    id: "e2",
    title: "Leadership Workshop — Virtual ILT",
    type: "live",
    date: "2025-01-17",
    time: "10:00",
    duration: "2h",
    color: P.gold,
  },
  {
    id: "e3",
    title: "Cybersecurity Compliance",
    type: "deadline",
    date: "2025-01-20",
    color: "#C0392B",
  },
  {
    id: "e4",
    title: "Data Literacy Bootcamp",
    type: "live",
    date: "2025-01-22",
    time: "14:00",
    duration: "3h",
    color: "#4A7A5A",
  },
  { id: "e5", title: "ESG Sustainability", type: "deadline", date: "2025-01-28", color: "#C0392B" },
  {
    id: "e6",
    title: "Agile Scrum Master Exam",
    type: "assessment",
    date: "2025-01-30",
    color: P.darkOlive,
  },
];

const LIVE_SESSIONS = [
  {
    id: "ls1",
    title: "AI Strategy Masterclass",
    instructor: "Dr. Sarah Chen",
    av: "SC",
    date: "Jan 22, 2025",
    time: "10:00 AM GMT",
    duration: "2h 30m",
    format: "Virtual",
    capacity: 30,
    enrolled: 28,
    waitlist: 4,
    joinUrl: "https://zoom.us/j/xxxx",
    recordingUrl: null,
    status: "Upcoming",
    conflict: false,
  },
  {
    id: "ls2",
    title: "Leadership & Change Management Workshop",
    instructor: "Marcus Johnson",
    av: "MJ",
    date: "Jan 24, 2025",
    time: "2:00 PM GMT",
    duration: "3h",
    format: "In-Person",
    capacity: 20,
    enrolled: 20,
    waitlist: 7,
    joinUrl: null,
    recordingUrl: null,
    status: "Full",
    conflict: true,
  },
  {
    id: "ls3",
    title: "Data Visualization with Tableau",
    instructor: "Priya Sharma",
    av: "PS",
    date: "Jan 28, 2025",
    time: "9:00 AM GMT",
    duration: "4h",
    format: "Virtual",
    capacity: 50,
    enrolled: 31,
    waitlist: 0,
    joinUrl: "https://teams.ms/xxxx",
    recordingUrl: null,
    status: "Upcoming",
    conflict: false,
  },
  {
    id: "ls4",
    title: "ESG Reporting Best Practices",
    instructor: "Emma Williams",
    av: "EW",
    date: "Jan 10, 2025",
    time: "11:00 AM GMT",
    duration: "2h",
    format: "Virtual",
    capacity: 40,
    enrolled: 40,
    waitlist: 0,
    joinUrl: null,
    recordingUrl: "https://recordings/esg-jan10",
    status: "Completed",
    conflict: false,
  },
];

const EFFECTIVENESS_DATA = [
  {
    course: "AI & ML for Business Leaders",
    pre: 42,
    post: 81,
    lift: 67.2,
    respondents: 312,
    dept: "Engineering",
    level: 1,
  },
  {
    course: "Cybersecurity Fundamentals",
    pre: 55,
    post: 89,
    lift: 75.6,
    respondents: 847,
    dept: "All",
    level: 1,
  },
  {
    course: "Data-Driven Leadership",
    pre: 38,
    post: 74,
    lift: 58.1,
    respondents: 178,
    dept: "Product",
    level: 2,
  },
  {
    course: "Effective Communication",
    pre: 61,
    post: 88,
    lift: 69.2,
    respondents: 423,
    dept: "Sales",
    level: 2,
  },
  {
    course: "Financial Modeling",
    pre: 29,
    post: 72,
    lift: 60.6,
    respondents: 89,
    dept: "Finance",
    level: 1,
  },
];

const EFFECTIVENESS_TREND = [
  { month: "Sep", avgLift: 52 },
  { month: "Oct", avgLift: 58 },
  { month: "Nov", avgLift: 61 },
  { month: "Dec", avgLift: 65 },
  { month: "Jan", avgLift: 68 },
];

type QuestionBankType = string;

type QuestionTypeOption = {
  type: QuestionBankType;
  label: string;
  hint: string;
  custom?: boolean;
};

type QuestionBankQuestion = {
  id: string;
  text: string;
  type: QuestionBankType;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  usedIn: number;
  weight: number;
  answerSummary?: string;
};

const QUESTION_BANK: QuestionBankQuestion[] = [
  {
    id: "q1",
    text: "Which best describes supervised machine learning?",
    type: "MCQ",
    topic: "AI & ML",
    difficulty: "Easy",
    usedIn: 3,
    weight: 1,
  },
  {
    id: "q2",
    text: "Neural networks are inspired by the human brain.",
    type: "TrueFalse",
    topic: "AI & ML",
    difficulty: "Easy",
    usedIn: 5,
    weight: 1,
  },
  {
    id: "q3",
    text: "What is the primary purpose of a training-validation split?",
    type: "MCQ",
    topic: "AI & ML",
    difficulty: "Medium",
    usedIn: 2,
    weight: 2,
  },
  {
    id: "q4",
    text: "Which metric is best for imbalanced classification datasets?",
    type: "MCQ",
    topic: "Data Science",
    difficulty: "Hard",
    usedIn: 1,
    weight: 3,
  },
  {
    id: "q5",
    text: "Overfitting occurs when a model performs well on training data but poorly on test data.",
    type: "TrueFalse",
    topic: "AI & ML",
    difficulty: "Medium",
    usedIn: 4,
    weight: 2,
  },
  {
    id: "q6",
    text: "What does GDPR stand for?",
    type: "MCQ",
    topic: "Compliance",
    difficulty: "Easy",
    usedIn: 8,
    weight: 1,
  },
  {
    id: "q7",
    text: "A company can share personal data without consent if it is anonymized.",
    type: "TrueFalse",
    topic: "Compliance",
    difficulty: "Hard",
    usedIn: 2,
    weight: 3,
  },
];

const PRESET_QUESTION_TYPES = [
  "MCQ",
  "TrueFalse",
  "ShortAnswer",
  "FillBlank",
  "Matching",
  "Ordering",
] as const;

const QUESTION_TYPE_OPTIONS: QuestionTypeOption[] = [
  { type: "MCQ", label: "Multiple Choice", hint: "Options with one correct answer" },
  { type: "TrueFalse", label: "True / False", hint: "Binary statement check" },
  { type: "ShortAnswer", label: "Short Answer", hint: "Text answer checked by reviewer or rubric" },
  { type: "FillBlank", label: "Fill in the Blank", hint: "Learner fills missing word or phrase" },
  { type: "Matching", label: "Matching", hint: "Pair terms with definitions" },
  { type: "Ordering", label: "Ordering", hint: "Arrange steps in the right sequence" },
];

const questionTypeLabel = (type: QuestionBankType, options = QUESTION_TYPE_OPTIONS) =>
  options.find((option) => option.type === type)?.label ?? type;

const questionTypeVariant = (type: QuestionBankType) => {
  const variants: Record<string, string> = {
    MCQ: "sage",
    TrueFalse: "gold",
    ShortAnswer: "blue",
    FillBlank: "green",
    Matching: "gold",
    Ordering: "sage",
  };

  return variants[type] ?? "neutral";
};

const getConfiguredQuestionBankTypes = (
  options: QuestionTypeOption[],
  config?: QuestionTypeConfig[],
) => {
  if (!config) return options;

  const allowedBuiltIns = new Set(
    config
      .filter((item) => item.type !== "custom" && item.enabled && item.allowCreator)
      .map((item) => item.type),
  );
  const allowCreatorCustomTypes = config.some(
    (item) => item.type === "custom" && item.enabled && item.allowCreator,
  );
  const configuredCustomOptions: QuestionTypeOption[] = config
    .filter(
      (item) =>
        item.type !== "custom" &&
        !PRESET_QUESTION_TYPES.includes(item.type as (typeof PRESET_QUESTION_TYPES)[number]) &&
        item.enabled &&
        item.allowCreator,
    )
    .map((item) => ({
      type: item.type,
      label: item.label,
      hint: item.desc,
      custom: true,
    }));

  const allowedOptions = options.filter((option) => {
    const matchingConfig = config.find((item) => item.type === option.type);
    if (option.custom) {
      return matchingConfig
        ? matchingConfig.enabled && matchingConfig.allowCreator
        : allowCreatorCustomTypes;
    }

    return allowedBuiltIns.has(option.type);
  });

  return [
    ...allowedOptions,
    ...configuredCustomOptions.filter(
      (customOption) => !allowedOptions.some((option) => option.type === customOption.type),
    ),
  ];
};

const canAddQuestionBankCustomTypes = (config?: QuestionTypeConfig[]) =>
  !config || config.some((item) => item.type === "custom" && item.enabled && item.allowCreator);

type AssignmentSubmissionType = "file" | "text";
type AssignmentStatus = "Active" | "Completed";

type AssignmentSubmission = {
  id: string;
  learner: string;
  initials: string;
  department: string;
  submittedAt: string;
  artifact: string;
  preview: string;
  reviewStatus: "Pending review" | "Reviewed" | "Needs revision";
  score?: number;
};

type Assignment = {
  id: string;
  title: string;
  course: string;
  submissionType: AssignmentSubmissionType;
  dueDate: string;
  peerReview: boolean;
  submitted: number;
  total: number;
  overdue: number;
  status: AssignmentStatus;
  submissions: AssignmentSubmission[];
};

const ASSIGNMENT_COURSES = [
  "AI & ML for Business Leaders",
  "Cybersecurity Fundamentals",
  "Data-Driven Leadership",
  "ESG & Sustainability",
  "Financial Risk Management",
];

const ASSIGNMENT_EXPECTED_SUBMISSIONS: Record<string, number> = {
  "AI & ML for Business Leaders": 42,
  "Cybersecurity Fundamentals": 47,
  "Data-Driven Leadership": 31,
  "ESG & Sustainability": 22,
  "Financial Risk Management": 28,
};

const ASSIGNMENT_TYPE_LABELS: Record<AssignmentSubmissionType, string> = {
  file: "File Upload",
  text: "Text Entry",
};

const ASSIGNMENTS: Assignment[] = [
  {
    id: "a1",
    title: "AI Strategy Presentation",
    course: "AI & ML for Business Leaders",
    submissionType: "file",
    dueDate: "2025-01-28",
    peerReview: true,
    submitted: 28,
    total: 42,
    overdue: 3,
    status: "Active",
    submissions: [
      {
        id: "a1-s1",
        learner: "Mei Lin",
        initials: "ML",
        department: "Operations",
        submittedAt: "Jan 26, 2025, 4:12 PM",
        artifact: "ai-strategy-roadmap.pdf",
        preview: "Executive roadmap with AI initiative prioritization and rollout milestones.",
        reviewStatus: "Pending review",
      },
      {
        id: "a1-s2",
        learner: "Thomas Gruber",
        initials: "TG",
        department: "Legal",
        submittedAt: "Jan 27, 2025, 9:05 AM",
        artifact: "governance-ai-presentation.pptx",
        preview: "Presentation focused on governance, compliance risk, and change management.",
        reviewStatus: "Reviewed",
        score: 91,
      },
      {
        id: "a1-s3",
        learner: "Alex Mercer",
        initials: "AM",
        department: "Engineering",
        submittedAt: "Jan 27, 2025, 2:18 PM",
        artifact: "engineering-ai-strategy.pdf",
        preview: "Technical operating model for AI adoption across engineering teams.",
        reviewStatus: "Pending review",
      },
    ],
  },
  {
    id: "a2",
    title: "Risk Assessment Report",
    course: "Cybersecurity Fundamentals",
    submissionType: "file",
    dueDate: "2025-01-15",
    peerReview: false,
    submitted: 45,
    total: 47,
    overdue: 2,
    status: "Active",
    submissions: [
      {
        id: "a2-s1",
        learner: "Priya Nair",
        initials: "PN",
        department: "Marketing",
        submittedAt: "Jan 14, 2025, 11:20 AM",
        artifact: "risk-assessment-report.docx",
        preview: "Security risk register covering data exposure, identity access, and mitigations.",
        reviewStatus: "Reviewed",
        score: 88,
      },
      {
        id: "a2-s2",
        learner: "Carlos Mendez",
        initials: "CM",
        department: "Product",
        submittedAt: "Jan 15, 2025, 3:42 PM",
        artifact: "product-risk-matrix.xlsx",
        preview: "Product risk matrix with likelihood, impact, and owner columns.",
        reviewStatus: "Needs revision",
        score: 72,
      },
    ],
  },
  {
    id: "a3",
    title: "Leadership Reflection Journal",
    course: "Data-Driven Leadership",
    submissionType: "text",
    dueDate: "2025-02-05",
    peerReview: true,
    submitted: 12,
    total: 31,
    overdue: 0,
    status: "Active",
    submissions: [
      {
        id: "a3-s1",
        learner: "Marcus Johnson",
        initials: "MJ",
        department: "Engineering",
        submittedAt: "Feb 3, 2025, 10:16 AM",
        artifact: "Text response",
        preview:
          "I changed my planning routine by using evidence checkpoints before team decisions.",
        reviewStatus: "Pending review",
      },
      {
        id: "a3-s2",
        learner: "Aisha Rahman",
        initials: "AR",
        department: "Finance",
        submittedAt: "Feb 4, 2025, 1:30 PM",
        artifact: "Text response",
        preview:
          "The biggest shift was using dashboards as discussion starters, not final answers.",
        reviewStatus: "Reviewed",
        score: 94,
      },
    ],
  },
  {
    id: "a4",
    title: "ESG Gap Analysis",
    course: "ESG & Sustainability",
    submissionType: "file",
    dueDate: "2024-12-20",
    peerReview: false,
    submitted: 22,
    total: 22,
    overdue: 0,
    status: "Completed",
    submissions: [
      {
        id: "a4-s1",
        learner: "Emma Williams",
        initials: "EW",
        department: "Sustainability",
        submittedAt: "Dec 18, 2024, 8:50 AM",
        artifact: "esg-gap-analysis.pdf",
        preview: "Gap assessment mapped against current reporting obligations and owners.",
        reviewStatus: "Reviewed",
        score: 96,
      },
    ],
  },
];

type AssignmentDraft = {
  title: string;
  course: string;
  submissionType: AssignmentSubmissionType;
  dueDate: string;
  peerReview: boolean;
};

const EMPTY_ASSIGNMENT_DRAFT: AssignmentDraft = {
  title: "",
  course: ASSIGNMENT_COURSES[0],
  submissionType: "file",
  dueDate: "",
  peerReview: false,
};

const formatAssignmentDueDate = (dateValue: string) => {
  if (!dateValue) return "No due date";

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

type SurveyQuestionType = "Rating" | "Likert" | "Text" | "NPS" | "Multiple Choice";

type SurveyQuestion = {
  id: string;
  prompt: string;
  type: SurveyQuestionType;
  required: boolean;
};

type SurveyQuestionSet = {
  id: string;
  name: string;
  type: string;
  timing: string;
  questions: SurveyQuestion[];
};

type SurveySubmission = {
  id: string;
  respondent: string;
  initials: string;
  department: string;
  submittedAt: string;
  answers: Record<string, string>;
};

type Survey = {
  id: string;
  title: string;
  course: string;
  type: string;
  responses: number;
  total: number;
  avgScore: number;
  status: "Active" | "Completed";
  daysPost?: number;
  anonymous: boolean;
  questionSet: SurveyQuestionSet;
  submissions: SurveySubmission[];
};

const SURVEY_COURSES = [
  "AI & ML for Business Leaders",
  "Cybersecurity Fundamentals",
  "Data-Driven Leadership",
  "ESG & Sustainability",
];

const SURVEY_TOTALS_BY_COURSE: Record<string, number> = {
  "AI & ML for Business Leaders": 312,
  "Cybersecurity Fundamentals": 156,
  "Data-Driven Leadership": 178,
  "ESG & Sustainability": 94,
};

const SURVEY_QUESTION_SETS: SurveyQuestionSet[] = [
  {
    id: "reaction-l1",
    name: "Post-Course Reaction",
    type: "Reaction (L1)",
    timing: "Post-course",
    questions: [
      {
        id: "l1-q1",
        prompt: "How satisfied are you with the overall course quality?",
        type: "Rating",
        required: true,
      },
      {
        id: "l1-q2",
        prompt: "The course content was relevant to my role and responsibilities.",
        type: "Likert",
        required: true,
      },
      {
        id: "l1-q3",
        prompt: "What did you find most valuable about this course?",
        type: "Text",
        required: false,
      },
      {
        id: "l1-q4",
        prompt: "Would you recommend this course to a colleague?",
        type: "NPS",
        required: true,
      },
    ],
  },
  {
    id: "learning-l2",
    name: "Learning Assessment",
    type: "Learning (L2)",
    timing: "Post-course",
    questions: [
      {
        id: "l2-q1",
        prompt: "The assessment measured the most important course outcomes.",
        type: "Likert",
        required: true,
      },
      {
        id: "l2-q2",
        prompt: "Which topic still needs more practice or support?",
        type: "Text",
        required: false,
      },
      {
        id: "l2-q3",
        prompt: "How confident are you applying the learned skill at work?",
        type: "Rating",
        required: true,
      },
    ],
  },
  {
    id: "behavior-l3",
    name: "Manager Behavior Check",
    type: "Behavior (L3)",
    timing: "30-60 days post-completion",
    questions: [
      {
        id: "l3-q1",
        prompt: "The learner has applied the course concepts in their work.",
        type: "Likert",
        required: true,
      },
      {
        id: "l3-q2",
        prompt: "Which behavior change have you observed most clearly?",
        type: "Text",
        required: false,
      },
      {
        id: "l3-q3",
        prompt: "What additional support would improve transfer to the job?",
        type: "Multiple Choice",
        required: true,
      },
    ],
  },
];

type SurveyDraft = {
  title: string;
  course: string;
  questionSetId: string;
  anonymous: boolean;
};

const EMPTY_SURVEY_DRAFT: SurveyDraft = {
  title: "",
  course: SURVEY_COURSES[0],
  questionSetId: SURVEY_QUESTION_SETS[0].id,
  anonymous: true,
};

const getSurveyQuestionSet = (id: string) =>
  SURVEY_QUESTION_SETS.find((set) => set.id === id) ?? SURVEY_QUESTION_SETS[0];

const SURVEYS: Survey[] = [
  {
    id: "sv1",
    title: "AI & ML — Post-Course Reaction Survey",
    course: "AI & ML for Business Leaders",
    type: "Reaction (L1)",
    responses: 287,
    total: 312,
    avgScore: 4.6,
    status: "Active",
    anonymous: true,
    questionSet: getSurveyQuestionSet("reaction-l1"),
    submissions: [
      {
        id: "sv1-sub-1",
        respondent: "Mei Lin",
        initials: "ML",
        department: "Operations",
        submittedAt: "Jan 30, 2025, 9:14 AM",
        answers: {
          "l1-q1": "5 - Very satisfied",
          "l1-q2": "Strongly agree",
          "l1-q3": "The strategy templates were immediately useful for planning.",
          "l1-q4": "9",
        },
      },
      {
        id: "sv1-sub-2",
        respondent: "Thomas Gruber",
        initials: "TG",
        department: "Legal",
        submittedAt: "Jan 30, 2025, 11:42 AM",
        answers: {
          "l1-q1": "4 - Satisfied",
          "l1-q2": "Agree",
          "l1-q3": "The governance examples made the AI risk topics clear.",
          "l1-q4": "8",
        },
      },
    ],
  },
  {
    id: "sv2",
    title: "Cybersecurity — Manager Behavior Survey",
    course: "Cybersecurity Fundamentals",
    type: "Behavior (L3)",
    responses: 124,
    total: 156,
    avgScore: 4.2,
    status: "Active",
    daysPost: 45,
    anonymous: false,
    questionSet: getSurveyQuestionSet("behavior-l3"),
    submissions: [
      {
        id: "sv2-sub-1",
        respondent: "Priya Nair",
        initials: "PN",
        department: "Marketing",
        submittedAt: "Mar 5, 2025, 2:20 PM",
        answers: {
          "l3-q1": "Agree",
          "l3-q2": "The learner now checks campaign data security before launch.",
          "l3-q3": "Manager coaching",
        },
      },
      {
        id: "sv2-sub-2",
        respondent: "Carlos Mendez",
        initials: "CM",
        department: "Product",
        submittedAt: "Mar 6, 2025, 10:05 AM",
        answers: {
          "l3-q1": "Strongly agree",
          "l3-q2": "Security reviews are being added earlier in sprint planning.",
          "l3-q3": "Practice assignment",
        },
      },
    ],
  },
  {
    id: "sv3",
    title: "Leadership — Learning Assessment Survey",
    course: "Data-Driven Leadership",
    type: "Learning (L2)",
    responses: 178,
    total: 178,
    avgScore: 4.8,
    status: "Completed",
    anonymous: true,
    questionSet: getSurveyQuestionSet("learning-l2"),
    submissions: [
      {
        id: "sv3-sub-1",
        respondent: "Aisha Rahman",
        initials: "AR",
        department: "Finance",
        submittedAt: "Feb 12, 2025, 8:30 AM",
        answers: {
          "l2-q1": "Strongly agree",
          "l2-q2": "More examples on selecting the right chart for executives.",
          "l2-q3": "5 - Very confident",
        },
      },
    ],
  },
];

const PROGRAM_TYPES = [
  {
    type: "New Employee",
    programs: 2,
    learners: 42,
    avgCompletion: 65,
    overdue: 8,
    color: P.olive,
    active: true,
  },
  {
    type: "Graduate Trainee",
    programs: 1,
    learners: 28,
    avgCompletion: 18,
    overdue: 3,
    color: "#4A7A5A",
    active: true,
  },
  {
    type: "Leadership",
    programs: 3,
    learners: 45,
    avgCompletion: 38,
    overdue: 5,
    color: P.gold,
    active: true,
  },
  {
    type: "Technical",
    programs: 4,
    learners: 78,
    avgCompletion: 44,
    overdue: 12,
    color: P.darkOlive,
    active: true,
  },
  {
    type: "Compliance",
    programs: 2,
    learners: 1247,
    avgCompletion: 72,
    overdue: 103,
    color: "#C0392B",
    active: true,
  },
  {
    type: "Alumni Track",
    programs: 1,
    learners: 0,
    avgCompletion: 0,
    overdue: 0,
    color: P.sage,
    active: false,
  },
];

// ─────────────────────────────────────────────────────────────
// 1. TRAINING CALENDAR
// ─────────────────────────────────────────────────────────────

export {
  AICard,
  ASSIGNMENTS,
  ASSIGNMENT_COURSES,
  ASSIGNMENT_EXPECTED_SUBMISSIONS,
  ASSIGNMENT_TYPE_LABELS,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Bar,
  BarChart2,
  BookOpen,
  Building,
  CALENDAR_EVENTS,
  Calendar,
  CartesianGrid,
  Cell,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Chip,
  Clock,
  Copy,
  Cpu,
  DEFAULT_QUESTION_TYPE_CONFIG,
  Download,
  EFFECTIVENESS_DATA,
  EFFECTIVENESS_TREND,
  EMPTY_ASSIGNMENT_DRAFT,
  EMPTY_SURVEY_DRAFT,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  LIVE_SESSIONS,
  Layers,
  Line,
  LineChart,
  Link,
  Lock,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAM_TYPES,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  PRESET_QUESTION_TYPES,
  QUESTION_BANK,
  QUESTION_TYPE_OPTIONS,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SURVEYS,
  SURVEY_COURSES,
  SURVEY_QUESTION_SETS,
  SURVEY_TOTALS_BY_COURSE,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Star,
  StatCard,
  Target,
  ThumbsDown,
  ThumbsUp,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  X,
  XAxis,
  YAxis,
  Zap,
  canAddQuestionBankCustomTypes,
  formatAssignmentDueDate,
  getConfiguredQuestionBankTypes,
  getSurveyQuestionSet,
  questionTypeLabel,
  questionTypeVariant,
};

export type {
  Assignment,
  AssignmentDraft,
  AssignmentStatus,
  AssignmentSubmission,
  AssignmentSubmissionType,
  QuestionBankQuestion,
  QuestionBankType,
  QuestionTypeConfig,
  QuestionTypeOption,
  Survey,
  SurveyDraft,
  SurveyQuestion,
  SurveyQuestionSet,
  SurveyQuestionType,
  SurveySubmission,
};
