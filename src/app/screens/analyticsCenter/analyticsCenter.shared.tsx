// Extensions4.tsx — Analytics & Reporting Center
// Moved from Extensions3.tsx to keep bundle under Babel's 500 KB limit.

import React, { useState } from "react";
import {
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  FileText,
  HelpCircle,
  Globe,
  TrendingUp,
  TrendingDown,
  Layers,
  Shield,
  Settings,
  Zap,
  Users,
  Clock,
  RefreshCw,
  Activity,
  Star,
  Bookmark,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const P = {
  olive: "#047857",
  darkOlive: "#065F46",
  deepOlive: "#064E3B",
  sage: "#6EE7B7",
  lightSage: "#D1FAE5",
  paleGreen: "#ECFDF5",
  gold: "#C8A85D",
  goldLight: "#FDF5E0",
  goldMid: "#F0E2B8",
  bg: "#F6FEFA",
  text: "#052E26",
  textMid: "#047857",
  textMuted: "#4B7468",
  border: "#A7F3D0",
};

const AC = {
  monthly: [
    { m: "Jul", enroll: 580, complete: 342, xp: 48200, pass: 79 },
    { m: "Aug", enroll: 640, complete: 410, xp: 52800, pass: 81 },
    { m: "Sep", enroll: 590, complete: 380, xp: 49600, pass: 78 },
    { m: "Oct", enroll: 780, complete: 520, xp: 67400, pass: 83 },
    { m: "Nov", enroll: 730, complete: 490, xp: 63100, pass: 82 },
    { m: "Dec", enroll: 890, complete: 610, xp: 79200, pass: 85 },
    { m: "Jan", enroll: 950, complete: 680, xp: 88400, pass: 87 },
  ],
  depts: [
    { d: "Engineering", completion: 84, learners: 312, xp: 428000, compliance: 91, gap: 22 },
    { d: "Sales", completion: 71, learners: 245, xp: 318000, compliance: 78, gap: 34 },
    { d: "HR", completion: 92, learners: 89, xp: 142000, compliance: 97, gap: 12 },
    { d: "Finance", completion: 78, learners: 134, xp: 196000, compliance: 88, gap: 28 },
    { d: "Marketing", completion: 67, learners: 178, xp: 224000, compliance: 74, gap: 41 },
    { d: "Legal", completion: 95, learners: 62, xp: 108000, compliance: 99, gap: 8 },
    { d: "Operations", completion: 75, learners: 228, xp: 294000, compliance: 82, gap: 31 },
  ],
  courses: [
    {
      name: "AI & ML for Business Leaders",
      category: "Technology",
      completion: 78,
      participation: 91,
      enrolled: 12840,
      rating: 4.9,
      pass: 85,
      lift: 24,
      certificates: 9478,
      avgAttempts: 2.3,
      lastActivity: "Today",
    },
    {
      name: "Data-Driven Leadership",
      category: "Leadership",
      completion: 62,
      participation: 84,
      enrolled: 9320,
      rating: 4.8,
      pass: 79,
      lift: 18,
      certificates: 5410,
      avgAttempts: 2.1,
      lastActivity: "Yesterday",
    },
    {
      name: "Cybersecurity Fundamentals",
      category: "Compliance",
      completion: 91,
      participation: 96,
      enrolled: 24100,
      rating: 4.7,
      pass: 88,
      lift: 31,
      certificates: 21280,
      avgAttempts: 1.8,
      lastActivity: "Today",
    },
    {
      name: "Effective Communication",
      category: "Professional Skills",
      completion: 83,
      participation: 88,
      enrolled: 18200,
      rating: 4.6,
      pass: 92,
      lift: 14,
      certificates: 14110,
      avgAttempts: 1.6,
      lastActivity: "2d ago",
    },
    {
      name: "Financial Modeling & Valuation",
      category: "Finance",
      completion: 55,
      participation: 69,
      enrolled: 6700,
      rating: 4.8,
      pass: 71,
      lift: 28,
      certificates: 3265,
      avgAttempts: 2.8,
      lastActivity: "4d ago",
    },
    {
      name: "Design Thinking Workshop",
      category: "Innovation",
      completion: 70,
      participation: 82,
      enrolled: 8900,
      rating: 4.7,
      pass: 84,
      lift: 19,
      certificates: 5750,
      avgAttempts: 2.0,
      lastActivity: "3d ago",
    },
  ],
  tna: [
    { m: "Sep", free: 12, paid: 6 },
    { m: "Oct", free: 18, paid: 9 },
    { m: "Nov", free: 22, paid: 12 },
    { m: "Dec", free: 19, paid: 11 },
    { m: "Jan", free: 28, paid: 17 },
  ],
  kirkpatrick: [
    { level: "L1 Reaction", score: 4.3, responses: 842 },
    { level: "L2 Learning", score: 73, responses: 634 },
    { level: "L3 Behaviour", score: 61, responses: 289 },
    { level: "L4 Results", score: 48, responses: 94 },
  ],
  certs: [
    { m: "Sep", issued: 42, expired: 8 },
    { m: "Oct", issued: 58, expired: 11 },
    { m: "Nov", issued: 71, expired: 9 },
    { m: "Dec", issued: 63, expired: 14 },
    { m: "Jan", issued: 89, expired: 12 },
  ],
  competencies: [
    { skill: "AI & Automation", gap: 38, demand: 92 },
    { skill: "Data Literacy", gap: 29, demand: 78 },
    { skill: "Leadership", gap: 18, demand: 65 },
    { skill: "Cybersecurity", gap: 24, demand: 84 },
    { skill: "Communication", gap: 12, demand: 55 },
    { skill: "Finance", gap: 21, demand: 61 },
  ],
};

const TS = { background: "white", border: "1px solid #A7F3D0", borderRadius: 8, fontSize: 11 };

function AnaStatCard({
  label,
  value,
  sub,
  trend,
  icon: Icon,
  color = P.olive,
}: {
  label: string;
  value: string;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
          {label}
        </p>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}
        >
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <p
        className="text-xl font-bold"
        style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="text-[10px] mt-1 flex items-center gap-1"
          style={{ color: trend === "up" ? "#5A7A2A" : trend === "down" ? "#C0392B" : P.textMuted }}
        >
          {trend === "up" && <TrendingUp size={9} />}
          {trend === "down" && <TrendingDown size={9} />}
          {sub}
        </p>
      )}
    </div>
  );
}

function ExportBar({
  onBack,
  dateRange,
  setDateRange,
}: {
  onBack: () => void;
  dateRange: string;
  setDateRange: (d: string) => void;
}) {
  const [scheduled, setScheduled] = useState(false);
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm"
        style={{ color: P.textMuted }}
      >
        <ChevronLeft size={16} /> Analytics Center
      </button>
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: P.border }}>
          {["This Week", "This Month", "This Quarter", "This Year"].map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className="px-3 py-1.5 text-xs font-medium"
              style={
                dateRange === d
                  ? { background: P.text, color: "white" }
                  : { background: "white", color: P.textMid }
              }
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          {(["PDF", "Excel", "CSV"] as const).map((f) => (
            <button
              key={f}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium"
              style={{ border: `1px solid ${P.border}`, background: "white", color: P.textMid }}
              data-prototype-action="true"
            >
              <Download size={11} />
              {f}
            </button>
          ))}
          <button
            onClick={() => setScheduled((s) => !s)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors"
            style={{
              border: `1px solid ${scheduled ? P.olive : P.border}`,
              background: scheduled ? P.lightSage : "white",
              color: scheduled ? P.olive : P.textMid,
            }}
          >
            <Clock size={11} />
            {scheduled ? "Scheduled" : "Schedule"}
          </button>
        </div>
      </div>
    </div>
  );
}

export {
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
};
