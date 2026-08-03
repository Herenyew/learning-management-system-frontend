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

export function AssignmentWorkflow({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    title: "",
    desc: "",
    submissionType: "file" as "file" | "text" | "both",
    dueDate: "",
    peerReview: false,
    maxScore: "100",
    rubric: [] as { criterion: string; points: string }[],
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));
  const addRubric = () => set("rubric")([...form.rubric, { criterion: "", points: "" }]);
  const updateRubric = (i: number, k: "criterion" | "points", v: string) =>
    set("rubric")(form.rubric.map((r, j) => (j === i ? { ...r, [k]: v } : r)));

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader title="Add Assignment" onClose={onClose} />

      <div className="space-y-4">
        <FormField label="Assignment Title" required>
          <Input
            value={form.title}
            onChange={set("title")}
            placeholder="e.g. Strategic AI Business Plan"
          />
        </FormField>

        <FormField label="Description / Instructions">
          <Textarea
            value={form.desc}
            onChange={set("desc")}
            placeholder="Describe the task, expectations, and deliverables…"
            rows={3}
          />
        </FormField>

        <FormField label="Submission Type">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["file", "File Upload"],
              ["text", "Text Entry"],
              ["both", "Both"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => set("submissionType")(v as any)}
                className="py-2.5 rounded-xl text-xs font-semibold border-2 transition-all"
                style={{
                  borderColor: form.submissionType === v ? P.olive : P.border,
                  background: form.submissionType === v ? P.paleGreen : "white",
                  color: form.submissionType === v ? P.darkOlive : P.textMid,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Due Date">
            <Input value={form.dueDate} onChange={set("dueDate")} type="date" />
          </FormField>
          <FormField label="Max Score">
            <Input
              value={form.maxScore}
              onChange={set("maxScore")}
              placeholder="100"
              type="number"
            />
          </FormField>
        </div>

        <Toggle
          value={form.peerReview}
          onChange={set("peerReview")}
          label="Enable Peer Review"
          desc="Learners review each other's submissions anonymously"
        />

        {/* Grading Rubric */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Grading Rubric
            </p>
            <button
              onClick={addRubric}
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={12} /> Add Criterion
            </button>
          </div>
          {form.rubric.length === 0 ? (
            <p className="text-[11px] py-2" style={{ color: P.textMuted }}>
              No rubric criteria yet. Add one above.
            </p>
          ) : (
            <div className="space-y-2">
              {form.rubric.map((r, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={r.criterion}
                    onChange={(e) => updateRubric(i, "criterion", e.target.value)}
                    placeholder="e.g. Clarity of argument"
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <input
                    value={r.points}
                    onChange={(e) => updateRubric(i, "points", e.target.value)}
                    placeholder="pts"
                    type="number"
                    className="w-16 px-2 py-2 text-xs rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <button
                    onClick={() => set("rubric")(form.rubric.filter((_, j) => j !== i))}
                    className="p-1.5 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 size={12} style={{ color: "#C0392B" }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <NavButtons onBack={onClose} onSave={onSave} nextDisabled={!form.title.trim()} />
      </div>
    </div>
  );
}

// ─── SURVEY workflow ──────────────────────────────────────────
