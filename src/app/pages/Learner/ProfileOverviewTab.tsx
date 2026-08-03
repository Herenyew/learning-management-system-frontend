import React from "react";
import { Award, BarChart2, Brain, Flame, Lock, Star, Target, Users, Zap } from "lucide-react";
import { AICard } from "../../components/common";
import { P } from "../../constants/theme.constants";
import type { NavigateFn } from "../../models/app.model";

const BADGES = [
  { label: "Course Completer", earned: true, icon: Award },
  { label: "14-Day Streak", earned: true, icon: Flame },
  { label: "Knowledge Seeker", earned: true, icon: Brain },
  { label: "Top 5 Learner", earned: true, icon: Star },
  { label: "Speed Learner", earned: true, icon: Zap },
  { label: "Collaborator", earned: true, icon: Users },
  { label: "Data Explorer", earned: true, icon: BarChart2 },
  { label: "Goal Crusher", earned: true, icon: Target },
  { label: "Diamond Learner", earned: false, icon: Award },
  { label: "Innovator", earned: false, icon: Brain },
  { label: "Top Performer", earned: false, icon: Star },
  { label: "Researcher", earned: false, icon: Target },
];

export function ProfileOverviewTab({ navigate }: { navigate: NavigateFn }) {
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <section className="bg-white rounded-xl border p-5 mb-5" style={{ borderColor: P.border }}>
          <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
            Earned Badges
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {BADGES.map(({ label, earned, icon: Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border"
                style={{
                  borderColor: earned ? `${P.gold}40` : P.border,
                  background: earned ? P.goldLight : P.bg,
                  opacity: earned ? 1 : 0.45,
                }}
              >
                <Icon size={24} style={{ color: earned ? P.gold : P.sage }} />
                <p className="text-[9px] text-center leading-tight" style={{ color: P.textMuted }}>
                  {label}
                </p>
                {!earned && <Lock size={10} style={{ color: P.sage }} />}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <AICard title="AI Skill Gap Analysis">
          <p className="text-xs leading-relaxed mb-3" style={{ color: "#7A5A10" }}>
            Compared to Senior Engineers at L9, you have skill gaps in{" "}
            <strong>Data Literacy</strong> and <strong>AI & Innovation</strong>. Addressing these
            would accelerate your path to L9.
          </p>
          <button
            onClick={() => navigate("tna")}
            className="text-xs font-semibold"
            style={{ color: "#8A6A1A" }}
            type="button"
          >
            Full Analysis
          </button>
        </AICard>
        <section className="bg-white rounded-xl border p-4" style={{ borderColor: P.border }}>
          <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>
            Learning Streak
          </p>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, index) => {
              const active = index % 5 !== 0 && index < 23;
              return (
                <div
                  key={index}
                  className="h-6 rounded-sm"
                  style={{
                    background: active ? P.olive : P.lightSage,
                    opacity: active ? 0.85 : 0.5,
                  }}
                />
              );
            })}
          </div>
          <p className="text-[10px] mt-2" style={{ color: P.textMuted }}>
            Last 4 weeks - 14-day current streak
          </p>
        </section>
      </div>
    </div>
  );
}
