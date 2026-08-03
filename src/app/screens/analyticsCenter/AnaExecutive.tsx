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

export function AnaExecutive() {
  const roiData = [
    { m: "Q2-24", roi: 142 },
    { m: "Q3-24", roi: 168 },
    { m: "Q4-24", roi: 189 },
    { m: "Q1-25", roi: 214 },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="Total Learners"
          value="1,247"
          sub="+48 this month"
          trend="up"
          icon={Users}
          color={P.olive}
        />
        <AnaStatCard
          label="Active Courses"
          value="48"
          sub="6 added this quarter"
          trend="up"
          icon={BookOpen}
          color="#4A7A5A"
        />
        <AnaStatCard
          label="Active Programs"
          value="5"
          sub="Across 4 departments"
          trend="neutral"
          icon={Layers}
          color={P.gold}
        />
        <AnaStatCard
          label="Cert. Compliance"
          value="89.2%"
          sub="+1.4% vs last qtr"
          trend="up"
          icon={Shield}
          color="#5A7A2A"
        />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="Avg. Completion Rate"
          value="74.8%"
          sub="+3.2% vs last qtr"
          trend="up"
          icon={CheckCircle}
          color={P.darkOlive}
        />
        <AnaStatCard
          label="Workforce Readiness"
          value="72%"
          sub="Target: 80% by Q3"
          trend="up"
          icon={Activity}
          color={P.olive}
        />
        <AnaStatCard
          label="Learning ROI"
          value="214%"
          sub="+25pts vs Q3-24"
          trend="up"
          icon={TrendingUp}
          color="#8A6A1A"
        />
        <AnaStatCard
          label="Top Skill Gap"
          value="AI & Auto."
          sub="38pt gap · Engineering"
          trend="down"
          icon={AlertCircle}
          color="#C0392B"
        />
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <div
          className="lg:col-span-2 bg-white rounded-xl border p-5"
          style={{ borderColor: P.border }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Completion Rate by Department
          </p>
          <ResponsiveContainer width="100%" height={200} className="chart-entrance">
            <ReBarChart data={AC.depts}>
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} />
              <XAxis
                dataKey="d"
                tick={{ fontSize: 10, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={TS} />
              <Bar key="exec-comp" dataKey="completion" name="Completion %" radius={[4, 4, 0, 0]}>
                {AC.depts.map((d) => (
                  <Cell
                    key={`exec-${d.d}`}
                    fill={d.completion >= 80 ? "#5A7A2A" : d.completion >= 70 ? P.gold : "#C0392B"}
                  />
                ))}
              </Bar>
            </ReBarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Learning ROI Trend
          </p>
          <ResponsiveContainer width="100%" height={140} className="chart-entrance">
            <AreaChart data={roiData}>
              <defs>
                <linearGradient id="lg-roi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.gold} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={P.gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={P.lightSage} />
              <XAxis
                dataKey="m"
                tick={{ fontSize: 10, fill: P.textMuted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: P.textMuted }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TS} />
              <Area
                key="roi"
                type="monotone"
                dataKey="roi"
                stroke={P.gold}
                strokeWidth={2}
                fill="url(#lg-roi)"
                name="ROI %"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            <p
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: P.textMuted }}
            >
              Top Skill Gaps
            </p>
            {AC.competencies.slice(0, 3).map((c) => (
              <div key={c.skill} className="flex items-center gap-2">
                <span className="text-[10px] flex-1" style={{ color: P.textMid }}>
                  {c.skill}
                </span>
                <span
                  className="text-[10px] font-bold"
                  style={{ color: c.gap >= 35 ? "#C0392B" : P.gold }}
                >
                  {c.gap}pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
