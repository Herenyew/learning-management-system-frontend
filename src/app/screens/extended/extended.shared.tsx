// Extensions.tsx — Extended LMS Modules
// Preserves olive/sage/gold enterprise design language

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Award,
  Medal,
  BarChart2,
  Target,
  FileText,
  Shield,
  Eye,
  Zap,
  Trophy,
  Plus,
  Download,
  Search,
  CheckCircle,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Upload,
  Settings,
  Edit,
  Trash2,
  AlertCircle,
  Clock,
  Star,
  Play,
  HelpCircle,
  Globe,
  Lock,
  Layers,
  RefreshCw,
  Sparkles,
  Calendar,
  Filter,
  MoreHorizontal,
  Wand2,
  Video,
  TrendingUp,
  TrendingDown,
  User,
  MessageSquare,
  Flag,
  Archive,
  Copy,
  Link,
  Check,
  Cpu,
  Building,
  UserCheck,
  FilePlus,
  Signature,
  Stamp,
  ChevronLeft,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Send,
  Bot,
} from "lucide-react";
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { ConfigPublishing } from "../../Extensions3";

// ─── Palette (mirrors App.tsx) ────────────────────────────────
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
  card: "#FFFFFF",
  text: "#052E26",
  textMid: "#047857",
  textMuted: "#4B7468",
  border: "#A7F3D0",
};

// ─── Screen type (extended) ───────────────────────────────────
export type ExtScreen =
  | "tna-form"
  | "tna-agg"
  | "hr-programs"
  | "hr-leaderboard-mgmt"
  | "hr-xp"
  | "hr-publishing"
  | "hr-moderation"
  | "manager"
  | "cert-admin"
  | "scorm"
  | "creator-config";

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

function Badge({
  label,
  variant = "sage",
}: {
  label: string;
  variant?: "sage" | "gold" | "red" | "green" | "neutral" | "blue";
}) {
  const styles: Record<string, React.CSSProperties> = {
    sage: { background: P.lightSage, color: P.darkOlive, borderColor: "#C4D4A8" },
    gold: { background: P.goldLight, color: "#8A6A1A", borderColor: "#E8D090" },
    red: { background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA" },
    green: { background: "#D8EDCC", color: "#3A6420", borderColor: "#B4D4A0" },
    neutral: { background: P.paleGreen, color: P.textMuted, borderColor: P.border },
    blue: { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
  };
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={styles[variant] ?? styles.neutral}
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
        className="h-full rounded-full transition-all duration-500"
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
  trend?: "up" | "down" | "neutral";
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

function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 bg-white"
        style={{ border: `1px solid ${P.border}`, color: P.text, caretColor: P.olive }}
      />
    </div>
  );
}

function Select({
  label,
  options,
  required,
}: {
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
        style={{ border: `1px solid ${P.border}`, color: P.text }}
      >
        <option value="">Select {label}…</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function EditableSelect({
  label,
  options,
  value,
  onChange,
  onAdd,
  actionSlot,
  required,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onAdd: (value: string) => void;
  actionSlot?: React.ReactNode;
  required?: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [customValue, setCustomValue] = useState("");

  const saveCustomValue = () => {
    const cleaned = customValue.trim();
    if (!cleaned) return;
    const existing = options.find((option) => option.toLowerCase() === cleaned.toLowerCase());

    if (!existing) onAdd(cleaned);
    onChange(existing ?? cleaned);
    setCustomValue("");
    setIsAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-semibold" style={{ color: P.textMid }}>
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        <div className="flex items-center gap-2">
          {actionSlot}
          <button
            type="button"
            onClick={() => setIsAdding((adding) => !adding)}
            className="text-[10px] font-semibold flex items-center gap-1"
            style={{ color: isAdding ? "#C0392B" : P.olive }}
          >
            {isAdding ? <X size={11} /> : <Plus size={11} />}
            {isAdding ? "Cancel" : "Add New"}
          </button>
        </div>
      </div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
        style={{ border: `1px solid ${P.border}`, color: P.text }}
      >
        <option value="">Select {label}...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {isAdding && (
        <div className="flex gap-2 mt-2">
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                saveCustomValue();
              }
            }}
            placeholder={`Add ${label.toLowerCase()}...`}
            className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
          <button
            type="button"
            onClick={saveCustomValue}
            disabled={!customValue.trim()}
            className="px-3 py-2 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5"
            style={{
              background: customValue.trim() ? P.olive : P.sage,
              opacity: customValue.trim() ? 1 : 0.65,
            }}
          >
            <Check size={12} /> Save
          </button>
        </div>
      )}
    </div>
  );
}

function Textarea({
  label,
  placeholder,
  rows = 3,
  required,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        rows={rows}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none resize-none bg-white"
        style={{ border: `1px solid ${P.border}`, color: P.text }}
      />
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

const TNA_REQUESTS = [
  {
    id: "t1",
    employee: "Marcus Johnson",
    dept: "Engineering",
    unit: "Platform",
    role: "Senior Engineer",
    type: "Paid",
    competency: "AI & Automation",
    status: "Pending CEO",
    budget: 8500,
    costCenter: "CC-ENG-001",
    submitted: "Jan 15, 2025",
    urgent: true,
  },
  {
    id: "t2",
    employee: "Priya Nair",
    dept: "Marketing",
    unit: "Digital",
    role: "Marketing Manager",
    type: "Free",
    competency: "Data Literacy",
    status: "HR Approved",
    budget: 0,
    costCenter: "",
    submitted: "Jan 12, 2025",
    urgent: false,
  },
  {
    id: "t3",
    employee: "Carlos Mendez",
    dept: "Product",
    unit: "Core Product",
    role: "Product Manager",
    type: "Paid",
    competency: "Leadership",
    status: "Manager Approved",
    budget: 5200,
    costCenter: "CC-PROD-003",
    submitted: "Jan 10, 2025",
    urgent: false,
  },
  {
    id: "t4",
    employee: "Aisha Rahman",
    dept: "Finance",
    unit: "FP&A",
    role: "Analyst",
    type: "Free",
    competency: "Financial Modeling",
    status: "Pending HR",
    budget: 0,
    costCenter: "",
    submitted: "Jan 8, 2025",
    urgent: false,
  },
  {
    id: "t5",
    employee: "Ben Ostrowski",
    dept: "HR",
    unit: "L&D",
    role: "HR Specialist",
    type: "Paid",
    competency: "Change Management",
    status: "CEO Approved",
    budget: 3800,
    costCenter: "CC-HR-002",
    submitted: "Jan 5, 2025",
    urgent: false,
  },
];

const TEAM_MEMBERS = [
  {
    name: "Marcus Johnson",
    role: "Senior Engineer",
    department: "Engineering",
    group: "Engineering Team",
    av: "MJ",
    xp: 13640,
    courses: 25,
    completed: 22,
    inProgress: 3,
    certCount: 4,
    activeCerts: 3,
    expiredCerts: 1,
    lastActive: "2h ago",
    progress: 88,
    color: P.olive,
  },
  {
    name: "Priya Nair",
    role: "Marketing Manager",
    department: "Marketing",
    group: "SMG",
    av: "PN",
    xp: 9210,
    courses: 17,
    completed: 14,
    inProgress: 3,
    certCount: 2,
    activeCerts: 2,
    expiredCerts: 0,
    lastActive: "1 day ago",
    progress: 72,
    color: P.gold,
  },
  {
    name: "Carlos Mendez",
    role: "Product Manager",
    department: "Product",
    group: "SMG",
    av: "CM",
    xp: 13640,
    courses: 25,
    completed: 24,
    inProgress: 1,
    certCount: 5,
    activeCerts: 4,
    expiredCerts: 1,
    lastActive: "30 min ago",
    progress: 96,
    color: "#4A7A5A",
  },
  {
    name: "Luca Ferrari",
    role: "Sales Executive",
    department: "Sales",
    group: "Sales Team",
    av: "LF",
    xp: 8670,
    courses: 16,
    completed: 12,
    inProgress: 4,
    certCount: 2,
    activeCerts: 2,
    expiredCerts: 0,
    lastActive: "3 days ago",
    progress: 58,
    color: "#C0392B",
  },
  {
    name: "Mei Lin",
    role: "Operations Lead",
    department: "Operations",
    group: "SMG",
    av: "ML",
    xp: 8120,
    courses: 15,
    completed: 13,
    inProgress: 2,
    certCount: 3,
    activeCerts: 2,
    expiredCerts: 1,
    lastActive: "5 hours ago",
    progress: 82,
    color: P.darkOlive,
  },
];

const PUBLISHING_QUEUE = [
  {
    id: "q1",
    title: "Advanced Python for Data Scientists",
    creator: "Dr. Sarah Chen",
    dept: "Technology",
    level: "Advanced",
    submittedDate: "Jan 16, 2025",
    duration: "12h",
    lessons: 58,
    status: "In Review",
    risk: "Low",
  },
  {
    id: "q2",
    title: "Workplace Ethics & Code of Conduct 2025",
    creator: "Emma Williams",
    dept: "Compliance",
    level: "Beginner",
    submittedDate: "Jan 14, 2025",
    duration: "3h",
    lessons: 15,
    status: "In Review",
    risk: "Medium",
  },
  {
    id: "q3",
    title: "Financial Derivatives & Risk Hedging",
    creator: "Sofia Andersen",
    dept: "Finance",
    level: "Advanced",
    submittedDate: "Jan 11, 2025",
    duration: "18h",
    lessons: 72,
    status: "In Review",
    risk: "Low",
  },
  {
    id: "q4",
    title: "Intro to Agile Project Management",
    creator: "Ravi Patel",
    dept: "Management",
    level: "Beginner",
    submittedDate: "Jan 9, 2025",
    duration: "5h",
    lessons: 24,
    status: "Approved",
    risk: "Low",
  },
];

const MODERATION_ITEMS = [
  {
    id: "m1",
    type: "comment",
    author: "Anonymous User",
    content:
      "This course is terrible and a waste of time. The instructor clearly doesn't know anything.",
    course: "AI & ML for Business Leaders",
    date: "2h ago",
    reported: true,
  },
  {
    id: "m2",
    type: "review",
    author: "John D.",
    content: "I disagree with everything in module 3. This is wrong information.",
    course: "Cybersecurity Fundamentals",
    rating: 1,
    date: "1 day ago",
    reported: false,
  },
  {
    id: "m3",
    type: "comment",
    author: "User_4521",
    content: "Can anyone share the quiz answers for the compliance assessment?",
    course: "ESG & Sustainability",
    date: "3 days ago",
    reported: true,
  },
  {
    id: "m4",
    type: "rating",
    author: "NewEmployee99",
    content: "1-star rating with no review text",
    course: "Effective Communication",
    rating: 1,
    date: "4 days ago",
    reported: false,
  },
];

const CERT_TEMPLATES = [
  {
    id: "ct1",
    name: "Standard Completion Certificate",
    signers: ["Dr. Sarah Chen (Instructor)", "Alex HR Director"],
    hasStamp: true,
    active: 8,
    archived: 12,
    color: P.olive,
  },
  {
    id: "ct2",
    name: "Executive Leadership Credential",
    signers: ["CEO", "CHRO"],
    hasStamp: true,
    active: 3,
    archived: 5,
    color: P.gold,
  },
  {
    id: "ct3",
    name: "Compliance Attestation Certificate",
    signers: ["Chief Compliance Officer"],
    hasStamp: true,
    active: 14,
    archived: 28,
    color: "#C0392B",
  },
  {
    id: "ct4",
    name: "Technical Proficiency Badge",
    signers: ["CTO"],
    hasStamp: false,
    active: 6,
    archived: 9,
    color: "#4A7A5A",
  },
];

const SCORM_PACKAGES = [
  {
    id: "s1",
    name: "GDPR Compliance Training 2025",
    version: "SCORM 2004",
    size: "45 MB",
    uploaded: "Jan 10, 2025",
    completions: 847,
    totalLearners: 1247,
    avgScore: 84,
    status: "Active",
    launchUrl: "/scorm/gdpr-2025/index.html",
  },
  {
    id: "s2",
    name: "Safety & Workplace Hazards",
    version: "SCORM 1.2",
    size: "28 MB",
    uploaded: "Dec 15, 2024",
    completions: 423,
    totalLearners: 1247,
    avgScore: 91,
    status: "Active",
    launchUrl: "/scorm/safety-2024/index.html",
  },
  {
    id: "s3",
    name: "Anti-Money Laundering Fundamentals",
    version: "xAPI (Tin Can)",
    size: "62 MB",
    uploaded: "Nov 20, 2024",
    completions: 312,
    totalLearners: 896,
    avgScore: 78,
    status: "Active",
    launchUrl: "/scorm/aml-2024/index.html",
  },
  {
    id: "s4",
    name: "Data Privacy Certification Pack",
    version: "SCORM 2004",
    size: "88 MB",
    uploaded: "Oct 5, 2024",
    completions: 1104,
    totalLearners: 1247,
    avgScore: 87,
    status: "Archived",
    launchUrl: "/scorm/privacy-2024/index.html",
  },
];

const PROGRAMS_DATA = [
  {
    id: "pg1",
    type: "New Employee",
    name: "ADIU Onboarding Program",
    employees: 42,
    completed: 12,
    inProgress: 30,
    duration: "6 weeks",
    tasks: 18,
    progress: 65,
    color: P.olive,
  },
  {
    id: "pg2",
    type: "Leadership",
    name: "Future Leaders Initiative",
    employees: 15,
    completed: 3,
    inProgress: 12,
    duration: "12 weeks",
    tasks: 28,
    progress: 38,
    color: P.gold,
  },
  {
    id: "pg3",
    type: "Compliance",
    name: "2025 Regulatory Compliance Pack",
    employees: 1247,
    completed: 892,
    inProgress: 355,
    duration: "4 weeks",
    tasks: 12,
    progress: 72,
    color: "#C0392B",
  },
  {
    id: "pg4",
    type: "Technical",
    name: "Engineering Excellence Track",
    employees: 78,
    completed: 24,
    inProgress: 54,
    duration: "16 weeks",
    tasks: 45,
    progress: 44,
    color: P.darkOlive,
  },
  {
    id: "pg5",
    type: "Graduate Trainee",
    name: "Graduate Talent Program",
    employees: 28,
    completed: 0,
    inProgress: 28,
    duration: "24 weeks",
    tasks: 62,
    progress: 18,
    color: "#4A7A5A",
  },
];

type HRProgram = (typeof PROGRAMS_DATA)[number] & {
  owner?: string;
  audience?: string;
  targetDepartment?: string;
  targetRole?: string;
  visibility?: "Public" | "Private";
  description?: string;
  certificationTemplate?: string;
  xpMultiplier?: string;
  approvalWorkflow?: string;
  courseList?: string[];
  milestones?: string[];
  assessmentRules?: string[];
  cohorts?: ProgramCohort[];
};

type ProgramTemplate = {
  id: string;
  name: string;
  type: string;
  duration: string;
  certificationTemplate: string;
  xpMultiplier: string;
  approvalWorkflow: string;
  courseList: string[];
  taskSequence: string[];
  milestones: string[];
  assessmentRules: string[];
};

type ProgramTypeOption = {
  id: string;
  name: string;
  status: "active" | "retired";
  retiredAt?: string;
};

type ProgramCohort = {
  id: string;
  name: string;
  startDate: string;
  employeeNames?: string[];
};

type ProgramTaskType = "Video" | "Reading" | "Quiz";
type ProgramTaskSource = "device" | "gdrive";

type ProgramTask = {
  id: string;
  programName: string;
  type: ProgramTaskType;
  title: string;
  detail: string;
  source: ProgramTaskSource;
  timelineWeek: number;
  startDate: string;
  dueDate: string;
  milestone: string;
  unlockRule: string;
  fileName?: string;
  driveUrl?: string;
  description?: string;
};

const PROGRAM_TASKS_INITIAL: ProgramTask[] = [
  {
    id: "ptask-1",
    programName: "Future Leaders Initiative",
    type: "Video",
    title: "Introduction to Engineering Excellence",
    detail: "24 min",
    source: "device",
    timelineWeek: 1,
    startDate: "2026-07-06",
    dueDate: "2026-07-10",
    milestone: "Program Kickoff",
    unlockRule: "Available at program start",
    fileName: "engineering-excellence-intro.mp4",
  },
  {
    id: "ptask-2",
    programName: "Future Leaders Initiative",
    type: "Reading",
    title: "Engineering Standards Documentation",
    detail: "18 pages",
    source: "gdrive",
    timelineWeek: 1,
    startDate: "2026-07-08",
    dueDate: "2026-07-14",
    milestone: "Foundation Review",
    unlockRule: "Unlock after kickoff video",
    driveUrl: "https://drive.google.com/file/d/engineering-standards",
  },
  {
    id: "ptask-3",
    programName: "Future Leaders Initiative",
    type: "Quiz",
    title: "Module 1 Knowledge Check",
    detail: "15 questions",
    source: "device",
    timelineWeek: 2,
    startDate: "2026-07-15",
    dueDate: "2026-07-18",
    milestone: "Module 1 Checkpoint",
    unlockRule: "Unlock after required readings",
    fileName: "module-1-knowledge-check.xlsx",
  },
  {
    id: "ptask-4",
    programName: "Future Leaders Initiative",
    type: "Video",
    title: "Advanced Architecture Patterns",
    detail: "38 min",
    source: "gdrive",
    timelineWeek: 3,
    startDate: "2026-07-22",
    dueDate: "2026-07-28",
    milestone: "Applied Practice",
    unlockRule: "Unlock after Module 1 quiz pass",
    driveUrl: "https://drive.google.com/file/d/architecture-patterns-video",
  },
];

const PROGRAM_TYPE_DEFAULTS: Record<
  string,
  {
    duration: string;
    certificationTemplate: string;
    xpMultiplier: string;
    approvalWorkflow: string;
    visibility: "Public" | "Private";
    owner: string;
  }
> = {
  "New Employee": {
    duration: "6 weeks",
    certificationTemplate: "Standard Completion Certificate",
    xpMultiplier: "1.0x",
    approvalWorkflow: "Auto-enroll after HR assignment",
    visibility: "Private",
    owner: "HR Onboarding",
  },
  "Graduate Trainee": {
    duration: "24 weeks",
    certificationTemplate: "Graduate Talent Certificate",
    xpMultiplier: "1.3x",
    approvalWorkflow: "HR review + department manager approval",
    visibility: "Private",
    owner: "Talent Development",
  },
  Leadership: {
    duration: "12 weeks",
    certificationTemplate: "Executive Leadership Credential",
    xpMultiplier: "1.5x",
    approvalWorkflow: "Manager nomination + HR approval",
    visibility: "Private",
    owner: "Leadership Academy",
  },
  Technical: {
    duration: "16 weeks",
    certificationTemplate: "Engineering Excellence Certificate",
    xpMultiplier: "1.2x",
    approvalWorkflow: "Manager approval for enrollment",
    visibility: "Public",
    owner: "Engineering Enablement",
  },
  Compliance: {
    duration: "4 weeks",
    certificationTemplate: "Compliance Attestation",
    xpMultiplier: "1.0x",
    approvalWorkflow: "Auto-enroll + compliance completion sign-off",
    visibility: "Private",
    owner: "Legal & Compliance",
  },
};

const PROGRAM_TEMPLATE_LIBRARY: ProgramTemplate[] = [
  {
    id: "tpl-leadership",
    name: "Leadership Cohort Blueprint",
    type: "Leadership",
    duration: "12 weeks",
    certificationTemplate: "Executive Leadership Credential",
    xpMultiplier: "1.5x",
    approvalWorkflow: "Manager nomination + HR approval",
    courseList: ["Strategic Thinking", "People Leadership", "Change Management"],
    taskSequence: ["Kickoff survey", "Mentor assignment", "Weekly reflection", "Capstone pitch"],
    milestones: ["Nomination approved", "Midpoint review", "Capstone passed"],
    assessmentRules: ["Minimum 80% course completion", "Capstone score at least 75%"],
  },
  {
    id: "tpl-compliance",
    name: "Annual Compliance Pack",
    type: "Compliance",
    duration: "4 weeks",
    certificationTemplate: "Compliance Attestation",
    xpMultiplier: "1.0x",
    approvalWorkflow: "Auto-enroll + compliance completion sign-off",
    courseList: ["Code of Conduct", "Data Privacy", "Security Awareness"],
    taskSequence: ["Policy acknowledgement", "Scenario quiz", "Final attestation"],
    milestones: ["Policy signed", "Quiz passed", "Certificate issued"],
    assessmentRules: ["100% required modules", "Final quiz score at least 90%"],
  },
];

const TNA_DEPT_DATA = [
  { dept: "Engineering", requests: 28, paid: 18, free: 10 },
  { dept: "Sales", requests: 22, paid: 8, free: 14 },
  { dept: "HR", requests: 12, paid: 5, free: 7 },
  { dept: "Finance", requests: 15, paid: 12, free: 3 },
  { dept: "Marketing", requests: 19, paid: 7, free: 12 },
  { dept: "Legal", requests: 8, paid: 6, free: 2 },
];

const TNA_TREND = [
  { month: "Sep", requests: 18 },
  { month: "Oct", requests: 24 },
  { month: "Nov", requests: 31 },
  { month: "Dec", requests: 28 },
  { month: "Jan", requests: 45 },
];

// ─────────────────────────────────────────────────────────────
// 1. TNA REQUEST SUBMISSION FORM
// ─────────────────────────────────────────────────────────────

export {
  AICard,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Badge,
  Bar,
  BarChart2,
  BookOpen,
  Bot,
  Building,
  CERT_TEMPLATES,
  Calendar,
  CartesianGrid,
  Cell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ConfigPublishing,
  Copy,
  Cpu,
  Download,
  Edit,
  EditableSelect,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Input,
  Layers,
  Link,
  Lock,
  MODERATION_ITEMS,
  Medal,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAMS_DATA,
  PROGRAM_TASKS_INITIAL,
  PROGRAM_TEMPLATE_LIBRARY,
  PROGRAM_TYPE_DEFAULTS,
  PUBLISHING_QUEUE,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SCORM_PACKAGES,
  Search,
  Select,
  Send,
  Settings,
  Shield,
  Signature,
  Sparkles,
  Stamp,
  Star,
  StatCard,
  TEAM_MEMBERS,
  TNA_DEPT_DATA,
  TNA_REQUESTS,
  TNA_TREND,
  Target,
  Textarea,
  ToggleLeft,
  ToggleRight,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wand2,
  X,
  XAxis,
  YAxis,
  Zap,
};

export type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
};
