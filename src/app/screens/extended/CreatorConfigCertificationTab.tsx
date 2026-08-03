import { Award, CERT_TEMPLATES, P, Plus } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigCertificationTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "certification" && (
        <div className="max-w-2xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Certification Configuration
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold" style={{ color: P.text }}>
                  Enable Certificate
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  Award a certificate upon course completion
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                style={{ accentColor: P.olive, width: 18, height: 18 }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                Minimum Certification Score (%)<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="flex gap-2">
                {["60%", "70%", "75%", "80%", "90%", "100%"].map((p) => (
                  <button
                    key={p}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{
                      background: p === "80%" ? P.olive : "white",
                      color: p === "80%" ? "white" : P.textMid,
                      border: `1px solid ${p === "80%" ? P.olive : P.border}`,
                    }}
                    data-prototype-action="true"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Certificate Template
              </label>
              <div className="space-y-2">
                {CERT_TEMPLATES.slice(0, 2).map((t) => (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer"
                    style={{ borderColor: t.id === "ct1" ? P.olive : P.border }}
                  >
                    <input
                      type="radio"
                      name="certTemplate"
                      defaultChecked={t.id === "ct1"}
                      style={{ accentColor: P.olive }}
                    />
                    <div
                      className="w-8 h-8 rounded-lg flex-shrink-0"
                      style={{ background: `${t.color}20` }}
                    />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {t.name}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        Signers: {t.signers.join(", ")}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
