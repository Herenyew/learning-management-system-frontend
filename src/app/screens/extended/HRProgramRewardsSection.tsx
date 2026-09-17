import { useCallback, useEffect, useMemo, useState } from "react";
import { Award, Check, Edit3, Link2, Plus, Power, Unlink, X, Zap } from "lucide-react";
import {
  certificateConfigApi,
  type CertificateTemplateDto,
} from "../../API/certificate-config.api";
import { programApi } from "../../API/program.api";
import type { ProgramTargetAudience } from "../../models/program.model";
import {
  xpGamificationApi,
  type CreateXpRuleInput,
  type XpRuleDto,
} from "../../API/xp-gamification.api";
import { usePermission } from "../../hooks/usePermission";
import { P } from "./extended.shared";
import {
  HRProgramSectionShell,
  SectionMutationError,
  mutationMessage,
  programButtonClass,
  programFieldClass,
} from "./HRProgramSectionShell";

type Lookup = { id: number; name: string; slug?: string | null };
type RuleDraft = {
  name: string;
  categoryId: string;
  triggerEventId: string;
  xpAmount: string;
  multiplier: string;
  maximumAward: string;
  targetAudienceId: string;
  isActive: boolean;
};

const PAGE_SIZE = 100;

const emptyRuleDraft = (categories: Lookup[], triggerEvents: Lookup[]): RuleDraft => ({
  name: "",
  categoryId: categories[0] ? String(categories[0].id) : "",
  triggerEventId: triggerEvents[0] ? String(triggerEvents[0].id) : "",
  xpAmount: "100",
  multiplier: "",
  maximumAward: "",
  targetAudienceId: "",
  isActive: true,
});

const draftFromRule = (rule: XpRuleDto): RuleDraft => ({
  name: rule.name,
  categoryId: String(rule.categoryId),
  triggerEventId: String(rule.triggerEventId),
  xpAmount: String(rule.xpAmount),
  multiplier: rule.multiplier != null ? String(rule.multiplier) : "",
  maximumAward: rule.maximumAward != null ? String(rule.maximumAward) : "",
  targetAudienceId: rule.targetAudienceId != null ? String(rule.targetAudienceId) : "",
  isActive: rule.isActive,
});

async function loadAllPages<T>(
  fetchPage: (page: number) => Promise<T[]>,
  signal?: AbortSignal,
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; !signal?.aborted; page += 1) {
    const next = await fetchPage(page);
    items.push(...next);
    if (next.length < PAGE_SIZE) break;
  }
  return items;
}

function validateRuleDraft(draft: RuleDraft): CreateXpRuleInput {
  const name = draft.name.trim();
  const categoryId = Number(draft.categoryId);
  const triggerEventId = Number(draft.triggerEventId);
  const xpAmount = Number(draft.xpAmount);
  const maximumAward = draft.maximumAward.trim() ? Number(draft.maximumAward) : null;
  const multiplier = draft.multiplier.trim() ? Number(draft.multiplier) : null;
  const targetAudienceId = draft.targetAudienceId ? Number(draft.targetAudienceId) : null;

  if (!name) throw new Error("Rule name is required.");
  if (!Number.isInteger(categoryId) || categoryId < 1) throw new Error("Select an XP category.");
  if (!Number.isInteger(triggerEventId) || triggerEventId < 1) throw new Error("Select a trigger event.");
  if (!Number.isInteger(xpAmount) || xpAmount < 1) throw new Error("XP amount must be a positive whole number.");
  if (maximumAward != null && (!Number.isInteger(maximumAward) || maximumAward < 0)) {
    throw new Error("Maximum award must be a non-negative whole number.");
  }
  if (multiplier != null && (!Number.isFinite(multiplier) || multiplier < 0)) {
    throw new Error("Multiplier must be a non-negative number.");
  }

  return {
    name,
    categoryId,
    triggerEventId,
    xpAmount,
    maximumAward,
    multiplier,
    targetAudienceId,
    isActive: draft.isActive,
  };
}

export function HRProgramRewardsSection({
  programId,
  canWrite,
  onChanged,
}: {
  programId: number;
  canWrite: boolean;
  onChanged: () => void;
}) {
  const can = usePermission();
  const canViewCertificates = can("certificate_template.view");
  const canAssignCertificates = canWrite && can("certificate_template.update");
  const canViewXp = can("xp_rule.view");
  const canCreateXp = canWrite && can("xp_rule.create");
  const canUpdateXp = canWrite && can("xp_rule.update");

  const [templates, setTemplates] = useState<CertificateTemplateDto[]>([]);
  const [rules, setRules] = useState<XpRuleDto[]>([]);
  const [categories, setCategories] = useState<Lookup[]>([]);
  const [triggerEvents, setTriggerEvents] = useState<Lookup[]>([]);
  const [audiences, setAudiences] = useState<ProgramTargetAudience[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [draft, setDraft] = useState<RuleDraft | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [certificateError, setCertificateError] = useState("");
  const [xpError, setXpError] = useState("");
  const [mutationError, setMutationError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setCertificateError("");
    setXpError("");

    const certificateRequest = canViewCertificates
      ? loadAllPages(
          (page) => certificateConfigApi.templates.list({ page, limit: PAGE_SIZE }, signal),
          signal,
        )
          .then((data) => { if (!signal?.aborted) setTemplates(data); })
          .catch((reason: unknown) => {
            if (!signal?.aborted) setCertificateError(mutationMessage(reason, "Unable to load certificate templates."));
          })
      : Promise.resolve(setTemplates([]));

    const xpRequest = canViewXp
      ? Promise.all([
          loadAllPages(
            (page) => xpGamificationApi.rules.list({ page, limit: PAGE_SIZE }, signal),
            signal,
          ),
          xpGamificationApi.rules.lookups(signal),
          programApi.targetAudiences.list(programId, signal),
        ])
          .then(([allRules, lookups, audienceGroups]) => {
            if (signal?.aborted) return;
            setRules(allRules.filter((rule) => rule.programId === programId));
            setCategories(lookups.categories ?? []);
            setTriggerEvents(lookups.triggerEvents ?? []);
            setAudiences(audienceGroups.filter((audience) => audience.audienceGroup.isActive));
          })
          .catch((reason: unknown) => {
            if (!signal?.aborted) setXpError(mutationMessage(reason, "Unable to load XP rule configuration."));
          })
      : Promise.resolve().then(() => {
          setRules([]);
          setCategories([]);
          setTriggerEvents([]);
          setAudiences([]);
        });

    await Promise.all([certificateRequest, xpRequest]);
    if (!signal?.aborted) setLoading(false);
  }, [canViewCertificates, canViewXp, programId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const linkedTemplates = useMemo(
    () => templates.filter((template) => template.learningProgramId === programId),
    [programId, templates],
  );
  const availableTemplates = useMemo(
    () => templates.filter((template) => template.status === "PUBLISHED" && template.learningProgramId == null),
    [templates],
  );
  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );
  const triggerNames = useMemo(
    () => new Map(triggerEvents.map((event) => [event.id, event.name])),
    [triggerEvents],
  );
  const audienceNames = useMemo(
    () => new Map(audiences.map((audience) => [audience.id, audience.audienceGroup.name])),
    [audiences],
  );

  const reloadAfterMutation = async () => {
    await load();
    onChanged();
  };

  const assignTemplate = async () => {
    const templateId = Number(selectedTemplateId);
    if (!templateId || !availableTemplates.some((template) => template.id === templateId)) return;
    setSaving(true);
    setMutationError("");
    try {
      await certificateConfigApi.templates.update(templateId, { learningProgramId: programId });
      setSelectedTemplateId("");
      await reloadAfterMutation();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to assign the certificate template."));
    } finally {
      setSaving(false);
    }
  };

  const unassignTemplate = async (template: CertificateTemplateDto) => {
    if (!window.confirm(`Unassign certificate template “${template.name}” from this program? Existing issued certificates are not changed.`)) return;
    setSaving(true);
    setMutationError("");
    try {
      await certificateConfigApi.templates.update(template.id, { learningProgramId: null });
      await reloadAfterMutation();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to unassign the certificate template."));
    } finally {
      setSaving(false);
    }
  };

  const openCreateRule = () => {
    setEditingRuleId(null);
    setDraft(emptyRuleDraft(categories, triggerEvents));
    setMutationError("");
  };

  const openEditRule = (rule: XpRuleDto) => {
    setEditingRuleId(rule.id);
    setDraft(draftFromRule(rule));
    setMutationError("");
  };

  const closeRuleForm = () => {
    setDraft(null);
    setEditingRuleId(null);
  };

  const saveRule = async () => {
    if (!draft) return;
    setSaving(true);
    setMutationError("");
    try {
      const input = { ...validateRuleDraft(draft), programId };
      if (editingRuleId == null) await xpGamificationApi.rules.create(input);
      else await xpGamificationApi.rules.update(editingRuleId, input);
      closeRuleForm();
      await reloadAfterMutation();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to save the XP rule."));
    } finally {
      setSaving(false);
    }
  };

  const deactivateRule = async (rule: XpRuleDto) => {
    if (!window.confirm(`Deactivate XP rule “${rule.name}”? It will stop matching future trigger events.`)) return;
    setSaving(true);
    setMutationError("");
    try {
      await xpGamificationApi.rules.update(rule.id, { isActive: false });
      await reloadAfterMutation();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to deactivate the XP rule."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <HRProgramSectionShell
      title="Program rewards"
      description="Configure certificate-template linkage and program-scoped XP rules. This does not issue certificates or award XP; runtime services apply active configuration when eligible events occur."
      icon={Award}
      loading={loading}
      onRetry={() => void load()}
    >
      <div className="space-y-4">
        <SectionMutationError message={mutationError} />

        <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
          <div className="mb-3 flex items-start gap-2">
            <Award size={14} className="mt-0.5 shrink-0" style={{ color: P.olive }} />
            <div>
              <h3 className="text-xs font-bold" style={{ color: P.text }}>Certificate configuration</h3>
              <p className="mt-0.5 text-[10px] leading-4" style={{ color: P.textMuted }}>
                Links one published template exclusively to this program. Assignment does not issue a learner certificate, and unassignment does not revoke certificates already issued.
              </p>
            </div>
          </div>

          {!canViewCertificates ? (
            <p className="rounded-lg px-3 py-2 text-xs" style={{ background: P.bg, color: P.textMuted }}>You do not have permission to view certificate templates.</p>
          ) : certificateError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              <span className="flex-1">{certificateError}</span>
              <button type="button" onClick={() => void load()} className="font-semibold underline">Retry</button>
            </div>
          ) : (
            <div className="space-y-2">
              {canAssignCertificates && linkedTemplates.length === 0 && (
                <div className="flex flex-wrap items-end gap-2 rounded-lg p-2.5" style={{ background: P.bg }}>
                  <label className="min-w-56 flex-1 text-[10px] font-bold" style={{ color: P.textMid }}>
                    Published, unassigned template
                    <select
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                      className={`${programFieldClass} mt-1`}
                      style={{ borderColor: P.border }}
                    >
                      <option value="">Select a template…</option>
                      {availableTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => void assignTemplate()} disabled={!selectedTemplateId || saving} className={`${programButtonClass} text-white`} style={{ background: P.olive }}>
                    <Link2 size={13} /> Assign
                  </button>
                </div>
              )}
              {linkedTemplates.length ? linkedTemplates.map((template) => (
                <div key={template.id} className="flex items-center gap-3 rounded-lg border px-3 py-2" style={{ borderColor: P.border }}>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold" style={{ color: P.text }}>{template.name}</p>
                    <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                      {template.status} · ID pattern {template.certificateIdPattern} · {template.validityMonths ? `${template.validityMonths} month validity` : "no expiry"}
                    </p>
                  </div>
                  {canAssignCertificates && (
                    <button type="button" onClick={() => void unassignTemplate(template)} disabled={saving} title="Unassign template" className="rounded-lg p-2" style={{ color: "#C0392B" }}>
                      <Unlink size={13} />
                    </button>
                  )}
                </div>
              )) : <p className="rounded-lg border p-3 text-xs" style={{ borderColor: P.border, color: P.textMuted }}>No certificate template is linked to this program.</p>}
            </div>
          )}
        </div>

        <div className="rounded-xl border p-3" style={{ borderColor: P.border }}>
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <Zap size={14} className="mt-0.5 shrink-0" style={{ color: P.gold }} />
              <div>
                <h3 className="text-xs font-bold" style={{ color: P.text }}>XP rule configuration</h3>
                <p className="mt-0.5 text-[10px] leading-4" style={{ color: P.textMuted }}>
                  Defines how future matching program events are evaluated. Saving a rule does not directly add XP to any learner account.
                </p>
              </div>
            </div>
            {canCreateXp && !draft && (
              <button type="button" onClick={openCreateRule} className={programButtonClass} style={{ background: P.lightSage, color: P.olive }}>
                <Plus size={13} /> Add XP rule
              </button>
            )}
          </div>

          {!canViewXp ? (
            <p className="rounded-lg px-3 py-2 text-xs" style={{ background: P.bg, color: P.textMuted }}>You do not have permission to view XP rules.</p>
          ) : xpError ? (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
              <span className="flex-1">{xpError}</span>
              <button type="button" onClick={() => void load()} className="font-semibold underline">Retry</button>
            </div>
          ) : (
            <div className="space-y-2">
              {draft && (
                <div className="rounded-lg border p-3" style={{ borderColor: P.border, background: P.bg }}>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-[10px] font-bold sm:col-span-2 lg:col-span-1" style={{ color: P.textMid }}>
                      Rule name
                      <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} />
                    </label>
                    <label className="text-[10px] font-bold" style={{ color: P.textMid }}>
                      Category
                      <select value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }}>
                        <option value="">Select category…</option>
                        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                      </select>
                    </label>
                    <label className="text-[10px] font-bold" style={{ color: P.textMid }}>
                      Trigger event
                      <select value={draft.triggerEventId} onChange={(event) => setDraft({ ...draft, triggerEventId: event.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }}>
                        <option value="">Select trigger…</option>
                        {triggerEvents.map((event) => <option key={event.id} value={event.id}>{event.name}</option>)}
                      </select>
                    </label>
                    <label className="text-[10px] font-bold" style={{ color: P.textMid }}>
                      XP amount
                      <input type="number" min={1} step={1} value={draft.xpAmount} onChange={(event) => setDraft({ ...draft, xpAmount: event.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} />
                    </label>
                    <label className="text-[10px] font-bold" style={{ color: P.textMid }}>
                      Multiplier
                      <input type="number" min={0} step="any" value={draft.multiplier} onChange={(event) => setDraft({ ...draft, multiplier: event.target.value })} placeholder="Optional" className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} />
                    </label>
                    <label className="text-[10px] font-bold" style={{ color: P.textMid }}>
                      Maximum award
                      <input type="number" min={0} step={1} value={draft.maximumAward} onChange={(event) => setDraft({ ...draft, maximumAward: event.target.value })} placeholder="Optional cap" className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }} />
                    </label>
                    <label className="text-[10px] font-bold sm:col-span-2 lg:col-span-3" style={{ color: P.textMid }}>
                      Target audience
                      <select value={draft.targetAudienceId} onChange={(event) => setDraft({ ...draft, targetAudienceId: event.target.value })} className={`${programFieldClass} mt-1`} style={{ borderColor: P.border }}>
                        <option value="">All eligible program learners</option>
                        {draft.targetAudienceId && !audienceNames.has(Number(draft.targetAudienceId)) && <option value={draft.targetAudienceId}>Unavailable audience #{draft.targetAudienceId}</option>}
                        {audiences.map((audience) => <option key={audience.id} value={audience.id}>{audience.audienceGroup.name}</option>)}
                      </select>
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs" style={{ color: P.textMid }}>
                      <input type="checkbox" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} style={{ accentColor: P.olive }} /> Active
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={closeRuleForm} className={programButtonClass} style={{ color: P.textMid }}><X size={13} /> Cancel</button>
                      <button type="button" onClick={() => void saveRule()} disabled={saving || (editingRuleId == null ? !canCreateXp : !canUpdateXp)} className={`${programButtonClass} text-white`} style={{ background: P.olive }}><Check size={13} /> {saving ? "Saving…" : editingRuleId == null ? "Create" : "Update"}</button>
                    </div>
                  </div>
                </div>
              )}

              {rules.length ? rules.map((rule) => (
                <div key={rule.id} className="flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2" style={{ borderColor: P.border, opacity: rule.isActive ? 1 : 0.7 }}>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-xs font-semibold" style={{ color: P.text }}>{rule.name}</p>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: rule.isActive ? P.paleGreen : P.bg, color: rule.isActive ? P.olive : P.textMuted }}>{rule.isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </div>
                    <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                      {triggerNames.get(rule.triggerEventId) ?? `Trigger #${rule.triggerEventId}`} · {categoryNames.get(rule.categoryId) ?? `Category #${rule.categoryId}`} · {rule.xpAmount} XP{rule.multiplier != null ? ` × ${rule.multiplier}` : ""}{rule.maximumAward != null ? ` · max ${rule.maximumAward}` : " · no maximum"} · {rule.targetAudienceId == null ? "all eligible learners" : audienceNames.get(rule.targetAudienceId) ?? `audience #${rule.targetAudienceId}`}
                    </p>
                  </div>
                  {canUpdateXp && (
                    <div className="flex gap-1">
                      <button type="button" onClick={() => openEditRule(rule)} disabled={saving} title="Edit XP rule" className="rounded-lg p-2" style={{ color: P.olive }}><Edit3 size={13} /></button>
                      {rule.isActive && <button type="button" onClick={() => void deactivateRule(rule)} disabled={saving} title="Deactivate XP rule" className="rounded-lg p-2" style={{ color: "#C0392B" }}><Power size={13} /></button>}
                    </div>
                  )}
                </div>
              )) : !draft && <p className="rounded-lg border p-3 text-xs" style={{ borderColor: P.border, color: P.textMuted }}>No XP rules are scoped to this program.</p>}
            </div>
          )}
        </div>
      </div>
    </HRProgramSectionShell>
  );
}
