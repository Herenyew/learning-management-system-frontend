import React, { useEffect, useState, useCallback } from "react";
import { Plus, X, Edit, Loader2, AlertCircle, Check } from "lucide-react";
import { CfgField, CfgSection, CfgToggle, P, SaveBar } from "./configuration.shared";
import { enrollmentApi, type EnrollmentRuleTypeDto } from "../../API/enrollment.api";
import { usePermission } from "../../hooks/usePermission";

export function ConfigEnrollment() {
  const can = usePermission();
  const [ruleTypes, setRuleTypes] = useState<EnrollmentRuleTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const d = await enrollmentApi.ruleTypes.list({}, signal);
      if (!signal?.aborted) setRuleTypes(d);
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const d = await enrollmentApi.ruleTypes.create({
        name: newName.trim(),
        description: newDesc.trim() || undefined,
      });
      setRuleTypes((prev) => [...prev, d]);
      setNewName("");
      setNewDesc("");
    } catch (e: any) {
      setError(e?.message ?? "Failed to add.");
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return;
    try {
      const d = await enrollmentApi.ruleTypes.update(id, { name: editName.trim() });
      setRuleTypes((prev) => prev.map((x) => (x.id === id ? d : x)));
      setEditingId(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to update.");
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await enrollmentApi.ruleTypes.delete(id);
      setRuleTypes((prev) => prev.filter((x) => x.id !== id));
    } catch (e: any) {
      setError(e?.message ?? "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!can("enrollment_rule_type.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view enrollment configuration.
      </div>
    );

  return (
    <div className="space-y-5">
      {/* ── Live: Enrollment Rule Types ─────────────────────── */}
      <CfgSection title="Enrollment Rule Types">
        <p className="text-[11px] mb-3" style={{ color: P.textMuted }}>
          Define the types of rules used to govern enrollment — auto-enroll, waitlists,
          prerequisites, capacity limits.
        </p>
        {loading && (
          <div className="flex items-center gap-2 py-3 text-xs" style={{ color: P.textMuted }}>
            <Loader2 size={13} className="animate-spin" /> Loading…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex items-center gap-2 mb-2">
            <AlertCircle size={13} />
            {error}
            <button onClick={() => void load()} className="ml-auto underline">
              Retry
            </button>
          </div>
        )}
        {!loading && (
          <div className="space-y-1.5 mb-3">
            {ruleTypes.map((rt) => (
              <div
                key={rt.id}
                className="flex items-center gap-2 p-3 rounded-xl border"
                style={{ borderColor: P.border, background: "white" }}
              >
                {editingId === rt.id ? (
                  <>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 text-xs rounded-lg bg-white"
                      style={{ border: `1px solid ${P.border}`, color: P.text }}
                    />
                    <button
                      onClick={() => void handleEdit(rt.id)}
                      className="p-1.5 rounded-lg"
                      style={{ color: P.olive }}
                    >
                      <Check size={13} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg"
                      style={{ color: P.textMuted }}
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold" style={{ color: P.text }}>
                        {rt.name}
                      </p>
                      {rt.description && (
                        <p className="text-[10px]" style={{ color: P.textMuted }}>
                          {rt.description}
                        </p>
                      )}
                    </div>
                    {rt.isSystem && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                        style={{ background: P.goldLight, color: "#8A6A1A" }}
                      >
                        system
                      </span>
                    )}
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                      style={{
                        background: rt.isActive ? "#D8EDCC" : "#FEE2E2",
                        color: rt.isActive ? "#3A6420" : "#B91C1C",
                      }}
                    >
                      {rt.isActive ? "Active" : "Inactive"}
                    </span>
                    {!rt.isSystem && can("enrollment_rule_type.update") && (
                      <button
                        onClick={() => {
                          setEditingId(rt.id);
                          setEditName(rt.name);
                        }}
                        className="p-1.5 rounded-lg hover:bg-emerald-50"
                        style={{ color: P.olive }}
                      >
                        <Edit size={12} />
                      </button>
                    )}
                    {!rt.isSystem && can("enrollment_rule_type.delete") && (
                      <button
                        onClick={() => void handleDelete(rt.id)}
                        disabled={deletingId === rt.id}
                        className="p-1.5 rounded-lg hover:bg-red-50"
                        style={{ color: "#C0392B" }}
                      >
                        {deletingId === rt.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
            {ruleTypes.length === 0 && !error && (
              <p className="text-xs py-2 text-center" style={{ color: P.textMuted }}>
                No rule types yet.
              </p>
            )}
          </div>
        )}
        {can("enrollment_rule_type.create") && (
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Rule type name…"
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) void handleAdd();
              }}
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            />
            <button
              onClick={() => void handleAdd()}
              disabled={!newName.trim() || adding}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: P.olive }}
            >
              {adding ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Add
            </button>
          </div>
        )}
      </CfgSection>

      {/* ── Prototype sections below ─────────────────────────── */}
      <CfgSection title="Open Enrollment">
        <CfgToggle
          label="Require manager approval for self-enrollment"
          desc="Self-enrollment triggers a manager approval request before access is granted"
        />
        <CfgField label="Self-enrollment approval timeout (days)" value="5" type="number" />
        <CfgField label="Unenroll lock window (days before deadline)" value="3" type="number" />
      </CfgSection>
      <CfgSection title="Invitation Enrollment">
        <CfgField
          label="Who can send enrollment invitations"
          options={["HR Admin only", "HR + Managers", "HR + Managers + Creators", "Any admin role"]}
        />
        <CfgField label="Invitation expiry (days)" value="14" type="number" />
      </CfgSection>
      <CfgSection title="Capacity Limits">
        <CfgField label="Default course capacity (learners)" value="200" type="number" />
        <CfgField label="Default program capacity (learners)" value="500" type="number" />
      </CfgSection>
      <CfgSection title="Waitlists">
        <CfgField label="Maximum waitlist size" value="50" type="number" />
        <CfgField label="Auto-enroll response window (hours)" value="48" type="number" />
      </CfgSection>
      <SaveBar />
    </div>
  );
}
