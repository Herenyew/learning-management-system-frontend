import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  HardDrive,
  Video,
  FileText,
  HelpCircle,
  Cpu,
  Music,
  Activity,
  ClipboardList,
  MessageSquare,
  Users,
  Link2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  Copy,
  Download,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  Bookmark,
  Wand2,
  Globe,
  AlertCircle,
  Play,
  ExternalLink,
  Mic,
  GitBranch,
  Star,
} from "lucide-react";
import {
  FormField,
  Input,
  ModalHeader,
  NavButtons,
  P,
  StepDots,
  Textarea,
  Toggle,
} from "../contentWorkflow.shared";

export type BuiltInQType =
  | "MCQ"
  | "TrueFalse"
  | "ShortAnswer"
  | "MultiSelect"
  | "Matching"
  | "DragDrop"
  | "Ordering"
  | "FillBlank"
  | "Essay";
export type QType = BuiltInQType | (string & {});
export type QuestionTypeConfig = {
  type: QType | "custom";
  label: string;
  desc: string;
  enabled: boolean;
  allowCreator: boolean;
  grading: "Auto" | "Manual" | "Mixed";
};
export type QuestionResponseMode = "rubric" | "shortText" | "longText" | "fileEvidence";
export type QuestionTypeOption = {
  type: QType;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  custom?: boolean;
  responseMode?: QuestionResponseMode;
};
export type AttemptScoringMode = "full-credit" | "reduced-credit" | "best-score" | "latest-score";
export type AttemptScoringPolicy = {
  enabled: boolean;
  mode: AttemptScoringMode;
  firstAttemptPercent: number;
  secondAttemptPercent: number;
  thirdAttemptPercent: number;
  laterAttemptPercent: number;
  allowCreatorOverride: boolean;
  showPolicyToLearners: boolean;
};
export const ATTEMPT_SCORING_POLICY_STORAGE_KEY = "learnos_attempt_scoring_policy";
export const ATTEMPT_SCORING_POLICY_UPDATED_EVENT = "learnos:attempt-scoring-policy-updated";
export const DEFAULT_ATTEMPT_SCORING_POLICY: AttemptScoringPolicy = {
  enabled: true,
  mode: "reduced-credit",
  firstAttemptPercent: 100,
  secondAttemptPercent: 80,
  thirdAttemptPercent: 60,
  laterAttemptPercent: 50,
  allowCreatorOverride: false,
  showPolicyToLearners: true,
};
const ATTEMPT_SCORING_MODES: AttemptScoringMode[] = [
  "full-credit",
  "reduced-credit",
  "best-score",
  "latest-score",
];
const isAttemptScoringMode = (mode: unknown): mode is AttemptScoringMode =>
  ATTEMPT_SCORING_MODES.includes(mode as AttemptScoringMode);
const clampAttemptPercent = (value: unknown, fallback: number) => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Math.max(0, Math.min(100, Number.isFinite(numeric) ? Math.round(numeric) : fallback));
};
export const normalizeAttemptScoringPolicy = (
  policy?: Partial<AttemptScoringPolicy>,
): AttemptScoringPolicy => ({
  enabled:
    typeof policy?.enabled === "boolean" ? policy.enabled : DEFAULT_ATTEMPT_SCORING_POLICY.enabled,
  mode: isAttemptScoringMode(policy?.mode) ? policy.mode : DEFAULT_ATTEMPT_SCORING_POLICY.mode,
  firstAttemptPercent: clampAttemptPercent(
    policy?.firstAttemptPercent,
    DEFAULT_ATTEMPT_SCORING_POLICY.firstAttemptPercent,
  ),
  secondAttemptPercent: clampAttemptPercent(
    policy?.secondAttemptPercent,
    DEFAULT_ATTEMPT_SCORING_POLICY.secondAttemptPercent,
  ),
  thirdAttemptPercent: clampAttemptPercent(
    policy?.thirdAttemptPercent,
    DEFAULT_ATTEMPT_SCORING_POLICY.thirdAttemptPercent,
  ),
  laterAttemptPercent: clampAttemptPercent(
    policy?.laterAttemptPercent,
    DEFAULT_ATTEMPT_SCORING_POLICY.laterAttemptPercent,
  ),
  allowCreatorOverride:
    typeof policy?.allowCreatorOverride === "boolean"
      ? policy.allowCreatorOverride
      : DEFAULT_ATTEMPT_SCORING_POLICY.allowCreatorOverride,
  showPolicyToLearners:
    typeof policy?.showPolicyToLearners === "boolean"
      ? policy.showPolicyToLearners
      : DEFAULT_ATTEMPT_SCORING_POLICY.showPolicyToLearners,
});
export const loadAttemptScoringPolicy = (): AttemptScoringPolicy => {
  if (typeof window === "undefined") return DEFAULT_ATTEMPT_SCORING_POLICY;

  try {
    const stored = window.localStorage.getItem(ATTEMPT_SCORING_POLICY_STORAGE_KEY);
    if (!stored) return DEFAULT_ATTEMPT_SCORING_POLICY;
    return normalizeAttemptScoringPolicy(JSON.parse(stored) as Partial<AttemptScoringPolicy>);
  } catch {
    return DEFAULT_ATTEMPT_SCORING_POLICY;
  }
};
export const saveAttemptScoringPolicy = (policy: AttemptScoringPolicy) => {
  if (typeof window === "undefined") return;

  const normalized = normalizeAttemptScoringPolicy(policy);
  window.localStorage.setItem(ATTEMPT_SCORING_POLICY_STORAGE_KEY, JSON.stringify(normalized));
  window.dispatchEvent(
    new CustomEvent(ATTEMPT_SCORING_POLICY_UPDATED_EVENT, { detail: normalized }),
  );
};
export const describeAttemptScoringPolicy = (policy: AttemptScoringPolicy) => {
  if (!policy.enabled) return "Attempt-based scoring is disabled by HR.";
  if (policy.mode === "full-credit") return "Every allowed attempt can earn full quiz credit.";
  if (policy.mode === "best-score") return "The best score across allowed attempts counts.";
  if (policy.mode === "latest-score") return "Only the latest submitted attempt counts.";

  return `Attempt 1 earns ${policy.firstAttemptPercent}% credit, attempt 2 earns ${policy.secondAttemptPercent}%, attempt 3 earns ${policy.thirdAttemptPercent}%, and later attempts earn ${policy.laterAttemptPercent}%.`;
};
export interface QuizQuestion {
  id: string;
  type: QType;
  text: string;
  options: string[];
  correct: number | number[] | string; // index(es) or string
  pairs?: { left: string; right: string }[];
  weight: number;
  difficulty: "Easy" | "Medium" | "Hard";
  explanation: string;
}
export interface QuizSettings {
  name: string;
  desc: string;
  passThreshold: number;
  maxAttempts: number;
  retryRule: "immediate" | "cooldown" | "unlimited";
  timeLimitMin: number;
  timeEnabled: boolean;
  randomize: boolean;
  showAnswers: boolean;
  attemptScoring: boolean;
  negativeMarking: boolean;
  partialScoring: boolean;
}
export interface SavedQuiz {
  name: string;
  questionCount: number;
  passScore: number;
  questions: QuizQuestion[];
  settings: QuizSettings;
}

// ── Data ──────────────────────────────────────────────────────
export const QUIZ_TEMPLATES = [
  {
    id: "t1",
    name: "Compliance Assessment",
    category: "Compliance",
    questions: 15,
    pass: 80,
    attempts: 3,
    timeMin: 25,
    randomized: true,
    desc: "Standard GDPR & regulatory compliance check for all employees",
  },
  {
    id: "t2",
    name: "Technical Certification",
    category: "Technology",
    questions: 30,
    pass: 85,
    attempts: 2,
    timeMin: 60,
    randomized: true,
    desc: "Deep technical assessment for engineering & IT roles",
  },
  {
    id: "t3",
    name: "Knowledge Check",
    category: "General",
    questions: 10,
    pass: 70,
    attempts: 5,
    timeMin: 15,
    randomized: false,
    desc: "Lightweight end-of-module comprehension check",
  },
  {
    id: "t4",
    name: "Leadership Evaluation",
    category: "Leadership",
    questions: 20,
    pass: 75,
    attempts: 3,
    timeMin: 40,
    randomized: true,
    desc: "Situational judgement and leadership competency evaluation",
  },
];
export const EXISTING_QUIZZES = [
  {
    id: "q1",
    name: "Cybersecurity Assessment",
    module: "Cybersecurity Fundamentals",
    questions: 18,
    pass: 80,
    attempts: 3,
    timeMin: 30,
    lastUsed: "2 weeks ago",
  },
  {
    id: "q2",
    name: "AI Fundamentals Quiz",
    module: "AI & ML for Business Leaders",
    questions: 12,
    pass: 70,
    attempts: 5,
    timeMin: 20,
    lastUsed: "1 week ago",
  },
  {
    id: "q3",
    name: "Leadership Knowledge Check",
    module: "Data-Driven Leadership",
    questions: 8,
    pass: 75,
    attempts: 3,
    timeMin: 15,
    lastUsed: "3 days ago",
  },
  {
    id: "q4",
    name: "Data Literacy Assessment",
    module: "Data Science Essentials",
    questions: 25,
    pass: 85,
    attempts: 2,
    timeMin: 45,
    lastUsed: "Yesterday",
  },
];
export const BANK_QUESTIONS: (QuizQuestion & { category: string })[] = [
  {
    id: "bq1",
    type: "MCQ",
    text: "What best describes supervised machine learning?",
    options: [
      "Learns from labeled data",
      "Explores unlabeled data",
      "Uses rewards/penalties",
      "Copies human decisions",
    ],
    correct: 0,
    weight: 1,
    difficulty: "Medium",
    explanation: "Supervised ML trains on labeled input-output pairs.",
    category: "AI & ML",
    pairs: [],
  },
  {
    id: "bq2",
    type: "MCQ",
    text: "Purpose of a training-validation split?",
    options: ["Speed up processing", "Prevent overfitting", "Increase features", "Balance classes"],
    correct: 1,
    weight: 1,
    difficulty: "Hard",
    explanation: "Validation sets detect overfitting before testing.",
    category: "AI & ML",
    pairs: [],
  },
  {
    id: "bq3",
    type: "TrueFalse",
    text: "Neural networks always require more data than traditional ML algorithms.",
    options: ["True", "False"],
    correct: 1,
    weight: 1,
    difficulty: "Medium",
    explanation: "This is false — small networks can work with less data.",
    category: "AI & ML",
    pairs: [],
  },
  {
    id: "bq4",
    type: "MCQ",
    text: "GDPR applies to organizations outside the EU if they process EU resident data.",
    options: [
      "True — if targeting EU residents",
      "False — only EU companies",
      "Only for companies over 250 employees",
      "Only for sensitive data",
    ],
    correct: 0,
    weight: 1,
    difficulty: "Medium",
    explanation: "GDPR has extra-territorial scope.",
    category: "Compliance",
    pairs: [],
  },
  {
    id: "bq5",
    type: "ShortAnswer",
    text: "Define the bias-variance tradeoff in machine learning.",
    options: [],
    correct: "",
    weight: 2,
    difficulty: "Hard",
    explanation: "Bias is underfitting; variance is overfitting. Trade-off balances both.",
    category: "AI & ML",
    pairs: [],
  },
  {
    id: "bq6",
    type: "MultiSelect",
    text: "Which of these are valid Python data types?",
    options: ["list", "dict", "vector", "tuple", "array"],
    correct: [0, 1, 3],
    weight: 1,
    difficulty: "Easy",
    explanation: "list, dict and tuple are built-in Python types.",
    category: "Technology",
    pairs: [],
  },
];
const CUSTOM_QUIZ_QUESTION_TYPES_KEY = "learnos.customQuizQuestionTypes";

export const Q_TYPE_OPTIONS: QuestionTypeOption[] = [
  {
    type: "MCQ",
    label: "Multiple Choice",
    desc: "One correct answer from options",
    icon: CheckCircle,
    color: P.olive,
  },
  {
    type: "TrueFalse",
    label: "True / False",
    desc: "Binary correct-or-incorrect statement",
    icon: ToggleLeft,
    color: "#059669",
  },
  {
    type: "ShortAnswer",
    label: "Short Answer",
    desc: "Free-text response with keywords",
    icon: Edit,
    color: "#2563EB",
  },
  {
    type: "MultiSelect",
    label: "Multi-Select",
    desc: "Multiple correct answers allowed",
    icon: CheckCircle,
    color: "#7C3AED",
  },
  {
    type: "Matching",
    label: "Matching",
    desc: "Connect items in two columns",
    icon: GitBranch,
    color: "#0F766E",
  },
  {
    type: "DragDrop",
    label: "Drag & Drop",
    desc: "Place items in correct zones",
    icon: Activity,
    color: "#C8A85D",
  },
  {
    type: "Ordering",
    label: "Ordering",
    desc: "Arrange items in the correct sequence",
    icon: ChevronRight,
    color: "#C0392B",
  },
  {
    type: "FillBlank",
    label: "Fill in the Blank",
    desc: "Complete sentences with missing words",
    icon: Edit,
    color: "#D97706",
  },
  {
    type: "Essay",
    label: "Essay",
    desc: "Long-form written response with rubric",
    icon: FileText,
    color: "#6B7280",
  },
];

export const DEFAULT_QUESTION_TYPE_CONFIG: QuestionTypeConfig[] = [
  ...Q_TYPE_OPTIONS.map(
    (option): QuestionTypeConfig => ({
      type: option.type as BuiltInQType,
      label: option.label,
      desc: option.desc,
      enabled: true,
      allowCreator: true,
      grading: option.type === "ShortAnswer" || option.type === "Essay" ? "Manual" : "Auto",
    }),
  ),
  {
    type: "custom",
    label: "Creator-defined custom types",
    desc: "Reusable custom question types for scenario, file-based, or rubric questions",
    enabled: true,
    allowCreator: true,
    grading: "Manual",
  },
];

export const CUSTOM_QUESTION_TYPE_COLORS = ["#4A7A5A", "#2563EB", "#7C3AED", "#D97706", "#6B7280"];

type StoredQuestionTypeOption = Omit<QuestionTypeOption, "icon">;

export const isBuiltInQuestionType = (type: QType): type is BuiltInQType =>
  Q_TYPE_OPTIONS.some((option) => option.type === type);

export const makeCustomQuestionTypeId = (label: string) =>
  `custom-${label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;

const hydrateCustomQuestionType = (option: StoredQuestionTypeOption): QuestionTypeOption => ({
  ...option,
  custom: true,
  icon: HelpCircle,
});

export const loadQuestionTypeOptions = (): QuestionTypeOption[] => {
  if (typeof window === "undefined") return Q_TYPE_OPTIONS;

  try {
    const stored = window.localStorage.getItem(CUSTOM_QUIZ_QUESTION_TYPES_KEY);
    if (!stored) return Q_TYPE_OPTIONS;

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return Q_TYPE_OPTIONS;

    const customOptions = (parsed as StoredQuestionTypeOption[])
      .filter((option) => option?.type && option?.label)
      .map(hydrateCustomQuestionType);

    return [...Q_TYPE_OPTIONS, ...customOptions];
  } catch {
    return Q_TYPE_OPTIONS;
  }
};

export const saveCustomQuestionTypes = (options: QuestionTypeOption[]) => {
  if (typeof window === "undefined") return;

  try {
    const serializable = options
      .filter((option) => option.custom)
      .map(({ icon: _icon, ...option }) => option);
    window.localStorage.setItem(CUSTOM_QUIZ_QUESTION_TYPES_KEY, JSON.stringify(serializable));
  } catch {
    // Ignore storage failures in restricted browser contexts.
  }
};

export const getQuestionTypeMeta = (
  options: QuestionTypeOption[],
  type: QType,
): QuestionTypeOption =>
  options.find((option) => option.type === type) ?? {
    type,
    label: String(type)
      .replace(/^custom-/, "")
      .replace(/-/g, " "),
    desc: "Custom question type with reviewer rubric",
    icon: HelpCircle,
    color: P.olive,
    custom: true,
    responseMode: "rubric",
  };

export const getCreatorQuestionTypes = (
  questionTypes: QuestionTypeOption[],
  questionTypeConfig?: QuestionTypeConfig[],
) => {
  if (!questionTypeConfig) return questionTypes;

  const allowedBuiltInTypes = new Set(
    questionTypeConfig
      .filter(
        (config) =>
          config.type !== "custom" &&
          isBuiltInQuestionType(config.type as QType) &&
          config.enabled &&
          config.allowCreator,
      )
      .map((config) => config.type as BuiltInQType),
  );
  const allowCustomTypes = questionTypeConfig.some(
    (config) => config.type === "custom" && config.enabled && config.allowCreator,
  );
  const configuredCustomOptions: QuestionTypeOption[] = questionTypeConfig
    .filter(
      (config) =>
        config.type !== "custom" &&
        !isBuiltInQuestionType(config.type as QType) &&
        config.enabled &&
        config.allowCreator,
    )
    .map((config, index) => ({
      type: config.type as QType,
      label: config.label,
      desc: config.desc,
      icon: HelpCircle,
      color: CUSTOM_QUESTION_TYPE_COLORS[index % CUSTOM_QUESTION_TYPE_COLORS.length],
      custom: true,
      responseMode: config.grading === "Auto" ? "shortText" : "rubric",
    }));

  const allowedOptions = questionTypes.filter((option) => {
    if (option.custom) {
      const explicitConfig = questionTypeConfig.find((config) => config.type === option.type);
      return explicitConfig
        ? explicitConfig.enabled && explicitConfig.allowCreator
        : allowCustomTypes;
    }

    return allowedBuiltInTypes.has(option.type as BuiltInQType);
  });

  return [
    ...allowedOptions,
    ...configuredCustomOptions.filter(
      (configured) => !allowedOptions.some((option) => option.type === configured.type),
    ),
  ];
};

export const canCreatorAddCustomQuestionTypes = (questionTypeConfig?: QuestionTypeConfig[]) =>
  !questionTypeConfig ||
  questionTypeConfig.some(
    (config) => config.type === "custom" && config.enabled && config.allowCreator,
  );

export const defaultSettings: QuizSettings = {
  name: "",
  desc: "",
  passThreshold: 70,
  maxAttempts: 3,
  retryRule: "immediate",
  timeLimitMin: 30,
  timeEnabled: true,
  randomize: true,
  showAnswers: true,
  attemptScoring: false,
  negativeMarking: false,
  partialScoring: false,
};

// ── Question Type Selector Modal ──────────────────────────────
