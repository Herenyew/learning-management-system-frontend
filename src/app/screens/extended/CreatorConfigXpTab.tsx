import { P, Plus } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigXpTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "xp-config" && (
        <div className="max-w-xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Course XP Configuration
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            {[
              ["Course Completion XP", "450"],
              ["Quiz Pass XP", "80"],
              ["Perfect Score Bonus XP", "150"],
              ["Performance XP (per % above pass threshold)", "5"],
            ].map(([label, val]) => (
              <div key={label}>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    defaultValue={val}
                    className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                  <span className="text-xs px-2" style={{ color: P.textMuted }}>
                    XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
