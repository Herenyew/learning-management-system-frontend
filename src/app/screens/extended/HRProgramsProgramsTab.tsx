import React from "react";
import {
  Archive,
  Badge,
  CheckCircle,
  Clock,
  Copy,
  FileText,
  MoreHorizontal,
  P,
  PBar,
  PROGRAM_TYPE_DEFAULTS,
  Users,
} from "./extended.shared";
import type { HRProgram, ProgramTypeOption } from "./extended.shared";

export type HRProgramsProgramsTabContext = {
  activeProgramList: HRProgram[];
  archiveProgram: (program: HRProgram) => void;
  duplicateProgram: (program: HRProgram) => void;
  editProgram: (program: HRProgram) => void;
  programNotice: string;
  progTypes: ProgramTypeOption[];
};

export function HRProgramsProgramsTab({ ctx }: { ctx: HRProgramsProgramsTabContext }) {
  const {
    activeProgramList,
    archiveProgram,
    duplicateProgram,
    editProgram,
    programNotice,
    progTypes,
  } = ctx;

  return (
    <div className="space-y-4">
      {programNotice && (
        <div
          className="flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
          style={{ background: P.lightSage, borderColor: P.border, color: P.darkOlive }}
        >
          <CheckCircle size={16} />
          <span className="font-semibold">{programNotice}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: P.olive, color: "white" }}
          data-prototype-action="true"
        >
          All Types
        </button>
        {progTypes.map((type) => (
          <button
            key={type.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{
              background: "white",
              border: `1px solid ${type.status === "retired" ? P.goldMid : P.border}`,
              color: type.status === "retired" ? P.textMuted : P.textMid,
            }}
            data-prototype-action="true"
          >
            {type.name}
            {type.status === "retired" && (
              <span
                className="px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                style={{ background: P.goldLight, color: "#8A6A1A" }}
              >
                Retired
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {activeProgramList.map((program) => (
          <div
            key={program.id}
            className="bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all"
            style={{ borderColor: P.border }}
          >
            <div
              className="p-4"
              style={{
                background: `${program.color}10`,
                borderBottom: `1px solid ${P.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge label={program.type} variant="sage" />
                  <Badge label={program.visibility ?? "Public"} variant="neutral" />
                </div>
                <button
                  className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                  data-prototype-action="true"
                >
                  <MoreHorizontal size={14} style={{ color: P.textMuted }} />
                </button>
              </div>
              <h3 className="text-sm font-bold" style={{ color: P.text }}>
                {program.name}
              </h3>
              <div
                className="flex items-center gap-3 text-[11px] mt-1"
                style={{ color: P.textMuted }}
              >
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {program.employees} learners
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {program.duration}
                </span>
                <span className="flex items-center gap-1">
                  <FileText size={11} />
                  {program.tasks} tasks
                </span>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: P.textMuted }}>Overall Progress</span>
                  <span className="font-semibold" style={{ color: program.color }}>
                    {program.progress}%
                  </span>
                </div>
                <PBar value={program.progress} color={program.color} height={6} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg p-2" style={{ background: "#D8EDCC" }}>
                  <p className="text-sm font-bold" style={{ color: "#3A6420" }}>
                    {program.completed}
                  </p>
                  <p className="text-[10px]" style={{ color: "#5A7A2A" }}>
                    Completed
                  </p>
                </div>
                <div className="rounded-lg p-2" style={{ background: P.goldLight }}>
                  <p className="text-sm font-bold" style={{ color: "#8A6A1A" }}>
                    {program.inProgress}
                  </p>
                  <p className="text-[10px]" style={{ color: P.gold }}>
                    In Progress
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg p-3 space-y-1"
                style={{ background: P.bg, border: `1px solid ${P.border}` }}
              >
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Owner:{" "}
                  <span className="font-semibold" style={{ color: P.textMid }}>
                    {program.owner ?? PROGRAM_TYPE_DEFAULTS[program.type]?.owner ?? "HR"}
                  </span>
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Cert:{" "}
                  {program.certificationTemplate ??
                    PROGRAM_TYPE_DEFAULTS[program.type]?.certificationTemplate}
                </p>
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  XP: {program.xpMultiplier ?? PROGRAM_TYPE_DEFAULTS[program.type]?.xpMultiplier} -{" "}
                  {program.approvalWorkflow ??
                    PROGRAM_TYPE_DEFAULTS[program.type]?.approvalWorkflow}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => editProgram(program)}
                  className="flex-1 py-2 rounded-lg text-xs font-medium"
                  style={{ background: P.lightSage, color: P.olive }}
                >
                  Manage
                </button>
                <button
                  onClick={() => archiveProgram(program)}
                  className="py-2 px-2.5 rounded-lg text-xs font-medium"
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  title="Archive Program"
                >
                  <Archive size={12} />
                </button>
                <button
                  onClick={() => duplicateProgram(program)}
                  className="py-2 px-2.5 rounded-lg text-xs font-medium"
                  style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                  title="Duplicate Program"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!activeProgramList.length && (
          <div
            className="md:col-span-2 xl:col-span-3 rounded-xl border bg-white p-5 text-sm"
            style={{ borderColor: P.border, color: P.textMuted }}
          >
            No active programs are visible. Archived programs keep their historical data, but they
            are hidden from new management actions.
          </div>
        )}
      </div>
    </div>
  );
}
