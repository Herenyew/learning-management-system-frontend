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

export function SurveyWorkflow({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: "",
    anonymous: true,
    questions: [] as { text: string; type: string }[],
  });
  const set = (k: keyof typeof form) => (v: any) => setForm((p) => ({ ...p, [k]: v }));
  const addQ = () => set("questions")([...form.questions, { text: "", type: "rating" }]);
  const updateQ = (i: number, k: "text" | "type", v: string) =>
    set("questions")(form.questions.map((q, j) => (j === i ? { ...q, [k]: v } : q)));

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader title="Add Survey" onClose={onClose} />

      <div className="space-y-4">
        <FormField label="Survey Name" required>
          <Input value={form.name} onChange={set("name")} placeholder="e.g. Post-Course Feedback" />
        </FormField>

        <Toggle
          value={form.anonymous}
          onChange={set("anonymous")}
          label="Anonymous Responses"
          desc="Learner identity is not linked to their responses"
        />

        {/* Preset question sets */}
        <div className="rounded-xl border p-4" style={{ borderColor: P.border }}>
          <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
            Quick-add Question Sets
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "NPS (Net Promoter Score)",
              "Post-Course Satisfaction",
              "Learning Effectiveness",
              "Instructor Feedback",
            ].map((s) => (
              <button
                key={s}
                onClick={() => {
                  const presets: Record<string, { text: string; type: string }[]> = {
                    "NPS (Net Promoter Score)": [
                      { text: "How likely are you to recommend this course? (0–10)", type: "nps" },
                    ],
                    "Post-Course Satisfaction": [
                      { text: "How satisfied were you with this course?", type: "rating" },
                      { text: "What did you find most valuable?", type: "text" },
                    ],
                    "Learning Effectiveness": [
                      { text: "How confident are you applying what you learned?", type: "rating" },
                      { text: "What topics need more depth?", type: "text" },
                    ],
                    "Instructor Feedback": [
                      { text: "Rate the instructor's clarity and engagement.", type: "rating" },
                      { text: "Any feedback for the instructor?", type: "text" },
                    ],
                  };
                  set("questions")([...form.questions, ...(presets[s] || [])]);
                }}
                className="text-[11px] font-medium px-2.5 py-1.5 rounded-full border transition-colors"
                style={{ borderColor: P.border, color: P.olive }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = P.lightSage)
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background = "transparent")
                }
              >
                + {s}
              </button>
            ))}
          </div>
        </div>

        {/* Question list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Questions ({form.questions.length})
            </p>
            <button
              onClick={addQ}
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={12} /> Custom Question
            </button>
          </div>
          <div className="space-y-2">
            {form.questions.map((q, i) => (
              <div
                key={i}
                className="flex gap-2 items-start p-2.5 rounded-xl"
                style={{ background: P.bg, border: `1px solid ${P.border}` }}
              >
                <div className="flex-1 min-w-0">
                  <input
                    value={q.text}
                    onChange={(e) => updateQ(i, "text", e.target.value)}
                    placeholder="Question text…"
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white focus:outline-none mb-1.5"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <select
                    value={q.type}
                    onChange={(e) => updateQ(i, "type", e.target.value)}
                    className="px-2 py-1 text-[11px] rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    <option value="rating">Rating (1–5)</option>
                    <option value="nps">NPS (0–10)</option>
                    <option value="text">Open Text</option>
                    <option value="mcq">Multiple Choice</option>
                    <option value="yesno">Yes / No</option>
                  </select>
                </div>
                <button
                  onClick={() => set("questions")(form.questions.filter((_, j) => j !== i))}
                  className="p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0 mt-0.5"
                >
                  <Trash2 size={12} style={{ color: "#C0392B" }} />
                </button>
              </div>
            ))}
            {form.questions.length === 0 && (
              <p className="text-[11px] py-2 text-center" style={{ color: P.textMuted }}>
                No questions yet. Use presets or add a custom question.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <NavButtons onBack={onClose} onSave={onSave} nextDisabled={!form.name.trim()} />
      </div>
    </div>
  );
}

// ─── LIVE SESSION workflow ────────────────────────────────────
