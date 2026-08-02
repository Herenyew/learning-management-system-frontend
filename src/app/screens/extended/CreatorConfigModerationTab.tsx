import { Badge, P, Plus } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigModerationTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "moderation" && (
        <div className="max-w-xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Comments & Reviews Moderation
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-3"
            style={{ borderColor: P.border }}
          >
            {[
              ["Enable Comments", "Allow learners to comment on lessons", true],
              ["Enable Reviews", "Allow learners to submit star ratings and reviews", true],
              [
                "Require Review Approval",
                "New reviews need moderator approval before publishing",
                false,
              ],
              ["Allow Anonymous Reviews", "Let learners submit reviews without their name", false],
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
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
              Moderation Actions
            </p>
            <div className="space-y-2">
              {[
                "Hide Comments",
                "Delete Inappropriate Content",
                "Remove Reviews",
                "Report to HR Admin",
              ].map((action) => (
                <div
                  key={action}
                  className="flex items-center justify-between p-2.5 rounded-lg"
                  style={{ background: P.bg }}
                >
                  <p className="text-xs font-medium" style={{ color: P.textMid }}>
                    {action}
                  </p>
                  <Badge label="Enabled" variant="green" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
