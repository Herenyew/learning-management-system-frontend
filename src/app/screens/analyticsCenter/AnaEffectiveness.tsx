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

export function AnaEffectiveness() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="Avg. Effectiveness Score"
          value="67.4%"
          sub="+4.2% vs prev quarter"
          trend="up"
          icon={TrendingUp}
          color={P.olive}
        />
        <AnaStatCard
          label="Avg. Learning Lift"
          value="+21.3pts"
          sub="Pre→Post score gain"
          trend="up"
          icon={Activity}
          color="#5A7A2A"
        />
        <AnaStatCard
          label="L1 Reaction Avg."
          value="4.3 / 5"
          sub="842 responses"
          trend="up"
          icon={Star}
          color={P.gold}
        />
        <AnaStatCard
          label="L3 Behaviour"
          value="61%"
          sub="289 manager ratings"
          trend="neutral"
          icon={Users}
          color={P.darkOlive}
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Pre vs Post Assessment Scores by Course
          </p>
          <ResponsiveContainer width="100%" height={200} className="chart-entrance">
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
              <Bar
                key="pre-score"
                dataKey="pass"
                name="Pre-Score"
                fill={P.lightSage}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                key="post-lift"
                dataKey="lift"
                name="Lift"
                fill={P.olive}
                radius={[0, 4, 4, 0]}
                stackId="stack"
              />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Kirkpatrick Level Scores
          </p>
          <div className="space-y-4 mt-2">
            {AC.kirkpatrick.map((k) => (
              <div key={k.level}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-xs font-semibold" style={{ color: P.text }}>
                      {k.level}
                    </span>
                    <span className="text-[10px] ml-2" style={{ color: P.textMuted }}>
                      {k.responses.toLocaleString()} responses
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: k.score >= 70 ? "#5A7A2A" : k.score >= 55 ? P.gold : "#C0392B",
                    }}
                  >
                    {k.level.includes("L1") ? `${k.score}/5` : `${k.score}%`}
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: P.lightSage }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: k.level.includes("L1") ? `${(k.score / 5) * 100}%` : `${k.score}%`,
                      background: k.score >= 70 ? "#5A7A2A" : k.score >= 55 ? P.gold : "#C0392B",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Effectiveness Score by Course
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {["Course", "Pre", "Post", "Lift", "L1 Reaction", "Effectiveness", "Trend"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: P.textMuted }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {AC.courses.map((c) => {
              const pre = c.pass - c.lift;
              const eff = Math.round(
                ((c.lift / 40) * 0.4 + (c.rating / 5) * 0.3 + (c.completion / 100) * 0.3) * 100,
              );
              return (
                <tr
                  key={c.name}
                  className="table-row-interactive"
                  style={{ borderBottom: `1px solid ${P.border}40` }}
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {c.name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono" style={{ color: P.textMuted }}>
                      {pre}%
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono" style={{ color: "#5A7A2A" }}>
                      {c.pass}%
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold" style={{ color: P.gold }}>
                      +{c.lift}pts
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: P.text }}>
                      {c.rating} ⭐
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        background: eff >= 70 ? "#D8EDCC" : eff >= 55 ? P.goldLight : "#FEE2E2",
                        color: eff >= 70 ? "#3A6420" : eff >= 55 ? "#8A6A1A" : "#B91C1C",
                      }}
                    >
                      {eff}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <TrendingUp size={13} style={{ color: "#5A7A2A" }} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
