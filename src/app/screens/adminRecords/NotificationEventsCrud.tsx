import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, AlertCircle, Bell } from "lucide-react";
import {
  CrudModal,
  CrudShell,
  Field,
  Inp,
  InlineFormState,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Textarea,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  notificationConfigApi,
  type NotificationEventDto,
} from "../../API/notification-config.api";
import { usePermission } from "../../hooks/usePermission";

type NotificationEventRow = CrudRow & {
  code: string;
  description: string;
  moduleId: number | "";
};

function dtoToRow(dto: NotificationEventDto): NotificationEventRow {
  return {
    id: String(dto.id),
    name: dto.name,
    code: dto.code ?? "",
    description: dto.description ?? "",
    moduleId: dto.moduleId ?? "",
    status: dto.isActive ? "Active" : "Disabled",
  };
}

export function NotificationEventsCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<NotificationEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState<{ id: number; name: string }[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationConfigApi.events.list({ page: 1, limit: 100 }, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load notification events.");
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
    notificationConfigApi.modules
      .list({}, c.signal)
      .then((mods) => { if (!c.signal.aborted) setModules(mods.map((m) => ({ id: m.id, name: m.name }))); })
      .catch(() => {});
    return () => c.abort();
  }, []);

  const moduleName = useMemo(() => Object.fromEntries(modules.map((m) => [m.id, m.name])), [modules]);

  const persistSave = async (row: NotificationEventRow): Promise<NotificationEventRow> => {
    if (!row.code || row.code.trim().length === 0) throw new Error("Event code is required.");
    if (!/^[A-Z0-9_]+$/.test(row.code.trim())) throw new Error("Code must contain only uppercase letters, numbers, and underscores.");
    if (!row.name || row.name.trim().length === 0) throw new Error("Event name is required.");
    if (!row.moduleId) throw new Error("Please select the owning module.");
    const input = {
      code: row.code.trim(),
      name: row.name.trim(),
      description: row.description.trim() || undefined,
      moduleId: Number(row.moduleId),
    };
    const isNew = row.id.startsWith("new-");
    const dto = isNew
      ? await notificationConfigApi.events.create(input)
      : await notificationConfigApi.events.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  // Events are deactivated rather than deleted (no DELETE endpoint by design).
  const persistToggle = async (id: string, nextStatus: string) => {
    if (nextStatus === "Disabled") {
      await notificationConfigApi.events.deactivate(Number(id));
      return;
    }
    await notificationConfigApi.events.update(Number(id), { isActive: true });
  };

  if (!can("notification_event.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view notification events.
      </div>
    );
  if (loading)
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-xs" style={{ color: P.textMuted }}>
        <Loader2 size={15} className="animate-spin" /> Loading notification events…
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
        <CrudShell<NotificationEventRow>
          title="Notification Events"
          sub="Catalog of system events that can trigger notification templates"
          icon={Bell}
          columns={[
            { key: "name", label: "Event Name", sortable: true, render: (r) => <p className="text-xs font-semibold" style={{ color: P.text }}>{r.name}</p> },
            { key: "code", label: "Code", sortable: true, render: (r) => <p className="text-xs font-mono" style={{ color: P.textMid }}>{r.code}</p> },
            { key: "moduleId", label: "Module", render: (r) => r.moduleId ? <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.darkOlive }}>{moduleName[Number(r.moduleId)] ?? `#${r.moduleId}`}</span> : "—" },
            { key: "description", label: "Description", render: (r) => <p className="text-xs truncate max-w-[220px]" style={{ color: P.textMuted }}>{r.description || "—"}</p> },
            { key: "status", label: "Status", sortable: true, render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={rows}
          onRows={setRows}
          persistSave={persistSave}
          persistToggle={persistToggle}
          filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
          createLabel="New Event"
          showArchive={false}
          showDuplicate={false}
          showDelete={false}
          toggleStatus={{ enabled: "Active", disabled: "Disabled", enableLabel: "Activate", disableLabel: "Deactivate" }}
          cloneRow={undefined}
          renderForm={(row, onSave, onClose) => {
            const blank: NotificationEventRow = {
              id: `new-${Date.now()}`,
              name: "",
              code: "",
              description: "",
              moduleId: modules[0]?.id ?? "",
              status: "Active",
            };
            // Form state must live in InlineFormState (a real component) —
            // an inline useState here changes CrudShell's hook order when the
            // dialog opens/closes and crashes React.
            return (
              <InlineFormState initial={row ?? blank}>
                {(form, setForm) => (
                  <CrudModal title={row ? "Edit Notification Event" : "New Notification Event"} onClose={onClose}>
                    <div className="space-y-4">
                      <Field label="Event Code" required>
                        <Inp value={form.code} onChange={(v) => setForm({ ...form, code: v.toUpperCase() })} placeholder="e.g. COURSE_COMPLETED" />
                        <p className="mt-1 text-[10px]" style={{ color: P.textMuted }}>Uppercase letters, numbers and underscores only.</p>
                      </Field>
                      <Field label="Event Name" required>
                        <Inp value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="e.g. Course Completed" />
                      </Field>
                      <Field label="Owning Module" required>
                        <Sel
                          value={String(form.moduleId)}
                          onChange={(v) => setForm({ ...form, moduleId: v ? Number(v) : "" })}
                          options={modules.map((m) => ({ value: String(m.id), label: m.name }))}
                        />
                      </Field>
                      <Field label="Description">
                        <Textarea value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="When does this event fire?" />
                      </Field>
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
