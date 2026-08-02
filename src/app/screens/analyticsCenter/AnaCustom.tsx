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

export function AnaCustom() {
  const saved = [
    {
      name: "Monthly Compliance Summary",
      type: "Compliance",
      lastRun: "Jan 28, 2025",
      schedule: "Monthly",
    },
    {
      name: "Department Completion Breakdown",
      type: "Completion",
      lastRun: "Jan 15, 2025",
      schedule: "Weekly",
    },
    { name: "TNA Budget Utilisation", type: "TNA", lastRun: "Jan 7, 2025", schedule: "Quarterly" },
    {
      name: "Certificate Expiry Alert",
      type: "Certification",
      lastRun: "Jan 30, 2025",
      schedule: "Weekly",
    },
  ];
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border p-5 space-y-4" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          Report Builder
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            [
              "Report Category",
              [
                "Learning",
                "Program",
                "Assessment",
                "Certification",
                "TNA & Workforce",
                "Effectiveness",
                "Executive",
              ],
            ],
            [
              "Metrics",
              [
                "Completion Rate",
                "Enrollment Count",
                "XP Earned",
                "Pass Rate",
                "Lift Score",
                "Compliance %",
              ],
            ],
            ["Group By", ["Department", "Course", "Program", "Role", "Manager", "Cohort"]],
            [
              "Date Range",
              [
                "This Month",
                "Last Month",
                "This Quarter",
                "Last Quarter",
                "This Year",
                "Custom Range",
              ],
            ],
            [
              "Visualisation",
              ["Bar Chart", "Line Chart", "Area Chart", "Pie Chart", "Table Only", "Scorecard"],
            ],
          ].map(([label, opts]) => (
            <div key={label as string}>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                {label as string}
              </label>
              <select
                className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              >
                {(opts as string[]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Export Format
            </label>
            <div className="flex gap-1.5">
              {["PDF", "Excel", "CSV"].map((f) => (
                <button
                  key={f}
                  className="flex-1 py-2 rounded-lg text-xs font-semibold"
                  style={{
                    background: f === "Excel" ? P.olive : "white",
                    color: f === "Excel" ? "white" : P.textMid,
                    border: `1px solid ${P.border}`,
                  }}
                  data-prototype-action="true"
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: P.olive }}
            data-prototype-action="true"
          >
            <Activity size={14} /> Generate Report
          </button>
          <button
            className="px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <Bookmark size={14} /> Save Report
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Saved Reports
          </p>
        </div>
        {saved.map((r) => (
          <div
            key={r.name}
            className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#F6FEFA] transition-colors"
            style={{ borderBottom: `1px solid ${P.border}50` }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: P.lightSage }}
            >
              <FileText size={14} style={{ color: P.olive }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: P.text }}>
                {r.name}
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                Type: {r.type} · Last run: {r.lastRun} · Schedule: {r.schedule}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                className="px-3 py-1.5 text-xs rounded-lg font-medium flex items-center gap-1"
                style={{ background: P.lightSage, color: P.olive }}
                data-prototype-action="true"
              >
                <Download size={11} /> Run
              </button>
              <button
                className="px-3 py-1.5 text-xs rounded-lg font-medium"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                data-prototype-action="true"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border p-5 space-y-3" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          Schedule a Report
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Report
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              {saved.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Frequency
            </label>
            <select
              className="w-full px-3 py-2 text-sm rounded-lg bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              {["Daily", "Weekly", "Monthly", "Quarterly"].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
              Recipients
            </label>
            <input
              placeholder="email@adiu.com, …"
              className="w-full px-3 py-2 text-sm rounded-lg bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
        </div>
        <button
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          style={{ background: P.olive }}
          data-prototype-action="true"
        >
          <Clock size={14} /> Save Schedule
        </button>
      </div>
    </div>
  );
}
