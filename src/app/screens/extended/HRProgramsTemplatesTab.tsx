import React from "react";
import { Badge, CheckCircle, P, Trash2 } from "./extended.shared";
import type {
  ProgramCategoryDto,
  ProgramTemplateDto,
  ProgramTypeDto,
} from "../../API/catalogConfiguration.api";


export type HRProgramsTemplatesTabContext = {
  applyProgramTemplate: (template: ProgramTemplateDto) => Promise<void>;
  applyingTemplateId: number | null;
  deleteProgramTemplate: (template: ProgramTemplateDto) => Promise<void>;
  deletingTemplateId: number | null;
  employeeOptions: { id: string; name: string; email: string }[];
  programCategoryOptions: ProgramCategoryDto[];
  programNotice: string;
  programTemplates: ProgramTemplateDto[];
  programTypeOptions: ProgramTypeDto[];
  templateError: string;
  templatesLoading: boolean;

};

export function HRProgramsTemplatesTab({ ctx }: { ctx: HRProgramsTemplatesTabContext }) {
  const {
    applyProgramTemplate,
    applyingTemplateId,
    deleteProgramTemplate,
    deletingTemplateId,
    employeeOptions,
    programCategoryOptions,
    programNotice,
    programTemplates,
    programTypeOptions,
    templateError,
    templatesLoading,
  } = ctx;

  const typeName = (id: number | null) =>
    id == null ? "No type" : programTypeOptions.find((type) => type.id === id)?.name ?? `Type #${id}`;
  const categoryName = (id: number | null) =>
    id == null
      ? "No category"
      : programCategoryOptions.find((category) => category.id === id)?.name ?? `Category #${id}`;
  const ownerName = (id: string) =>
    employeeOptions.find((employee) => employee.id === id)?.name ?? id ?? "Not assigned";

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

      {templateError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: "#F2B8B5", background: "#FFF4F3", color: "#9B2C2C" }}
          role="alert"
        >
          {templateError}
        </div>
      )}

      {templatesLoading ? (
        <div className="rounded-xl border bg-white px-5 py-10 text-center text-sm" style={{ borderColor: P.border, color: P.textMuted }}>
          Loading program templates…
        </div>
      ) : programTemplates.length === 0 ? (
        <div className="rounded-xl border bg-white px-5 py-10 text-center" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold" style={{ color: P.text }}>No active program templates</p>
          <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
            Create a program and select “Save as reusable template” to add one.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programTemplates.map((template) => {
            const defaultCounts = [
              ["Courses", template.defaultCourses?.length ?? 0],
              ["Tasks", template.defaultTasks?.length ?? 0],
              ["Milestones", template.defaultMilestones?.length ?? 0],
            ] as const;

            return (
              <div key={template.id} className="space-y-4 rounded-xl border bg-white p-5" style={{ borderColor: P.border }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Badge label={typeName(template.programTypeId)} variant="sage" />
                      <Badge label={template.visibility} variant="neutral" />
                    </div>
                    <h3 className="mt-2 text-sm font-bold" style={{ color: P.text }}>{template.name}</h3>
                    {template.description && <p className="mt-1 text-xs leading-5" style={{ color: P.textMuted }}>{template.description}</p>}
                  </div>
                  <div className="flex flex-shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => void applyProgramTemplate(template)}
                      disabled={applyingTemplateId !== null}
                      className="rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                      style={{ background: P.olive }}
                    >
                      {applyingTemplateId === template.id ? "Creating…" : "Use Template"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteProgramTemplate(template)}
                      disabled={deletingTemplateId === template.id}
                      aria-label={`Delete ${template.name}`}
                      title="Delete template"
                      className="rounded-lg p-2"
                      style={{ border: `1px solid ${P.border}`, color: "#9B2C2C", opacity: deletingTemplateId === template.id ? 0.5 : 1 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {defaultCounts.map(([label, count]) => (
                    <div key={label} className="rounded-lg p-3 text-center" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                      <p className="text-base font-bold" style={{ color: P.darkOlive }}>{count}</p>
                      <p className="text-[10px] font-semibold uppercase" style={{ color: P.textMuted }}>{label}</p>
                    </div>
                  ))}
                </div>

                <dl className="grid gap-2 text-xs md:grid-cols-2">
                  <div><dt style={{ color: P.textMuted }}>Category</dt><dd className="font-semibold" style={{ color: P.text }}>{categoryName(template.categoryId)}</dd></div>
                  <div><dt style={{ color: P.textMuted }}>Owner</dt><dd className="font-semibold" style={{ color: P.text }}>{ownerName(template.ownerEmployeeId)}</dd></div>
                  <div><dt style={{ color: P.textMuted }}>Duration</dt><dd className="font-semibold" style={{ color: P.text }}>{template.durationWeeks == null ? "Not set" : `${template.durationWeeks} week${template.durationWeeks === 1 ? "" : "s"}`}</dd></div>
                  <div><dt style={{ color: P.textMuted }}>Capacity</dt><dd className="font-semibold" style={{ color: P.text }}>{template.capacity ?? "Unlimited"}</dd></div>
                </dl>

                <div className="flex flex-wrap gap-2 text-[10px]" style={{ color: P.textMid }}>
                  {template.rollingEnrollment && <span className="rounded-full px-2 py-1" style={{ background: P.paleGreen }}>Rolling enrollment</span>}
                  {template.allowSelfEnrollment && <span className="rounded-full px-2 py-1" style={{ background: P.paleGreen }}>Self enrollment</span>}
                  {template.isMandatory && <span className="rounded-full px-2 py-1" style={{ background: P.paleGreen }}>Mandatory</span>}
                  {template.certificateEnabled && <span className="rounded-full px-2 py-1" style={{ background: P.paleGreen }}>Certificate</span>}
                  {template.xpEnabled && <span className="rounded-full px-2 py-1" style={{ background: P.paleGreen }}>XP enabled</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
