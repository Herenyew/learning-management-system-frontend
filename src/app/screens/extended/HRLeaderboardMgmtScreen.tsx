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

import {
  HR_LEADERBOARD_DATA,
  HR_METRIC_HEADERS,
  HR_PROGRAMS,
  METRIC_DEFS,
  PREVIEW_DATA,
  formatMetricScore,
  getMetricExtra,
  getMetricScore,
  type LeaderboardConfig,
  type LeaderboardMetric,
  type ProgramLbCriteria,
} from "./hrLeaderboard.data";

export function HRLeaderboardMgmtScreen({
  navigate,
  lbConfig,
  setLbConfig,
  programLbConfig,
  setProgramLbConfig,
}: {
  navigate: (s: string) => void;
  lbConfig: LeaderboardConfig;
  setLbConfig: (c: LeaderboardConfig) => void;
  programLbConfig: Record<string, ProgramLbCriteria>;
  setProgramLbConfig: (c: Record<string, ProgramLbCriteria>) => void;
}) {
  const [tab, setTab] = useState<"analytics" | "global" | "per-program">("analytics");
  const [previewMetric, setPreviewMetric] = useState<LeaderboardMetric>(lbConfig.primary);
  const [analyticsProgram, setAnalyticsProgram] = useState(HR_PROGRAMS[0]);
  const [analyticsMetric, setAnalyticsMetric] = useState<LeaderboardMetric>(lbConfig.primary);
  const [analyticsPeriod, setAnalyticsPeriod] = useState("Month");
  const [resetPeriod, setResetPeriod] = useState("Monthly");
  const [visibility, setVisibility] = useState("Company-wide");
  const [savedPg, setSavedPg] = useState<string | null>(null);

  const analyticsCfg = programLbConfig[analyticsProgram] ?? {
    xp: lbConfig.xp,
    completion: lbConfig.completion,
    performance: lbConfig.performance,
    primary: lbConfig.primary,
  };
  const analyticsMetrics = (["xp", "completion", "performance"] as const).filter(
    (metric) => analyticsCfg[metric],
  );
  const activeAnalyticsMetric = analyticsMetrics.includes(analyticsMetric)
    ? analyticsMetric
    : (analyticsMetrics[0] ?? lbConfig.primary);
  const analyticsRows = [...(HR_LEADERBOARD_DATA[analyticsProgram] ?? [])].sort(
    (a, b) => getMetricScore(b, activeAnalyticsMetric) - getMetricScore(a, activeAnalyticsMetric),
  );
  const analyticsTopThree = analyticsRows.slice(0, 3);
  const analyticsAverage =
    analyticsRows.length === 0
      ? 0
      : Math.round(
          analyticsRows.reduce((sum, row) => sum + getMetricScore(row, activeAnalyticsMetric), 0) /
            analyticsRows.length,
        );
  const topDept = analyticsRows.reduce<Record<string, number>>((counts, row) => {
    counts[row.dept] = (counts[row.dept] ?? 0) + 1;
    return counts;
  }, {});
  const leadingDept =
    Object.entries(topDept).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "No department";
  const atRiskCount = analyticsRows.filter(
    (row) =>
      (activeAnalyticsMetric === "xp" && row.xp < 2500) ||
      (activeAnalyticsMetric === "completion" && row.completion < 80) ||
      (activeAnalyticsMetric === "performance" && row.performance < 80),
  ).length;
  const podiumColors = [P.olive, P.gold, P.sage];
  const podiumOrder = [1, 0, 2];

  function updatePgMetric(pg: string, key: LeaderboardMetric, val: boolean) {
    const cur = programLbConfig[pg] ?? {
      xp: false,
      completion: false,
      performance: false,
      primary: "xp",
    };
    const updated = { ...cur, [key]: val };
    // if disabling the primary, pick the next enabled one
    if (key === cur.primary && !val) {
      const next = (["xp", "completion", "performance"] as const).find(
        (k) => k !== key && updated[k],
      );
      updated.primary = next ?? "xp";
    }
    // if enabling and no other metric is enabled, make it primary
    if (val && !cur.xp && !cur.completion && !cur.performance) updated.primary = key;
    setProgramLbConfig({ ...programLbConfig, [pg]: updated });
  }

  function setPrimary(pg: string, key: LeaderboardMetric) {
    const cur = programLbConfig[pg] ?? {
      xp: false,
      completion: false,
      performance: false,
      primary: "xp",
    };
    setProgramLbConfig({ ...programLbConfig, [pg]: { ...cur, [key]: true, primary: key } });
  }

  function saveProgram(pg: string) {
    setSavedPg(pg);
    setTimeout(() => setSavedPg(null), 2000);
  }

  function setGlobalPrimary(key: LeaderboardMetric) {
    setLbConfig({ ...lbConfig, [key]: true, primary: key });
    setPreviewMetric(key);
  }

  function updateGlobalMetric(key: LeaderboardMetric, enabled: boolean) {
    const next = { ...lbConfig, [key]: enabled };
    if (key === lbConfig.primary && !enabled) {
      next.primary =
        (["xp", "completion", "performance"] as const).find((metric) =>
          metric === key ? false : next[metric],
        ) ?? key;
      next[next.primary] = true;
    }
    setLbConfig(next);
  }

  function applyDefaultToAllPrograms() {
    const nextConfig = Object.fromEntries(
      HR_PROGRAMS.map((pg) => {
        const cur = programLbConfig[pg] ?? {
          xp: lbConfig.xp,
          completion: lbConfig.completion,
          performance: lbConfig.performance,
          primary: lbConfig.primary,
        };
        return [pg, { ...cur, [lbConfig.primary]: true, primary: lbConfig.primary }];
      }),
    ) as Record<string, ProgramLbCriteria>;
    setProgramLbConfig(nextConfig);
  }

  return (
    <div className="p-6 space-y-5 max-w-[1100px]">
      <PageHeader
        title="HR Leaderboard"
        sub="Preview learner rankings and configure the default leaderboard basis"
      />

      {/* Tab switcher */}
      <div
        className="flex gap-1.5"
        style={{ borderBottom: `1px solid ${P.border}`, paddingBottom: 0 }}
      >
        {[
          ["analytics", "Leaderboard Analytics"],
          ["per-program", "Per-Program Configuration"],
          ["global", "Default Basis & Preview"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as "analytics" | "global" | "per-program")}
            className="px-4 py-2.5 text-xs font-semibold rounded-t-lg"
            style={
              tab === id
                ? {
                    background: "white",
                    color: P.olive,
                    borderBottom: `2px solid ${P.olive}`,
                    marginBottom: -1,
                  }
                : { color: P.textMuted }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Per-Program Configuration ── */}
      {tab === "analytics" && (
        <div className="space-y-5">
          <div className="grid md:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  Participants
                </p>
                <Users size={16} style={{ color: P.olive }} />
              </div>
              <p
                className="mt-2 text-2xl font-bold"
                style={{ color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {analyticsRows.length}
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                tracked learners
              </p>
            </div>

            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  Average
                </p>
                <BarChart2 size={16} style={{ color: P.gold }} />
              </div>
              <p
                className="mt-2 text-2xl font-bold"
                style={{ color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {activeAnalyticsMetric === "xp"
                  ? `${analyticsAverage.toLocaleString()} XP`
                  : `${analyticsAverage}%`}
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                group benchmark
              </p>
            </div>

            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  Leading Team
                </p>
                <Building size={16} style={{ color: P.sage }} />
              </div>
              <p
                className="mt-2 text-2xl font-bold truncate"
                style={{ color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {leadingDept}
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                strongest presence
              </p>
            </div>

            <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  Needs Review
                </p>
                <AlertCircle size={16} style={{ color: atRiskCount > 0 ? "#B86B34" : P.olive }} />
              </div>
              <p
                className="mt-2 text-2xl font-bold"
                style={{ color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                {atRiskCount}
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                below HR threshold
              </p>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border p-4 space-y-4"
            style={{ borderColor: P.border }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  Program Leaderboard Analytics
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  HR view of learner rankings and leaderboard health
                </p>
              </div>
              <div className="flex gap-1">
                {["Week", "Month", "Quarter", "All Time"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setAnalyticsPeriod(period)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={
                      analyticsPeriod === period
                        ? { background: P.olive, color: "white" }
                        : {
                            background: "white",
                            color: P.textMid,
                            border: `1px solid ${P.border}`,
                          }
                    }
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: P.textMid }}>
                Program:
              </span>
              {HR_PROGRAMS.map((program) => (
                <button
                  key={program}
                  onClick={() => {
                    const nextCfg = programLbConfig[program] ?? {
                      xp: lbConfig.xp,
                      completion: lbConfig.completion,
                      performance: lbConfig.performance,
                      primary: lbConfig.primary,
                    };
                    setAnalyticsProgram(program);
                    setAnalyticsMetric(nextCfg.primary);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={
                    analyticsProgram === program
                      ? { background: P.deepOlive, color: "white" }
                      : {
                          background: "white",
                          color: P.textMid,
                          border: `1px solid ${P.border}`,
                        }
                  }
                >
                  {program}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {analyticsMetrics.length === 0 ? (
                  <div
                    className="px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: P.goldLight, color: "#7A5A10" }}
                  >
                    No learner-visible metric is enabled for this program.
                  </div>
                ) : (
                  METRIC_DEFS.filter((metric) => analyticsMetrics.includes(metric.key)).map(
                    (metric) => (
                      <button
                        key={metric.key}
                        onClick={() => setAnalyticsMetric(metric.key)}
                        className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
                        style={
                          activeAnalyticsMetric === metric.key
                            ? { background: P.olive, color: "white" }
                            : {
                                background: "white",
                                color: P.textMid,
                                border: `1px solid ${P.border}`,
                              }
                        }
                      >
                        <span>{metric.icon}</span>
                        <span>By {metric.label}</span>
                        {analyticsCfg.primary === metric.key && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px]"
                            style={{
                              background:
                                activeAnalyticsMetric === metric.key
                                  ? "rgba(255,255,255,.22)"
                                  : P.lightSage,
                              color: activeAnalyticsMetric === metric.key ? "white" : P.darkOlive,
                            }}
                          >
                            Default
                          </span>
                        )}
                      </button>
                    ),
                  )
                )}
              </div>
              <button
                onClick={() => setTab("per-program")}
                className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2"
                style={{ background: P.lightSage, color: P.darkOlive }}
              >
                <Settings size={14} />
                Configure Criteria
              </button>
            </div>
          </div>

          <div className="grid xl:grid-cols-[minmax(0,1fr)_280px] gap-4">
            <div
              className="bg-white rounded-xl border overflow-hidden"
              style={{ borderColor: P.border }}
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    {analyticsProgram}
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {analyticsRows.length} participants - {analyticsPeriod}
                  </p>
                </div>
                <div
                  className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: P.paleGreen, color: P.textMid }}
                >
                  <Zap size={13} style={{ color: P.gold }} />
                  By {METRIC_DEFS.find((metric) => metric.key === activeAnalyticsMetric)?.label}
                </div>
              </div>

              <div className="px-5 pb-6">
                <div
                  className="rounded-xl min-h-[330px] p-5 flex items-end justify-center gap-8"
                  style={{ background: "#FCFDF8", border: `1px solid ${P.border}` }}
                >
                  {analyticsTopThree.length === 0 ? (
                    <div className="text-sm" style={{ color: P.textMuted }}>
                      Enable a leaderboard metric to preview rankings.
                    </div>
                  ) : (
                    podiumOrder.map((podiumIndex) => {
                      const entry = analyticsTopThree[podiumIndex];
                      if (!entry) return null;
                      const rank = podiumIndex + 1;
                      const isWinner = rank === 1;
                      return (
                        <div
                          key={entry.name}
                          className="flex flex-col items-center"
                          style={{ marginBottom: isWinner ? 26 : 0 }}
                        >
                          {isWinner && <Sparkles size={24} style={{ color: "#9ACD32" }} />}
                          <div className="relative">
                            <Av
                              initials={entry.avatar}
                              size={isWinner ? 78 : 66}
                              color={podiumColors[podiumIndex]}
                            />
                            <span
                              className="absolute -right-1 -top-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{ background: podiumColors[podiumIndex] }}
                            >
                              {rank}
                            </span>
                          </div>
                          <p
                            className="mt-3 text-sm font-semibold text-center"
                            style={{ color: P.text }}
                          >
                            {entry.name}
                          </p>
                          <p className="mt-1 text-xs text-center" style={{ color: P.textMuted }}>
                            {entry.dept}
                          </p>
                          <div
                            className="mt-3 w-[104px] h-[98px] rounded-t-xl flex flex-col items-center justify-center gap-2"
                            style={{
                              background:
                                rank === 1 ? P.paleGreen : rank === 2 ? "#FFF8EA" : "#F7F9F1",
                              border: `1px solid ${rank === 2 ? P.goldMid : P.border}`,
                            }}
                          >
                            {rank === 1 ? (
                              <Trophy size={24} style={{ color: P.gold }} />
                            ) : (
                              <Medal size={22} style={{ color: rank === 2 ? P.gold : P.sage }} />
                            )}
                            <p
                              className="text-xs font-bold text-center"
                              style={{ color: rank === 2 ? P.gold : P.olive }}
                            >
                              {formatMetricScore(entry, activeAnalyticsMetric)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    HR Watchlist
                  </p>
                  <Eye size={16} style={{ color: P.olive }} />
                </div>
                <div className="space-y-3">
                  {analyticsRows
                    .slice(-3)
                    .reverse()
                    .map((entry) => (
                      <div
                        key={entry.name}
                        className="p-3 rounded-lg flex items-center gap-3"
                        style={{ background: P.paleGreen }}
                      >
                        <Av initials={entry.avatar} size={34} color={P.sage} />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                            {entry.name}
                          </p>
                          <p className="text-[10px]" style={{ color: P.textMuted }}>
                            {entry.dept}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold" style={{ color: P.text }}>
                            {formatMetricScore(entry, activeAnalyticsMetric)}
                          </p>
                          <p className="text-[10px]" style={{ color: P.textMuted }}>
                            review
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div
                className="rounded-xl border p-4"
                style={{ background: P.goldLight, borderColor: `${P.gold}55` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target size={16} style={{ color: P.gold }} />
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    Analytics Insight
                  </p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>
                  {atRiskCount > 0
                    ? `${atRiskCount} learner${atRiskCount > 1 ? "s are" : " is"} below the HR review threshold for this metric.`
                    : "All tracked learners are above the HR review threshold for this metric."}
                </p>
              </div>
            </div>
          </div>

          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                Full Rankings - {analyticsProgram}
              </p>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: P.paleGreen, color: P.textMid }}
              >
                {METRIC_DEFS.find((metric) => metric.key === activeAnalyticsMetric)?.label}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                    {HR_METRIC_HEADERS[activeAnalyticsMetric].map((header) => (
                      <th
                        key={header}
                        className="px-5 py-3 text-left text-[11px] font-bold uppercase"
                        style={{ color: P.textMuted }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analyticsRows.map((entry, index) => (
                    <tr key={entry.name} style={{ borderBottom: `1px solid ${P.border}80` }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: P.olive }}>
                            #{index + 1}
                          </span>
                          {entry.trend === "up" && (
                            <TrendingUp size={13} style={{ color: P.olive }} />
                          )}
                          {entry.trend === "down" && (
                            <TrendingDown size={13} style={{ color: "#B86B34" }} />
                          )}
                          {entry.trend === "same" && (
                            <span
                              className="w-3 h-[2px] rounded-full"
                              style={{ background: P.sage }}
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Av
                            initials={entry.avatar}
                            size={34}
                            color={index === 0 ? P.olive : index === 1 ? P.gold : P.sage}
                          />
                          <span className="text-sm font-semibold" style={{ color: P.text }}>
                            {entry.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: P.textMid }}>
                        {entry.dept}
                      </td>
                      <td className="px-5 py-3 text-sm font-bold" style={{ color: P.text }}>
                        {formatMetricScore(entry, activeAnalyticsMetric)}
                      </td>
                      <td className="px-5 py-3 text-sm" style={{ color: P.textMid }}>
                        {entry.courses}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold" style={{ color: P.textMid }}>
                        {getMetricExtra(entry, activeAnalyticsMetric)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "per-program" && (
        <div className="space-y-4">
          <div
            className="p-3.5 rounded-xl flex items-start gap-2.5"
            style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
          >
            <span className="text-base flex-shrink-0">💡</span>
            <p className="text-xs leading-relaxed" style={{ color: "#7A5A10" }}>
              Configure which ranking criteria are visible to learners for each program. Enable one
              or more metrics per program and set a <strong>Primary</strong> metric — that is the
              default tab learners see when they open the leaderboard.
            </p>
          </div>

          {/* Config table */}
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                Program Criteria Configuration
              </p>
              <div
                className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wide"
                style={{ color: P.textMuted }}
              >
                {METRIC_DEFS.map((m) => (
                  <span key={m.key} className="flex items-center gap-1 w-24 justify-center">
                    {m.icon} {m.label}
                  </span>
                ))}
                <span className="w-20 text-center">Primary</span>
                <span className="w-16" />
              </div>
            </div>

            {HR_PROGRAMS.map((pg, i) => {
              const cfg = programLbConfig[pg] ?? {
                xp: false,
                completion: false,
                performance: false,
                primary: "xp",
              };
              const enabledCount = [cfg.xp, cfg.completion, cfg.performance].filter(Boolean).length;
              return (
                <div
                  key={pg}
                  style={{
                    borderBottom: i < HR_PROGRAMS.length - 1 ? `1px solid ${P.border}` : undefined,
                    background: savedPg === pg ? `${P.lightSage}60` : undefined,
                    transition: "background 400ms ease",
                  }}
                >
                  <div className="px-5 py-4 flex items-center gap-4">
                    {/* Program info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {pg}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                        {enabledCount === 0
                          ? "⚠️ No criteria enabled — leaderboard hidden from learners"
                          : `${enabledCount} metric${enabledCount > 1 ? "s" : ""} active · Primary: ${METRIC_DEFS.find((m) => m.key === cfg.primary)?.label}`}
                      </p>
                    </div>

                    {/* Metric toggles */}
                    {METRIC_DEFS.map((m) => (
                      <div key={m.key} className="w-24 flex items-center justify-center">
                        <label className="flex flex-col items-center gap-1.5 cursor-pointer">
                          <div className="relative">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={cfg[m.key]}
                              onChange={(e) => updatePgMetric(pg, m.key, e.target.checked)}
                            />
                            <div
                              className="w-9 h-5 rounded-full transition-colors duration-200 flex items-center"
                              style={{
                                background: cfg[m.key] ? P.olive : P.border,
                                padding: "2px",
                              }}
                            >
                              <div
                                className="w-4 h-4 bg-white rounded-full shadow transition-transform duration-200"
                                style={{
                                  transform: cfg[m.key] ? "translateX(16px)" : "translateX(0)",
                                }}
                              />
                            </div>
                          </div>
                          <span
                            className="text-[9px]"
                            style={{ color: cfg[m.key] ? P.darkOlive : P.textMuted }}
                          >
                            {cfg[m.key] ? "On" : "Off"}
                          </span>
                        </label>
                      </div>
                    ))}

                    {/* Primary selector */}
                    <div className="w-20 flex flex-col items-center gap-1">
                      <select
                        value={cfg.primary}
                        onChange={(e) =>
                          setPrimary(pg, e.target.value as "xp" | "completion" | "performance")
                        }
                        className="text-[10px] rounded-lg px-1.5 py-1 font-medium focus:outline-none cursor-pointer"
                        style={{
                          background: P.lightSage,
                          color: P.darkOlive,
                          border: `1px solid ${P.sage}60`,
                        }}
                      >
                        {METRIC_DEFS.filter((m) => cfg[m.key]).map((m) => (
                          <option key={m.key} value={m.key}>
                            {m.label}
                          </option>
                        ))}
                        {enabledCount === 0 && (
                          <option value={cfg.primary} disabled>
                            None
                          </option>
                        )}
                      </select>
                      <span className="text-[9px]" style={{ color: P.textMuted }}>
                        default tab
                      </span>
                    </div>

                    {/* Save */}
                    <div className="w-16 flex justify-end">
                      <button
                        onClick={() => saveProgram(pg)}
                        className="px-2.5 py-1.5 text-[10px] font-semibold rounded-lg"
                        style={{
                          background: savedPg === pg ? "#5A7A2A" : P.olive,
                          color: "white",
                          transition: "background 300ms ease",
                        }}
                      >
                        {savedPg === pg ? "✓ Saved" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick stats summary */}
          <div className="grid grid-cols-3 gap-3">
            {METRIC_DEFS.map((m) => {
              const count = HR_PROGRAMS.filter((pg) => (programLbConfig[pg] ?? {})[m.key]).length;
              const primaryCount = HR_PROGRAMS.filter(
                (pg) =>
                  (programLbConfig[pg] ?? {}).primary === m.key &&
                  (programLbConfig[pg] ?? {})[m.key],
              ).length;
              return (
                <div
                  key={m.key}
                  className="bg-white rounded-xl border p-4"
                  style={{ borderColor: P.border }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{m.icon}</span>
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {m.label}
                    </p>
                  </div>
                  <p
                    className="text-2xl font-bold mb-1"
                    style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                  >
                    {count}
                    <span className="text-sm font-normal" style={{ color: P.textMuted }}>
                      /{HR_PROGRAMS.length}
                    </span>
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    programs enabled ·{" "}
                    <span style={{ color: P.olive }}>{primaryCount} use as primary</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Global Settings & Preview ── */}
      {tab === "global" && (
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Live preview */}
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div
              className="px-5 py-3.5 flex items-center justify-between"
              style={{ borderBottom: `1px solid ${P.border}` }}
            >
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                Live Preview
              </p>
              <div className="flex gap-1">
                {METRIC_DEFS.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setPreviewMetric(m.key)}
                    className="px-2 py-1 text-[10px] rounded-md font-medium"
                    style={
                      previewMetric === m.key
                        ? { background: P.olive, color: "white" }
                        : { background: P.bg, color: P.textMid }
                    }
                  >
                    {m.icon} {m.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 space-y-2.5">
              {PREVIEW_DATA[previewMetric].map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: entry.rank === 1 ? P.lightSage : P.bg }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: entry.rank === 1 ? P.olive : entry.rank === 2 ? P.gold : P.sage,
                      color: "white",
                    }}
                  >
                    {entry.rank}
                  </div>
                  <Av initials={entry.av} size={30} color={entry.rank === 1 ? P.olive : P.sage} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                      {entry.name}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {entry.dept}
                    </p>
                  </div>
                  <p
                    className="text-xs font-bold font-mono"
                    style={{ color: entry.rank === 1 ? P.olive : P.textMid }}
                  >
                    {entry.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Global settings */}
          <div
            className="bg-white rounded-xl border p-5 space-y-5"
            style={{ borderColor: P.border }}
          >
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Global Settings
            </p>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Default Learner Basis
              </p>
              <p className="text-[10px] mb-3" style={{ color: P.textMuted }}>
                This is the metric learners see first when they open the leaderboard.
              </p>
              <div className="grid gap-2">
                {METRIC_DEFS.map(({ key, label, desc, icon }) => (
                  <button
                    key={key}
                    onClick={() => setGlobalPrimary(key)}
                    className="p-3 rounded-lg text-left transition-colors"
                    style={{
                      background: lbConfig.primary === key ? P.lightSage : P.bg,
                      border: `1px solid ${lbConfig.primary === key ? P.sage : P.border}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-semibold" style={{ color: P.text }}>
                          {label}
                        </p>
                        <p className="text-[10px]" style={{ color: P.textMuted }}>
                          {desc}
                        </p>
                      </div>
                      <span
                        className="w-4 h-4 rounded-full border flex items-center justify-center"
                        style={{
                          borderColor: lbConfig.primary === key ? P.olive : P.border,
                          background: lbConfig.primary === key ? P.olive : "white",
                        }}
                      >
                        {lbConfig.primary === key && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={applyDefaultToAllPrograms}
                className="mt-3 w-full py-2 rounded-lg text-xs font-semibold"
                style={{ background: P.olive, color: "white" }}
              >
                Apply {METRIC_DEFS.find((m) => m.key === lbConfig.primary)?.label} as default for
                all programs
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Metrics Available to Learners
              </p>
              <div className="space-y-2">
                {METRIC_DEFS.map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center justify-between p-2.5 rounded-lg cursor-pointer"
                    style={{
                      background: lbConfig[key] ? P.lightSage : P.bg,
                      border: `1px solid ${lbConfig[key] ? P.sage : P.border}`,
                    }}
                  >
                    <span className="text-xs font-medium" style={{ color: P.textMid }}>
                      {label}
                    </span>
                    <input
                      type="checkbox"
                      checked={lbConfig[key]}
                      onChange={(e) => updateGlobalMetric(key, e.target.checked)}
                      style={{ accentColor: P.olive, width: 15, height: 15 }}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Visibility
              </p>
              {[
                ["Company-wide", "All employees see full leaderboard"],
                ["Department-only", "Employees see only their dept."],
                ["Anonymous", "Names hidden, only scores visible"],
              ].map(([opt, desc]) => (
                <label
                  key={opt}
                  className="flex items-start gap-3 p-3 rounded-lg mb-1.5 cursor-pointer"
                  style={{ background: visibility === opt ? P.lightSage : P.bg }}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === opt}
                    onChange={() => setVisibility(opt)}
                    style={{ accentColor: P.olive, marginTop: 2 }}
                  />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {opt}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Reset Period
              </p>
              <div className="flex gap-2">
                {["Weekly", "Monthly", "Quarterly", "Never"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setResetPeriod(p)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: resetPeriod === p ? P.olive : "white",
                      color: resetPeriod === p ? "white" : P.textMid,
                      border: `1px solid ${resetPeriod === p ? P.olive : P.border}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 9. CERTIFICATE ADMINISTRATION
// ─────────────────────────────────────────────────────────────
