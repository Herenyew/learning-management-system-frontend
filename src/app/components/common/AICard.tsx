import type React from "react";
import { Sparkles } from "lucide-react";
import { P } from "../../constants/theme.constants";

export function AICard({
  title,
  children,
  showSuggestions,
}: {
  title: string;
  children: React.ReactNode;
  showSuggestions?: boolean;
}) {
  const suggestions = ["Show skill gaps", "Recommend next course", "Generate report"];
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: `linear-gradient(135deg, ${P.goldLight}, ${P.goldMid}50)`,
        border: `1px solid ${P.gold}40`,
        transition: "box-shadow 200ms ease, transform 200ms ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(200,168,93,0.25)";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "";
        (e.currentTarget as HTMLDivElement).style.transform = "";
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: P.gold }}
        >
          <Sparkles size={11} className="text-white" />
        </div>
        <span className="text-xs font-semibold" style={{ color: "#7A5A10" }}>
          {title}
        </span>
        <span className="ml-auto flex gap-0.5">
          <span className="typing-dot" style={{ background: P.gold }} />
          <span className="typing-dot" style={{ background: P.gold }} />
          <span className="typing-dot" style={{ background: P.gold }} />
        </span>
      </div>
      {children}
      {showSuggestions && (
        <div
          className="flex flex-wrap gap-1.5 mt-3 pt-3"
          style={{ borderTop: `1px solid ${P.gold}30` }}
        >
          {suggestions.map((s, i) => (
            <button
              key={s}
              className="text-[10px] font-medium px-2.5 py-1 rounded-full fade-in-up"
              style={{
                background: `${P.gold}20`,
                color: "#8A6A1A",
                border: `1px solid ${P.gold}40`,
                animationDelay: `${i * 80}ms`,
                transition: "background 150ms ease, transform 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${P.gold}35`;
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${P.gold}20`;
                (e.currentTarget as HTMLButtonElement).style.transform = "";
              }}
              data-prototype-action="true"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
