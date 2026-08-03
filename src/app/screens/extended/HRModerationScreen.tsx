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

export function HRModerationScreen({ navigate }: { navigate: (s: string) => void }) {
  const [items, setItems] = useState(MODERATION_ITEMS);
  const [filter, setFilter] = useState("All");

  const filtered = items.filter(
    (i) =>
      filter === "All" || i.type === filter.toLowerCase() || (filter === "Reported" && i.reported),
  );

  const stats: [string, string, React.ElementType, string, string][] = [
    ["Total Flagged", "4", Flag, P.gold, P.goldLight],
    ["Reported", "2", AlertCircle, "#C0392B", "#FEE2E2"],
    ["Comments", "2", MessageSquare, P.olive, P.lightSage],
    ["Reviews", "2", Star, "#5A7A2A", "#D8EDCC"],
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1100px]">
      <PageHeader
        title="Content Moderation"
        sub="Review flagged comments, reviews, and ratings from learners"
      />

      <div className="grid grid-cols-4 gap-3">
        {stats.map(([l, v, Icon, color, bg]) => (
          <StatCard key={l} label={l} value={v} icon={Icon} color={color} bg={bg} />
        ))}
      </div>

      <div className="flex gap-2">
        {["All", "Comment", "Review", "Reported"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={
              filter === f
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border p-5"
            style={{ borderColor: item.reported ? "#FECACA" : P.border }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: item.reported ? "#FEE2E2" : P.lightSage }}
              >
                {item.type === "comment" ? (
                  <MessageSquare size={16} style={{ color: P.olive }} />
                ) : (
                  <Star size={16} style={{ color: P.gold }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {item.author}
                  </p>
                  <Badge
                    label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    variant="neutral"
                  />
                  {item.reported && <Badge label="⚠ Reported" variant="red" />}
                  <span className="text-[10px] font-mono ml-auto" style={{ color: P.textMuted }}>
                    {item.date}
                  </span>
                </div>
                <p className="text-xs leading-relaxed mb-1" style={{ color: P.textMid }}>
                  {item.content}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Course: <span style={{ color: P.olive }}>{item.course}</span>
                </p>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: P.goldLight, color: "#8A6A1A" }}
                  data-prototype-action="true"
                >
                  <Eye size={12} /> Hide
                </button>
                <button
                  onClick={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: "#FEE2E2", color: "#C0392B" }}
                >
                  <Trash2 size={12} /> Delete
                </button>
                <button
                  className="p-1.5 rounded-lg"
                  style={{ border: `1px solid ${P.border}` }}
                  data-prototype-action="true"
                >
                  <MoreHorizontal size={14} style={{ color: P.textMuted }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. HR XP CONFIGURATION
// ─────────────────────────────────────────────────────────────
