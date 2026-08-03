import React, { useState } from "react";
import {
  AC,
  Activity,
  AlertCircle,
  AnaStatCard,
  Area,
  AreaChart,
  Award,
  Bar,
  BarChart2,
  BookOpen,
  Bookmark,
  CartesianGrid,
  Cell,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExportBar,
  FileText,
  Globe,
  HelpCircle,
  Layers,
  P,
  Pie,
  PieChart,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  Settings,
  Shield,
  Star,
  TS,
  Target,
  Tooltip,
  TrendingDown,
  TrendingUp,
  Users,
  XAxis,
  YAxis,
  Zap,
} from "./analyticsCenter.shared";

type ManagerTnaPriority = "High" | "Medium" | "Low";
type ManagerTnaStatus = "Submitted" | "In Review" | "Approved" | "Completed";
type ManagerRisk = "On Track" | "Watch" | "Critical";

type ManagerTnaRequest = {
  id: string;
  skill: string;
  type: "Course" | "Workshop" | "Certification" | "Mentoring";
  priority: ManagerTnaPriority;
  status: ManagerTnaStatus;
  justification: string;
};

type ManagerTeamMemberReport = {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: string;
  completion: number;
  performance: number;
  learningHours: number;
  xp: number;
  overdue: number;
  certifications: number;
  passRate: number;
  risk: ManagerRisk;
  strengths: string[];
  gaps: string[];
  tnaRequests: ManagerTnaRequest[];
};

const MANAGER_TEAM_REPORTS: ManagerTeamMemberReport[] = [
  {
    id: "marcus",
    name: "Marcus Johnson",
    initials: "MJ",
    role: "Senior Engineer",
    department: "Engineering",
    completion: 82,
    performance: 88,
    learningHours: 34,
    xp: 4200,
    overdue: 1,
    certifications: 3,
    passRate: 91,
    risk: "On Track",
    strengths: ["Cloud architecture", "Mentoring"],
    gaps: ["AI governance"],
    tnaRequests: [
      {
        id: "tna-mj-1",
        skill: "AI Governance Workshop",
        type: "Workshop",
        priority: "High",
        status: "In Review",
        justification: "Needs policy depth before leading model-risk reviews.",
      },
    ],
  },
  {
    id: "priya",
    name: "Priya Nair",
    initials: "PN",
    role: "Marketing Manager",
    department: "Marketing",
    completion: 63,
    performance: 74,
    learningHours: 22,
    xp: 2850,
    overdue: 3,
    certifications: 1,
    passRate: 79,
    risk: "Watch",
    strengths: ["Campaign planning", "Stakeholder updates"],
    gaps: ["Data storytelling", "Campaign analytics"],
    tnaRequests: [
      {
        id: "tna-pn-1",
        skill: "Data Storytelling for Managers",
        type: "Course",
        priority: "High",
        status: "Submitted",
        justification: "Improve dashboard narratives and campaign review quality.",
      },
      {
        id: "tna-pn-2",
        skill: "Campaign Analytics Lab",
        type: "Workshop",
        priority: "Medium",
        status: "Approved",
        justification: "Practice conversion analysis with team data.",
      },
    ],
  },
  {
    id: "carlos",
    name: "Carlos Mendez",
    initials: "CM",
    role: "Product Manager",
    department: "Product",
    completion: 91,
    performance: 86,
    learningHours: 41,
    xp: 5100,
    overdue: 0,
    certifications: 4,
    passRate: 94,
    risk: "On Track",
    strengths: ["Product discovery", "Roadmap planning"],
    gaps: ["Advanced roadmap analytics"],
    tnaRequests: [
      {
        id: "tna-cm-1",
        skill: "Product Analytics Certification",
        type: "Certification",
        priority: "Medium",
        status: "Approved",
        justification: "Support roadmap decisions with stronger product metrics.",
      },
    ],
  },
  {
    id: "aisha",
    name: "Aisha Rahman",
    initials: "AR",
    role: "Finance Analyst",
    department: "Finance",
    completion: 55,
    performance: 69,
    learningHours: 18,
    xp: 2300,
    overdue: 4,
    certifications: 1,
    passRate: 72,
    risk: "Critical",
    strengths: ["Cost tracking", "Forecast preparation"],
    gaps: ["Risk modeling", "Compliance reporting"],
    tnaRequests: [
      {
        id: "tna-ar-1",
        skill: "Financial Risk Modeling",
        type: "Course",
        priority: "High",
        status: "Submitted",
        justification: "Close model validation gaps found in quarterly review.",
      },
      {
        id: "tna-ar-2",
        skill: "Compliance Reporting Workshop",
        type: "Workshop",
        priority: "Medium",
        status: "In Review",
        justification: "Improve evidence quality for compliance submissions.",
      },
    ],
  },
];

const TEAM_TNA_DEMAND = [
  {
    skill: "Data analytics and storytelling",
    requests: 3,
    priority: "High" as ManagerTnaPriority,
    action: "Run a team lab using current dashboards.",
  },
  {
    skill: "Compliance reporting",
    requests: 2,
    priority: "Medium" as ManagerTnaPriority,
    action: "Assign workshop and verify evidence quality.",
  },
  {
    skill: "AI governance",
    requests: 1,
    priority: "High" as ManagerTnaPriority,
    action: "Nominate policy leads for governance training.",
  },
  {
    skill: "Product and roadmap analytics",
    requests: 1,
    priority: "Medium" as ManagerTnaPriority,
    action: "Approve certification for product owner track.",
  },
];

function avgMetric(items: ManagerTeamMemberReport[], key: keyof ManagerTeamMemberReport) {
  return Math.round(
    items.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / Math.max(items.length, 1),
  );
}

function MetricBar({
  value,
  color = P.olive,
  label,
}: {
  value: number;
  color?: string;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full overflow-hidden" style={{ background: P.lightSage }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-[11px] font-semibold w-10 text-right" style={{ color: P.textMid }}>
        {label ?? `${value}%`}
      </span>
    </div>
  );
}

function ManagerBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "danger" | "gold";
}) {
  const styles = {
    neutral: { background: P.paleGreen, color: P.textMid, borderColor: P.border },
    good: { background: "#E3F3D6", color: "#4F7A28", borderColor: "#B9D8A5" },
    warn: { background: P.goldLight, color: "#8A6A1A", borderColor: P.goldMid },
    danger: { background: "#FDE7E4", color: "#B42318", borderColor: "#F5B7B1" },
    gold: { background: P.goldLight, color: "#8A6A1A", borderColor: P.goldMid },
  }[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ border: `1px solid ${styles.borderColor}`, ...styles }}
    >
      {children}
    </span>
  );
}

function riskTone(risk: ManagerRisk): "good" | "warn" | "danger" {
  if (risk === "Critical") return "danger";
  if (risk === "Watch") return "warn";
  return "good";
}

function priorityTone(priority: ManagerTnaPriority): "good" | "warn" | "danger" {
  if (priority === "High") return "danger";
  if (priority === "Medium") return "warn";
  return "good";
}

function statusTone(status: ManagerTnaStatus): "neutral" | "good" | "warn" | "gold" {
  if (status === "Completed") return "good";
  if (status === "Approved") return "gold";
  if (status === "In Review") return "warn";
  return "neutral";
}

export function ManagerTeamReports() {
  const [selectedMemberId, setSelectedMemberId] = useState(MANAGER_TEAM_REPORTS[0].id);
  const [exported, setExported] = useState(false);
  const selectedMember =
    MANAGER_TEAM_REPORTS.find((member) => member.id === selectedMemberId) ??
    MANAGER_TEAM_REPORTS[0];
  const allRequests = MANAGER_TEAM_REPORTS.flatMap((member) =>
    member.tnaRequests.map((request) => ({ ...request, learner: member.name })),
  );
  const highPriorityRequests = allRequests.filter((request) => request.priority === "High").length;
  const overdueItems = MANAGER_TEAM_REPORTS.reduce((sum, member) => sum + member.overdue, 0);

  return (
    <div className="p-6 space-y-6 max-w-[1280px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Team Reports
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            Per-learner performance, training needs, and whole-team readiness analysis
          </p>
        </div>
        <button
          onClick={() => setExported(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm font-medium"
          style={{ border: `1px solid ${P.border}`, color: exported ? P.olive : P.textMid }}
        >
          <Download size={14} />
          {exported ? "Export Ready" : "Export Team Report"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <AnaStatCard
          label="Team Avg. Completion"
          value={`${avgMetric(MANAGER_TEAM_REPORTS, "completion")}%`}
          sub="Across assigned learning"
          trend="up"
          icon={BookOpen}
          color={P.olive}
        />
        <AnaStatCard
          label="Avg. Performance"
          value={`${avgMetric(MANAGER_TEAM_REPORTS, "performance")}%`}
          sub="Course scores and manager review"
          trend="neutral"
          icon={TrendingUp}
          color="#4A7A5A"
        />
        <AnaStatCard
          label="Open TNA Requests"
          value={String(allRequests.filter((request) => request.status !== "Completed").length)}
          sub={`${highPriorityRequests} high priority`}
          trend="neutral"
          icon={Target}
          color={P.gold}
        />
        <AnaStatCard
          label="Overdue Learning"
          value={String(overdueItems)}
          sub="Requires manager follow-up"
          trend={overdueItems > 0 ? "down" : "neutral"}
          icon={AlertCircle}
          color="#C0392B"
        />
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.8fr)] gap-4">
        <section
          className="bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: P.border }}>
            <h2 className="text-sm font-bold" style={{ color: P.text }}>
              Team Member Performance
            </h2>
            <p className="text-[11px]" style={{ color: P.textMuted }}>
              Select a learner to review detailed analysis and TNA history.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-sm">
              <thead style={{ background: P.bg }}>
                <tr
                  className="text-left text-[10px] uppercase tracking-wide"
                  style={{ color: P.textMuted }}
                >
                  <th className="px-4 py-3">Learner</th>
                  <th className="px-3 py-3">Completion</th>
                  <th className="px-3 py-3">Performance</th>
                  <th className="px-3 py-3">Pass Rate</th>
                  <th className="px-3 py-3">XP</th>
                  <th className="px-3 py-3">TNA</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {MANAGER_TEAM_REPORTS.map((member) => {
                  const selected = selectedMember.id === member.id;
                  return (
                    <tr
                      key={member.id}
                      className="border-t"
                      style={{
                        borderColor: P.paleGreen,
                        background: selected ? P.paleGreen : "white",
                      }}
                    >
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedMemberId(member.id)}
                          className="flex items-center gap-3 text-left w-full"
                        >
                          <span
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: P.lightSage, color: P.darkOlive }}
                          >
                            {member.initials}
                          </span>
                          <span>
                            <span className="block font-semibold" style={{ color: P.text }}>
                              {member.name}
                            </span>
                            <span className="block text-[11px]" style={{ color: P.textMuted }}>
                              {member.role} - {member.department}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        <MetricBar value={member.completion} />
                      </td>
                      <td className="px-3 py-3">
                        <MetricBar value={member.performance} color="#4A7A5A" />
                      </td>
                      <td className="px-3 py-3 font-semibold" style={{ color: P.text }}>
                        {member.passRate}%
                      </td>
                      <td className="px-3 py-3" style={{ color: P.textMid }}>
                        {member.xp.toLocaleString()}
                      </td>
                      <td className="px-3 py-3" style={{ color: P.textMid }}>
                        {member.tnaRequests.length} request
                        {member.tnaRequests.length === 1 ? "" : "s"}
                      </td>
                      <td className="px-3 py-3">
                        <ManagerBadge tone={riskTone(member.risk)}>{member.risk}</ManagerBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section
          className="bg-white rounded-xl border p-4 space-y-4"
          style={{ borderColor: P.border }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {selectedMember.initials}
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: P.text }}>
                {selectedMember.name}
              </h2>
              <p className="text-[11px]" style={{ color: P.textMuted }}>
                {selectedMember.role} - {selectedMember.department}
              </p>
              <div className="mt-2">
                <ManagerBadge tone={riskTone(selectedMember.risk)}>
                  {selectedMember.risk}
                </ManagerBadge>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              ["Learning Hours", selectedMember.learningHours],
              ["Certificates", selectedMember.certifications],
              ["Overdue", selectedMember.overdue],
              ["XP", selectedMember.xp.toLocaleString()],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg p-3" style={{ background: P.bg }}>
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  {label}
                </p>
                <p className="text-lg font-bold" style={{ color: P.text }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>
                Strengths
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember.strengths.map((strength) => (
                  <ManagerBadge key={strength} tone="good">
                    {strength}
                  </ManagerBadge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color: P.textMid }}>
                Skill Gaps
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember.gaps.map((gap) => (
                  <ManagerBadge key={gap} tone="warn">
                    {gap}
                  </ManagerBadge>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section
        className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: P.border }}
      >
        <div
          className="px-4 py-3 border-b flex items-center justify-between gap-3 flex-wrap"
          style={{ borderColor: P.border }}
        >
          <div>
            <h2 className="text-sm font-bold" style={{ color: P.text }}>
              TNA Requests by Learner
            </h2>
            <p className="text-[11px]" style={{ color: P.textMuted }}>
              Each request is tracked against the learner who needs support.
            </p>
          </div>
          <ManagerBadge tone="gold">{allRequests.length} total requests</ManagerBadge>
        </div>
        <div className="divide-y" style={{ borderColor: P.paleGreen }}>
          {MANAGER_TEAM_REPORTS.map((member) => (
            <div key={member.id} className="p-4 grid lg:grid-cols-[220px_1fr] gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {member.name}
                </p>
                <p className="text-[11px]" style={{ color: P.textMuted }}>
                  {member.role}
                </p>
              </div>
              <div className="space-y-2">
                {member.tnaRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-lg border p-3 grid md:grid-cols-[minmax(0,1fr)_auto] gap-3"
                    style={{ borderColor: P.border, background: P.bg }}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold" style={{ color: P.text }}>
                          {request.skill}
                        </p>
                        <ManagerBadge tone={priorityTone(request.priority)}>
                          {request.priority}
                        </ManagerBadge>
                        <ManagerBadge tone={statusTone(request.status)}>
                          {request.status}
                        </ManagerBadge>
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: P.textMuted }}>
                        {request.type} - {request.justification}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedMemberId(member.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold h-fit"
                      style={{ background: P.lightSage, color: P.olive }}
                    >
                      View Learner
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="bg-white rounded-xl border overflow-hidden"
        style={{ borderColor: P.border }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: P.border }}>
          <h2 className="text-sm font-bold" style={{ color: P.text }}>
            Whole Team TNA Analysis
          </h2>
          <p className="text-[11px]" style={{ color: P.textMuted }}>
            Consolidated capability gaps and recommended manager actions.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead style={{ background: P.bg }}>
              <tr
                className="text-left text-[10px] uppercase tracking-wide"
                style={{ color: P.textMuted }}
              >
                <th className="px-4 py-3">Capability Gap</th>
                <th className="px-3 py-3">Demand</th>
                <th className="px-3 py-3">Priority</th>
                <th className="px-3 py-3">Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {TEAM_TNA_DEMAND.map((item) => (
                <tr key={item.skill} className="border-t" style={{ borderColor: P.paleGreen }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: P.text }}>
                    {item.skill}
                  </td>
                  <td className="px-3 py-3">
                    <MetricBar
                      value={Math.min(100, item.requests * 28)}
                      label={`${item.requests} req.`}
                      color={item.priority === "High" ? "#C0392B" : P.gold}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <ManagerBadge tone={priorityTone(item.priority)}>{item.priority}</ManagerBadge>
                  </td>
                  <td className="px-3 py-3" style={{ color: P.textMid }}>
                    {item.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
