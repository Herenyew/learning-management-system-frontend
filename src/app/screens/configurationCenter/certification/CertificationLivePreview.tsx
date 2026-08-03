import type { CertificationBuilderViewContext } from "../CertificationTemplateBuilderView";
import { Chip, P } from "../configuration.shared";

type CertificationLivePreviewProps = {
  ctx: CertificationBuilderViewContext;
};

export function CertificationLivePreview({ ctx }: CertificationLivePreviewProps) {
  const {
    activeDesign,
    canvasOrientation,
    designMode,
    primarySignerRecord,
    renderCertificatePresetCanvas,
    renderTemplateBackgroundLayer,
    resolveCertificateElementValue,
    scratchAccentColor,
    scratchBackgroundType,
    scratchBorderCss,
    scratchBorderStyle,
    scratchCanvasBackground,
    secondarySignerRecord,
    selectedElementId,
    setSelectedElementId,
    stampAssets,
    templateType,
    visibleCertificateElements,
  } = ctx;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Live Certificate Preview
            </p>
            <p className="text-xs" style={{ color: P.textMuted }}>
              Placeholder data shows how issued certificates will render.
            </p>
          </div>
          <Chip label={templateType} variant="gold" />
        </div>

        {designMode === "preset" ? (
          <div
            className="rounded-xl min-h-[520px] p-5 flex items-center justify-center"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}
          >
            <div className="w-full max-w-[920px]">
              {renderCertificatePresetCanvas(activeDesign)}
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl min-h-[520px] p-5 flex items-center justify-center"
            style={{ background: P.bg, border: `1px solid ${P.border}` }}
          >
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                width: "100%",
                maxWidth:
                  scratchBackgroundType === "template" || canvasOrientation === "landscape"
                    ? 900
                    : 560,
                aspectRatio:
                  scratchBackgroundType === "template"
                    ? "1.414 / 1"
                    : canvasOrientation === "landscape"
                      ? "1.414 / 1"
                      : "1 / 1.414",
                background: scratchCanvasBackground,
                border: scratchBorderCss,
                boxShadow: "0 18px 45px rgba(46,58,21,0.12)",
              }}
            >
              {scratchBackgroundType === "template" && renderTemplateBackgroundLayer(activeDesign)}
              <ScratchBorderDecoration ctx={ctx} />
              {visibleCertificateElements.map((element) => (
                <button
                  key={element.id}
                  type="button"
                  onClick={() => setSelectedElementId(element.id)}
                  className="absolute rounded-md transition-colors"
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.w}%`,
                    height: `${element.h}%`,
                    padding: 4,
                    color: element.color,
                    fontSize: element.fontSize,
                    lineHeight: 1.15,
                    textAlign: element.align,
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      element.align === "left"
                        ? "flex-start"
                        : element.align === "right"
                          ? "flex-end"
                          : "center",
                    background:
                      selectedElementId === element.id ? "rgba(4,120,87,0.08)" : "transparent",
                    border:
                      selectedElementId === element.id
                        ? `1px dashed ${P.olive}`
                        : "1px dashed transparent",
                    overflow: "hidden",
                  }}
                >
                  {element.type === "logo" && (
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: scratchAccentColor }}
                      >
                        AD
                      </span>
                      <span className="text-[11px] font-bold leading-tight">
                        {resolveCertificateElementValue(element)}
                      </span>
                    </span>
                  )}
                  {["title", "learner", "course", "date"].includes(element.type) && (
                    <span
                      className="w-full"
                      style={{
                        fontFamily: element.type === "learner" ? "Georgia, serif" : undefined,
                        fontWeight:
                          element.type === "title" || element.type === "learner" ? 700 : 600,
                      }}
                    >
                      {resolveCertificateElementValue(element)}
                    </span>
                  )}
                  {element.type === "signers" && (
                    <span className="grid grid-cols-2 gap-6 w-full">
                      {[primarySignerRecord, secondarySignerRecord].map((signer) => (
                        <span key={signer.id}>
                          <span
                            className="block mb-1"
                            style={{
                              fontFamily: "Georgia, serif",
                              fontStyle: "italic",
                              color: scratchAccentColor,
                            }}
                          >
                            {signer.signature}
                          </span>
                          <span className="block" style={{ borderTop: `1px solid ${P.border}` }} />
                          <span className="block mt-1 text-[10px] font-bold">{signer.name}</span>
                          <span className="block text-[9px]" style={{ color: P.textMuted }}>
                            {signer.title}
                          </span>
                        </span>
                      ))}
                    </span>
                  )}
                  {element.type === "stamp" && (
                    <span
                      className="rounded-full w-full h-full flex items-center justify-center text-center uppercase font-bold"
                      style={{
                        border: `3px solid ${scratchAccentColor}`,
                        color: scratchAccentColor,
                        opacity: 0.78,
                      }}
                    >
                      Official Seal
                    </span>
                  )}
                  {element.type === "qr" && (
                    <span
                      className="w-full h-full rounded-md flex items-end justify-center p-1 text-[8px] font-bold"
                      style={{
                        color: P.textMuted,
                        background:
                          "repeating-linear-gradient(45deg,#052E26 0 3px,#FFFFFF 3px 6px)",
                        boxShadow: "inset 0 0 0 5px white",
                      }}
                    >
                      VERIFY
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {stampAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-xl border p-3"
            style={{ borderColor: P.border }}
          >
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {asset.name}
            </p>
            <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
              {asset.owner}
            </p>
            <Chip label={asset.status} variant="green" />
          </div>
        ))}
        <div className="bg-white rounded-xl border p-3" style={{ borderColor: P.border }}>
          <p className="text-xs font-semibold" style={{ color: P.text }}>
            Verification QR
          </p>
          <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
            Auto-generated at issuance
          </p>
          <Chip label="Enabled" variant="green" />
        </div>
      </div>
    </div>
  );
}

function ScratchBorderDecoration({ ctx }: { ctx: CertificationBuilderViewContext }) {
  const { scratchAccentColor, scratchBackgroundType, scratchBorderStyle } = ctx;

  if (scratchBackgroundType === "template") return null;

  if (scratchBorderStyle === "corner") {
    return (
      <>
        <CornerFrame
          className="left-3 top-3"
          style={{ borderLeft: true, borderTop: true }}
          color={scratchAccentColor}
        />
        <CornerFrame
          className="right-3 top-3"
          style={{ borderRight: true, borderTop: true }}
          color={scratchAccentColor}
        />
        <CornerFrame
          className="left-3 bottom-3"
          style={{ borderLeft: true, borderBottom: true }}
          color={scratchAccentColor}
        />
        <CornerFrame
          className="right-3 bottom-3"
          style={{ borderRight: true, borderBottom: true }}
          color={scratchAccentColor}
        />
      </>
    );
  }

  if (scratchBorderStyle === "inset") {
    return (
      <div
        className="absolute inset-6 rounded-md pointer-events-none"
        style={{ border: `2px solid ${scratchAccentColor}` }}
      />
    );
  }

  if (scratchBorderStyle === "banded") {
    return (
      <>
        <div
          className="absolute inset-x-0 top-0 h-5 pointer-events-none"
          style={{ background: scratchAccentColor, opacity: 0.85 }}
        />
        <div
          className="absolute inset-x-0 bottom-0 h-5 pointer-events-none"
          style={{ background: scratchAccentColor, opacity: 0.85 }}
        />
      </>
    );
  }

  return null;
}

type CornerFrameStyle = {
  borderBottom?: boolean;
  borderLeft?: boolean;
  borderRight?: boolean;
  borderTop?: boolean;
};

function CornerFrame({
  className,
  color,
  style,
}: {
  className: string;
  color: string;
  style: CornerFrameStyle;
}) {
  return (
    <div
      className={`absolute w-14 h-14 pointer-events-none ${className}`}
      style={{
        borderBottom: style.borderBottom ? `3px solid ${color}` : undefined,
        borderLeft: style.borderLeft ? `3px solid ${color}` : undefined,
        borderRight: style.borderRight ? `3px solid ${color}` : undefined,
        borderTop: style.borderTop ? `3px solid ${color}` : undefined,
      }}
    />
  );
}
