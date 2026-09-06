import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  Layers,
  Loader2,
  RefreshCw,
  Target,
  User,
  X,
} from "lucide-react";
import { Badge, P, PageHeader, Textarea } from "./extended.shared";
import {
  coursePublishingApi,
  type CoursePreview,
  type PendingReviewItem,
} from "../../API/coursePublishing.api";

// ─── Types ────────────────────────────────────────────────────────────────────

type DisplayItem = {
  instanceId: number;
  title: string;
  courseVersionId: number | null;
  creator: string;
  submittedDate: string;
  instanceStatus: string;   // raw: PENDING | APPROVED | REJECTED | CHANGES_REQUESTED
  courseStatus: string;     // raw: DRAFT | PUBLISHED | ARCHIVED
  displayStatus: "In Review" | "Approved" | "Rejected" | "Changes Requested";
  latestComment: string | null;
  decisions: Array<{ status: string; comment: string | null; decidedAt: string; stepOrder: number }>;
  workflowName: string;
  workflowSteps: Array<{ approvalOrder: number; roleName: string | null }>;
};

function toDisplayItem(item: PendingReviewItem): DisplayItem {
  let displayStatus: DisplayItem["displayStatus"] = "In Review";
  if (item.status === "APPROVED")               displayStatus = "Approved";
  else if (item.status === "REJECTED")          displayStatus = "Rejected";
  else if (item.status === "CHANGES_REQUESTED") displayStatus = "Changes Requested";

  const decisions = (item.decisions ?? []).map((d: any) => ({
    status:    d.status,
    comment:   d.comment ?? null,
    decidedAt: d.decidedAt,
    stepOrder: d.workflowStep?.approvalOrder ?? 0,
  }));

  const workflowSteps = ((item as any).workflow?.steps ?? []).map((s: any) => ({
    approvalOrder: s.approvalOrder,
    roleName:      s.approverRole?.name ?? null,
  }));

  return {
    instanceId:       item.id,
    title:            item.courseVersion?.course.title ?? "Untitled Course",
    courseVersionId:  item.courseVersion?.id ?? null,
    creator:
      item.submittedByUser?.email ??
      item.courseVersion?.createdByUser?.email ??
      "Unknown creator",
    submittedDate: item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : "—",
    instanceStatus:   item.status,
    courseStatus:     item.courseVersion?.status ?? "DRAFT",
    displayStatus,
    latestComment:    decisions[0]?.comment ?? item.latestComment ?? null,
    decisions,
    workflowName:     (item as any).workflow?.name ?? "",
    workflowSteps,
  };
}

const STATUS_FILTERS = [
  { key: "In Review",        label: "Pending",           icon: Target,      color: P.gold,    bg: P.goldLight },
  { key: "Approved",         label: "Accepted",          icon: CheckCircle, color: "#5A7A2A", bg: "#D8EDCC"   },
  { key: "Rejected",         label: "Rejected",          icon: X,           color: "#C0392B", bg: "#FEE2E2"   },
  { key: "Changes Requested",label: "Changes Requested", icon: FileText,    color: "#B45309", bg: "#FEF3C7"   },
] as const;

// ─── Step progress indicator ──────────────────────────────────────────────────

function StepProgress({ item }: { item: DisplayItem }) {
  if (item.workflowSteps.length === 0) return null;
  const approvedOrders = new Set(
    item.decisions.filter(d => d.status === "APPROVED").map(d => d.stepOrder)
  );

  return (
    <div className="flex items-center gap-1 mt-2 flex-wrap">
      {item.workflowSteps.map((step, i) => {
        const done  = approvedOrders.has(step.approvalOrder);
        const current =
          !done &&
          item.instanceStatus === "PENDING" &&
          !item.workflowSteps
            .slice(0, i)
            .some(s => !approvedOrders.has(s.approvalOrder));

        return (
          <React.Fragment key={step.approvalOrder}>
            {i > 0 && <ChevronRight size={10} style={{ color: P.textMuted }} />}
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{
                background: done ? "#D8EDCC" : current ? P.goldLight : P.bg,
                color:      done ? "#5A7A2A" : current ? P.gold       : P.textMuted,
                border:     `1px solid ${done ? "#A8D08D" : current ? P.gold : P.border}`,
              }}
            >
              {done ? "✓ " : current ? "● " : "○ "}
              Step {step.approvalOrder}{step.roleName ? `: ${step.roleName}` : ""}
            </span>
          </React.Fragment>
        );
      })}
      {item.courseStatus === "PUBLISHED" && (
        <>
          <ChevronRight size={10} style={{ color: P.textMuted }} />
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: "#D8EDCC", color: "#5A7A2A", border: "1px solid #A8D08D" }}>
            ✓ Published
          </span>
        </>
      )}
    </div>
  );
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function CourseDetailDrawer({
  item,
  onApprove,
  onReject,
  onRequestChanges,
  onClose,
  actionLoading,
  autoOpenPreview = false,
}: {
  item: DisplayItem;
  /** Approve — the optional argument is feedback to attach to the decision. */
  onApprove: (comment?: string) => void;
  /** Reject — feedback used to prefill the rejection reason. */
  onReject:  (feedback?: string) => void;
  /** Request changes — feedback used to prefill the change-request comment. */
  onRequestChanges: (feedback?: string) => void;
  onClose: () => void;
  actionLoading: boolean;
  /** True when opened via a notification deep link — expand content immediately. */
  autoOpenPreview?: boolean;
}) {
  const isPending = item.instanceStatus === "PENDING" || item.instanceStatus === "CHANGES_REQUESTED";
  // Inline feedback for the creator. Fed into the Approve / Request Changes /
  // Reject dialogs so the approver can attach a comment without losing it.
  const [feedback, setFeedback] = useState("");

  // ── Inline course preview ────────────────────────────────────────────────
  const [previewOpen, setPreviewOpen] = useState(false);
  const [preview, setPreview] = useState<CoursePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const loadPreview = async () => {
    if (!item.courseVersionId) return;
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const data = await coursePublishingApi.getCoursePreview(item.courseVersionId);
      setPreview(data);
      setPreviewOpen(true);
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Failed to load course content.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const togglePreview = () => {
    if (!previewOpen && !preview) {
      void loadPreview();
    } else {
      setPreviewOpen(v => !v);
    }
  };

  const totalItems = preview?.chapters.reduce((sum, ch) => sum + ch.contentItems.length, 0) ?? 0;

  // Auto-load and expand the course content when the drawer was opened from a
  // notification deep link — the approver lands here to review content, so it
  // should be visible immediately instead of requiring an extra click.
  // (loadPreview sets previewOpen on success; on failure the error + Retry UI shows.)
  useEffect(() => {
    if (autoOpenPreview && item.courseVersionId) void loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: P.border }}>
          <h2 className="text-base font-bold" style={{ color: P.text }}>{item.title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100" style={{ color: P.textMid }}>
            <X size={16} />
          </button>
        </div>

        {/* Meta */}
        <div className="px-5 py-4 space-y-3 border-b" style={{ borderColor: P.border }}>
          <div className="flex flex-wrap gap-3 text-xs" style={{ color: P.textMuted }}>
            <span className="flex items-center gap-1"><User size={12} />{item.creator}</span>
            <span className="flex items-center gap-1"><Calendar size={12} />Submitted {item.submittedDate}</span>
            <span className="flex items-center gap-1"><Building size={12} />Instance #{item.instanceId}</span>
          </div>

          {item.workflowName && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: P.textMuted }}>
                Workflow: {item.workflowName}
              </p>
              <StepProgress item={item} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full"
              style={{ background: item.courseStatus === "PUBLISHED" ? "#D8EDCC" : P.goldLight, color: item.courseStatus === "PUBLISHED" ? "#5A7A2A" : P.gold }}>
              Course: {item.courseStatus}
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full" style={{ background: P.bg, color: P.textMid }}>
              Workflow: {item.instanceStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* ── Course content preview (inline, expandable) ── */}
        {item.courseVersionId && (
          <div className="border-b" style={{ borderColor: P.border }}>
            <button
              onClick={togglePreview}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen size={15} style={{ color: P.olive }} />
                <span className="text-xs font-semibold" style={{ color: P.text }}>Course Content</span>
                {preview && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: P.lightSage, color: P.olive }}>
                    {preview.chapters.length} chapter{preview.chapters.length !== 1 ? "s" : ""} · {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {previewLoading && <Loader2 size={13} className="animate-spin" style={{ color: P.textMuted }} />}
                {previewOpen ? <ChevronUp size={14} style={{ color: P.textMuted }} /> : <ChevronDown size={14} style={{ color: P.textMuted }} />}
              </div>
            </button>

            {previewError && (
              <div className="mx-5 mb-3 text-xs rounded-lg px-3 py-2 text-red-700 bg-red-50 flex items-center gap-1.5">
                <AlertCircle size={12} />
                {previewError}
                <button onClick={() => void loadPreview()} className="ml-auto underline">Retry</button>
              </div>
            )}

            {previewOpen && preview && (
              <div className="px-5 pb-4 space-y-3">
                {/* Course description */}
                {preview.course.description && (
                  <p className="text-xs leading-relaxed" style={{ color: P.textMid }}>
                    {preview.course.description}
                  </p>
                )}

                {/* Meta row */}
                <div className="flex flex-wrap gap-2">
                  {preview.course.category && (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: P.bg, color: P.textMid }}>
                      {preview.course.category.name}
                    </span>
                  )}
                  {preview.difficultyLevel && (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: P.bg, color: P.textMid }}>
                      {preview.difficultyLevel.name}
                    </span>
                  )}
                  {preview.estimatedDurationMinutes && (
                    <span className="text-[10px] px-2 py-0.5 rounded flex items-center gap-1" style={{ background: P.bg, color: P.textMid }}>
                      <Clock size={9} /> {preview.estimatedDurationMinutes} min
                    </span>
                  )}
                  {preview.instructors.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: P.bg, color: P.textMid }}>
                      Instructor: {preview.instructors[0]?.employee?.fullName ?? "—"}
                    </span>
                  )}
                </div>

                {/* Chapters */}
                {preview.chapters.length === 0 ? (
                  <p className="text-xs italic" style={{ color: P.textMuted }}>No chapters added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {preview.chapters.map((ch, ci) => (
                      <div key={ch.id} className="rounded-lg border overflow-hidden" style={{ borderColor: P.border }}>
                        {/* Chapter header */}
                        <div className="flex items-center gap-2 px-3 py-2" style={{ background: P.paleGreen }}>
                          <Layers size={13} style={{ color: P.olive }} />
                          <span className="text-xs font-semibold flex-1" style={{ color: P.text }}>
                            {ci + 1}. {ch.title}
                          </span>
                          <span className="text-[10px]" style={{ color: P.textMuted }}>
                            {ch.contentItems.length} item{ch.contentItems.length !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Content items */}
                        {ch.contentItems.length > 0 && (
                          <div className="divide-y" style={{ borderColor: P.border }}>
                            {ch.contentItems.map((ci2, ii) => (
                              <div key={ci2.id} className="flex items-center gap-2 px-3 py-2">
                                <FileText size={11} style={{ color: P.textMuted }} />
                                <span className="text-[11px] flex-1 truncate" style={{ color: P.textMid }}>
                                  {ci2.title}
                                </span>
                                {ci2.contentType && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                                    style={{ background: P.bg, color: P.textMuted }}>
                                    {ci2.contentType.name}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pass threshold */}
                {Number(preview.completionThreshold) > 0 && (
                  <p className="text-[11px]" style={{ color: P.textMuted }}>
                    Completion threshold: {Number(preview.completionThreshold)}% ·
                    Required score: {Number(preview.requiredAssessmentScore)}%
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Decision history */}
        {item.decisions.length > 0 && (
          <div className="px-5 py-4 border-b" style={{ borderColor: P.border }}>
            <p className="text-xs font-semibold mb-3" style={{ color: P.text }}>Decision History</p>
            <div className="space-y-2">
              {item.decisions.map((d, i) => (
                <div key={i} className="rounded-lg p-3 text-xs" style={{ background: P.bg, border: `1px solid ${P.border}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold"
                      style={{ color: d.status === "APPROVED" ? "#5A7A2A" : d.status === "REJECTED" ? "#C0392B" : P.gold }}>
                      Step {d.stepOrder}: {d.status.replace(/_/g, " ")}
                    </span>
                    <span style={{ color: P.textMuted }}>{new Date(d.decidedAt).toLocaleDateString()}</span>
                  </div>
                  {d.comment && <p className="italic" style={{ color: P.textMid }}>&ldquo;{d.comment}&rdquo;</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback — comment area for the creator */}
        <div className="px-5 py-4 border-b space-y-2" style={{ borderColor: P.border }}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold" style={{ color: P.text }}>Feedback</p>
            {item.latestComment && (
              <span className="text-[10px] uppercase tracking-wide" style={{ color: P.textMuted }}>
                Latest
              </span>
            )}
          </div>

          {item.latestComment ? (
            <p className="text-xs italic rounded-lg p-3" style={{ background: P.bg, border: `1px solid ${P.border}`, color: P.textMid }}>
              &ldquo;{item.latestComment}&rdquo;
            </p>
          ) : (
            isPending && (
              <p className="text-xs" style={{ color: P.textMuted }}>
                No feedback yet — add a note the creator will see with your decision.
              </p>
            )
          )}

          {isPending ? (
            <>
              <Textarea
                label=""
                placeholder="Provide feedback for the course creator…"
                rows={3}
                value={feedback}
                onChange={setFeedback}
              />
              {feedback.trim() && (
                <p className="text-[10px]" style={{ color: P.textMuted }}>
                  Your note will be attached to the {item.displayStatus === "Changes Requested" ? "resubmission" : "decision"} and included in the creator's notification.
                </p>
              )}
            </>
          ) : (
            <p className="text-xs" style={{ color: P.textMuted }}>
              This submission is already {item.displayStatus.toLowerCase()} — the creator was notified of the outcome.
            </p>
          )}
        </div>

        <div className="flex-1" />

        {/* Action buttons */}
        {isPending && (
          <div className="px-5 py-4 border-t flex flex-wrap gap-2" style={{ borderColor: P.border }}>
            <button onClick={() => onApprove(feedback.trim() || undefined)} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "#5A7A2A" }}>
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              Approve
            </button>
            <button onClick={() => onRequestChanges(feedback.trim())} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
              style={{ background: "#FEF3C7", color: "#B45309" }}>
              <FileText size={13} />
              Request Changes
            </button>
            <button onClick={() => onReject(feedback.trim())} disabled={actionLoading}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60"
              style={{ background: "#FEE2E2", color: "#C0392B" }}>
              <X size={13} />
              Reject
            </button>
          </div>
        )}

        {!isPending && (
          <div className="px-5 py-4 border-t text-center text-xs" style={{ borderColor: P.border, color: P.textMuted }}>
            {item.displayStatus === "Approved"
              ? item.courseStatus === "PUBLISHED"
                ? "✅ This course is now live and visible to learners."
                : "✅ This step approved — waiting for remaining approvers."
              : item.displayStatus === "Rejected"
              ? "❌ This submission was rejected. Creator has been notified."
              : "⚠️ Changes requested. Creator has been notified."}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HRPublishingScreen({
  navigate,
  deepLinkCourseVersionId,
}: {
  navigate: (s: string) => void;
  /** courseVersionId extracted from a notification deep link (may be null). */
  deepLinkCourseVersionId?: string | null;
}) {
  const [filter, setFilter] = useState<DisplayItem["displayStatus"]>("In Review");
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<DisplayItem | null>(null);
  // True when the drawer was opened via a notification deep link (auto-expands
  // the course content preview); false for manual card clicks.
  const [detailAutoPreview, setDetailAutoPreview] = useState(false);

  // Reject modal
  const [rejectModal, setRejectModal]   = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Request-changes modal
  const [changesModal, setChangesModal]     = useState<number | null>(null);
  const [changesComment, setChangesComment] = useState("");
  const [approveModal, setApproveModal] = useState<number | null>(null);
  const [approveComment, setApproveComment] = useState("");

  // ── Load ──────────────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await coursePublishingApi.listPending();
      setItems(data.map(toDisplayItem));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load publishing requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // ── Notification deep link ────────────────────────────────────────────────
  // Approver notifications link to /?screen=hr-publishing&courseVersionId=X.
  // Auto-open the detail drawer for the matching request once the list loads,
  // so the approver lands directly on the course they were asked to review.
  const deepLinkOpenedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!deepLinkCourseVersionId || deepLinkOpenedRef.current === deepLinkCourseVersionId) return;
    const match = items.find((i) => String(i.courseVersionId) === deepLinkCourseVersionId);
    if (match) {
      deepLinkOpenedRef.current = deepLinkCourseVersionId;
      setFilter(match.displayStatus);
      setDetailAutoPreview(true);
      setDetailItem(match);
    }
  }, [deepLinkCourseVersionId, items]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleApprove = async (instanceId: number, comment?: string) => {
    setActionLoading(instanceId);
    try {
      const result = await coursePublishingApi.approve(instanceId, comment?.trim() || undefined);
      // Immediately reload so the step progress and course status reflect
      // the latest DB state (PUBLISHED if final step, or PENDING for next step).
      await load();
      setDetailItem(null);
      setApproveModal(null);
      setApproveComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal);
    try {
      await coursePublishingApi.reject(rejectModal, rejectReason.trim());
      await load();
      setDetailItem(null);
      setRejectModal(null);
      setRejectReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject course.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestChanges = async () => {
    if (!changesModal || !changesComment.trim()) return;
    setActionLoading(changesModal);
    try {
      await coursePublishingApi.requestChanges(changesModal, changesComment.trim());
      await load();
      setDetailItem(null);
      setChangesModal(null);
      setChangesComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request changes.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const visible = items.filter(item => item.displayStatus === filter);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Publishing Requests"
        sub="Review course submissions — approve, reject, or request changes based on the approval workflow"
      />

      {/* Status filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_FILTERS.map(({ key, label, icon: Icon, color, bg }) => (
          <div
            key={key}
            onClick={() => setFilter(key)}
            className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all"
            style={{
              borderColor: filter === key ? P.olive : P.border,
              background:  filter === key ? P.paleGreen : "white",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>{label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}>
              {items.filter(item => item.displayStatus === key).length}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: P.textMuted }}>
          {visible.length} {filter.toLowerCase()} request{visible.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold"
          style={{ borderColor: P.border, color: P.textMid }}
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={15} />
          {error}
          <button className="ml-auto underline text-xs" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-2" style={{ color: P.textMuted }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading publishing requests…</span>
        </div>
      )}

      {/* Cards */}
      {!loading && (
        <div className="space-y-3">
          {visible.map(item => (
            <div
              key={item.instanceId}
              className="bg-white rounded-xl border p-5 cursor-pointer hover:shadow-md transition-all"
              style={{ borderColor: P.border }}
              onClick={() => {
                setDetailAutoPreview(false);
                setDetailItem(item);
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${P.olive}14` }}>
                  <BookOpen size={22} style={{ color: P.olive }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: P.text }}>{item.title}</p>
                    <Badge
                      label={item.displayStatus === "Approved" ? "Accepted" : item.displayStatus === "Changes Requested" ? "Changes Req." : item.displayStatus}
                      variant={item.displayStatus === "Approved" ? "green" : item.displayStatus === "In Review" ? "gold" : item.displayStatus === "Changes Requested" ? "gold" : "red"}
                    />
                    {item.courseStatus === "PUBLISHED" && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#D8EDCC", color: "#5A7A2A" }}>
                        LIVE
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px]" style={{ color: P.textMuted }}>
                    <span className="flex items-center gap-1"><User size={11} />{item.creator}</span>
                    <span className="flex items-center gap-1"><Calendar size={11} />Submitted {item.submittedDate}</span>
                    {item.workflowName && <span className="flex items-center gap-1"><Building size={11} />{item.workflowName}</span>}
                  </div>

                  <StepProgress item={item} />

                  {item.latestComment && (
                    <p className="mt-2 text-[11px] rounded-lg px-3 py-2 italic" style={{ background: P.bg, color: P.textMid }}>
                      &ldquo;{item.latestComment}&rdquo;
                    </p>
                  )}
                </div>

                {/* Quick action for pending items */}
                {(item.instanceStatus === "PENDING" || item.instanceStatus === "CHANGES_REQUESTED") && (
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setApproveModal(item.instanceId); setApproveComment(""); }}
                      disabled={actionLoading === item.instanceId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                      style={{ background: "#5A7A2A" }}
                    >
                      {actionLoading === item.instanceId ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
                      Approve
                    </button>
                    <button
                      onClick={() => { setChangesModal(item.instanceId); setChangesComment(""); }}
                      disabled={actionLoading === item.instanceId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                      style={{ background: "#FEF3C7", color: "#B45309" }}
                    >
                      <FileText size={11} />
                      Changes
                    </button>
                    <button
                      onClick={() => { setRejectModal(item.instanceId); setRejectReason(""); }}
                      disabled={actionLoading === item.instanceId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60"
                      style={{ background: "#FEE2E2", color: "#C0392B" }}
                    >
                      <X size={11} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {visible.length === 0 && !error && (
            <div className="rounded-xl border bg-white p-8 text-center text-sm" style={{ borderColor: P.border, color: P.textMuted }}>
              <Clock size={32} className="mx-auto mb-3 opacity-30" />
              No {filter.toLowerCase()} publishing requests.
            </div>
          )}
        </div>
      )}

      {/* Detail drawer */}
      {detailItem && (
        <CourseDetailDrawer
          item={detailItem}
          actionLoading={actionLoading !== null}
          autoOpenPreview={detailAutoPreview}
          onApprove={(comment) => { setApproveModal(detailItem.instanceId); setApproveComment(comment ?? ""); }}
          onReject={(feedback) => { setRejectModal(detailItem.instanceId); setRejectReason(feedback ?? ""); }}
          onRequestChanges={(feedback) => { setChangesModal(detailItem.instanceId); setChangesComment(feedback ?? ""); }}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* Approve modal with optional feedback */}
      {approveModal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(46,58,21,0.7)" }} onClick={() => { setApproveModal(null); setApproveComment(""); }}>
          <div className="bg-white rounded-2xl border p-6 max-w-md w-full" style={{ borderColor: P.border }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-1" style={{ color: P.text }}>Approve Course Submission</h3>
            <p className="text-xs mb-4" style={{ color: P.textMuted }}>Publishing will notify the creator. You can add optional feedback that the creator will see in their course list.</p>
            <Textarea label="Feedback (optional)" placeholder="Add a note for the course creator…" rows={3} value={approveComment} onChange={setApproveComment} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setApproveModal(null); setApproveComment(""); }} className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
              <button onClick={() => void handleApprove(approveModal, approveComment)} disabled={actionLoading !== null} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white disabled:opacity-60"
                style={{ background: "#5A7A2A" }}>
                {actionLoading !== null && <Loader2 size={13} className="animate-spin" />}
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(46,58,21,0.7)" }} onClick={() => { setRejectModal(null); setRejectReason(""); }}>
          <div className="bg-white rounded-2xl border p-6 max-w-md w-full" style={{ borderColor: P.border }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-1" style={{ color: P.text }}>Reject Course Submission</h3>
            <p className="text-xs mb-4" style={{ color: P.textMuted }}>The course creator will be notified with your feedback.</p>
            <Textarea label="Rejection Reason" placeholder="Explain what needs to be revised…" rows={4} required value={rejectReason} onChange={setRejectReason} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setRejectModal(null); setRejectReason(""); }} className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
              <button onClick={() => void handleReject()} disabled={!rejectReason.trim() || actionLoading !== null} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: rejectReason.trim() ? "#C0392B" : "#E5E7EB", color: rejectReason.trim() ? "white" : P.textMuted }}>
                {actionLoading !== null && <Loader2 size={13} className="animate-spin" />}
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request-changes modal */}
      {changesModal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(46,58,21,0.7)" }} onClick={() => { setChangesModal(null); setChangesComment(""); }}>
          <div className="bg-white rounded-2xl border p-6 max-w-md w-full" style={{ borderColor: P.border }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-1" style={{ color: P.text }}>Request Changes</h3>
            <p className="text-xs mb-4" style={{ color: P.textMuted }}>Creator will be notified and can resubmit after changes.</p>
            <Textarea label="Changes Required" placeholder="Describe what needs to be updated…" rows={4} required value={changesComment} onChange={setChangesComment} />
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setChangesModal(null); setChangesComment(""); }} className="flex-1 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${P.border}`, color: P.textMid }}>Cancel</button>
              <button onClick={() => void handleRequestChanges()} disabled={!changesComment.trim() || actionLoading !== null} className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{ background: changesComment.trim() ? P.olive : "#E5E7EB", color: changesComment.trim() ? "white" : P.textMuted }}>
                {actionLoading !== null && <Loader2 size={13} className="animate-spin" />}
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
