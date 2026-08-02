import { Av, Chip, P } from "../configuration.shared";

const renewalRows = [
  {
    name: "Marcus Johnson",
    cert: "Compliance Attestation",
    expires: "Dec 5, 2025",
    daysLeft: 319,
    color: P.gold,
  },
  {
    name: "Luca Ferrari",
    cert: "Data Privacy",
    expires: "Mar 10, 2023",
    daysLeft: -500,
    color: "#C0392B",
  },
];

export function CertificationRenewalsTab() {
  return (
    <div className="space-y-3">
      {renewalRows.map((row) => (
        <div
          key={row.name}
          className="bg-white rounded-xl border p-4 flex items-center gap-4"
          style={{ borderColor: row.daysLeft < 0 ? "#FECACA" : P.border }}
        >
          <Av
            initials={initialsFor(row.name)}
            size={36}
            color={row.daysLeft < 0 ? "#C0392B" : P.gold}
          />
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              {row.name}
            </p>
            <p className="text-xs" style={{ color: P.textMuted }}>
              {row.cert} - Expires {row.expires}
            </p>
          </div>
          <Chip
            label={row.daysLeft < 0 ? "Expired" : `${row.daysLeft}d remaining`}
            variant={row.daysLeft < 0 ? "red" : "gold"}
          />
          <button
            className="px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ background: P.lightSage, color: P.olive }}
            data-prototype-action="true"
            type="button"
          >
            Send Reminder
          </button>
        </div>
      ))}
    </div>
  );
}

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}
