import {
  AICard,
  AlertCircle,
  Badge,
  Check,
  CheckCircle,
  Lock,
  P,
  Plus,
  Send,
} from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigPublishingTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab, pubStatus, setPubStatus } = ctx;

  return (
    <>
      {configTab === "publishing" && (
        <div className="max-w-xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Publishing Status
          </h2>

          {/* Read-only status notice */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{ background: "#FDF5E0", border: `1px solid ${P.gold}40` }}
          >
            <Lock size={16} style={{ color: P.gold, flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="text-xs font-semibold" style={{ color: "#8A6A1A" }}>
                Publishing Requires HR/Admin Approval
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9A7A20" }}>
                You cannot directly set your course status to "Published". Submit for review and
                your HR administrator will approve or reject the publication. You will be notified
                at each stage.
              </p>
            </div>
          </div>

          {/* Current status (read-only display) */}
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
            <p className="text-xs font-semibold mb-3" style={{ color: P.textMid }}>
              Current Publication Status
            </p>
            <div className="space-y-3">
              {[
                {
                  status: "Draft",
                  desc: "Course saved locally. Not submitted for review.",
                  current: pubStatus === "Draft",
                  done: ["In Review", "Approved", "Published"].includes(pubStatus),
                },
                {
                  status: "In Review",
                  desc: "Submitted to HR/Admin. Awaiting review.",
                  current: pubStatus === "In Review",
                  done: ["Approved", "Published"].includes(pubStatus),
                },
                {
                  status: "Approved",
                  desc: "Approved by reviewer. Will be published soon.",
                  current: pubStatus === "Approved",
                  done: pubStatus === "Published",
                },
                {
                  status: "Published",
                  desc: "Live and visible to assigned learners.",
                  current: pubStatus === "Published",
                  done: false,
                },
              ].map(({ status, desc, current, done }) => (
                <div
                  key={status}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{
                    background: current ? P.lightSage : P.bg,
                    border: `1px solid ${current ? P.olive : P.border}`,
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: done ? "#5A7A2A" : current ? P.olive : P.border }}
                  >
                    {done ? (
                      <CheckCircle size={13} className="text-white" />
                    ) : current ? (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full" style={{ background: P.textMuted }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold" style={{ color: P.text }}>
                      {status}
                    </p>
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      {desc}
                    </p>
                  </div>
                  <Badge
                    label={status}
                    variant={
                      status === "Published"
                        ? "green"
                        : status === "Approved"
                          ? "sage"
                          : status === "In Review"
                            ? "gold"
                            : "neutral"
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {pubStatus === "Draft" && (
            <div className="space-y-3">
              <AICard title="AI Readiness Check">
                <div className="space-y-1.5">
                  {[
                    ["Course description is complete", true],
                    ["All modules have content", true],
                    ["Quiz has at least 5 questions", true],
                    ["Certificate template selected", false],
                    ["Contact person assigned", false],
                  ].map(([item, done]) => (
                    <div key={item as string} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle size={13} style={{ color: "#5A7A2A" }} />
                      ) : (
                        <AlertCircle size={13} style={{ color: P.gold }} />
                      )}
                      <span style={{ color: done ? "#5A7A2A" : "#8A6A1A" }}>{item as string}</span>
                    </div>
                  ))}
                </div>
              </AICard>
              <button
                onClick={() => setPubStatus("In Review")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: P.olive }}
              >
                <Send size={14} /> Submit for HR Review
              </button>
            </div>
          )}
          {pubStatus === "In Review" && (
            <div
              className="p-4 rounded-xl"
              style={{ background: P.goldLight, border: `1px solid ${P.gold}40` }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "#8A6A1A" }}>
                ⏳ Under Review
              </p>
              <p className="text-xs" style={{ color: "#9A7A20" }}>
                Your course has been submitted. HR is currently reviewing content, quiz accuracy,
                and compliance. You will receive a notification when a decision is made.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
