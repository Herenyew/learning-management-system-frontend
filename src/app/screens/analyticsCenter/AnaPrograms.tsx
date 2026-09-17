import React, { useEffect, useState } from "react";
import { programApi } from "../../API/program.api";
import type { ProgramRuntimeAnalytics } from "../../models/enrollment.model";
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

export function AnaPrograms() {
  const [analytics, setAnalytics] = useState<ProgramRuntimeAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    programApi.runtimeAnalytics(controller.signal)
      .then(setAnalytics)
      .catch((requestError) => {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : "Unable to load analytics.");
        }
      });
    return () => controller.abort();
  }, []);
  const progData = analytics?.programs ?? [];
  const cohortData = progData.flatMap((program) =>
    program.cohortPerformance.map((cohort) => ({
      cohort: `${program.name} — ${cohort.name}`,
      progress: cohort.progress,
      learners: cohort.learners,
    })),
  );
  return (
    <div className="space-y-5">
      {error && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="Active Programs"
          value={(analytics?.summary.activePrograms ?? 0).toLocaleString()}
          sub="currently active"
          trend="up"
          icon={Layers}
          color={P.olive}
        />
        <AnaStatCard
          label="Total Enrolled"
          value={(analytics?.summary.totalEnrolled ?? 0).toLocaleString()}
          sub="across all programs"
          trend="up"
          icon={Users}
          color="#4A7A5A"
        />
        <AnaStatCard
          label="Avg. Completion"
          value={`${analytics?.summary.completionRate ?? 0}%`}
          sub="authoritative completions"
          trend="up"
          icon={CheckCircle}
          color={P.gold}
        />
        <AnaStatCard
          label="Overdue Tasks"
          value={(analytics?.summary.overdueRequirements ?? 0).toLocaleString()}
          sub="enrollments and required tasks"
          trend="down"
          icon={AlertCircle}
          color="#C0392B"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Program Enrollment vs Completion
          </p>
          <ResponsiveContainer width="100%" height={200} className="chart-entrance">
            <ReBarChart data={progData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip contentStyle={TS} />
              <Bar
                key="prog-enroll"
                dataKey="enrolled"
                name="Enrolled"
                fill={P.lightSage}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                key="prog-complete"
                dataKey="completed"
                name="Completed"
                fill={P.olive}
                radius={[0, 4, 4, 0]}
              />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Cohort Performance
          </p>
          <div className="space-y-3">
            {cohortData.map((c) => (
              <div key={c.cohort}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium" style={{ color: P.text }}>
                    {c.cohort}
                  </span>
                  <span style={{ color: P.textMuted }}>
                    {c.learners} learners ·{" "}
                    <strong style={{ color: P.olive }}>{c.progress}%</strong>
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: P.lightSage }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${c.progress}%`,
                      background:
                        c.progress >= 70 ? "#5A7A2A" : c.progress >= 50 ? P.gold : "#C0392B",
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
            Program Summary
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {[
                "Program",
                "Enrolled",
                "Completed",
                "Overdue",
                "Progress",
                "Cohorts",
                "Validation",
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
            {progData.map((p) => (
              <tr
                key={p.name}
                className="table-row-interactive"
                style={{ borderBottom: `1px solid ${P.border}40` }}
              >
                <td className="px-4 py-3">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {p.name}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono" style={{ color: P.text }}>
                    {p.enrolled.toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs font-mono" style={{ color: "#5A7A2A" }}>
                    {p.completed.toLocaleString()}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p
                    className="text-xs font-mono"
                    style={{ color: p.overdue > 0 ? "#C0392B" : P.textMuted }}
                  >
                    {p.overdue}
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
                          width: `${p.progress}%`,
                          background:
                            p.progress >= 70 ? "#5A7A2A" : p.progress >= 50 ? P.gold : "#C0392B",
                        }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold" style={{ color: P.text }}>
                      {p.progress}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {p.cohorts}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: p.status === "ACTIVE" ? "#D8EDCC" : "#FEE2E2",
                      color: p.status === "ACTIVE" ? "#3A6420" : "#B91C1C",
                    }}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
