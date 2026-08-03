import type React from "react";
import { P } from "../../constants/theme.constants";

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5">
      <div className="min-w-0">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
        >
          {title}
        </h1>
        {sub && (
          <p className="text-sm line-clamp-1 max-w-3xl" style={{ color: P.textMuted }}>
            {sub}
          </p>
        )}
      </div>
      {actions && <div className="flex gap-3 flex-shrink-0">{actions}</div>}
    </div>
  );
}
