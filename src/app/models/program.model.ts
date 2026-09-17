export type ProgramVisibility = "PUBLIC" | "COMPANY" | "ENROLLED_ONLY" | "INVITATION_ONLY";

export type LearningProgramStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type ProgramApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type ProgramApprovalInstanceStatus =
  | "NOT_SUBMITTED"
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "CANCELLED";
export type ProgramApprovalDecisionStatus = "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";

export type CreateProgramInput = {
  name: string;
  description?: string | null;
  programTypeId: number;
  programCategoryId?: number | null;
  ownerEmployeeId: string;
  visibility: ProgramVisibility;
  startDate?: string | null;
  endDate?: string | null;
  rollingEnrollment: boolean;
  maxEnrollments?: number | null;
};

export type UpdateProgramInput = Partial<CreateProgramInput>;
export type DuplicateProgramInput = { name?: string };
export type ApplyProgramTemplateInput = {
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  ownerEmployeeId?: string;
};
export type SaveProgramAsTemplateInput = {
  name: string;
  description?: string | null;
};

export type ProgramReference = {
  id: number;
  name: string;
  color?: string | null;
};

export type ProgramOwnerOption = {
  id: string;
  name: string;
  email: string;
};

export type ProgramEmployeeReference = {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
};

export type ProgramCounts = {
  courses: number;
  cohorts: number;
  enrollments: number;
  milestones: number;
  tasks: number;
  liveSessions: number;
  approvalInstances: number;
  programTagMappings: number;
};

export type Program = CreateProgramInput & {
  id: number;
  companyId?: number;
  description?: string | null;
  programCategoryId?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  maxEnrollments?: number | null;
  durationDays?: number | null;
  status: LearningProgramStatus;
  approvalStatus?: ProgramApprovalStatus | null;
  createdBy?: number;
  updatedBy?: number | null;
  createdAt?: string;
  updatedAt?: string;
  programType?: ProgramReference | null;
  programCategory?: ProgramReference | null;
  ownerEmployee?: ProgramEmployeeReference | null;
  owner?: ProgramEmployeeReference | null;
  _count?: ProgramCounts;
};

export type ProgramApprovalStep = {
  id: number;
  approvalOrder: number;
  approverRoleName?: string | null;
  approverEmployeeName?: string | null;
  isRequired: boolean;
  autoApprove: boolean;
};

export type ProgramApprovalReviewer = {
  id: string | number;
  email: string;
  name: string;
};

export type ProgramApprovalWorkflow = {
  id: number;
  name: string;
  steps: ProgramApprovalStep[];
  reviewers: ProgramApprovalReviewer[];
};

export type ProgramApprovalDecision = {
  workflowStepId: number;
  status: ProgramApprovalDecisionStatus;
  comment: string | null;
  decidedBy: number;
  decidedAt: string;
};

export type ProgramApprovalInstance = {
  id: number | null;
  status: ProgramApprovalInstanceStatus;
  submittedAt: string | null;
  completedAt: string | null;
  latestComment: string | null;
  decisions: ProgramApprovalDecision[];
};

export type ProgramApprovalRequirements = {
  program: {
    id: number;
    name: string;
    status: LearningProgramStatus;
    approvalStatus: ProgramApprovalStatus | null;
  };
  workflow: ProgramApprovalWorkflow | null;
  currentStep: number | null;
  instance: ProgramApprovalInstance;
  canReview: boolean;
  canSubmit: boolean;
};

export type ProgramApprovalActionResult = {
  learningProgramId?: number;
  instanceId: number;
  status: Exclude<ProgramApprovalInstanceStatus, "NOT_SUBMITTED" | "DRAFT">;
  currentStep?: number | null;
  message: string;
};

export type ProgramTargetAudience = {
  id: number;
  audienceGroupId: number;
  audienceGroup: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
  };
};

export type ReplaceProgramTargetAudiencesInput = { audienceGroupIds: number[] };

export type ProgramCohort = {
  id: number;
  programId: number;
  name: string;
  capacity: number | null;
  startDate: string | null;
  endDate: string | null;
  _count: { enrollments: number };
};
export type CreateProgramCohortInput = {
  name: string;
  capacity?: number | null;
  startDate?: string | null;
  endDate?: string | null;
};
export type UpdateProgramCohortInput = Partial<CreateProgramCohortInput>;

export type ProgramCohortRosterCourseEnrollment = {
  id: number;
  courseVersionId: number;
  status: string;
  courseVersion: {
    id: number;
    course: {
      id: number;
      code: string | null;
      title: string;
    };
  };
};

export type ProgramCohortRosterEnrollment = {
  id: number;
  employeeId: string;
  programId: number;
  cohortId: number;
  enrollmentStatus: string;
  progressPercentage: number;
  employee: {
    id: string;
    fullName: string;
    isActive: boolean;
  };
  enrollments: ProgramCohortRosterCourseEnrollment[];
};

export type ProgramCohortRuntimeProgram = {
  id: number;
  name: string;
  status: LearningProgramStatus;
  rollingEnrollment: boolean;
  maxEnrollments: number | null;
  startDate: string | null;
  endDate: string | null;
  durationDays: number | null;
};

export type ProgramCohortRuntimeCohort = {
  id: number;
  name: string;
  capacity: number | null;
  startDate: string | null;
  endDate: string | null;
};

export type ProgramCohortRoster = {
  program: ProgramCohortRuntimeProgram;
  cohort: ProgramCohortRuntimeCohort;
  enrollmentCount: number;
  enrollments: ProgramCohortRosterEnrollment[];
};

export type EnrollProgramCohortEmployeeInput = { employeeId: string };
export type BulkEnrollProgramCohortEmployeesInput = { employeeIds: string[] };

export type ProgramCohortEnrollmentResult = {
  enrollment: ProgramCohortRosterEnrollment;
  linkedCourseEnrollmentIds: number[];
};

export type ProgramCohortBulkEnrollmentOutcome = {
  employeeId: string;
  success?: boolean;
  status?: string;
  message?: string;
  error?: string;
  enrollment?: ProgramCohortRosterEnrollment;
  linkedCourseEnrollmentIds?: number[];
};

export type ProgramCohortBulkEnrollmentResult = {
  outcomes: ProgramCohortBulkEnrollmentOutcome[];
  summary: Record<string, number>;
};

export type ProgramCohortEnrollmentRemovalResult = {
  enrollmentId?: number;
  removed?: boolean;
  removedCourseEnrollmentIds?: number[];
  message?: string;
};

export type ProgramWaitlistStatus = "WAITING" | "OFFERED" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export type ProgramCohortWaitlistEntry = {
  id: number;
  companyId: number;
  programId: number;
  cohortId: number;
  employeeId: string;
  position: number;
  status: ProgramWaitlistStatus;
  offeredAt: string | null;
  offerExpiresAt: string | null;
  acceptedAt: string | null;
  expiredAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    fullName: string;
    isActive: boolean;
  };
};

export type ProgramCohortWaitlist = {
  program: ProgramCohortRuntimeProgram;
  cohort: ProgramCohortRuntimeCohort;
  activeCount: number;
  entries: ProgramCohortWaitlistEntry[];
};

export type JoinProgramCohortWaitlistInput = { employeeId: string };

export type ProgramCohortWaitlistJoinResult = {
  entry: ProgramCohortWaitlistEntry;
  settings: {
    waitlistSize: number;
    responseHours: number;
  };
};

export type ProgramCohortWaitlistProcessResult = {
  expired: number;
  offered: ProgramCohortWaitlistEntry | null;
};

export type ProgramCohortWaitlistAcceptResult = {
  entry: ProgramCohortWaitlistEntry;
  enrollment: ProgramCohortRosterEnrollment;
  linkedCourseEnrollmentIds: number[];
  idempotent: boolean;
};

export type ProgramCourseVersion = {
  id: number;
  majorVersion: number;
  minorVersion: number;
  versionLabel: string | null;
  status: string;
  approvalStatus: string;
  isCurrent: boolean;
  estimatedDurationMinutes: number | null;
  course: {
    id: number;
    code: string | null;
    title: string;
    thumbnailUrl: string | null;
    status: string;
  };
};
export type ProgramCourse = {
  id: number;
  programId: number;
  courseVersionId: number;
  displayOrder: number;
  phaseNumber: number;
  isRequired: boolean;
  courseVersion: ProgramCourseVersion;
};
export type CreateProgramCourseInput = {
  courseVersionId: number;
  displayOrder?: number;
  phaseNumber?: number;
  isRequired?: boolean;
};
export type UpdateProgramCourseInput = Partial<CreateProgramCourseInput>;
export type ProgramCompositionOrderInput = { orderedIds: number[] };
export type ProgramDeleteResult = { id: number; deleted: true };

export type ProgramTaskTypeReference = {
  id: number;
  name: string;
  slug: string;
  expectedSubmissionType: string;
  linkedEntity:
    | "COURSE_VERSION"
    | "COURSE_CONTENT"
    | "ASSESSMENT"
    | "LIVE_SESSION"
    | "SURVEY"
    | "NONE";
};
export type ProgramTask = {
  id: number;
  programId: number;
  title: string;
  description: string | null;
  taskTypeId: number;
  courseVersionId: number | null;
  courseContentId: number | null;
  assessmentId: number | null;
  liveSessionId: number | null;
  surveyId: number | null;
  maxSubmissions: number | null;
  allowResubmission: boolean;
  isRequired: boolean;
  isBlocking: boolean;
  displayOrder: number;
  phaseNumber: number | null;
  dueDate: string | null;
  dueOffsetDays: number | null;
  minimumTimeMinutes: number | null;
  minimumScore: number | string | null;
  minimumAttendance: number | string | null;
  requiresManagerApproval: boolean;
  peerReviewRequired: boolean;
  requiredPeerReviewCount: number | null;
  xpAward: number | null;
  createdAt: string;
  updatedAt: string;
  taskType: ProgramTaskTypeReference;
  courseVersion: {
    id: number;
    majorVersion: number;
    minorVersion: number;
    course: { id: number; title: string };
  } | null;
  courseContent: { id: number; title: string } | null;
  assessment: { id: number; title: string; status: string } | null;
  liveSession: {
    id: number;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
  } | null;
  survey: { id: number; title: string; status: string } | null;
  _count: { submissions: number };
};

export type ProgramTaskInput = {
  title: string;
  description?: string | null;
  taskTypeId: number;
  courseVersionId?: number | null;
  courseContentId?: number | null;
  assessmentId?: number | null;
  liveSessionId?: number | null;
  surveyId?: number | null;
  maxSubmissions?: number | null;
  allowResubmission?: boolean;
  isRequired?: boolean;
  isBlocking?: boolean;
  displayOrder?: number;
  phaseNumber?: number | null;
  dueDate?: string | null;
  dueOffsetDays?: number | null;
  minimumTimeMinutes?: number | null;
  minimumScore?: number | null;
  minimumAttendance?: number | null;
  requiresManagerApproval?: boolean;
  peerReviewRequired?: boolean;
  requiredPeerReviewCount?: number | null;
  xpAward?: number | null;
};
export type CreateProgramTaskInput = ProgramTaskInput;
export type UpdateProgramTaskInput = Partial<ProgramTaskInput>;

export type ProgramMilestone = {
  id: number;
  programId: number;
  title: string;
  milestonePercentage: number | string;
  targetDate: string | null;
  targetOffsetDays: number | null;
  completionExpression: Record<string, unknown> | null;
  overdueAction: string | null;
  reminderOffsetsDays: number[];
  _count: { progresses: number };
};
export type ProgramMilestoneInput = {
  title: string;
  milestonePercentage: number;
  targetDate?: string | null;
  targetOffsetDays?: number | null;
  completionExpression?: Record<string, unknown> | null;
  overdueAction?: string | null;
  reminderOffsetsDays?: number[];
};
export type CreateProgramMilestoneInput = ProgramMilestoneInput;
export type UpdateProgramMilestoneInput = Partial<ProgramMilestoneInput>;

export type ProgramAuditActor = {
  id: number;
  email: string;
  employee: { fullName: string } | null;
};
export type ProgramAuditLog = {
  id: number;
  action: string;
  beforeJson: unknown;
  afterJson: unknown;
  createdAt: string;
  actorUser: ProgramAuditActor | null;
};
export type ProgramApprovalHistoryDecision = {
  id: number;
  status: ProgramApprovalDecisionStatus;
  comment: string | null;
  decidedAt: string;
  decidedByUser: { id: number; email: string } | null;
  workflowStep: { id: number; approvalOrder: number } | null;
};
export type ProgramApprovalHistoryInstance = {
  id: number;
  status: Exclude<ProgramApprovalInstanceStatus, "NOT_SUBMITTED">;
  submittedAt: string | null;
  completedAt: string | null;
  latestComment: string | null;
  createdAt: string;
  updatedAt: string;
  workflow: { id: number; name: string };
  submittedByUser: { id: number; email: string } | null;
  decisions: ProgramApprovalHistoryDecision[];
};
export type ProgramAuditHistory = {
  auditLogs: ProgramAuditLog[];
  approvalInstances: ProgramApprovalHistoryInstance[];
};
