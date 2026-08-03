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

export function VideoWorkflow({
  source,
  onClose,
  onSave,
}: {
  source: "upload" | "gdrive";
  onClose: () => void;
  onSave: (item: ContentWorkflowSavePayload) => void;
}) {
  const [file, setFile] = useState("");
  const [form, setForm] = useState({
    title: "",
    desc: "",
    duration: "",
    downloadable: false,
    resources: [] as string[],
    links: "",
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));
  const saveVideo = () =>
    onSave({
      title: form.title.trim(),
      description: form.desc.trim(),
      meta: form.duration.trim() || file,
      duration: form.duration.trim() || "Video",
      source,
      primaryFile: file,
      attachments: [
        { name: file, source: sourceLabelFor(source), detail: "Primary video file" },
        ...form.resources.map(resourceToAttachment),
        ...(form.links.trim()
          ? [
              {
                name: form.links.trim(),
                source: "External link" as const,
                detail: "Additional link",
              },
            ]
          : []),
      ],
    });

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader title="Add Video" stepLabel="Step 2 of 2 — Metadata" onClose={onClose} />
      <StepDots total={2} current={1} />

      <div className="space-y-4">
        {source === "upload" ? (
          <UploadZone accept=".mp4,.mov,.avi,.webm" label="video file" onFile={setFile} />
        ) : (
          <GDriveBrowser onSelect={setFile} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FormField label="Video Title" required>
              <Input
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. AI Foundations Overview"
              />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Description">
              <Textarea
                value={form.desc}
                onChange={set("desc")}
                placeholder="Brief description of this video…"
              />
            </FormField>
          </div>
          <FormField label="Duration" hint="Auto-detected from file">
            <Input value={form.duration} onChange={set("duration")} placeholder="e.g. 24:15" />
          </FormField>
          <FormField label="Additional Links">
            <Input value={form.links} onChange={set("links")} placeholder="https://…" />
          </FormField>
        </div>

        <FormField label="Attached Resources">
          <AttachedResources items={form.resources} onChange={set("resources")} />
        </FormField>

        <Toggle
          value={form.downloadable}
          onChange={set("downloadable")}
          label="Allow Download"
          desc="Learners can download this video for offline viewing"
        />

        {file && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl cursor-pointer"
            style={{ background: P.lightSage, border: `1px solid ${P.sage}` }}
          >
            <Play size={14} style={{ color: P.olive }} />
            <p className="text-xs font-medium" style={{ color: P.darkOlive }}>
              Preview video before saving
            </p>
            <ExternalLink size={12} className="ml-auto" style={{ color: P.sage }} />
          </div>
        )}
      </div>

      <div className="mt-5">
        <NavButtons
          onBack={onClose}
          onSave={saveVideo}
          nextDisabled={!file || !form.title.trim()}
        />
      </div>
    </div>
  );
}

// ─── DOCUMENT workflow ────────────────────────────────────────
