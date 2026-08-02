import { P, Plus, Textarea, Users } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigVisibilityTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab, setVisibility, visibility } = ctx;

  return (
    <>
      {configTab === "visibility" && (
        <div className="max-w-xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Visibility Configuration
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-3"
            style={{ borderColor: P.border }}
          >
            {[
              ["Everyone", "Visible to all users, including anonymous visitors"],
              ["Signed In Users", "Only visible to authenticated employees"],
              ["Course Attendees", "Only visible to enrolled learners"],
              ["Invitation Only", "Visible only to specifically invited users"],
            ].map(([opt, desc]) => (
              <label
                key={opt}
                onClick={() => setVisibility(opt)}
                className="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: visibility === opt ? P.olive : P.border,
                  background: visibility === opt ? P.paleGreen : "white",
                }}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === opt}
                  onChange={() => {}}
                  style={{ accentColor: P.olive, marginTop: 2 }}
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    {opt}
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
          <div
            className="bg-white rounded-xl border p-5 space-y-3"
            style={{ borderColor: P.border }}
          >
            <p className="text-xs font-semibold" style={{ color: P.textMid }}>
              Attendance Policy
            </p>
            <Textarea
              label="Attendance Requirements"
              placeholder="Describe any attendance requirements for this course…"
              rows={2}
            />
          </div>
        </div>
      )}
    </>
  );
}
