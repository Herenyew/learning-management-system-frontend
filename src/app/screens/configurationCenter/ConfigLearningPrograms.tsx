// Extensions3.tsx — Configuration Center, Analytics Center, Course Builder,
// Certification Management, Gamification, Two-Level Moderation
// Olive / Sage / Gold enterprise design language

import React, { useState } from "react";
import { X } from "lucide-react";
import { CfgSection, P, SaveBar } from "./configuration.shared";

export function ConfigLearningPrograms() {
  const [progTypes, setProgTypes] = useState([
    "New Employee",
    "Graduate Trainee",
    "Leadership",
    "Technical",
    "Compliance",
  ]);
  const [newType, setNewType] = useState("");

  return (
    <div className="space-y-5">
      {/* Program Types */}
      <CfgSection title="Program Types">
        <div className="flex flex-wrap gap-2 mb-3">
          {progTypes.map((t) => (
            <div
              key={t}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {t}
              <button onClick={() => setProgTypes((p) => p.filter((x) => x !== t))}>
                <X size={10} className="ml-0.5 hover:text-red-600" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            placeholder="Add program type…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newType.trim()) {
                setProgTypes((p) => [...p, newType.trim()]);
                setNewType("");
              }
            }}
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white focus:outline-none"
            style={{ border: `1px solid ${P.border}`, color: P.text }}
          />
          <button
            onClick={() => {
              if (newType.trim()) {
                setProgTypes((p) => [...p, newType.trim()]);
                setNewType("");
              }
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            Add
          </button>
        </div>
      </CfgSection>

      <SaveBar />
    </div>
  );
}

// ─── XP & Gamification Config ─────────────────────────────────
