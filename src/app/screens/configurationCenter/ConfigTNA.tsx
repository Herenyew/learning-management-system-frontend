import React, { useEffect, useState, useCallback } from "react";
import { Plus, X, Loader2, AlertCircle } from "lucide-react";
import { CfgField, CfgSection, P, SaveBar } from "./configuration.shared";
import { tnaConfigApi, type TnaRequestTypeDto, type FundingTypeDto, type TrainingFormatDto } from "../../API/tna-config.api";
import { usePermission } from "../../hooks/usePermission";

type SimpleItem = { id: number; name: string; description: string | null; isSystem?: boolean; isActive: boolean };

function SimpleListSection<T extends SimpleItem>({
  title, description, items, loading, error, onRetry, onAdd, onDelete, canEdit, addPlaceholder,
}: {
  title: string; description: string; items: T[]; loading: boolean; error: string;
  onRetry: () => void; onAdd: (name: string) => Promise<void>; onDelete: (id: number) => Promise<void>;
  canEdit: boolean; addPlaceholder: string;
}) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try { await onAdd(newName.trim()); setNewName(""); } finally { setAdding(false); }
  };

  return (
    <CfgSection title={title}>
      <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>{description}</p>
      {loading && <div className="flex items-center gap-2 py-3 text-xs" style={{ color: P.textMuted }}><Loader2 size={13} className="animate-spin" /> Loading…</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2 mb-2"><AlertCircle size={13} />{error}<button onClick={onRetry} className="ml-auto underline">Retry</button></div>}
      {!loading && (
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: item.isSystem ? P.goldLight : P.lightSage, color: item.isSystem ? "#8A6A1A" : P.darkOlive }}>
              {item.name}
              {item.isSystem && <span className="text-[9px] opacity-70 ml-0.5">(system)</span>}
              {!item.isSystem && canEdit && (
                <button onClick={async () => { setDeletingId(item.id); try { await onDelete(item.id); } finally { setDeletingId(null); } }} disabled={deletingId === item.id}>
                  {deletingId === item.id ? <Loader2 size={10} className="animate-spin" /> : <X size={10} className="ml-0.5" />}
                </button>
              )}
            </div>
          ))}
          {items.length === 0 && !loading && <p className="text-xs" style={{ color: P.textMuted }}>No items yet.</p>}
        </div>
      )}
      {canEdit && (
        <div className="flex gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={addPlaceholder}
            onKeyDown={e => { if (e.key === "Enter" && newName.trim()) void handleAdd(); }}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }} />
          <button onClick={() => void handleAdd()} disabled={!newName.trim() || adding}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: P.olive }}>
            {adding ? <Loader2 size={14} className="animate-spin" /> : "Add"}
          </button>
        </div>
      )}
    </CfgSection>
  );
}

export function ConfigTNA() {
  const can = usePermission();
  const [requestTypes, setRequestTypes] = useState<TnaRequestTypeDto[]>([]);
  const [fundingTypes, setFundingTypes] = useState<FundingTypeDto[]>([]);
  const [trainingFormats, setTrainingFormats] = useState<TrainingFormatDto[]>([]);
  const [loadingRT, setLoadingRT] = useState(true);
  const [loadingFT, setLoadingFT] = useState(true);
  const [loadingTF, setLoadingTF] = useState(true);
  const [errorRT, setErrorRT] = useState("");
  const [errorFT, setErrorFT] = useState("");
  const [errorTF, setErrorTF] = useState("");

  const loadRT = useCallback(async (signal?: AbortSignal) => {
    setLoadingRT(true); setErrorRT("");
    try { const d = await tnaConfigApi.requestTypes.list({}, signal); if (!signal?.aborted) setRequestTypes(d); }
    catch (e: any) { if (!signal?.aborted) setErrorRT(e?.message ?? "Failed to load."); }
    finally { if (!signal?.aborted) setLoadingRT(false); }
  }, []);

  const loadFT = useCallback(async (signal?: AbortSignal) => {
    setLoadingFT(true); setErrorFT("");
    try { const d = await tnaConfigApi.fundingTypes.list({}, signal); if (!signal?.aborted) setFundingTypes(d); }
    catch (e: any) { if (!signal?.aborted) setErrorFT(e?.message ?? "Failed to load."); }
    finally { if (!signal?.aborted) setLoadingFT(false); }
  }, []);

  const loadTF = useCallback(async (signal?: AbortSignal) => {
    setLoadingTF(true); setErrorTF("");
    try { const d = await tnaConfigApi.trainingFormats.list({}, signal); if (!signal?.aborted) setTrainingFormats(d); }
    catch (e: any) { if (!signal?.aborted) setErrorTF(e?.message ?? "Failed to load."); }
    finally { if (!signal?.aborted) setLoadingTF(false); }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void loadRT(c.signal); void loadFT(c.signal); void loadTF(c.signal);
    return () => c.abort();
  }, [loadRT, loadFT, loadTF]);

  if (!can("tna_request_type.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view TNA configuration.</div>;

  const canEdit = can("tna_request_type.create");

  return (
    <div className="space-y-5">
      <SimpleListSection
        title="TNA Request Types" description="Categories of TNA requests (e.g. Technical Upskilling, Soft Skills, Compliance)."
        items={requestTypes} loading={loadingRT} error={errorRT} onRetry={() => void loadRT()} canEdit={canEdit}
        addPlaceholder="Add request type…"
        onAdd={async name => { const d = await tnaConfigApi.requestTypes.create({ name }); setRequestTypes(prev => [...prev, d]); }}
        onDelete={async id => { await tnaConfigApi.requestTypes.delete(id); setRequestTypes(prev => prev.filter(x => x.id !== id)); }}
      />

      <SimpleListSection
        title="Funding Types" description="How training is funded (e.g. Company-Sponsored, Employee-Funded, Grant-Based)."
        items={fundingTypes} loading={loadingFT} error={errorFT} onRetry={() => void loadFT()} canEdit={canEdit}
        addPlaceholder="Add funding type…"
        onAdd={async name => { const d = await tnaConfigApi.fundingTypes.create({ name }); setFundingTypes(prev => [...prev, d]); }}
        onDelete={async id => { await tnaConfigApi.fundingTypes.delete(id); setFundingTypes(prev => prev.filter(x => x.id !== id)); }}
      />

      <SimpleListSection
        title="Training Formats" description="Delivery formats available for training requests (e.g. Online, In-Person, Blended, Self-Paced)."
        items={trainingFormats} loading={loadingTF} error={errorTF} onRetry={() => void loadTF()} canEdit={canEdit}
        addPlaceholder="Add training format…"
        onAdd={async name => { const d = await tnaConfigApi.trainingFormats.create({ name }); setTrainingFormats(prev => [...prev, d]); }}
        onDelete={async id => { await tnaConfigApi.trainingFormats.delete(id); setTrainingFormats(prev => prev.filter(x => x.id !== id)); }}
      />

      {/* Prototype-only sections below — no backend for these settings yet */}
      <CfgSection title="Approval Chains">
        <p className="text-[11px]" style={{ color: P.textMuted }}>Configure TNA approval workflows in the <strong>Approval Workflows</strong> section of the Configuration Center.</p>
      </CfgSection>
      <CfgSection title="Budget Fields">
        <CfgField label="Default Currency" options={["USD", "ETB", "EUR", "GBP"]} />
        <CfgField label="Budget Year Start Month" options={["January", "April", "July", "October"]} />
        <CfgField label="Budget Alert Threshold (%)" value="80" type="number" />
      </CfgSection>
    </div>
  );
}
