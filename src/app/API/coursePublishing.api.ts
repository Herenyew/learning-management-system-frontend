import { apiRequest } from "./httpClient";

const B = "/courses";

// ─── Response shapes ──────────────────────────────────────────────────────────

export type SubmitNewDraftResult = {
  courseId: number;
  courseVersionId: number;
  instanceId: number | null;
  notifiedReviewerCount: number;
  workflowConfigured: boolean;
  message: string;
};

export type SubmitForReviewResult = {
  courseVersionId: number;
  instanceId: number;
  status: string;
  message: string;
};

export type ReviewActionResult = {
  instanceId: number;
  status: string;
  message: string;
};

export type PendingReviewItem = {
  id: number;
  status: string;
  submittedAt: string | null;
  latestComment: string | null;
  submittedByUser: { id: number; email: string } | null;
  courseVersion: {
    id: number;
    status: string;
    approvalStatus: string;
    course: { id: number; title: string };
    createdByUser: { id: number; email: string };
  } | null;
  decisions: Array<{
    status: string;
    comment: string | null;
    decidedAt: string;
  }>;
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const coursePublishingApi = {
  /** Create a course draft on the backend and trigger the approval workflow. */
  submitNewDraft: (input: { title: string; description?: string }) =>
    apiRequest<SubmitNewDraftResult>(`${B}/versions/submit-new-draft`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Submit an existing course version for review. */
  submitForReview: (courseVersionId: number, comment?: string) =>
    apiRequest<SubmitForReviewResult>(
      `${B}/versions/${courseVersionId}/submit-for-review`,
      {
        method: "POST",
        body: JSON.stringify({ comment }),
      },
    ),

  /** List all pending review instances visible to the current approver. */
  listPending: (signal?: AbortSignal) =>
    apiRequest<PendingReviewItem[]>(`${B}/publishing/pending`, { signal }),

  /** Approve a course submission instance. */
  approve: (instanceId: number, comment?: string) =>
    apiRequest<ReviewActionResult>(
      `${B}/publishing/instances/${instanceId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ comment }),
      },
    ),

  /** Reject a course submission instance — comment is required. */
  reject: (instanceId: number, comment: string) =>
    apiRequest<ReviewActionResult>(
      `${B}/publishing/instances/${instanceId}/reject`,
      {
        method: "POST",
        body: JSON.stringify({ comment }),
      },
    ),

  /** Request changes on a course submission instance — comment is required. */
  requestChanges: (instanceId: number, comment: string) =>
    apiRequest<ReviewActionResult>(
      `${B}/publishing/instances/${instanceId}/request-changes`,
      {
        method: "POST",
        body: JSON.stringify({ comment }),
      },
    ),
};
