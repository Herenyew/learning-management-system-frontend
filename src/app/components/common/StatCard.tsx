import type React from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { P } from "../../constants/theme.constants";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color = P.olive,
  bg = P.lightSage,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  color?: string;
  bg?: string;
  trend?: "up" | "down" | "neutral";
}) {
  return (
    <div
      className="kpi-pulse bg-white rounded-2xl border p-6 min-h-[128px] cursor-default"
      style={{ borderColor: P.border, transition: "box-shadow 300ms ease, transform 200ms ease" }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(4,120,87,0.13)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
      }}
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
          {label}
        </p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: bg, transition: "transform 200ms ease" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.12)")
          }
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.transform = "")}
        >
          <Icon size={17} style={{ color }} />
        </div>
      </div>
      <p
        className="kpi-value text-3xl font-bold"
        style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
      >
        {value}
      </p>
      {sub && (
        <p
          className="kpi-trend text-xs mt-2 flex items-center gap-1"
          style={{ color: trend === "up" ? "#5A7A2A" : trend === "down" ? "#C0392B" : P.textMuted }}
        >
          {trend === "up" && <TrendingUp size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          {sub}
        </p>
      )}
    </div>
  );
}
