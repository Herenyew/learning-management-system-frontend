import React, { useEffect, useState } from "react";
import { Medal, Settings, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { Av } from "../../components/common";
import { LEADERBOARD_DATA, PROGRAMS } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import type {
  LeaderboardConfig,
  LeaderboardMetric,
  ProgramLbCriteria,
} from "../../models/app.model";
const PROGRAM_LEADERBOARD: Record<string, typeof LEADERBOARD_DATA> = {
  "ADIU Onboarding Program": [
    {
      rank: 1,
      name: "Mei Lin",
      dept: "Operations",
      xp: 3210,
      courses: 6,
      badges: 5,
      avatar: "ML",
      trend: "up",
    },
    {
      rank: 2,
      name: "Thomas Gruber",
      dept: "Legal",
      xp: 2940,
      courses: 6,
      badges: 4,
      avatar: "TG",
      trend: "up",
    },
    {
      rank: 3,
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 2780,
      courses: 5,
      badges: 4,
      avatar: "AM",
      trend: "up",
      isMe: true,
    },
    {
      rank: 4,
      name: "Priya Nair",
      dept: "Marketing",
      xp: 2510,
      courses: 5,
      badges: 3,
      avatar: "PN",
      trend: "same",
    },
    {
      rank: 5,
      name: "Luca Ferrari",
      dept: "Sales",
      xp: 2310,
      courses: 4,
      badges: 3,
      avatar: "LF",
      trend: "down",
    },
  ],
  "Future Leaders Initiative": [
    {
      rank: 1,
      name: "Aisha Rahman",
      dept: "Engineering",
      xp: 4820,
      courses: 8,
      badges: 5,
      avatar: "AR",
      trend: "up",
    },
    {
      rank: 2,
      name: "Carlos Mendez",
      dept: "Product",
      xp: 4640,
      courses: 8,
      badges: 4,
      avatar: "CM",
      trend: "up",
    },
    {
      rank: 3,
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 4250,
      courses: 7,
      badges: 4,
      avatar: "AM",
      trend: "up",
      isMe: true,
    },
    {
      rank: 4,
      name: "Yuki Tanaka",
      dept: "Design",
      xp: 3910,
      courses: 6,
      badges: 3,
      avatar: "YT",
      trend: "same",
    },
    {
      rank: 5,
      name: "Fatima Al-Hassan",
      dept: "Finance",
      xp: 3800,
      courses: 6,
      badges: 3,
      avatar: "FA",
      trend: "down",
    },
  ],
  "2025 Regulatory Compliance Pack": [
    {
      rank: 1,
      name: "Ben Ostrowski",
      dept: "HR",
      xp: 1940,
      courses: 5,
      badges: 4,
      avatar: "BO",
      trend: "up",
    },
    {
      rank: 2,
      name: "Fatima Al-Hassan",
      dept: "Finance",
      xp: 1810,
      courses: 5,
      badges: 3,
      avatar: "FA",
      trend: "up",
    },
    {
      rank: 3,
      name: "Thomas Gruber",
      dept: "Legal",
      xp: 1760,
      courses: 4,
      badges: 3,
      avatar: "TG",
      trend: "same",
    },
    {
      rank: 4,
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 1540,
      courses: 4,
      badges: 2,
      avatar: "AM",
      trend: "up",
      isMe: true,
    },
    {
      rank: 5,
      name: "Luca Ferrari",
      dept: "Sales",
      xp: 1390,
      courses: 3,
      badges: 2,
      avatar: "LF",
      trend: "down",
    },
  ],
  "Engineering Excellence Track": [
    {
      rank: 1,
      name: "Yuki Tanaka",
      dept: "Design",
      xp: 5820,
      courses: 9,
      badges: 7,
      avatar: "YT",
      trend: "up",
    },
    {
      rank: 2,
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 5640,
      courses: 9,
      badges: 6,
      avatar: "AM",
      trend: "up",
      isMe: true,
    },
    {
      rank: 3,
      name: "Carlos Mendez",
      dept: "Product",
      xp: 5010,
      courses: 8,
      badges: 5,
      avatar: "CM",
      trend: "same",
    },
    {
      rank: 4,
      name: "Priya Nair",
      dept: "Marketing",
      xp: 4310,
      courses: 7,
      badges: 4,
      avatar: "PN",
      trend: "up",
    },
    {
      rank: 5,
      name: "Mei Lin",
      dept: "Operations",
      xp: 3890,
      courses: 6,
      badges: 4,
      avatar: "ML",
      trend: "down",
    },
  ],
  "Graduate Talent Program": [
    {
      rank: 1,
      name: "Fatima Al-Hassan",
      dept: "Finance",
      xp: 3920,
      courses: 12,
      badges: 6,
      avatar: "FA",
      trend: "up",
    },
    {
      rank: 2,
      name: "Ben Ostrowski",
      dept: "HR",
      xp: 3740,
      courses: 11,
      badges: 5,
      avatar: "BO",
      trend: "up",
    },
    {
      rank: 3,
      name: "Luca Ferrari",
      dept: "Sales",
      xp: 3310,
      courses: 10,
      badges: 4,
      avatar: "LF",
      trend: "same",
    },
    {
      rank: 4,
      name: "Alex Mercer",
      dept: "Engineering",
      xp: 2980,
      courses: 9,
      badges: 4,
      avatar: "AM",
      trend: "up",
      isMe: true,
    },
    {
      rank: 5,
      name: "Thomas Gruber",
      dept: "Legal",
      xp: 2760,
      courses: 8,
      badges: 3,
      avatar: "TG",
      trend: "down",
    },
  ],
};

const METRIC_LABELS: Record<
  "xp" | "completion" | "performance",
  { short: string; long: string; icon: string }
> = {
  xp: { short: "XP Points", long: "By XP Points", icon: "⚡" },
  completion: { short: "Completion", long: "By Completion Rate", icon: "✅" },
  performance: { short: "Performance", long: "By Quiz Performance", icon: "🎯" },
};

const COL_HEADERS: Record<"xp" | "completion" | "performance", string[]> = {
  xp: ["Rank", "Learner", "Department", "XP Earned", "Courses", "Badges"],
  completion: ["Rank", "Learner", "Department", "Completion %", "Courses", "On-Time"],
  performance: ["Rank", "Learner", "Department", "Avg. Score", "Courses", "Prog. %"],
};

function metricValue(
  m: "xp" | "completion" | "performance",
  entry: (typeof LEADERBOARD_DATA)[0],
  idx: number,
): string {
  if (m === "xp") return `${entry.xp.toLocaleString()} XP`;
  if (m === "completion") return `${Math.max(60, 97 - idx * 5)}%`;
  return `${Math.max(55, 95 - idx * 4)}%`;
}

function metricCell(
  m: "xp" | "completion" | "performance",
  entry: (typeof LEADERBOARD_DATA)[0],
): string {
  if (m === "xp") return entry.xp.toLocaleString();
  if (m === "completion") return `${Math.max(60, 97 - (entry.rank - 1) * 5)}%`;
  return `${Math.max(55, 95 - (entry.rank - 1) * 4)}%`;
}

function metricExtra(
  m: "xp" | "completion" | "performance",
  entry: (typeof LEADERBOARD_DATA)[0],
): string {
  if (m === "xp") return String(entry.badges);
  if (m === "completion") return entry.rank <= 2 ? "✓" : "–";
  return `${Math.max(40, 90 - (entry.rank - 1) * 8)}%`;
}

export function LeaderboardScreen({
  lbConfig,
  programLbConfig,
}: {
  lbConfig: LeaderboardConfig;
  programLbConfig: Record<string, ProgramLbCriteria>;
}) {
  const allPrograms = PROGRAMS.map((p) => p.title);
  const [period, setPeriod] = useState("Month");
  const [selectedProgram, setSelectedProgram] = useState(allPrograms[0]);

  // Get per-program criteria (fall back to global lbConfig)
  const pgCriteria: ProgramLbCriteria = programLbConfig[selectedProgram] ?? {
    xp: lbConfig.xp,
    completion: lbConfig.completion,
    performance: lbConfig.performance,
    primary: lbConfig.primary,
  };

  const enabledMetrics = (["xp", "completion", "performance"] as const).filter(
    (m) => pgCriteria[m],
  );
  const preferredMetric = enabledMetrics.includes(lbConfig.primary)
    ? lbConfig.primary
    : pgCriteria.primary;
  const [classification, setClassification] = useState<LeaderboardMetric>(preferredMetric);

  useEffect(() => {
    setClassification(preferredMetric);
  }, [preferredMetric]);

  // Keep classification in sync when program changes
  const safeMetric = enabledMetrics.includes(classification)
    ? classification
    : (preferredMetric ?? enabledMetrics[0] ?? "xp");
  const activeMetric = safeMetric;

  const data = PROGRAM_LEADERBOARD[selectedProgram] ?? LEADERBOARD_DATA.slice(0, 5);
  const top3 = data.slice(0, 3);
  const podiumColors = [P.olive, P.gold, P.sage];
  const podiumOrder = [1, 0, 2]; // 2nd, 1st, 3rd visual order

  if (enabledMetrics.length === 0) {
    return (
      <div className="p-6 max-w-[1200px] flex flex-col items-center justify-center gap-4 pt-24">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: P.lightSage }}
        >
          <Trophy size={26} style={{ color: P.sage }} />
        </div>
        <p className="text-base font-semibold" style={{ color: P.text }}>
          Leaderboard not configured
        </p>
        <p className="text-sm text-center max-w-sm" style={{ color: P.textMuted }}>
          HR has not enabled any leaderboard metrics for this program. Contact your HR
          administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold mb-1"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
          >
            Program Leaderboard
          </h1>
          <p className="text-sm" style={{ color: P.textMuted }}>
            Rankings among learners enrolled in the same program · Default basis:{" "}
            {METRIC_LABELS[activeMetric].long}
          </p>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {["Week", "Month", "Quarter", "All Time"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={
                period === p
                  ? { background: P.olive, color: "white" }
                  : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Program selector */}
      <div className="flex items-start gap-3">
        <p className="text-xs font-semibold mt-1.5 flex-shrink-0" style={{ color: P.textMid }}>
          Program:
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {allPrograms.map((pg) => {
            const pgCfg = programLbConfig[pg];
            const hasConfig = pgCfg && (pgCfg.xp || pgCfg.completion || pgCfg.performance);
            return (
              <button
                key={pg}
                onClick={() => {
                  setSelectedProgram(pg);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                style={
                  selectedProgram === pg
                    ? { background: P.text, color: "white" }
                    : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
                }
              >
                {pg}
                {hasConfig && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: selectedProgram === pg ? "rgba(255,255,255,0.7)" : P.olive,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Metric tabs — per-program HR-enabled criteria */}
      <div className="flex items-center gap-2 flex-wrap">
        {enabledMetrics.map((id) => (
          <button
            key={id}
            onClick={() => setClassification(id)}
            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
            style={
              activeMetric === id
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            <span>{METRIC_LABELS[id].icon}</span> {METRIC_LABELS[id].long}
            {id === pgCriteria.primary && (
              <span
                className="text-[9px] px-1 py-0.5 rounded"
                style={{
                  background:
                    activeMetric === id ? "rgba(255,255,255,0.25)" : "rgba(4,120,87,0.12)",
                  color: activeMetric === id ? "white" : P.olive,
                }}
              >
                Primary
              </span>
            )}
          </button>
        ))}
        <span
          className="ml-auto text-[10px] flex items-center gap-1"
          style={{ color: P.textMuted }}
        >
          <Settings size={11} /> Criteria configured by HR
        </span>
      </div>

      {/* Podium */}
      <div className="bg-white rounded-2xl border p-6" style={{ borderColor: P.border }}>
        <div className="flex items-center justify-between mb-2">
          <div
            className="text-xs font-semibold px-3 py-1 rounded-full"
            style={{ background: P.lightSage, color: P.darkOlive }}
          >
            {selectedProgram} · {data.length} participants
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: P.textMuted }}>
            <span>{METRIC_LABELS[activeMetric].icon}</span>
            <span>{METRIC_LABELS[activeMetric].long}</span>
          </div>
        </div>
        <div className="flex items-end justify-center gap-6 mt-6">
          {podiumOrder.map((idx) => {
            if (!top3[idx]) return null;
            const e = top3[idx];
            const heights = [80, 110, 64];
            const isFirst = idx === 0;
            const val = metricValue(activeMetric, e, idx);
            return (
              <div key={e.rank} className="flex flex-col items-center gap-2">
                {isFirst && <div className="text-2xl">🌿</div>}
                <div className="relative">
                  <Av initials={e.avatar} size={isFirst ? 68 : 54} color={podiumColors[idx]} />
                  <div
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                    style={{ background: podiumColors[idx] }}
                  >
                    {e.rank}
                  </div>
                </div>
                <p
                  className={`font-bold text-center ${isFirst ? "text-sm" : "text-xs"}`}
                  style={{ color: P.text }}
                >
                  {e.name}
                  {e.isMe ? " (You)" : ""}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  {e.dept}
                </p>
                <div
                  className="rounded-t-xl flex flex-col items-center justify-center gap-1"
                  style={{
                    width: isFirst ? 90 : 72,
                    height: heights[idx === 0 ? 1 : idx === 1 ? 0 : 2],
                    background: `${podiumColors[idx]}18`,
                    border: `1px solid ${podiumColors[idx]}35`,
                  }}
                >
                  {isFirst ? (
                    <Trophy size={20} style={{ color: P.gold }} />
                  ) : (
                    <Medal size={16} style={{ color: podiumColors[idx] }} />
                  )}
                  <p className="text-[11px] font-bold" style={{ color: podiumColors[idx] }}>
                    {val}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full ranking table */}
      <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${P.border}` }}
        >
          <p className="text-sm font-semibold" style={{ color: P.text }}>
            Full Rankings · {selectedProgram}
          </p>
          <div
            className="flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full"
            style={{ background: P.lightSage, color: P.darkOlive }}
          >
            {METRIC_LABELS[activeMetric].icon} {METRIC_LABELS[activeMetric].short}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${P.border}` }}>
              {COL_HEADERS[activeMetric].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: P.textMuted }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr
                key={entry.rank}
                style={{
                  borderBottom: `1px solid ${P.border}50`,
                  background: entry.isMe ? `${P.lightSage}60` : undefined,
                  transition: "background 120ms ease",
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="text-sm font-bold w-6"
                      style={{ color: entry.rank <= 3 ? podiumColors[entry.rank - 1] : P.textMid }}
                    >
                      #{entry.rank}
                    </span>
                    {entry.trend === "up" && <TrendingUp size={11} style={{ color: "#5A7A2A" }} />}
                    {entry.trend === "down" && (
                      <TrendingDown size={11} style={{ color: "#C0392B" }} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Av initials={entry.avatar} size={32} color={entry.isMe ? P.olive : P.sage} />
                    <div>
                      <p
                        className="text-xs font-semibold"
                        style={{ color: entry.isMe ? P.olive : P.text }}
                      >
                        {entry.name}
                        {entry.isMe ? " (You)" : ""}
                      </p>
                      {entry.isMe && (
                        <p className="text-[9px]" style={{ color: P.textMuted }}>
                          Your position
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    {entry.dept}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold font-mono" style={{ color: P.text }}>
                    {metricCell(activeMetric, entry)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: P.textMid }}>
                    {entry.courses}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs" style={{ color: P.textMid }}>
                    {metricExtra(activeMetric, entry)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 10. PROGRAMS ─────────────────────────────────────────────
