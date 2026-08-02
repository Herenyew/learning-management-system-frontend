import React, { useEffect, useState } from "react";
import {
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
} from "./extended.shared";
import type { Screen } from "../../models/app.model";
import type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
} from "./extended.shared";

export function TNAAggregationScreen({ navigate }: { navigate: (s: string) => void }) {
  const [tab, setTab] = useState<"overview" | "requests" | "pipeline" | "budget">("overview");

  const freeVsPaid = [
    { name: "Free", value: 56, color: "#5A7A2A" },
    { name: "Paid", value: 48, color: P.gold },
  ];
  const statusData = [
    { label: "Pending Manager", count: 12, color: P.gold },
    { label: "Pending HR", count: 8, color: "#4A7A5A" },
    { label: "Pending CEO", count: 5, color: P.olive },
    { label: "Fully Approved", count: 43, color: "#5A7A2A" },
    { label: "Rejected", count: 6, color: "#C0392B" },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <PageHeader
        title="TNA Aggregation Dashboard"
        sub={`${TNA_REQUESTS.length} active requests · ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
        actions={
          <>
            <button
              onClick={() => navigate("tna-form")}
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ background: P.olive }}
            >
              <Plus size={14} /> New Request
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              data-prototype-action="true"
            >
              <Download size={14} /> Export
            </button>
          </>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {(
          [
            ["Total Requests", "104", "+12 this month", Target, P.olive, P.lightSage, "up"],
            ["Paid Requests", "48", "$284,500 total", Award, P.gold, P.goldLight, "neutral"],
            ["Free Requests", "56", "HR managed", BookOpen, "#5A7A2A", "#D8EDCC", "neutral"],
            ["Fully Approved", "43", "41%", CheckCircle, "#5A7A2A", "#D8EDCC", "up"],
            ["Avg. Approval Time", "4.2 days", "-0.8 days", Clock, P.darkOlive, P.lightSage, "up"],
          ] as [string, string, string, React.ElementType, string, string, "up" | "neutral"][]
        ).map(([l, v, s, Icon, color, bg, trend]) => (
          <StatCard
            key={l}
            label={l}
            value={v}
            sub={s}
            icon={Icon}
            color={color}
            bg={bg}
            trend={trend}
          />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        {(["overview", "requests", "pipeline", "budget"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-5 py-3 text-xs font-semibold capitalize transition-colors"
            style={
              tab === t
                ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                : { color: P.textMuted }
            }
          >
            {t === "pipeline"
              ? "Approval Pipeline"
              : t === "budget"
                ? "Budget Summary"
                : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* By Department */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
              Requests by Department
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <ReBarChart data={TNA_DEPT_DATA}>
                <CartesianGrid key="cgrid" strokeDasharray="3 3" stroke={P.lightSage} />
                <XAxis
                  key="cx"
                  dataKey="dept"
                  tick={{ fontSize: 10, fill: P.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  key="cy"
                  tick={{ fontSize: 11, fill: P.textMuted }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  key="ctip"
                  contentStyle={{
                    background: "white",
                    border: `1px solid ${P.border}`,
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Bar
                  key="paid"
                  dataKey="paid"
                  stackId="a"
                  fill={P.gold}
                  name="Paid"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  key="free"
                  dataKey="free"
                  stackId="a"
                  fill={P.olive}
                  name="Free"
                  radius={[4, 4, 0, 0]}
                />
              </ReBarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 text-[11px]" style={{ color: P.textMuted }}>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ background: P.olive }} /> Free
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded" style={{ background: P.gold }} /> Paid
              </div>
            </div>
          </div>

          {/* Trend */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
              Training Demand Trends
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={TNA_TREND}>
                <defs>
                  <linearGradient id="tnaGrad" x1="0" y1="0" x2="0" y2="1">
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
                  key="requests"
                  type="monotone"
                  dataKey="requests"
                  stroke={P.olive}
                  strokeWidth={2}
                  fill="url(#tnaGrad)"
                  name="Requests"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div
              className="grid grid-cols-3 gap-3 mt-4 pt-4"
              style={{ borderTop: `1px solid ${P.border}` }}
            >
              {[
                ["Top Competency", "AI & Automation"],
                ["Top Department", "Engineering"],
                ["Avg. Budget", "$5,928"],
              ].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {l}
                  </p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: P.text }}>
                    {v}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Free vs Paid donut */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-3" style={{ color: P.text }}>
              Free vs Paid Distribution
            </p>
            <div className="flex items-center gap-6">
              <div style={{ width: 160, height: 140 }}>
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie
                      data={freeVsPaid}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={58}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {freeVsPaid.map((e) => (
                        <Cell key={`cell-${e.name}`} fill={e.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {freeVsPaid.map(({ name, value, color }) => (
                  <div key={name}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                      <span className="text-xs font-medium" style={{ color: P.textMid }}>
                        {name}
                      </span>
                      <span className="ml-auto text-xs font-bold" style={{ color: P.text }}>
                        {value}
                      </span>
                    </div>
                    <PBar value={(value / 104) * 100} color={color} height={4} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* By Competency */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
              Top Competency Gaps
            </p>
            <div className="space-y-3">
              {[
                ["AI & Automation", 32],
                ["Data Literacy", 24],
                ["Leadership", 18],
                ["Security & Compliance", 16],
                ["Communication", 14],
              ].map(([skill, count]) => (
                <div key={skill as string}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: P.textMid }}>
                      {skill}
                    </span>
                    <span className="font-mono" style={{ color: P.text }}>
                      {count} requests
                    </span>
                  </div>
                  <PBar value={((count as number) / 32) * 100} color={P.olive} height={5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "requests" && (
        <div
          className="bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              All TNA Requests
            </p>
            <div className="flex gap-2">
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2"
                  style={{ color: P.sage }}
                />
                <input
                  placeholder="Search…"
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text, width: 200 }}
                />
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                data-prototype-action="true"
              >
                <Filter size={12} /> Filter
              </button>
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
                {[
                  "Employee",
                  "Department",
                  "Work Unit",
                  "Competency",
                  "Type",
                  "Status",
                  "Submitted",
                  "Action",
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
              {TNA_REQUESTS.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-[#F6FEFA] transition-colors"
                  style={{ borderBottom: `1px solid ${P.border}50` }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Av
                        initials={req.employee
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        size={28}
                        color={P.sage}
                      />
                      <p className="text-xs font-medium" style={{ color: P.text }}>
                        {req.employee}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: P.textMid }}>
                      {req.dept}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      {req.unit}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: P.textMid }}>
                      {req.competency}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={req.type} variant={req.type === "Paid" ? "gold" : "green"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={req.status}
                      variant={
                        req.status.includes("Approved") && req.status !== "Pending CEO"
                          ? "green"
                          : req.status.includes("Pending")
                            ? "gold"
                            : "neutral"
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                      {req.submitted}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="text-xs font-medium"
                      style={{ color: P.olive }}
                      data-prototype-action="true"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "pipeline" && (
        <div className="space-y-4">
          {statusData.map(({ label, count, color }) => (
            <div
              key={label}
              className="bg-white rounded-xl border p-4 flex items-center gap-4"
              style={{ borderColor: P.border }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <div className="w-4 h-4 rounded-full" style={{ background: color }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {label}
                </p>
                <PBar value={(count / 104) * 100} color={color} height={5} />
              </div>
              <p
                className="text-2xl font-bold font-mono flex-shrink-0"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
              >
                {count}
              </p>
              <p className="text-xs flex-shrink-0" style={{ color: P.textMuted }}>
                {Math.round((count / 104) * 100)}%
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "budget" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-4">
            {[
              {
                label: "Total Budget Requested",
                value: "$284,500",
                sub: "48 paid requests",
                color: P.olive,
                bg: P.lightSage,
              },
              {
                label: "Total Approved Budget",
                value: "$193,800",
                sub: "34 approved",
                color: "#5A7A2A",
                bg: "#D8EDCC",
              },
              {
                label: "Pending CEO Approval",
                value: "$68,200",
                sub: "5 requests pending",
                color: P.gold,
                bg: P.goldLight,
              },
              {
                label: "Rejected Budget",
                value: "$22,500",
                sub: "6 rejected requests",
                color: "#C0392B",
                bg: "#FEE2E2",
              },
            ].map(({ label, value, sub, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-xl border p-4 flex items-center gap-4"
                style={{ borderColor: P.border }}
              >
                <div className="flex-1">
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {label}
                  </p>
                  <p
                    className="text-xl font-bold mt-0.5"
                    style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                  >
                    {value}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: P.textMuted }}>
                    {sub}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Award size={20} style={{ color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
              Budget by Department (Paid Requests)
            </p>
            <div className="space-y-3">
              {(
                [
                  ["Engineering", "$89,400", P.olive],
                  ["Finance", "$62,100", P.gold],
                  ["Sales", "$38,800", "#4A7A5A"],
                  ["Marketing", "$28,500", P.darkOlive],
                  ["HR", "$18,200", P.sage],
                ] as [string, string, string][]
              ).map(([dept, amt, color]) => (
                <div key={dept}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: P.textMid }}>
                      {dept}
                    </span>
                    <span className="font-semibold" style={{ color: P.text }}>
                      {amt}
                    </span>
                  </div>
                  <PBar value={parseInt(amt.replace(/\D/g, "")) / 894} color={color} height={6} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. MANAGER DASHBOARD
// ─────────────────────────────────────────────────────────────
