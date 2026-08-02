import React from "react";
import { Copy, Edit, Eye, HelpCircle, Trash2 } from "lucide-react";
import { P } from "./contentWorkflow.shared";
import type { SavedContentItem } from "./ContentWorkflowModal";

export function QuizRow({
  item,
  onPreview,
  onDelete,
}: {
  item: SavedContentItem;
  onPreview: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      onClick={onPreview}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer group/qrow transition-colors animate-[fadeInDown_0.3s_ease]"
      style={{ background: P.goldLight, borderTop: `1px solid ${P.border}` }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = P.goldMid)}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = P.goldLight)}
    >
      <div
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
        style={{ background: "#C8A85D22" }}
      >
        <HelpCircle size={11} style={{ color: "#C8A85D" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: P.text }}>
          {item.title}
        </p>
        {item.meta && (
          <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
            {item.meta}
          </p>
        )}
      </div>
      <span
        className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: "#C8A85D20", color: "#8A6A1A", border: "1px solid #C8A85D40" }}
      >
        Quiz
      </span>
      <div
        className="flex items-center gap-1 opacity-0 group-hover/qrow:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="p-1 rounded hover:bg-white" title="Preview" onClick={onPreview}>
          <Eye size={11} style={{ color: P.olive }} />
        </button>
        <button className="p-1 rounded hover:bg-white" title="Edit" data-prototype-action="true">
          <Edit size={11} style={{ color: P.sage }} />
        </button>
        <button
          className="p-1 rounded hover:bg-white"
          title="Duplicate"
          data-prototype-action="true"
        >
          <Copy size={11} style={{ color: P.sage }} />
        </button>
        <button className="p-1 rounded hover:bg-red-50" title="Delete" onClick={onDelete}>
          <Trash2 size={11} style={{ color: "#C0392B" }} />
        </button>
      </div>
    </div>
  );
}

// ─── QuizPreviewModal — interactive question-by-question preview ─
