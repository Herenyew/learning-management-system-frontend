import React, { useEffect, useState } from "react";
import { liveSessionAttendanceApi } from "../../API/liveSessionAttendance.api";
import type {
  AttendanceRoster,
  AttendanceStatus,
  LearnerLiveSession,
} from "../../models/attendance.model";
import { usePermission } from "../../hooks/usePermission";
import { Permissions } from "../../constants/permission.constant";
import {
  AICard,
  ASSIGNMENTS,
  ASSIGNMENT_COURSES,
  ASSIGNMENT_EXPECTED_SUBMISSIONS,
  ASSIGNMENT_TYPE_LABELS,
  AlertCircle,
  Archive,
  Area,
  AreaChart,
  Av,
  Award,
  Bar,
  BarChart2,
  BookOpen,
  Building,
  CALENDAR_EVENTS,
  Calendar,
  CartesianGrid,
  Cell,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Chip,
  Clock,
  Copy,
  Cpu,
  DEFAULT_QUESTION_TYPE_CONFIG,
  Download,
  EFFECTIVENESS_DATA,
  EFFECTIVENESS_TREND,
  EMPTY_ASSIGNMENT_DRAFT,
  EMPTY_SURVEY_DRAFT,
  Edit,
  Eye,
  FileText,
  Filter,
  Flag,
  Globe,
  HelpCircle,
  LIVE_SESSIONS,
  Layers,
  Line,
  LineChart,
  Link,
  Lock,
  MessageSquare,
  MoreHorizontal,
  P,
  PBar,
  PROGRAM_TYPES,
  PageHeader,
  Pie,
  PieChart,
  Play,
  Plus,
  PlusCircle,
  QUESTION_BANK,
  QUESTION_TYPE_OPTIONS,
  ReBarChart,
  RefreshCw,
  ResponsiveContainer,
  SURVEYS,
  SURVEY_COURSES,
  SURVEY_QUESTION_SETS,
  SURVEY_TOTALS_BY_COURSE,
  Search,
  Send,
  Settings,
  Share2,
  Shield,
  Sparkles,
  Star,
  StatCard,
  Target,
  ThumbsDown,
  ThumbsUp,
  Tooltip,
  Trash2,
  TrendingDown,
  TrendingUp,
  Upload,
  User,
  UserCheck,
  Users,
  Video,
  X,
  XAxis,
  YAxis,
  Zap,
  canAddQuestionBankCustomTypes,
  formatAssignmentDueDate,
  getConfiguredQuestionBankTypes,
  getSurveyQuestionSet,
  questionTypeLabel,
  questionTypeVariant,
} from "./training.shared";
import type {
  Assignment,
  AssignmentDraft,
  AssignmentStatus,
  AssignmentSubmission,
  AssignmentSubmissionType,
  QuestionBankQuestion,
  QuestionBankType,
  QuestionTypeConfig,
  QuestionTypeOption,
  Survey,
  SurveyDraft,
  SurveyQuestion,
  SurveyQuestionSet,
  SurveyQuestionType,
  SurveySubmission,
} from "./training.shared";

export function LiveSessionsScreen({ navigate }: { navigate: (s: string) => void }) {
  const can = usePermission();
  const canFinalizeAttendance = can(Permissions.ATTENDANCE_FINALIZE, Permissions.ATTENDANCE_MANAGE);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState("All");
  const [sessionFormat, setSessionFormat] = useState<"Virtual" | "In-Person" | "Hybrid">("Virtual");
  const [runtimeSessions, setRuntimeSessions] = useState<LearnerLiveSession[]>([]);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [challengeInputs, setChallengeInputs] = useState<Record<number, string>>({});
  const [generatedChallenge, setGeneratedChallenge] = useState<Record<number, string>>({});
  const [attendanceRoster, setAttendanceRoster] = useState<AttendanceRoster | null>(null);
  const [attendanceDraft, setAttendanceDraft] = useState<Record<number, AttendanceStatus>>({});
  const [attendancePercentages, setAttendancePercentages] = useState<Record<number, string>>({});

  const loadRuntimeSessions = async (signal?: AbortSignal) => {
    try {
      setRuntimeSessions(await liveSessionAttendanceApi.listMine(signal));
      setRuntimeError(null);
    } catch (error) {
      if (!signal?.aborted)
        setRuntimeError(error instanceof Error ? error.message : "Unable to load live sessions.");
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void loadRuntimeSessions(controller.signal);
    return () => controller.abort();
  }, []);

  const generateChallenge = async (sessionId: number) => {
    try {
      const result = await liveSessionAttendanceApi.createChallenge(sessionId);
      setGeneratedChallenge((current) => ({ ...current, [sessionId]: result.challenge }));
      setRuntimeError(null);
    } catch (error) {
      setRuntimeError(
        error instanceof Error ? error.message : "Unable to generate a check-in challenge.",
      );
    }
  };

  const checkIn = async (sessionId: number) => {
    try {
      await liveSessionAttendanceApi.checkIn(sessionId, challengeInputs[sessionId] ?? "");
      await loadRuntimeSessions();
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : "Unable to check in.");
    }
  };

  const openAttendance = async (sessionId: number) => {
    try {
      const roster = await liveSessionAttendanceApi.roster(sessionId);
      setAttendanceRoster(roster);
      setAttendanceDraft(
        Object.fromEntries(
          roster.enrollments.map((item) => [
            item.id,
            item.liveSessionAttendances[0]?.attendanceStatus ?? "NO_SHOW",
          ]),
        ),
      );
      setAttendancePercentages(
        Object.fromEntries(
          roster.enrollments.map((item) => [
            item.id,
            String(item.liveSessionAttendances[0]?.attendancePercentage ?? ""),
          ]),
        ),
      );
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : "Unable to load attendance roster.");
    }
  };

  const finalizeAttendance = async () => {
    if (!attendanceRoster) return;
    try {
      await liveSessionAttendanceApi.finalize(
        attendanceRoster.session.id,
        attendanceRoster.enrollments.map((item) => ({
          enrollmentId: item.id,
          attendanceStatus: attendanceDraft[item.id] ?? "NO_SHOW",
          ...(["LATE", "PARTIAL"].includes(attendanceDraft[item.id])
            ? { attendancePercentage: Number(attendancePercentages[item.id]) }
            : {}),
        })),
      );
      setAttendanceRoster(null);
      await loadRuntimeSessions();
    } catch (error) {
      setRuntimeError(error instanceof Error ? error.message : "Unable to finalize attendance.");
    }
  };

  const filtered = LIVE_SESSIONS.filter((s) => filter === "All" || s.status === filter);

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Live & ILT Sessions"
        sub="Schedule and manage instructor-led training and virtual sessions"
        actions={
          <button
            onClick={() => {
              setSessionFormat("Virtual");
              setShowCreate(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> Schedule Session
          </button>
        }
      />

      <section className="rounded-xl border bg-white p-5" style={{ borderColor: P.border }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold" style={{ color: P.text }}>
              Runtime sessions & attendance
            </h2>
            <p className="text-xs" style={{ color: P.textMuted }}>
              Server-authoritative check-in and attendance finalization
            </p>
          </div>
          <Chip label={`${runtimeSessions.length} sessions`} variant="sage" />
        </div>
        {runtimeError && (
          <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {runtimeError}
          </div>
        )}
        {runtimeSessions.length === 0 ? (
          <p className="text-sm" style={{ color: P.textMuted }}>
            No live sessions are linked to your active course enrollments.
          </p>
        ) : (
          <div className="space-y-3">
            {runtimeSessions.map((session) => {
              const attendance = session.attendees[0];
              return (
                <div
                  key={session.id}
                  className="rounded-lg border p-4"
                  style={{ borderColor: P.border }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {session.title}
                      </p>
                      <p className="text-xs" style={{ color: P.textMuted }}>
                        {session.courseVersion.course.title} ·{" "}
                        {new Date(session.startTime).toLocaleString()} · {session.timezone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Chip
                        label={session.status}
                        variant={session.status === "COMPLETED" ? "green" : "sage"}
                      />
                      {attendance && <Chip label={attendance.attendanceStatus} variant="gold" />}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.meetingUrl && session.status !== "CANCELLED" && (
                      <a
                        href={session.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border px-3 py-2 text-xs font-semibold"
                        style={{ borderColor: P.border, color: P.olive }}
                      >
                        Join meeting
                      </a>
                    )}
                    {!attendance?.checkInTime && ["SCHEDULED", "LIVE"].includes(session.status) && (
                      <>
                        <input
                          value={challengeInputs[session.id] ?? ""}
                          onChange={(event) =>
                            setChallengeInputs((current) => ({
                              ...current,
                              [session.id]: event.target.value,
                            }))
                          }
                          className="min-w-[260px] flex-1 rounded-lg border px-3 py-2 text-xs"
                          style={{ borderColor: P.border }}
                          placeholder="Paste instructor check-in challenge"
                        />
                        <button
                          type="button"
                          onClick={() => void checkIn(session.id)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
                          style={{ background: P.olive }}
                        >
                          Check in
                        </button>
                      </>
                    )}
                    {canFinalizeAttendance && (
                      <button
                        type="button"
                        onClick={() => void generateChallenge(session.id)}
                        className="rounded-lg border px-3 py-2 text-xs font-semibold"
                        style={{ borderColor: P.border, color: P.textMid }}
                      >
                        Generate challenge
                      </button>
                    )}
                    {canFinalizeAttendance && (
                      <button
                        type="button"
                        onClick={() => void openAttendance(session.id)}
                        className="rounded-lg border px-3 py-2 text-xs font-semibold"
                        style={{ borderColor: P.border, color: P.textMid }}
                      >
                        Attendance roster
                      </button>
                    )}
                  </div>
                  {generatedChallenge[session.id] && (
                    <textarea
                      readOnly
                      value={generatedChallenge[session.id]}
                      rows={2}
                      className="mt-3 w-full rounded-lg border p-2 text-[10px]"
                      style={{ borderColor: P.border }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {attendanceRoster && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setAttendanceRoster(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold" style={{ color: P.text }}>
                  Finalize attendance
                </h2>
                <p className="text-xs" style={{ color: P.textMuted }}>
                  {attendanceRoster.session.title}
                </p>
              </div>
              <button type="button" onClick={() => setAttendanceRoster(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="space-y-2">
              {attendanceRoster.enrollments.map((item) => {
                const status = attendanceDraft[item.id] ?? "NO_SHOW";
                return (
                  <div
                    key={item.id}
                    className="grid items-center gap-2 rounded-lg border p-3 md:grid-cols-[1fr_150px_120px]"
                    style={{ borderColor: P.border }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {item.employee.fullName}
                      </p>
                      <p className="text-[10px]" style={{ color: P.textMuted }}>
                        {item.employee.id}
                      </p>
                    </div>
                    <select
                      value={status}
                      onChange={(event) =>
                        setAttendanceDraft((current) => ({
                          ...current,
                          [item.id]: event.target.value as AttendanceStatus,
                        }))
                      }
                      className="rounded-lg border px-2 py-2 text-xs"
                      style={{ borderColor: P.border }}
                    >
                      {["PRESENT", "ABSENT", "LATE", "PARTIAL", "NO_SHOW"].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                    {["LATE", "PARTIAL"].includes(status) ? (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={attendancePercentages[item.id] ?? ""}
                        onChange={(event) =>
                          setAttendancePercentages((current) => ({
                            ...current,
                            [item.id]: event.target.value,
                          }))
                        }
                        className="rounded-lg border px-2 py-2 text-xs"
                        style={{ borderColor: P.border }}
                        placeholder="Percent"
                      />
                    ) : (
                      <span className="text-xs" style={{ color: P.textMuted }}>
                        {status === "PRESENT" ? "100%" : "0%"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAttendanceRoster(null)}
                className="rounded-lg border px-4 py-2 text-xs"
                style={{ borderColor: P.border }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void finalizeAttendance()}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-white"
                style={{ background: P.olive }}
              >
                Finalize roster
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Upcoming Sessions"
          value="3"
          icon={Calendar}
          color={P.olive}
          bg={P.lightSage}
        />
        <StatCard
          label="Total Enrolled"
          value="79"
          sub="Of 100 capacity"
          icon={Users}
          color="#5A7A2A"
          bg="#D8EDCC"
        />
        <StatCard
          label="On Waitlist"
          value="11"
          sub="Across 2 sessions"
          icon={Clock}
          color={P.gold}
          bg={P.goldLight}
        />
        <StatCard
          label="Conflict Alerts"
          value="1"
          sub="Resolve now"
          icon={AlertCircle}
          color="#C0392B"
          bg="#FEE2E2"
          trend="down"
        />
      </div>

      <div className="flex gap-2">
        {["All", "Upcoming", "Full", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={
              filter === f
                ? { background: P.olive, color: "white" }
                : { background: "white", border: `1px solid ${P.border}`, color: P.textMid }
            }
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl border p-5"
            style={{ borderColor: session.conflict ? "#FECACA" : P.border }}
          >
            {session.conflict && (
              <div
                className="flex items-center gap-2 mb-3 p-2.5 rounded-lg"
                style={{ background: "#FEF2F2" }}
              >
                <AlertCircle size={13} style={{ color: "#C0392B" }} />
                <p className="text-xs font-semibold" style={{ color: "#C0392B" }}>
                  ⚠ Conflict detected — a learner is double-booked for this session
                </p>
              </div>
            )}
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: session.format === "Virtual" ? P.lightSage : P.goldLight }}
              >
                {session.format === "Virtual" ? (
                  <Video size={20} style={{ color: P.olive }} />
                ) : (
                  <Users size={20} style={{ color: P.gold }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {session.title}
                  </p>
                  <Chip
                    label={session.status}
                    variant={
                      session.status === "Upcoming"
                        ? "sage"
                        : session.status === "Full"
                          ? "red"
                          : "neutral"
                    }
                  />
                  <Chip label={session.format} variant="blue" />
                </div>
                <div
                  className="flex flex-wrap gap-3 text-[11px] mb-2"
                  style={{ color: P.textMuted }}
                >
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {session.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {session.time} · {session.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {session.instructor}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={11} />
                    {session.enrolled}/{session.capacity} enrolled
                  </span>
                  {session.waitlist > 0 && (
                    <span style={{ color: P.gold }}>+{session.waitlist} on waitlist</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-40">
                    <PBar
                      value={(session.enrolled / session.capacity) * 100}
                      color={session.enrolled >= session.capacity ? "#C0392B" : P.olive}
                      height={4}
                    />
                  </div>
                  <span className="text-[10px]" style={{ color: P.textMuted }}>
                    {Math.round((session.enrolled / session.capacity) * 100)}% capacity
                  </span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {session.joinUrl && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-xs font-semibold"
                    style={{ background: "#5A7A2A" }}
                    data-prototype-action="true"
                  >
                    <Play size={12} /> Join
                  </button>
                )}
                {session.recordingUrl && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: P.goldLight, color: "#8A6A1A" }}
                    data-prototype-action="true"
                  >
                    <Video size={12} /> Recording
                  </button>
                )}
                {session.waitlist > 0 && (
                  <button
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"
                    style={{ border: `1px solid ${P.border}`, color: P.textMid }}
                    data-prototype-action="true"
                  >
                    <Users size={12} /> Waitlist ({session.waitlist})
                  </button>
                )}
                <button
                  className="p-2 rounded-lg"
                  style={{ border: `1px solid ${P.border}` }}
                  data-prototype-action="true"
                >
                  <MoreHorizontal size={14} style={{ color: P.textMuted }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.75)" }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="bg-white rounded-2xl border p-6 max-w-lg w-full space-y-4"
            style={{ borderColor: P.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold" style={{ color: P.text }}>
              Schedule Training Session
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Session Title <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  placeholder="e.g. Leadership Workshop Q1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Time
                  </label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Format
                  </label>
                  <select
                    value={sessionFormat}
                    onChange={(e) =>
                      setSessionFormat(e.target.value as "Virtual" | "In-Person" | "Hybrid")
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    <option>Virtual</option>
                    <option>In-Person</option>
                    <option>Hybrid</option>
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Capacity
                  </label>
                  <input
                    type="number"
                    defaultValue="30"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>
              {sessionFormat !== "In-Person" && (
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Join URL
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                    placeholder="https://zoom.us/j/…"
                  />
                </div>
              )}
              {sessionFormat !== "Virtual" && (
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Location / Room
                  </label>
                  <input
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                    placeholder="e.g. HQ Training Room 2, Floor 4"
                  />
                </div>
              )}
              <div
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ background: P.bg }}
              >
                <div>
                  <p className="text-xs font-medium" style={{ color: P.textMid }}>
                    Enable Waitlist
                  </p>
                  <p className="text-[10px]" style={{ color: P.textMuted }}>
                    Auto-enroll when a spot opens
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  style={{ accentColor: P.olive, width: 16, height: 16 }}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: P.olive }}
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. QUESTION BANK
// ─────────────────────────────────────────────────────────────
