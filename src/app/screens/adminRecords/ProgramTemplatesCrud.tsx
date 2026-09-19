import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  CrudModal,
  CrudShell,
  Field,
  Inp,
  InlineFormState,
  Layers,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Textarea,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  catalogConfigurationApi,
  type ProgramTemplateDto,
} from "../../API/catalogConfiguration.api";
import { usePermission } from "../../hooks/usePermission";

type ProgramTemplateRow = CrudRow & {
  description: string;
  categoryId: number | "";
  programTypeId: number | "";
  durationWeeks: number;
  capacity: number;
  visibility: string;
  ownerEmployeeId: string;
  isMandatory: boolean;
  autoEnroll: boolean;
  allowSelfEnrollment: boolean;
  rollingEnrollment: boolean;
  certificateEnabled: boolean;
  xpEnabled: boolean;
  defaultMilestones: string;
  defaultCourses: string;
  defaultTasks: string;
};

function dtoToRow(dto: ProgramTemplateDto): ProgramTemplateRow {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    categoryId: dto.categoryId ?? "",
    programTypeId: dto.programTypeId ?? "",
    durationWeeks: Number(dto.durationWeeks ?? 0),
    capacity: Number(dto.capacity ?? 0),
    visibility: dto.visibility ?? "COMPANY",
    ownerEmployeeId: dto.ownerEmployeeId ?? "",
    isMandatory: Boolean(dto.isMandatory),
    autoEnroll: Boolean(dto.autoEnroll),
    allowSelfEnrollment: dto.allowSelfEnrollment !== false,
    rollingEnrollment: Boolean(dto.rollingEnrollment),
    certificateEnabled: dto.certificateEnabled !== false,
    xpEnabled: dto.xpEnabled !== false,
    defaultMilestones: JSON.stringify(dto.defaultMilestones ?? []),
    defaultCourses: JSON.stringify(dto.defaultCourses ?? []),
    defaultTasks: JSON.stringify(dto.defaultTasks ?? []),
    status: dto.isActive ? "Active" : "Disabled",
  };
}

export function ProgramTemplatesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<ProgramTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [types, setTypes] = useState<{ id: number; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string; email: string }[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await catalogConfigurationApi.listProgramTemplates(
        { page: 1, pageSize: 100 },
        signal,
      );
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load program templates.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  useEffect(() => {
    const c = new AbortController();
    void Promise.all([
      catalogConfigurationApi.listProgramCategories(c.signal).catch(() => []),
      catalogConfigurationApi.listProgramTypes(c.signal).catch(() => []),
      catalogConfigurationApi.listEmployees(c.signal).catch(() => []),
    ]).then(([cats, typ, emps]) => {
      if (!c.signal.aborted) {
        setCategories(cats.map((x) => ({ id: x.id, name: x.name })));
        setTypes(typ.map((x) => ({ id: x.id, name: x.name })));
        setEmployees(emps);
      }
    });
    return () => c.abort();
  }, []);

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const typeName = useMemo(() => Object.fromEntries(types.map((t) => [t.id, t.name])), [types]);

  const persistSave = async (row: ProgramTemplateRow): Promise<ProgramTemplateRow> => {
    if (!row.name || row.name.trim().length === 0) throw new Error("Template name is required.");
    const input = {
      name: row.name.trim(),
      description: row.description.trim() || undefined,
      categoryId: row.categoryId ? Number(row.categoryId) : null,
      programTypeId: row.programTypeId ? Number(row.programTypeId) : null,
      durationWeeks: Number(row.durationWeeks) || null,
      capacity: Number(row.capacity) || null,
      visibility: row.visibility as "PUBLIC" | "COMPANY" | "PRIVATE",
      ownerEmployeeId: row.ownerEmployeeId.trim() || undefined,
      isMandatory: row.isMandatory,
      autoEnroll: row.autoEnroll,
      allowSelfEnrollment: row.allowSelfEnrollment,
      rollingEnrollment: row.rollingEnrollment,
      certificateEnabled: row.certificateEnabled,
      xpEnabled: row.xpEnabled,
      defaultMilestones: row.defaultMilestones ? JSON.parse(row.defaultMilestones) : undefined,
      defaultCourses: row.defaultCourses ? JSON.parse(row.defaultCourses) : undefined,
      defaultTasks: row.defaultTasks ? JSON.parse(row.defaultTasks) : undefined,
      isActive: row.status === "Active",
    };
    const isNew = row.id.startsWith("new-");
    const dto = isNew
      ? await catalogConfigurationApi.createProgramTemplate(input)
      : await catalogConfigurationApi.updateProgramTemplate(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => {
    await catalogConfigurationApi.deleteProgramTemplate(Number(id));
  };

  const persistToggle = async (id: string, nextStatus: string) => {
    await catalogConfigurationApi.updateProgramTemplate(Number(id), {
      isActive: nextStatus === "Active",
    });
  };

  if (!can("program_template.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view program templates.
      </div>
    );
  if (loading)
    return (
      <div
        className="flex items-center justify-center gap-2 py-12 text-xs"
        style={{ color: P.textMuted }}
      >
        <Loader2 size={15} className="animate-spin" /> Loading program templates…
      </div>
    );

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => void load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}
      {!error && (
        <CrudShell<ProgramTemplateRow>
          title="Program Templates"
          sub="Reusable program creation templates with milestones and courses"
          icon={Layers}
          columns={[
            {
              key: "name",
              label: "Template Name",
              sortable: true,
              render: (r) => (
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {r.name}
                </p>
              ),
            },
            {
              key: "programTypeId",
              label: "Type",
              render: (r) =>
                r.programTypeId ? (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: P.lightSage, color: P.darkOlive }}
                  >
                    {typeName[Number(r.programTypeId)] ?? `#${r.programTypeId}`}
                  </span>
                ) : (
                  "—"
                ),
            },
            {
              key: "durationWeeks",
              label: "Weeks",
              render: (r) => (
                <p className="text-xs font-mono" style={{ color: P.textMuted }}>
                  {r.durationWeeks || "—"}
                </p>
              ),
            },
            {
              key: "capacity",
              label: "Capacity",
              render: (r) => (
                <p className="text-xs font-mono" style={{ color: P.textMuted }}>
                  {r.capacity || "∞"}
                </p>
              ),
            },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (r) => <StatusBadge status={r.status} />,
            },
          ]}
          rows={rows}
          onRows={setRows}
          persistSave={persistSave}
          persistDelete={persistDelete}
          persistToggle={persistToggle}
          filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
          createLabel="New Template"
          showArchive={false}
          toggleStatus={{
            enabled: "Active",
            disabled: "Disabled",
            enableLabel: "Activate",
            disableLabel: "Deactivate",
          }}
          cloneRow={(r) => ({
            ...r,
            id: `new-${Date.now()}`,
            name: `${r.name} (Copy)`,
            status: "Disabled",
          })}
          renderForm={(row, onSave, onClose) => {
            const blank: ProgramTemplateRow = {
              id: `new-${Date.now()}`,
              name: "",
              description: "",
              categoryId: categories[0]?.id ?? "",
              programTypeId: types[0]?.id ?? "",
              durationWeeks: 6,
              capacity: 0,
              visibility: "COMPANY",
              ownerEmployeeId: "",
              isMandatory: false,
              autoEnroll: false,
              allowSelfEnrollment: true,
              rollingEnrollment: false,
              certificateEnabled: true,
              xpEnabled: true,
              defaultMilestones: "[]",
              defaultCourses: "[]",
              defaultTasks: "[]",
              status: "Active",
            };
            return (
              <InlineFormState initial={row ?? blank}>
                {(form, setForm) => {
                  const yesNo = (
                    key:
                      | "isMandatory"
                      | "autoEnroll"
                      | "allowSelfEnrollment"
                      | "rollingEnrollment"
                      | "certificateEnabled"
                      | "xpEnabled",
                    label: string,
                  ) => (
                    <Field label={label}>
                      <Sel
                        value={form[key] ? "Yes" : "No"}
                        onChange={(v) => setForm({ ...form, [key]: v === "Yes" })}
                        options={["Yes", "No"]}
                      />
                    </Field>
                  );
                  return (
                    <CrudModal
                      title={row ? "Edit Program Template" : "New Program Template"}
                      onClose={onClose}
                    >
                      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                        <Field label="Template Name" required>
                          <Inp
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                            placeholder="e.g. Onboarding Bootcamp"
                          />
                        </Field>
                        <Field label="Description">
                          <Textarea
                            value={form.description}
                            onChange={(v) => setForm({ ...form, description: v })}
                            placeholder="Describe this program template…"
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="Program Type">
                            <Sel
                              value={String(form.programTypeId)}
                              onChange={(v) =>
                                setForm({ ...form, programTypeId: v ? Number(v) : "" })
                              }
                              options={types.map((t) => ({ value: String(t.id), label: t.name }))}
                            />
                          </Field>
                          <Field label="Category">
                            <Sel
                              value={String(form.categoryId)}
                              onChange={(v) => setForm({ ...form, categoryId: v ? Number(v) : "" })}
                              options={categories.map((c) => ({
                                value: String(c.id),
                                label: c.name,
                              }))}
                            />
                          </Field>
                          <Field label="Duration (weeks)">
                            <Inp
                              type="number"
                              value={String(form.durationWeeks)}
                              onChange={(v) => setForm({ ...form, durationWeeks: Number(v) })}
                            />
                          </Field>
                          <Field label="Capacity (0 = unlimited)">
                            <Inp
                              type="number"
                              value={String(form.capacity)}
                              onChange={(v) => setForm({ ...form, capacity: Number(v) })}
                            />
                          </Field>
                          <Field label="Visibility">
                            <Sel
                              value={form.visibility}
                              onChange={(v) => setForm({ ...form, visibility: v })}
                              options={["PUBLIC", "COMPANY", "ENROLLED_ONLY", "INVITATION_ONLY"]}
                            />
                          </Field>
                          <Field label="Owner Employee">
                            <Sel
                              value={form.ownerEmployeeId}
                              onChange={(v) => setForm({ ...form, ownerEmployeeId: v })}
                              options={employees.map((e) => ({ value: e.id, label: e.name }))}
                              placeholder="— Select owner —"
                            />
                          </Field>
                          {yesNo("isMandatory", "Mandatory")}
                          {yesNo("autoEnroll", "Auto-enroll")}
                          {yesNo("allowSelfEnrollment", "Self-enrollment")}
                          {yesNo("rollingEnrollment", "Rolling Enrollment")}
                          {yesNo("certificateEnabled", "Certificate")}
                          {yesNo("xpEnabled", "XP Rewards")}
                          <Field label="Status">
                            <Sel
                              value={form.status}
                              onChange={(v) => setForm({ ...form, status: v })}
                              options={["Active", "Disabled"]}
                            />
                          </Field>
                        </div>
                        <Field label="Default Milestones (JSON)">
                          <Textarea
                            value={form.defaultMilestones}
                            onChange={(v) => setForm({ ...form, defaultMilestones: v })}
                            placeholder='[{"title":"Week 1 Check-in","targetDay":7,"actionIfLate":"REMIND"}]'
                            rows={3}
                          />
                        </Field>
                        <Field label="Default Courses (JSON)">
                          <Textarea
                            value={form.defaultCourses}
                            onChange={(v) => setForm({ ...form, defaultCourses: v })}
                            placeholder='[{"courseVersionId":1,"displayOrder":1,"isRequired":true}]'
                            rows={3}
                          />
                        </Field>
                        <Field label="Default Tasks (JSON)">
                          <Textarea
                            value={form.defaultTasks}
                            onChange={(v) => setForm({ ...form, defaultTasks: v })}
                            placeholder='[{"week":1,"taskTypeId":1,"title":"Read materials","isMandatory":true}]'
                            rows={3}
                          />
                        </Field>
                        <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
                      </div>
                    </CrudModal>
                  );
                }}
              </InlineFormState>
            );
          }}
        />
      )}
    </div>
  );
}
