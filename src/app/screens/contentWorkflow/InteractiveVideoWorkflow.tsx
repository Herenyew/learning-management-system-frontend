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

export function InteractiveVideoWorkflow({
  source,
  onClose,
  onSave,
}: {
  source: "upload" | "gdrive";
  onClose: () => void;
  onSave: (item: ContentWorkflowSavePayload) => void;
}) {
  const [file, setFile] = useState("");
  const [questions, setQuestions] = useState([
    { time: "05:00", text: "What is supervised learning?", type: "MCQ" },
  ]);
  const [branching, setBranching] = useState(false);
  const [completionRule, setCompletionRule] = useState("watch");

  const addQ = () => setQuestions((p) => [...p, { time: "", text: "", type: "MCQ" }]);
  const removeQ = (i: number) => setQuestions((p) => p.filter((_, j) => j !== i));
  const updateQ = (i: number, k: string, v: string) =>
    setQuestions((p) => p.map((q, j) => (j === i ? { ...q, [k]: v } : q)));
  const saveInteractiveVideo = () =>
    onSave({
      title: file.replace(/\.(mp4|mov|webm)$/i, "") || "Interactive video",
      meta: `${questions.length} embedded questions`,
      duration: `${questions.length} questions`,
      source,
      primaryFile: file,
      attachments: [
        { name: file, source: sourceLabelFor(source), detail: "Primary interactive video" },
      ],
    });

  return (
    <div
      className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <ModalHeader
        title="Add Interactive Video"
        stepLabel="Step 2 of 2 — Configuration"
        onClose={onClose}
      />
      <StepDots total={2} current={1} />

      <div className="space-y-5">
        {source === "upload" ? (
          <UploadZone accept=".mp4,.mov,.webm" label="video file" onFile={setFile} />
        ) : (
          <GDriveBrowser onSelect={setFile} />
        )}

        {/* Embedded questions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Embedded Questions
            </p>
            <button
              onClick={addQ}
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: P.olive }}
            >
              <Plus size={12} /> Add Question
            </button>
          </div>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="p-3 rounded-xl border" style={{ borderColor: P.border }}>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div>
                    <label
                      className="block text-[10px] font-semibold mb-1"
                      style={{ color: P.textMuted }}
                    >
                      Timecode
                    </label>
                    <input
                      value={q.time}
                      onChange={(e) => updateQ(i, "time", e.target.value)}
                      placeholder="MM:SS"
                      className="w-full px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[10px] font-semibold mb-1"
                      style={{ color: P.textMuted }}
                    >
                      Type
                    </label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQ(i, "type", e.target.value)}
                      className="w-full px-2 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    >
                      <option>MCQ</option>
                      <option>True/False</option>
                      <option>Poll</option>
                    </select>
                  </div>
                  <div className="flex items-end justify-end pb-0.5">
                    <button onClick={() => removeQ(i)} className="p-1.5 rounded-lg hover:bg-red-50">
                      <Trash2 size={12} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                </div>
                <input
                  value={q.text}
                  onChange={(e) => updateQ(i, "text", e.target.value)}
                  placeholder="Question text…"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            ))}
          </div>
        </div>

        <Toggle
          value={branching}
          onChange={setBranching}
          label="Branching Logic"
          desc="Show different video segments based on learner answers"
        />

        <FormField label="Completion Rule">
          <div className="grid grid-cols-3 gap-2">
            {[
              ["watch", "Watch 80%+"],
              ["answer", "Answer all Qs"],
              ["pass", "Pass all Qs"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setCompletionRule(v)}
                className="py-2 rounded-xl text-[11px] font-semibold border-2 transition-all"
                style={{
                  borderColor: completionRule === v ? P.olive : P.border,
                  background: completionRule === v ? P.paleGreen : "white",
                  color: completionRule === v ? P.darkOlive : P.textMid,
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <div className="mt-5">
        <NavButtons onBack={onClose} onSave={saveInteractiveVideo} nextDisabled={!file} />
      </div>
    </div>
  );
}

// ─── ASSIGNMENT workflow ──────────────────────────────────────
