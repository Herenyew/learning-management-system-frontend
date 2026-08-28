import React, { useCallback, useEffect, useState } from "react";
import { Loader2, AlertCircle, BarChart2 } from "lucide-react";
import {
  CrudModal,
  CrudShell,
  Field,
  Inp,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
} from "../adminRecords/adminRecords.shared";
import type { CrudRow } from "../adminRecords/adminRecords.shared";
import { trainingEffectivenessApi, type EffectivenessWeightConfigDto } from "../../API/training-effectiveness.api";
import { usePermission } from "../../hooks/usePermission";

// Prisma Decimal columns may serialize as strings over JSON ("30.00"), which
// previously concatenated into totals like "030104020" on the frontend.
// Force numbers everywhere weights are read.
const toNum = (v: unknown): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export type EffRow = CrudRow & {
  reaction: number;
  learning: number;
  behavior: number;
  results: number;
  total: number;
  effectiveFrom: string;
};

export function dtoToRow(dto: EffectivenessWeightConfigDto): EffRow {
  const r = toNum(dto.reactionWeight);
  const l = toNum(dto.learningWeight);
  const b = toNum(dto.behaviorWeight);
  const k = toNum(dto.resultsWeight);
  return {
    id: String(dto.id),
    name: `#${dto.id}`,
    status: dto.isActive ? "Active" : "Disabled",
    reaction: r,
    learning: l,
    behavior: b,
    results: k,
    total: r + l + b + k,
    effectiveFrom: dto.effectiveFrom ?? "",
  };
}

function EffForm({
  row,
  onSave,
  onClose,
}: { row: EffRow | null; onSave: (r: EffRow) => void; onClose: () => void; }) {
  const [form, setForm] = useState<EffRow>(() =>
    row
      ? { ...row }
      : { id: `new-${Date.now()}`, name: "", status: "Active", reaction: 10, learning: 30, behavior: 40, results: 20, total: 100, effectiveFrom: "" }
  );
  const [error, setError] = useState("");

  const n = (k: "reaction" | "learning" | "behavior" | "results") => toNum(form[k]);
  const total = n("reaction") + n("learning") + n("behavior") + n("results");

  const handleSave = () => {
    const r = n("reaction"), l = n("learning"), b = n("behavior"), k = n("results");
    if (r + l + b + k !== 100) { setError(`Weights must sum to 100. Current total: ${r + l + b + k}.`); return; }
    onSave({ ...form, total });
  };

  return (
    <CrudModal title={row ? "Edit Configuration" : "New Configuration"} onClose={onClose}>
      <div className="space-y-4">
        {error && (<div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700"><AlertCircle size={14} />{error}</div>)}
        <p className="text-[11px]" style={{ color: P.textMuted }}>Set percentage weights for each Kirkpatrick level. They must sum to exactly 100%.</p>
        <Field label="Reaction (Level 1)"><Inp type="number" value={String(n("reaction"))} onChange={(v) => setForm((f) => ({ ...f, reaction: Number(v) }))} /></Field>
        <Field label="Learning (Level 2)"><Inp type="number" value={String(n("learning"))} onChange={(v) => setForm((f) => ({ ...f, learning: Number(v) }))} /></Field>
        <Field label="Behavior (Level 3)"><Inp type="number" value={String(n("behavior"))} onChange={(v) => setForm((f) => ({ ...f, behavior: Number(v) }))} /></Field>
        <Field label="Results (Level 4)"><Inp type="number" value={String(n("results"))} onChange={(v) => setForm((f) => ({ ...f, results: Number(v) }))} /></Field>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: total === 100 ? P.olive : "#B91C1C" }}>Total: {total}%</span>
          {total !== 100 && <span className="text-xs" style={{ color: "#B91C1C" }}>— must equal 100%</span>}
        </div>
        <Field label="Status"><Sel value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v as "Active" | "Disabled" }))} options={["Active", "Disabled"]} /></Field>
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}

export function ConfigTrainingEffectiveness() {
  const can = usePermission();
  const [rows, setRows] = useState<EffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try {
      const list = await trainingEffectivenessApi.list({ page: 1, limit: 50 }, signal);
      if (!signal?.aborted) setRows(list.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? 'Failed to load training effectiveness configurations.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);

  const persistSave = async (row: EffRow): Promise<EffRow> => {
    const input = { reactionWeight: row.reaction, learningWeight: row.learning, behaviorWeight: row.behavior, resultsWeight: row.results, isActive: row.status === 'Active' };
    const isNew = row.id.startsWith('new-');
    const dto = isNew ? await trainingEffectivenessApi.create(input) : await trainingEffectivenessApi.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => { await trainingEffectivenessApi.remove(Number(id)); };
  const persistToggle = async (id: string, nextStatus: string) => {
    if (nextStatus === 'Active') await trainingEffectivenessApi.update(Number(id), { isActive: true });
    else await trainingEffectivenessApi.deactivate(Number(id));
  };

  if (!can('effectiveness_weight.view'))
    return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view training effectiveness settings.</div>;
  if (loading)
    return <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}><Loader2 size={15} className="animate-spin" /> Loading configurations…</div>;
  if (error)
    return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2"><AlertCircle size={14} />{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>;

  return (
    <CrudShell<EffRow>
      title="Training Effectiveness"
      sub="Configure Kirkpatrick-level score weights for learning effectiveness calculations"
      icon={BarChart2}
      columns={[
        { key: 'name', label: 'Config', sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
        { key: 'total', label: 'Weights (R/L/B/K)', render: (r) => <p className="text-[10px] font-mono" style={{ color: P.textMid }}>{r.reaction}%/{r.learning}%/{r.behavior}%/{r.results}%</p> },
        { key: 'effectiveFrom', label: 'Effective From', render: (r) => <p className="text-xs" style={{ color: P.textMuted }}>{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—'}</p> },
        { key: 'status', label: 'Status', sortable: true, render: (r) => <StatusBadge status={r.status} /> },
      ]}
      rows={rows}
      onRows={setRows}
      persistSave={persistSave}
      persistDelete={persistDelete}
      persistToggle={persistToggle}
      filterOptions={{ label: 'Status', values: ['Active', 'Disabled'] }}
      createLabel={can('effectiveness_weight.create') ? 'New Configuration' : undefined as any}
      showArchive={false}
      showDelete={can('effectiveness_weight.delete')}
      toggleStatus={{ enabled: 'Active', disabled: 'Disabled', enableLabel: 'Activate', disableLabel: 'Deactivate' }}
      renderForm={(row, onSave, onClose) => <EffForm row={row} onSave={onSave} onClose={onClose} />}
    />
  );
}
