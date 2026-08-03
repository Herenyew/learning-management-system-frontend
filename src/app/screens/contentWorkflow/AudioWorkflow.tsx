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

export function AudioWorkflow({
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
    transcript: "",
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));
  const saveAudio = () =>
    onSave({
      title: form.title.trim(),
      description: form.desc.trim(),
      meta: form.duration.trim() || file,
      duration: form.duration.trim() || "Audio",
      source,
      primaryFile: file,
      attachments: [
        { name: file, source: sourceLabelFor(source), detail: "Primary audio file" },
        ...(form.transcript.trim()
          ? [
              {
                name: "Transcript",
                source: "Resource" as const,
                detail: "Transcript text included",
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
      <ModalHeader title="Add Audio" stepLabel="Step 2 of 2 — Metadata" onClose={onClose} />
      <StepDots total={2} current={1} />

      <div className="space-y-4">
        {source === "upload" ? (
          <UploadZone accept=".mp3,.wav,.m4a,.aac" label="audio file" onFile={setFile} />
        ) : (
          <GDriveBrowser onSelect={setFile} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FormField label="Audio Title" required>
              <Input
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. Leadership Podcast Episode 1"
              />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Description">
              <Textarea
                value={form.desc}
                onChange={set("desc")}
                placeholder="What is this audio about?"
              />
            </FormField>
          </div>
          <FormField label="Duration">
            <Input value={form.duration} onChange={set("duration")} placeholder="e.g. 18:30" />
          </FormField>
        </div>

        <FormField label="Transcript" hint="Optional — improves accessibility">
          <Textarea
            value={form.transcript}
            onChange={set("transcript")}
            placeholder="Paste or type transcript here…"
            rows={4}
          />
        </FormField>

        <Toggle
          value={form.downloadable}
          onChange={set("downloadable")}
          label="Allow Download"
          desc="Learners can download audio for offline listening"
        />
      </div>

      <div className="mt-5">
        <NavButtons
          onBack={onClose}
          onSave={saveAudio}
          nextDisabled={!file || !form.title.trim()}
        />
      </div>
    </div>
  );
}

// ─── SCORM / xAPI workflow ────────────────────────────────────
