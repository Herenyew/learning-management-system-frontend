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

export function AnaAssessments() {
  const qPerf = [
    { q: "AI vs ML distinction", attempts: 8420, correct: 74, difficulty: "Medium" },
    { q: "Training/validation split", attempts: 7891, correct: 61, difficulty: "Hard" },
    { q: "Imbalanced dataset metric", attempts: 7234, correct: 58, difficulty: "Hard" },
    { q: "GDPR definition", attempts: 14200, correct: 89, difficulty: "Easy" },
    { q: "SQL JOIN types", attempts: 5618, correct: 72, difficulty: "Medium" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="Total Quiz Attempts"
          value="48,240"
          sub="+12% this month"
          trend="up"
          icon={HelpCircle}
          color={P.gold}
        />
        <AnaStatCard
          label="Avg. Score"
          value="82.3%"
          sub="+1.8% vs prev period"
          trend="up"
          icon={Star}
          color="#5A7A2A"
        />
        <AnaStatCard
          label="Pass Rate"
          value="84.7%"
          sub="+2.1% vs prev period"
          trend="up"
          icon={CheckCircle}
          color={P.olive}
        />
        <AnaStatCard
          label="Avg. Attempts to Pass"
          value="1.4"
          sub="-0.2 vs prev period"
          trend="up"
          icon={RefreshCw}
          color="#4A7A5A"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Pass Rate Trend
          </p>
          <ResponsiveContainer width="100%" height={190} className="chart-entrance">
            <AreaChart data={AC.monthly}>
              <defs>
                <linearGradient id="lg-pass" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5A7A2A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#5A7A2A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} />
              <XAxis
                dataKey="m"
                tick={{ fontSize: 11, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[70, 95]}
                tick={{ fontSize: 11, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TS} />
              <Area
                key="pass"
                type="monotone"
                dataKey="pass"
                stroke="#5A7A2A"
                strokeWidth={2}
                fill="url(#lg-pass)"
                name="Pass Rate %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Pass Rate by Course
          </p>
          <ResponsiveContainer width="100%" height={190} className="chart-entrance">
            <ReBarChart data={AC.courses} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 8, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
                width={140}
              />
              <Tooltip contentStyle={TS} />
              <Bar key="pass-bar" dataKey="pass" name="Pass %" radius={[0, 4, 4, 0]}>
                {AC.courses.map((c) => (
                  <Cell
                    key={`pass-${c.name}`}
                    fill={c.pass >= 80 ? "#5A7A2A" : c.pass >= 70 ? P.gold : "#C0392B"}
                  />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Question Performance Analysis
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {["Question", "Attempts", "Correct Rate", "Difficulty", "Action"].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: P.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {qPerf.map((q) => (
              <tr
                key={q.q}
                className="table-row-interactive"
                style={{ borderBottom: `1px solid ${P.border}40` }}
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-medium" style={{ color: P.text }}>
                    {q.q}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono" style={{ color: P.textMuted }}>
                    {q.attempts.toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-16 h-1.5 rounded-full overflow-hidden"
                      style={{ background: P.lightSage }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${q.correct}%`,
                          background:
                            q.correct >= 75 ? "#5A7A2A" : q.correct >= 60 ? P.gold : "#C0392B",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color:
                          q.correct >= 75 ? "#5A7A2A" : q.correct >= 60 ? "#8A6A1A" : "#C0392B",
                      }}
                    >
                      {q.correct}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background:
                        q.difficulty === "Easy"
                          ? "#D8EDCC"
                          : q.difficulty === "Medium"
                            ? P.goldLight
                            : "#FEE2E2",
                      color:
                        q.difficulty === "Easy"
                          ? "#3A6420"
                          : q.difficulty === "Medium"
                            ? "#8A6A1A"
                            : "#B91C1C",
                    }}
                  >
                    {q.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {q.correct < 65 && (
                    <button
                      className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                      style={{ background: P.goldLight, color: "#8A6A1A" }}
                      data-prototype-action="true"
                    >
                      Review
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
