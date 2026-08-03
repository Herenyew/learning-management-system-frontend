import { P } from "../../constants/theme.constants";

export function PBar({
  value,
  color = P.olive,
  height = 5,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: P.lightSage }}
    >
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  );
}
