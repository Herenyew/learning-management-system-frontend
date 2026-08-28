import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { CrudModal, CrudShell, Field, Inp, P, SaveBtn, Sel, StatusBadge, UserCheck } from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import { enrollmentApi, type EnrollmentRuleTypeDto } from "../../API/enrollment.api";
import { usePermission } from "../../hooks/usePermission";

type EnrollRule = CrudRow & { ruleType: string; condition: string; action: string; scope: string };

function dtoToRow(dto: EnrollmentRuleTypeDto): EnrollRule {
  return {
    id: String(dto.id),
    name: dto.name,
    ruleType: dto.name,
    condition: dto.description ?? "",
    action: dto.slug,
    scope: dto.isSystem ? "System" : "Custom",
    status: dto.isActive ? "Enabled" : "Disabled",
  };
}

export function EnrollmentRulesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<EnrollRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const data = await enrollmentApi.ruleTypes.list({}, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load enrollment rule types.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => { const c = new AbortController(); void load(c.signal); return () => c.abort(); }, [load]);

  if (!can("enrollment_rule_type.view")) return <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>You don't have permission to view enrollment rules.</div>;
  if (loading) return <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}><Loader2 size={15} className="animate-spin" /> Loading enrollment rule types…</div>;
  if (error) return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2"><AlertCircle size={14} />{error}<button onClick={() => void load()} className="ml-auto underline">Retry</button></div>;

  // A rule type can only be updated/deleted on the server when its id is a real
  // numeric id. Rows that have never been persisted (e.g. a clone that was opened
  // for editing before being saved) carry a `new-<timestamp>` id; Number() on that
  // yields NaN and the backend rejects the request with "Invalid URL parameters".
  const numericId = (id: string): number => {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) {
      throw new Error("This rule type has not been saved yet. Save it first, then try again.");
    }
    return n;
  };

  const persistSave = async (row: EnrollRule): Promise<EnrollRule> => {
    const isNew = row.id.startsWith("new-");
    const input = { name: row.name, description: row.condition, isActive: row.status === "Enabled" };
    const dto = isNew ? await enrollmentApi.ruleTypes.create(input) : await enrollmentApi.ruleTypes.update(numericId(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => { await enrollmentApi.ruleTypes.delete(numericId(id)); };

  return (
    <CrudShell<EnrollRule>
      title="Enrollment Rule Types" sub="Define rule types used to classify enrollment rules — auto-enroll, prerequisites, capacity limits"
      icon={UserCheck}
      columns={[
        { key: "name", label: "Rule Type Name", sortable: true, render: r => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
        { key: "condition", label: "Description", render: r => <p className="text-xs" style={{ color: P.textMuted }}>{r.condition}</p> },
        { key: "scope", label: "Scope", render: r => <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: r.scope === "System" ? P.goldLight : P.lightSage, color: r.scope === "System" ? "#8A6A1A" : P.darkOlive }}>{r.scope}</span> },
        { key: "status", label: "Status", sortable: true, render: r => <StatusBadge status={r.status} /> },
      ]}
      rows={rows} onRows={setRows} persistSave={persistSave} persistDelete={persistDelete}
      filterOptions={{ label: "Status", values: ["Enabled", "Disabled"] }}
      createLabel="New Rule Type" showArchive={false}
      toggleStatus={{ enabled: "Enabled", disabled: "Disabled", enableLabel: "Enable", disableLabel: "Disable" }}
      persistToggle={(id, nextStatus) => enrollmentApi.ruleTypes.update(numericId(id), { isActive: nextStatus === "Enabled" }).then(() => undefined)}
      cloneRow={r => ({ ...r, id: `new-${Date.now()}`, name: `${r.name} (Copy)`, status: "Disabled", scope: "Custom" })}
      renderForm={(row, onSave, onClose) => (
        <EnrollRuleForm row={row} onSave={onSave} onClose={onClose} />
      )}
    />
  );
}

// Own component so useState is a stable top-level hook (calling useState
// inside the renderForm callback changed the hook order of CrudShell and
// crashed React when the dialog opened).
function EnrollRuleForm({ row, onSave, onClose }: { row: EnrollRule | null; onSave: (r: EnrollRule) => void; onClose: () => void }) {
  const [form, setForm] = useState<EnrollRule>(row ?? { id: `new-${Date.now()}`, name: "", ruleType: "", condition: "", action: "", scope: "Custom", status: "Enabled" });
  const [formError, setFormError] = useState("");
  const handleSave = () => {
    if (form.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    setFormError("");
    onSave(form);
  };
  return (
    <CrudModal title={row ? "Edit Rule Type" : "New Rule Type"} onClose={onClose}>
      <div className="space-y-4">
        <Field label="Name" required><Inp value={form.name} onChange={v => setForm({ ...form, name: v, ruleType: v, })} placeholder="e.g. Auto Enrollment" /></Field>
        <Field label="Description"><Inp value={form.condition} onChange={v => setForm({ ...form, condition: v })} placeholder="Describe when this rule type applies" /></Field>
        <Field label="Status"><Sel value={form.status} onChange={v => setForm({ ...form, status: v })} options={["Enabled", "Disabled"]} /></Field>
        {formError && <p className="text-[11px] text-red-600" style={{ color: "#C0392B" }}>{formError}</p>}
        <SaveBtn onSave={handleSave} onClose={onClose} />
      </div>
    </CrudModal>
  );
}
