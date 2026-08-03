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

export function CalendarScreen({ navigate }: { navigate: (s: string) => void }) {
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const evt = selectedEvent ? CALENDAR_EVENTS.find((e) => e.id === selectedEvent) : null;

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const weeks = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 10 }, (_, i) => `${i + 8}:00`);

  const getEventsForDay = (day: number) =>
    CALENDAR_EVENTS.filter((e) => parseInt(e.date.split("-")[2]) === day);

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Training Calendar"
        sub="Your personal schedule of courses, live sessions, and deadlines"
        actions={
          <>
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              data-prototype-action="true"
            >
              <Download size={14} /> iCal Export
            </button>
            <button
              onClick={() => navigate("live-sessions")}
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ background: P.olive }}
            >
              <Plus size={14} /> Schedule Session
            </button>
          </>
        }
      />

      {/* Legend + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {[
            ["Course Deadline", "#C0392B"],
            ["Live Session", P.gold],
            ["Assessment", P.darkOlive],
            ["Course Start", P.olive],
          ].map(([label, color]) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-xs"
              style={{ color: P.textMuted }}
            >
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: `1px solid ${P.border}` }}
        >
          {(["month", "week", "day"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium capitalize"
              style={{
                background: view === v ? P.olive : "white",
                color: view === v ? "white" : P.textMid,
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Calendar main */}
        <div className="lg:col-span-3">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              className="p-2 rounded-lg hover:bg-white transition-colors"
              data-prototype-action="true"
            >
              <ChevronLeft size={16} style={{ color: P.textMuted }} />
            </button>
            <h2 className="text-base font-semibold" style={{ color: P.text }}>
              January 2025
            </h2>
            <button
              className="p-2 rounded-lg hover:bg-white transition-colors"
              data-prototype-action="true"
            >
              <ChevronRight size={16} style={{ color: P.textMuted }} />
            </button>
          </div>

          {view === "month" && (
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: P.border }}
            >
              {/* Days of week */}
              <div className="grid grid-cols-7" style={{ borderBottom: `1px solid ${P.border}` }}>
                {weeks.map((w) => (
                  <div
                    key={w}
                    className="py-2.5 text-center text-[11px] font-semibold"
                    style={{ color: P.textMuted }}
                  >
                    {w}
                  </div>
                ))}
              </div>
              {/* Day cells */}
              <div className="grid grid-cols-7">
                {/* Offset for Jan 2025 starting on Wed */}
                {[0, 1].map((i) => (
                  <div
                    key={`e${i}`}
                    className="h-24 p-1.5"
                    style={{
                      borderRight: `1px solid ${P.border}`,
                      borderBottom: `1px solid ${P.border}`,
                    }}
                  />
                ))}
                {days.map((day) => {
                  const events = getEventsForDay(day);
                  const isToday = day === 17;
                  return (
                    <div
                      key={day}
                      className="h-24 p-1.5 cursor-pointer hover:bg-[#F6FEFA] transition-colors"
                      style={{
                        borderRight: `1px solid ${P.border}`,
                        borderBottom: `1px solid ${P.border}`,
                      }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mb-1`}
                        style={{
                          background: isToday ? P.olive : "transparent",
                          color: isToday ? "white" : P.text,
                        }}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {events.slice(0, 2).map((e) => (
                          <div
                            key={e.id}
                            onClick={() => setSelectedEvent(e.id)}
                            className="text-[10px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer"
                            style={{ background: `${e.color}20`, color: e.color }}
                          >
                            {e.title}
                          </div>
                        ))}
                        {events.length > 2 && (
                          <div className="text-[9px] font-medium" style={{ color: P.textMuted }}>
                            +{events.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "week" && (
            <div
              className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: P.border }}
            >
              <div
                className="grid grid-cols-8 text-center text-[11px] font-semibold py-2"
                style={{ borderBottom: `1px solid ${P.border}`, color: P.textMuted }}
              >
                <div />
                {["Mon 20", "Tue 21", "Wed 22", "Thu 23", "Fri 24", "Sat 25", "Sun 26"].map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
              {hours.map((h) => (
                <div
                  key={h}
                  className="grid grid-cols-8"
                  style={{ borderBottom: `1px solid ${P.border}50`, minHeight: 48 }}
                >
                  <div
                    className="px-2 py-1 text-[10px] font-mono"
                    style={{ color: P.textMuted, borderRight: `1px solid ${P.border}` }}
                  >
                    {h}
                  </div>
                  {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                    <div
                      key={col}
                      className="relative"
                      style={{ borderRight: `1px solid ${P.border}50` }}
                    >
                      {col === 2 && h === "10:00" && (
                        <div
                          className="absolute inset-1 rounded-lg p-1.5"
                          style={{ background: `${P.gold}20`, border: `1px solid ${P.gold}50` }}
                        >
                          <p className="text-[9px] font-semibold" style={{ color: "#8A6A1A" }}>
                            Leadership Workshop
                          </p>
                          <p className="text-[9px]" style={{ color: P.gold }}>
                            10:00 – 12:00
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {view === "day" && (
            <div className="bg-white rounded-2xl border p-5" style={{ borderColor: P.border }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: P.text }}>
                Thursday, January 17, 2025
              </h3>
              <div className="space-y-3">
                {[
                  {
                    time: "10:00 – 12:30",
                    title: "Leadership Workshop — Virtual ILT",
                    type: "Live Session",
                    color: P.gold,
                  },
                  {
                    time: "14:00 – 14:30",
                    title: "Module 3 Quiz: AI Foundations",
                    type: "Assessment",
                    color: P.darkOlive,
                  },
                  {
                    time: "All Day",
                    title: "AI & ML Course — Self-paced",
                    type: "Course",
                    color: P.olive,
                  },
                ].map((e) => (
                  <div
                    key={e.title}
                    className="flex gap-3 p-3 rounded-xl"
                    style={{ background: `${e.color}10`, border: `1px solid ${e.color}25` }}
                  >
                    <div
                      className="w-1 rounded-full flex-shrink-0"
                      style={{ background: e.color }}
                    />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {e.title}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: e.color }}>
                        {e.time} · {e.type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {evt ? (
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between mb-3">
                <Chip
                  label={
                    evt.type === "live"
                      ? "Live Session"
                      : evt.type === "deadline"
                        ? "Deadline"
                        : "Assessment"
                  }
                  variant={evt.type === "deadline" ? "red" : evt.type === "live" ? "gold" : "sage"}
                />
                <button onClick={() => setSelectedEvent(null)}>
                  <X size={13} style={{ color: P.textMuted }} />
                </button>
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: P.text }}>
                {evt.title}
              </p>
              <p className="text-xs mb-3" style={{ color: P.textMuted }}>
                January {parseInt(evt.date.split("-")[2])}, 2025
              </p>
              {evt.type === "live" && (
                <div className="space-y-1.5 text-xs" style={{ color: P.textMid }}>
                  <p>
                    🕐 {(evt as any).time} · {(evt as any).duration}
                  </p>
                  <p>📍 Virtual (Zoom)</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <button
                  className="flex-1 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: P.olive }}
                  data-prototype-action="true"
                >
                  Open
                </button>
                <button
                  className="py-2 px-3 rounded-lg text-xs"
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  data-prototype-action="true"
                >
                  <Download size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
                Upcoming this month
              </p>
              <div className="space-y-2">
                {CALENDAR_EVENTS.sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 5)
                  .map((e) => (
                    <div
                      key={e.id}
                      onClick={() => setSelectedEvent(e.id)}
                      className="flex items-center gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-[#F6FEFA] transition-colors"
                    >
                      <div
                        className="w-1.5 h-8 rounded-full flex-shrink-0"
                        style={{ background: e.color }}
                      />
                      <div>
                        <p
                          className="text-[11px] font-semibold leading-tight"
                          style={{ color: P.text }}
                        >
                          {e.title}
                        </p>
                        <p className="text-[10px] font-mono" style={{ color: P.textMuted }}>
                          Jan {parseInt(e.date.split("-")[2])}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* iCal sync */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
            <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
              Calendar Sync
            </p>
            <div className="space-y-2">
              {[
                ["Google Calendar", "🗓️", "Connected"],
                ["Outlook / Exchange", "📅", "Connect"],
                ["Apple Calendar (iCal)", "🍎", "Export"],
              ].map(([app, icon, action]) => (
                <div key={app as string} className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {icon} {app}
                  </p>
                  <button
                    className="text-[11px] font-semibold"
                    style={{ color: action === "Connected" ? "#5A7A2A" : P.olive }}
                    data-prototype-action="true"
                  >
                    {action}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
            <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
              Scheduling Safeguards
            </p>
            <div className="space-y-2.5">
              {[
                {
                  label: "Conflict Detection",
                  value: "2 double-booking alerts",
                  icon: AlertCircle,
                  color: "#C0392B",
                },
                {
                  label: "Automated Waitlist",
                  value: "8 learners queued",
                  icon: Users,
                  color: P.gold,
                },
                {
                  label: "Auto Enrollment",
                  value: "Next open seat reserved",
                  icon: CheckCircle,
                  color: "#5A7A2A",
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg"
                  style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                >
                  <Icon size={14} style={{ color }} />
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: P.text }}>
                      {label}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. PRE/POST EFFECTIVENESS DASHBOARD
// ─────────────────────────────────────────────────────────────
