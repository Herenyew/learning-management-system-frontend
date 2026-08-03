// Extensions6.tsx — Content Creation Workflow Modal
// Full multi-step workflow for all 10 LMS content types
// Olive / Sage / Gold enterprise design language

import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Upload,
  HardDrive,
  Video,
  FileText,
  HelpCircle,
  Cpu,
  Music,
  Activity,
  ClipboardList,
  MessageSquare,
  Users,
  Link2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Trash2,
  Copy,
  Download,
  Eye,
  Edit,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Clock,
  Bookmark,
  Wand2,
  Globe,
  AlertCircle,
  Play,
  ExternalLink,
  Mic,
  GitBranch,
  Star,
} from "lucide-react";

// ─── Palette ─────────────────────────────────────────────────
export const P = {
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
  card: "#FFFFFF",
  text: "#052E26",
  textMid: "#047857",
  textMuted: "#4B7468",
  border: "#A7F3D0",
};

// ─── Types ────────────────────────────────────────────────────
export type ContentType =
  | "Video"
  | "Document"
  | "Quiz"
  | "SCORM / xAPI"
  | "Audio"
  | "Interactive Video"
  | "Assignment"
  | "Survey"
  | "Live Session"
  | "External Link";

// ─── Content type registry ────────────────────────────────────
export const CONTENT_TYPES: {
  label: ContentType;
  icon: React.ElementType;
  color: string;
  desc: string;
}[] = [
  { label: "Video", icon: Video, color: P.olive, desc: "MP4, MOV, AVI • max 2 GB" },
  { label: "Document", icon: FileText, color: P.darkOlive, desc: "PDF, DOCX, PPTX • max 100 MB" },
  { label: "Quiz", icon: HelpCircle, color: "#C8A85D", desc: "MCQ, T/F, short answer" },
  { label: "SCORM / xAPI", icon: Cpu, color: "#4A7A5A", desc: "SCORM 1.2 / 2004, xAPI packages" },
  { label: "Audio", icon: Music, color: "#7C3AED", desc: "MP3, WAV, M4A • max 500 MB" },
  {
    label: "Interactive Video",
    icon: Activity,
    color: "#0F766E",
    desc: "Embedded questions & branching",
  },
  { label: "Assignment", icon: ClipboardList, color: "#C0392B", desc: "File or text submission" },
  { label: "Survey", icon: MessageSquare, color: "#2563EB", desc: "Feedback, polls, NPS" },
  { label: "Live Session", icon: Users, color: "#059669", desc: "Zoom / Teams scheduled session" },
  { label: "External Link", icon: Link2, color: "#9333EA", desc: "URL with completion tracking" },
];

// ─── Shared helpers ───────────────────────────────────────────
export function ModalHeader({
  stepLabel,
  title,
  onClose,
  onBack,
}: {
  stepLabel?: string;
  title: string;
  onClose: () => void;
  onBack?: () => void;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: P.textMuted }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
        <div>
          {stepLabel && (
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: P.textMuted }}
            >
              {stepLabel}
            </p>
          )}
          <h3
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {title}
          </h3>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <X size={16} style={{ color: P.textMuted }} />
      </button>
    </div>
  );
}

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 20 : 6,
            height: 6,
            background: i === current ? P.olive : i < current ? P.sage : P.border,
          }}
        />
      ))}
    </div>
  );
}

export function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
        {label} {required && <span style={{ color: "#C0392B" }}>*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none focus:ring-2"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    />
  );
}

export function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none focus:ring-2 resize-none"
      style={{ border: `1px solid ${P.border}`, color: P.text }}
    />
  );
}

export function Toggle({
  value,
  onChange,
  label,
  desc,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <div
      className="flex items-center justify-between p-3 rounded-xl cursor-pointer"
      style={{
        background: value ? P.lightSage : P.bg,
        border: `1px solid ${value ? P.sage : P.border}`,
      }}
      onClick={() => onChange(!value)}
    >
      <div>
        <p className="text-xs font-semibold" style={{ color: P.text }}>
          {label}
        </p>
        {desc && (
          <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
            {desc}
          </p>
        )}
      </div>
      <div
        className="rounded-full relative flex-shrink-0 ml-3 transition-colors"
        style={{ width: 40, height: 22, background: value ? P.olive : P.border }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all"
          style={{ left: value ? 22 : 2 }}
        />
      </div>
    </div>
  );
}

export function NavButtons({
  onBack,
  onNext,
  nextLabel = "Next →",
  nextDisabled = false,
  onSave,
  saveLabel = "Save & Add",
}: {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  onSave?: () => void;
  saveLabel?: string;
}) {
  return (
    <div className="flex gap-2 pt-2">
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
        >
          ← Back
        </button>
      )}
      {onNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity"
          style={{ background: P.olive, opacity: nextDisabled ? 0.5 : 1 }}
        >
          {nextLabel}
        </button>
      )}
      {onSave && (
        <button
          onClick={onSave}
          disabled={nextDisabled}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
          style={{ background: P.olive, opacity: nextDisabled ? 0.5 : 1 }}
        >
          <CheckCircle size={14} /> {saveLabel}
        </button>
      )}
    </div>
  );
}

// ─── Step 0: Content Source ───────────────────────────────────
export function SourceStep({
  typeMeta,
  onSelect,
  onClose,
}: {
  typeMeta: (typeof CONTENT_TYPES)[0];
  onSelect: (src: "upload" | "gdrive") => void;
  onClose: () => void;
}) {
  const Icon = typeMeta.icon;
  const needsSource = !["Quiz", "Survey", "Live Session", "External Link", "Assignment"].includes(
    typeMeta.label,
  );

  // Types that don't need a file — skip to next step automatically via effect
  if (!needsSource) {
    return null; // caller skips this step
  }

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl modal-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader
        title={`Add ${typeMeta.label}`}
        onClose={onClose}
        stepLabel="Step 1 of 2 — Content Source"
      />
      <StepDots total={2} current={0} />

      <div
        className="flex items-center gap-3 p-3 rounded-xl mb-5"
        style={{ background: P.lightSage }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${typeMeta.color}18` }}
        >
          <Icon size={18} style={{ color: typeMeta.color }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            {typeMeta.label}
          </p>
          <p className="text-[11px]" style={{ color: P.textMuted }}>
            {typeMeta.desc}
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
        Where is your content?
      </p>
      <div className="space-y-3">
        <button
          onClick={() => onSelect("upload")}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:border-olive group"
          style={{ borderColor: P.border }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = P.olive)}
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.borderColor = P.border)
          }
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: P.lightSage }}
          >
            <Upload size={18} style={{ color: P.olive }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Upload File
            </p>
            <p className="text-[11px]" style={{ color: P.textMuted }}>
              Upload from your device — {typeMeta.desc}
            </p>
          </div>
          <ChevronRight
            size={16}
            className="ml-auto flex-shrink-0"
            style={{ color: P.textMuted }}
          />
        </button>

        <button
          onClick={() => onSelect("gdrive")}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
          style={{ borderColor: P.border }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.borderColor = "#2563EB")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.borderColor = P.border)
          }
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#EFF6FF" }}
          >
            <HardDrive size={18} style={{ color: "#2563EB" }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Google Drive
            </p>
            <p className="text-[11px]" style={{ color: P.textMuted }}>
              Browse and import from Google Drive
            </p>
          </div>
          <ChevronRight
            size={16}
            className="ml-auto flex-shrink-0"
            style={{ color: P.textMuted }}
          />
        </button>
      </div>
    </div>
  );
}

// ─── Upload / Drive picker ─────────────────────────────────────
export function UploadZone({
  accept,
  label,
  onFile,
}: {
  accept: string;
  label: string;
  onFile: (name: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      setFile(f.name);
      onFile(f.name);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f.name);
      onFile(f.name);
    }
  };

  if (file) {
    return (
      <div
        className="flex items-center gap-3 p-3.5 rounded-xl"
        style={{ background: P.lightSage, border: `1px solid ${P.sage}` }}
      >
        <CheckCircle size={18} style={{ color: P.olive }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: P.text }}>
            {file}
          </p>
          <p className="text-[10px]" style={{ color: P.textMuted }}>
            Ready to configure
          </p>
        </div>
        <button
          onClick={() => {
            setFile(null);
            onFile("");
          }}
          className="p-1.5 rounded-lg hover:bg-red-50"
        >
          <X size={13} style={{ color: "#C0392B" }} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
      style={{
        borderColor: dragging ? P.olive : P.border,
        background: dragging ? P.lightSage : P.bg,
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
        style={{ background: dragging ? P.sage + "40" : P.lightSage }}
      >
        <Upload size={22} style={{ color: P.olive }} />
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: P.text }}>
        {dragging ? "Drop to upload" : `Drag & drop your ${label}`}
      </p>
      <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
        or click to browse files
      </p>
      <span
        className="text-[10px] px-3 py-1 rounded-full"
        style={{ background: P.lightSage, color: P.textMid }}
      >
        {accept}
      </span>
    </div>
  );
}

export function GDriveBrowser({ onSelect }: { onSelect: (name: string) => void }) {
  const files = [
    {
      name: "Q4 AI Strategy Presentation.pptx",
      type: "PPTX",
      size: "8.4 MB",
      modified: "2 days ago",
    },
    {
      name: "Machine Learning Fundamentals.pdf",
      type: "PDF",
      size: "3.1 MB",
      modified: "1 week ago",
    },
    {
      name: "Leadership Workshop Recording.mp4",
      type: "MP4",
      size: "412 MB",
      modified: "3 days ago",
    },
    {
      name: "Compliance Training Slides.pdf",
      type: "PDF",
      size: "5.7 MB",
      modified: "2 weeks ago",
    },
    { name: "Data Literacy Course Audio.mp3", type: "MP3", size: "48 MB", modified: "5 days ago" },
  ];
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ background: "#EFF6FF", borderBottom: `1px solid #BFDBFE` }}
      >
        <HardDrive size={13} style={{ color: "#2563EB" }} />
        <p className="text-xs font-semibold" style={{ color: "#1E40AF" }}>
          My Drive
        </p>
      </div>
      <div className="divide-y max-h-52 overflow-y-auto" style={{ borderColor: P.border }}>
        {files.map((f) => (
          <button
            key={f.name}
            onClick={() => {
              setSelected(f.name);
              onSelect(f.name);
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
            style={{ background: selected === f.name ? P.lightSage : "white" }}
            onMouseEnter={(e) => {
              if (selected !== f.name)
                (e.currentTarget as HTMLButtonElement).style.background = P.bg;
            }}
            onMouseLeave={(e) => {
              if (selected !== f.name)
                (e.currentTarget as HTMLButtonElement).style.background = "white";
            }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
              style={{
                background:
                  f.type === "MP4" ? `${P.olive}18` : f.type === "MP3" ? "#F5F3FF" : "#EFF6FF",
              }}
            >
              <span
                className="text-[8px] font-bold"
                style={{
                  color: f.type === "MP4" ? P.olive : f.type === "MP3" ? "#7C3AED" : "#2563EB",
                }}
              >
                {f.type}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: P.text }}>
                {f.name}
              </p>
              <p className="text-[10px]" style={{ color: P.textMuted }}>
                {f.size} · {f.modified}
              </p>
            </div>
            {selected === f.name && (
              <CheckCircle size={14} style={{ color: P.olive, flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Attached Resources list ──────────────────────────────────
export function AttachedResources({
  items,
  onChange,
}: {
  items: string[];
  onChange: (v: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    if (input.trim()) {
      onChange([...items, input.trim()]);
      setInput("");
    }
  };
  return (
    <div className="space-y-2">
      {items.map((r, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: P.bg, border: `1px solid ${P.border}` }}
        >
          <FileText size={12} style={{ color: P.sage }} />
          <span className="text-xs flex-1 truncate" style={{ color: P.text }}>
            {r}
          </span>
          <button onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <X size={11} style={{ color: P.textMuted }} />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add resource name or URL…"
          className="flex-1 px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
        <button
          onClick={add}
          className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
          style={{ background: P.olive }}
        >
          Add
        </button>
      </div>
    </div>
  );
}

// ─── VIDEO workflow ───────────────────────────────────────────

export type ContentAttachment = {
  name: string;
  source: "Device upload" | "Google Drive" | "Resource" | "External link";
  detail?: string;
};

export type ContentWorkflowSavePayload = {
  title?: string;
  meta?: string;
  duration?: string;
  description?: string;
  source?: "upload" | "gdrive" | "manual" | "external";
  primaryFile?: string;
  attachments?: ContentAttachment[];
  quizData?: unknown;
};

export const sourceLabelFor = (source: "upload" | "gdrive") =>
  source === "upload" ? "Device upload" : "Google Drive";

export const resourceToAttachment = (resource: string): ContentAttachment => ({
  name: resource,
  source: /^https?:\/\//i.test(resource) ? "External link" : "Resource",
  detail: /^https?:\/\//i.test(resource) ? "Reference URL" : "Attached resource",
});
