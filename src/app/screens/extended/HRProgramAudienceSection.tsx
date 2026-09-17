import { useCallback, useEffect, useState } from "react";
import { Save, Users } from "lucide-react";
import { audienceApi, type AudienceGroup } from "../../API/audience.api";
import { programApi } from "../../API/program.api";
import type { ProgramTargetAudience } from "../../models/program.model";
import { P } from "./extended.shared";
import { HRProgramSectionShell, SectionMutationError, mutationMessage, programButtonClass } from "./HRProgramSectionShell";

export function HRProgramAudienceSection({
  programId,
  canWrite,
  onChanged,
}: {
  programId: number;
  canWrite: boolean;
  onChanged: () => void;
}) {
  const [groups, setGroups] = useState<AudienceGroup[]>([]);
  const [assigned, setAssigned] = useState<ProgramTargetAudience[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [mutationError, setMutationError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const [nextGroups, nextAssigned] = await Promise.all([
        audienceApi.groups.list({ page: 1, pageSize: 100 }, signal),
        programApi.targetAudiences.list(programId, signal),
      ]);
      if (!signal?.aborted) {
        setGroups(nextGroups);
        setAssigned(nextAssigned);
        setSelectedIds(nextAssigned.map((item) => item.audienceGroupId));
      }
    } catch (reason: unknown) {
      if (!signal?.aborted) setError(mutationMessage(reason, "Unable to load target audiences."));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const dirty = selectedIds.length !== assigned.length || selectedIds.some((id) => !assigned.some((item) => item.audienceGroupId === id));

  const save = async () => {
    setSaving(true);
    setMutationError("");
    try {
      const next = await programApi.targetAudiences.replace(programId, { audienceGroupIds: selectedIds });
      setAssigned(next);
      setSelectedIds(next.map((item) => item.audienceGroupId));
      onChanged();
    } catch (reason: unknown) {
      setMutationError(mutationMessage(reason, "Unable to save target audiences."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <HRProgramSectionShell title="Target audiences" description="Select one or more active reusable audience groups. At least one is required for approval readiness." icon={Users} loading={loading} error={error} onRetry={() => void load()} actions={canWrite ? <button type="button" onClick={() => void save()} disabled={!dirty || saving} className={`${programButtonClass} text-white`} style={{ background: P.olive }}><Save size={13} /> {saving ? "Saving…" : "Save"}</button> : undefined}>
      <div className="space-y-3">
        <SectionMutationError message={mutationError} />
        {groups.length ? <div className="grid gap-2 sm:grid-cols-2">{groups.map((group) => {
          const checked = selectedIds.includes(group.id);
          const disabled = !canWrite || saving || (!group.isActive && !checked);
          return <label key={group.id} className="flex cursor-pointer items-start gap-2 rounded-xl border p-3" style={{ borderColor: checked ? P.olive : P.border, background: checked ? P.paleGreen : "white", opacity: disabled ? 0.65 : 1 }}><input type="checkbox" checked={checked} disabled={disabled} onChange={(event) => setSelectedIds((ids) => event.target.checked ? [...ids, group.id] : ids.filter((id) => id !== group.id))} style={{ accentColor: P.olive }} /><span><span className="block text-xs font-semibold" style={{ color: P.text }}>{group.name}{!group.isActive ? " · inactive" : ""}</span>{group.description && <span className="mt-0.5 block text-[10px] leading-4" style={{ color: P.textMuted }}>{group.description}</span>}</span></label>;
        })}</div> : <p className="rounded-xl border p-4 text-xs" style={{ borderColor: P.border, color: P.textMuted }}>No audience groups are available. Create one in Configuration Center.</p>}
      </div>
    </HRProgramSectionShell>
  );
}
