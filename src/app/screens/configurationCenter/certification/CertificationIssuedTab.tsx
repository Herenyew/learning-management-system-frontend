import { Download } from "lucide-react";
import { Av, Chip, P } from "../configuration.shared";

const issuedCertificates = [
  {
    name: "Alex Mercer",
    av: "AM",
    cert: "Standard Completion",
    course: "Cybersecurity Fundamentals",
    issued: "Jan 12, 2025",
    expires: "Jan 12, 2027",
    status: "Active",
  },
  {
    name: "Marcus Johnson",
    av: "MJ",
    cert: "Compliance Attestation",
    course: "GDPR Training",
    issued: "Dec 5, 2024",
    expires: "Dec 5, 2025",
    status: "Expiring Soon",
  },
  {
    name: "Priya Nair",
    av: "PN",
    cert: "Standard Completion",
    course: "Leadership Basics",
    issued: "Nov 18, 2024",
    expires: "Nov 18, 2026",
    status: "Active",
  },
  {
    name: "Luca Ferrari",
    av: "LF",
    cert: "Standard Completion",
    course: "Data Privacy 2022",
    issued: "Mar 10, 2022",
    expires: "Mar 10, 2023",
    status: "Expired",
  },
];

export function CertificationIssuedTab() {
  return (
    <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${P.border}` }}
      >
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          All Issued Certificates
        </p>
        <div className="flex gap-2">
          {["Active", "Expiring Soon", "Expired"].map((filter) => (
            <button
              key={filter}
              className="px-3 py-1 rounded-full text-xs"
              style={{ background: P.lightSage, color: P.olive }}
              data-prototype-action="true"
              type="button"
            >
              {filter}
            </button>
          ))}
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
            type="button"
          >
            <Download size={11} /> Export
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: `1px solid ${P.border}50` }}>
            {["Learner", "Certificate", "Course", "Issued", "Expires", "Status"].map((heading) => (
              <th
                key={heading}
                className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase"
                style={{ color: P.textMuted }}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {issuedCertificates.map((row) => (
            <tr
              key={row.name}
              className="hover:bg-[#F6FEFA] transition-colors"
              style={{ borderBottom: `1px solid ${P.border}50` }}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Av initials={row.av} size={26} color={P.sage} />
                  <p className="text-xs font-medium" style={{ color: P.text }}>
                    {row.name}
                  </p>
                </div>
              </td>
              <td className="px-4 py-3">
                <p className="text-xs" style={{ color: P.textMid }}>
                  {row.cert}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {row.course}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                  {row.issued}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                  {row.expires}
                </p>
              </td>
              <td className="px-4 py-3">
                <Chip
                  label={row.status}
                  variant={
                    row.status === "Active"
                      ? "green"
                      : row.status === "Expiring Soon"
                        ? "gold"
                        : "red"
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
