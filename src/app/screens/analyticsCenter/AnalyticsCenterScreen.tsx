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

import { AnaAssessments } from "./AnaAssessments";
import { AnaCertifications } from "./AnaCertifications";
import { AnaCustom } from "./AnaCustom";
import { AnaEffectiveness } from "./AnaEffectiveness";
import { AnaExecutive } from "./AnaExecutive";
import { AnaLearning } from "./AnaLearning";
import { AnaPrograms } from "./AnaPrograms";
import { AnaTNA } from "./AnaTNA";
import { ManagerTeamReports } from "./ManagerTeamReports";

export function AnalyticsCenterScreen({
  navigate,
  role,
}: {
  navigate: (s: string) => void;
  role?: "learner" | "hr" | "manager" | "creator" | "admin";
}) {
  type AnaSub =
    | "learning"
    | "programs"
    | "assessments"
    | "certifications"
    | "tna"
    | "effectiveness"
    | "executive"
    | "custom";
  const [sub, setSub] = useState<AnaSub | null>(null);
  const [dateRange, setDateRange] = useState("This Month");

  if (role === "manager") {
    return <ManagerTeamReports />;
  }

  const CARDS: {
    id: AnaSub;
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
    desc: string;
    kpi: string;
    kpiLabel: string;
    items: string[];
  }[] = [
    {
      id: "learning",
      label: "Learning Analytics",
      icon: BookOpen,
      color: P.olive,
      bg: P.lightSage,
      kpi: "74.8%",
      kpiLabel: "Avg. Completion",
      desc: "Learner progress, course completion, XP, and level distribution",
      items: [
        "Learner Progress",
        "Course Completion",
        "XP Analytics",
        "Level Distribution",
        "Learning History",
      ],
    },
    {
      id: "programs",
      label: "Program Analytics",
      icon: Layers,
      color: "#4A7A5A",
      bg: "#D8EDCC",
      kpi: "47.4%",
      kpiLabel: "Avg. Completion",
      desc: "Enrollment, completion, overdue tasks, cohort performance",
      items: [
        "Enrollment",
        "Completion",
        "Overdue Tasks",
        "Cohort Performance",
        "Validation Status",
      ],
    },
    {
      id: "assessments",
      label: "Assessment Analytics",
      icon: HelpCircle,
      color: "#8A6A1A",
      bg: P.goldMid,
      kpi: "84.7%",
      kpiLabel: "Pass Rate",
      desc: "Quiz scores, pass rates, attempt counts, question performance",
      items: [
        "Quiz Analytics",
        "Avg. Scores",
        "Pass Rates",
        "Attempt Counts",
        "Question Performance",
      ],
    },
    {
      id: "certifications",
      label: "Certification Analytics",
      icon: Award,
      color: P.darkOlive,
      bg: P.lightSage,
      kpi: "312",
      kpiLabel: "Active Certs",
      desc: "Issued, active, expired certificates, renewal, compliance",
      items: [
        "Issued Certificates",
        "Active Certs",
        "Expired",
        "Renewal Tracking",
        "Compliance Status",
      ],
    },
    {
      id: "tna",
      label: "TNA & Workforce Analytics",
      icon: Target,
      color: P.gold,
      bg: P.goldLight,
      kpi: "77.2%",
      kpiLabel: "Approval Rate",
      desc: "TNA requests, competency gaps, gap closure, training impact",
      items: [
        "TNA Requests",
        "Department Demand",
        "Competency Gaps",
        "Gap Closure Rate",
        "Training Impact",
      ],
    },
    {
      id: "effectiveness",
      label: "Effectiveness Analytics",
      icon: TrendingUp,
      color: "#5A7A2A",
      bg: "#D8EDCC",
      kpi: "67.4%",
      kpiLabel: "Effectiveness Score",
      desc: "Pre/post assessments, learning lift, Kirkpatrick L1–L3",
      items: [
        "Pre-Course Results",
        "Post-Course Results",
        "Learning Lift",
        "Kirkpatrick L1",
        "Kirkpatrick L2",
        "Kirkpatrick L3",
      ],
    },
    {
      id: "executive",
      label: "Executive Dashboard",
      icon: BarChart2,
      color: P.olive,
      bg: P.lightSage,
      kpi: "214%",
      kpiLabel: "Learning ROI",
      desc: "Top-level KPIs: learners, completion, compliance, workforce readiness, ROI",
      items: [
        "Total Learners",
        "Active Courses",
        "Completion Rates",
        "Cert. Compliance",
        "Workforce Readiness",
        "Learning ROI",
      ],
    },
    {
      id: "custom",
      label: "Custom Reports",
      icon: Settings,
      color: P.textMid,
      bg: P.paleGreen,
      kpi: "—",
      kpiLabel: "Build Report",
      desc: "Report builder, saved reports, export PDF/Excel/CSV, scheduled delivery",
      items: ["Report Builder", "Saved Reports", "Export Reports", "Scheduled Reports"],
    },
  ];

  const CONTENT: Record<AnaSub, React.ReactNode> = {
    learning: <AnaLearning />,
    programs: <AnaPrograms />,
    assessments: <AnaAssessments />,
    certifications: <AnaCertifications />,
    tna: <AnaTNA />,
    effectiveness: <AnaEffectiveness />,
    executive: <AnaExecutive />,
    custom: <AnaCustom />,
  };

  if (sub) {
    const card = CARDS.find((c) => c.id === sub)!;
    return (
      <div className="p-6 space-y-5 max-w-[1400px]">
        <ExportBar onBack={() => setSub(null)} dateRange={dateRange} setDateRange={setDateRange} />
        <div>
          <h1
            className="text-lg font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {card.label}
          </h1>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {card.items.map((item) => (
              <span
                key={item}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: P.lightSage, color: P.darkOlive }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        {CONTENT[sub]}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Analytics & Reporting Center
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            Centralised analytics for HR and Administrators — select a category to explore
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg text-sm font-medium"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          data-prototype-action="true"
        >
          <Download size={14} /> Export All
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CARDS.map(({ id, label, icon: Icon, color, bg, desc, kpi, kpiLabel, items }) => (
          <button
            key={id}
            onClick={() => setSub(id)}
            className="bg-white rounded-xl border p-5 text-left group fade-in-up"
            style={{
              borderColor: P.border,
              transition:
                "transform 200ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, border-color 200ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translateY(-5px) scale(1.018)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "0 10px 28px rgba(4,120,87,0.14)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#6EE7B7";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#A7F3D0";
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={20} style={{ color }} />
              </div>
              <div className="text-right">
                <p
                  className="text-lg font-bold leading-none"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color }}
                >
                  {kpi}
                </p>
                <p
                  className="text-[9px] font-medium uppercase tracking-wide mt-0.5"
                  style={{ color: P.textMuted }}
                >
                  {kpiLabel}
                </p>
              </div>
            </div>
            <p className="text-sm font-bold mb-1" style={{ color: P.text }}>
              {label}
            </p>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: P.textMuted }}>
              {desc}
            </p>
            <div className="flex flex-wrap gap-1 mb-3">
              {items.slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: bg, color }}
                >
                  {item}
                </span>
              ))}
              {items.length > 3 && (
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: P.bg, color: P.textMuted }}
                >
                  +{items.length - 3} more
                </span>
              )}
            </div>
            <p
              className="text-[11px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
              style={{ color }}
            >
              Open Report <ChevronRight size={11} />
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
