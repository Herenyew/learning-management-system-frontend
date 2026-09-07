import type React from "react";
import { ShieldX, ArrowLeft, LayoutDashboard } from "lucide-react";
import { P } from "../../constants/theme.constants";

type AccessDeniedProps = {
  permission?: string;
  title?: string;
  message?: string;
};

export function AccessDenied({ permission, title = "Access Denied", message }: AccessDeniedProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6" style={{ color: P.text }}>
      <div
        className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm"
        style={{ borderColor: P.border }}
      >
        {/* Icon */}
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl"
          style={{ background: "#FFF2F0", color: "#C0392B" }}
        >
          <ShieldX size={26} />
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
          {title}
        </h2>

        {/* Message */}
        <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
          {message ||
            (permission
              ? `You need the "${permission}" permission to access this section. Contact your administrator to request access.`
              : "You don't have permission to access this section.")}
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            <ArrowLeft size={15} />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold"
            style={{ borderColor: P.border, color: P.textMid }}
          >
            <LayoutDashboard size={15} />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
