import React, { useEffect, useState } from "react";
import {
  AICard,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Badge,
  Bar,
  BarChart2,
  BookOpen,
  Bot,
  Building,
  CERT_TEMPLATES,
  Calendar,
  CartesianGrid,
  Cell,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  ConfigPublishing,
  Copy,
  Cpu,
  Download,
  Edit,
  EditableSelect,
  Eye,
  FilePlus,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  Input,
  Layers,
  Link,
  Lock,
  MODERATION_ITEMS,
  Medal,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAMS_DATA,
  PROGRAM_TASKS_INITIAL,
  PROGRAM_TEMPLATE_LIBRARY,
  PROGRAM_TYPE_DEFAULTS,
  PUBLISHING_QUEUE,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SCORM_PACKAGES,
  Search,
  Select,
  Send,
  Settings,
  Shield,
  Signature,
  Sparkles,
  Stamp,
  Star,
  StatCard,
  TEAM_MEMBERS,
  TNA_DEPT_DATA,
  TNA_REQUESTS,
  TNA_TREND,
  Target,
  Textarea,
  ToggleLeft,
  ToggleRight,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  Wand2,
  X,
  XAxis,
  YAxis,
  Zap,
} from "./extended.shared";
import type { Screen } from "../../models/app.model";
import type {
  HRProgram,
  ProgramCohort,
  ProgramTask,
  ProgramTaskSource,
  ProgramTaskType,
  ProgramTemplate,
  ProgramTypeOption,
} from "./extended.shared";

import { ProgramTaskModal, type ProgramTaskModalContext } from "./ProgramTaskModal";

export type HRProgramTasksTabContext = {
  activeProgramList: HRProgram[];
  activeTab: "programs" | "create" | "templates" | "tasks";
  openTaskModal: (type: ProgramTaskType, task?: ProgramTask) => void;
  selectedProg: string;
  selectedProgramTasks: ProgramTask[];
  setProgramList: React.Dispatch<React.SetStateAction<HRProgram[]>>;
  setProgramTasks: React.Dispatch<React.SetStateAction<ProgramTask[]>>;
  setSelectedProg: React.Dispatch<React.SetStateAction<string>>;
  timelineWeeks: Array<[number, ProgramTask[]]>;
};

export function HRProgramTasksTab({ ctx }: { ctx: HRProgramTasksTabContext }) {
  const {
    activeProgramList,
    activeTab,
    openTaskModal,
    selectedProg,
    selectedProgramTasks,
    setProgramList,
    setProgramTasks,
    setSelectedProg,
    timelineWeeks,
  } = ctx;

  return (
    activeTab === "tasks" && (
      <div className="max-w-3xl space-y-4">
        <div className="bg-white rounded-xl border p-5" style={{ borderColor: P.border }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold" style={{ color: P.text }}>
              Program Tasks Builder
            </p>
            <select
              value={selectedProg}
              onChange={(e) => setSelectedProg(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
              style={{ border: `1px solid ${P.border}`, color: P.text }}
            >
              {activeProgramList.map((program) => (
                <option key={program.id}>{program.name}</option>
              ))}
            </select>
          </div>
          {timelineWeeks.length > 0 && (
            <div className="mb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {timelineWeeks.map(([week, tasks]) => (
                <div
                  key={week}
                  className="rounded-xl border p-3"
                  style={{ borderColor: P.border, background: P.bg }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold" style={{ color: P.text }}>
                      Week {week}
                    </p>
                    <span className="text-[10px] font-semibold" style={{ color: P.textMuted }}>
                      {tasks.length} task{tasks.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: P.textMuted }}>
                    {tasks[0]?.startDate} to {tasks[tasks.length - 1]?.dueDate}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-3">
            {selectedProgramTasks.map((task) => {
              const Icon =
                task.type === "Video" ? Video : task.type === "Reading" ? FileText : HelpCircle;
              const color =
                task.type === "Video" ? P.olive : task.type === "Reading" ? "#4A7A5A" : P.gold;

              return (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl border"
                  style={{ borderColor: P.border }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18` }}
                  >
                    <Icon size={15} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge
                        label={task.type}
                        variant={
                          task.type === "Video"
                            ? "sage"
                            : task.type === "Reading"
                              ? "neutral"
                              : "gold"
                        }
                      />
                      <p className="text-xs font-semibold truncate" style={{ color: P.text }}>
                        {task.title}
                      </p>
                    </div>
                    <p className="text-[10px]" style={{ color: P.textMuted }}>
                      {task.detail} ·{" "}
                      {task.source === "device"
                        ? `Device upload: ${task.fileName}`
                        : `Google Drive: ${task.driveUrl}`}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{ background: P.lightSage, color: P.darkOlive }}
                      >
                        <Calendar size={10} /> Week {task.timelineWeek}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[10px]"
                        style={{ color: P.textMuted }}
                      >
                        <Clock size={10} /> {task.startDate} to {task.dueDate}
                      </span>
                      <span className="text-[10px]" style={{ color: P.textMuted }}>
                        {task.milestone}
                      </span>
                      <span className="text-[10px]" style={{ color: P.textMuted }}>
                        {task.unlockRule}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openTaskModal(task.type, task)}
                      className="p-1.5 rounded hover:bg-[#F6FEFA]"
                    >
                      <Edit size={13} style={{ color: P.sage }} />
                    </button>
                    <button
                      onClick={() => {
                        setProgramTasks((tasks) => tasks.filter((item) => item.id !== task.id));
                        setProgramList((programs) =>
                          programs.map((program) =>
                            program.name === selectedProg
                              ? { ...program, tasks: Math.max(0, program.tasks - 1) }
                              : program,
                          ),
                        );
                      }}
                      className="p-1.5 rounded hover:bg-[#F6FEFA]"
                    >
                      <Trash2 size={13} style={{ color: "#C0392B" }} />
                    </button>
                  </div>
                </div>
              );
            })}
            {!selectedProgramTasks.length && (
              <div
                className="rounded-xl border p-5 text-center text-xs"
                style={{ borderColor: P.border, color: P.textMuted, background: P.bg }}
              >
                No tasks added for this program yet.
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            {(
              [
                ["Video", Video],
                ["Reading", FileText],
                ["Quiz", HelpCircle],
              ] as [string, React.ElementType][]
            ).map(([label, Icon]) => (
              <button
                key={label}
                onClick={() => openTaskModal(label as ProgramTaskType)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                <Plus size={12} />
                <Icon size={12} /> Add {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  );
}
