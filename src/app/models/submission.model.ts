export type ProgramTaskSubmission = {
  id: number;
  programEnrollmentId: number;
  programTaskId: number;
  submissionNo: number;
  submissionType: "TEXT_INPUT" | "LINK" | "FILE_UPLOAD" | "QUIZ" | "NONE";
  status: "PENDING" | "IN_PROGRESS" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED";
  textAnswer: string | null;
  submissionUrl: string | null;
  dueDate: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: number | null;
  score: number | null;
  reviewComment: string | null;
  completedAt: string | null;
  files: Array<{
    id: number;
    originalFileName: string;
    mimeType: string;
  }>;
  peerReviews: Array<{
    id: number;
    reviewerEmployeeId: string;
    reviewText: string | null;
    rating: number | null;
    reviewedAt: string;
  }>;
};

export type LearnerProgramTask = {
  id: number;
  title: string;
  description: string | null;
  displayOrder: number;
  phaseNumber: number | null;
  effectiveDueDate: string | null;
  maxSubmissions: number | null;
  allowResubmission: boolean;
  isRequired: boolean;
  isBlocking: boolean;
  isLocked: boolean;
  minimumScore: number | null;
  requiresManagerApproval: boolean;
  peerReviewRequired: boolean;
  requiredPeerReviewCount: number | null;
  courseVersionId: number | null;
  courseContentId: number | null;
  assessmentId: number | null;
  liveSessionId: number | null;
  surveyId: number | null;
  progress: {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "WAIVED";
    completedAt: string | null;
    waivedAt: string | null;
    waiverReason: string | null;
  } | null;
  taskType: {
    name: string;
    slug: string;
    expectedSubmissionType: "TEXT_INPUT" | "LINK" | "FILE_UPLOAD" | "QUIZ" | "NONE";
    linkedEntity: "COURSE_VERSION" | "COURSE_CONTENT" | "ASSESSMENT" | "LIVE_SESSION" | "SURVEY" | "NONE";
  };
  submissions: ProgramTaskSubmission[];
};

export type PeerReviewQueueItem = ProgramTaskSubmission & {
  employee: { id: string; fullName: string };
  programTask: {
    id: number;
    title: string;
    requiredPeerReviewCount: number | null;
    program: { id: number; name: string };
  };
};

export type SubmissionReviewQueueItem = ProgramTaskSubmission & {
  employee: { id: string; fullName: string };
  programTask: {
    id: number;
    title: string;
    minimumScore: number | null;
    program: { id: number; name: string };
  };
};
