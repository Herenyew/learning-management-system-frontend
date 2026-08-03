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

export function AnaCertifications() {
  const certStatus = [
    { name: "Active", value: 312, color: "#5A7A2A" },
    { name: "Expiring Soon", value: 48, color: P.gold },
    { name: "Expired", value: 89, color: "#C0392B" },
    { name: "Pending", value: 24, color: P.sage },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AnaStatCard
          label="Issued (All Time)"
          value="473"
          sub="+89 this month"
          trend="up"
          icon={Award}
          color={P.olive}
        />
        <AnaStatCard
          label="Active Certificates"
          value="312"
          sub="66% of all issued"
          trend="neutral"
          icon={CheckCircle}
          color="#5A7A2A"
        />
        <AnaStatCard
          label="Expiring in 30d"
          value="48"
          sub="Requires action"
          trend="down"
          icon={AlertCircle}
          color={P.gold}
        />
        <AnaStatCard
          label="Compliance Rate"
          value="89.2%"
          sub="+1.4% vs last quarter"
          trend="up"
          icon={Shield}
          color={P.darkOlive}
        />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Certificate Issuance Trend
          </p>
          <ResponsiveContainer width="100%" height={190} className="chart-entrance">
            <AreaChart data={AC.certs}>
              <defs>
                <linearGradient id="lg-cert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P.olive} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={P.olive} stopOpacity={0} />
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
                key="cert-issued"
                type="monotone"
                dataKey="issued"
                stroke={P.olive}
                strokeWidth={2}
                fill="url(#lg-cert)"
                name="Issued"
              />
              <Area
                key="cert-expired"
                type="monotone"
                dataKey="expired"
                stroke="#C0392B"
                strokeWidth={2}
                fill="transparent"
                name="Expired"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Certificate Status Breakdown
          </p>
          <ResponsiveContainer width="100%" height={140} className="chart-entrance">
            <PieChart>
              <Pie
                data={certStatus}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={65}
                dataKey="value"
                strokeWidth={0}
              >
                {certStatus.map((s) => (
                  <Cell key={`cert-${s.name}`} fill={s.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TS} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {certStatus.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-[10px]" style={{ color: P.textMid }}>
                  {s.name}
                </span>
                <span className="text-[10px] font-bold ml-auto" style={{ color: P.text }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Renewal Tracking
          </p>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
              {["Learner", "Department", "Certificate", "Expiry", "Days Left", "Status"].map(
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
            {[
              [
                "Marcus Johnson",
                "Product",
                "Compliance Attestation",
                "Dec 5, 2025",
                163,
                "Expiring Soon",
              ],
              ["Priya Nair", "Marketing", "GDPR Training", "Jan 14, 2026", 203, "Expiring Soon"],
              ["Luca Ferrari", "Sales", "Data Privacy 2022", "Mar 10, 2023", -500, "Expired"],
              ["Ben Ostrowski", "HR", "Leadership Cert", "Feb 28, 2026", 248, "Active"],
            ].map(([name, dept, cert, exp, days, status]) => (
              <tr
                key={name as string}
                className="table-row-interactive"
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
                  <p className="text-xs" style={{ color: P.textMid }}>
                    {cert as string}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                    {exp as string}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p
                    className="text-xs font-bold font-mono"
                    style={{
                      color:
                        (days as number) < 0
                          ? "#C0392B"
                          : (days as number) < 90
                            ? P.gold
                            : "#5A7A2A",
                    }}
                  >
                    {(days as number) < 0 ? "Expired" : `${days}d`}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background:
                        status === "Active"
                          ? "#D8EDCC"
                          : status === "Expiring Soon"
                            ? P.goldLight
                            : "#FEE2E2",
                      color:
                        status === "Active"
                          ? "#3A6420"
                          : status === "Expiring Soon"
                            ? "#8A6A1A"
                            : "#B91C1C",
                    }}
                  >
                    {status as string}
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
