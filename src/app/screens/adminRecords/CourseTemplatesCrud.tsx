import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  BookOpen,
  CrudModal,
  CrudShell,
  Field,
  Inp,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Textarea,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  catalogConfigurationApi,
  type CourseTemplateDto,
} from "../../API/catalogConfiguration.api";
import { usePermission } from "../../hooks/usePermission";

type CourseTemplateRow = CrudRow & {
  description: string;
  shortSummary: string;
  categoryId: number | "";
  difficultyLevelId: number | "";
  passingScore: number;
  completionThreshold: number;
};

function dtoToRow(dto: CourseTemplateDto): CourseTemplateRow {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    shortSummary: dto.shortSummary ?? "",
    categoryId: dto.categoryId,
    difficultyLevelId: dto.difficultyLevelId,
    passingScore: Number(dto.passingScore ?? 0),
    completionThreshold: Number(dto.completionThreshold ?? 0),
    status: dto.isActive ? "Active" : "Disabled",
  };
}

// Extracted into its own component so `useState` lives at the top level of a
// component (not inside CrudShell's `renderForm` render-prop). Calling a hook
// conditionally (only when the modal was open) violated the Rules of Hooks and
// crashed the app with the ErrorBoundary "Something went wrong" screen.
function CourseTemplateForm({
  row,
  categories,
  levels,
  onSave,
  onClose,
}: {
  row: CourseTemplateRow | null;
  categories: { id: number; name: string }[];
  levels: { id: number; name: string }[];
  onSave: (r: CourseTemplateRow) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CourseTemplateRow>(() => {
    if (row) return row;
    return {
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      shortSummary: "",
      categoryId: categories[0]?.id ?? "",
      difficultyLevelId: levels[0]?.id ?? "",
      passingScore: 70,
      completionThreshold: 90,
      status: "Active",
    };
  });
  const nameTooShort = form.name.trim().length > 0 && form.name.trim().length < 3;
  return (
    <CrudModal title={row ? "Edit Course Template" : "New Course Template"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Template Name" required>
          <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Standard Self-Paced Course" />
          {nameTooShort && <p className="mt-1 text-[10px]" style={{ color: "#B91C1C" }}>Name must be at least 3 characters.</p>}
        </Field>
        <Field label="Short Summary">
          <Inp value={form.shortSummary} onChange={(v) => setForm({ ...form, shortSummary: v })} placeholder="One-line summary shown in the catalog" />
        </Field>
        <Field label="Description">
          <Textarea value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="Describe the purpose of this template…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" required>
            <Sel
              value={String(form.categoryId)}
              onChange={(v) => setForm({ ...form, categoryId: v ? Number(v) : "" })}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
          </Field>
          <Field label="Difficulty Level" required>
            <Sel
              value={String(form.difficultyLevelId)}
              onChange={(v) => setForm({ ...form, difficultyLevelId: v ? Number(v) : "" })}
              options={levels.map((l) => ({ value: String(l.id), label: l.name }))}
            />
          </Field>
          <Field label="Passing Score (%)">
            <Inp type="number" value={String(form.passingScore)} onChange={(v) => setForm({ ...form, passingScore: Number(v) })} />
          </Field>
          <Field label="Completion Threshold (%)">
            <Inp type="number" value={String(form.completionThreshold)} onChange={(v) => setForm({ ...form, completionThreshold: Number(v) })} />
          </Field>
          <Field label="Status">
            <Sel value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Active", "Disabled"]} />
          </Field>
        </div>
        <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function CourseTemplatesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<CourseTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [levels, setLevels] = useState<{ id: number; name: string }[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await catalogConfigurationApi.listCourseTemplates({ page: 1, pageSize: 100 }, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load course templates.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  // Reference data for form selects — failures degrade gracefully to raw IDs.
  useEffect(() => {
    const c = new AbortController();
    void Promise.all([
      catalogConfigurationApi.listCategories({}, c.signal).catch(() => []),
      catalogConfigurationApi.listDifficultyLevels(c.signal).catch(() => []),
    ]).then(([cats, lvls]) => {
      if (!c.signal.aborted) {
        setCategories(cats.map((x) => ({ id: x.id, name: x.name })));
        setLevels(lvls.map((x) => ({ id: x.id, name: x.name })));
      }
    });
    return () => c.abort();
  }, []);

  const categoryName = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
    [categories],
  );
  const levelName = useMemo(
    () => Object.fromEntries(levels.map((l) => [l.id, l.name])),
    [levels],
  );

  const persistSave = async (row: CourseTemplateRow): Promise<CourseTemplateRow> => {
    if (!row.name || row.name.trim().length < 3) throw new Error("Template name must be at least 3 characters.");
    if (!row.categoryId) throw new Error("Please select a category.");
    if (!row.difficultyLevelId) throw new Error("Please select a difficulty level.");
    const input = {
      name: row.name.trim(),
      description: row.description.trim() || undefined,
      shortSummary: row.shortSummary.trim() || undefined,
      categoryId: Number(row.categoryId),
      difficultyLevelId: Number(row.difficultyLevelId),
      passingScore: Number(row.passingScore) || 0,
      completionThreshold: Number(row.completionThreshold) || 0,
      isActive: row.status === "Active",
    };
    const isNew = row.id.startsWith("new-");
    const dto = isNew
      ? await catalogConfigurationApi.createCourseTemplate(input)
      : await catalogConfigurationApi.updateCourseTemplate(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => {
    await catalogConfigurationApi.deleteCourseTemplate(Number(id));
  };

  const persistToggle = async (id: string, nextStatus: string) => {
    await catalogConfigurationApi.updateCourseTemplate(Number(id), { isActive: nextStatus === "Active" });
  };

  if (!can("course_template.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view course templates.
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}>
        <Loader2 size={15} className="animate-spin" /> Loading course templates…
      </div>
    );

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => void load()} className="ml-auto underline">Retry</button>
        </div>
      )}
      {!error && (
        <CrudShell<CourseTemplateRow>
          title="Course Templates"
          sub="Reusable course creation templates with default XP and pass thresholds"
          icon={BookOpen}
          columns={[
            { key: "name", label: "Template Name", sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
            { key: "categoryId", label: "Category", render: (r) => r.categoryId ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{categoryName[Number(r.categoryId)] ?? `#${r.categoryId}`}</span> : "—" },
            { key: "difficultyLevelId", label: "Level", render: (r) => (r.difficultyLevelId ? levelName[Number(r.difficultyLevelId)] ?? `#${r.difficultyLevelId}` : "—") },
            { key: "passingScore", label: "Pass %", render: (r) => <p className="text-xs font-mono font-semibold" style={{ color: P.gold }}>{r.passingScore}%</p> },
            { key: "completionThreshold", label: "Completion %", render: (r) => <p className="text-xs font-mono" style={{ color: P.textMuted }}>{r.completionThreshold}%</p> },
            { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
          onRows={setRows}
          persistSave={persistSave}
          persistDelete={persistDelete}
          persistToggle={persistToggle}
          filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
          createLabel="New Template"
          showArchive={false}
          toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Activate", disableLabel: "Deactivate" }}
          cloneRow={(r) => ({ ...r, id: `new-${Date.now()}`, name: `${r.name} (Copy)`, status: "Disabled" })}
          renderForm={(row, onSave, onClose) => (
            <CourseTemplateForm row={row} categories={categories} levels={levels} onSave={onSave} onClose={onClose} />
          )}
        />
      )}
    </div>
  );
}
