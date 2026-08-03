import React from "react";
import { Badge, Check, CheckCircle, P } from "./extended.shared";
import type { ProgramTemplate } from "./extended.shared";

export type HRProgramsTemplatesTabContext = {
  applyProgramTemplate: (template: ProgramTemplate) => void;
  programNotice: string;
  programTemplates: ProgramTemplate[];
};

export function HRProgramsTemplatesTab({ ctx }: { ctx: HRProgramsTemplatesTabContext }) {
  const { applyProgramTemplate, programNotice, programTemplates } = ctx;

  return (
    <div className="space-y-4">
      {programNotice && (
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ background: P.lightSage, borderColor: P.border, color: P.darkOlive }}
        >
          <CheckCircle size={16} />
          <span className="font-semibold">{programNotice}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {programTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-xl border p-5 space-y-4"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge label={template.type} variant="sage" />
                <h3 className="text-sm font-bold mt-2" style={{ color: P.text }}>
                  {template.name}
                </h3>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  {template.duration} - {template.certificationTemplate} - XP{" "}
                  {template.xpMultiplier}
                </p>
              </div>
              <button
                onClick={() => applyProgramTemplate(template)}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-white"
                style={{ background: P.olive }}
              >
                Use Template
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {[
                ["Courses", template.courseList],
                ["Task Sequence", template.taskSequence],
                ["Milestones", template.milestones],
                ["Assessment Rules", template.assessmentRules],
              ].map(([label, values]) => (
                <div
                  key={label as string}
                  className="rounded-lg p-3"
                  style={{ background: P.bg, border: `1px solid ${P.border}` }}
                >
                  <p className="text-[10px] font-bold uppercase" style={{ color: P.textMuted }}>
                    {label as string}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {(values as string[]).slice(0, 3).map((value) => (
                      <li
                        key={value}
                        className="flex items-start gap-1.5 text-[10px]"
                        style={{ color: P.textMid }}
                      >
                        <Check size={10} className="mt-0.5 flex-shrink-0" />
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="rounded-lg p-3 text-xs"
              style={{ background: P.paleGreen, color: P.textMid }}
            >
              Approval workflow: <span className="font-semibold">{template.approvalWorkflow}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
