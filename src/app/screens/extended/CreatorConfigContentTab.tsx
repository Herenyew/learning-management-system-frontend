import React from "react";
import { Cpu, FileText, HelpCircle, Link, P, Plus, Upload, Video } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigContentTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "content" && (
        <div className="max-w-2xl space-y-5">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Content Sources
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["Upload File", "Upload documents, videos, or SCORM packages directly", Upload],
                ["Google Drive", "Import content from Google Drive or Workspace", Link],
                ["YouTube / Vimeo", "Embed video from YouTube or Vimeo by URL", Video],
                ["SCORM Package", "Upload a pre-built SCORM/xAPI package", Cpu],
              ] as [string, string, React.ElementType][]
            ).map(([label, desc, Icon]) => (
              <button
                key={label}
                className="p-4 rounded-xl border text-left hover:shadow-sm transition-all"
                style={{ borderColor: P.border }}
                data-prototype-action="true"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-2"
                  style={{ background: P.lightSage }}
                >
                  <Icon size={16} style={{ color: P.olive }} />
                </div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: P.text }}>
                  {label}
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {desc}
                </p>
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
              Content Type
            </p>
            <div className="flex gap-2">
              {(
                [
                  ["Document", FileText],
                  ["Video", Video],
                  ["Quiz", HelpCircle],
                  ["SCORM", Cpu],
                ] as [string, React.ElementType][]
              ).map(([label, Icon]) => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                  style={{
                    background: label === "Video" ? P.olive : "white",
                    color: label === "Video" ? "white" : P.textMid,
                    border: `1px solid ${label === "Video" ? P.olive : P.border}`,
                  }}
                  data-prototype-action="true"
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
