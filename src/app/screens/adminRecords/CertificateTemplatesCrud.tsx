import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  Award,
  CrudModal,
  CrudShell,
  Field,
  Inp,
  InlineFormState,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  certificateConfigApi,
  type CertificateTemplateDto,
  type CertificateTemplateStatus,
} from "../../API/certificate-config.api";
import { usePermission } from "../../hooks/usePermission";

const STATUSES: CertificateTemplateStatus[] = ["DRAFT", "IN_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED", "RETIRED"];

type CertificateTemplateRow = CrudRow & {
  certificateTypeId: number | "";
  certificateIdPattern: string;
  validityMonths: number;
  qrVerificationEnabled: boolean;
};

function dtoToRow(dto: CertificateTemplateDto): CertificateTemplateRow {
  return {
    id: String(dto.id),
    name: dto.name,
    certificateTypeId: dto.certificateTypeId,
    certificateIdPattern: dto.certificateIdPattern ?? "",
    validityMonths: Number(dto.validityMonths ?? 0),
    qrVerificationEnabled: Boolean(dto.qrVerificationEnabled),
    status: dto.status ?? "DRAFT",
  };
}

export function CertificateTemplatesCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<CertificateTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certTypes, setCertTypes] = useState<{ id: number; name: string }[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await certificateConfigApi.templates.list({ page: 1, limit: 100 }, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load certificate templates.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  useEffect(() => {
    const c = new AbortController();
    certificateConfigApi.types
      .list({}, c.signal)
      .then((types) => { if (!c.signal.aborted) setCertTypes(types.map((t: { id: number; name: string }) => ({ id: t.id, name: t.name }))); })
      .catch(() => {});
    return () => c.abort();
  }, []);

  const typeName = useMemo(() => Object.fromEntries(certTypes.map((t) => [t.id, t.name])), [certTypes]);

  const persistSave = async (row: CertificateTemplateRow): Promise<CertificateTemplateRow> => {
    if (!row.name || row.name.trim().length === 0) throw new Error("Template name is required.");
    if (!row.certificateTypeId) throw new Error("Please select a certificate type.");
    if (!row.certificateIdPattern.trim()) throw new Error("Certificate ID pattern is required (e.g. CERT-{year}-{seq}).");
    const input = {
      name: row.name.trim(),
      certificateTypeId: Number(row.certificateTypeId),
      certificateIdPattern: row.certificateIdPattern.trim(),
      validityMonths: Number(row.validityMonths) || undefined,
      qrVerificationEnabled: row.qrVerificationEnabled,
      status: row.status as CertificateTemplateStatus,
    };
    const isNew = row.id.startsWith("new-");
    const dto = isNew
      ? await certificateConfigApi.templates.create(input)
      : await certificateConfigApi.templates.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => {
    await certificateConfigApi.templates.delete(Number(id));
  };

  if (!can("certificate_template.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view certificate templates.
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}>
        <Loader2 size={15} className="animate-spin" /> Loading certificate templates…
      </div>
    );

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => void load()} className="ml-auto underline">Retry</button>
        </div>
      )}
      {!error && (
        <CrudShell<CertificateTemplateRow>
          title="Certificate Templates"
          sub="Certificate designs, ID patterns, validity, and publication status"
          icon={Award}
          columns={[
            { key: "name", label: "Template Name", sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
            { key: "certificateTypeId", label: "Type", render: (r) => r.certificateTypeId ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{typeName[Number(r.certificateTypeId)] ?? `#${r.certificateTypeId}`}</span> : "—" },
            { key: "certificateIdPattern", label: "ID Pattern", render: (r) => <p className="text-xs font-mono truncate max-w-[160px]" style={{ color: P.textMid }}>{r.certificateIdPattern || "—"}</p> },
            { key: "validityMonths", label: "Validity", render: (r) => <p className="text-xs font-mono" style={{ color: P.textMuted }}>{r.validityMonths ? `${r.validityMonths} mo` : "Lifetime"}</p> },
            { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
          onRows={setRows}
          persistSave={persistSave}
          persistDelete={persistDelete}
          filterOptions={{ label: "Status", values: [...STATUSES] }}
          createLabel="New Template"
          showArchive={false}
          cloneRow={(r) => ({ ...r, id: `new-${Date.now()}`, name: `${r.name} (Copy)`, status: "DRAFT" })}
          renderForm={(row, onSave, onClose) => {
            const blank: CertificateTemplateRow = {
              id: `new-${Date.now()}`,
              name: "",
              certificateTypeId: certTypes[0]?.id ?? "",
              certificateIdPattern: "CERT-{year}-{seq}",
              validityMonths: 12,
              qrVerificationEnabled: true,
              status: "DRAFT",
            };
            // Form state must live in InlineFormState (a real component) —
            // an inline useState here changes CrudShell's hook order when the
            // dialog opens/closes and crashes React.
            return (
              <InlineFormState initial={row ?? blank}>
                {(form, setForm) => (
                  <CrudModal title={row ? "Edit Certificate Template" : "New Certificate Template"} onClose={onClose}>
                    <div className="space-y-4">
                      <Field label="Template Name" required>
                        <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Course Completion Certificate" />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Certificate Type" required>
                          <Sel value={String(form.certificateTypeId)} onChange={(v) => setForm({ ...form, certificateTypeId: v ? Number(v) : "" })} options={certTypes.map((t) => ({ value: String(t.id), label: t.name }))} />
                        </Field>
                        <Field label="ID Pattern" required>
                          <Inp value={form.certificateIdPattern} onChange={(v) => setForm({ ...form, certificateIdPattern: v })} placeholder="CERT-{year}-{seq}" />
                        </Field>
                        <Field label="Validity (months, 0 = lifetime)">
                          <Inp type="number" value={String(form.validityMonths)} onChange={(v) => setForm({ ...form, validityMonths: Number(v) })} />
                        </Field>
                        <Field label="QR Verification">
                          <Sel value={form.qrVerificationEnabled ? "Enabled" : "Disabled"} onChange={(v) => setForm({ ...form, qrVerificationEnabled: v === "Enabled" })} options={["Enabled", "Disabled"]} />
                        </Field>
                        <Field label="Publication Status">
                          <Sel value={form.status} onChange={(v) => setForm({ ...form, status: v })} options={[...STATUSES]} />
                        </Field>
                      </div>
                      <SaveBtn onSave={() => onSave(form)} onClose={onClose} />
                    </div>
                  </CrudModal>
                )}
              </InlineFormState>
            );
          }}
        />
      )}
    </div>
  );
}
