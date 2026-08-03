import React, { useEffect, useState } from "react";
import {
  AICard,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Badge,
  Bar,
  BarChart2,
  BookOpen,
  Bot,
  Building,
  CERT_TEMPLATES,
  Calendar,
  CartesianGrid,
  Cell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ConfigPublishing,
  Copy,
  Cpu,
  Download,
  Edit,
  EditableSelect,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Input,
  Layers,
  Link,
  Lock,
  MODERATION_ITEMS,
  Medal,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAMS_DATA,
  PROGRAM_TASKS_INITIAL,
  PROGRAM_TEMPLATE_LIBRARY,
  PROGRAM_TYPE_DEFAULTS,
  PUBLISHING_QUEUE,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SCORM_PACKAGES,
  Search,
  Select,
  Send,
  Settings,
  Shield,
  Signature,
  Sparkles,
  Stamp,
  Star,
  StatCard,
  TEAM_MEMBERS,
  TNA_DEPT_DATA,
  TNA_REQUESTS,
  TNA_TREND,
  Target,
  Textarea,
  ToggleLeft,
  ToggleRight,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wand2,
  X,
  XAxis,
  YAxis,
  Zap,
} from "./extended.shared";
import type { Screen } from "../../models/app.model";
import type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
} from "./extended.shared";

export function HRXPConfigScreen({
  navigate,
}: {
  navigate: (s: Screen) => void;
}): import("react").JSX.Element {
  const [saved, setSaved] = useState(false);

  return (
    <div className="p-6 space-y-5 max-w-[900px]">
      <PageHeader
        title="XP & Gamification Configuration"
        sub="Configure experience points, thresholds, and completion requirements"
      />

      {saved && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{ background: "#D8EDCC", border: `1px solid #A8C890` }}
        >
          <CheckCircle size={15} style={{ color: "#3A6420" }} />
          <p className="text-xs font-semibold" style={{ color: "#3A6420" }}>
            Configuration saved successfully.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Course XP */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: P.text }}
          >
            <BookOpen size={16} style={{ color: P.olive }} /> Course XP Settings
          </p>
          <div className="space-y-4">
            {[
              ["Base XP per Course Completion", "450", "XP"],
              ["Bonus XP for 100% Score", "100", "XP"],
              ["Streak Bonus (per day)", "15", "XP"],
              ["Early Completion Bonus", "50", "XP"],
            ].map(([label, val, unit]) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={val}
                    className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <span className="text-xs font-medium px-2" style={{ color: P.textMuted }}>
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program XP */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: P.text }}
          >
            <Layers size={16} style={{ color: P.gold }} /> Program & Quiz XP
          </p>
          <div className="space-y-4">
            {[
              ["Base XP per Program Completion", "1200", "XP"],
              ["Quiz Score XP (per %pt above pass)", "5", "XP"],
              ["Program Streak Bonus", "200", "XP"],
              ["Perfect Quiz Score Bonus", "150", "XP"],
            ].map(([label, val, unit]) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={val}
                    className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <span className="text-xs font-medium px-2" style={{ color: P.textMuted }}>
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion requirements */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: P.text }}
          >
            <CheckCircle size={16} style={{ color: "#5A7A2A" }} /> Completion Requirements
          </p>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Minimum Completion Threshold
              </p>
              <div className="flex gap-2">
                {["60%", "70%", "80%", "90%", "100%"].map((p) => (
                  <button
                    key={p}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium flex-1"
                    style={{
                      background: p === "80%" ? P.olive : "white",
                      color: p === "80%" ? "white" : P.textMid,
                      border: `1px solid ${p === "80%" ? P.olive : P.border}`,
                    }}
                    data-prototype-action="true"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            {[
              ["Quiz Pass Threshold", "70", "%"],
              ["Max Quiz Attempts", "3", "attempts"],
              ["Retry Cooldown Period", "24", "hours"],
            ].map(([label, val, unit]) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={val}
                    className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <span className="text-xs font-medium px-2" style={{ color: P.textMuted }}>
                    {unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Level thresholds */}
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <p
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: P.text }}
          >
            <Zap size={16} style={{ color: P.gold }} /> Level XP Thresholds
          </p>
          <div className="space-y-2.5">
            {[
              ["Level 1", "Newcomer", "0", "1,000"],
              ["Level 2", "Learner", "1,000", "3,000"],
              ["Level 3", "Explorer", "3,000", "6,000"],
              ["Level 4", "Scholar", "6,000", "10,000"],
              ["Level 5", "Expert", "10,000", "15,000"],
              ["Level 6", "Master", "15,000", "∞"],
            ].map(([lvl, name, from, to]) => (
              <div
                key={lvl}
                className="flex items-center gap-3 p-2.5 rounded-lg"
                style={{ background: P.bg }}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: P.olive }}
                >
                  {lvl.replace("Level ", "")}
                </div>
                <p className="text-xs font-semibold flex-1" style={{ color: P.text }}>
                  {name}
                </p>
                <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                  {from} – {to} XP
                </p>
                <button data-prototype-action="true">
                  <Edit size={12} style={{ color: P.sage }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="px-5 py-2.5 rounded-xl text-sm"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          data-prototype-action="true"
        >
          Reset to Defaults
        </button>
        <button
          onClick={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
          }}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: P.olive }}
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 8. HR LEADERBOARD MANAGEMENT
// ─────────────────────────────────────────────────────────────
