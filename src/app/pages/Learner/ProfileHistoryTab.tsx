import React from "react";
import { Award, CheckCircle, HelpCircle, Play } from "lucide-react";
import { Chip } from "../../components/common";
import { P } from "../../constants/theme.constants";
import { quizAttemptHistory } from "./profile.data";

const HISTORY_ITEMS = [
  {
    action: "Completed course",
    detail: "Cybersecurity Fundamentals",
    date: "Jan 12, 2025",
    xp: "+450 XP",
    icon: CheckCircle,
    color: "#5A7A2A",
  },
  {
    action: "Earned badge",
    detail: "14-Day Streak",
    date: "Jan 10, 2025",
    xp: "+100 XP",
    icon: Award,
    color: P.gold,
  },
  {
    action: "Completed quiz",
    detail: "AI Foundations - 87%",
    date: "Jan 8, 2025",
    xp: "+80 XP",
    icon: HelpCircle,
    color: P.olive,
  },
  {
    action: "Started course",
    detail: "AI & ML for Business Leaders",
    date: "Jan 3, 2025",
    xp: "+20 XP",
    icon: Play,
    color: P.darkOlive,
  },
];

export function ProfileHistoryTab() {
  return (
    <div className="space-y-4">
      <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
          Learning History Timeline
        </p>
        <div className="space-y-3">
          {HISTORY_ITEMS.map(({ action, detail, date, xp, icon: Icon, color }) => (
            <div
              key={detail}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F6FEFA] transition-colors"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}14` }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  {action}
                </p>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {detail}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-semibold" style={{ color: "#5A7A2A" }}>
                  {xp}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
          Quiz Attempt History
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${P.border}` }}>
                {["Quiz", "Date", "Score", "Attempt", "Pass?"].map((header) => (
                  <th
                    key={header}
                    className="text-left py-2 text-[11px] font-semibold uppercase"
                    style={{ color: P.textMuted }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quizAttemptHistory.map(({ quiz, date, score, attempt, pass }) => (
                <tr key={`${quiz}-${date}`} style={{ borderBottom: `1px solid ${P.border}50` }}>
                  <td className="py-2.5 pr-4">
                    <p className="text-xs" style={{ color: P.text }}>
                      {quiz}
                    </p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-[11px] font-mono" style={{ color: P.textMuted }}>
                      {date}
                    </p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <p
                      className="text-xs font-bold"
                      style={{ color: pass ? "#5A7A2A" : "#C0392B" }}
                    >
                      {score}%
                    </p>
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-xs" style={{ color: P.textMuted }}>
                      #{attempt}
                    </p>
                  </td>
                  <td className="py-2.5">
                    <Chip label={pass ? "Pass" : "Fail"} variant={pass ? "green" : "red"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
