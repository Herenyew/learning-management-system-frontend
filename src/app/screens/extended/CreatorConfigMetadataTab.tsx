import { Download, FileText, Input, P, Plus, Textarea, Video, X } from "./extended.shared";
import type { CreatorConfigContext } from "./CreatorConfig.types";

export function CreatorConfigMetadataTab({ ctx }: { ctx: CreatorConfigContext }) {
  const { configTab } = ctx;

  return (
    <>
      {configTab === "metadata" && (
        <div className="max-w-2xl space-y-6">
          <h2
            className="text-base font-bold"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Content Metadata
          </h2>
          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-xs font-bold flex items-center gap-2" style={{ color: P.text }}>
              <FileText size={14} style={{ color: P.olive }} /> Document Metadata
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Number of Pages" type="number" placeholder="0" />
              <Input label="Estimated Read Time" placeholder="e.g. 45 min" />
            </div>
            <Textarea label="Description" placeholder="Document summary…" rows={2} />
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: P.bg }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: P.textMid }}>
                  Allow Download
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Learners can download this file
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                style={{ accentColor: P.olive, width: 16, height: 16 }}
              />
            </div>
          </div>
          <div
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <p className="text-xs font-bold flex items-center gap-2" style={{ color: P.text }}>
              <Video size={14} style={{ color: P.gold }} /> Video Metadata
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Video Duration" placeholder="e.g. 24:15" />
              <Input label="Max Viewers (optional)" type="number" placeholder="Unlimited" />
            </div>
            <div
              className="flex items-center justify-between p-3 rounded-lg"
              style={{ background: P.bg }}
            >
              <div>
                <p className="text-xs font-medium" style={{ color: P.textMid }}>
                  Allow Download
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Learners can download the video file
                </p>
              </div>
              <input type="checkbox" style={{ accentColor: P.olive, width: 16, height: 16 }} />
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                Attached Resources
              </p>
              <div className="space-y-1.5">
                {["Course Slides.pdf", "AI Strategy Template.xlsx"].map((r) => (
                  <div
                    key={r}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: P.bg }}
                  >
                    <FileText size={13} style={{ color: P.sage }} />
                    <p className="text-xs flex-1" style={{ color: P.textMid }}>
                      {r}
                    </p>
                    <button data-prototype-action="true">
                      <X size={12} style={{ color: P.textMuted }} />
                    </button>
                  </div>
                ))}
                <button
                  className="flex items-center gap-1.5 text-xs font-medium"
                  style={{ color: P.olive }}
                  data-prototype-action="true"
                >
                  <Plus size={12} /> Add Resource
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
