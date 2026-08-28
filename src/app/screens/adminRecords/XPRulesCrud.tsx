import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { CrudModal, CrudShell, Field, Inp, P, SaveBtn, Sel, StatusBadge, Textarea, Zap } from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import { xpGamificationApi, type XpRuleDto } from "../../API/xp-gamification.api";
import { audienceApi, type AudienceGroup } from "../../API/audience.api";
import { enrollmentApi, type EnrollmentReferenceOption } from "../../API/enrollment.api";
import { usePermission } from "../../hooks/usePermission";

type XPRule = CrudRow & {
  triggerEventId: string;
  category: string;
  xp: number;
  maximumAward: string;
  multiplier: string;
  targetAudienceId: string;
  courseVersionId: string;
  programId: string;
  conditionExpression: string;
};
type Lookup = { id: number; name: string; slug?: string | null };

function dtoToRow(dto: XpRuleDto): XPRule {
  return {
    id: String(dto.id),
    name: dto.name,
    xp: dto.xpAmount,
    category: String(dto.categoryId),
    triggerEventId: String(dto.triggerEventId),
    maximumAward: dto.maximumAward != null ? String(dto.maximumAward) : "",
    multiplier: dto.multiplier != null ? String(dto.multiplier) : "",
    targetAudienceId: dto.targetAudienceId != null ? String(dto.targetAudienceId) : "",
    courseVersionId: dto.courseVersionId != null ? String(dto.courseVersionId) : "",
    programId: dto.programId != null ? String(dto.programId) : "",
    conditionExpression: dto.conditionExpression ? JSON.stringify(dto.conditionExpression, null, 2) : "",
    status: dto.isActive ? "Active" : "Disabled",
  };
}

function parseCondition(text: string): Record<string, unknown> | null {
  const t = text.trim();
  if (!t) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(t);
  } catch {
    throw new Error('Condition Expression must be valid JSON, e.g. {"minScore": 70}.');
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Condition Expression must be a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

function XPRuleForm({
  row, rows, categories, triggerEvents, audienceGroups, courseVersions, programs, onSave, onClose,
}: {
  row: XPRule | null;
  rows: XPRule[];
  categories: Lookup[];
  triggerEvents: Lookup[];
  audienceGroups: AudienceGroup[];
  courseVersions: EnrollmentReferenceOption[];
  programs: EnrollmentReferenceOption[];
  onSave: (r: XPRule) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<XPRule>(() =>
    row
      ? { ...row }
      : {
          id: `new-${Date.now()}`,
          name: "",
          xp: 100,
          category: categories[0] ? String(categories[0].id) : "",
          triggerEventId: triggerEvents[0] ? String(triggerEvents[0].id) : "",
          maximumAward: "",
          multiplier: "",
          targetAudienceId: "",
          courseVersionId: "",
          programId: "",
          conditionExpression: "",
          status: "Active",
        },
  );
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const err = (f: string) => (errors[f] ? <p className="mt-1 text-xs text-red-600">{errors[f]}</p> : null);

  const handleSave = () => {
    const name = form.name.trim();
    const xp = Number(form.xp);
    const errs: typeof errors = {};
    if (!name) errs.name = "Rule name is required.";
    else if (rows.some((r) => r.id !== form.id && r.name.trim().toLowerCase() === name.toLowerCase()))
      errs.name = "A rule with this name already exists.";
    if (!Number.isFinite(xp) || xp < 1) errs.xp = "XP amount must be at least 1.";
    if (!form.category || Number(form.category) < 1) errs.category = "Please select a category.";
    if (!form.triggerEventId || Number(form.triggerEventId) < 1) errs.triggerEventId = "Please select a trigger event.";
    if (form.maximumAward.trim() && (!Number.isFinite(Number(form.maximumAward)) || Number(form.maximumAward) < 0))
      errs.maximumAward = "Maximum award must be a non-negative number.";
    if (form.multiplier.trim() && !Number.isFinite(Number(form.multiplier)))
      errs.multiplier = "Multiplier must be a number.";
    if (form.conditionExpression.trim()) {
      try {
        parseCondition(form.conditionExpression);
      } catch (e: any) {
        errs.conditionExpression = e?.message ?? "Invalid JSON.";
      }
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSave({ ...form, name, xp });
  };

  const num = (label: string, key: "xp" | "maximumAward" | "multiplier", placeholder: string, ekey: string) => (
    <Field label={label} required={key === "xp"}>
      <Inp
        type="number"
        value={String((form as any)[key] ?? "")}
        onChange={(v) => {
          setForm({ ...form, [key]: key === "xp" ? Number(v) : v } as XPRule);
          setErrors((e) => ({ ...e, [ekey]: undefined }));
        }}
        placeholder={placeholder}
      />
      {err(ekey)}
    </Field>
  );

  return (
    <CrudModal title={row ? "Edit XP Rule" : "New XP Rule"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Rule Name" required>
          <Inp value={form.name} onChange={(v) => { setForm({ ...form, name: v }); setErrors((e) => ({ ...e, name: undefined })); }} placeholder="e.g. Course Completion" />
          {err("name")}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category" required>
            <Sel
              value={form.category}
              onChange={(v) => { setForm({ ...form, category: v }); setErrors((e) => ({ ...e, category: undefined })); }}
              options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
            />
            {err("category")}
          </Field>
          <Field label="Trigger Event" required>
            <Sel
              value={form.triggerEventId}
              onChange={(v) => { setForm({ ...form, triggerEventId: v }); setErrors((e) => ({ ...e, triggerEventId: undefined })); }}
              options={triggerEvents.map((t) => ({ value: String(t.id), label: t.name }))}
            />
            {err("triggerEventId")}
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {num("XP Amount", "xp", "e.g. 100", "xp")}
          {num("Maximum Award", "maximumAward", "optional cap", "maximumAward")}
          {num("Multiplier", "multiplier", "e.g. 1.5", "multiplier")}
        </div>
        <Field label="Target Audience">
          <Sel
            value={form.targetAudienceId}
            onChange={(v) => setForm({ ...form, targetAudienceId: v })}
            options={[{ value: "", label: "— All learners —" }, ...audienceGroups.map((g) => ({ value: String(g.id), label: g.name }))]}
            placeholder="— All learners —"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Course Version">
            <Sel
              value={form.courseVersionId}
              onChange={(v) => setForm({ ...form, courseVersionId: v, programId: v ? "" : form.programId })}
              options={[{ value: "", label: "— None —" }, ...courseVersions.map((c) => ({ value: String(c.id), label: c.label }))]}
              placeholder="— None —"
            />
          </Field>
          <Field label="Learning Program">
            <Sel
              value={form.programId}
              onChange={(v) => setForm({ ...form, programId: v, courseVersionId: v ? "" : form.courseVersionId })}
              options={[{ value: "", label: "— None —" }, ...programs.map((p) => ({ value: String(p.id), label: p.label }))]}
              placeholder="— None —"
            />
          </Field>
        </div>
        <Field label="Condition Expression (JSON)">
          <Textarea
            value={form.conditionExpression}
            onChange={(v) => { setForm({ ...form, conditionExpression: v }); setErrors((e) => ({ ...e, conditionExpression: undefined })); }}
            placeholder='{"minScore": 70}'
          />
          {err("conditionExpression")}
        </Field>
        <Field label="Status">
          <Sel value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={["Active", "Disabled"]} />
        </Field>
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function XPRulesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<XPRule[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<Lookup[]>([]);
  const [audienceGroups, setAudienceGroups] = useState<AudienceGroup[]>([]);
  const [courseVersions, setCourseVersions] = useState<EnrollmentReferenceOption[]>([]);
  const [programs, setPrograms] = useState<EnrollmentReferenceOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await xpGamificationApi.rules.list({}, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load XP rules.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    xpGamificationApi.rules.lookups(c.signal)
      .then((l) => { if (!c.signal.aborted) { setCategories(l.categories ?? []); setTriggerEvents(l.triggerEvents ?? []); } })
      .catch(() => {});
    audienceApi.groups.list({}, c.signal)
      .then((g) => { if (!c.signal.aborted) setAudienceGroups(Array.isArray(g) ? g : []); })
      .catch(() => {});
    enrollmentApi.courseVersions.list({}, c.signal)
      .then((o) => { if (!c.signal.aborted) setCourseVersions(Array.isArray(o) ? o : []); })
      .catch(() => {});
    enrollmentApi.programs.list({}, c.signal)
      .then((o) => { if (!c.signal.aborted) setPrograms(Array.isArray(o) ? o : []); })
      .catch(() => {});
    return () => c.abort();
  }, [load]);

  if (!can("xp_rule.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view XP rules.</div>;
  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}><Loader2 size={15} className="animate-spin" /> Loading XP rules…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2"><AlertCircle size={14} />{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>;

  const catName = (id: string) => categories.find((c) => String(c.id) === id)?.name ?? `#${id}`;
  const trigName = (id: string) => triggerEvents.find((t) => String(t.id) === id)?.name ?? `#${id}`;

  const persistSave = async (row: XPRule): Promise<XPRule> => {
    const categoryId = Number(row.category);
    const triggerEventId = Number(row.triggerEventId);
    if (!categoryId || categoryId < 1) throw new Error("Please select a category for this rule.");
    if (!triggerEventId || triggerEventId < 1) throw new Error("Please select a trigger event for this rule.");
    if (!Number.isFinite(row.xp) || row.xp < 1) throw new Error("XP amount must be at least 1.");
    const conditionExpression = parseCondition(String(row.conditionExpression ?? ""));
    const isNew = row.id.startsWith("new-");
    const input = {
      name: row.name,
      categoryId,
      triggerEventId,
      xpAmount: row.xp,
      maximumAward: row.maximumAward.trim() ? Number(row.maximumAward) : null,
      multiplier: row.multiplier.trim() ? Number(row.multiplier) : null,
      targetAudienceId: row.targetAudienceId ? Number(row.targetAudienceId) : null,
      courseVersionId: row.courseVersionId ? Number(row.courseVersionId) : null,
      programId: row.programId ? Number(row.programId) : null,
      conditionExpression,
      isActive: row.status === "Active",
    };
    const dto = isNew ? await xpGamificationApi.rules.create(input) : await xpGamificationApi.rules.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => {
    await xpGamificationApi.rules.delete(Number(id));
  };

  return (
    <CrudShell<XPRule>
      title="XP Rules" sub="Configure XP earning rules — changes take effect immediately" icon={Zap}
      columns={[
        { key: "name", label: "Rule Name", sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
        { key: "category", label: "Category", render: (r) => <p className="text-xs" style={{ color: P.textMuted }}>{catName(r.category)}</p> },
        { key: "triggerEventId", label: "Trigger Event", render: (r) => <p className="text-xs" style={{ color: P.textMuted }}>{trigName(r.triggerEventId)}</p> },
        { key: "xp", label: "XP Awarded", render: (r) => <p className="font-mono text-xs font-bold" style={{ color: P.gold }}>{r.xp} XP{r.maximumAward ? <span className="font-normal" style={{ color: P.textMuted }}> (max {r.maximumAward})</span> : null}</p> },
        { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={rows} onRows={setRows} persistSave={persistSave} persistDelete={persistDelete}
      filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
      createLabel={can("xp_rule.create") ? "New XP Rule" : undefined as any}
      showArchive={false} pageSize={20}
      toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Enable", disableLabel: "Disable" }}
      persistToggle={(id, nextStatus) => xpGamificationApi.rules.update(Number(id), { isActive: nextStatus === "Active" }).then(() => undefined)}
      renderForm={(row, onSave, onClose) => (
        <XPRuleForm row={row} rows={rows} categories={categories} triggerEvents={triggerEvents} audienceGroups={audienceGroups} courseVersions={courseVersions} programs={programs} onSave={onSave} onClose={onClose} />
      )}
    />
  );
}
