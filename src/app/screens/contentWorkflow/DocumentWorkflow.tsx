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

export function DocumentWorkflow({
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
    pages: "",
    downloadable: true,
    resources: [] as string[],
    links: "",
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));
  const pageSummary = form.pages.trim() ? `${form.pages.trim()} pages` : "Document";
  const saveDocument = () =>
    onSave({
      title: form.title.trim(),
      description: form.desc.trim(),
      meta: pageSummary,
      duration: pageSummary,
      source,
      primaryFile: file,
      attachments: [
        { name: file, source: sourceLabelFor(source), detail: "Primary document" },
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
      <ModalHeader title="Add Document" stepLabel="Step 2 of 2 — Metadata" onClose={onClose} />
      <StepDots total={2} current={1} />

      <div className="space-y-4">
        {source === "upload" ? (
          <UploadZone accept=".pdf,.docx,.pptx,.xlsx" label="document" onFile={setFile} />
        ) : (
          <GDriveBrowser onSelect={setFile} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <FormField label="Document Title" required>
              <Input
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. AI Industry Report 2024"
              />
            </FormField>
          </div>
          <div className="col-span-2">
            <FormField label="Description">
              <Textarea
                value={form.desc}
                onChange={set("desc")}
                placeholder="What will learners find in this document?"
              />
            </FormField>
          </div>
          <FormField label="Number of Pages" hint="Shown to learners">
            <Input value={form.pages} onChange={set("pages")} placeholder="e.g. 42" type="number" />
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
          label="Downloadable"
          desc="Learners can download this document"
        />

        {file && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl cursor-pointer"
            style={{ background: P.lightSage, border: `1px solid ${P.sage}` }}
          >
            <Eye size={14} style={{ color: P.olive }} />
            <p className="text-xs font-medium" style={{ color: P.darkOlive }}>
              Preview document before saving
            </p>
            <ExternalLink size={12} className="ml-auto" style={{ color: P.sage }} />
          </div>
        )}
      </div>

      <div className="mt-5">
        <NavButtons
          onBack={onClose}
          onSave={saveDocument}
          nextDisabled={!file || !form.title.trim()}
        />
      </div>
    </div>
  );
}

// ─── AUDIO workflow ───────────────────────────────────────────
