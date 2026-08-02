import { P } from "../../constants/theme.constants";
import type { NavItemDef } from "../../constants/navigation.constants";
import type { NavigateFn, Screen } from "../../models/app.model";

// ─── Sidebar helpers ──────────────────────────────────────────

export function SidebarNavBtn({
  id,
  label,
  icon: Icon,
  screen,
  navigate,
}: NavItemDef & { screen: Screen; navigate: NavigateFn }) {
  const active = screen === id;
  return (
    <button
      onClick={() => navigate(id as Screen)}
      className="nav-item w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
      style={{
        background: active ? "rgba(4,120,87,0.22)" : "transparent",
        color: active ? "white" : P.sage,
        paddingLeft: active ? 16 : undefined,
        transition: "background 180ms ease, color 180ms ease, padding-left 180ms ease",
        position: "relative",
      }}
    >
      {/* Animated left indicator */}
      <span
        style={{
          position: "absolute",
          left: 0,
          top: "20%",
          bottom: "20%",
          width: 3,
          background: P.olive,
          borderRadius: "0 2px 2px 0",
          transform: active ? "scaleY(1)" : "scaleY(0)",
          transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
          transformOrigin: "center",
        }}
      />
      <Icon
        size={15}
        className="flex-shrink-0"
        style={{
          transition: "color 180ms ease, transform 180ms ease",
          transform: active ? "translateX(1px)" : "",
        }}
      />
      <span className="text-[13px] font-medium">{label}</span>
      {active && (
        <span
          className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: P.sage,
            animation: "badgePop 400ms cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        />
      )}
    </button>
  );
}
