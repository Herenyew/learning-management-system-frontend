import { Av, P, Plus, TEAM_MEMBERS, User, Users, X } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigAttendeesTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "attendees" && (
        <div className="max-w-2xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Attendee Assignment
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Individual Assignment", "Assign specific employees by name", "User"],
              ["Group Assignment", "Assign by department, role, or program", "Users"],
            ].map(([label, desc]) => (
              <button
                key={label}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: label === "Group Assignment" ? P.olive : P.border,
                  background: label === "Group Assignment" ? P.lightSage : "white",
                }}
                data-prototype-action="true"
              >
                <p className="text-sm font-semibold mb-0.5" style={{ color: P.text }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {desc}
                </p>
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
              Assign by Group
            </p>
            <div className="flex flex-wrap gap-2">
              {["Engineering", "Product", "Sales", "All Employees"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                  style={{ border: `1px solid ${P.border}` }}
                >
                  <input type="checkbox" style={{ accentColor: P.olive }} />
                  <span className="text-xs font-medium" style={{ color: P.textMid }}>
                    {g}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
              Assigned Individuals
            </p>
            <div className="space-y-2">
              {TEAM_MEMBERS.slice(0, 3).map((m) => (
                <div
                  key={m.name}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}` }}
                >
                  <Av initials={m.av} size={26} color={m.color} />
                  <p className="text-xs font-medium flex-1" style={{ color: P.text }}>
                    {m.name}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {m.role}
                  </p>
                  <button data-prototype-action="true">
                    <X size={13} style={{ color: P.textMuted }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
