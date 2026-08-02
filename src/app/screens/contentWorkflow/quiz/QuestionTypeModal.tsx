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

import {
  CUSTOM_QUESTION_TYPE_COLORS,
  makeCustomQuestionTypeId,
  type QType,
  type QuestionResponseMode,
  type QuestionTypeOption,
} from "./quiz.shared";

export function QuestionTypeModal({
  questionTypes,
  allowCustomTypes,
  onSelect,
  onAddType,
  onClose,
}: {
  questionTypes: QuestionTypeOption[];
  allowCustomTypes: boolean;
  onSelect: (t: QType) => void;
  onAddType: (option: QuestionTypeOption) => void;
  onClose: () => void;
}) {
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeDesc, setNewTypeDesc] = useState("");
  const [newTypeMode, setNewTypeMode] = useState<QuestionResponseMode>("rubric");
  const [notice, setNotice] = useState("");

  const addQuestionType = () => {
    const label = newTypeName.trim();
    if (!label) return;

    const existing = questionTypes.find(
      (option) =>
        option.label.toLowerCase() === label.toLowerCase() ||
        option.type.toLowerCase() === makeCustomQuestionTypeId(label).toLowerCase(),
    );

    if (existing) {
      setNotice(`${existing.label} is already available.`);
      return;
    }

    const customCount = questionTypes.filter((option) => option.custom).length;
    const option: QuestionTypeOption = {
      type: makeCustomQuestionTypeId(label),
      label,
      desc: newTypeDesc.trim() || "Custom question type with configurable answer setup",
      icon: HelpCircle,
      color: CUSTOM_QUESTION_TYPE_COLORS[customCount % CUSTOM_QUESTION_TYPE_COLORS.length],
      custom: true,
      responseMode: newTypeMode,
    };

    onAddType(option);
    onSelect(option.type);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(46,58,21,0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: P.textMuted }}
            >
              Step 1
            </p>
            <h3
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Choose Question Type
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} style={{ color: P.textMuted }} />
          </button>
        </div>
        {questionTypes.length ? (
          <div className="grid grid-cols-3 gap-2.5">
            {questionTypes.map(({ type, label, desc, icon: Icon, color, custom }) => (
              <button
                key={type}
                onClick={() => onSelect(type)}
                className="flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all group"
                style={{ borderColor: P.border }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                  (e.currentTarget as HTMLButtonElement).style.background = `${color}08`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = P.border;
                  (e.currentTarget as HTMLButtonElement).style.background = "white";
                }}
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}15` }}
                >
                  <Icon size={15} style={{ color }} />
                </div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: P.text }}>
                    {label}
                    {custom && (
                      <span
                        className="ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                        style={{ background: P.goldLight, color: "#8A6A1A" }}
                      >
                        Custom
                      </span>
                    )}
                  </p>
                  <p className="text-[9px] leading-tight mt-0.5" style={{ color: P.textMuted }}>
                    {desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div
            className="rounded-xl border p-4 text-sm"
            style={{ borderColor: P.border, background: P.bg, color: P.textMuted }}
          >
            No question types are currently enabled for course creators.
          </div>
        )}
        {allowCustomTypes && (
          <div className="mt-4 rounded-xl border p-3" style={{ borderColor: P.border }}>
            <button
              onClick={() => setShowNewTypeForm((value) => !value)}
              className="flex w-full items-center justify-between text-left"
            >
              <span>
                <span className="block text-xs font-bold" style={{ color: P.text }}>
                  Add another question type
                </span>
                <span className="block text-[10px]" style={{ color: P.textMuted }}>
                  Configure a reusable custom type for scenario, file-based, or rubric questions.
                </span>
              </span>
              <Plus size={15} style={{ color: P.olive }} />
            </button>

            {showNewTypeForm && (
              <div className="mt-3 grid gap-2">
                <input
                  value={newTypeName}
                  onChange={(e) => {
                    setNewTypeName(e.target.value);
                    setNotice("");
                  }}
                  placeholder="e.g. Scenario Analysis"
                  className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
                <input
                  value={newTypeDesc}
                  onChange={(e) => setNewTypeDesc(e.target.value)}
                  placeholder="Short description shown in the picker"
                  className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <select
                    value={newTypeMode}
                    onChange={(e) => setNewTypeMode(e.target.value as QuestionResponseMode)}
                    className="px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    <option value="rubric">Reviewer rubric</option>
                    <option value="shortText">Short expected answer</option>
                    <option value="longText">Long-form response</option>
                    <option value="fileEvidence">File or evidence review</option>
                  </select>
                  <button
                    onClick={addQuestionType}
                    disabled={!newTypeName.trim()}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{
                      background: newTypeName.trim() ? P.olive : P.sage,
                      opacity: newTypeName.trim() ? 1 : 0.65,
                    }}
                  >
                    Add Type
                  </button>
                </div>
                {notice && (
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {notice}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Question Editor Modal ─────────────────────────────────────
