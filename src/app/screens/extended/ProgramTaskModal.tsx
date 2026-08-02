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

export type ProgramTaskModalContext = {
  closeTaskModal: () => void;
  editingTaskId: string | null;
  saveProgramTask: () => void;
  selectedProg: string;
  setTaskDescription: React.Dispatch<React.SetStateAction<string>>;
  setTaskDetail: React.Dispatch<React.SetStateAction<string>>;
  setTaskDriveUrl: React.Dispatch<React.SetStateAction<string>>;
  setTaskDueDate: React.Dispatch<React.SetStateAction<string>>;
  setTaskFileName: React.Dispatch<React.SetStateAction<string>>;
  setTaskMilestone: React.Dispatch<React.SetStateAction<string>>;
  setTaskSource: React.Dispatch<React.SetStateAction<ProgramTaskSource>>;
  setTaskStartDate: React.Dispatch<React.SetStateAction<string>>;
  setTaskTimelineWeek: React.Dispatch<React.SetStateAction<number>>;
  setTaskTitle: React.Dispatch<React.SetStateAction<string>>;
  setTaskUnlockRule: React.Dispatch<React.SetStateAction<string>>;
  taskDescription: string;
  taskDetail: string;
  taskDriveUrl: string;
  taskDueDate: string;
  taskFileName: string;
  taskMilestone: string;
  taskMilestones: string[];
  taskModalType: ProgramTaskType | null;
  taskSource: ProgramTaskSource;
  taskStartDate: string;
  taskTimelineWeek: number;
  taskTitle: string;
  taskTypeDefaults: Record<ProgramTaskType, { title: string; detail: string }>;
  taskUnlockRule: string;
};

export function ProgramTaskModal({ ctx }: { ctx: ProgramTaskModalContext }) {
  const {
    closeTaskModal,
    editingTaskId,
    saveProgramTask,
    selectedProg,
    setTaskDescription,
    setTaskDetail,
    setTaskDriveUrl,
    setTaskDueDate,
    setTaskFileName,
    setTaskMilestone,
    setTaskSource,
    setTaskStartDate,
    setTaskTimelineWeek,
    setTaskTitle,
    setTaskUnlockRule,
    taskDescription,
    taskDetail,
    taskDriveUrl,
    taskDueDate,
    taskFileName,
    taskMilestone,
    taskMilestones,
    taskModalType,
    taskSource,
    taskStartDate,
    taskTimelineWeek,
    taskTitle,
    taskTypeDefaults,
    taskUnlockRule,
  } = ctx;

  return (
    taskModalType && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(46,58,21,0.42)", backdropFilter: "blur(4px)" }}
        onClick={closeTaskModal}
      >
        <div
          className="w-full max-w-2xl rounded-2xl bg-white border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{ borderColor: P.border }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="flex items-start justify-between gap-4 p-5"
            style={{ borderBottom: `1px solid ${P.border}` }}
          >
            <div>
              <p className="text-base font-bold" style={{ color: P.text }}>
                {editingTaskId ? "Edit" : "Add"} {taskModalType}
              </p>
              <p className="text-xs mt-0.5" style={{ color: P.textMuted }}>
                Upload content, place it on the program timeline, then save it to {selectedProg}.
              </p>
            </div>
            <button
              onClick={closeTaskModal}
              className="p-1.5 rounded-lg"
              style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ["device", Upload, "Device upload"],
                  ["gdrive", Link, "Google Drive"],
                ] as [ProgramTaskSource, React.ElementType, string][]
              ).map(([source, Icon, label]) => (
                <button
                  key={source}
                  onClick={() => {
                    setTaskSource(source);
                    if (source === "device") setTaskDriveUrl("");
                    else setTaskFileName("");
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold"
                  style={
                    taskSource === source
                      ? {
                          background: P.lightSage,
                          color: P.darkOlive,
                          border: `1px solid ${P.olive}`,
                        }
                      : { background: "white", color: P.textMid, border: `1px solid ${P.border}` }
                  }
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>

            {taskSource === "device" ? (
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: P.border, background: P.bg }}
              >
                <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                  Upload {taskModalType} File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept={
                    taskModalType === "Video"
                      ? ".mp4,.mov,.avi,.webm"
                      : taskModalType === "Reading"
                        ? ".pdf,.doc,.docx,.ppt,.pptx,.txt"
                        : ".xlsx,.csv,.json,.doc,.docx,.pdf"
                  }
                  onChange={(e) => setTaskFileName(e.target.files?.[0]?.name ?? "")}
                  className="w-full text-xs"
                  style={{ color: P.textMid }}
                />
                {taskFileName && (
                  <p className="text-[11px] mt-2 font-medium" style={{ color: P.olive }}>
                    Selected: {taskFileName}
                  </p>
                )}
              </div>
            ) : (
              <div
                className="rounded-xl border p-4 space-y-3"
                style={{ borderColor: P.border, background: P.bg }}
              >
                <div className="flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold" style={{ color: P.textMid }}>
                    Google Drive File URL <span className="text-red-500">*</span>
                  </label>
                  <button
                    onClick={() =>
                      window.open("https://drive.google.com", "_blank", "noopener,noreferrer")
                    }
                    className="text-[11px] font-semibold"
                    style={{ color: P.olive }}
                  >
                    Open Drive
                  </button>
                </div>
                <input
                  value={taskDriveUrl}
                  onChange={(e) => setTaskDriveUrl(e.target.value)}
                  placeholder="Paste a Google Drive share link..."
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder={
                    taskModalType === "Video"
                      ? "e.g. Leadership kickoff video"
                      : taskModalType === "Reading"
                        ? "e.g. Strategy reading pack"
                        : "e.g. Module knowledge check"
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  {taskModalType === "Video"
                    ? "Duration"
                    : taskModalType === "Reading"
                      ? "Pages"
                      : "Questions"}
                </label>
                <input
                  value={taskDetail}
                  onChange={(e) => setTaskDetail(e.target.value)}
                  placeholder={taskTypeDefaults[taskModalType].detail}
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Program
                </label>
                <input
                  value={selectedProg}
                  readOnly
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                />
              </div>
            </div>

            <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: P.border }}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold" style={{ color: P.text }}>
                    Program Timeline Schedule
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: P.textMuted }}>
                    Set when this task becomes available and when it is due.
                  </p>
                </div>
                <Badge label={`Week ${taskTimelineWeek || 1}`} variant="sage" />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Timeline Week
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={taskTimelineWeek}
                    onChange={(e) => setTaskTimelineWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={taskStartDate}
                    onChange={(e) => setTaskStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Milestone
                  </label>
                  <select
                    value={taskMilestone}
                    onChange={(e) => setTaskMilestone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {taskMilestones.map((milestone) => (
                      <option key={milestone}>{milestone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Availability Rule
                  </label>
                  <select
                    value={taskUnlockRule}
                    onChange={(e) => setTaskUnlockRule(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {[
                      "Available at program start",
                      "Unlock after previous task completion",
                      "Unlock after required readings",
                      "Unlock after quiz pass",
                      "Manual release by HR",
                    ].map((rule) => (
                      <option key={rule}>{rule}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <Textarea
              label="Description"
              value={taskDescription}
              onChange={setTaskDescription}
              placeholder="Optional instructions learners should see with this task..."
              rows={3}
            />
          </div>

          <div
            className="flex justify-end gap-2 p-5"
            style={{ borderTop: `1px solid ${P.border}`, background: P.bg }}
          >
            <button
              onClick={closeTaskModal}
              className="px-4 py-2 rounded-lg text-xs font-semibold"
              style={{ border: `1px solid ${P.border}`, color: P.textMid, background: "white" }}
            >
              Cancel
            </button>
            <button
              onClick={saveProgramTask}
              disabled={
                !taskTitle.trim() ||
                !taskStartDate ||
                !taskDueDate ||
                (taskSource === "device" ? !taskFileName : !taskDriveUrl.trim())
              }
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{
                background:
                  !taskTitle.trim() ||
                  !taskStartDate ||
                  !taskDueDate ||
                  (taskSource === "device" ? !taskFileName : !taskDriveUrl.trim())
                    ? P.sage
                    : P.olive,
                opacity:
                  !taskTitle.trim() ||
                  !taskStartDate ||
                  !taskDueDate ||
                  (taskSource === "device" ? !taskFileName : !taskDriveUrl.trim())
                    ? 0.65
                    : 1,
              }}
            >
              {editingTaskId ? "Update Task" : "Save Task"}
            </button>
          </div>
        </div>
      </div>
    )
  );
}
