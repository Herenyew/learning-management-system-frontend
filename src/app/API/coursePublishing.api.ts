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
  workflowId: number;
  workflowName: string;
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
    workflowStep?: { approvalOrder: number } | null;
  }>;
  /** Full workflow + step list — included so the UI can render step progress */
  workflow?: {
    name: string;
    steps: Array<{
      approvalOrder: number;
      approverRole?: { name: string } | null;
    }>;
  } | null;
};

export type WorkflowOption = {
  id: number;
  name: string;
  description: string | null;
  isDefault: boolean;
  entityType: string;
  steps: Array<{
    approvalOrder: number;
    approverRole?: { name: string } | null;
    approverEmployeeId?: string | null;
  }>;
};

export type CoursePreview = {
  id: number;
  status: string;
  approvalStatus: string;
  majorVersion: number;
  minorVersion: number;
  estimatedDurationMinutes: number | null;
  requiredAssessmentScore: number | string;
  completionThreshold: number | string;
  difficultyLevel: { name: string } | null;
  course: {
    id: number;
    title: string;
    description: string | null;
    status: string;
    category: { name: string } | null;
    createdByUser: { id: number; email: string };
  };
  chapters: Array<{
    id: number;
    title: string;
    displayOrder: number;
    contentItems: Array<{
      id: number;
      title: string;
      displayOrder: number;
      contentType: { name: string; category: string } | null;
    }>;
  }>;
  instructors: Array<{
    employee: { fullName: string } | null;
    isPrimary: boolean;
  }>;
};

export type MyCourseStatus = {
  id: number;
  status: string;
  approvalStatus: string;
  course: { id: number; title: string };
  approvalInstances: Array<{
    id: number;
    status: string;
    latestComment: string | null;
    decisions: Array<{ status: string; comment: string | null; decidedAt: string }>;
  }>;
};

// ─── API ──────────────────────────────────────────────────────────────────────

export const coursePublishingApi = {
  /** List all active COURSE_VERSION/COURSE workflows — for the selector dropdown. */
  listWorkflows: (signal?: AbortSignal) =>
    apiRequest<WorkflowOption[]>(`${B}/publishing/workflows`, { signal }),

  /** Get read-only course content preview for approvers. */
  getCoursePreview: (courseVersionId: number, signal?: AbortSignal) =>
    apiRequest<CoursePreview>(`${B}/versions/${courseVersionId}/preview`, { signal }),

  /** Creator fetches current approval/publish status for all their courses. */
  getMyCourseStatuses: (signal?: AbortSignal) =>
    apiRequest<MyCourseStatus[]>(`${B}/versions/my-courses`, { signal }),

  /** Create a course draft on the backend and trigger the approval workflow. */
  submitNewDraft: (input: { title: string; description?: string; workflowId?: number }) =>
    apiRequest<SubmitNewDraftResult>(`${B}/versions/submit-new-draft`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** Submit an existing course version for review. */
  submitForReview: (courseVersionId: number, comment?: string, workflowId?: number) =>
    apiRequest<SubmitForReviewResult>(
      `${B}/versions/${courseVersionId}/submit-for-review`,
      {
        method: "POST",
        body: JSON.stringify({ comment, workflowId }),
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
