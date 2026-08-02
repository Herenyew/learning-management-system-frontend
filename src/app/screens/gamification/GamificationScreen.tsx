import React from "react";
import { Award, BookOpen, Medal, Plus, Sparkles, Trophy, Zap } from "lucide-react";
import { Chip, PageHeader } from "../../components/common";
import { P } from "../../constants/theme.constants";
export function GamificationScreen({ navigate }: { navigate: (s: string) => void }) {
  void navigate;
  const rewards: {
    icon: React.ElementType;
    label: string;
    desc: string;
    active: boolean;
    earned: number;
    tone: string;
  }[] = [
    {
      icon: Award,
      label: "Course Completer",
      desc: "Complete any course",
      active: true,
      earned: 842,
      tone: P.olive,
    },
    {
      icon: Zap,
      label: "Streak Master",
      desc: "Maintain a 14-day learning streak",
      active: true,
      earned: 214,
      tone: P.gold,
    },
    {
      icon: BookOpen,
      label: "Knowledge Seeker",
      desc: "Complete 5 courses in one category",
      active: true,
      earned: 326,
      tone: "#4A7A5A",
    },
    {
      icon: Medal,
      label: "Diamond Learner",
      desc: "Reach the highest learner level",
      active: false,
      earned: 38,
      tone: P.darkOlive,
    },
    {
      icon: Sparkles,
      label: "Innovator",
      desc: "Complete an AI or technology program",
      active: false,
      earned: 91,
      tone: "#8A6A1A",
    },
    {
      icon: Trophy,
      label: "Top Performer",
      desc: "Finish a ranking cycle in first place",
      active: false,
      earned: 16,
      tone: P.gold,
    },
  ];

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <PageHeader title="Gamification" sub="Rewards, badges, and learner achievements" />
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: P.olive }}
          data-prototype-action="true"
        >
          <Plus size={14} /> Add Reward
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
          <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
            Active Rewards
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: P.text }}>
            {rewards.filter((reward) => reward.active).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
          <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
            Total Earned
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: P.text }}>
            {rewards.reduce((sum, reward) => sum + reward.earned, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
          <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
            Draft Rewards
          </p>
          <p className="text-2xl font-bold mt-1" style={{ color: P.text }}>
            {rewards.filter((reward) => !reward.active).length}
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map(({ icon: Icon, label, desc, active, earned, tone }) => (
          <div
            key={label}
            className="bg-white rounded-xl border p-4"
            style={{ borderColor: active ? `${P.gold}50` : P.border }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: active ? P.lightSage : P.bg }}
              >
                <Icon size={18} style={{ color: tone }} />
              </div>
              <Chip label={active ? "Active" : "Draft"} variant={active ? "green" : "neutral"} />
            </div>
            <p className="text-sm font-bold mb-0.5" style={{ color: P.text }}>
              {label}
            </p>
            <p className="text-[11px] min-h-[32px]" style={{ color: P.textMuted }}>
              {desc}
            </p>
            <div
              className="flex items-center justify-between mt-4 pt-3 border-t"
              style={{ borderColor: P.paleGreen }}
            >
              <span className="text-[11px] font-semibold" style={{ color: P.textMid }}>
                {earned.toLocaleString()} earned
              </span>
              <button
                className="px-3 py-1.5 rounded-lg text-[11px] font-semibold"
                style={{ background: P.lightSage, color: P.olive }}
                data-prototype-action="true"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
