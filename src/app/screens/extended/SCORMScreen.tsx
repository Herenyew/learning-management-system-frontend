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

export function SCORMScreen({ navigate }: { navigate: (s: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const pkg = selected ? SCORM_PACKAGES.find((p) => p.id === selected) : null;

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="SCORM & xAPI Management"
        sub="Upload, manage, and track SCORM 1.2, SCORM 2004, and xAPI packages"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(
          [
            ["SCORM Packages", "4", "2 SCORM 2004, 1 xAPI", Cpu, P.olive, P.lightSage],
            [
              "Total Completions",
              "2,686",
              "Across all packages",
              CheckCircle,
              "#5A7A2A",
              "#D8EDCC",
            ],
            ["Avg. Pass Score", "85%", "+2% vs last quarter", Star, P.gold, P.goldLight],
            ["Active Learners", "896", "Currently in SCORM", Users, P.darkOlive, P.lightSage],
          ] as [string, string, string, React.ElementType, string, string][]
        ).map(([l, v, s, Icon, color, bg]) => (
          <StatCard key={l} label={l} value={v} sub={s} icon={Icon} color={color} bg={bg} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          {/* Upload zone */}
          <div
            className="border-2 border-dashed rounded-2xl p-8 text-center transition-all"
            style={{
              borderColor: dragging ? P.olive : P.sage,
              background: dragging ? P.lightSage : "white",
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={() => setDragging(false)}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: P.lightSage }}
            >
              <Upload size={22} style={{ color: P.olive }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
              Upload SCORM Package
            </p>
            <p className="text-xs mb-4" style={{ color: P.textMuted }}>
              Drag and drop a .zip file, or click to browse. Supports SCORM 1.2, SCORM 2004, xAPI
              (Tin Can)
            </p>
            <button
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: P.olive }}
              data-prototype-action="true"
            >
              Choose File
            </button>
            <p className="text-[10px] mt-3" style={{ color: P.textMuted }}>
              Max file size: 500 MB
            </p>
          </div>

          {/* Package list */}
          <div
            className="bg-white rounded-xl border overflow-hidden"
            style={{ borderColor: P.border }}
          >
            <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${P.border}` }}>
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                Installed Packages
              </p>
            </div>
            <div className="divide-y" style={{ borderColor: P.border }}>
              {SCORM_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => setSelected(pkg.id === selected ? null : pkg.id)}
                  className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-[#F6FEFA] transition-colors"
                  style={{ background: selected === pkg.id ? `${P.lightSage}50` : undefined }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: P.lightSage }}
                  >
                    <Cpu size={18} style={{ color: P.olive }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {pkg.name}
                      </p>
                      <Badge
                        label={pkg.status}
                        variant={pkg.status === "Active" ? "green" : "neutral"}
                      />
                    </div>
                    <div
                      className="flex flex-wrap gap-3 text-[11px]"
                      style={{ color: P.textMuted }}
                    >
                      <span>{pkg.version}</span>
                      <span>{pkg.size}</span>
                      <span>Uploaded {pkg.uploaded}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <PBar
                        value={(pkg.completions / pkg.totalLearners) * 100}
                        color={P.olive}
                        height={4}
                      />
                      <span
                        className="text-[11px] font-mono flex-shrink-0"
                        style={{ color: P.textMid }}
                      >
                        {pkg.completions}/{pkg.totalLearners}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      className="p-1.5 rounded-lg hover:bg-[#ECFDF5]"
                      data-prototype-action="true"
                    >
                      <Link size={13} style={{ color: P.sage }} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-[#ECFDF5]"
                      data-prototype-action="true"
                    >
                      <Download size={13} style={{ color: P.sage }} />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50"
                      data-prototype-action="true"
                    >
                      <Trash2 size={13} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {pkg ? (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
              <p className="text-xs font-bold mb-3" style={{ color: P.text }}>
                {pkg.name}
              </p>
              <div className="space-y-2.5">
                {[
                  ["Version", pkg.version],
                  ["File Size", pkg.size],
                  ["Uploaded", pkg.uploaded],
                  ["Launch URL", pkg.launchUrl],
                ].map(([l, v]) => (
                  <div key={l} className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-semibold" style={{ color: P.textMuted }}>
                      {l}
                    </p>
                    <p className="text-[11px] text-right font-mono" style={{ color: P.textMid }}>
                      {v}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 space-y-2" style={{ borderTop: `1px solid ${P.border}` }}>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: P.textMuted }}>Completion Rate</span>
                    <span className="font-semibold" style={{ color: P.olive }}>
                      {Math.round((pkg.completions / pkg.totalLearners) * 100)}%
                    </span>
                  </div>
                  <PBar
                    value={(pkg.completions / pkg.totalLearners) * 100}
                    color={P.olive}
                    height={7}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 text-center pt-1">
                  <div className="p-2 rounded-lg" style={{ background: P.lightSage }}>
                    <p className="text-sm font-bold" style={{ color: P.olive }}>
                      {pkg.completions}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Completed
                    </p>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: P.goldLight }}>
                    <p className="text-sm font-bold" style={{ color: "#8A6A1A" }}>
                      {pkg.avgScore}%
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      Avg Score
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <AICard title="AI Learning Analytics">
              <p className="text-xs leading-relaxed" style={{ color: "#7A5A10" }}>
                Completion is highest among <strong>HR and Legal</strong> (96%+). Engineering has a
                72% completion — suggest adding a manager-assigned trigger for non-completers.
              </p>
            </AICard>
          </div>
        ) : (
          <div
            className="bg-white rounded-xl border p-5 flex flex-col items-center justify-center text-center"
            style={{ borderColor: P.border, minHeight: 280 }}
          >
            <Cpu size={32} style={{ color: P.sage }} className="mb-3" />
            <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
              Select a package
            </p>
            <p className="text-xs" style={{ color: P.textMuted }}>
              Click a package to see analytics and details
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 11. COURSE CREATOR CONFIG (Extended Panels)
// ─────────────────────────────────────────────────────────────
