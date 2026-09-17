import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { P } from "./extended.shared";

export const programFieldClass =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60";

export const programButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

export function mutationMessage(reason: unknown, fallback: string): string {
  return reason instanceof Error && reason.message ? reason.message : fallback;
}

export function toDateInput(value?: string | null): string {
  return value ? value.slice(0, 10) : "";
}

export function nullableNumber(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export function HRProgramSectionShell({
  title,
  description,
  icon: Icon,
  loading,
  error,
  onRetry,
  actions,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-white p-5" style={{ borderColor: P.border }}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: P.paleGreen, color: P.olive }}>
            <Icon size={17} />
          </div>
          <div>
            <h2 className="text-sm font-bold" style={{ color: P.text }}>{title}</h2>
            <p className="mt-0.5 text-[11px] leading-5" style={{ color: P.textMuted }}>{description}</p>
          </div>
        </div>
        {actions}
      </div>
      {loading ? (
        <div className="flex items-center gap-2 py-5 text-xs" style={{ color: P.textMuted }}>
          <LoaderCircle className="animate-spin" size={15} /> Loading…
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">
          <AlertCircle className="mt-0.5 shrink-0" size={14} />
          <span className="flex-1">{error}</span>
          {onRetry && <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 font-semibold"><RefreshCw size={12} /> Retry</button>}
        </div>
      ) : children}
    </section>
  );
}

export function SectionMutationError({ message }: { message: string }) {
  return message ? <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">{message}</div> : null;
}
