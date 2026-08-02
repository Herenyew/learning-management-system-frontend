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

export function EffectivenessScreen({ navigate }: { navigate: (s: string) => void }) {
  const [tab, setTab] = useState<"overview" | "courses" | "kirkpatrick" | "export">("overview");

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Training Effectiveness Dashboard"
        sub="Pre/Post assessment scores, Kirkpatrick levels, and learning lift analysis"
        actions={
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
            data-prototype-action="true"
          >
            <Download size={14} /> Export Report
          </button>
        }
      />

      {/* Kirkpatrick overview cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            level: "L1",
            name: "Reaction",
            desc: "Learner satisfaction",
            value: "4.6/5",
            sub: "287 surveys",
            color: P.olive,
            bg: P.lightSage,
          },
          {
            level: "L2",
            name: "Learning",
            desc: "Knowledge gain",
            value: "63.1%",
            sub: "Avg. lift score",
            color: P.gold,
            bg: P.goldLight,
          },
          {
            level: "L3",
            name: "Behavior",
            desc: "On-the-job change",
            value: "4.2/5",
            sub: "Manager surveys",
            color: "#4A7A5A",
            bg: "#D8EDCC",
          },
          {
            level: "L4",
            name: "Results",
            desc: "Business impact",
            value: "340%",
            sub: "Estimated ROI",
            color: P.darkOlive,
            bg: P.lightSage,
          },
        ].map(({ level, name, desc, value, sub, color, bg }) => (
          <div
            key={level}
            className="bg-white rounded-xl border p-4"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: color }}
              >
                {level}
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {name}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {desc}
                </p>
              </div>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              {value}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        {[
          ["overview", "Overview"],
          ["courses", "Course Breakdown"],
          ["kirkpatrick", "Kirkpatrick Analysis"],
          ["export", "Export"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as typeof tab)}
            className="px-5 py-3 text-xs font-semibold"
            style={
              tab === id
                ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                : { color: P.textMuted }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
              Average Lift Score — Monthly Trend
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={EFFECTIVENESS_TREND}>
                <defs>
                  <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={P.olive} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={P.olive} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke={P.lightSage} />
                <XAxis
                  key="x"
                  dataKey="month"
                  tick={{ fontSize: 11, fill: P.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  key="y"
                  domain={[40, 80]}
                  tick={{ fontSize: 11, fill: P.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  key="tip"
                  contentStyle={{
                    background: "white",
                    border: `1px solid ${P.border}`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Area
                  key="avgLift"
                  type="monotone"
                  dataKey="avgLift"
                  stroke={P.olive}
                  strokeWidth={2}
                  fill="url(#liftGrad)"
                  name="Avg. Lift %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
              Pre vs. Post Score Comparison
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <ReBarChart data={EFFECTIVENESS_DATA.slice(0, 4)} layout="vertical">
                <CartesianGrid
                  key="grid"
                  strokeDasharray="3 3"
                  stroke={P.lightSage}
                  horizontal={false}
                />
                <XAxis
                  key="x"
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: P.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  key="y"
                  type="category"
                  dataKey="course"
                  tick={{ fontSize: 9, fill: P.textMuted }}
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  key="tip"
                  contentStyle={{
                    background: "white",
                    border: `1px solid ${P.border}`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Bar
                  key="pre"
                  dataKey="pre"
                  fill={P.lightSage}
                  name="Pre-Score %"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  key="post"
                  dataKey="post"
                  fill={P.olive}
                  name="Post-Score %"
                  radius={[0, 4, 4, 0]}
                />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === "courses" && (
        <div
          className="bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {[
                  "Course",
                  "Department",
                  "Pre Score",
                  "Post Score",
                  "Lift Score",
                  "Respondents",
                  "Effectiveness",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EFFECTIVENESS_DATA.map((row) => {
                const liftColor = row.lift >= 70 ? "#5A7A2A" : row.lift >= 55 ? P.gold : "#C0392B";
                return (
                  <tr
                    key={row.course}
                    className="hover:bg-[#F6FEFA] transition-colors"
                    style={{ borderBottom: `1px solid ${P.border}50` }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {row.course}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMuted }}>
                        {row.dept}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono" style={{ color: "#C0392B" }}>
                        {row.pre}%
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono" style={{ color: "#5A7A2A" }}>
                        {row.post}%
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold font-mono" style={{ color: liftColor }}>
                        {row.lift}%
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMid }}>
                        {row.respondents}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Chip
                        label={row.lift >= 70 ? "High" : row.lift >= 55 ? "Medium" : "Low"}
                        variant={row.lift >= 70 ? "green" : row.lift >= 55 ? "gold" : "red"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div
            className="px-4 py-3 flex items-center"
            style={{ borderTop: `1px solid ${P.border}`, background: P.paleGreen }}
          >
            <p className="text-[11px]" style={{ color: P.textMuted }}>
              Lift = (Post − Pre) / (100 − Pre) × 100
            </p>
          </div>
        </div>
      )}

      {tab === "kirkpatrick" && (
        <div className="grid md:grid-cols-2 gap-5">
          {[
            {
              level: "L1 — Reaction",
              desc: "Post-course satisfaction survey scores",
              metric: "4.6/5 avg rating",
              detail:
                "287 of 312 learners responded (92%). Top-rated: course relevance and instructor quality. Areas for improvement: pace and exercises.",
              color: P.olive,
            },
            {
              level: "L2 — Learning",
              desc: "Knowledge gained via pre/post assessment",
              metric: "63.1% avg lift",
              detail:
                "Average pre-score 45%, post-score 79.8%. Highest lift in Cybersecurity (75.6%). Lowest in Data-Driven Leadership (58.1%).",
              color: P.gold,
            },
            {
              level: "L3 — Behavior",
              desc: "On-the-job behavior change (Manager survey)",
              metric: "4.2/5 observed change",
              detail:
                "Manager surveys sent 30-90 days post-completion. 124 of 156 responded. Engineers show highest behavioral transfer for AI skills.",
              color: "#4A7A5A",
            },
            {
              level: "L4 — Results",
              desc: "Business impact and ROI estimate",
              metric: "340% estimated ROI",
              detail:
                "Based on productivity gains, error reduction, and compliance rate improvements. Full ROI model available in the export report.",
              color: P.darkOlive,
            },
          ].map(({ level, desc, metric, detail, color }) => (
            <div
              key={level}
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: P.border }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <BarChart2 size={16} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {level}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {desc}
                  </p>
                </div>
              </div>
              <p
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color }}
              >
                {metric}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>
                {detail}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "export" && (
        <div className="max-w-lg space-y-4">
          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Export Effectiveness Report
            </p>
            <div className="space-y-2">
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Date Range
              </label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  defaultValue="2024-10-01"
                />
                <input
                  type="date"
                  className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  defaultValue="2025-01-31"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Export Format
              </label>
              <div className="flex gap-2">
                {["Spreadsheet (XLSX)", "PDF Report", "CSV (Raw Data)"].map((f) => (
                  <button
                    key={f}
                    className="flex-1 py-2 rounded-lg text-xs font-medium"
                    style={{
                      background: f.includes("XLSX") ? P.olive : "white",
                      color: f.includes("XLSX") ? "white" : P.textMid,
                      border: `1px solid ${P.border}`,
                    }}
                    data-prototype-action="true"
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Include Sections
              </label>
              <div className="space-y-2">
                {[
                  "Pre/Post Score Comparison",
                  "Kirkpatrick Level Analysis",
                  "Individual Learner Results",
                  "Department Breakdown",
                  "ROI Calculation",
                ].map((s) => (
                  <label
                    key={s}
                    className="flex items-center gap-2.5 text-xs"
                    style={{ color: P.textMid }}
                  >
                    <input type="checkbox" defaultChecked style={{ accentColor: P.olive }} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: P.olive }}
              data-prototype-action="true"
            >
              <Download size={15} /> Generate & Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. LIVE SESSIONS MANAGEMENT
// ─────────────────────────────────────────────────────────────
