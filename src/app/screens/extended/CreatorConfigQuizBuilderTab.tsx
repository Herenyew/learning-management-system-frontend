import { P, PBar, Plus, Settings } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigQuizBuilderTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "quiz-builder" && (
        <div className="max-w-2xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Quiz Builder & Scoring Rules
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Quiz Settings
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Pass Threshold (%)
                </label>
                <input
                  type="number"
                  defaultValue="70"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Max Attempts
                </label>
                <input
                  type="number"
                  defaultValue="3"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Time Limit (minutes)
                </label>
                <input
                  type="number"
                  defaultValue="30"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Retry Cooldown (hours)
                </label>
                <input
                  type="number"
                  defaultValue="24"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            </div>
            <div className="space-y-2">
              {[
                ["Enable Retries", "Allow learners to retake after failure", true],
                ["Randomize Questions", "Shuffle question order per attempt", true],
                ["Show Correct Answers", "Display answers after submission", false],
                ["Attempt-Based Scoring", "Higher score attempts count more", false],
              ].map(([label, desc, checked]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ background: P.bg }}
                >
                  <div>
                    <p className="text-xs font-medium" style={{ color: P.textMid }}>
                      {label as string}
                    </p>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {desc as string}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked={checked as boolean}
                    style={{ accentColor: P.olive, width: 16, height: 16 }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Question Types
            </p>
            <div className="flex gap-2">
              {["Multiple Choice", "True / False", "Short Answer", "Drag & Drop"].map((t) => (
                <button
                  key={t}
                  className="px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    background:
                      t === "Multiple Choice" || t === "True / False" ? P.lightSage : "white",
                    color:
                      t === "Multiple Choice" || t === "True / False" ? P.darkOlive : P.textMuted,
                    border: `1px solid ${t === "Multiple Choice" || t === "True / False" ? P.sage : P.border}`,
                  }}
                  data-prototype-action="true"
                >
                  {t}
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Question Weight Distribution
              </p>
              <div className="space-y-1.5">
                {[
                  ["Easy", "30%"],
                  ["Medium", "50%"],
                  ["Hard", "20%"],
                ].map(([d, w]) => (
                  <div key={d} className="flex items-center gap-3">
                    <span className="text-xs w-14" style={{ color: P.textMid }}>
                      {d}
                    </span>
                    <div className="flex-1">
                      <PBar
                        value={parseInt(w)}
                        color={d === "Easy" ? "#5A7A2A" : d === "Medium" ? P.olive : P.gold}
                        height={6}
                      />
                    </div>
                    <input
                      type="number"
                      defaultValue={parseInt(w)}
                      className="w-14 px-2 py-1 text-xs rounded bg-white text-right"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    <span className="text-xs" style={{ color: P.textMuted }}>
                      %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
