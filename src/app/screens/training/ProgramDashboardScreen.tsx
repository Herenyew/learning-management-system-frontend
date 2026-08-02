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

export function ProgramDashboardScreen({ navigate }: { navigate: (s: string) => void }) {
  const [retired, setRetired] = useState<string[]>([]);

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Learning Program Overview"
        sub="All active programs, participant counts, completion rates, and overdue tasks"
        actions={
          <>
            <button
              onClick={() => navigate("hr-programs")}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            >
              <Settings size={14} /> Manage Programs
            </button>
            <button
              onClick={() => {
                window.sessionStorage.setItem("hr-programs-tab", "create");
                navigate("hr-programs");
              }}
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ background: P.olive }}
            >
              <Plus size={14} /> New Program
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(
          [
            ["Active Programs", "13", TrendingUp, P.olive, P.lightSage, "up"],
            ["Total Learners", "1,440", Users, "#5A7A2A", "#D8EDCC", "up"],
            ["Avg. Completion", "51%", CheckCircle, P.gold, P.goldLight, "neutral"],
            ["Overdue Tasks", "131", AlertCircle, "#C0392B", "#FEE2E2", "down"],
            ["Cohorts Active", "8", Layers, P.darkOlive, P.lightSage, "neutral"],
          ] as [string, string, React.ElementType, string, string, string][]
        ).map(([l, v, Icon, color, bg, trend]) => (
          <StatCard
            key={l}
            label={l}
            value={v}
            icon={Icon}
            color={color}
            bg={bg}
            trend={trend as "up" | "down"}
          />
        ))}
      </div>

      {/* Program type table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Programs by Type
          </p>
          <p className="text-[11px]" style={{ color: P.textMuted }}>
            Retired types are hidden from new program creation but historical data is preserved
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {[
                "Program Type",
                "Programs",
                "Learners",
                "Avg. Completion",
                "Overdue Tasks",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase"
                  style={{ color: P.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PROGRAM_TYPES.map((pt) => {
              const isRetired = retired.includes(pt.type) || !pt.active;
              return (
                <tr
                  key={pt.type}
                  className="hover:bg-[#F6FEFA] transition-colors"
                  style={{ borderBottom: `1px solid ${P.border}50`, opacity: isRetired ? 0.5 : 1 }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: pt.color }} />
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {pt.type}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs" style={{ color: P.textMid }}>
                      {pt.programs}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs" style={{ color: P.textMid }}>
                      {pt.learners.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20">
                        <PBar
                          value={pt.avgCompletion}
                          color={
                            pt.avgCompletion >= 70
                              ? "#5A7A2A"
                              : pt.avgCompletion >= 50
                                ? P.gold
                                : "#C0392B"
                          }
                          height={5}
                        />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: P.text }}>
                        {pt.avgCompletion}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {pt.overdue > 0 ? (
                      <span className="text-xs font-semibold" style={{ color: "#C0392B" }}>
                        {pt.overdue} overdue
                      </span>
                    ) : (
                      <span className="text-xs" style={{ color: "#5A7A2A" }}>
                        None
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <Chip
                      label={isRetired ? "Retired" : "Active"}
                      variant={isRetired ? "neutral" : "green"}
                    />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => navigate("hr-programs")}
                        className="text-[11px] font-medium"
                        style={{ color: P.olive }}
                      >
                        View →
                      </button>
                      {!isRetired && (
                        <button
                          onClick={() => setRetired((prev) => [...prev, pt.type])}
                          className="text-[11px] font-medium ml-2"
                          style={{ color: "#C0392B" }}
                        >
                          Retire
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Overdue tasks panel */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: P.text }}
          >
            <AlertCircle size={15} style={{ color: "#C0392B" }} /> Overdue Tasks (Top Programs)
          </p>
          <div className="space-y-3">
            {[
              {
                program: "2025 Regulatory Compliance Pack",
                overdue: 103,
                deadline: "Jan 10, 2025",
                color: "#C0392B",
              },
              {
                program: "Engineering Excellence Track",
                overdue: 12,
                deadline: "Jan 20, 2025",
                color: P.gold,
              },
              {
                program: "Future Leaders Initiative",
                overdue: 5,
                deadline: "Jan 25, 2025",
                color: P.olive,
              },
              {
                program: "Acme Onboarding Program",
                overdue: 8,
                deadline: "Dec 31, 2024",
                color: "#C0392B",
              },
            ].map(({ program, overdue, deadline, color }) => (
              <div
                key={program}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: P.bg }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <AlertCircle size={14} style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: P.text }}>
                    {program}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    Due: {deadline}
                  </p>
                </div>
                <span className="text-xs font-bold" style={{ color }}>
                  {overdue}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Cohorts */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Active Cohorts
            </p>
            <button
              className="text-xs font-medium"
              style={{ color: P.olive }}
              data-prototype-action="true"
            >
              + New Cohort
            </button>
          </div>
          <div className="space-y-3">
            {[
              {
                name: "Cohort A — Jan 2025",
                program: "Acme Onboarding Program",
                learners: 14,
                startDate: "Jan 6",
                endDate: "Feb 14",
                progress: 42,
              },
              {
                name: "Cohort 2025-1",
                program: "Future Leaders Initiative",
                learners: 8,
                startDate: "Jan 13",
                endDate: "Apr 11",
                progress: 18,
              },
              {
                name: "Engineers — Batch 3",
                program: "Engineering Excellence Track",
                learners: 22,
                startDate: "Nov 18",
                endDate: "Mar 15",
                progress: 56,
              },
            ].map(({ name, program, learners, startDate, endDate, progress }) => (
              <div key={name} className="p-3 rounded-xl border" style={{ borderColor: P.border }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {name}
                  </p>
                  <Chip label={`${learners} learners`} variant="sage" />
                </div>
                <p className="text-[10px] mb-2" style={{ color: P.textMuted }}>
                  {program} · {startDate} – {endDate}
                </p>
                <PBar value={progress} color={P.olive} height={4} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. ASSIGNMENTS
// ─────────────────────────────────────────────────────────────
