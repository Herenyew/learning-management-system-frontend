import type { CertificationBuilderViewContext } from "../CertificationTemplateBuilderView";
import { Chip, P } from "../configuration.shared";

type CertificationBuilderSignersStepProps = {
  ctx: Pick<
    CertificationBuilderViewContext,
    | "backendSigners"
    | "primarySigner"
    | "primarySignerRecord"
    | "secondarySigner"
    | "secondarySignerRecord"
    | "setPrimarySigner"
    | "setSecondarySigner"
  >;
};

export function CertificationBuilderSignersStep({ ctx }: CertificationBuilderSignersStepProps) {
  const {
    backendSigners,
    primarySigner,
    primarySignerRecord,
    secondarySigner,
    secondarySignerRecord,
    setPrimarySigner,
    setSecondarySigner,
  } = ctx;

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4" style={{ borderColor: P.border }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          Backend Signers & Assets
        </p>
        <p className="text-xs mt-1" style={{ color: P.textMuted }}>
          Signer names, titles, and signature images are selected from the approved backend
          registry.
        </p>
      </div>

      {[
        ["Primary signer", primarySigner, setPrimarySigner],
        ["Secondary signer", secondarySigner, setSecondarySigner],
      ].map(([label, value, setter]) => (
        <div key={label as string}>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
            {label as string}
          </label>
          <select
            value={value as string}
            onChange={(event) => (setter as (value: string) => void)(event.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          >
            {backendSigners.map((signer) => (
              <option key={signer.id} value={signer.id}>
                {signer.name} - {signer.title}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="space-y-2">
        {[primarySignerRecord, secondarySignerRecord].map((signer) => (
          <div
            key={signer.id}
            className="p-3 rounded-lg"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {signer.name}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {signer.title} - {signer.dept}
                </p>
              </div>
              <Chip label={signer.status} variant="green" />
            </div>
            <div
              className="mt-2 px-3 py-2 rounded-lg text-lg"
              style={{
                background: "white",
                border: `1px dashed ${P.border}`,
                color: P.deepOlive,
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
              }}
            >
              {signer.signature}
            </div>
            <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
              Auth scope: {signer.auth}
            </p>
          </div>
        ))}
      </div>

      <div className="p-3 rounded-lg" style={{ background: P.lightSage }}>
        <p className="text-[10px] font-bold uppercase" style={{ color: P.darkOlive }}>
          Backend contract
        </p>
        <p className="text-[10px] mt-1 leading-relaxed" style={{ color: P.textMid }}>
          GET /api/certificate-signers, GET /api/certificate-designs, GET /api/certificate-stamps,
          POST /api/certificate-templates
        </p>
      </div>
    </div>
  );
}
