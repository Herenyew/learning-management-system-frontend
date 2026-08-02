import { Trash2, User } from "lucide-react";
import { type CertificationTemplate, P } from "../configuration.shared";

type CertificationTemplatesTabProps = {
  templateDeleteId: string | null;
  templateLibrary: CertificationTemplate[];
  onCancelDelete: () => void;
  onDelete: (templateId: string) => void;
  onEdit: (template: CertificationTemplate) => void;
  onManageSigners: (template: CertificationTemplate) => void;
  onRequestDelete: (templateId: string) => void;
};

export function CertificationTemplatesTab({
  templateDeleteId,
  templateLibrary,
  onCancelDelete,
  onDelete,
  onEdit,
  onManageSigners,
  onRequestDelete,
}: CertificationTemplatesTabProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templateLibrary.map((template) => (
        <div
          key={template.id}
          className="bg-white rounded-xl border overflow-hidden"
          style={{ borderColor: P.border }}
        >
          <div
            className="p-5 text-white relative"
            style={{
              background: `linear-gradient(135deg,${template.color},${template.color}cc)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,white 0,white 1px,transparent 0,transparent 50%)",
                backgroundSize: "10px 10px",
              }}
            />
            <div className="relative">
              <p
                className="text-[10px] tracking-widest uppercase mb-1"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Certificate Template
              </p>
              <p className="text-sm font-bold">{template.name}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {template.designMode && <CertificateMetaPill label={template.designMode} />}
                {template.borderLabel && <CertificateMetaPill label={template.borderLabel} />}
              </div>
              {template.hasStamp && (
                <span className="text-[10px] mt-1 block" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Official Stamp
                </span>
              )}
            </div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold mb-1.5" style={{ color: P.textMuted }}>
                SIGNATORIES
              </p>
              {template.signers.map((signer) => (
                <div key={signer} className="flex items-center gap-2 text-xs mb-1">
                  <User size={11} style={{ color: P.sage }} />
                  <span style={{ color: P.textMid }}>{signer}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs">
              <span style={{ color: P.textMuted }}>Issued / Archived</span>
              <span className="font-semibold" style={{ color: P.text }}>
                {template.active} / {template.archived}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onEdit(template)}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ background: P.lightSage, color: P.olive }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onManageSigners(template)}
                className="flex-1 py-2 rounded-lg text-xs font-medium"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Manage Signers
              </button>
              <button
                type="button"
                onClick={() => onRequestDelete(template.id)}
                className="w-10 py-2 rounded-lg text-xs font-medium flex items-center justify-center"
                style={{ border: `1px solid ${P.border}`, color: "#C0392B" }}
                title="Delete template"
                aria-label={`Delete ${template.name}`}
              >
                <Trash2 size={14} />
              </button>
            </div>

            {templateDeleteId === template.id && (
              <div
                className="rounded-xl border p-3 space-y-2"
                style={{ borderColor: "#F2C0B7", background: "#FFF8F6" }}
              >
                <p className="text-xs font-semibold" style={{ color: "#7A1F14" }}>
                  Delete this template?
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  This removes it from the templates list. Issued certificate records remain
                  unchanged.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                    style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(template.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#C0392B" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificateMetaPill({ label }: { label: string }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full"
      style={{
        background: "rgba(255,255,255,0.18)",
        color: "rgba(255,255,255,0.9)",
      }}
    >
      {label}
    </span>
  );
}
