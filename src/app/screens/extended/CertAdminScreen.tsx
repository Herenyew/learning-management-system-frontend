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

export function CertAdminScreen({ navigate }: { navigate: (s: string) => void }) {
  const [activeTab, setActiveTab] = useState<"templates" | "active" | "archive">("templates");
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Certificate Administration"
        sub="Manage certificate templates, signatories, and the full certificate lifecycle"
        actions={
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> New Template
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4">
        {[
          ["Active Templates", "4", Award, P.olive, P.lightSage],
          ["Active Certificates", "31", "This month", CheckCircle, "#5A7A2A", "#D8EDCC"],
          ["Expired", "54", "Need renewal", AlertCircle, P.gold, P.goldLight],
        ].map(([l, v, sub_or_icon, ...rest]: any[]) => {
          if (rest.length === 3) {
            const [Icon, color, bg] = rest;
            return (
              <StatCard
                key={l}
                label={l}
                value={v}
                sub={sub_or_icon as string}
                icon={Icon}
                color={color}
                bg={bg}
              />
            );
          }
          return (
            <StatCard
              key={l}
              label={l}
              value={v}
              icon={sub_or_icon as React.ElementType}
              color={rest[0]}
              bg={rest[1]}
            />
          );
        })}
      </div>

      <div className="flex gap-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        {[
          ["templates", "Certificate Templates"],
          ["active", "Active Certificates"],
          ["archive", "Archive"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className="px-5 py-3 text-xs font-semibold"
            style={
              activeTab === id
                ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                : { color: P.textMuted }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "templates" && (
        <div className="grid md:grid-cols-2 gap-4">
          {CERT_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-white rounded-xl border overflow-hidden"
              style={{ borderColor: P.border }}
            >
              <div
                className="p-5 text-white relative"
                style={{ background: `linear-gradient(135deg, ${tmpl.color}, ${tmpl.color}cc)` }}
              >
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)",
                    backgroundSize: "10px 10px",
                  }}
                />
                <div className="relative">
                  <p
                    className="text-[10px] font-semibold tracking-widest uppercase mb-1"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    CERTIFICATE TEMPLATE
                  </p>
                  <h3 className="text-sm font-bold">{tmpl.name}</h3>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] font-semibold mb-2" style={{ color: P.textMuted }}>
                    SIGNATORIES
                  </p>
                  <div className="space-y-1.5">
                    {tmpl.signers.map((s) => (
                      <div key={s} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: P.lightSage }}
                        >
                          <User size={9} style={{ color: P.olive }} />
                        </div>
                        <span style={{ color: P.textMid }}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: P.textMuted }}>Stamp / Seal</span>
                  <Badge
                    label={tmpl.hasStamp ? "Enabled" : "Disabled"}
                    variant={tmpl.hasStamp ? "green" : "neutral"}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: P.textMuted }}>Issued Certificates</span>
                  <span className="font-semibold" style={{ color: P.text }}>
                    {tmpl.active} active · {tmpl.archived} archived
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    className="flex-1 py-2 rounded-lg text-xs font-medium"
                    style={{ background: P.lightSage, color: P.olive }}
                    data-prototype-action="true"
                  >
                    Edit Template
                  </button>
                  <button
                    className="flex-1 py-2 rounded-lg text-xs font-medium"
                    style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                    data-prototype-action="true"
                  >
                    Manage Signers
                  </button>
                  <button
                    className="p-2 rounded-lg"
                    style={{ border: `1px solid ${P.border}` }}
                    data-prototype-action="true"
                  >
                    <Archive size={13} style={{ color: P.textMuted }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(activeTab === "active" || activeTab === "archive") && (
        <div
          className="bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <div
            className="px-5 py-3.5 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              {activeTab === "active" ? "Active Certificates" : "Certificate Archive"}
            </p>
            <button
              className="flex items-center gap-1.5 text-xs"
              style={{ color: P.olive }}
              data-prototype-action="true"
            >
              <Download size={12} /> Export
            </button>
          </div>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
                {["Certificate", "Learner", "Course", "Issued", "Expires", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  cert: "Standard Completion",
                  learner: "Alex Mercer",
                  course: "AI & ML for Business Leaders",
                  issued: "Jan 12, 2025",
                  expires: "Jan 12, 2027",
                  status: activeTab === "active" ? "Active" : "Expired",
                },
                {
                  cert: "Compliance Attestation",
                  learner: "Marcus Johnson",
                  course: "GDPR Compliance Training",
                  issued: "Dec 5, 2024",
                  expires: "Dec 5, 2025",
                  status: activeTab === "active" ? "Expiring Soon" : "Expired",
                },
                {
                  cert: "Technical Proficiency",
                  learner: "Yuki Tanaka",
                  course: "Advanced Python",
                  issued: "Nov 18, 2024",
                  expires: "Nov 18, 2026",
                  status: activeTab === "active" ? "Active" : "Expired",
                },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="hover:bg-[#F6FEFA] transition-colors"
                  style={{ borderBottom: `1px solid ${P.border}50` }}
                >
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium" style={{ color: P.text }}>
                      {row.cert}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Av
                        initials={row.learner
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                        size={24}
                        color={P.sage}
                      />
                      <p className="text-xs" style={{ color: P.text }}>
                        {row.learner}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs line-clamp-1" style={{ color: P.textMid }}>
                      {row.course}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                      {row.issued}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                      {row.expires}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={row.status}
                      variant={
                        row.status === "Active"
                          ? "green"
                          : row.status === "Expiring Soon"
                            ? "gold"
                            : "red"
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.7)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl border p-6 max-w-lg w-full space-y-4"
            style={{ borderColor: P.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold" style={{ color: P.text }}>
              New Certificate Template
            </h3>
            <Input
              label="Template Name"
              placeholder="e.g. Leadership Excellence Certificate"
              required
            />
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Signatories
              </p>
              {["Primary Signer (Name & Title)", "Secondary Signer (optional)"].map((s) => (
                <div key={s} className="flex items-center gap-2 mb-2">
                  <input
                    placeholder={s}
                    className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <button
                    className="p-2 rounded-lg"
                    style={{ border: `1px solid ${P.border}` }}
                    data-prototype-action="true"
                  >
                    <Plus size={13} style={{ color: P.olive }} />
                  </button>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: P.bg }}
            >
              <p className="text-xs font-medium" style={{ color: P.textMid }}>
                Include Stamp / Official Seal
              </p>
              <input
                type="checkbox"
                defaultChecked
                style={{ accentColor: P.olive, width: 16, height: 16 }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: P.olive }}
              >
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 10. SCORM MANAGEMENT
// ─────────────────────────────────────────────────────────────
