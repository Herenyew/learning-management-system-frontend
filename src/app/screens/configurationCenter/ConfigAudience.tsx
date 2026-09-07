import { usePermission } from "../../hooks/usePermission";
import { AccessDenied } from "../../components/common";
import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronRight,
  CircleSlash2,
  Edit3,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  createAudienceGroup,
  createAudienceRule,
  deleteAudienceGroup,
  deleteAudienceRule,
  getAudienceGroup,
  getAudienceOptions,
  listAudienceGroups,
  listAudienceRules,
  resolveAudienceMembers,
  updateAudienceGroup,
  updateAudienceRule,
  type AudienceGroup,
  type AudienceMember,
  type AudienceOption,
  type AudienceOptions,
  type AudienceRule,
  type AudienceRuleInput,
  type AudienceRuleOperator,
} from "../../API/audience.api";
import { ApiClientError } from "../../API/httpClient";
import { P } from "../../constants/theme.constants";

type GroupFilter = "all" | "active" | "inactive";
type RuleConditionKey =
  | "departmentId"
  | "jobTitleId"
  | "jobLevelId"
  | "appRoleId"
  | "employmentTypeId"
  | "hireWithinDays";
type OptionCollectionKey = Exclude<keyof AudienceOptions, never>;

type GroupDraft = {
  id?: number;
  name: string;
  description: string;
  isActive: boolean;
};

type RuleDraft = {
  id?: number;
  condition: RuleConditionKey;
  value: string;
  operator: AudienceRuleOperator;
  isExclusion: boolean;
};

type ConfirmState = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
};

const RULE_CONDITIONS: Array<{
  key: RuleConditionKey;
  label: string;
  optionsKey?: OptionCollectionKey;
}> = [
  { key: "departmentId", label: "Department", optionsKey: "departments" },
  { key: "jobTitleId", label: "Job title", optionsKey: "jobTitles" },
  { key: "jobLevelId", label: "Job level", optionsKey: "jobLevels" },
  { key: "appRoleId", label: "Application role", optionsKey: "appRoles" },
  { key: "employmentTypeId", label: "Employment type", optionsKey: "employmentTypes" },
  { key: "hireWithinDays", label: "Hired within", optionsKey: undefined },
];

const emptyGroupDraft = (): GroupDraft => ({
  name: "",
  description: "",
  isActive: true,
});

const emptyRuleDraft = (): RuleDraft => ({
  condition: "departmentId",
  value: "",
  operator: "OR",
  isExclusion: false,
});

const toMessage = (reason: unknown, fallback: string) => {
  if (reason instanceof ApiClientError) {
    if (reason.status === 409) {
      // Conflict errors — provide specific guidance
      return reason.message;
    }
    if (reason.status === 400) {
      // Bad request — validation error
      return reason.message;
    }
    if (reason.status === 404) {
      return "Resource not found.";
    }
    if (reason.status === 403) {
      return "You do not have permission to perform this action.";
    }
    if (reason.status === 401) {
      return "Please sign in again.";
    }
  }
  if (reason instanceof Error && reason.message) {
    return reason.message;
  }
  return fallback;
};

const isAbortError = (reason: unknown) =>
  reason instanceof DOMException && reason.name === "AbortError";

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
};

const initialsFor = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase() || "?";

const optionsFor = (
  options: AudienceOptions | null,
  condition: RuleConditionKey,
): AudienceOption[] => {
  const definition = RULE_CONDITIONS.find((item) => item.key === condition);
  return definition?.optionsKey && options ? options[definition.optionsKey] : [];
};

const optionLabel = (options: AudienceOptions | null, condition: RuleConditionKey, id: number) =>
  optionsFor(options, condition).find((item) => item.id === id)?.name ?? `ID ${id}`;

const ruleConditions = (rule: AudienceRule) =>
  RULE_CONDITIONS.flatMap(({ key, label }) => {
    const value = rule[key];
    return typeof value === "number" ? [{ key, label, value }] : [];
  });

const ruleDraftFrom = (rule: AudienceRule): RuleDraft => {
  const firstCondition = ruleConditions(rule)[0];
  return {
    id: rule.id,
    condition: firstCondition?.key ?? "departmentId",
    value: firstCondition ? String(firstCondition.value) : "",
    operator: rule.operator,
    isExclusion: rule.isExclusion,
  };
};

const fieldClass =
  "w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60";
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-55";

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={
        active
          ? { color: P.darkOlive, background: P.lightSage, borderColor: P.border }
          : { color: "#64748B", background: "#F8FAFC", borderColor: "#E2E8F0" }
      }
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: active ? P.olive : "#94A3B8" }}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ErrorNotice({
  message,
  onRetry,
  compact = false,
}: {
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 text-red-700 ${
        compact ? "px-3 py-2.5 text-xs" : "px-4 py-3 text-sm"
      }`}
      role="alert"
    >
      <AlertCircle size={compact ? 15 : 17} className="mt-0.5 flex-shrink-0" />
      <span className="min-w-0 flex-1">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-bold"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
      <div
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ color: P.olive, background: P.lightSage }}
      >
        {icon}
      </div>
      <h3 className="text-sm font-bold" style={{ color: P.text }}>
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed" style={{ color: P.textMuted }}>
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function ModalFrame({
  title,
  description,
  onClose,
  children,
  footer,
  maxWidth = "max-w-lg",
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-2xl border bg-white shadow-2xl`}
        style={{ borderColor: P.border }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="audience-modal-title"
      >
        <div
          className="flex items-start justify-between gap-4 border-b px-5 py-4"
          style={{ borderColor: P.border }}
        >
          <div>
            <h2 id="audience-modal-title" className="text-base font-bold" style={{ color: P.text }}>
              {title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: P.textMuted }}>
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border p-1.5"
            style={{ color: P.textMuted, borderColor: P.border }}
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-5">{children}</div>
        <div
          className="flex items-center justify-end gap-2 border-t px-5 py-4"
          style={{ borderColor: P.border, background: P.bg }}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}

function GroupDialog({
  draft,
  setDraft,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  draft: GroupDraft;
  setDraft: (draft: GroupDraft) => void;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const editing = draft.id !== undefined;
  return (
    <form onSubmit={onSubmit}>
      <ModalFrame
        title={editing ? "Edit audience group" : "Create audience group"}
        description="Define a reusable employee segment. Rules can be configured after the group is created."
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className={buttonBase}
              style={{ color: P.textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !draft.name.trim()}
              className={`${buttonBase} text-white`}
              style={{ background: P.olive }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editing ? "Save changes" : "Create group"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <ErrorNotice message={error} compact />}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold" style={{ color: P.text }}>
              Group name <span className="text-red-500">*</span>
            </span>
            <input
              autoFocus
              required
              maxLength={100}
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              className={fieldClass}
              style={{ borderColor: P.border, color: P.text }}
              placeholder="e.g. New people managers"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold" style={{ color: P.text }}>
              Description
            </span>
            <textarea
              rows={4}
              maxLength={2000}
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              className={`${fieldClass} resize-none`}
              style={{ borderColor: P.border, color: P.text }}
              placeholder="Explain when this audience should be used."
            />
            <span className="mt-1 block text-right text-[10px]" style={{ color: P.textMuted }}>
              {draft.description.length}/2000
            </span>
          </label>
          {editing && (
            <label
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <span>
                <span className="block text-xs font-bold" style={{ color: P.text }}>
                  Group is active
                </span>
                <span className="mt-0.5 block text-[11px]" style={{ color: P.textMuted }}>
                  Inactive groups do not resolve any members.
                </span>
              </span>
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })}
                className="h-5 w-5"
                style={{ accentColor: P.olive }}
              />
            </label>
          )}
        </div>
      </ModalFrame>
    </form>
  );
}

function RuleDialog({
  draft,
  setDraft,
  options,
  optionsError,
  saving,
  error,
  onClose,
  onSubmit,
}: {
  draft: RuleDraft;
  setDraft: (draft: RuleDraft) => void;
  options: AudienceOptions | null;
  optionsError: string;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const editing = draft.id !== undefined;
  const currentOptions = optionsFor(options, draft.condition);
  const isDays = draft.condition === "hireWithinDays";
  const cannotSelectOption = !isDays && (Boolean(optionsError) || currentOptions.length === 0);

  return (
    <form onSubmit={onSubmit}>
      <ModalFrame
        title={editing ? "Edit targeting rule" : "Add targeting rule"}
        description="Each rule targets one employee attribute. Inclusion rules are combined using the selected operator; exclusions are always removed."
        onClose={onClose}
        maxWidth="max-w-xl"
        footer={
          <>
            <button
              type="button"
              onClick={onClose}
              className={buttonBase}
              style={{ color: P.textMuted }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !draft.value || cannotSelectOption}
              className={`${buttonBase} text-white`}
              style={{ background: P.olive }}
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {editing ? "Save rule" : "Add rule"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {error && <ErrorNotice message={error} compact />}
          {optionsError && !isDays && (
            <ErrorNotice message={`Targeting options are unavailable: ${optionsError}`} compact />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold" style={{ color: P.text }}>
                Employee attribute
              </span>
              <select
                value={draft.condition}
                disabled={editing}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    condition: event.target.value as RuleConditionKey,
                    value: "",
                  })
                }
                className={fieldClass}
                style={{ borderColor: P.border, color: P.text }}
              >
                {RULE_CONDITIONS.map((condition) => (
                  <option key={condition.key} value={condition.key}>
                    {condition.label}
                  </option>
                ))}
              </select>
              {editing && (
                <span className="mt-1 block text-[10px]" style={{ color: P.textMuted }}>
                  Delete and recreate the rule to change its attribute.
                </span>
              )}
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold" style={{ color: P.text }}>
                {isDays ? "Number of days" : "Attribute value"}
              </span>
              {isDays ? (
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={draft.value}
                  onChange={(event) => setDraft({ ...draft, value: event.target.value })}
                  className={fieldClass}
                  style={{ borderColor: P.border, color: P.text }}
                  placeholder="e.g. 90"
                />
              ) : (
                <select
                  required
                  value={draft.value}
                  disabled={cannotSelectOption}
                  onChange={(event) => setDraft({ ...draft, value: event.target.value })}
                  className={fieldClass}
                  style={{ borderColor: P.border, color: P.text }}
                >
                  <option value="">Select a value</option>
                  {currentOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                      {option.code ? ` (${option.code})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3"
              style={{ borderColor: P.border, background: P.bg }}
            >
              <span>
                <span className="block text-xs font-bold" style={{ color: P.text }}>
                  Join operator
                </span>
                <span className="mt-0.5 block text-[10px]" style={{ color: P.textMuted }}>
                  Combine with preceding inclusions.
                </span>
              </span>
              <select
                value={draft.operator}
                onChange={(event) =>
                  setDraft({ ...draft, operator: event.target.value as AudienceRuleOperator })
                }
                className="rounded-lg border bg-white px-2 py-1.5 text-xs font-bold outline-none"
                style={{ borderColor: P.border, color: P.text }}
              >
                <option value="OR">OR</option>
                <option value="AND">AND</option>
              </select>
            </label>
            <label
              className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3"
              style={{
                borderColor: draft.isExclusion ? "#FCA5A5" : P.border,
                background: draft.isExclusion ? "#FEF2F2" : P.bg,
              }}
            >
              <span>
                <span className="block text-xs font-bold" style={{ color: P.text }}>
                  Exclusion rule
                </span>
                <span className="mt-0.5 block text-[10px]" style={{ color: P.textMuted }}>
                  Remove matching employees.
                </span>
              </span>
              <input
                type="checkbox"
                checked={draft.isExclusion}
                onChange={(event) => setDraft({ ...draft, isExclusion: event.target.checked })}
                className="h-5 w-5"
                style={{ accentColor: "#DC2626" }}
              />
            </label>
          </div>
        </div>
      </ModalFrame>
    </form>
  );
}

function ConfirmDialog({
  state,
  busy,
  error,
  onClose,
}: {
  state: ConfirmState;
  busy: boolean;
  error: string;
  onClose: () => void;
}) {
  return (
    <ModalFrame
      title={state.title}
      description={state.description}
      onClose={onClose}
      maxWidth="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className={buttonBase}
            style={{ color: P.textMuted }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void state.onConfirm()}
            className={`${buttonBase} bg-red-600 text-white`}
          >
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {state.confirmLabel}
          </button>
        </>
      }
    >
      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex gap-3">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
          <p className="text-xs leading-relaxed text-red-700">
            This action cannot be undone. Groups currently assigned to learning targets may be
            protected by the server.
          </p>
        </div>
      </div>
      {error && (
        <div className="mt-3">
          <ErrorNotice message={error} compact />
        </div>
      )}
    </ModalFrame>
  );
}

export function ConfigAudience() {
  const can = usePermission();
  const [groups, setGroups] = useState<AudienceGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState("");
  const [groupQuery, setGroupQuery] = useState("");
  const [appliedGroupQuery, setAppliedGroupQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState<GroupFilter>("all");
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<AudienceGroup | null>(null);
  const [rules, setRules] = useState<AudienceRule[]>([]);
  const [members, setMembers] = useState<AudienceMember[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [appliedMemberQuery, setAppliedMemberQuery] = useState("");
  const [options, setOptions] = useState<AudienceOptions | null>(null);
  const [optionsError, setOptionsError] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [detailVersion, setDetailVersion] = useState(0);
  const [groupDraft, setGroupDraft] = useState<GroupDraft | null>(null);
  const [ruleDraft, setRuleDraft] = useState<RuleDraft | null>(null);
  const [dialogError, setDialogError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const loadGroups = useCallback(
    async (signal?: AbortSignal) => {
      setGroupsLoading(true);
      setGroupsError("");
      try {
        const items = await listAudienceGroups(
          {
            search: appliedGroupQuery || undefined,
            isActive: groupFilter === "all" ? undefined : groupFilter === "active",
            page: 1,
            pageSize: 100,
          },
          signal,
        );
        if (signal?.aborted) return;
        setGroups(items);
        setSelectedGroupId((current) => {
          if (current !== null && items.some((item) => item.id === current)) return current;
          return items[0]?.id ?? null;
        });
      } catch (reason) {
        if (isAbortError(reason)) return;
        setGroupsError(toMessage(reason, "Unable to load audience groups."));
      } finally {
        if (!signal?.aborted) setGroupsLoading(false);
      }
    },
    [appliedGroupQuery, groupFilter],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadGroups(controller.signal);
    return () => controller.abort();
  }, [loadGroups]);

  useEffect(() => {
    const controller = new AbortController();
    setOptionsLoading(true);
    setOptionsError("");
    getAudienceOptions(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setOptions(result);
      })
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) {
          setOptionsError(toMessage(reason, "Unable to load audience targeting options."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setOptionsLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (selectedGroupId === null) {
      setSelectedGroup(null);
      setRules([]);
      setDetailError("");
      return;
    }

    const controller = new AbortController();
    setDetailLoading(true);
    setDetailError("");
    Promise.all([
      getAudienceGroup(selectedGroupId, controller.signal),
      listAudienceRules(selectedGroupId, controller.signal),
    ])
      .then(([group, ruleItems]) => {
        if (controller.signal.aborted) return;
        setSelectedGroup(group);
        setRules(ruleItems);
      })
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) {
          setDetailError(toMessage(reason, "Unable to load audience group details."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailLoading(false);
      });
    return () => controller.abort();
  }, [selectedGroupId, detailVersion]);

  useEffect(() => {
    if (selectedGroupId === null) {
      setMembers([]);
      setMemberError("");
      return;
    }

    const controller = new AbortController();
    setMemberLoading(true);
    setMemberError("");
    resolveAudienceMembers(
      selectedGroupId,
      { search: appliedMemberQuery || undefined, page: 1, pageSize: 20 },
      controller.signal,
    )
      .then((items) => {
        if (!controller.signal.aborted) setMembers(items);
      })
      .catch((reason: unknown) => {
        if (!isAbortError(reason)) {
          setMemberError(toMessage(reason, "Unable to resolve audience members."));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setMemberLoading(false);
      });
    return () => controller.abort();
  }, [selectedGroupId, appliedMemberQuery, detailVersion]);

  const activeGroups = useMemo(() => groups.filter((group) => group.isActive).length, [groups]);

  const closeDialogs = () => {
    if (saving) return;
    setGroupDraft(null);
    setRuleDraft(null);
    setConfirmState(null);
    setDialogError("");
  };

  const openEditGroup = () => {
    if (!selectedGroup) return;
    setDialogError("");
    setGroupDraft({
      id: selectedGroup.id,
      name: selectedGroup.name,
      description: selectedGroup.description ?? "",
      isActive: selectedGroup.isActive,
    });
  };

  const submitGroup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupDraft?.name.trim()) return;
    setSaving(true);
    setDialogError("");
    try {
      const input = {
        name: groupDraft.name.trim(),
        description: groupDraft.description.trim(),
      };
      const saved = groupDraft.id
        ? await updateAudienceGroup(groupDraft.id, { ...input, isActive: groupDraft.isActive })
        : await createAudienceGroup(input);
      setGroupDraft(null);
      setSelectedGroupId(saved.id);
      await loadGroups();
      setSelectedGroupId(saved.id);
      setDetailVersion((version) => version + 1);
    } catch (reason) {
      const message = toMessage(reason, "Unable to save the audience group.");
      console.log("Create group error:", message);
      setDialogError(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleSelectedGroup = async () => {
    if (!selectedGroup) return;
    setSaving(true);
    setDetailError("");
    try {
      const updated = await updateAudienceGroup(selectedGroup.id, {
        isActive: !selectedGroup.isActive,
      });
      setSelectedGroup(updated);
      setGroups((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setDetailVersion((version) => version + 1);
    } catch (reason) {
      setDetailError(toMessage(reason, "Unable to change the audience group status."));
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteGroup = () => {
    if (!selectedGroup) return;
    setDialogError("");
    setConfirmState({
      title: `Delete “${selectedGroup.name}”?`,
      description: "The group and its targeting rules will be permanently removed.",
      confirmLabel: "Delete group",
      onConfirm: async () => {
        setSaving(true);
        setDialogError("");
        try {
          await deleteAudienceGroup(selectedGroup.id);
          setConfirmState(null);
          setSelectedGroupId(null);
          setSelectedGroup(null);
          await loadGroups();
        } catch (reason) {
          setDialogError(toMessage(reason, "Unable to delete the audience group."));
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const submitRule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedGroup || !ruleDraft || ruleDraft.value === "") return;
    const numericValue = Number(ruleDraft.value);
    if (!Number.isInteger(numericValue) || numericValue < 0) {
      setDialogError("Choose a valid targeting value.");
      return;
    }

    const input: AudienceRuleInput = {};

    // Set only the selected condition
    input[ruleDraft.condition] = numericValue;

    // Always include operator and isExclusion
    input.operator = ruleDraft.operator;
    input.isExclusion = ruleDraft.isExclusion;
    setSaving(true);
    setDialogError("");
    try {
      if (ruleDraft.id) {
        await updateAudienceRule(selectedGroup.id, ruleDraft.id, input);
      } else {
        await createAudienceRule(selectedGroup.id, input);
      }
      setRuleDraft(null);
      setDetailVersion((version) => version + 1);
    } catch (reason) {
      setDialogError(toMessage(reason, "Unable to save the targeting rule."));
    } finally {
      setSaving(false);
    }
  };

  const requestDeleteRule = (rule: AudienceRule) => {
    if (!selectedGroup) return;
    setDialogError("");
    setConfirmState({
      title: "Delete targeting rule?",
      description: "Member resolution will update immediately after this rule is removed.",
      confirmLabel: "Delete rule",
      onConfirm: async () => {
        setSaving(true);
        setDialogError("");
        try {
          await deleteAudienceRule(selectedGroup.id, rule.id);
          setConfirmState(null);
          setDetailVersion((version) => version + 1);
        } catch (reason) {
          setDialogError(toMessage(reason, "Unable to delete the targeting rule."));
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const refreshAll = () => {
    void loadGroups();
    setDetailVersion((version) => version + 1);
  };

  if (!can("audience.view")) {
    return <AccessDenied permission="audience.view" />;
  }

  return (
    <div className="space-y-5">
      <section
        className="overflow-hidden rounded-2xl border bg-white"
        style={{ borderColor: P.border, boxShadow: "0 12px 36px rgba(4, 120, 87, 0.07)" }}
      >
        <div
          className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ background: `linear-gradient(135deg, ${P.paleGreen}, white 72%)` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{ color: "white", background: P.olive }}
            >
              <Users size={21} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: P.text }}>
                Audience Management
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed" style={{ color: P.textMuted }}>
                Build dynamic employee groups from synchronized EMS attributes and preview exactly
                who matches.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={refreshAll}
              disabled={groupsLoading || detailLoading}
              className={buttonBase}
              style={{ color: P.darkOlive, border: `1px solid ${P.border}`, background: "white" }}
            >
              <RefreshCw size={14} className={groupsLoading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              type="button"
              onClick={() => {
                setDialogError("");
                setGroupDraft(emptyGroupDraft());
              }}
              className={`${buttonBase} text-white`}
              style={{ background: P.olive }}
            >
              <Plus size={15} /> New group
            </button>
          </div>
        </div>

        <div className="grid border-t sm:grid-cols-3" style={{ borderColor: P.border }}>
          {[
            { label: "Groups shown", value: groups.length, icon: Users },
            { label: "Active groups", value: activeGroups, icon: ShieldCheck },
            {
              label: "Resolved preview",
              value: selectedGroupId ? members.length : 0,
              icon: UserRound,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex items-center gap-3 px-5 py-3.5 ${index ? "sm:border-l" : ""}`}
                style={{ borderColor: P.border }}
              >
                <Icon size={16} style={{ color: P.olive }} />
                <div>
                  <p className="text-lg font-bold leading-none" style={{ color: P.text }}>
                    {stat.value}
                  </p>
                  <p
                    className="mt-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: P.textMuted }}
                  >
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {groupsError && <ErrorNotice message={groupsError} onRetry={() => void loadGroups()} />}

      <div className="grid min-h-[650px] gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside
          className="overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: P.border }}
        >
          <div className="border-b p-4" style={{ borderColor: P.border }}>
            <form
              className="relative"
              onSubmit={(event) => {
                event.preventDefault();
                setAppliedGroupQuery(groupQuery.trim());
              }}
            >
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: P.textMuted }}
              />
              <input
                value={groupQuery}
                onChange={(event) => setGroupQuery(event.target.value)}
                className={`${fieldClass} pl-9 pr-9`}
                style={{ borderColor: P.border, color: P.text }}
                placeholder="Search groups"
                aria-label="Search audience groups"
              />
              {groupQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setGroupQuery("");
                    setAppliedGroupQuery("");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: P.textMuted }}
                  aria-label="Clear group search"
                >
                  <X size={14} />
                </button>
              )}
            </form>
            <div
              className="mt-3 flex items-center gap-1 rounded-xl p-1"
              style={{ background: P.bg }}
            >
              <Filter size={13} className="ml-2 mr-1" style={{ color: P.textMuted }} />
              {(["all", "active", "inactive"] as GroupFilter[]).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setGroupFilter(filter)}
                  className="flex-1 rounded-lg px-2 py-1.5 text-[10px] font-bold capitalize transition"
                  style={
                    groupFilter === filter
                      ? {
                          color: P.darkOlive,
                          background: "white",
                          boxShadow: "0 2px 8px rgba(4,120,87,.08)",
                        }
                      : { color: P.textMuted }
                  }
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="max-h-[530px] overflow-y-auto p-2">
            {groupsLoading ? (
              <div
                className="flex items-center justify-center gap-2 py-12 text-xs"
                style={{ color: P.textMuted }}
              >
                <Loader2 size={15} className="animate-spin" /> Loading groups…
              </div>
            ) : groups.length === 0 ? (
              <EmptyState
                icon={<Users size={21} />}
                title={appliedGroupQuery ? "No matching groups" : "No audience groups yet"}
                description={
                  appliedGroupQuery
                    ? "Try a different search or status filter."
                    : "Create the first group to begin defining dynamic audiences."
                }
              />
            ) : (
              <div className="space-y-1.5">
                {groups.map((group) => {
                  const selected = selectedGroupId === group.id;
                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => {
                        setSelectedGroupId(group.id);
                        setAppliedMemberQuery("");
                        setMemberQuery("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition"
                      style={{
                        borderColor: selected ? P.sage : "transparent",
                        background: selected ? P.paleGreen : "white",
                      }}
                    >
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                        style={{ color: P.darkOlive, background: selected ? P.lightSage : P.bg }}
                      >
                        {initialsFor(group.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold" style={{ color: P.text }}>
                          {group.name}
                        </p>
                        <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>
                          Updated {formatDate(group.updatedAt)}
                        </p>
                      </div>
                      <span
                        className="h-2 w-2 flex-shrink-0 rounded-full"
                        style={{ background: group.isActive ? P.olive : "#CBD5E1" }}
                        title={group.isActive ? "Active" : "Inactive"}
                      />
                      <ChevronRight size={14} style={{ color: selected ? P.olive : P.textMuted }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main
          className="min-w-0 overflow-hidden rounded-2xl border bg-white"
          style={{ borderColor: P.border }}
        >
          {selectedGroupId === null ? (
            <EmptyState
              icon={<Users size={22} />}
              title="Select an audience group"
              description="Choose a group from the list to configure rules and preview matching employees."
              action={
                <button
                  type="button"
                  onClick={() => setGroupDraft(emptyGroupDraft())}
                  className={`${buttonBase} text-white`}
                  style={{ background: P.olive }}
                >
                  <Plus size={14} /> Create group
                </button>
              }
            />
          ) : detailLoading && !selectedGroup ? (
            <div
              className="flex min-h-[520px] items-center justify-center gap-2 text-sm"
              style={{ color: P.textMuted }}
            >
              <Loader2 size={18} className="animate-spin" /> Loading audience details…
            </div>
          ) : (
            <>
              <div className="border-b px-5 py-5" style={{ borderColor: P.border }}>
                {detailError && (
                  <div className="mb-4">
                    <ErrorNotice
                      message={detailError}
                      compact
                      onRetry={() => setDetailVersion((version) => version + 1)}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-lg font-bold" style={{ color: P.text }}>
                        {selectedGroup?.name ?? "Audience group"}
                      </h2>
                      {selectedGroup && <StatusPill active={selectedGroup.isActive} />}
                    </div>
                    <p
                      className="mt-2 max-w-2xl text-xs leading-relaxed"
                      style={{ color: P.textMuted }}
                    >
                      {selectedGroup?.description ||
                        "No description has been added for this audience group."}
                    </p>
                    {selectedGroup && (
                      <p
                        className="mt-2 text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: P.textMuted }}
                      >
                        Created {formatDate(selectedGroup.createdAt)} · Updated{" "}
                        {formatDate(selectedGroup.updatedAt)}
                      </p>
                    )}
                  </div>
                  {selectedGroup && (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void toggleSelectedGroup()}
                        disabled={saving}
                        className={buttonBase}
                        style={{ color: P.textMid, border: `1px solid ${P.border}` }}
                      >
                        {selectedGroup.isActive ? <CircleSlash2 size={14} /> : <Check size={14} />}
                        {selectedGroup.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={openEditGroup}
                        className={buttonBase}
                        style={{ color: P.textMid, border: `1px solid ${P.border}` }}
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={requestDeleteGroup}
                        className={buttonBase}
                        style={{
                          color: "#B91C1C",
                          border: "1px solid #FECACA",
                          background: "#FEF2F2",
                        }}
                        aria-label={`Delete ${selectedGroup.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(330px,0.9fr)]">
                <section
                  className="overflow-hidden rounded-2xl border"
                  style={{ borderColor: P.border }}
                >
                  <div
                    className="flex items-center justify-between gap-3 border-b px-4 py-3.5"
                    style={{ borderColor: P.border, background: P.bg }}
                  >
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: P.text }}>
                        Targeting rules
                      </h3>
                      <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                        {rules.length} {rules.length === 1 ? "rule" : "rules"} configured
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDialogError("");
                        setRuleDraft(emptyRuleDraft());
                      }}
                      disabled={!selectedGroup}
                      className={`${buttonBase} text-white`}
                      style={{ background: P.olive }}
                    >
                      <Plus size={14} /> Add rule
                    </button>
                  </div>

                  {optionsLoading && (
                    <div
                      className="border-b px-4 py-2 text-[10px]"
                      style={{ color: P.textMuted, borderColor: P.border }}
                    >
                      <Loader2 size={11} className="mr-1.5 inline animate-spin" /> Loading targeting
                      options…
                    </div>
                  )}
                  {optionsError && (
                    <div className="border-b p-3" style={{ borderColor: P.border }}>
                      <ErrorNotice message={`Targeting options: ${optionsError}`} compact />
                    </div>
                  )}

                  {detailLoading ? (
                    <div
                      className="flex items-center justify-center gap-2 py-12 text-xs"
                      style={{ color: P.textMuted }}
                    >
                      <Loader2 size={15} className="animate-spin" /> Loading rules…
                    </div>
                  ) : rules.length === 0 ? (
                    <EmptyState
                      icon={<Filter size={20} />}
                      title="No targeting rules"
                      description="This group resolves no members until at least one inclusion rule is added."
                    />
                  ) : (
                    <div className="space-y-2 p-3">
                      {rules.map((rule, index) => (
                        <div
                          key={rule.id}
                          className="rounded-xl border p-3.5"
                          style={{
                            borderColor: rule.isExclusion ? "#FECACA" : P.border,
                            background: rule.isExclusion ? "#FFF7F7" : "white",
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-black"
                              style={{
                                color: rule.isExclusion ? "#B91C1C" : P.darkOlive,
                                background: rule.isExclusion ? "#FEE2E2" : P.lightSage,
                              }}
                            >
                              {rule.isExclusion ? "NOT" : index === 0 ? "IF" : rule.operator}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap gap-1.5">
                                {ruleConditions(rule).map((condition) => (
                                  <span
                                    key={condition.key}
                                    className="rounded-lg border px-2 py-1 text-[11px] font-semibold"
                                    style={{
                                      color: P.text,
                                      borderColor: P.border,
                                      background: P.bg,
                                    }}
                                  >
                                    {condition.label}:{" "}
                                    {condition.key === "hireWithinDays"
                                      ? `${condition.value} days`
                                      : optionLabel(options, condition.key, condition.value)}
                                  </span>
                                ))}
                              </div>
                              <p className="mt-2 text-[10px]" style={{ color: P.textMuted }}>
                                {rule.isExclusion
                                  ? "Matching employees are excluded from this audience."
                                  : `${rule.operator} with preceding inclusion rules.`}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setDialogError("");
                                  setRuleDraft(ruleDraftFrom(rule));
                                }}
                                className="rounded-lg border p-1.5"
                                style={{ color: P.textMid, borderColor: P.border }}
                                aria-label="Edit targeting rule"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => requestDeleteRule(rule)}
                                className="rounded-lg border border-red-100 p-1.5 text-red-600"
                                aria-label="Delete targeting rule"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <section
                  className="overflow-hidden rounded-2xl border"
                  style={{ borderColor: P.border }}
                >
                  <div
                    className="border-b px-4 py-3.5"
                    style={{ borderColor: P.border, background: P.bg }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: P.text }}>
                          Member preview
                        </h3>
                        <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                          First {members.length} matching employees
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDetailVersion((version) => version + 1)}
                        disabled={memberLoading}
                        className="rounded-lg border p-2"
                        style={{ color: P.textMid, borderColor: P.border, background: "white" }}
                        aria-label="Refresh member preview"
                      >
                        <RefreshCw size={13} className={memberLoading ? "animate-spin" : ""} />
                      </button>
                    </div>
                    <form
                      className="relative mt-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setAppliedMemberQuery(memberQuery.trim());
                      }}
                    >
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: P.textMuted }}
                      />
                      <input
                        value={memberQuery}
                        onChange={(event) => setMemberQuery(event.target.value)}
                        className={`${fieldClass} py-2 pl-9 text-xs`}
                        style={{ borderColor: P.border, color: P.text }}
                        placeholder="Search resolved members"
                        aria-label="Search resolved members"
                      />
                    </form>
                  </div>

                  {memberError && (
                    <div className="p-3">
                      <ErrorNotice
                        message={memberError}
                        compact
                        onRetry={() => setDetailVersion((version) => version + 1)}
                      />
                    </div>
                  )}
                  {memberLoading ? (
                    <div
                      className="flex items-center justify-center gap-2 py-12 text-xs"
                      style={{ color: P.textMuted }}
                    >
                      <Loader2 size={15} className="animate-spin" /> Resolving members…
                    </div>
                  ) : members.length === 0 ? (
                    <EmptyState
                      icon={<UserRound size={20} />}
                      title={rules.length === 0 ? "Rules are required" : "No employees match"}
                      description={
                        rules.length === 0
                          ? "Add an inclusion rule to generate the live member preview."
                          : "No active employees currently satisfy this group’s targeting rules."
                      }
                    />
                  ) : (
                    <div
                      className="max-h-[470px] divide-y overflow-y-auto"
                      style={{ borderColor: P.border }}
                    >
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center gap-3 px-4 py-3">
                          <div
                            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                            style={{ color: P.darkOlive, background: P.lightSage }}
                          >
                            {initialsFor(member.fullName)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold" style={{ color: P.text }}>
                              {member.fullName}
                            </p>
                            <div
                              className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px]"
                              style={{ color: P.textMuted }}
                            >
                              <span>{member.id}</span>
                              {member.departmentId !== null && (
                                <span>
                                  · {optionLabel(options, "departmentId", member.departmentId)}
                                </span>
                              )}
                              {member.jobTitleId !== null && (
                                <span>
                                  · {optionLabel(options, "jobTitleId", member.jobTitleId)}
                                </span>
                              )}
                            </div>
                          </div>
                          {member.startDate && (
                            <div
                              className="hidden items-center gap-1 text-[10px] sm:flex"
                              style={{ color: P.textMuted }}
                            >
                              <CalendarClock size={12} /> {formatDate(member.startDate)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>

      {groupDraft && (
        <GroupDialog
          draft={groupDraft}
          setDraft={setGroupDraft}
          saving={saving}
          error={dialogError}
          onClose={closeDialogs}
          onSubmit={(event) => void submitGroup(event)}
        />
      )}
      {ruleDraft && (
        <RuleDialog
          draft={ruleDraft}
          setDraft={setRuleDraft}
          options={options}
          optionsError={optionsError}
          saving={saving}
          error={dialogError}
          onClose={closeDialogs}
          onSubmit={(event) => void submitRule(event)}
        />
      )}
      {confirmState && (
        <ConfirmDialog
          state={confirmState}
          busy={saving}
          error={dialogError}
          onClose={closeDialogs}
        />
      )}
    </div>
  );
}

export default ConfigAudience;
