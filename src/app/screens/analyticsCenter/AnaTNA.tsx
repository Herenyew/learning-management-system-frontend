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

export function AnaTNA() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="TNA Requests (YTD)"
          value="312"
          sub="+45 this month"
          trend="up"
          icon={FileText}
          color={P.olive}
        />
        <AnaStatCard
          label="Approved"
          value="241"
          sub="77.2% approval rate"
          trend="up"
          icon={CheckCircle}
          color="#5A7A2A"
        />
        <AnaStatCard
          label="Avg. Approval Time"
          value="4.2d"
          sub="-1.1d vs last quarter"
          trend="up"
          icon={Clock}
          color={P.gold}
        />
        <AnaStatCard
          label="Unaddressed Gaps"
          value="7"
          sub="High-risk skill areas"
          trend="down"
          icon={AlertCircle}
          color="#C0392B"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            TNA Requests — Free vs Paid
          </p>
          <ResponsiveContainer width="100%" height={190} className="chart-entrance">
            <ReBarChart data={AC.tna}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} />
              <XAxis
                dataKey="m"
                tick={{ fontSize: 11, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: P.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TS} />
              <Bar
                key="tna-free"
                dataKey="free"
                name="Free"
                fill={P.lightSage}
                radius={[2, 2, 0, 0]}
              />
              <Bar key="tna-paid" dataKey="paid" name="Paid" fill={P.gold} radius={[2, 2, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Competency Gap vs Demand
          </p>
          <ResponsiveContainer width="100%" height={190} className="chart-entrance">
            <ReBarChart data={AC.competencies} layout="vertical">
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
                dataKey="skill"
                tick={{ fontSize: 9, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip contentStyle={TS} />
              <Bar
                key="comp-gap"
                dataKey="gap"
                name="Gap Score"
                fill="#C0392B"
                radius={[0, 2, 2, 0]}
              />
              <Bar
                key="comp-demand"
                dataKey="demand"
                name="Demand Score"
                fill={P.olive}
                radius={[0, 2, 2, 0]}
              />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Department Training Demand & Gap Closure
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {[
                "Department",
                "Requests",
                "Budget Used",
                "Gap Score",
                "Closure Rate",
                "Training Impact",
              ].map((h) => (
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
            {AC.depts.map((d) => (
              <tr
                key={d.d}
                className="table-row-interactive"
                style={{ borderBottom: `1px solid ${P.border}40` }}
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {d.d}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono" style={{ color: P.textMuted }}>
                    {Math.round(d.learners * 0.4)}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono" style={{ color: P.text }}>
                    ${(d.learners * 380).toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: d.gap >= 35 ? "#FEE2E2" : d.gap >= 20 ? P.goldLight : "#D8EDCC",
                      color: d.gap >= 35 ? "#B91C1C" : d.gap >= 20 ? "#8A6A1A" : "#3A6420",
                    }}
                  >
                    {d.gap}pts
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-16 h-1.5 rounded-full overflow-hidden"
                      style={{ background: P.lightSage }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${100 - d.gap}%`, background: "#5A7A2A" }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: "#5A7A2A" }}>
                      {100 - d.gap}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <div
                        key={s}
                        className="w-2 h-2 rounded-sm"
                        style={{
                          background: s <= Math.round((100 - d.gap) / 20) ? P.olive : P.border,
                        }}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
