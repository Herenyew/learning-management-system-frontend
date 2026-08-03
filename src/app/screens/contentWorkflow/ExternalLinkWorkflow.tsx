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

export function ExternalLinkWorkflow({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (item: ContentWorkflowSavePayload) => void;
}) {
  const [form, setForm] = useState({
    url: "",
    title: "",
    openInNewTab: true,
    completionRule: "visit" as "visit" | "time" | "manual",
    requiredMinutes: "5",
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));

  const isValidUrl = (u: string) => {
    try {
      new URL(u);
      return true;
    } catch {
      return false;
    }
  };
  const saveExternalLink = () =>
    onSave({
      title: form.title.trim(),
      meta: form.url.trim(),
      duration: form.completionRule === "time" ? `${form.requiredMinutes} min` : "External link",
      source: "external",
      primaryFile: form.url.trim(),
      attachments: [
        {
          name: form.title.trim(),
          source: "External link",
          detail:
            form.completionRule === "time"
              ? `${form.requiredMinutes} min required`
              : `${form.completionRule} completion`,
        },
      ],
    });

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader title="Add External Link" onClose={onClose} />

      <div className="space-y-4">
        <FormField
          label="URL"
          required
          hint={form.url && !isValidUrl(form.url) ? "⚠ Please enter a valid URL" : undefined}
        >
          <div className="relative">
            <Globe
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: P.sage }}
            />
            <input
              value={form.url}
              onChange={(e) => set("url")(e.target.value)}
              placeholder="https://example.com/resource"
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl bg-white focus:outline-none focus:ring-2"
              style={{
                border: `1px solid ${form.url && !isValidUrl(form.url) ? "#C0392B" : P.border}`,
                color: P.text,
              }}
            />
          </div>
        </FormField>

        <FormField label="Display Title" required>
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Harvard Business Review Article"
          />
        </FormField>

        <Toggle
          value={form.openInNewTab}
          onChange={set("openInNewTab")}
          label="Open in New Tab"
          desc="Recommended to keep learners in the LMS"
        />

        <FormField label="Completion Rule">
          <div className="space-y-2">
            {[
              ["visit", "Mark complete on first visit", "Learner clicks the link"],
              ["time", "Time-based completion", "Require minimum time on page"],
              ["manual", "Manual completion", "Learner marks it complete themselves"],
            ].map(([v, l, d]) => (
              <label
                key={v}
                onClick={() => set("completionRule")(v)}
                className="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: form.completionRule === v ? P.olive : P.border,
                  background: form.completionRule === v ? P.paleGreen : "white",
                }}
              >
                <input
                  type="radio"
                  checked={form.completionRule === v}
                  onChange={() => {}}
                  style={{ accentColor: P.olive, marginTop: 2 }}
                />
                <div>
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {l}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {d}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        {form.completionRule === "time" && (
          <FormField label="Required Time Spent (minutes)">
            <Input
              value={form.requiredMinutes}
              onChange={set("requiredMinutes")}
              placeholder="5"
              type="number"
            />
          </FormField>
        )}
      </div>

      <div className="mt-5">
        <NavButtons
          onBack={onClose}
          onSave={saveExternalLink}
          nextDisabled={!form.url || !isValidUrl(form.url) || !form.title.trim()}
        />
      </div>
    </div>
  );
}

// ─── QUIZ workflow ────────────────────────────────────────────

// Data types
