import type { CertificationBuilderViewContext } from "../CertificationTemplateBuilderView";
import { P } from "../configuration.shared";

type CertificationBuilderDetailsStepProps = {
  ctx: Pick<
    CertificationBuilderViewContext,
    | "expiryRule"
    | "setExpiryRule"
    | "setTemplateName"
    | "setTemplateType"
    | "templateName"
    | "templateType"
  >;
};

export function CertificationBuilderDetailsStep({ ctx }: CertificationBuilderDetailsStepProps) {
  const {
    expiryRule,
    setExpiryRule,
    setTemplateName,
    setTemplateType,
    templateName,
    templateType,
  } = ctx;

  return (
    <div className="bg-white rounded-xl border p-5 space-y-4" style={{ borderColor: P.border }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: P.text }}>
          Template Details
        </p>
        <p className="text-xs mt-1" style={{ color: P.textMuted }}>
          These fields drive generated PDF metadata and issued certificate records.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
          Template name
        </label>
        <input
          value={templateName}
          onChange={(event) => setTemplateName(event.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg bg-white"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
            Certificate type
          </label>
          <select
            value={templateType}
            onChange={(event) => setTemplateType(event.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          >
            {[
              "Course completion",
              "Program completion",
              "Compliance attestation",
              "External certification",
            ].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
            Expiry rule
          </label>
          <select
            value={expiryRule}
            onChange={(event) => setExpiryRule(event.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          >
            {["No expiry", "Valid for 1 year", "Valid for 2 years", "Custom per course"].map(
              (rule) => (
                <option key={rule}>{rule}</option>
              ),
            )}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
          Certificate ID pattern
        </label>
        <input
          defaultValue="ADIU-{COURSE}-{YYYY}-{SEQ}"
          className="w-full px-3 py-2 text-sm rounded-lg bg-white font-mono"
          style={{ border: `1px solid ${P.border}`, color: P.text }}
        />
      </div>
    </div>
  );
}
