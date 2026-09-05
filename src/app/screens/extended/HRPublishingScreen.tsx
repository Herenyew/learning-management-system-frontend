import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Target,
  User,
  X,
} from "lucide-react";
import { Badge, P, PageHeader, Textarea } from "./extended.shared";
import {
  coursePublishingApi,
  type PendingReviewItem,
} from "../../API/coursePublishing.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DisplayItem = {
  instanceId: number;
  title: string;
  creator: string;
  submittedDate: string;
  status: "In Review" | "Approved" | "Rejected" | "Changes Requested";
  latestComment: string | null;
};

function toDisplayItem(item: PendingReviewItem): DisplayItem {
  const lastDecision = item.decisions[0];
  let status: DisplayItem["status"] = "In Review";
  if (item.status === "APPROVED")          status = "Approved";
  else if (item.status === "REJECTED")     status = "Rejected";
  else if (item.status === "CHANGES_REQUESTED") status = "Changes Requested";

  return {
    instanceId: item.id,
    title: item.courseVersion?.course.title ?? "Untitled Course",
    creator:
      item.submittedByUser?.email ??
      item.courseVersion?.createdByUser?.email ??
      "Unknown creator",
    submittedDate: item.submittedAt
      ? new Date(item.submittedAt).toLocaleDateString()
      : "—",
    status,
    latestComment: lastDecision?.comment ?? item.latestComment ?? null,
  };
}

const STATUS_FILTERS = [
  {
    key: "In Review",
    label: "Pending",
    icon: Target,
    color: P.gold,
    bg: P.goldLight,
  },
  {
    key: "Approved",
    label: "Accepted",
    icon: CheckCircle,
    color: "#5A7A2A",
    bg: "#D8EDCC",
  },
  {
    key: "Rejected",
    label: "Rejected",
    icon: X,
    color: "#C0392B",
    bg: "#FEE2E2",
  },
  {
    key: "Changes Requested",
    label: "Changes Requested",
    icon: FileText,
    color: "#B45309",
    bg: "#FEF3C7",
  },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function HRPublishingScreen({ navigate }: { navigate: (s: string) => void }) {
  const [filter, setFilter] = useState<DisplayItem["status"]>("In Review");
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // instanceId being actioned

  // Reject modal
  const [rejectModal, setRejectModal] = useState<number | null>(null); // instanceId
  const [rejectReason, setRejectReason] = useState("");

  // Request-changes modal
  const [changesModal, setChangesModal] = useState<number | null>(null);
  const [changesComment, setChangesComment] = useState("");

  // ── Load pending reviews ───────────────────────────────────────────────────

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

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleApprove = async (instanceId: number) => {
    setActionLoading(instanceId);
    try {
      await coursePublishingApi.approve(instanceId);
      setItems((prev) =>
        prev.map((item) =>
          item.instanceId === instanceId ? { ...item, status: "Approved" } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve course.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal);
    try {
      await coursePublishingApi.reject(rejectModal, rejectReason.trim());
      setItems((prev) =>
        prev.map((item) =>
          item.instanceId === rejectModal ? { ...item, status: "Rejected", latestComment: rejectReason.trim() } : item,
        ),
      );
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
      setItems((prev) =>
        prev.map((item) =>
          item.instanceId === changesModal
            ? { ...item, status: "Changes Requested", latestComment: changesComment.trim() }
            : item,
        ),
      );
      setChangesModal(null);
      setChangesComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to request changes.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const visible = items.filter((item) => item.status === filter);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Publishing Requests"
        sub="Accept or reject course publishing requests submitted by course creators"
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
              background: filter === key ? P.paleGreen : "white",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-medium" style={{ color: P.textMuted }}>
                {label}
              </p>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={13} style={{ color }} />
              </div>
            </div>
            <p
              className="text-2xl font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", color: P.text }}
            >
              {items.filter((item) => item.status === key).length}
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

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-center gap-2">
          <AlertCircle size={15} />
          {error}
          <button className="ml-auto underline text-xs" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex items-center justify-center py-12 gap-2" style={{ color: P.textMuted }}>
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading publishing requests…</span>
        </div>
      )}

      {/* Request cards */}
      {!loading && (
        <div className="space-y-3">
          {visible.map((item) => (
            <div
              key={item.instanceId}
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: P.border }}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${P.olive}14` }}
                >
                  <BookOpen size={22} style={{ color: P.olive }} />
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: P.text }}>
                      {item.title}
                    </p>
                    <Badge
                      label={
                        item.status === "Approved"
                          ? "Accepted"
                          : item.status === "Changes Requested"
                            ? "Changes Req."
                            : item.status
                      }
                      variant={
                        item.status === "Approved"
                          ? "green"
                          : item.status === "In Review"
                            ? "gold"
                            : item.status === "Changes Requested"
                              ? "gold"
                              : "red"
                      }
                    />
                  </div>

                  <div
                    className="flex flex-wrap items-center gap-3 text-[11px]"
                    style={{ color: P.textMuted }}
                  >
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {item.creator}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      Submitted {item.submittedDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building size={11} />
                      Instance #{item.instanceId}
                    </span>
                  </div>

                  {item.latestComment && (
                    <p
                      className="mt-2 text-[11px] rounded-lg px-3 py-2 italic"
                      style={{ background: P.bg, color: P.textMid }}
                    >
                      &ldquo;{item.latestComment}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions — only for pending items */}
                {item.status === "In Review" && (
                  <div className="flex gap-2 flex-shrink-0 flex-wrap justify-end">
                    <button
                      onClick={() => void handleApprove(item.instanceId)}
                      disabled={actionLoading === item.instanceId}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-60"
                      style={{ background: "#5A7A2A" }}
                    >
                      {actionLoading === item.instanceId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => { setChangesModal(item.instanceId); setChangesComment(""); }}
                      disabled={actionLoading === item.instanceId}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
                      style={{ background: "#FEF3C7", color: "#B45309" }}
                    >
                      <FileText size={12} />
                      Request Changes
                    </button>
                    <button
                      onClick={() => { setRejectModal(item.instanceId); setRejectReason(""); }}
                      disabled={actionLoading === item.instanceId}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
                      style={{ background: "#FEE2E2", color: "#C0392B" }}
                    >
                      <X size={12} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {visible.length === 0 && !error && (
            <div
              className="rounded-xl border bg-white p-8 text-center text-sm"
              style={{ borderColor: P.border, color: P.textMuted }}
            >
              <Clock size={32} className="mx-auto mb-3 opacity-30" />
              No {filter.toLowerCase()} publishing requests.
            </div>
          )}
        </div>
      )}

      {/* ── Reject modal ─────────────────────────────────────────────────── */}
      {rejectModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.7)" }}
          onClick={() => { setRejectModal(null); setRejectReason(""); }}
        >
          <div
            className="bg-white rounded-2xl border p-6 max-w-md w-full"
            style={{ borderColor: P.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: P.text }}>
              Reject Course Submission
            </h3>
            <p className="text-xs mb-4" style={{ color: P.textMuted }}>
              The course creator will be notified with your feedback.
            </p>
            <Textarea
              label="Rejection Reason"
              placeholder="Explain what needs to be revised before resubmission…"
              rows={4}
              required
              value={rejectReason}
              onChange={setRejectReason}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleReject()}
                disabled={!rejectReason.trim() || actionLoading !== null}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  background: rejectReason.trim() ? "#C0392B" : "#E5E7EB",
                  color: rejectReason.trim() ? "white" : P.textMuted,
                }}
              >
                {actionLoading !== null && <Loader2 size={13} className="animate-spin" />}
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Request changes modal ─────────────────────────────────────────── */}
      {changesModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.7)" }}
          onClick={() => { setChangesModal(null); setChangesComment(""); }}
        >
          <div
            className="bg-white rounded-2xl border p-6 max-w-md w-full"
            style={{ borderColor: P.border }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold mb-1" style={{ color: P.text }}>
              Request Changes
            </h3>
            <p className="text-xs mb-4" style={{ color: P.textMuted }}>
              The course creator will be notified and can resubmit after making changes.
            </p>
            <Textarea
              label="Changes Required"
              placeholder="Describe what needs to be updated before this course can be approved…"
              rows={4}
              required
              value={changesComment}
              onChange={setChangesComment}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setChangesModal(null); setChangesComment(""); }}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={() => void handleRequestChanges()}
                disabled={!changesComment.trim() || actionLoading !== null}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                style={{
                  background: changesComment.trim() ? P.olive : "#E5E7EB",
                  color: changesComment.trim() ? "white" : P.textMuted,
                }}
              >
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
