import React, { useState } from "react";
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

export function AssignmentsScreen({ navigate }: { navigate: (s: string) => void }) {
  const [filter, setFilter] = useState("All");
  const [assignments, setAssignments] = useState<Assignment[]>(ASSIGNMENTS);
  const [showEditor, setShowEditor] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentDraft, setAssignmentDraft] = useState<AssignmentDraft>(EMPTY_ASSIGNMENT_DRAFT);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);

  const filtered = assignments.filter((a) => filter === "All" || a.status === filter);
  const selectedAssignment =
    assignments.find((assignment) => assignment.id === selectedAssignmentId) ?? null;
  const activeAssignments = assignments.filter((assignment) => assignment.status === "Active");
  const submittedCount = assignments.reduce((sum, assignment) => sum + assignment.submitted, 0);
  const expectedCount = assignments.reduce((sum, assignment) => sum + assignment.total, 0);
  const overdueCount = assignments.reduce((sum, assignment) => sum + assignment.overdue, 0);
  const pendingPeerReviews = assignments.reduce(
    (sum, assignment) =>
      sum +
      (assignment.peerReview
        ? assignment.submissions.filter(
            (submission) => submission.reviewStatus === "Pending review",
          ).length
        : 0),
    0,
  );

  const openCreateAssignment = () => {
    setEditingAssignmentId(null);
    setAssignmentDraft({ ...EMPTY_ASSIGNMENT_DRAFT });
    setShowEditor(true);
  };

  const openEditAssignment = (assignment: Assignment) => {
    setEditingAssignmentId(assignment.id);
    setAssignmentDraft({
      title: assignment.title,
      course: assignment.course,
      submissionType: assignment.submissionType,
      dueDate: assignment.dueDate,
      peerReview: assignment.peerReview,
    });
    setShowEditor(true);
  };

  const saveAssignment = () => {
    if (!assignmentDraft.title.trim() || !assignmentDraft.dueDate) return;

    if (editingAssignmentId) {
      setAssignments((current) =>
        current.map((assignment) =>
          assignment.id === editingAssignmentId
            ? {
                ...assignment,
                title: assignmentDraft.title.trim(),
                course: assignmentDraft.course,
                submissionType: assignmentDraft.submissionType,
                dueDate: assignmentDraft.dueDate,
                peerReview: assignmentDraft.peerReview,
              }
            : assignment,
        ),
      );
    } else {
      const expectedSubmissions = ASSIGNMENT_EXPECTED_SUBMISSIONS[assignmentDraft.course] ?? 0;

      setAssignments((current) => [
        {
          id: `assignment-${Date.now()}`,
          title: assignmentDraft.title.trim(),
          course: assignmentDraft.course,
          submissionType: assignmentDraft.submissionType,
          dueDate: assignmentDraft.dueDate,
          peerReview: assignmentDraft.peerReview,
          submitted: 0,
          total: expectedSubmissions,
          overdue: 0,
          status: "Active",
          submissions: [],
        },
        ...current,
      ]);
    }

    setShowEditor(false);
    setEditingAssignmentId(null);
    setAssignmentDraft({ ...EMPTY_ASSIGNMENT_DRAFT });
  };

  return (
    <div className="p-6 space-y-5 max-w-[1200px]">
      <PageHeader
        title="Assignments"
        sub="Track learner submissions, peer reviews, and overdue tasks"
        actions={
          <button
            onClick={openCreateAssignment}
            className="flex items-center gap-1.5 px-3 py-2 text-white rounded-lg text-sm font-semibold"
            style={{ background: P.olive }}
          >
            <Plus size={14} /> Create Assignment
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active Assignments"
          value={String(activeAssignments.length)}
          icon={FileText}
          color={P.olive}
          bg={P.lightSage}
        />
        <StatCard
          label="Total Submissions"
          value={String(submittedCount)}
          sub={`Of ${expectedCount} expected`}
          icon={CheckCircle}
          color="#5A7A2A"
          bg="#D8EDCC"
        />
        <StatCard
          label="Overdue Submissions"
          value={String(overdueCount)}
          sub={overdueCount > 0 ? "Action needed" : "On track"}
          icon={AlertCircle}
          color="#C0392B"
          bg="#FEE2E2"
          trend="down"
        />
        <StatCard
          label="Pending Peer Reviews"
          value={String(pendingPeerReviews)}
          icon={Users}
          color={P.gold}
          bg={P.goldLight}
        />
      </div>

      <div className="flex gap-2">
        {["All", "Active", "Completed"].map((f) => (
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
        {filtered.map((a) => (
          <div
            key={a.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedAssignmentId(a.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setSelectedAssignmentId(a.id);
              }
            }}
            className="bg-white rounded-xl border p-5 cursor-pointer transition-shadow hover:shadow-sm"
            style={{ borderColor: a.overdue > 0 ? "#FECACA" : P.border }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: P.lightSage }}
              >
                <FileText size={18} style={{ color: P.olive }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {a.title}
                  </p>
                  <Chip label={ASSIGNMENT_TYPE_LABELS[a.submissionType]} variant="neutral" />
                  {a.peerReview && <Chip label="Peer Review" variant="blue" />}
                  {a.overdue > 0 && <Chip label={`${a.overdue} Overdue`} variant="red" />}
                </div>
                <p className="text-xs mb-3" style={{ color: P.textMuted }}>
                  Course: {a.course} · Due: {formatAssignmentDueDate(a.dueDate)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 max-w-xs">
                    <div
                      className="flex justify-between text-[10px] mb-1"
                      style={{ color: P.textMuted }}
                    >
                      <span>Submissions</span>
                      <span>
                        {a.submitted}/{a.total}
                      </span>
                    </div>
                    <PBar
                      value={a.total > 0 ? (a.submitted / a.total) * 100 : 0}
                      color={a.overdue > 0 ? "#C0392B" : "#5A7A2A"}
                      height={5}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedAssignmentId(a.id);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-semibold"
                  style={{ background: P.lightSage, color: P.olive }}
                >
                  View Submissions
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openEditAssignment(a);
                  }}
                  className="p-2 rounded-lg"
                  style={{ border: `1px solid ${P.border}` }}
                  aria-label={`Edit ${a.title}`}
                >
                  <Edit size={13} style={{ color: P.textMuted }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.72)" }}
          onClick={() => setShowEditor(false)}
        >
          <div
            className="bg-white rounded-2xl border w-full max-w-2xl"
            style={{ borderColor: P.border }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 p-5 border-b"
              style={{ borderColor: P.border }}
            >
              <div>
                <h3 className="text-base font-bold" style={{ color: P.text }}>
                  {editingAssignmentId ? "Edit Assignment" : "Create Assignment"}
                </h3>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  Configure submission type, due date, and peer review settings.
                </p>
              </div>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 rounded-lg"
                style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                aria-label="Close assignment form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: P.textMid }}>
                  Assignment Title <span className="text-red-500">*</span>
                </label>
                <input
                  value={assignmentDraft.title}
                  onChange={(event) =>
                    setAssignmentDraft((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                  style={{ border: `1px solid ${P.border}`, color: P.text }}
                  placeholder="e.g. AI Strategy Presentation"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Course
                  </label>
                  <select
                    value={assignmentDraft.course}
                    onChange={(event) =>
                      setAssignmentDraft((current) => ({
                        ...current,
                        course: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  >
                    {ASSIGNMENT_COURSES.map((course) => (
                      <option key={course}>{course}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: P.textMid }}
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={assignmentDraft.dueDate}
                    onChange={(event) =>
                      setAssignmentDraft((current) => ({
                        ...current,
                        dueDate: event.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg bg-white"
                    style={{ border: `1px solid ${P.border}`, color: P.text }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: P.textMid }}>
                  Submission Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["file", "text"] as AssignmentSubmissionType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setAssignmentDraft((current) => ({
                          ...current,
                          submissionType: type,
                        }))
                      }
                      className="text-left p-3 rounded-xl border"
                      style={{
                        borderColor: assignmentDraft.submissionType === type ? P.olive : P.border,
                        background: assignmentDraft.submissionType === type ? P.lightSage : "white",
                      }}
                    >
                      <p className="text-sm font-semibold" style={{ color: P.text }}>
                        {ASSIGNMENT_TYPE_LABELS[type]}
                      </p>
                      <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                        {type === "file"
                          ? "Learners upload documents, slides, or work files."
                          : "Learners write or paste their answer in the LMS."}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <label
                className="flex items-center justify-between gap-4 p-3 rounded-xl cursor-pointer"
                style={{ background: P.bg }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: P.text }}>
                    Enable Peer Review
                  </p>
                  <p className="text-xs" style={{ color: P.textMuted }}>
                    Learners can review assigned peer submissions after upload.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={assignmentDraft.peerReview}
                  onChange={(event) =>
                    setAssignmentDraft((current) => ({
                      ...current,
                      peerReview: event.target.checked,
                    }))
                  }
                  style={{ accentColor: P.olive, width: 18, height: 18 }}
                />
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 p-5 pt-0">
              <button
                onClick={() => setShowEditor(false)}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={saveAssignment}
                disabled={!assignmentDraft.title.trim() || !assignmentDraft.dueDate}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:cursor-not-allowed"
                style={{
                  background:
                    assignmentDraft.title.trim() && assignmentDraft.dueDate ? P.olive : P.sage,
                }}
              >
                {editingAssignmentId ? "Save Assignment" : "Create Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedAssignment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.72)" }}
          onClick={() => setSelectedAssignmentId(null)}
        >
          <div
            className="bg-white rounded-2xl border w-full max-w-4xl max-h-[86vh] overflow-y-auto"
            style={{ borderColor: P.border }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex items-start justify-between gap-4 p-5 border-b"
              style={{ borderColor: P.border }}
            >
              <div>
                <h3 className="text-base font-bold" style={{ color: P.text }}>
                  {selectedAssignment.title}
                </h3>
                <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                  {selectedAssignment.course} · Due{" "}
                  {formatAssignmentDueDate(selectedAssignment.dueDate)}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Chip
                    label={ASSIGNMENT_TYPE_LABELS[selectedAssignment.submissionType]}
                    variant="neutral"
                  />
                  {selectedAssignment.peerReview && <Chip label="Peer Review" variant="blue" />}
                  <Chip
                    label={`${selectedAssignment.submitted}/${selectedAssignment.total} submitted`}
                  />
                </div>
              </div>
              <button
                onClick={() => setSelectedAssignmentId(null)}
                className="p-2 rounded-lg"
                style={{ border: `1px solid ${P.border}`, color: P.textMuted }}
                aria-label="Close submissions"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                  label="Submitted"
                  value={String(selectedAssignment.submitted)}
                  icon={CheckCircle}
                  color="#5A7A2A"
                  bg="#D8EDCC"
                />
                <StatCard
                  label="Expected"
                  value={String(selectedAssignment.total)}
                  icon={Users}
                  color={P.olive}
                  bg={P.lightSage}
                />
                <StatCard
                  label="Overdue"
                  value={String(selectedAssignment.overdue)}
                  icon={AlertCircle}
                  color="#C0392B"
                  bg="#FEE2E2"
                />
                <StatCard
                  label="Peer Review"
                  value={selectedAssignment.peerReview ? "Enabled" : "Off"}
                  icon={UserCheck}
                  color={P.gold}
                  bg={P.goldLight}
                />
              </div>

              <div className="rounded-xl border overflow-hidden" style={{ borderColor: P.border }}>
                <div className="px-4 py-3 border-b" style={{ borderColor: P.border }}>
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    Available Submissions
                  </p>
                </div>

                {selectedAssignment.submissions.length === 0 ? (
                  <div className="p-5 text-sm" style={{ color: P.textMuted }}>
                    No learner submissions have been received for this assignment yet.
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: P.border }}>
                    {selectedAssignment.submissions.map((submission) => (
                      <div key={submission.id} className="p-4">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-3">
                          <Av initials={submission.initials} size={34} color={P.sage} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-bold" style={{ color: P.text }}>
                                {submission.learner}
                              </p>
                              <Chip label={submission.department} variant="sage" />
                              <Chip
                                label={submission.reviewStatus}
                                variant={
                                  submission.reviewStatus === "Needs revision"
                                    ? "red"
                                    : submission.reviewStatus === "Reviewed"
                                      ? "green"
                                      : "gold"
                                }
                              />
                              {typeof submission.score === "number" && (
                                <Chip label={`${submission.score}%`} variant="green" />
                              )}
                            </div>
                            <p className="text-xs mt-1" style={{ color: P.textMuted }}>
                              Submitted {submission.submittedAt} · {submission.artifact}
                            </p>
                            <p className="text-sm mt-2" style={{ color: P.textMid }}>
                              {submission.preview}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. SURVEYS & FEEDBACK
// ─────────────────────────────────────────────────────────────
