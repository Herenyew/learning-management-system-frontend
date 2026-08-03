import React from "react";
import { Edit, Share2, Zap } from "lucide-react";
import { PBar } from "../../components/common";
import { P } from "../../constants/theme.constants";

const PROFILE_STATS = [
  ["21", "Courses"],
  ["9", "Badges"],
  ["3", "Certs"],
  ["#4", "Rank"],
];

const tabs = ["overview", "skills", "courses", "certificates", "report", "history"] as const;
const learnerPhoto =
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=faces&fit=crop&h=240&w=240&q=80";

export type ProfileTab = (typeof tabs)[number];

export function ProfileHeaderCard({
  activeTab,
  onTabChange,
}: {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}) {
  return (
    <section
      className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: P.border }}
    >
      <div
        className="h-32"
        style={{ background: `linear-gradient(135deg, ${P.darkOlive}, ${P.olive})` }}
      />
      <div className="px-8 pb-6">
        <div className="flex flex-col gap-5 -mt-8 mb-6 md:flex-row md:items-start">
          <div
            className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden shadow-lg"
            style={{ background: P.olive }}
          >
            <img src={learnerPhoto} alt="Alex Mercer" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 md:pt-10">
            <h1
              className="text-3xl font-bold leading-tight"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              Alex Mercer
            </h1>
            <p className="mt-1 text-base" style={{ color: P.textMuted }}>
              Senior Engineer - Engineering - Level 8
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 md:pt-10">
            <button
              className="btn-secondary px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
              style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              type="button"
              data-prototype-action="true"
            >
              <Edit size={14} /> Edit
            </button>
            <button
              className="btn-primary px-5 py-2.5 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
              style={{ background: P.olive }}
              type="button"
              data-prototype-action="true"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        <div className="rounded-xl p-5 mb-5" style={{ background: P.bg }}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: P.lightSage }}
              >
                <Zap size={14} style={{ color: P.olive }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: P.text }}>
                  Level 8 - Senior Engineer
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  11,250 XP - 2,750 XP to Level 9
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {PROFILE_STATS.map(([value, label]) => (
                <div key={label}>
                  <p
                    className="text-lg font-bold"
                    style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
                  >
                    {value}
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <PBar value={(11250 / 14000) * 100} color={P.olive} height={8} />
          <div
            className="flex justify-between text-[10px] font-mono mt-1"
            style={{ color: P.textMuted }}
          >
            <span>11,250 XP</span>
            <span>14,000 XP (L9)</span>
          </div>
        </div>

        <nav
          className="flex gap-1 overflow-x-auto"
          style={{ borderBottom: `1px solid ${P.border}` }}
          aria-label="Profile tabs"
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="px-5 py-3 text-xs font-semibold capitalize whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#6EE7B7]"
              style={
                activeTab === tab
                  ? { color: P.olive, borderBottom: `2px solid ${P.olive}` }
                  : { color: P.textMuted }
              }
              type="button"
            >
              {tab === "report" ? "Progress Report" : tab}
            </button>
          ))}
        </nav>
      </div>
    </section>
  );
}
