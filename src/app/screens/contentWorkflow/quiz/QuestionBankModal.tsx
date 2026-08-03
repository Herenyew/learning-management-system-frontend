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
  BANK_QUESTIONS,
  Q_TYPE_OPTIONS,
  getQuestionTypeMeta,
  type QuizQuestion,
} from "./quiz.shared";

export function QuestionBankModal({
  onAdd,
  onClose,
}: {
  onAdd: (q: QuizQuestion) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [diffFilter, setDiffFilter] = useState("All");
  const [added, setAdded] = useState<Set<string>>(new Set());
  const cats = ["All", "AI & ML", "Compliance", "Technology", "Leadership"];
  const filtered = BANK_QUESTIONS.filter(
    (q) =>
      (catFilter === "All" || q.category === catFilter) &&
      (diffFilter === "All" || q.difficulty === diffFilter) &&
      q.text.toLowerCase().includes(search.toLowerCase()),
  );

  const handleAdd = (q: (typeof BANK_QUESTIONS)[0]) => {
    if (added.has(q.id)) return;
    setAdded((prev) => new Set([...prev, q.id]));
    onAdd({ ...q });
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(46,58,21,0.7)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: P.border }}
        >
          <div>
            <p
              className="text-base font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Question Bank
            </p>
            <p className="text-xs" style={{ color: P.textMuted }}>
              Search and add questions to your quiz
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} style={{ color: P.textMuted }} />
          </button>
        </div>
        <div className="px-6 py-3 border-b space-y-2" style={{ borderColor: P.border }}>
          <div className="relative">
            <HelpCircle
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: P.sage }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions…"
              className="w-full pl-8 pr-4 py-2 text-sm rounded-xl bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {cats.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={
                    catFilter === c
                      ? { background: P.olive, color: "white" }
                      : { background: P.bg, color: P.textMid, border: `1px solid ${P.border}` }
                  }
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {["All", "Easy", "Medium", "Hard"].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiffFilter(d)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={
                    diffFilter === d
                      ? { background: P.darkOlive, color: "white" }
                      : { background: P.bg, color: P.textMid, border: `1px solid ${P.border}` }
                  }
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: P.border }}>
          {filtered.map((q) => {
            const isAdded = added.has(q.id);
            const typeMeta = getQuestionTypeMeta(Q_TYPE_OPTIONS, q.type);
            return (
              <div
                key={q.id}
                className="flex items-start gap-3 px-6 py-3.5"
                style={{ background: isAdded ? P.lightSage : "white" }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${typeMeta.color}15` }}
                >
                  <typeMeta.icon size={13} style={{ color: typeMeta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug" style={{ color: P.text }}>
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{
                        background:
                          q.difficulty === "Easy"
                            ? "#D8EDCC"
                            : q.difficulty === "Medium"
                              ? P.goldLight
                              : "#FEE2E2",
                        color:
                          q.difficulty === "Easy"
                            ? "#3A6420"
                            : q.difficulty === "Medium"
                              ? "#8A6A1A"
                              : "#B91C1C",
                      }}
                    >
                      {q.difficulty}
                    </span>
                    <span className="text-[10px]" style={{ color: P.textMuted }}>
                      {typeMeta.label}
                    </span>
                    <span className="text-[10px]" style={{ color: P.textMuted }}>
                      ·
                    </span>
                    <span className="text-[10px]" style={{ color: P.textMuted }}>
                      {q.category}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleAdd(q)}
                  disabled={isAdded}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold flex-shrink-0 transition-all"
                  style={
                    isAdded
                      ? { background: P.lightSage, color: P.olive }
                      : { background: P.olive, color: "white" }
                  }
                >
                  {isAdded ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle size={11} /> Added
                    </span>
                  ) : (
                    "+ Add"
                  )}
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-center py-10" style={{ color: P.textMuted }}>
              No questions match your filters.
            </p>
          )}
        </div>
        <div className="px-6 py-3 border-t" style={{ borderColor: P.border }}>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            Done — {added.size} question{added.size !== 1 ? "s" : ""} added
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QuizBuilder (shared by all 3 paths) ───────────────────────
