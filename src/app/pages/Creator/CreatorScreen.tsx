import React, { useState } from "react";
import {
  CheckCircle,
  ChevronRight,
  HelpCircle,
  Play,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  Video,
  Wand2,
} from "lucide-react";
import { AICard } from "../../components/common";
import { P } from "../../constants/theme.constants";
export function CreatorScreen() {
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [activeModule, setActiveModule] = useState(0);
  const [tab, setTab] = useState<"build" | "preview" | "publish">("build");
  const modules = [
    {
      title: "Module 1: Introduction & Foundations",
      lessons: ["Welcome & Overview", "Key Concepts", "Why This Matters"],
    },
    {
      title: "Module 2: Core Skills",
      lessons: ["Lesson 2.1", "Lesson 2.2", "Practice Exercise", "Mini Quiz"],
    },
    {
      title: "Module 3: Advanced Applications",
      lessons: ["Case Study", "Expert Interview", "Final Assessment"],
    },
  ];
  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="flex h-full overflow-hidden" style={{ background: P.bg }}>
      <div
        className="w-[240px] flex-shrink-0 bg-white flex flex-col"
        style={{ borderRight: `1px solid ${P.border}` }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <p className="text-xs font-bold mb-0.5" style={{ color: P.text }}>
            Course Structure
          </p>
          <p className="text-[10px]" style={{ color: P.textMuted }}>
            Drag to reorder modules
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {modules.map((mod, mi) => (
            <div key={mi}>
              <button
                onClick={() => setActiveModule(mi)}
                className="w-full text-left px-3 py-2 rounded-lg text-[11px] font-semibold transition-colors"
                style={
                  activeModule === mi
                    ? { background: P.lightSage, color: P.darkOlive }
                    : { color: P.textMid }
                }
              >
                {mod.title}
              </button>
              {activeModule === mi && (
                <div className="ml-3 mt-1 space-y-0.5">
                  {mod.lessons.map((lesson, li) => (
                    <div
                      key={li}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-[11px] cursor-pointer hover:bg-[#F6FEFA]"
                      style={{ color: P.textMuted }}
                    >
                      <Play size={9} style={{ color: P.sage }} /> {lesson}
                    </div>
                  ))}
                  <button
                    className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-medium"
                    style={{ color: P.olive }}
                    data-prototype-action="true"
                  >
                    <Plus size={11} /> Add lesson
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium w-full"
            style={{ color: P.olive }}
            data-prototype-action="true"
          >
            <Plus size={13} /> Add module
          </button>
        </div>
        <div
          className="p-3 text-[10px] space-y-1"
          style={{ borderTop: `1px solid ${P.border}`, color: P.textMuted }}
        >
          <p>📹 3 modules · 10 lessons</p>
          <p>⏱️ Estimated: ~4 hours</p>
          <p style={{ color: P.gold }}>⚠️ 2 incomplete lessons</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="bg-white px-5 py-3 flex items-center gap-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <div className="flex-1">
            <input
              defaultValue="AI & ML for Business Leaders — [DRAFT]"
              className="text-sm font-semibold bg-transparent focus:outline-none w-full max-w-md"
              style={{ color: P.text }}
            />
            <p className="text-[10px]" style={{ color: P.textMuted }}>
              Last saved 2 min ago · Draft
            </p>
          </div>
          <div className="flex gap-2">
            {(["build", "preview", "publish"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize"
                style={
                  tab === t
                    ? { background: P.olive, color: "white" }
                    : { background: P.lightSage, color: P.textMid }
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {tab === "build" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AICard title="AI Course Generator">
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#7A5A10" }}>
                Describe what you want to teach and AI will generate a complete course outline,
                lesson content, and assessments.
              </p>
              <div className="flex gap-2">
                <input
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. 'Create a 4-hour course on machine learning for business analysts…'"
                  className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
                  style={{ background: "white", border: `1px solid ${P.gold}40`, color: P.text }}
                />
                <button
                  onClick={handleGenerate}
                  disabled={generating || !aiPrompt}
                  className="px-4 py-2 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 disabled:opacity-50"
                  style={{ background: P.gold }}
                >
                  {generating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 size={12} /> Generate
                    </>
                  )}
                </button>
              </div>
              {generated && (
                <div
                  className="mt-3 p-3 bg-white rounded-lg"
                  style={{ border: `1px solid ${P.gold}30` }}
                >
                  <p
                    className="text-[10px] font-semibold mb-2 flex items-center gap-1.5"
                    style={{ color: "#8A6A1A" }}
                  >
                    <CheckCircle size={11} /> AI Generated Outline:
                  </p>
                  <div className="space-y-1 text-xs" style={{ color: P.textMid }}>
                    {[
                      "Module 1: Foundations of ML for Business (60 min)",
                      "Module 2: Data-Driven Decision Making (90 min)",
                      "Module 3: AI Tools & Applications (75 min)",
                      "Module 4: Building AI Strategy (45 min)",
                      "Final Assessment + Certificate",
                    ].map((m) => (
                      <p key={m} className="flex items-center gap-1.5">
                        <ChevronRight size={11} style={{ color: P.gold }} />
                        {m}
                      </p>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-2.5">
                    <button
                      className="px-3 py-1 text-white text-[10px] font-semibold rounded-md"
                      style={{ background: P.gold }}
                      data-prototype-action="true"
                    >
                      Apply to Course
                    </button>
                    <button
                      className="px-3 py-1 text-[10px] font-semibold rounded-md"
                      style={{
                        background: "white",
                        border: `1px solid ${P.gold}40`,
                        color: "#8A6A1A",
                      }}
                      data-prototype-action="true"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
            </AICard>
            <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  Welcome & Overview
                </p>
                <div className="flex gap-2">
                  {(
                    [
                      ["Video", Video],
                      ["Quiz", HelpCircle],
                      ["AI Write", Sparkles],
                    ] as [string, React.ElementType][]
                  ).map(([l, Icon]) => (
                    <button
                      key={l}
                      className="text-xs px-2 py-1 rounded flex items-center gap-1"
                      style={{
                        background: l === "AI Write" ? P.goldLight : P.lightSage,
                        color: l === "AI Write" ? "#8A6A1A" : P.darkOlive,
                      }}
                      data-prototype-action="true"
                    >
                      <Icon size={11} /> {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border rounded-lg min-h-48 p-4" style={{ borderColor: P.border }}>
                <div
                  className="flex gap-2 pb-2 mb-3"
                  style={{ borderBottom: `1px solid ${P.border}` }}
                >
                  {["B", "I", "H1", "H2", "• List", "{ } Code"].map((f) => (
                    <button
                      key={f}
                      className="text-[11px] font-medium px-2 py-0.5 rounded hover:bg-[#F6FEFA]"
                      style={{ color: P.textMid }}
                      data-prototype-action="true"
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div
                  className="text-sm leading-relaxed focus:outline-none"
                  contentEditable
                  suppressContentEditableWarning
                  style={{ color: P.text }}
                >
                  <p className="mb-2">
                    Welcome to <strong>AI & ML for Business Leaders</strong>!
                  </p>
                  <p style={{ color: P.textMid }}>
                    In this module, we'll establish the foundations you need to confidently navigate
                    AI initiatives in your organization.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {tab === "publish" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-2xl">
            <h2 className="text-base font-bold" style={{ color: P.text }}>
              Publish Settings
            </h2>
            <div
              className="bg-white rounded-xl border p-5 space-y-4"
              style={{ borderColor: P.border }}
            >
              {[
                ["Audience", "All Employees"],
                ["Enrollment", "Open (Self-enroll)"],
                ["Certificate", "Enabled — 80% quiz score"],
                ["Deadline", "No deadline"],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <p className="text-xs font-medium" style={{ color: P.textMid }}>
                    {l}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      {v}
                    </p>
                    <button
                      className="text-[10px] font-medium"
                      style={{ color: P.olive }}
                      data-prototype-action="true"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="px-5 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                data-prototype-action="true"
              >
                Save Draft
              </button>
              <button
                className="px-5 py-2.5 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5"
                style={{ background: P.olive }}
                data-prototype-action="true"
              >
                <Upload size={14} /> Publish Course
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="w-[260px] flex-shrink-0 bg-white flex flex-col"
        style={{ borderLeft: `1px solid ${P.border}` }}
      >
        <div className="p-4" style={{ borderBottom: `1px solid ${P.border}` }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: P.gold }}
            >
              <Sparkles size={12} className="text-white" />
            </div>
            <p className="text-xs font-bold" style={{ color: P.text }}>
              AI Creation Assistant
            </p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-3"
            style={{ color: P.textMuted }}
          >
            Quick Actions
          </p>
          {[
            "Generate module outline",
            "Write lesson description",
            "Create quiz questions",
            "Suggest learning objectives",
            "Generate course thumbnail",
            "Estimate completion time",
          ].map((action) => (
            <button
              key={action}
              className="w-full text-left px-3 py-2 rounded-lg text-xs border transition-colors"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              data-prototype-action="true"
            >
              <Sparkles size={11} className="inline mr-1.5" style={{ color: P.gold }} />
              {action}
            </button>
          ))}
          <div className="pt-3">
            <div
              className="p-2.5 rounded-lg"
              style={{ background: P.goldLight, border: `1px solid ${P.gold}30` }}
            >
              <p className="text-[10px] leading-relaxed" style={{ color: "#8A6A1A" }}>
                💡 Courses with 3-5 modules and 15-20 min lessons have 40% higher completion rates
                than longer formats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 15. NOTIFICATIONS ────────────────────────────────────────
