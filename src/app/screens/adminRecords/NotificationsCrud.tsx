import React, { useCallback, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  CrudModal,
  CrudShell,
  Field,
  Inp,
  InlineFormState,
  MessageSquare,
  P,
  SaveBtn,
  Sel,
  StatusBadge,
  Textarea,
} from "./adminRecords.shared";
import type { CrudRow } from "./adminRecords.shared";
import {
  notificationConfigApi,
  type NotificationChannel,
  type NotificationEventDto,
  type NotificationTemplateDto,
} from "../../API/notification-config.api";
import { usePermission } from "../../hooks/usePermission";

const CHANNELS: NotificationChannel[] = ["EMAIL", "IN_APP", "SMS", "PUSH"];
const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "Email",
  IN_APP: "In-app",
  SMS: "SMS",
  PUSH: "Push",
};
const LANGUAGES = ["en", "es", "fr", "de", "pt", "zh", "ja", "ar"];

type NotificationTemplateRow = CrudRow & {
  description: string;
  channel: NotificationChannel;
  eventCode: string;
  notificationEventId: number | "";
  subject: string;
  body: string;
  variables: string;
  language: string;
  senderName: string;
  replyToEmail: string;
};

function dtoToRow(dto: NotificationTemplateDto): NotificationTemplateRow {
  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description ?? "",
    channel: dto.channel ?? "EMAIL",
    eventCode: dto.eventCode ?? "",
    notificationEventId: dto.notificationEventId ?? "",
    subject: dto.subject ?? "",
    body: dto.body ?? "",
    variables: JSON.stringify(dto.variables ?? {}),
    language: dto.language ?? "en",
    senderName: dto.senderName ?? "",
    replyToEmail: dto.replyToEmail ?? "",
    status: dto.isActive ? "Active" : "Disabled",
  };
}

export function NotificationsCrud() {
  const can = usePermission();
  const [rows, setRows] = useState<NotificationTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [events, setEvents] = useState<NotificationEventDto[]>([]);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationConfigApi.templates.list({ page: 1, limit: 100 }, signal);
      if (!signal?.aborted) setRows(data.map(dtoToRow));
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load notification templates.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  React.useEffect(() => {
    const c = new AbortController();
    notificationConfigApi.events
      .list({}, c.signal)
      .then((evts) => {
        if (!c.signal.aborted) setEvents(evts);
      })
      .catch(() => {});
    return () => c.abort();
  }, []);

  const persistSave = async (row: NotificationTemplateRow): Promise<NotificationTemplateRow> => {
    if (!row.name || row.name.trim().length === 0) throw new Error("Template name is required.");
    if (!row.body || row.body.trim().length === 0) throw new Error("Message body is required.");
    if (!row.eventCode || row.eventCode.trim().length === 0)
      throw new Error("Event code is required — e.g. COURSE_COMPLETED.");
    if (row.replyToEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(row.replyToEmail.trim())) {
      throw new Error("Reply-To email address is not valid.");
    }
    const input = {
      name: row.name.trim(),
      description: row.description.trim() || undefined,
      channel: row.channel,
      eventCode: row.eventCode.trim(),
      notificationEventId: row.notificationEventId ? Number(row.notificationEventId) : undefined,
      subject: row.subject.trim() || undefined,
      body: row.body,
      variables: row.variables ? JSON.parse(row.variables) : undefined,
      language: row.language || "en",
      senderName: row.senderName.trim() || undefined,
      replyToEmail: row.replyToEmail.trim() || undefined,
      isActive: row.status === "Active",
    };
    const isNew = row.id.startsWith("new-");
    const dto = isNew
      ? await notificationConfigApi.templates.create(input)
      : await notificationConfigApi.templates.update(Number(row.id), input);
    return dtoToRow(dto);
  };

  const persistDelete = async (id: string) => {
    await notificationConfigApi.templates.delete(Number(id));
  };

  const persistToggle = async (id: string, nextStatus: string) => {
    await notificationConfigApi.templates.update(Number(id), { isActive: nextStatus === "Active" });
  };

  if (!can("notification_template.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view notification templates.
      </div>
    );
  if (loading)
    return (
      <div
        className="flex items-center justify-center gap-2 py-12 text-xs"
        style={{ color: P.textMuted }}
      >
        <Loader2 size={15} className="animate-spin" /> Loading notification templates…
      </div>
    );

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          <AlertCircle size={14} />
          {error}
          <button onClick={() => void load()} className="ml-auto underline">
            Retry
          </button>
        </div>
      )}
      {!error && (
        <CrudShell<NotificationTemplateRow>
          title="Notification Templates"
          sub="Reusable notification messages with variable bindings"
          icon={MessageSquare}
          columns={[
            {
              key: "name",
              label: "Template Name",
              sortable: true,
              render: (r) => (
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {r.name}
                </p>
              ),
            },
            {
              key: "channel",
              label: "Channel",
              render: (r) => (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: P.lightSage, color: P.darkOlive }}
                >
                  {CHANNEL_LABELS[r.channel]}
                </span>
              ),
            },
            {
              key: "eventCode",
              label: "Event Code",
              render: (r) => (
                <p className="text-xs font-mono" style={{ color: P.textMuted }}>
                  {r.eventCode || "—"}
                </p>
              ),
            },
            {
              key: "status",
              label: "Status",
              sortable: true,
              render: (r) => <StatusBadge status={r.status} />,
            },
          ]}
          rows={rows}
          onRows={setRows}
          persistSave={persistSave}
          persistDelete={persistDelete}
          persistToggle={persistToggle}
          filterOptions={{ label: "Status", values: ["Active", "Disabled"] }}
          createLabel="New Template"
          showArchive={false}
          toggleStatus={{
            enabled: "Active",
            disabled: "Disabled",
            enableLabel: "Activate",
            disableLabel: "Deactivate",
          }}
          cloneRow={(r) => ({
            ...r,
            id: `new-${Date.now()}`,
            name: `${r.name} (Copy)`,
            status: "Disabled",
          })}
          renderForm={(row, onSave, onClose) => {
            const blank: NotificationTemplateRow = {
              id: `new-${Date.now()}`,
              name: "",
              description: "",
              channel: "EMAIL",
              eventCode: "",
              notificationEventId: "",
              subject: "",
              body: "",
              variables: "{}",
              language: "en",
              senderName: "",
              replyToEmail: "",
              status: "Active",
            };
            return (
              <InlineFormState initial={row ?? blank}>
                {(form, setForm) => (
                  <CrudModal
                    title={row ? "Edit Notification Template" : "New Notification Template"}
                    onClose={onClose}
                  >
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                      <Field label="Template Name" required>
                        <Inp
                          value={form.name}
                          onChange={(v) => setForm({ ...form, name: v })}
                          placeholder="e.g. Course Completion Email"
                        />
                      </Field>
                      <Field label="Description">
                        <Inp
                          value={form.description}
                          onChange={(v) => setForm({ ...form, description: v })}
                          placeholder="What is this template for?"
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Channel" required>
                          <Sel
                            value={form.channel}
                            onChange={(v) =>
                              setForm({ ...form, channel: v as NotificationChannel })
                            }
                            options={CHANNELS.map((c) => ({ value: c, label: CHANNEL_LABELS[c] }))}
                          />
                        </Field>
                        <Field label="Event Code" required>
                          <Inp
                            value={form.eventCode}
                            onChange={(v) => setForm({ ...form, eventCode: v })}
                            placeholder="e.g. COURSE_COMPLETED"
                          />
                        </Field>
                        <Field label="Notification Event">
                          <select
                            value={String(form.notificationEventId)}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                notificationEventId: e.target.value ? Number(e.target.value) : "",
                              })
                            }
                            className="w-full px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
                            style={{ border: `1px solid #E5E7EB`, color: "#111827" }}
                          >
                            <option value="">— Auto-detect from event code —</option>
                            {events.map((ev) => (
                              <option key={ev.id} value={ev.id}>
                                {ev.name} ({ev.code})
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Language">
                          <Sel
                            value={form.language}
                            onChange={(v) => setForm({ ...form, language: v })}
                            options={LANGUAGES}
                          />
                        </Field>
                        <Field label="Sender Name">
                          <Inp
                            value={form.senderName}
                            onChange={(v) => setForm({ ...form, senderName: v })}
                            placeholder="e.g. Acme Academy"
                          />
                        </Field>
                        <Field label="Reply-To Email">
                          <Inp
                            value={form.replyToEmail}
                            onChange={(v) => setForm({ ...form, replyToEmail: v })}
                            placeholder="replies@company.com"
                          />
                        </Field>
                      </div>
                      <Field label="Subject">
                        <Inp
                          value={form.subject}
                          onChange={(v) => setForm({ ...form, subject: v })}
                          placeholder="e.g. You completed {{courseName}}!"
                        />
                      </Field>
                      <Field label="Body" required>
                        <Textarea
                          value={form.body}
                          onChange={(v) => setForm({ ...form, body: v })}
                          placeholder="Message body. Use {{variables}} for personalisation…"
                          rows={5}
                        />
                      </Field>
                      <Field label="Variables (JSON)">
                        <Textarea
                          value={form.variables}
                          onChange={(v) => setForm({ ...form, variables: v })}
                          placeholder='{"courseName":"Data Binding","learnerName":"{{firstName}}"}'
                          rows={3}
                        />
                      </Field>
                      <Field label="Status">
                        <Sel
                          value={form.status}
                          onChange={(v) => setForm({ ...form, status: v })}
                          options={["Active", "Disabled"]}
                        />
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
