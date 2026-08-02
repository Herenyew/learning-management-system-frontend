import React, { useState } from "react";
import { Download, Share2, Star, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Av, Chip } from "../../components/common";
import { COURSES, DEPT_DATA, MONTHLY_LINE } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
export function AnalyticsScreen() {
  const [reportType, setReportType] = useState("Completion");
  const [dateRange, setDateRange] = useState("This Month");

  return (
    <div className="p-6 space-y-5 max-w-[1400px]">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Reports & Analytics
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            Enterprise learning intelligence dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <Download size={13} /> Export CSV
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <Share2 size={13} /> Share
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1.5">
          {["Completion", "Engagement", "Skills", "Compliance", "ROI"].map((t) => (
            <button
              key={t}
              onClick={() => setReportType(t)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={
                reportType === t
                  ? { background: P.olive, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-1.5">
          {["This Week", "This Month", "This Quarter", "This Year"].map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={
                dateRange === d
                  ? { background: P.text, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Completion Rate", "74.8%", "+3.2%"],
          ["Avg. Time to Complete", "5.4 hrs", "−0.8hrs"],
          ["Learner Satisfaction", "4.6/5", "+0.2"],
          ["Training ROI", "340%", "+28%"],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
            <p className="text-[11px] font-medium mb-2" style={{ color: P.textMuted }}>
              {l}
            </p>
            <p
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              {v}
            </p>
            <p className="text-xs flex items-center gap-1 font-medium" style={{ color: "#5A7A2A" }}>
              <TrendingUp size={11} /> {c} vs prev.
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            {reportType} Rate — Monthly Trend
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_LINE}>
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
                domain={[50, 90]}
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
              <Line
                key="value"
                type="monotone"
                dataKey="value"
                stroke={P.olive}
                strokeWidth={2.5}
                dot={{ fill: P.olive, r: 3 }}
                name={`${reportType} %`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            By Department
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <ReBarChart data={DEPT_DATA}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke={P.lightSage} />
              <XAxis
                key="x"
                dataKey="dept"
                tick={{ fontSize: 10, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                key="y"
                domain={[0, 100]}
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
              <Bar key="completion-v" dataKey="completion" radius={[4, 4, 0, 0]}>
                {DEPT_DATA.map((entry) => (
                  <Cell
                    key={`cell-${entry.dept}`}
                    fill={
                      entry.completion >= 80
                        ? "#5A7A2A"
                        : entry.completion >= 70
                          ? P.gold
                          : "#C0392B"
                    }
                  />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Detailed Report — {reportType}
          </p>
          <div className="flex gap-2 text-xs" style={{ color: P.olive }}>
            {["CSV", "PDF", "PPT"].map((f) => (
              <button key={f} className="hover:underline" data-prototype-action="true">
                {f}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {["Course", "Enrolled", "Completed", "Rate", "Avg. Score", "Satisfaction"].map(
                (h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {COURSES.slice(0, 5).map((c) => (
              <tr
                key={c.id}
                className="table-row-interactive"
                style={{ borderBottom: `1px solid ${P.border}50` }}
              >
                <td className="px-5 py-3">
                  <p className="text-xs font-medium line-clamp-1" style={{ color: P.text }}>
                    {c.title}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {c.enrolled.toLocaleString()}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {Math.round(c.enrolled * 0.74).toLocaleString()}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <Chip
                    label={`${Math.floor(Math.random() * 20 + 65)}%`}
                    variant={c.rating >= 4.8 ? "sage" : "gold"}
                  />
                </td>
                <td className="px-5 py-3">
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {(78 + Math.random() * 12).toFixed(0)}%
                  </p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <p className="text-xs font-medium" style={{ color: P.text }}>
                      {c.rating}
                    </p>
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

// ─── 14. CREATOR ──────────────────────────────────────────────
