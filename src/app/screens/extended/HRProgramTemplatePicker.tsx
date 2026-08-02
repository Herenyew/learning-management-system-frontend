import React from "react";
import { P } from "./extended.shared";
import type { HRProgramCreateTabContext } from "./HRProgramCreateTab";

export function HRProgramTemplatePicker({ ctx }: { ctx: HRProgramCreateTabContext }) {
  const { applyProgramTemplate, programTemplates, setActiveTab } = ctx;

  return (
    <div
      className="rounded-xl border p-4 space-y-3"
      style={{ borderColor: P.border, background: P.bg }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold" style={{ color: P.text }}>
            Start from a reusable template
          </p>
          <p className="text-[10px]" style={{ color: P.textMuted }}>
            Templates include courses, task sequences, milestones, and assessment rules.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("templates")}
          className="px-3 py-2 rounded-lg text-xs font-semibold"
          style={{
            border: `1px solid ${P.border}`,
            color: P.textMid,
            background: "white",
          }}
        >
          Browse Templates
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {programTemplates.slice(0, 2).map((template) => (
          <button
            key={template.id}
            onClick={() => applyProgramTemplate(template)}
            className="p-3 rounded-lg text-left"
            style={{ background: "white", border: `1px solid ${P.border}` }}
          >
            <p className="text-xs font-semibold" style={{ color: P.text }}>
              {template.name}
            </p>
            <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
              {template.type} · {template.courseList.length} courses ·{" "}
              {template.taskSequence.length} tasks
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
