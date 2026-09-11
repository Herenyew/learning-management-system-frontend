import { Bell, GraduationCap, Settings, Layers } from "lucide-react";
import { P } from "../../constants/theme.constants";
import type { NavigateFn, Screen } from "../../models/app.model";
import { Av } from "../common";
import { SidebarNavBtn } from "./SidebarNavBtn";
import { usePermission } from "../../hooks/usePermission";
import { getVisibleNavItems } from "../../config/nav-registry";

export function Sidebar({
  screen,
  navigate,
  userName,
  userSubtitle,
  userInitials,
  onOpenSettings,
}: {
  screen: Screen;
  navigate: NavigateFn;
  userName: string;
  userSubtitle: string;
  userInitials: string;
  onOpenSettings: () => void;
}) {
  // Permission-driven navigation: filter by current user's permissions
  const can = usePermission();
  const visibleItems = getVisibleNavItems(can);

  return (
    <div className="w-[282px] flex-shrink-0 h-full p-4" style={{ background: P.bg }}>
      <aside
        className="h-full flex flex-col overflow-hidden rounded-2xl"
        style={{
          background: P.deepOlive,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 18px 44px rgba(4, 120, 87, 0.14)",
        }}
      >
        <div className="px-6 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: P.olive }}
            >
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <p
                className="text-sm font-bold text-white"
                style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
              >
                LearnOS
              </p>
              <p className="text-[10px] font-medium" style={{ color: P.sage }}>
                Enterprise Learning
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 overflow-y-auto">
          <div className="space-y-3">
            <p
              className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-5"
              style={{ color: "rgba(110,231,183,0.4)" }}
            >
              Navigation
            </p>
            {visibleItems.map((item) => (
              <SidebarNavBtn
                key={item.key}
                id={item.screen}
                label={item.label}
                icon={item.icon ?? Layers}
                screen={screen}
                navigate={navigate}
              />
            ))}
          </div>
          <div className="pt-7 mt-7" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <SidebarNavBtn
              id="notifications"
              label="Notifications"
              icon={Bell}
              screen={screen}
              navigate={navigate}
            />
          </div>
        </nav>

        <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            type="button"
            onClick={onOpenSettings}
            className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/70"
            style={{ background: "rgba(255,255,255,0.04)" }}
            aria-label="Open account settings"
          >
            <Av initials={userInitials} size={32} color={P.olive} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{userName}</p>
              <p className="text-[10px] truncate" style={{ color: P.sage }}>
                {userSubtitle}
              </p>
            </div>
            <Settings
              size={13}
              style={{ color: P.sage }}
              className="flex-shrink-0 transition-transform group-hover:rotate-45"
            />
          </button>
        </div>
      </aside>
    </div>
  );
}
