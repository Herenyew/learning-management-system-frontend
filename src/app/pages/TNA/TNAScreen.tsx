import React from "react";
import { Download, RefreshCw, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart as ReBarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AICard, Chip } from "../../components/common";
import { DEPT_DATA } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";
export function TNAScreen({ navigate }: { navigate: NavigateFn }) {
  const depts = ["Engineering", "Sales", "HR", "Finance", "Marketing"];
  const skillAreas = [
    "Data Literacy",
    "AI & Automation",
    "Leadership",
    "Security",
    "Communication",
    "Finance",
  ];
  const gapMatrix = depts.map((d) => ({
    dept: d,
    gaps: skillAreas.map((s) => ({ skill: s, gap: Math.floor(Math.random() * 40) + 5 })),
  }));

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Training Needs Analysis
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            AI-powered skill gap identification and training prioritization
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-3 py-2 bg-white rounded-lg text-sm flex items-center gap-1.5"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <RefreshCw size={13} /> Refresh
          </button>
          <button
            className="px-3 py-2 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5"
            style={{ background: P.olive }}
            data-prototype-action="true"
          >
            <Download size={13} /> Export TNA
          </button>
        </div>
      </div>

      <AICard title="AI TNA Executive Summary">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            [
              "🔴 Critical Gaps",
              "AI & Automation across Engineering (−38pts) and Marketing (−42pts) represent the highest business risk",
            ],
            [
              "🟡 Watch Areas",
              "Data Literacy in Sales and Finance is improving but still 22pts below industry benchmark",
            ],
            [
              "✅ Strengths",
              "Communication and Leadership skills score above benchmark across 5/7 departments",
            ],
          ].map(([t, d]) => (
            <div key={t as string}>
              <p className="text-xs font-semibold mb-1" style={{ color: "#7A5A10" }}>
                {t as string}
              </p>
              <p className="text-xs" style={{ color: "#8A6A1A" }}>
                {d as string}
              </p>
            </div>
          ))}
        </div>
      </AICard>

      <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
          Skill Gap Heatmap by Department
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr>
                <th
                  className="text-left text-xs font-semibold pb-3 pr-4"
                  style={{ color: P.textMuted }}
                >
                  Department
                </th>
                {skillAreas.map((s) => (
                  <th
                    key={s}
                    className="text-center text-[10px] font-semibold pb-3 px-2 whitespace-nowrap"
                    style={{ color: P.textMuted }}
                  >
                    {s}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gapMatrix.map(({ dept, gaps }) => (
                <tr key={dept}>
                  <td className="text-xs font-medium pr-4 py-2" style={{ color: P.textMid }}>
                    {dept}
                  </td>
                  {gaps.map(({ skill, gap }) => {
                    const bg =
                      gap < 15
                        ? "#D8EDCC"
                        : gap < 25
                          ? P.goldLight
                          : gap < 35
                            ? "#F5E0C0"
                            : "#FECACA";
                    const color =
                      gap < 15
                        ? "#3A6420"
                        : gap < 25
                          ? "#8A6A1A"
                          : gap < 35
                            ? "#9A4A12"
                            : "#7F1D1D";
                    return (
                      <td key={skill} className="px-2 py-2 text-center">
                        <div
                          className="inline-flex items-center justify-center w-12 h-8 rounded text-[11px] font-bold hover:opacity-80 transition-opacity"
                          style={{ background: bg, color }}
                        >
                          {gap}pts
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 mt-3 text-[10px]" style={{ color: P.textMuted }}>
          {[
            ["#D8EDCC", "<15pts Minimal"],
            [P.goldLight, "15-25pts Moderate"],
            ["#F5E0C0", "25-35pts High"],
            ["#FECACA", ">35pts Critical"],
          ].map(([bg, label]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ background: bg }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: P.text }}
          >
            <Sparkles size={14} style={{ color: P.gold }} /> AI Training Recommendations
          </p>
          <div className="space-y-3">
            {[
              {
                priority: "P1",
                label: "AI & Automation Bootcamp",
                dept: "Engineering, Marketing",
                impact: "High",
                color: "#C0392B",
              },
              {
                priority: "P2",
                label: "Data Literacy for Sales",
                dept: "Sales, Finance",
                impact: "High",
                color: P.gold,
              },
              {
                priority: "P3",
                label: "Security Compliance Refresh",
                dept: "All departments",
                impact: "Medium",
                color: "#5A7A2A",
              },
              {
                priority: "P4",
                label: "Advanced Leadership Program",
                dept: "Management Track",
                impact: "Medium",
                color: P.olive,
              },
            ].map(({ priority, label, dept, impact, color }) => (
              <div
                key={label}
                className="flex items-start gap-3 p-3 rounded-xl border hover:bg-[#F6FEFA] transition-colors"
                style={{ borderColor: P.border }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: color }}
                >
                  {priority}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {label}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                    {dept}
                  </p>
                  <div className="mt-1.5">
                    <Chip
                      label={`Impact: ${impact}`}
                      variant={impact === "High" ? "red" : "gold"}
                    />
                  </div>
                </div>
                <button
                  onClick={() => navigate("catalog")}
                  className="text-[10px] font-medium flex-shrink-0"
                  style={{ color: P.olive }}
                >
                  Find courses →
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Department Skill Comparison
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <ReBarChart data={DEPT_DATA} layout="vertical">
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
                dataKey="dept"
                tick={{ fontSize: 11, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
                width={75}
              />
              <Tooltip
                key="tip"
                contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${P.border}` }}
              />
              <Bar
                key="completion-h"
                dataKey="completion"
                name="Completion %"
                radius={[0, 4, 4, 0]}
              >
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
    </div>
  );
}

// ─── 13. ANALYTICS ────────────────────────────────────────────
