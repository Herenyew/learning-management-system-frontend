import React, { useEffect, useState } from "react";
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
  FormField,
  Input,
  ModalHeader,
  NavButtons,
  P,
  StepDots,
  Textarea,
  Toggle,
} from "../contentWorkflow.shared";

import { QuizBuilder } from "./QuizBuilder";
import {
  EXISTING_QUIZZES,
  QUIZ_TEMPLATES,
  type QuestionTypeConfig,
  type QuizQuestion,
  type QuizSettings,
  type SavedQuiz,
} from "./quiz.shared";

export function QuizWorkflow({
  onClose,
  onSave,
  questionTypeConfig,
}: {
  onClose: () => void;
  onSave: (quiz?: SavedQuiz) => void;
  questionTypeConfig?: QuestionTypeConfig[];
}) {
  type Path = "method" | "template-browse" | "duplicate-browse" | "builder";
  const [path, setPath] = useState<Path>("method");
  const [method, setMethod] = useState<"template" | "duplicate" | "custom">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<(typeof QUIZ_TEMPLATES)[0] | null>(null);
  const [selectedExisting, setSelectedExisting] = useState<(typeof EXISTING_QUIZZES)[0] | null>(
    null,
  );

  const handleMethodContinue = () => {
    if (method === "template") setPath("template-browse");
    else if (method === "duplicate") setPath("duplicate-browse");
    else setPath("builder");
  };

  const getBuilderProps = (): {
    initialSettings: Partial<QuizSettings>;
    initialQuestions: QuizQuestion[];
    sourceLabel: string;
  } => {
    if (selectedTemplate)
      return {
        initialSettings: {
          name: `${selectedTemplate.name} (Copy)`,
          passThreshold: selectedTemplate.pass,
          maxAttempts: selectedTemplate.attempts,
          timeLimitMin: selectedTemplate.timeMin,
          randomize: selectedTemplate.randomized,
          timeEnabled: true,
        },
        initialQuestions: [],
        sourceLabel: `From Template: ${selectedTemplate.name}`,
      };
    if (selectedExisting)
      return {
        initialSettings: {
          name: `${selectedExisting.name} (Copy)`,
          passThreshold: selectedExisting.pass,
          maxAttempts: selectedExisting.attempts,
          timeLimitMin: selectedExisting.timeMin,
          timeEnabled: true,
        },
        initialQuestions: [],
        sourceLabel: `Duplicate: ${selectedExisting.name}`,
      };
    return { initialSettings: {}, initialQuestions: [], sourceLabel: "Custom Quiz Builder" };
  };

  // ── Method selection ──
  if (path === "method")
    return (
      <div
        className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl modal-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader title="Add Quiz" stepLabel="Step 1 — Choose Method" onClose={onClose} />
        <StepDots total={3} current={0} />
        <p className="text-xs mb-4" style={{ color: P.textMuted }}>
          How would you like to create this quiz?
        </p>
        <div className="space-y-3 mb-5">
          {[
            {
              v: "template" as const,
              icon: Bookmark,
              color: "#C8A85D",
              label: "Use Company Template",
              desc: "Select from HR-approved templates — Compliance, Technical, Leadership, and more",
            },
            {
              v: "duplicate" as const,
              icon: Copy,
              color: P.darkOlive,
              label: "Duplicate Existing Quiz",
              desc: "Copy any quiz from the course library and customize it",
            },
            {
              v: "custom" as const,
              icon: Wand2,
              color: P.olive,
              label: "Create Custom Quiz",
              desc: "Build from scratch with full control over questions, scoring, and behaviour",
            },
          ].map(({ v, icon: Icon, color, label, desc }) => (
            <label
              key={v}
              onClick={() => setMethod(v)}
              className="flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all"
              style={{
                borderColor: method === v ? P.olive : P.border,
                background: method === v ? P.paleGreen : "white",
              }}
            >
              <input
                type="radio"
                checked={method === v}
                onChange={() => {}}
                style={{ accentColor: P.olive, marginTop: 2, flexShrink: 0 }}
              />
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                  {desc}
                </p>
              </div>
            </label>
          ))}
        </div>
        <NavButtons onNext={handleMethodContinue} nextLabel="Continue →" />
      </div>
    );

  // ── Template browser ──
  if (path === "template-browse")
    return (
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title="Choose a Template"
          stepLabel="Step 2 — Select Template"
          onClose={onClose}
          onBack={() => setPath("method")}
        />
        <StepDots total={3} current={1} />
        <div className="grid grid-cols-2 gap-3 mb-5">
          {QUIZ_TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className="text-left p-4 rounded-xl border-2 transition-all"
              style={{
                borderColor: selectedTemplate?.id === t.id ? P.olive : P.border,
                background: selectedTemplate?.id === t.id ? P.paleGreen : "white",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: P.lightSage, color: P.darkOlive }}
                >
                  {t.category}
                </span>
                {selectedTemplate?.id === t.id && (
                  <CheckCircle size={16} style={{ color: P.olive }} />
                )}
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: P.text }}>
                {t.name}
              </p>
              <p className="text-[11px] mb-3 leading-snug" style={{ color: P.textMuted }}>
                {t.desc}
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  [String(t.questions) + " Q", "Questions"],
                  [t.pass + "%", "Pass Score"],
                  [String(t.attempts), "Attempts"],
                  [t.timeMin + "min", "Time"],
                ].map(([v, l]) => (
                  <div
                    key={l}
                    className="p-1.5 rounded-lg text-center"
                    style={{ background: selectedTemplate?.id === t.id ? P.lightSage : `${P.bg}` }}
                  >
                    <p className="text-xs font-bold" style={{ color: P.text }}>
                      {v}
                    </p>
                    <p className="text-[9px]" style={{ color: P.textMuted }}>
                      {l}
                    </p>
                  </div>
                ))}
                <div
                  className="col-span-2 p-1.5 rounded-lg text-center"
                  style={{ background: selectedTemplate?.id === t.id ? P.lightSage : P.bg }}
                >
                  <p className="text-[10px] font-medium" style={{ color: P.textMid }}>
                    Randomized: {t.randomized ? "Yes" : "No"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div
          className="p-3 rounded-xl mb-4"
          style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
        >
          <p className="text-[11px]" style={{ color: "#8A6A1A" }}>
            Selecting a template creates an editable copy. The original template remains unchanged.
          </p>
        </div>
        <NavButtons
          onNext={() => selectedTemplate && setPath("builder")}
          nextLabel="Edit Template →"
          nextDisabled={!selectedTemplate}
        />
      </div>
    );

  // ── Duplicate browser ──
  if (path === "duplicate-browse")
    return (
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl modal-scale-in max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          title="Choose a Quiz to Duplicate"
          stepLabel="Step 2 — Select Quiz"
          onClose={onClose}
          onBack={() => setPath("method")}
        />
        <StepDots total={3} current={1} />
        <div className="space-y-2.5 mb-5">
          {EXISTING_QUIZZES.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelectedExisting(q)}
              className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-4"
              style={{
                borderColor: selectedExisting?.id === q.id ? P.olive : P.border,
                background: selectedExisting?.id === q.id ? P.paleGreen : "white",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${P.gold}18` }}
              >
                <HelpCircle size={18} style={{ color: P.gold }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {q.name}
                  </p>
                  {selectedExisting?.id === q.id && (
                    <CheckCircle size={16} style={{ color: P.olive, flexShrink: 0 }} />
                  )}
                </div>
                <p className="text-[11px] mb-2" style={{ color: P.textMuted }}>
                  From: {q.module}
                </p>
                <div className="flex gap-3 text-[11px]" style={{ color: P.textMid }}>
                  <span>
                    <strong>{q.questions}</strong> questions
                  </span>
                  <span>
                    <strong>{q.pass}%</strong> pass
                  </span>
                  <span>
                    <strong>{q.attempts}</strong> attempts
                  </span>
                  <span>
                    <strong>{q.timeMin}min</strong>
                  </span>
                  <span style={{ color: P.textMuted }}>Last used {q.lastUsed}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div
          className="p-3 rounded-xl mb-4"
          style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
        >
          <p className="text-[11px]" style={{ color: "#8A6A1A" }}>
            Duplicating creates an independent copy. The original quiz remains unchanged.
          </p>
        </div>
        <NavButtons
          onNext={() => selectedExisting && setPath("builder")}
          nextLabel="Edit Copy →"
          nextDisabled={!selectedExisting}
        />
      </div>
    );

  // ── Builder ──
  if (path === "builder") {
    const props = getBuilderProps();
    return (
      <QuizBuilder
        {...props}
        questionTypeConfig={questionTypeConfig}
        onBack={
          method === "custom"
            ? () => setPath("method")
            : () => setPath(method === "template" ? "template-browse" : "duplicate-browse")
        }
        onSave={(savedQuiz) => onSave(savedQuiz)}
      />
    );
  }

  return null;
}

// ─── MAIN MODAL ───────────────────────────────────────────────
