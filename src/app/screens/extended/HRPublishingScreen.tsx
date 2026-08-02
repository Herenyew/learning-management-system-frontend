import React, { useState } from "react";
import {
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Target,
  User,
  X,
} from "lucide-react";
import { Badge, P, PUBLISHING_QUEUE, PageHeader, Textarea } from "./extended.shared";

export function HRPublishingScreen({ navigate }: { navigate: (s: string) => void }) {
  const [filter, setFilter] = useState("In Review");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [requests, setRequests] = useState(() =>
    PUBLISHING_QUEUE.map((request) => ({ ...request })),
  );

  const reviewFilters = [
    ["In Review", "Pending", Target, P.gold, P.goldLight],
    ["Approved", "Accepted", CheckCircle, "#5A7A2A", "#D8EDCC"],
    ["Rejected", "Rejected", X, "#C0392B", "#FEE2E2"],
  ] as const;
  const visibleRequests = requests.filter((request) => request.status === filter);

  const acceptRequest = (requestId: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === requestId ? { ...request, status: "Approved" } : request,
      ),
    );
  };

  const rejectRequest = () => {
    if (!rejectModal || !rejectionReason.trim()) return;
    setRequests((current) =>
      current.map((request) =>
        request.id === rejectModal ? { ...request, status: "Rejected" } : request,
      ),
    );
    setRejectModal(null);
    setRejectionReason("");
  };

  return (
    <div className="p-6 space-y-5 max-w-[1300px]">
      <PageHeader
        title="Publishing Requests"
        sub="Accept or reject course publishing requests submitted by course creators"
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {reviewFilters.map(([status, label, Icon, color, bg]) => (
          <div
            key={status}
            onClick={() => setFilter(status)}
            className="bg-white rounded-xl border p-4 cursor-pointer hover:shadow-md transition-all"
            style={{
              borderColor: filter === status ? P.olive : P.border,
              background: filter === status ? P.paleGreen : "white",
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
              {requests.filter((request) => request.status === status).length}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {visibleRequests.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl border p-5"
            style={{ borderColor: P.border }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${P.olive}14` }}
              >
                <BookOpen size={22} style={{ color: P.olive }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold" style={{ color: P.text }}>
                    {course.title}
                  </p>
                  <Badge
                    label={course.status === "Approved" ? "Accepted" : course.status}
                    variant={
                      course.status === "Approved"
                        ? "green"
                        : course.status === "In Review"
                          ? "gold"
                          : "red"
                    }
                  />
                  <Badge
                    label={course.risk + " Risk"}
                    variant={
                      course.risk === "Low" ? "green" : course.risk === "Medium" ? "gold" : "red"
                    }
                  />
                </div>
                <div
                  className="flex flex-wrap items-center gap-3 text-[11px]"
                  style={{ color: P.textMuted }}
                >
                  <span className="flex items-center gap-1">
                    <User size={11} />
                    {course.creator}
                  </span>
                  <span className="flex items-center gap-1">
                    <Building size={11} />
                    {course.dept}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen size={11} />
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={11} />
                    {course.lessons} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    Submitted {course.submittedDate}
                  </span>
                </div>
              </div>
              {course.status === "In Review" && (
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => acceptRequest(course.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                    style={{ background: "#5A7A2A" }}
                  >
                    <CheckCircle size={12} /> Accept
                  </button>
                  <button
                    onClick={() => setRejectModal(course.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold"
                    style={{ background: "#FEE2E2", color: "#C0392B" }}
                  >
                    <X size={12} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {visibleRequests.length === 0 && (
          <div
            className="rounded-xl border bg-white p-8 text-center text-sm"
            style={{ borderColor: P.border, color: P.textMuted }}
          >
            No {filter.toLowerCase()} publishing requests.
          </div>
        )}
      </div>

      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{ background: "rgba(46,58,21,0.7)" }}
          onClick={() => {
            setRejectModal(null);
            setRejectionReason("");
          }}
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
              value={rejectionReason}
              onChange={setRejectionReason}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectionReason("");
                }}
                className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ border: `1px solid ${P.border}`, color: P.textMid }}
              >
                Cancel
              </button>
              <button
                onClick={rejectRequest}
                disabled={!rejectionReason.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: rejectionReason.trim() ? "#C0392B" : "#E5E7EB",
                  color: rejectionReason.trim() ? "white" : P.textMuted,
                }}
              >
                Send Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. HR CONTENT MODERATION
// ─────────────────────────────────────────────────────────────
