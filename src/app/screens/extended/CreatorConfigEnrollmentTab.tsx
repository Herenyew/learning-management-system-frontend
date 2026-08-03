import { Badge, Input, P, Plus, Select } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigEnrollmentTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab, enrollment, setEnrollment } = ctx;

  return (
    <>
      {configTab === "enrollment" && (
        <div className="max-w-xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Enrollment Configuration
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-3"
            style={{ borderColor: P.border }}
          >
            {[
              ["Open", "Anyone can enroll without approval", "Recommended for most courses"],
              [
                "Invitation",
                "Learners must be invited by admin or manager",
                "Useful for exclusive cohorts",
              ],
              ["Paid", "Learners must purchase access", "For external courses with a fee"],
            ].map(([opt, desc, note]) => (
              <label
                key={opt}
                onClick={() => setEnrollment(opt)}
                className="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: enrollment === opt ? P.olive : P.border,
                  background: enrollment === opt ? P.paleGreen : "white",
                }}
              >
                <input
                  type="radio"
                  name="enrollment"
                  checked={enrollment === opt}
                  onChange={() => {}}
                  style={{ accentColor: P.olive, marginTop: 2 }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold" style={{ color: P.text }}>
                      {opt}
                    </p>
                    <Badge label={note} variant="neutral" />
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                    {desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
          {enrollment === "Paid" && (
            <div
              className="bg-white rounded-xl border p-5 space-y-3"
              style={{ borderColor: P.border }}
            >
              <Input label="Course Price (USD)" type="number" placeholder="0.00" required />
              <Select label="Payment Gateway" options={["Stripe", "PayPal", "Internal Billing"]} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
