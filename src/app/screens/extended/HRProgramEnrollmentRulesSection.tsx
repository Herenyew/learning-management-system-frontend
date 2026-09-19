import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Edit3, Plus, ShieldCheck, Trash2, X } from "lucide-react";
import {
  enrollmentApi,
  type CreateEnrollmentRuleInput,
  type EnrollmentRuleDto,
  type EnrollmentRuleTypeDto,
} from "../../API/enrollment.api";
import { programApi } from "../../API/program.api";
import { Permissions } from "../../constants/permission.constant";
import { usePermission } from "../../hooks/usePermission";
import type { ProgramTargetAudience } from "../../models/program.model";
import { P } from "./extended.shared";
import {
  HRProgramSectionShell,
  SectionMutationError,
  mutationMessage,
  programButtonClass,
  programFieldClass,
} from "./HRProgramSectionShell";

type Draft = {
  name: string;
  ruleTypeId: string;
  targetAudienceId: string;
  priority: string;
  isActive: boolean;
  conditionExpression: string;
};

const emptyDraft = (): Draft => ({
  name: "",
  ruleTypeId: "",
  targetAudienceId: "",
  priority: "1",
  isActive: true,
  conditionExpression: "",
});

const fromRule = (rule: EnrollmentRuleDto): Draft => ({
  name: rule.name,
  ruleTypeId: String(rule.ruleTypeId),
  targetAudienceId: rule.targetAudienceId == null ? "" : String(rule.targetAudienceId),
  priority: String(rule.priority),
  isActive: rule.isActive,
  conditionExpression: rule.conditionExpression
    ? JSON.stringify(rule.conditionExpression, null, 2)
    : "",
});

function parseConditionExpression(value: string): Record<string, unknown> | null {
  if (!value.trim()) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(
      'Condition expression must be valid JSON, for example {"employmentType":"FULL_TIME"}.',
    );
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Condition expression must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

export function HRProgramEnrollmentRulesSection({
  programId,
  canWrite,
  onChanged,
}: {
  programId: number;
  canWrite: boolean;
  onChanged: () => void;
}) {
  const can = usePermission();
  const canView =
    can(Permissions.ENROLLMENT_RULE_VIEW) && can(Permissions.ENROLLMENT_RULE_TYPE_VIEW);
  const canCreate = canWrite && can(Permissions.ENROLLMENT_RULE_CREATE);
  const canUpdate = canWrite && can(Permissions.ENROLLMENT_RULE_UPDATE);
  const canDelete = canWrite && can(Permissions.ENROLLMENT_RULE_DELETE);
  const [rules, setRules] = useState<EnrollmentRuleDto[]>([]);
  const [ruleTypes, setRuleTypes] = useState<EnrollmentRuleTypeDto[]>([]);
  const [audiences, setAudiences] = useState<ProgramTargetAudience[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!canView) {
        setLoading(false);
        setRules([]);
        setRuleTypes([]);
        setAudiences([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const [nextRules, nextRuleTypes, nextAudiences] = await Promise.all([
          enrollmentApi.rules.list({ entityType: "PROGRAM", page: 1, limit: 100 }, signal),
          enrollmentApi.ruleTypes.list({ page: 1, limit: 100 }, signal),
          programApi.targetAudiences.list(programId, signal),
        ]);

        if (!signal?.aborted) {
          setRules(
            nextRules
              .filter((rule) => rule.entityType === "PROGRAM" && rule.programId === programId)
              .sort((left, right) => right.priority - left.priority || left.id - right.id),
          );
          setRuleTypes(nextRuleTypes);
          setAudiences(nextAudiences.filter((assignment) => assignment.audienceGroup.isActive));
        }
      } catch (reason: unknown) {
        if (!signal?.aborted)
          setError(mutationMessage(reason, "Unable to load program enrollment rules."));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [canView, programId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const ruleTypeNames = useMemo(
    () => new Map(ruleTypes.map((ruleType) => [ruleType.id, ruleType.name])),
    [ruleTypes],
  );
  const audienceNames = useMemo(
    () => new Map(audiences.map((audience) => [audience.id, audience.audienceGroup.name])),
    [audiences],
  );

  const closeForm = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setShowForm(false);
    setMutationError("");
  };

  const save = async () => {
    if (!draft.name.trim()) return setMutationError("Rule name is required.");

    const ruleTypeId = Number(draft.ruleTypeId);
    if (!Number.isInteger(ruleTypeId) || ruleTypeId < 1)
      return setMutationError("Select a rule type.");

    const priority = Number(draft.priority);
    if (!Number.isInteger(priority) || priority < 0) {
      return setMutationError("Priority must be a non-negative whole number.");
    }

    let conditionExpression: Record<string, unknown> | null;
    try {
      conditionExpression = parseConditionExpression(draft.conditionExpression);
    } catch (reason: unknown) {
      return setMutationError(mutationMessage(reason, "Condition expression is invalid."));
    }

    const input: CreateEnrollmentRuleInput = {
      name: draft.name.trim(),
      entityType: "PROGRAM",
      courseVersionId: null,
      programId,
      ruleTypeId,
      targetAudienceId: draft.targetAudienceId ? Number(draft.targetAudienceId) : null,
      priority,
      isActive: draft.isActive,
      conditionExpression,
    };

    setSaving(true);
    setMutationError("");
    try {
      if (editingId != null) await enrollmentApi.rules.update(editingId, input);
      else await enrollmentApi.rules.create(input);
      closeForm();
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to save enrollment rule."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (rule: EnrollmentRuleDto) => {
    if (!window.confirm(`Delete enrollment rule “${rule.name}”?`)) return;

    setSaving(true);
    setMutationError("");
    try {
      await enrollmentApi.rules.delete(rule.id);
      await load();
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to delete enrollment rule."));
    } finally {
      setSaving(false);
    }
  };

  const beginEdit = (rule: EnrollmentRuleDto) => {
    setEditingId(rule.id);
    setDraft(fromRule(rule));
    setShowForm(true);
    setMutationError("");
  };

  return (
    <HRProgramSectionShell
      title="Enrollment rules"
      description="Configure persistent rules that determine how learners are enrolled in this program. Active rules are evaluated by rule type; higher priority values are considered first, and an audience limits the rule to members of that group. Optional JSON conditions add criteria understood by the enrollment engine."
      icon={ShieldCheck}
      loading={loading}
      error={error}
      onRetry={() => void load()}
      actions={
        canCreate && !showForm ? (
          <button
            type="button"
            onClick={() => {
              setDraft(emptyDraft());
              setEditingId(null);
              setShowForm(true);
              setMutationError("");
            }}
            className={programButtonClass}
            style={{ background: P.lightSage, color: P.olive }}
          >
            <Plus size={13} /> Add rule
          </button>
        ) : undefined
      }
    >
      {!canView ? (
        <p
          className="rounded-xl px-3 py-2 text-xs"
          style={{ background: P.bg, color: P.textMuted }}
        >
          You do not have permission to view enrollment rules.
        </p>
      ) : (
        <div className="space-y-3">
          <SectionMutationError message={mutationError} />

          <div
            className="rounded-xl border px-3 py-2.5 text-[11px] leading-5"
            style={{ borderColor: P.border, background: P.bg, color: P.textMuted }}
          >
            A rule without a target audience applies program-wide. Inactive rules are retained but
            do not participate in enrollment. Leave the condition blank when the rule type alone and
            optional audience fully define eligibility.
          </div>

          {showForm && (
            <div
              className="space-y-3 rounded-xl border p-4"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="sm:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>
                  Rule name
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    className={`${programFieldClass} mt-1`}
                    style={{ borderColor: P.border }}
                    disabled={saving}
                  />
                </label>
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Rule type
                  <select
                    value={draft.ruleTypeId}
                    onChange={(event) => setDraft({ ...draft, ruleTypeId: event.target.value })}
                    className={`${programFieldClass} mt-1`}
                    style={{ borderColor: P.border }}
                    disabled={saving}
                  >
                    <option value="">Select type…</option>
                    {ruleTypes.map((ruleType) => (
                      <option
                        key={ruleType.id}
                        value={ruleType.id}
                        disabled={!ruleType.isActive && Number(draft.ruleTypeId) !== ruleType.id}
                      >
                        {ruleType.name}
                        {!ruleType.isActive ? " (inactive)" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Target audience
                  <select
                    value={draft.targetAudienceId}
                    onChange={(event) =>
                      setDraft({ ...draft, targetAudienceId: event.target.value })
                    }
                    className={`${programFieldClass} mt-1`}
                    style={{ borderColor: P.border }}
                    disabled={saving}
                  >
                    <option value="">All eligible program learners</option>
                    {draft.targetAudienceId &&
                      !audienceNames.has(Number(draft.targetAudienceId)) && (
                        <option value={draft.targetAudienceId}>
                          Unavailable audience #{draft.targetAudienceId}
                        </option>
                      )}
                    {audiences.map((audience) => (
                      <option key={audience.id} value={audience.id}>
                        {audience.audienceGroup.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                  Priority
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={draft.priority}
                    onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
                    className={`${programFieldClass} mt-1`}
                    style={{ borderColor: P.border }}
                    disabled={saving}
                  />
                </label>
                <label
                  className="flex items-center gap-2 self-end px-1 py-2 text-xs font-semibold"
                  style={{ color: P.textMid }}
                >
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                    style={{ accentColor: P.olive }}
                    disabled={saving}
                  />
                  Active
                </label>
                <label className="sm:col-span-2 text-xs font-semibold" style={{ color: P.textMid }}>
                  Condition expression (JSON object, optional)
                  <textarea
                    rows={4}
                    value={draft.conditionExpression}
                    onChange={(event) =>
                      setDraft({ ...draft, conditionExpression: event.target.value })
                    }
                    placeholder='{"employmentType":"FULL_TIME"}'
                    className={`${programFieldClass} mt-1 resize-y font-mono text-xs`}
                    style={{ borderColor: P.border }}
                    disabled={saving}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className={programButtonClass}
                  style={{ color: P.textMid }}
                >
                  <X size={13} /> Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving || (editingId == null ? !canCreate : !canUpdate)}
                  className={`${programButtonClass} text-white`}
                  style={{ background: P.olive }}
                >
                  <Check size={13} /> {saving ? "Saving…" : editingId != null ? "Update" : "Create"}
                </button>
              </div>
            </div>
          )}

          {rules.length ? (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex flex-wrap items-start gap-3 rounded-xl border p-3"
                  style={{ borderColor: P.border, opacity: rule.isActive ? 1 : 0.65 }}
                >
                  <span
                    className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-bold"
                    style={{ background: P.lightSage, color: P.olive }}
                    title="Priority"
                  >
                    {rule.priority}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {rule.name}
                      </p>
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: P.bg, color: P.textMuted }}
                      >
                        {ruleTypeNames.get(rule.ruleTypeId) ?? `Rule type #${rule.ruleTypeId}`}
                      </span>
                      <span
                        className="text-[9px] font-bold"
                        style={{ color: rule.isActive ? P.olive : P.textMuted }}
                      >
                        {rule.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
                      {rule.targetAudienceId == null
                        ? "All eligible program learners"
                        : (audienceNames.get(rule.targetAudienceId) ??
                          `Unavailable audience #${rule.targetAudienceId}`)}
                      {rule.conditionExpression
                        ? " · Additional JSON conditions"
                        : " · No additional conditions"}
                    </p>
                    {rule.conditionExpression && (
                      <pre
                        className="mt-2 overflow-x-auto rounded-lg px-2.5 py-2 text-[10px] leading-4"
                        style={{ background: P.bg, color: P.textMid }}
                      >
                        {JSON.stringify(rule.conditionExpression, null, 2)}
                      </pre>
                    )}
                  </div>
                  {(canUpdate || canDelete) && (
                    <div className="flex gap-1">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => beginEdit(rule)}
                          disabled={saving}
                          className="rounded-lg p-2 disabled:opacity-50"
                          title="Edit rule"
                          style={{ color: P.olive }}
                        >
                          <Edit3 size={13} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => void remove(rule)}
                          disabled={saving}
                          className="rounded-lg p-2 disabled:opacity-50"
                          title="Delete rule"
                          style={{ color: "#C0392B" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : !showForm ? (
            <p
              className="rounded-xl border p-4 text-xs"
              style={{ borderColor: P.border, color: P.textMuted }}
            >
              No enrollment rules are configured for this program.
            </p>
          ) : null}
        </div>
      )}
    </HRProgramSectionShell>
  );
}
