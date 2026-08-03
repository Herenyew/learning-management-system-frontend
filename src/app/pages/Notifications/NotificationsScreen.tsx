import React, { useState } from "react";
import { AlertCircle, Clock, Flame, MessageSquare, Settings, Sparkles, Trophy } from "lucide-react";
import { NOTIFICATIONS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
export function NotificationsScreen() {
  const [filter, setFilter] = useState("All");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const filters = ["All", "Unread", "Reminders", "Achievements", "AI Insights", "System"];
  const filtered = notifications.filter((n) => {
    if (filter === "All") return true;
    if (filter === "Unread") return !n.read;
    if (filter === "Reminders") return n.type === "reminder";
    if (filter === "Achievements") return n.type === "achievement";
    if (filter === "AI Insights") return n.type === "ai";
    return n.type === "system";
  });
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));

  const iconStyle = (icon: string): { bg: string; color: string; Icon: React.ElementType } => {
    const map: Record<string, { bg: string; color: string; Icon: React.ElementType }> = {
      clock: { bg: P.lightSage, color: P.olive, Icon: Clock },
      trophy: { bg: P.goldLight, color: P.gold, Icon: Trophy },
      ai: { bg: P.goldMid, color: "#8A6A1A", Icon: Sparkles },
      info: { bg: P.lightSage, color: P.darkOlive, Icon: AlertCircle },
      message: { bg: "#D8EDCC", color: "#3A6420", Icon: MessageSquare },
      alert: { bg: "#FEF2F2", color: "#C0392B", Icon: AlertCircle },
      flame: { bg: P.goldLight, color: P.gold, Icon: Flame },
    };
    return map[icon] ?? map.info;
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
            {notifications.filter((n) => !n.read).length} unread notifications
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="text-sm font-medium" style={{ color: P.olive }}>
            Mark all as read
          </button>
          <button
            className="px-3 py-2 bg-white rounded-lg text-sm flex items-center gap-1.5"
            style={{ border: `1px solid ${P.border}`, color: P.textMid }}
            data-prototype-action="true"
          >
            <Settings size={13} /> Settings
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
            {f === "Unread" && notifications.filter((n) => !n.read).length > 0
              ? ` (${notifications.filter((n) => !n.read).length})`
              : ""}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((notif) => {
          const { bg, color, Icon } = iconStyle(notif.icon);
          return (
            <div
              key={notif.id}
              onClick={() =>
                setNotifications((p) =>
                  p.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
                )
              }
              className="flex items-start gap-5 p-5 rounded-xl border transition-all cursor-pointer"
              style={{
                background: notif.read ? "white" : `${P.lightSage}45`,
                borderColor: notif.read ? P.border : `${P.sage}60`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-tight" style={{ color: P.text }}>
                    {notif.title}
                  </p>
                  <span
                    className="text-[10px] flex-shrink-0 font-mono"
                    style={{ color: P.textMuted }}
                  >
                    {notif.time}
                  </span>
                </div>
                <p
                  className="text-xs mt-1 leading-relaxed line-clamp-1"
                  style={{ color: P.textMuted }}
                >
                  {notif.body}
                </p>
                {!notif.read && (
                  <div className="flex gap-2 mt-2">
                    {notif.type === "reminder" && (
                      <button
                        className="text-[11px] font-semibold px-2 py-1 rounded-md"
                        style={{ color: P.olive, background: P.lightSage }}
                        data-prototype-action="true"
                      >
                        Open Course →
                      </button>
                    )}
                    {notif.type === "achievement" && (
                      <button
                        className="text-[11px] font-semibold px-2 py-1 rounded-md"
                        style={{ color: "#8A6A1A", background: P.goldLight }}
                        data-prototype-action="true"
                      >
                        View Badge 🏆
                      </button>
                    )}
                    {notif.type === "ai" && (
                      <button
                        className="text-[11px] font-semibold px-2 py-1 rounded-md flex items-center gap-1"
                        style={{ color: "#8A6A1A", background: P.goldLight }}
                        data-prototype-action="true"
                      >
                        <Sparkles size={10} /> View Recommendation
                      </button>
                    )}
                  </div>
                )}
              </div>
              {!notif.read && (
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: P.olive }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div
        className="rounded-xl border p-5 flex items-center justify-between"
        style={{
          background: `linear-gradient(to right, ${P.bg}, ${P.lightSage}50)`,
          borderColor: P.border,
        }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Customize your notifications
          </p>
          <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
            Control what you hear about and how often.
          </p>
        </div>
        <button
          className="px-4 py-2 bg-white rounded-lg text-sm flex items-center gap-1.5 flex-shrink-0 ml-4"
          style={{ border: `1px solid ${P.border}`, color: P.textMid }}
          data-prototype-action="true"
        >
          <Settings size={14} /> Manage Settings
        </button>
      </div>
    </div>
  );
}

// ── Inline-edit row for a single category ──────────────────────
