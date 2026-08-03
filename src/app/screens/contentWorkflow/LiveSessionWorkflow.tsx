import React, { useState } from "react";
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
import {
  AttachedResources,
  FormField,
  GDriveBrowser,
  Input,
  ModalHeader,
  NavButtons,
  P,
  StepDots,
  Textarea,
  Toggle,
  UploadZone,
  resourceToAttachment,
  sourceLabelFor,
} from "./contentWorkflow.shared";
import type { ContentWorkflowSavePayload } from "./contentWorkflow.shared";

export function LiveSessionWorkflow({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    platform: "zoom" as "zoom" | "teams" | "meet",
    date: "",
    time: "",
    duration: "60",
    attendanceTracking: true,
    recordingLink: "",
    maxParticipants: "50",
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader title="Add Live Session" onClose={onClose} />

      <div className="space-y-4">
        <FormField label="Session Title" required>
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. AI Strategy Q&A with Dr. Chen"
          />
        </FormField>

        <FormField label="Platform">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["zoom", "Zoom", "#2D8CFF"],
              ["teams", "Teams", "#6264A7"],
              ["meet", "Google Meet", "#34A853"],
            ].map(([v, l, c]) => (
              <button
                key={v}
                onClick={() => set("platform")(v as any)}
                className="py-2.5 rounded-xl text-xs font-semibold border-2 transition-all flex items-center justify-center gap-1.5"
                style={{
                  borderColor: form.platform === v ? c : P.border,
                  background: form.platform === v ? `${c}12` : "white",
                  color: form.platform === v ? c : P.textMid,
                }}
              >
                <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
                {l}
              </button>
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Date" required>
            <Input value={form.date} onChange={set("date")} type="date" />
          </FormField>
          <FormField label="Time" required>
            <Input value={form.time} onChange={set("time")} type="time" />
          </FormField>
          <FormField label="Duration (minutes)">
            <Input
              value={form.duration}
              onChange={set("duration")}
              placeholder="60"
              type="number"
            />
          </FormField>
          <FormField label="Max Participants">
            <Input
              value={form.maxParticipants}
              onChange={set("maxParticipants")}
              placeholder="50"
              type="number"
            />
          </FormField>
        </div>

        <Toggle
          value={form.attendanceTracking}
          onChange={set("attendanceTracking")}
          label="Attendance Tracking"
          desc="Automatically mark complete for learners who join"
        />

        <FormField
          label="Recording Link"
          hint="Add after session completes — made available to learners"
        >
          <Input
            value={form.recordingLink}
            onChange={set("recordingLink")}
            placeholder="https://zoom.us/rec/…"
          />
        </FormField>
      </div>

      <div className="mt-5">
        <NavButtons
          onBack={onClose}
          onSave={onSave}
          nextDisabled={!form.title.trim() || !form.date || !form.time}
        />
      </div>
    </div>
  );
}

// ─── EXTERNAL LINK workflow ───────────────────────────────────
