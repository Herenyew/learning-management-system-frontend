import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  Layers,
  RefreshCw,
  Send,
} from "lucide-react";
import { P } from "../../constants/theme.constants";
import { useNotificationCenter } from "../../hooks/useNotificationCenter";
import type { NavigateFn } from "../../models/app.model";
import type { NotificationRecord } from "../../models/notification.model";
import { navigateToNotificationAction } from "../../services/notificationNavigation.service";

type NotificationFilter = "All" | "Unread" | "Courses" | "Programs" | "TNA" | "Certificates";

const filters: NotificationFilter[] = [
  "All",
  "Unread",
  "Courses",
  "Programs",
  "TNA",
  "Certificates",
];

const eventGroup = (
  notification: NotificationRecord,
): Exclude<NotificationFilter, "All" | "Unread"> => {
  if (notification.eventCode.startsWith("TNA_")) return "TNA";
  if (notification.eventCode.startsWith("CERTIFICATE_")) return "Certificates";
  if (notification.eventCode.startsWith("PROGRAM_")) return "Programs";
  return "Courses";
};

const iconFor = (
  notification: NotificationRecord,
): { Icon: ElementType; bg: string; color: string } => {
  if (notification.eventCode.startsWith("CERTIFICATE_")) {
    return { Icon: Award, bg: P.goldLight, color: "#8A6A1A" };
  }
  if (notification.eventCode.startsWith("TNA_")) {
    return { Icon: Send, bg: "#EDE9FE", color: "#5B21B6" };
  }
  if (notification.eventCode.startsWith("PROGRAM_")) {
    return { Icon: Layers, bg: P.paleGreen, color: P.darkOlive };
  }
  return { Icon: BookOpen, bg: P.lightSage, color: P.olive };
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function NotificationsScreen({ navigate }: { navigate: NavigateFn }) {
  const [filter, setFilter] = useState<NotificationFilter>("All");
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    markingIds,
    markingAll,
    refresh,
    markRead,
    markAllRead,
  } = useNotificationCenter();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const filtered = useMemo(
    () =>
      notifications.filter((notification) => {
        if (filter === "All") return true;
        if (filter === "Unread") return !notification.readAt;
        return eventGroup(notification) === filter;
      }),
    [filter, notifications],
  );

  const openNotification = (notification: NotificationRecord) => {
    void markRead(notification.id).catch(() => undefined);
    if (!navigateToNotificationAction(notification.actionUrl, navigate)) {
      // Unknown/legacy action URL — stay on the notification center.
      void refresh();
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[900px]">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Notification Center
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
            {refreshing ? " · refreshing…" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void markAllRead()}
            disabled={markingAll || unreadCount === 0}
            className="text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: P.olive }}
          >
            {markingAll ? "Marking…" : "Mark all as read"}
          </button>
          <button
            onClick={() => void refresh()}
            className="px-3 py-2 bg-white rounded-lg text-sm flex items-center gap-1.5"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            aria-label="Refresh notifications"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-full text-xs font-medium"
            style={
              filter === f
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            {f}
            {f === "Unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>

      {error && (
        <div
          className="rounded-xl border bg-red-50 px-4 py-3 text-sm flex items-center gap-2"
          role="alert"
          style={{ borderColor: "#FECACA", color: "#B91C1C" }}
        >
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading && notifications.length === 0 ? (
        <div
          className="flex items-center justify-center gap-2 rounded-xl border bg-white py-16 text-sm"
          style={{ borderColor: P.border, color: P.textMuted }}
        >
          <RefreshCw size={16} className="animate-spin" /> Loading notifications…
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notification) => {
            const { Icon, bg, color } = iconFor(notification);
            const read = Boolean(notification.readAt);
            const marking = markingIds.has(notification.id);
            return (
              <button
                key={notification.id}
                type="button"
                onClick={() => openNotification(notification)}
                disabled={marking}
                className="flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all disabled:cursor-wait"
                style={{
                  background: read ? "white" : `${P.lightSage}45`,
                  borderColor: read ? P.border : `${P.sage}80`,
                }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: bg }}
                >
                  <Icon size={18} style={{ color }} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-sm font-semibold leading-tight" style={{ color: P.text }}>
                      {notification.title}
                    </span>
                    <span className="shrink-0 text-[10px]" style={{ color: P.textMuted }}>
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </span>
                  <span
                    className="mt-1 block text-xs leading-relaxed"
                    style={{ color: P.textMuted }}
                  >
                    {notification.body ?? "Open this notification for details."}
                  </span>
                  {notification.actionUrl && (
                    <span
                      className="mt-2 inline-flex text-[11px] font-semibold"
                      style={{ color: P.olive }}
                    >
                      Open details →
                    </span>
                  )}
                </span>
                <span className="mt-1 shrink-0">
                  {marking ? (
                    <Clock size={15} className="animate-pulse" style={{ color: P.textMuted }} />
                  ) : read ? (
                    <CheckCircle size={15} style={{ color: P.sage }} />
                  ) : (
                    <Bell size={15} style={{ color: P.olive }} />
                  )}
                </span>
              </button>
            );
          })}
          {filtered.length === 0 && (
            <div
              className="rounded-xl border bg-white px-6 py-14 text-center"
              style={{ borderColor: P.border }}
            >
              <p className="text-sm font-semibold" style={{ color: P.text }}>
                No notifications found
              </p>
              <p className="mt-1 text-xs" style={{ color: P.textMuted }}>
                There are no server notifications matching this filter.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
