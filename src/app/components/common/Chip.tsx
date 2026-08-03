import type React from "react";
import { P } from "../../constants/theme.constants";

export function Chip({
  label,
  variant = "sage",
}: {
  label: string;
  variant?: "sage" | "gold" | "olive" | "red" | "green" | "neutral";
}) {
  const styles: Record<string, string> = {
    sage: `bg-[${P.lightSage}] text-[#065F46] border-[#C4D4A8]`,
    gold: `bg-[${P.goldLight}] text-[#8A6A1A] border-[#E8D090]`,
    olive: `bg-[${P.lightSage}] text-[#065F46] border-[#6EE7B7]`,
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-green-50 text-green-700 border-green-200",
    neutral: `bg-[${P.paleGreen}] text-[#4B7468] border-[#A7F3D0]`,
  };
  const inlineStyle: Record<string, React.CSSProperties> = {
    sage: { background: P.lightSage, color: P.darkOlive, borderColor: "#C4D4A8" },
    gold: { background: P.goldLight, color: "#8A6A1A", borderColor: "#E8D090" },
    olive: { background: P.lightSage, color: P.darkOlive, borderColor: P.sage },
    red: { background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA" },
    green: { background: "#F0FDF4", color: "#15803D", borderColor: "#BBF7D0" },
    neutral: { background: P.paleGreen, color: P.textMuted, borderColor: P.border },
  };
  return (
    <span
      className="inline-flex items-center text-[11px] font-medium px-3 py-1 rounded-full border"
      style={inlineStyle[variant]}
    >
      {label}
    </span>
  );
}
