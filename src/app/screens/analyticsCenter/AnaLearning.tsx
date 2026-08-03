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

export function AnaLearning() {
  void [
    { range: "0–999", count: 284 },
    { range: "1k–2.9k", count: 412 },
    { range: "3k–5.9k", count: 318 },
    { range: "6k–9.9k", count: 164 },
    { range: "10k+", count: 69 },
  ];
  const courseReports = AC.courses.map((course) => {
    const completed = Math.round((course.enrolled * course.completion) / 100);
    const active = Math.round((course.enrolled * course.participation) / 100);

    return {
      ...course,
      completed,
      active,
      pending: course.enrolled - completed,
      inactive: course.enrolled - active,
    };
  });
  const totalEnrolled = courseReports.reduce((sum, course) => sum + course.enrolled, 0);
  const totalCompleted = courseReports.reduce((sum, course) => sum + course.completed, 0);
  const totalCertificates = courseReports.reduce((sum, course) => sum + course.certificates, 0);
  const avgCompletion =
    courseReports.reduce((sum, course) => sum + course.completion, 0) / courseReports.length;
  const avgParticipation =
    courseReports.reduce((sum, course) => sum + course.participation, 0) / courseReports.length;
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <AnaStatCard
          label="Course Enrollments"
          value={totalEnrolled.toLocaleString()}
          sub={`${AC.courses.length} active courses`}
          trend="up"
          icon={Users}
          color={P.olive}
        />
        <AnaStatCard
          label="Avg. Completion"
          value={`${avgCompletion.toFixed(1)}%`}
          sub={`${totalCompleted.toLocaleString()} completions`}
          trend="up"
          icon={CheckCircle}
          color="#5A7A2A"
        />
        <AnaStatCard
          label="Avg. Participation"
          value={`${avgParticipation.toFixed(1)}%`}
          sub="Active learners per enrolled"
          trend="up"
          icon={Activity}
          color={P.gold}
        />
        <AnaStatCard
          label="Certificates Issued"
          value={totalCertificates.toLocaleString()}
          sub="From tracked courses"
          trend="neutral"
          icon={Award}
          color={P.darkOlive}
        />
        <AnaStatCard
          label="Avg. Quiz Score"
          value={`${Math.round(
            courseReports.reduce((sum, course) => sum + course.pass, 0) / courseReports.length,
          )}%`}
          sub="Across course assessments"
          trend="up"
          icon={HelpCircle}
          color="#4A7A5A"
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Enrollment vs Completion — Monthly Trend
          </p>
          <ResponsiveContainer width="100%" height={200} className="chart-entrance">
            <AreaChart data={AC.monthly}>
              <defs>
                <linearGradient id="lg-enroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.olive} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={P.olive} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lg-complete" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.gold} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={P.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} />
              <XAxis
                dataKey="m"
                tick={{ fontSize: 11, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 11, fill: P.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TS} />
              <Area
                key="enroll"
                type="monotone"
                dataKey="enroll"
                stroke={P.olive}
                strokeWidth={2}
                fill="url(#lg-enroll)"
                name="Enrollments"
              />
              <Area
                key="complete"
                type="monotone"
                dataKey="complete"
                stroke={P.gold}
                strokeWidth={2}
                fill="url(#lg-complete)"
                name="Completions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Completion & Participation by Course
          </p>
          <ResponsiveContainer width="100%" height={200} className="chart-entrance">
            <ReBarChart data={courseReports} layout="vertical">
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
                key="course-completion"
                dataKey="completion"
                name="Completion %"
                radius={[0, 0, 0, 0]}
                fill={P.olive}
              />
              <Bar
                key="course-participation"
                dataKey="participation"
                name="Participation %"
                radius={[0, 4, 4, 0]}
                fill={P.gold}
              />
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
            Course-Level Completion & Participation Report
          </p>
          <span className="text-[11px]" style={{ color: P.textMuted }}>
            {courseReports.length} courses tracked
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
                {[
                  "Course",
                  "Enrolled",
                  "Completed",
                  "Pending",
                  "Participation",
                  "Avg Score",
                  "Attempts",
                  "Certificates",
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
              {courseReports.map((course) => (
                <tr
                  key={course.name}
                  className="hover:bg-[#F6FEFA] transition-colors"
                  style={{ borderBottom: `1px solid ${P.border}40` }}
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {course.name}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {course.category} - Last activity {course.lastActivity}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono" style={{ color: P.text }}>
                      {course.enrolled.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono font-semibold" style={{ color: "#5A7A2A" }}>
                      {course.completed.toLocaleString()}
                    </p>
                    <div
                      className="mt-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: P.lightSage }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${course.completion}%`, background: "#5A7A2A" }}
                      />
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                      {course.completion}% complete
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono" style={{ color: P.text }}>
                      {course.pending.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-24 h-1.5 rounded-full overflow-hidden"
                        style={{ background: P.lightSage }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${course.participation}%`, background: P.gold }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold" style={{ color: P.gold }}>
                        {course.participation}%
                      </span>
                    </div>
                    <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                      {course.active.toLocaleString()} active
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono font-semibold" style={{ color: P.text }}>
                      {course.pass}%
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono" style={{ color: P.text }}>
                      {course.avgAttempts.toFixed(1)} avg
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono font-semibold" style={{ color: P.darkOlive }}>
                      {course.certificates.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
              {false &&
                [
                  ["Aisha Rahman", "Engineering", 28, "14,820", "Master", "🔥 22d", 96],
                  ["Carlos Mendez", "Product", 25, "13,640", "Master", "🔥 18d", 91],
                  ["Yuki Tanaka", "Design", 24, "12,910", "Expert", "🔥 14d", 88],
                  ["Alex Mercer", "Engineering", 21, "11,250", "Expert", "🔥 14d", 84],
                  ["Fatima Al-Hassan", "Finance", 20, "10,800", "Expert", "🔥 9d", 80],
                ].map(([name, dept, courses, xp, level, streak, pct]) => (
                  <tr
                    key={name as string}
                    className="hover:bg-[#F6FEFA] transition-colors"
                    style={{ borderBottom: `1px solid ${P.border}40` }}
                  >
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {name as string}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs" style={{ color: P.textMuted }}>
                        {dept as string}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-mono" style={{ color: P.text }}>
                        {courses as number}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-bold font-mono" style={{ color: P.gold }}>
                        {xp as string}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: P.lightSage, color: P.darkOlive }}
                      >
                        {level as string}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs">{streak as string}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex-1 h-1.5 rounded-full overflow-hidden"
                          style={{ background: P.lightSage }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, background: "#5A7A2A" }}
                          />
                        </div>
                        <span
                          className="text-[10px] font-semibold w-7 text-right"
                          style={{ color: "#5A7A2A" }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
