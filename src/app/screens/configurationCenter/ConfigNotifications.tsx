import React, { useEffect, useState, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { CfgSection, P, SaveBar } from "./configuration.shared";
import {
  notificationConfigApi,
  type NotificationModuleDto,
  type NotificationChannel,
} from "../../API/notification-config.api";
import { usePermission } from "../../hooks/usePermission";

const ALL_CHANNELS: NotificationChannel[] = ["EMAIL", "IN_APP", "SMS", "PUSH"];
const CHANNEL_LABELS: Record<NotificationChannel, string> = {
  EMAIL: "Email",
  IN_APP: "In-app",
  SMS: "SMS",
  PUSH: "Push",
};

type ModuleState = NotificationModuleDto & { selectedChannels: NotificationChannel[] };

export function ConfigNotifications() {
  const can = usePermission();
  const [modules, setModules] = useState<ModuleState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await notificationConfigApi.modules.list({ isActive: true }, signal);
      if (!signal?.aborted)
        setModules(
          data.map((m) => ({
            ...m,
            selectedChannels: ["EMAIL", "IN_APP"] as NotificationChannel[],
          })),
        );
    } catch (e: any) {
      if (!signal?.aborted) setError(e?.message ?? "Failed to load notification modules.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const c = new AbortController();
    void load(c.signal);
    return () => c.abort();
  }, [load]);

  const toggleChannel = (moduleId: number, channel: NotificationChannel) => {
    setModules((ms) =>
      ms.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              selectedChannels: m.selectedChannels.includes(channel)
                ? m.selectedChannels.filter((c) => c !== channel)
                : [...m.selectedChannels, channel],
            }
          : m,
      ),
    );
  };

  if (!can("notification_module.view"))
    return (
      <div className="p-6 text-sm text-center" style={{ color: P.textMuted }}>
        You don't have permission to view notification settings.
      </div>
    );

  return (
    <div className="space-y-5">
      <CfgSection title="Notification Channels">
        <p className="mb-4 text-[11px]" style={{ color: P.textMuted }}>
          Choose how notifications are delivered for each learning module. Channel preferences are
          saved locally — template-level configuration is available in Notification Templates.
        </p>
        {loading && (
          <div className="flex items-center gap-2 py-4 text-xs" style={{ color: P.textMuted }}>
            <Loader2 size={13} className="animate-spin" /> Loading modules…
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center gap-2 mb-3">
            <AlertCircle size={14} />
            {error}
            <button onClick={() => void load()} className="ml-auto underline">
              Retry
            </button>
          </div>
        )}
        {!loading && (
          <div className="space-y-2">
            {modules.length === 0 && !error && (
              <p className="text-xs py-3 text-center" style={{ color: P.textMuted }}>
                No notification modules configured. Add modules via the backend admin.
              </p>
            )}
            {modules.map((m) => (
              <div
                key={m.id}
                className="grid gap-3 rounded-xl border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                style={{ borderColor: P.border, background: "white" }}
              >
                <div>
                  <p className="text-xs font-semibold" style={{ color: P.textMid }}>
                    {m.name}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: P.textMuted }}>
                    {m.description ?? m.slug}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5" aria-label={`${m.name} channels`}>
                  {ALL_CHANNELS.map((ch) => {
                    const selected = m.selectedChannels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleChannel(m.id, ch)}
                        className="rounded-full px-3 py-1 text-[10px] font-medium transition-colors"
                        style={{
                          background: selected ? P.lightSage : P.bg,
                          color: selected ? P.darkOlive : P.textMuted,
                          border: `1px solid ${selected ? P.sage : P.border}`,
                        }}
                      >
                        {CHANNEL_LABELS[ch]}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CfgSection>
      <SaveBar />
    </div>
  );
}
