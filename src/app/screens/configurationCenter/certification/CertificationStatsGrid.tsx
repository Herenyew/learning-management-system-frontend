import { Archive, Award, CheckCircle, AlertTriangle } from "lucide-react";
import { P } from "../configuration.shared";

type CertificationStatsGridProps = {
  templateCount: number;
};

export function CertificationStatsGrid({ templateCount }: CertificationStatsGridProps) {
  const stats = [
    ["Templates", String(templateCount), Award, P.olive, P.lightSage],
    ["Active Certs", "31", CheckCircle, "#5A7A2A", "#D8EDCC"],
    ["Expiring Soon", "8", AlertTriangle, P.gold, P.goldLight],
    ["Expired", "54", Archive, P.textMuted, P.paleGreen],
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(([label, value, Icon, color, background]) => (
        <div
          key={label}
          className="bg-white rounded-xl border p-4"
          style={{ borderColor: P.border }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
              {label}
            </p>
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background }}
            >
              <Icon size={14} style={{ color }} />
            </div>
          </div>
          <p
            className="text-xl font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
