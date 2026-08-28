import React, { useCallback, useEffect, useState } from "react";
import { Award, Image, ListChecks } from "lucide-react";
import { CrudModal, CrudShell, Field, Inp, Sel, StatusBadge, Textarea, type CrudColumn, type CrudRow } from "../adminRecords/adminRecords.shared";
import { xpGamificationApi, type BadgeCategoryDto, type BadgeDto, type BadgeRuleDto, type CreateBadgeRuleInput } from "../../API/xp-gamification.api";
import { audienceApi } from "../../API/audience.api";
import { usePermission } from "../../hooks/usePermission";
import { P } from "./configuration.shared";

export function ConfigBadges() {
  const can = usePermission();
  const [rows, setRows] = useState<CrudRow[]>([]);
  const [categories, setCategories] = useState<BadgeCategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rulesBadge, setRulesBadge] = useState<CrudRow | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const [data, cats] = await Promise.all([
        xpGamificationApi.badges.list({}, signal),
        xpGamificationApi.badgeCategories.list(signal),
      ]);
      if (signal?.aborted) return;
      const catName = (id: number) => cats.find((c) => c.id === id)?.name ?? "";
      setCategories(cats);
      setRows(data.map((d: BadgeDto) => ({
        id: String(d.id),
        name: d.name,
        description: d.description ?? "",
        iconUrl: d.iconUrl ?? "",
        badgeCategoryId: d.badgeCategoryId,
        categoryName: catName(d.badgeCategoryId),
        status: d.isActive ? "Active" : "Disabled",
      })));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load badges.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);

  const persistSave = async (row: CrudRow) => {
    const categoryId = Number(row.badgeCategoryId) || (categories[0]?.id ?? 0);
    if (!categoryId) throw new Error("Please select a badge category.");
    const input = {
      name: String(row.name ?? "").trim(),
      description: row.description ? String(row.description) : undefined,
      iconUrl: row.iconUrl ? String(row.iconUrl) : undefined,
      badgeCategoryId: categoryId,
      isActive: row.status === "Active",
    };
    const isNew = String(row.id).startsWith("new-");
    const dto = isNew ? await xpGamificationApi.badges.create(input) : await xpGamificationApi.badges.update(Number(row.id), input);
    const cat = categories.find((c) => c.id === dto.badgeCategoryId);
    return {
      id: String(dto.id),
      name: dto.name,
      description: dto.description ?? "",
      iconUrl: dto.iconUrl ?? "",
      badgeCategoryId: dto.badgeCategoryId,
      categoryName: cat?.name ?? "",
      status: dto.isActive ? "Active" : "Disabled",
    };
  };
  const persistToggle = async (id: string, nextStatus: string) => { await xpGamificationApi.badges.update(Number(id), { isActive: nextStatus === "Active" }); };
  const persistDelete = async (id: string) => { await xpGamificationApi.badges.delete(Number(id)); };

  if (!can("badge.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view badge configuration.</div>;
  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}><span className="animate-spin">⟳</span> Loading…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2">⚠{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>;

  const columns: CrudColumn<CrudRow>[] = [
    {
      key: "name", label: "Badge", sortable: true, render: (r) => (
        <div className="flex items-center gap-2">
          {String(r.iconUrl || "").trim() ? (
            <img src={String(r.iconUrl)} alt="" className="w-6 h-6 rounded-full object-cover" style={{ border: `1px solid ${P.border}` }} onError={(e) => { (e.currentTarget.style.display = "none"); }} />
          ) : (
            <Award size={16} style={{ color: P.olive }} />
          )}
          <span className="text-xs font-semibold" style={{ color: P.text }}>{String(r.name)}</span>
        </div>
      ),
    },
    { key: "categoryName", label: "Category", render: (r) => <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: P.lightSage, color: P.darkOlive }}>{String(r.categoryName || "—")}</span> },
    { key: "description", label: "Description", render: (r) => <p className="text-xs truncate max-w-[220px]" style={{ color: P.textMuted }}>{String(r.description || "—")}</p> },
    { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <>
      <CrudShell<CrudRow>
      title="Badges"
      sub="Create badges awarded to learners for completing achievements"
      icon={Award}
      columns={columns}
      rows={rows}
      onRows={setRows}
      persistSave={persistSave}
      persistDelete={persistDelete}
      persistToggle={persistToggle}
      toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Activate", disableLabel: "Deactivate" }}
      filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
      createLabel={can("badge.create") ? "New Badge" : undefined as any}
      showArchive={false}
      showDelete={can("badge.delete")}
      actions={[{ label: "Rules", icon: ListChecks, onClick: (r) => setRulesBadge(r) }]}
      renderForm={(row, onSave, onClose) => (
        <BadgeForm row={row} categories={categories} onSave={onSave} onClose={onClose} />
      )}
    />
      {rulesBadge ? <BadgeRulesModal badge={rulesBadge} onClose={() => setRulesBadge(null)} /> : null}
    </>
  );
}

function BadgeForm({ row, categories, onSave, onClose }: { row: CrudRow | null; categories: BadgeCategoryDto[]; onSave: (r: CrudRow) => void; onClose: () => void; }) {
  const [form, setForm] = useState<CrudRow>(() =>
    row ? { ...row } : { id: `new-${Date.now()}`, name: "", description: "", iconUrl: "", badgeCategoryId: categories[0]?.id ?? "", categoryName: categories[0]?.name ?? "", status: "Active" }
  );
  const missingCategory = !Number(form.badgeCategoryId);
  const handleSave = () => {
    if (!String(form.name ?? "").trim()) return;
    if (missingCategory) return;
    onSave({ ...form });
  };
  return (
    <CrudModal title={row ? "Edit Badge" : "New Badge"} onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: P.textMid }}>Badge Name *</label>
          <input value={String(form.name ?? "")} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
        </div>
        <div>
          <label className="flex items-center gap-1 text-[11px] font-semibold mb-1" style={{ color: P.textMid }}><Image size={12} /> Icon URL</label>
          <input value={String(form.iconUrl ?? "")} onChange={(e) => setForm({ ...form, iconUrl: e.target.value })} placeholder="https://…/badge.png" className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
          {!!form.iconUrl && <div className="flex items-center gap-2 mt-2"><img src={String(form.iconUrl)} alt="preview" className="w-8 h-8 rounded-full object-cover" style={{ border: `1px solid ${P.border}` }} onError={(e) => { (e.currentTarget.src = ""); }} /><span className="text-[10px]" style={{ color: P.textMuted }}>Preview</span></div>}
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: P.textMid }}>Category *</label>
          <select
            value={String(form.badgeCategoryId ?? "")}
            onChange={(e) => setForm((f) => ({ ...f, badgeCategoryId: e.target.value, categoryName: categories.find((c) => c.id === Number(e.target.value))?.name ?? "" }))}
            className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${missingCategory ? "#f87171" : P.border}`, color: P.text }}
          >
            <option value="">Select category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {missingCategory && <p className="text-[10px] text-red-500 mt-1">A badge category is required.</p>}
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: P.textMid }}>Description</label>
          <textarea value={String(form.description ?? "")} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none resize-none" style={{ border: `1px solid ${P.border}`, color: P.text }} />
        </div>
        <div>
          <label className="block text-[11px] font-semibold mb-1" style={{ color: P.textMid }}>Status</label>
          <select value={String(form.status ?? "Active")} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none" style={{ border: `1px solid ${P.border}`, color: P.text }}>
            <option value="Active">Active</option>
            <option value="Disabled">Disabled</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={handleSave} disabled={!String(form.name ?? "").trim() || missingCategory} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>Save</button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
        </div>
      </div>
    </CrudModal>
  );
}

// ─── Badge Rules (award conditions per badge) ────────────────────────────────

type RuleEventOption = { id: number; name: string };

function BadgeRulesModal({ badge, onClose }: { badge: CrudRow; onClose: () => void }) {
  const badgeId = Number(badge.id);
  const [rules, setRules] = useState<BadgeRuleDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<BadgeRuleDto | "new" | null>(null);
  const [triggerEvents, setTriggerEvents] = useState<RuleEventOption[]>([]);
  const [audienceGroups, setAudienceGroups] = useState<RuleEventOption[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await xpGamificationApi.badges.listRules(badgeId, signal);
      if (!signal?.aborted) setRules(Array.isArray(data) ? data : []);
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load badge rules.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [badgeId]);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    xpGamificationApi.rules.lookups(c.signal)
      .then((l) => { if (!c.signal.aborted) setTriggerEvents(l.triggerEvents ?? []); })
      .catch(() => {});
    audienceApi.groups.list({}, c.signal)
      .then((g) => { if (!c.signal.aborted) setAudienceGroups((Array.isArray(g) ? g : []).map((x) => ({ id: x.id, name: x.name }))); })
      .catch(() => {});
    return () => c.abort();
  }, [load]);

  const remove = async (id: number) => {
    await xpGamificationApi.badges.deleteRule(badgeId, id);
    await load();
  };

  return (
    <CrudModal title={`Rules — ${String(badge.name)}`} onClose={onClose}>
      {editing ? (
        <BadgeRuleForm
          rule={editing === "new" ? null : editing}
          triggerEvents={triggerEvents}
          audienceGroups={audienceGroups}
          onSave={async (input) => {
            if (editing === "new") await xpGamificationApi.badges.createRule(badgeId, input);
            else await xpGamificationApi.badges.updateRule(badgeId, editing.id, input);
            setEditing(null);
            await load();
          }}
          onClose={() => setEditing(null)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: P.textMuted }}>Award conditions for this badge.</p>
            <button
              onClick={() => setEditing("new")}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: P.olive }}
            >
              + Add Rule
            </button>
          </div>
          {loading ? (
            <p className="text-xs py-4 text-center" style={{ color: P.textMuted }}>Loading rules…</p>
          ) : error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : rules.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: P.textMuted }}>No rules yet — add one to define how this badge is earned.</p>
          ) : (
            <div className="space-y-2">
              {rules.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-2 p-3 rounded-lg" style={{ border: `1px solid ${P.border}` }}>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: P.text }}>
                      {r.triggerEventId
                        ? triggerEvents.find((t) => t.id === r.triggerEventId)?.name ?? `Trigger #${r.triggerEventId}`
                        : "Any trigger"}
                    </p>
                    <p className="text-[10px] font-mono" style={{ color: P.textMuted }}>
                      {[
                        r.minimumXp != null ? `XP ≥ ${r.minimumXp}` : null,
                        r.minimumCourses != null ? `Courses ≥ ${r.minimumCourses}` : null,
                        r.minimumCertificates != null ? `Certificates ≥ ${r.minimumCertificates}` : null,
                        r.minimumPrograms != null ? `Programs ≥ ${r.minimumPrograms}` : null,
                        r.targetAudienceId ? audienceGroups.find((g) => g.id === r.targetAudienceId)?.name ?? `Audience #${r.targetAudienceId}` : null,
                        r.customExpression ? "custom condition" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "No conditions"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <StatusBadge status={r.isActive ? "Active" : "Disabled"} />
                    <button onClick={() => setEditing(r)} className="px-2 py-1 rounded-md text-[10px] font-semibold" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Edit</button>
                    <button onClick={() => void remove(r.id)} className="px-2 py-1 rounded-md text-[10px] font-semibold text-red-600" style={{ border: "1px solid #fecaca" }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </CrudModal>
  );
}

function BadgeRuleForm({
  rule, triggerEvents, audienceGroups, onSave, onClose,
}: {
  rule: BadgeRuleDto | null;
  triggerEvents: RuleEventOption[];
  audienceGroups: RuleEventOption[];
  onSave: (input: CreateBadgeRuleInput) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState(() =>
    rule
      ? {
          triggerEventId: rule.triggerEventId != null ? String(rule.triggerEventId) : "",
          minimumXp: rule.minimumXp != null ? String(rule.minimumXp) : "",
          minimumCourses: rule.minimumCourses != null ? String(rule.minimumCourses) : "",
          minimumCertificates: rule.minimumCertificates != null ? String(rule.minimumCertificates) : "",
          minimumPrograms: rule.minimumPrograms != null ? String(rule.minimumPrograms) : "",
          targetAudienceId: rule.targetAudienceId != null ? String(rule.targetAudienceId) : "",
          customExpression: rule.customExpression ? JSON.stringify(rule.customExpression, null, 2) : "",
          isActive: rule.isActive,
        }
      : {
          triggerEventId: "",
          minimumXp: "",
          minimumCourses: "",
          minimumCertificates: "",
          minimumPrograms: "",
          targetAudienceId: "",
          customExpression: "",
          isActive: true,
        },
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError("");
    let customExpression: Record<string, unknown> | null = null;
    const t = form.customExpression.trim();
    if (t) {
      try {
        const parsed = JSON.parse(t);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
        customExpression = parsed as Record<string, unknown>;
      } catch {
        setError("Custom Expression must be a valid JSON object.");
        return;
      }
    }
    const numOrNull = (v: string) => (v.trim() ? Number(v) : null);
    const input: CreateBadgeRuleInput = {
      triggerEventId: form.triggerEventId ? Number(form.triggerEventId) : null,
      minimumXp: numOrNull(form.minimumXp),
      minimumCourses: numOrNull(form.minimumCourses),
      minimumCertificates: numOrNull(form.minimumCertificates),
      minimumPrograms: numOrNull(form.minimumPrograms),
      targetAudienceId: form.targetAudienceId ? Number(form.targetAudienceId) : null,
      customExpression,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      await onSave(input);
    } catch (e: any) {
      setError(e?.message ?? "Failed to save the badge rule.");
    } finally {
      setSaving(false);
    }
  };

  const nf = (label: string, key: "minimumXp" | "minimumCourses" | "minimumCertificates" | "minimumPrograms") => (
    <Field label={label}>
      <Inp type="number" value={String((form as any)[key] ?? "")} onChange={(v) => setForm((f) => ({ ...f, [key]: v }))} placeholder="—" />
    </Field>
  );

  return (
    <div className="space-y-4">
      <Field label="Trigger Event">
        <Sel
          value={form.triggerEventId}
          onChange={(v) => setForm((f) => ({ ...f, triggerEventId: v }))}
          options={[{ value: "", label: "— Any trigger —" }, ...triggerEvents.map((t) => ({ value: String(t.id), label: t.name }))]}
          placeholder="— Any trigger —"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        {nf("Minimum XP", "minimumXp")}
        {nf("Minimum Courses", "minimumCourses")}
        {nf("Minimum Certificates", "minimumCertificates")}
        {nf("Minimum Programs", "minimumPrograms")}
      </div>
      <Field label="Target Audience">
        <Sel
          value={form.targetAudienceId}
          onChange={(v) => setForm((f) => ({ ...f, targetAudienceId: v }))}
          options={[{ value: "", label: "— All learners —" }, ...audienceGroups.map((g) => ({ value: String(g.id), label: g.name }))]}
          placeholder="— All learners —"
        />
      </Field>
      <Field label="Custom Expression (JSON)">
        <Textarea value={form.customExpression} onChange={(v) => setForm((f) => ({ ...f, customExpression: v }))} placeholder='{"streakDays": 7}' />
      </Field>
      <Field label="Status">
        <Sel value={form.isActive ? "Active" : "Disabled"} onChange={(v) => setForm((f) => ({ ...f, isActive: v === "Active" }))} options={["Active", "Disabled"]} />
      </Field>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2 pt-2">
        <button onClick={() => void handleSave()} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50" style={{ background: P.olive }}>
          {saving ? "Saving…" : "Save Rule"}
        </button>
        <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
      </div>
    </div>
  );
}
