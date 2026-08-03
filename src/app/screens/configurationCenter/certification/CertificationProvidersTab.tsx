import { Chip, EXTERNAL_PROVIDERS, P } from "../configuration.shared";

export function CertificationProvidersTab() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {EXTERNAL_PROVIDERS.map((provider) => (
        <div
          key={provider.name}
          className="bg-white rounded-xl border p-4 hover:shadow-md transition-all"
          style={{ borderColor: P.border }}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: P.lightSage }}
            >
              {provider.logo}
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: P.text }}>
                {provider.name}
              </p>
              <Chip
                label={provider.status}
                variant={provider.status === "Integrated" ? "green" : "gold"}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {provider.certs.map((certificate) => (
              <span
                key={certificate}
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: P.lightSage, color: P.darkOlive }}
              >
                {certificate}
              </span>
            ))}
          </div>

          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: `1px solid ${P.border}` }}
          >
            <p className="text-xs" style={{ color: P.textMuted }}>
              <strong style={{ color: P.text }}>{provider.learners}</strong> active learners
            </p>
            {provider.status === "Integrated" ? (
              <span className="text-[11px] font-medium" style={{ color: "#5A7A2A" }}>
                Connected
              </span>
            ) : (
              <button
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: P.lightSage, color: P.olive }}
                data-prototype-action="true"
                type="button"
              >
                Connect
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
