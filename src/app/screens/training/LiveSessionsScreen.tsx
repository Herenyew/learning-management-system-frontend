import React, { useState } from "react";
import {
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
} from "./training.shared";
import type {
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
} from "./training.shared";

export function LiveSessionsScreen({ navigate }: { navigate: (s: string) => void }) {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("All");
  const [sessionFormat, setSessionFormat] = useState<"Virtual" | "In-Person" | "Hybrid">("Virtual");

  const filtered = LIVE_SESSIONS.filter((s) => filter === "All" || s.status === filter);

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Live & ILT Sessions"
        sub="Schedule and manage instructor-led training and virtual sessions"
        actions={
          <button
            onClick={() => {
              setSessionFormat("Virtual");
              setShowCreate(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> Schedule Session
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Upcoming Sessions"
          value="3"
          icon={Calendar}
          color={P.olive}
          bg={P.lightSage}
        />
        <StatCard
          label="Total Enrolled"
          value="79"
          sub="Of 100 capacity"
          icon={Users}
          color="#5A7A2A"
          bg="#D8EDCC"
        />
        <StatCard
          label="On Waitlist"
          value="11"
          sub="Across 2 sessions"
          icon={Clock}
          color={P.gold}
          bg={P.goldLight}
        />
        <StatCard
          label="Conflict Alerts"
          value="1"
          sub="Resolve now"
          icon={AlertCircle}
          color="#C0392B"
          bg="#FEE2E2"
          trend="down"
        />
      </div>

      <div className="flex gap-2">
        {["All", "Upcoming", "Full", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={
              filter === f
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl border p-5"
            style={{ borderColor: session.conflict ? "#FECACA" : P.border }}
          >
            {session.conflict && (
              <div
                className="flex items-center gap-2 mb-3 p-2.5 rounded-lg"
                style={{ background: "#FEF2F2" }}
              >
                <AlertCircle size={13} style={{ color: "#C0392B" }} />
                <p className="text-xs font-semibold" style={{ color: "#C0392B" }}>
                  ⚠ Conflict detected — a learner is double-booked for this session
                </p>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: session.format === "Virtual" ? P.lightSage : P.goldLight }}
              >
                {session.format === "Virtual" ? (
                  <Video size={20} style={{ color: P.olive }} />
                ) : (
                  <Users size={20} style={{ color: P.gold }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {session.title}
                  </p>
                  <Chip
                    label={session.status}
                    variant={
                      session.status === "Upcoming"
                        ? "sage"
                        : session.status === "Full"
                          ? "red"
                          : "neutral"
                    }
                  />
                  <Chip label={session.format} variant="blue" />
                </div>
                <div
                  className="flex flex-wrap gap-3 text-[11px] mb-2"
                  style={{ color: P.textMuted }}
                >
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {session.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {session.time} · {session.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {session.instructor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {session.enrolled}/{session.capacity} enrolled
                  </span>
                  {session.waitlist > 0 && (
                    <span style={{ color: P.gold }}>+{session.waitlist} on waitlist</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-40">
                    <PBar
                      value={(session.enrolled / session.capacity) * 100}
                      color={session.enrolled >= session.capacity ? "#C0392B" : P.olive}
                      height={4}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: P.textMuted }}>
                    {Math.round((session.enrolled / session.capacity) * 100)}% capacity
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {session.joinUrl && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-xs font-semibold"
                    style={{ background: "#5A7A2A" }}
                    data-prototype-action="true"
                  >
                    <Play size={12} /> Join
                  </button>
                )}
                {session.recordingUrl && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: P.goldLight, color: "#8A6A1A" }}
                    data-prototype-action="true"
                  >
                    <Video size={12} /> Recording
                  </button>
                )}
                {session.waitlist > 0 && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                    data-prototype-action="true"
                  >
                    <Users size={12} /> Waitlist ({session.waitlist})
                  </button>
                )}
                <button
                  className="p-2 rounded-lg"
                  style={{ border: `1px solid ${P.border}` }}
                  data-prototype-action="true"
                >
                  <MoreHorizontal size={14} style={{ color: P.textMuted }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.75)" }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white rounded-2xl border p-6 max-w-lg w-full space-y-4"
            style={{ borderColor: P.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold" style={{ color: P.text }}>
              Schedule Training Session
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  placeholder="e.g. Leadership Workshop Q1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Format
                  </label>
                  <select
                    value={sessionFormat}
                    onChange={(e) =>
                      setSessionFormat(e.target.value as "Virtual" | "In-Person" | "Hybrid")
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    <option>Virtual</option>
                    <option>In-Person</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Capacity
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>
              {sessionFormat !== "In-Person" && (
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Join URL
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                    placeholder="https://zoom.us/j/…"
                  />
                </div>
              )}
              {sessionFormat !== "Virtual" && (
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Location / Room
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                    placeholder="e.g. HQ Training Room 2, Floor 4"
                  />
                </div>
              )}
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: P.bg }}
              >
                <div>
                  <p className="text-xs font-medium" style={{ color: P.textMid }}>
                    Enable Waitlist
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    Auto-enroll when a spot opens
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ accentColor: P.olive, width: 16, height: 16 }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: P.olive }}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. QUESTION BANK
// ─────────────────────────────────────────────────────────────
