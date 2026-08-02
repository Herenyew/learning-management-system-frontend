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

export function ScormWorkflow({
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
    launchUrl: "",
    threshold: "80",
    trackingMode: "completed",
    version: "scorm12",
  });
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  const saveScorm = () =>
    onSave({
      title: file.replace(/\.(zip|scorm)$/i, "") || "SCORM package",
      meta: `${form.version.toUpperCase()} package`,
      duration: `${form.threshold}% threshold`,
      source,
      primaryFile: file,
      attachments: [
        { name: file, source: sourceLabelFor(source), detail: "SCORM / xAPI package" },
        ...(form.launchUrl.trim()
          ? [
              {
                name: form.launchUrl.trim(),
                source: "Resource" as const,
                detail: "Launch URL",
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
      <ModalHeader
        title="Add SCORM / xAPI Package"
        stepLabel="Step 2 of 2 — Configuration"
        onClose={onClose}
      />
      <StepDots total={2} current={1} />

      <div className="space-y-4">
        <UploadZone accept=".zip,.scorm" label="SCORM / xAPI package (.zip)" onFile={setFile} />

        <FormField label="Package Standard" required>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["scorm12", "SCORM 1.2"],
              ["scorm2004", "SCORM 2004"],
              ["xapi", "xAPI (Tin Can)"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => set("version")(v)}
                className="py-2.5 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: form.version === v ? P.olive : P.border,
                  background: form.version === v ? P.paleGreen : "white",
                  color: form.version === v ? P.darkOlive : P.textMid,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </FormField>

        <FormField
          label="Launch URL"
          hint="Entry point within the package (auto-detected from manifest)"
        >
          <Input value={form.launchUrl} onChange={set("launchUrl")} placeholder="index.html" />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Completion Threshold (%)" hint="Minimum score to mark complete">
            <Input
              value={form.threshold}
              onChange={set("threshold")}
              placeholder="80"
              type="number"
            />
          </FormField>
          <FormField label="Tracking Mode">
            <select
              value={form.trackingMode}
              onChange={(e) => set("trackingMode")(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              <option value="completed">Completion status</option>
              <option value="passed">Passed / Failed</option>
              <option value="score">Score only</option>
              <option value="time">Time spent</option>
            </select>
          </FormField>
        </div>

        <div
          className="p-3.5 rounded-xl flex items-start gap-3"
          style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
        >
          <AlertCircle size={14} style={{ color: "#8A6A1A", marginTop: 1, flexShrink: 0 }} />
          <p className="text-[11px]" style={{ color: "#7A5A10" }}>
            SCORM packages are launched in a sandboxed iframe. Ensure your package is self-contained
            and references only relative paths.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <NavButtons onBack={onClose} onSave={saveScorm} nextDisabled={!file} />
      </div>
    </div>
  );
}

// ─── INTERACTIVE VIDEO workflow ───────────────────────────────
