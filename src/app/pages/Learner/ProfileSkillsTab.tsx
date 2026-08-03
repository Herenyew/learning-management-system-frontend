import React from "react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { PBar } from "../../components/common";
import { SKILL_RADAR } from "../../constants/mockData";
import { P } from "../../constants/theme.constants";
import { skills } from "./profile.data";

export function ProfileSkillsTab() {
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold mb-4" style={{ color: P.text }}>
          Skill Proficiency vs. Target
        </p>
        <div className="space-y-4">
          {skills.map(({ name, level, target }) => (
            <div key={name}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium" style={{ color: P.textMid }}>
                  {name}
                </span>
                <span className="font-mono" style={{ color: P.textMuted }}>
                  {level}% / {target}%
                </span>
              </div>
              <div className="relative h-2 rounded-full" style={{ background: P.lightSage }}>
                <div
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ width: `${level}%`, background: P.olive }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                  style={{ left: `${target}%`, background: P.gold }}
                />
              </div>
              {level < target && (
                <p className="text-[10px] mt-0.5" style={{ color: P.gold }}>
                  Gap: {target - level}pts
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
        <p className="text-sm font-semibold mb-2" style={{ color: P.text }}>
          Competency Radar
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <RadarChart data={SKILL_RADAR}>
            <PolarGrid stroke={P.lightSage} />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: P.textMuted }} />
            <Radar
              key="score"
              dataKey="score"
              stroke={P.olive}
              fill={P.olive}
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
