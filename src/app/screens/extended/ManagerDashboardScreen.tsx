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

export function ManagerDashboardScreen({ navigate }: { navigate: (s: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const member = selected ? TEAM_MEMBERS.find((m) => m.name === selected) : null;

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <PageHeader
        title="My Team Dashboard"
        sub="5 direct reports · Engineering Department"
        actions={
          <>
            <button
              onClick={() => navigate("tna-form")}
              className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
              style={{ background: P.olive }}
            >
              <Target size={14} /> Submit TNA Request
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              data-prototype-action="true"
            >
              <Download size={14} /> Team Report
            </button>
          </>
        }
      />

      {/* Team stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Team Members"
          value="5"
          sub="All active"
          icon={Users}
          color={P.olive}
          bg={P.lightSage}
        />
        <StatCard
          label="Avg. Completion Rate"
          value="79.2%"
          sub="+4.1% vs last month"
          icon={CheckCircle}
          color="#5A7A2A"
          bg="#D8EDCC"
          trend="up"
        />
        <StatCard
          label="Team Certifications"
          value="16"
          sub="5 active, 3 expiring soon"
          icon={Award}
          color={P.gold}
          bg={P.goldLight}
        />
        <StatCard
          label="Overdue Trainings"
          value="2"
          sub="Luca, 1 mandatory"
          icon={AlertCircle}
          color="#C0392B"
          bg="#FEE2E2"
          trend="down"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Team table */}
        <div
          className="lg:col-span-2 bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Team Learning Progress
            </p>
            <button
              className="text-xs font-medium"
              style={{ color: P.olive }}
              data-prototype-action="true"
            >
              Assign Training
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
                {["Team Member", "Progress", "Courses", "Certs", "Last Active", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                      style={{ color: P.textMuted }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.map((m) => (
                <tr
                  key={m.name}
                  onClick={() => setSelected(m.name === selected ? null : m.name)}
                  className="hover:bg-[#F6FEFA] transition-colors cursor-pointer"
                  style={{
                    borderBottom: `1px solid ${P.border}50`,
                    background: selected === m.name ? `${P.lightSage}50` : undefined,
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Av initials={m.av} size={32} color={m.color} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: P.text }}>
                          {m.name}
                        </p>
                        <p className="text-[10px]" style={{ color: P.textMuted }}>
                          {m.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24">
                        <PBar value={m.progress} color={m.color} height={5} />
                      </div>
                      <span className="text-xs font-semibold" style={{ color: m.color }}>
                        {m.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: P.textMid }}>
                      {m.completed}/{m.courses}
                    </p>
                    {m.inProgress > 0 && (
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {m.inProgress} in progress
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium" style={{ color: P.text }}>
                      {m.activeCerts} active
                    </p>
                    {m.expiredCerts > 0 && (
                      <p className="text-[10px]" style={{ color: "#C0392B" }}>
                        {m.expiredCerts} expired
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                      {m.lastActive}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={
                        m.progress >= 80 ? "On Track" : m.progress >= 60 ? "At Risk" : "Behind"
                      }
                      variant={m.progress >= 80 ? "green" : m.progress >= 60 ? "gold" : "red"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Member detail */}
        {member ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
              <div
                className="flex items-center gap-3 mb-4 pb-4"
                style={{ borderBottom: `1px solid ${P.border}` }}
              >
                <Av initials={member.av} size={44} color={member.color} />
                <div>
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {member.name}
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {member.role}
                  </p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: P.textMuted }}>
                    {member.xp.toLocaleString()} XP · Rank #{TEAM_MEMBERS.indexOf(member) + 4}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: P.textMid }}>Learning Progress</span>
                    <span className="font-semibold" style={{ color: member.color }}>
                      {member.progress}%
                    </span>
                  </div>
                  <PBar value={member.progress} color={member.color} height={7} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  {[
                    [member.completed, "Completed"],
                    [member.inProgress, "In Progress"],
                    [member.certCount, "Certs"],
                  ].map(([v, l]) => (
                    <div key={l as string} className="p-2 rounded-lg" style={{ background: P.bg }}>
                      <p
                        className="text-sm font-bold"
                        style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                      >
                        {v}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {l}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <AICard title="AI Training Recommendation">
              <p className="text-xs leading-relaxed mb-2" style={{ color: "#7A5A10" }}>
                Based on {member.name.split(" ")[0]}'s role and current skill profile, recommend
                enrolling in <strong>Data-Driven Leadership</strong> to close identified skill gaps.
              </p>
              <button
                className="text-xs font-semibold flex items-center gap-1"
                style={{ color: "#8A6A1A" }}
                data-prototype-action="true"
              >
                Assign Course <ChevronRight size={11} />
              </button>
            </AICard>
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
                Certifications
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    Active
                  </p>
                  <Badge label={`${member.activeCerts} Active`} variant="green" />
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    Expired
                  </p>
                  <Badge
                    label={`${member.expiredCerts} Expired`}
                    variant={member.expiredCerts > 0 ? "red" : "neutral"}
                  />
                </div>
              </div>
              <button
                className="w-full mt-3 py-2 rounded-lg text-xs font-medium"
                style={{ background: P.lightSage, color: P.olive }}
                data-prototype-action="true"
              >
                View Full Profile →
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bg-white rounded-xl border p-5 flex flex-col items-center justify-center text-center"
            style={{ borderColor: P.border, minHeight: 300 }}
          >
            <Users size={32} style={{ color: P.sage }} className="mb-3" />
            <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
              Select a team member
            </p>
            <p className="text-xs" style={{ color: P.textMuted }}>
              Click a row to see detailed progress and recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. HR PROGRAM MANAGEMENT
// ─────────────────────────────────────────────────────────────
