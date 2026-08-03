import { P } from "../../constants/theme.constants";

// ─── Shared Components ─────────────────────────────────────────

export function Av({
  initials,
  size = 32,
  color = P.olive,
}: {
  initials: string;
  size?: number;
  color?: string;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
      style={{ width: size, height: size, background: color, fontSize: size * 0.36 }}
    >
      {initials}
    </div>
  );
}
