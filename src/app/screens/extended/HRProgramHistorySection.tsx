import { useCallback, useEffect, useMemo, useState } from "react";
import { History } from "lucide-react";
import { programApi } from "../../API/program.api";
import type { ProgramAuditHistory } from "../../models/program.model";
import { P } from "./extended.shared";
import { HRProgramSectionShell, mutationMessage } from "./HRProgramSectionShell";

type TimelineItem = { id: string; at: string; title: string; actor: string; detail?: string };
const formatAction = (value: string) => value.replace(/^PROGRAM_/, "").replace(/_/g, " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());

export function HRProgramHistorySection({ programId, refreshToken }: { programId: number; refreshToken: number }) {
  const [history, setHistory] = useState<ProgramAuditHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => { setLoading(true); setError(""); try { const data = await programApi.getAuditHistory(programId, signal); if (!signal?.aborted) setHistory(data); } catch (reason: unknown) { if (!signal?.aborted) setError(mutationMessage(reason, "Unable to load program history.")); } finally { if (!signal?.aborted) setLoading(false); } }, [programId]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load, refreshToken]);

  const timeline = useMemo(() => {
    if (!history) return [];
    const audit: TimelineItem[] = history.auditLogs.map((item) => ({ id: `audit-${item.id}`, at: item.createdAt, title: formatAction(item.action), actor: item.actorUser?.employee?.fullName ?? item.actorUser?.email ?? "System" }));
    const approvals: TimelineItem[] = history.approvalInstances.flatMap((instance) => [
      { id: `approval-${instance.id}`, at: instance.submittedAt ?? instance.createdAt, title: `Approval cycle ${instance.status.replace(/_/g, " ").toLowerCase()}`, actor: instance.submittedByUser?.email ?? "System", detail: instance.latestComment ?? undefined },
      ...instance.decisions.map((decision) => ({ id: `decision-${decision.id}`, at: decision.decidedAt, title: `Step ${decision.workflowStep?.approvalOrder ?? "?"} ${decision.status.replace(/_/g, " ").toLowerCase()}`, actor: decision.decidedByUser?.email ?? "System", detail: decision.comment ?? undefined })),
    ]);
    return [...audit, ...approvals].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  }, [history]);

  return <HRProgramSectionShell title="Audit and approval history" description="Program lifecycle audit records and all approval cycles, newest first." icon={History} loading={loading} error={error} onRetry={() => void load()}>
    {timeline.length ? <div className="space-y-0">{timeline.map((item, index) => <div key={item.id} className="relative flex gap-3 pb-4 last:pb-0"><div className="relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: P.olive }} />{index < timeline.length - 1 && <div className="absolute left-[4px] top-3 h-full w-px" style={{ background: P.border }} />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-baseline justify-between gap-2"><p className="text-xs font-semibold" style={{ color: P.text }}>{item.title}</p><time className="text-[10px]" style={{ color: P.textMuted }}>{new Date(item.at).toLocaleString()}</time></div><p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>{item.actor}</p>{item.detail && <p className="mt-1 rounded-lg px-2 py-1.5 text-[11px]" style={{ background: P.bg, color: P.textMid }}>{item.detail}</p>}</div></div>)}</div> : <p className="text-xs" style={{ color: P.textMuted }}>No history is available.</p>}
  </HRProgramSectionShell>;
}
