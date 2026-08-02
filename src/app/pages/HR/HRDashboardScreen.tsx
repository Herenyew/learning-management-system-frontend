import React from "react";
import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  Clock,
  Download,
  Layers,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RePieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AICard, Chip, PBar, StatCard } from "../../components/common";
import { COMPLETION_TREND, DEPT_DATA, PIE_DATA } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
export function HRDashboardScreen({ navigate }: { navigate: NavigateFn }) {
  return (
    <div className="p-6 pb-10 space-y-5 max-w-[1400px]">
      <section
        className="relative overflow-hidden rounded-[22px] border"
        style={{
          borderColor: "#C9D4AA",
          background: P.deepOlive,
          boxShadow: "0 18px 50px rgba(46, 58, 21, 0.18)",
        }}
      >
        <div className="absolute inset-x-0 top-0 h-28" style={{ background: P.olive }} />
        <div className="relative p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white"
                  style={{ background: P.gold, boxShadow: "0 8px 20px rgba(0,0,0,0.16)" }}
                >
                  HR
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                    Real-time administration
                  </p>
                  <h1
                    className="text-2xl sm:text-3xl font-bold text-white"
                    style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                  >
                    Admin Learning Dashboard
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.12)", color: "white" }}
                data-prototype-action="true"
              >
                <Download size={14} /> Export
              </button>
              <button
                onClick={() => navigate("analytics-center")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold"
                style={{ background: "white", color: P.deepOlive }}
              >
                <BarChart2 size={14} /> Full Reports
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-7">
            {[
              ["Total Learners", "1,247", "+48 this month", Users],
              ["Avg. Completion", "74.8%", "+3.2% vs last quarter", CheckCircle],
              ["Compliance Rate", "89.2%", "103 overdue", Shield],
              ["Learning Hours", "18,420h", "+2,100h this month", Clock],
            ].map(([label, value, sub, Icon]) => {
              const MetricIcon = Icon as React.ElementType;
              return (
                <div
                  key={label as string}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(255,255,255,0.55)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold" style={{ color: P.textMuted }}>
                        {label as string}
                      </p>
                      <p
                        className="text-2xl font-bold mt-1"
                        style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                      >
                        {value as string}
                      </p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: P.lightSage }}
                    >
                      <MetricIcon size={16} style={{ color: P.olive }} />
                    </div>
                  </div>
                  <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "#5A7A2A" }}>
                    <TrendingUp size={11} /> {sub as string}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="hidden">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            HR Learning Dashboard
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            ADIU Communication Service PLC · 1,247 employees · Real-time
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => navigate("analytics")}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <BarChart2 size={14} /> Full Reports
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Workforce Readiness"
          value="82%"
          sub="8 pts from target"
          icon={Target}
          color={P.olive}
          bg={P.lightSage}
          trend="up"
        />
        <StatCard
          label="Active Programs"
          value="13"
          sub="5 high priority"
          icon={Layers}
          color="#5A7A2A"
          bg="#D8EDCC"
          trend="up"
        />
        <StatCard
          label="Overdue Actions"
          value="103"
          sub="requires follow-up"
          icon={AlertCircle}
          color="#C0392B"
          bg="#FEE2E2"
          trend="down"
        />
        <StatCard
          label="Learning Velocity"
          value="+12%"
          sub="month over month"
          icon={TrendingUp}
          color={P.gold}
          bg={P.goldLight}
          trend="up"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 bg-white rounded-2xl border p-5"
          style={{ borderColor: P.border, boxShadow: "0 8px 24px rgba(46, 58, 21, 0.06)" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-sm font-bold" style={{ color: P.text }}>
                Enrollment vs Completion Trend
              </p>
              <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                Monthly learner participation and completed outcomes
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1" style={{ color: P.textMid }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: P.olive }} />
                Enrollments
              </span>
              <span className="flex items-center gap-1" style={{ color: P.textMid }}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: P.gold }} />
                Completions
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={COMPLETION_TREND}>
              <defs>
                <linearGradient id="gEnroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.olive} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={P.olive} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gComplete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.gold} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={P.gold} stopOpacity={0} />
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
                  fontSize: 12,
                }}
              />
              <Area
                key="enrollments"
                type="monotone"
                dataKey="enrollments"
                stroke={P.olive}
                strokeWidth={2}
                fill="url(#gEnroll)"
                name="Enrollments"
              />
              <Area
                key="completions"
                type="monotone"
                dataKey="completions"
                stroke={P.gold}
                strokeWidth={2}
                fill="url(#gComplete)"
                name="Completions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div
          className="bg-white rounded-2xl border p-5"
          style={{ borderColor: P.border, boxShadow: "0 8px 24px rgba(46, 58, 21, 0.06)" }}
        >
          <p className="text-sm font-bold mb-4" style={{ color: P.text }}>
            Learning Format Breakdown
          </p>
          <ResponsiveContainer width="100%" height={140}>
            <RePieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                dataKey="value"
                strokeWidth={0}
              >
                {PIE_DATA.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </RePieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {PIE_DATA.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                  <span style={{ color: P.textMid }}>{name}</span>
                </div>
                <span className="font-medium" style={{ color: P.text }}>
                  {value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 bg-white rounded-2xl border overflow-hidden"
          style={{ borderColor: P.border, boxShadow: "0 8px 24px rgba(46, 58, 21, 0.06)" }}
        >
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: P.text }}>
                Department Health
              </p>
              <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                Completion readiness by learner population
              </p>
            </div>
            <button
              onClick={() => navigate("analytics-center")}
              className="text-xs font-semibold"
              style={{ color: P.olive }}
            >
              Full Report
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
                {["Department", "Learners", "Completion", "Status"].map((h) => (
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
              {DEPT_DATA.map(({ dept, completion, learners }) => (
                <tr
                  key={dept}
                  className="table-row-interactive"
                  style={{ borderBottom: `1px solid ${P.border}50` }}
                >
                  <td className="px-5 py-3">
                    <p className="text-xs font-medium" style={{ color: P.text }}>
                      {dept}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      {learners}
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <PBar
                          value={completion}
                          color={
                            completion >= 80 ? "#5A7A2A" : completion >= 70 ? P.gold : "#C0392B"
                          }
                          height={5}
                        />
                      </div>
                      <span
                        className="text-xs font-semibold w-8 text-right"
                        style={{ color: P.text }}
                      >
                        {completion}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Chip
                      label={
                        completion >= 80 ? "On Track" : completion >= 70 ? "At Risk" : "Behind"
                      }
                      variant={completion >= 80 ? "sage" : completion >= 70 ? "gold" : "red"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <AICard title="AI HR Insight">
            <p className="text-xs leading-relaxed mb-3" style={{ color: "#7A5A10" }}>
              <strong>Marketing</strong> (67%) and <strong>Sales</strong> (71%) are below the 75%
              target. I recommend deploying a targeted learning campaign with manager-assigned
              mandatory content.
            </p>
            <button
              onClick={() => navigate("analytics-center")}
              className="text-xs font-semibold flex items-center gap-1"
              style={{ color: "#8A6A1A" }}
            >
              Generate campaign plan <Sparkles size={11} />
            </button>
          </AICard>
          <div
            className="bg-white rounded-2xl border p-4"
            style={{ borderColor: P.border, boxShadow: "0 8px 24px rgba(46, 58, 21, 0.06)" }}
          >
            <p className="text-sm font-bold mb-3" style={{ color: P.text }}>
              Compliance Alerts
            </p>
            <div className="space-y-2.5">
              {[
                ["GDPR Annual Training", 34, true],
                ["Code of Conduct", 12, false],
                ["Data Security 2025", 57, true],
              ].map(([label, overdue, urgent]) => (
                <div
                  key={label as string}
                  className="p-2.5 rounded-lg"
                  style={{
                    background: urgent ? "#FEF2F2" : P.goldLight,
                    border: `1px solid ${urgent ? "#FECACA" : `${P.gold}30`}`,
                  }}
                >
                  <p className="text-xs font-medium" style={{ color: P.text }}>
                    {label as string}
                  </p>
                  <p
                    className="text-[10px] mt-0.5 font-medium"
                    style={{ color: urgent ? "#C0392B" : "#8A6A1A" }}
                  >
                    {overdue as number} learners overdue
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 12. TNA ──────────────────────────────────────────────────
