import { useEffect, useRef, useState } from "react";
import {
  Bell,
  BookOpen,
  CheckCircle,
  ChevronDown,
  HelpCircle,
  Lock,
  LogOut,
  Palette,
  Plug,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";
import { NOTIFICATIONS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type { NavigateFn, Role, Screen } from "../../models/app.model";
import type { BackendConnectionStatus } from "../../models/health.model";
import { Av } from "../common";

type TopBarMenu = "notifications" | "help" | "profile" | null;

export function TopBar({
  navigate,
  role,
  backendStatus,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  onLogout,
}: {
  navigate: NavigateFn;
  role: Role;
  backendStatus: BackendConnectionStatus;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}) {
  const [openMenu, setOpenMenu] = useState<TopBarMenu>(null);
  const [readNotificationIds, setReadNotificationIds] = useState(
    () =>
      new Set(
        NOTIFICATIONS.filter((notification) => notification.read).map(
          (notification) => notification.id,
        ),
      ),
  );
  const menuRef = useRef<HTMLDivElement | null>(null);

  const roleLabel: Record<Role, string> = {
    learner: "Learner Portal",
    hr: "HR Administration",
    manager: "Manager View",
    creator: "Course Creator Studio",
    admin: "System Administration",
  };

  const roleHome: Record<Role, Screen> = {
    learner: "dashboard",
    hr: "hr-dashboard",
    manager: "manager",
    creator: "my-courses-builder",
    admin: "hr-dashboard",
  };

  const unreadCount = NOTIFICATIONS.filter(
    (notification) => !readNotificationIds.has(notification.id),
  ).length;
  const previewNotifications = NOTIFICATIONS.slice(0, 3).map((notification) => ({
    ...notification,
    read: readNotificationIds.has(notification.id),
  }));

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  const navigateFromMenu = (target: Screen) => {
    setOpenMenu(null);
    navigate(target);
  };

  const markNotificationRead = (notificationId: string) => {
    setReadNotificationIds((currentIds) => {
      const nextIds = new Set(currentIds);
      nextIds.add(notificationId);
      return nextIds;
    });
  };

  const cleanTitle = (title: string) => title.replace(/^[^A-Za-z0-9"]+\s*/, "");

  return (
    <header
      className="bg-white px-8 py-4 flex items-center gap-6 flex-shrink-0"
      style={{ borderBottom: `1px solid ${P.border}` }}
    >
      <div className="flex-1">
        <div className="relative max-w-xl">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: P.sage }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && searchQuery.trim()) {
                navigate("catalog");
              }
            }}
            placeholder="Search courses, programs, people..."
            className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl focus:outline-none focus:ring-2"
            style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.text }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md"
              style={{ color: P.textMuted }}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div ref={menuRef} className="relative flex items-center gap-3">
        <div
          className="hidden lg:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
          style={{
            background: backendStatus === "connected" ? P.lightSage : P.bg,
            color: backendStatus === "connected" ? P.darkOlive : P.textMuted,
            border: `1px solid ${backendStatus === "connected" ? P.sage : P.border}`,
          }}
          role="status"
          aria-label={`Backend ${backendStatus}`}
          title={
            backendStatus === "connected"
              ? "Connected to the LMS backend"
              : backendStatus === "checking"
                ? "Checking backend connection"
                : "Backend is currently unavailable"
          }
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                backendStatus === "connected"
                  ? P.olive
                  : backendStatus === "checking"
                    ? P.gold
                    : P.textMuted,
            }}
          />
          {backendStatus === "connected"
            ? "Connected"
            : backendStatus === "checking"
              ? "Connecting"
              : "Offline"}
        </div>

        <button
          type="button"
          onClick={() => navigateFromMenu(roleHome[role])}
          className="hidden md:flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold"
          style={{ color: P.textMuted }}
          title={`Open ${roleLabel[role]}`}
        >
          {roleLabel[role]}
          <ChevronDown size={13} />
        </button>
        <div className="w-px h-5 hidden md:block" style={{ background: P.border }} />

        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}
          className="relative p-2.5 rounded-xl transition-colors"
          style={{ background: openMenu === "notifications" ? P.lightSage : "transparent" }}
          aria-label="Open notifications"
          aria-expanded={openMenu === "notifications"}
        >
          <Bell size={18} style={{ color: P.textMuted }} />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 min-w-4 h-4 rounded-full border-2 border-white text-[9px] leading-3 text-white flex items-center justify-center"
              style={{ background: "#C0392B" }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "help" ? null : "help")}
          className="p-2.5 rounded-xl transition-colors"
          style={{ background: openMenu === "help" ? P.lightSage : "transparent" }}
          aria-label="Open help"
          aria-expanded={openMenu === "help"}
        >
          <HelpCircle size={18} style={{ color: P.textMuted }} />
        </button>

        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
          className="flex items-center gap-2 rounded-xl py-1.5 pl-2 pr-2"
          style={{ borderLeft: `1px solid ${P.border}` }}
          aria-label="Open account settings"
          aria-expanded={openMenu === "profile"}
        >
          <Av initials="AM" size={34} color={P.olive} />
          <div className="hidden sm:block">
            <p className="text-left text-xs font-semibold" style={{ color: P.text }}>
              Alex Mercer
            </p>
            <p className="text-left text-[10px]" style={{ color: P.textMuted }}>
              ADIU PLC - Engineering
            </p>
          </div>
          <ChevronDown size={13} className="hidden sm:block" style={{ color: P.textMuted }} />
        </button>

        {openMenu === "notifications" && (
          <div
            className="absolute right-0 top-[calc(100%+12px)] z-50 w-[360px] rounded-2xl border bg-white p-3 shadow-2xl fade-in-up"
            style={{ borderColor: P.border, boxShadow: "0 22px 60px rgba(5,46,38,0.18)" }}
          >
            <div className="flex items-center justify-between px-2 pb-2">
              <div>
                <p className="text-sm font-bold" style={{ color: P.text }}>
                  Notifications
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {unreadCount} unread
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setReadNotificationIds(
                    new Set(NOTIFICATIONS.map((notification) => notification.id)),
                  )
                }
                className="text-xs font-semibold"
                style={{ color: P.olive }}
                data-prototype-action="true"
                data-action-label="Mark all notifications as read"
              >
                Mark all read
              </button>
            </div>

            <div className="space-y-2">
              {previewNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    markNotificationRead(notification.id);
                    navigateFromMenu("notifications");
                  }}
                  className="w-full rounded-xl border p-3 text-left"
                  style={{
                    background: notification.read ? "white" : `${P.lightSage}55`,
                    borderColor: notification.read ? P.border : P.sage,
                    color: P.text,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg"
                      style={{ background: notification.read ? P.bg : P.lightSage }}
                    >
                      {notification.read ? (
                        <CheckCircle size={14} style={{ color: P.textMuted }} />
                      ) : (
                        <Bell size={14} style={{ color: P.olive }} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold">
                        {cleanTitle(notification.title)}
                      </span>
                      <span
                        className="mt-1 block truncate text-[11px]"
                        style={{ color: P.textMuted }}
                      >
                        {notification.body}
                      </span>
                    </span>
                    <span className="text-[10px]" style={{ color: P.textMuted }}>
                      {notification.time}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigateFromMenu("notifications")}
              className="mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
              style={{ background: P.olive }}
            >
              View more
            </button>
          </div>
        )}

        {openMenu === "help" && (
          <div
            className="absolute right-16 top-[calc(100%+12px)] z-50 w-[300px] rounded-2xl border bg-white p-3 shadow-2xl fade-in-up"
            style={{ borderColor: P.border, boxShadow: "0 22px 60px rgba(5,46,38,0.18)" }}
          >
            <p className="px-2 pb-2 text-sm font-bold" style={{ color: P.text }}>
              Help & Support
            </p>
            {["Open help center", "Contact support", "View keyboard shortcuts"].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setOpenMenu(null)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium"
                style={{ color: P.text }}
                data-prototype-action="true"
                data-action-label={item}
              >
                <HelpCircle size={16} style={{ color: P.olive }} />
                {item}
              </button>
            ))}
          </div>
        )}

        {openMenu === "profile" && (
          <div
            className="absolute right-0 top-[calc(100%+12px)] z-50 w-[320px] rounded-2xl border bg-white p-3 shadow-2xl fade-in-up"
            style={{ borderColor: P.border, boxShadow: "0 22px 60px rgba(5,46,38,0.18)" }}
          >
            <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: P.bg }}>
              <Av initials="AM" size={42} color={P.olive} />
              <div>
                <p className="text-sm font-bold" style={{ color: P.text }}>
                  Alex Mercer
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  ADIU PLC - Engineering
                </p>
              </div>
            </div>

            {[
              { label: "My profile", icon: User, target: "profile" as Screen },
              { label: "Notification settings", icon: Bell, target: "notifications" as Screen },
              { label: "Appearance", icon: Palette },
              { label: "Security", icon: Lock },
              { label: "Integrations", icon: Plug },
              { label: "Learning preferences", icon: BookOpen },
              { label: "Account settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.target) {
                      navigateFromMenu(item.target);
                      return;
                    }
                    setOpenMenu(null);
                    if (item.label === "Account settings") onOpenSettings();
                  }}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium"
                  style={{ color: P.text }}
                  data-prototype-action={
                    !item.target && item.label !== "Account settings" ? "true" : undefined
                  }
                  data-action-label={item.label}
                >
                  <Icon size={16} style={{ color: P.olive }} />
                  {item.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setOpenMenu(null);
                onLogout();
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold"
              style={{ color: "#C0392B", background: "#FEF2F2" }}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
