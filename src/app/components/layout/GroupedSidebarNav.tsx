import { useEffect, useRef, useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import { P } from "../../constants/theme.constants";
import type { NavGroup } from "../../constants/navigation.constants";
import type { NavigateFn, Screen } from "../../models/app.model";
import { SidebarNavBtn } from "./SidebarNavBtn";

export function GroupedSidebarNav({
  groups,
  screen,
  navigate,
}: {
  groups: NavGroup[];
  screen: Screen;
  navigate: NavigateFn;
}) {
  // All collapsed by default; the group containing the active screen auto-opens
  const activeGroup = groups.find((g) => g.items.some((i) => i.id === screen))?.label ?? null;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((g) => [g.label, g.label !== activeGroup])),
  );

  // When the screen changes to a screen in a different group, open that group
  const prevScreen = useRef(screen);
  useEffect(() => {
    if (prevScreen.current === screen) return;
    prevScreen.current = screen;
    const newGroup = groups.find((g) => g.items.some((i) => i.id === screen))?.label;
    if (newGroup) setCollapsed((p) => ({ ...p, [newGroup]: false }));
  }, [screen, groups]);

  return (
    <div className="space-y-3">
      {groups.map((group) => {
        if (group.standalone) {
          return (
            <div key={group.label}>
              {group.items.map((item) => (
                <SidebarNavBtn key={item.id} {...item} screen={screen} navigate={navigate} />
              ))}
            </div>
          );
        }

        const open = !collapsed[group.label];
        const hasActive = group.items.some((i) => i.id === screen);
        const GroupIcon = group.icon ?? group.items[0]?.icon ?? Layers;
        const target = group.target ?? (group.items[0]?.id as Screen | undefined);
        return (
          <div key={group.label}>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (target) navigate(target);
                  setCollapsed((p) => ({ ...p, [group.label]: false }));
                }}
                className="nav-item flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left"
                style={{
                  background: hasActive ? "rgba(4,120,87,0.22)" : "transparent",
                  color: hasActive ? "white" : P.sage,
                  transition: "background 180ms ease, color 180ms ease, padding-left 180ms ease",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "20%",
                    bottom: "20%",
                    width: 3,
                    background: P.olive,
                    borderRadius: "0 2px 2px 0",
                    transform: hasActive ? "scaleY(1)" : "scaleY(0)",
                    transition: "transform 220ms cubic-bezier(0.34,1.56,0.64,1)",
                    transformOrigin: "center",
                  }}
                />
                <GroupIcon size={15} className="flex-shrink-0" />
                <span className="text-[13px] font-semibold">{group.label}</span>
                {hasActive && (
                  <span
                    className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: P.sage,
                      animation: "badgePop 400ms cubic-bezier(0.34,1.56,0.64,1) both",
                    }}
                  />
                )}
              </button>
              <button
                onClick={() => setCollapsed((p) => ({ ...p, [group.label]: !p[group.label] }))}
                className="w-8 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  color: hasActive ? "white" : P.sage,
                  background: hasActive ? "rgba(4,120,87,0.22)" : "transparent",
                }}
                aria-label={`${open ? "Collapse" : "Expand"} ${group.label}`}
              >
                <ChevronDown
                  size={12}
                  className="transition-transform duration-200"
                  style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
              </button>
            </div>
            {open && (
              <div className="ml-4 space-y-2.5 mt-2.5">
                {group.items.map((item) => (
                  <SidebarNavBtn key={item.id} {...item} screen={screen} navigate={navigate} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
