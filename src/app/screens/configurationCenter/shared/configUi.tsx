import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Award,
  BarChart2,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  MessageSquare,
  Star,
  Play,
  Video,
  FileText,
  HelpCircle,
  Globe,
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  X,
  Copy,
  Archive,
  Send,
  Link,
  UserCheck,
  Layers,
  Shield,
  Eye,
  Settings,
  Zap,
  Lock,
  Users,
  Clock,
  Filter,
  MoreHorizontal,
  Flag,
  Upload,
  User,
  LayoutDashboard,
  Activity,
  Cpu,
  Music,
  RefreshCw,
  GitBranch,
  Tag,
  ChevronDown,
  ChevronUp,
  ToggleLeft,
  Trophy,
  Medal,
  Check,
  Wand2,
  PlusCircle,
  FileCheck,
  Bookmark,
  AlertTriangle,
  Image as ImageIcon,
  MousePointer2,
  Move,
  Palette,
  Square,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

import {
  AreaChart,
  Area,
  BarChart as ReBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { P } from "./theme";
import type { CertificationTemplate, CreatorCertificateTemplate } from "./certificationData";

export function Av({
  initials,
  size = 32,
  color = P.olive,
}: {
  initials: string;
  size?: number;
  color?: string;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
export function Chip({ label, variant = "sage" }: { label: string; variant?: string }) {
  const s: Record<string, React.CSSProperties> = {
    sage: { background: P.lightSage, color: P.darkOlive, borderColor: "#C4D4A8" },
    gold: { background: P.goldLight, color: "#8A6A1A", borderColor: "#E8D090" },
    red: { background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA" },
    green: { background: "#D8EDCC", color: "#3A6420", borderColor: "#B4D4A0" },
    blue: { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" },
    neutral: { background: P.paleGreen, color: P.textMuted, borderColor: P.border },
  };
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full border"
      style={s[variant] ?? s.neutral}
    >
      {label}
    </span>
  );
}

export function CertificateTemplateReviewModal({
  template,
  courseTitle,
  score,
  selected,
  onUse,
  onClose,
}: {
  template: CreatorCertificateTemplate;
  courseTitle: string;
  score: number;
  selected: boolean;
  onUse: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 modal-backdrop"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl bg-white border shadow-2xl overflow-hidden"
        style={{ borderColor: P.border }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-4 px-5 py-4"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <div>
            <p className="text-base font-bold" style={{ color: P.text }}>
              Certificate Template Review
            </p>
            <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
              Preview layout, signers, stamp, and issuance rules before choosing this template.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg"
            style={{ color: P.textMuted, border: `1px solid ${P.border}` }}
            aria-label="Close certificate template review"
          >
            <X size={15} />
          </button>
        </div>

        <div className="grid lg:grid-cols-[1.25fr_0.75fr] gap-5 p-5">
          <div
            className="rounded-2xl border p-4"
            style={{ borderColor: P.border, background: P.bg }}
          >
            <div
              className="relative aspect-[1.414/1] rounded-xl bg-white shadow-sm overflow-hidden"
              style={{
                border: `10px double ${template.accent}`,
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-16"
                style={{
                  background: `linear-gradient(135deg, ${template.accent}, ${template.accent}88)`,
                }}
              />
              <div
                className="absolute right-6 top-6 h-20 w-20 rounded-full border-4 flex items-center justify-center text-[10px] font-bold uppercase text-center"
                style={{
                  borderColor: `${template.accent}55`,
                  color: template.accent,
                  background: "rgba(255,255,255,0.92)",
                }}
              >
                {template.sealLabel.split(" ")[0]}
              </div>
              <div className="relative flex h-full flex-col items-center justify-center px-12 pt-8 text-center">
                <p
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: template.accent }}
                >
                  Certificate of Completion
                </p>
                <p
                  className="mt-4 text-3xl font-bold"
                  style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                >
                  Alex Mercer
                </p>
                <div className="my-4 h-px w-2/3" style={{ background: `${template.accent}55` }} />
                <p className="max-w-md text-sm leading-relaxed" style={{ color: P.textMid }}>
                  Has successfully completed{" "}
                  <span className="font-semibold" style={{ color: P.text }}>
                    {courseTitle}
                  </span>{" "}
                  and met the required certification criteria.
                </p>
                <div className="mt-8 grid w-full max-w-lg grid-cols-2 gap-8">
                  {template.signers.slice(0, 2).map((signer) => (
                    <div key={signer} className="text-center">
                      <div
                        className="mx-auto mb-1 h-px w-32"
                        style={{ background: `${template.accent}66` }}
                      />
                      <p className="text-[11px] font-semibold" style={{ color: P.text }}>
                        {signer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: P.textMuted }}
              >
                Template
              </p>
              <h3
                className="mt-1 text-lg font-bold"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
              >
                {template.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: P.textMid }}>
                {template.purpose}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  Layout
                </p>
                <p className="mt-1 text-xs font-semibold" style={{ color: P.text }}>
                  {template.layout}
                </p>
              </div>
              <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
                <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>
                  Minimum Score
                </p>
                <p className="mt-1 text-xs font-semibold" style={{ color: P.text }}>
                  {score}%
                </p>
              </div>
            </div>

            <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
              <p
                className="text-[10px] font-semibold uppercase mb-2"
                style={{ color: P.textMuted }}
              >
                Signers
              </p>
              <div className="space-y-2">
                {template.signers.map((signer) => (
                  <div key={signer} className="flex items-center gap-2 text-xs">
                    <User size={12} style={{ color: template.accent }} />
                    <span style={{ color: P.textMid }}>{signer}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
              <p
                className="text-[10px] font-semibold uppercase mb-2"
                style={{ color: P.textMuted }}
              >
                Issuance Criteria
              </p>
              <div className="flex flex-wrap gap-1.5">
                {template.criteria.map((criterion) => (
                  <Chip key={criterion} label={criterion} variant="sage" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex justify-end gap-2 px-5 py-4"
          style={{ borderTop: `1px solid ${P.border}`, background: P.bg }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ border: `1px solid ${P.border}`, color: P.textMid, background: "white" }}
          >
            Close
          </button>
          <button
            onClick={onUse}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: selected ? P.sage : P.olive }}
          >
            {selected ? "Selected" : "Use Template"}
          </button>
        </div>
      </div>
    </div>
  );
}
export function PBar({
  value,
  color = P.olive,
  height = 5,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: P.lightSage }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}
export function AICard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: `linear-gradient(135deg,${P.goldLight},${P.goldMid}50)`,
        border: `1px solid ${P.gold}40`,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: P.gold }}
        >
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#7A5A10" }}>
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}
export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          {title}
        </h1>
        {sub && (
          <p className="text-sm line-clamp-1 max-w-3xl" style={{ color: P.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. CONFIGURATION CENTER
// ─────────────────────────────────────────────────────────────

// ─── CONFIG CENTER helpers ────────────────────────────────────

export function CfgToggle({
  label,
  desc,
  defaultOn = false,
}: {
  label: string;
  desc?: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: P.bg }}>
      <div>
        <p className="text-xs font-semibold" style={{ color: P.textMid }}>
          {label}
        </p>
        {desc && (
          <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
            {desc}
          </p>
        )}
      </div>
      <button
        onClick={() => setOn((o) => !o)}
        className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
        style={{ background: on ? P.olive : P.border }}
      >
        <span
          className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: on ? "22px" : "2px" }}
        />
      </button>
    </div>
  );
}

export function CfgField({
  label,
  value,
  type = "text",
  options,
}: {
  label: string;
  value?: string;
  type?: string;
  options?: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label}
      </label>
      {options ? (
        <select
          className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          defaultValue={value}
          className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
      )}
    </div>
  );
}

export function CfgSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="bg-white rounded-[22px] border px-6 py-6 space-y-5 shadow-sm"
      style={{
        borderColor: P.border,
        boxShadow: "0 18px 44px rgba(4, 120, 87, 0.06)",
      }}
    >
      <div
        className="flex items-center gap-2.5 pb-3"
        style={{ borderBottom: `1px solid ${P.border}` }}
      >
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: P.olive }} />
        <p className="text-base font-bold" style={{ color: P.text }}>
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

export function SaveBar({ onSave }: { onSave?: () => void }) {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
          onSave?.();
        }}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors"
        style={{ background: saved ? "#5A7A2A" : P.olive }}
      >
        {saved ? "✓ Saved" : "Save Configuration"}
      </button>
      <button
        className="px-5 py-2.5 rounded-xl text-sm font-medium"
        style={{ border: `1px solid ${P.border}`, color: P.textMid }}
        data-prototype-action="true"
      >
        Discard
      </button>
    </div>
  );
}

// ─── Learning Programs Config ─────────────────────────────────
