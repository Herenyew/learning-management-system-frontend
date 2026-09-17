export type LearnerCatalogVersion = {
  id: number;
  majorVersion: number;
  minorVersion: number;
  versionLabel: string | null;
  estimatedDurationMinutes: number | null;
  course: {
    id: number;
    code: string | null;
    title: string;
    description: string | null;
    shortSummary: string | null;
    thumbnailUrl: string | null;
    language: string | null;
    keywords: string[];
    visibility: string;
    enrollmentPolicy: string;
    category: { id: number; name: string };
  };
  difficultyLevel: { code: string; name: string; color: string | null };
  instructors: Array<{ employee: { id: string; fullName: string } | null }>;
  chapters: Array<{ _count: { contents: number } }>;
  _count: { enrollments: number };
};

export type LearningProgressSummary = {
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  completedAssessments: number;
  totalAssessments: number;
  totalLearningMinutes: number;
  lastAccessedAt: string | null;
  lastContentId: number | null;
};

export type LearnerCourseEnrollment = {
  id: number;
  courseVersionId: number;
  programEnrollmentId: number | null;
  enrollmentNo: number;
  status: string;
  enrolledAt: string;
  startedAt: string | null;
  dueDate: string | null;
  completedAt: string | null;
  courseVersion: {
    id: number;
    majorVersion: number;
    minorVersion: number;
    course: { id: number; code: string; title: string; description: string | null };
  };
  progress: LearningProgressSummary | null;
  completion: { id: number; finalScore: number; passed: boolean; completedAt: string } | null;
};

export type LessonProgress = {
  id: number;
  contentId: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  watchPercentage: number | null;
  lastPositionSeconds: number | null;
  timeSpentMinutes: number;
  startedAt: string | null;
  completedAt: string | null;
};

export type EnrollmentProgressDetail = LearnerCourseEnrollment & {
  courseVersion: LearnerCourseEnrollment["courseVersion"] & {
    assessments: Array<{
      id: number;
      title: string;
      passingScore: number;
      maxAttempts: number;
      durationMinutes: number | null;
      assessmentType: { code: string; name: string };
      attempts: Array<{
        id: number;
        attemptNo: number;
        status: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "EXPIRED";
        percentage: number | null;
        passed: boolean | null;
        startedAt: string;
        submittedAt: string | null;
        gradedAt: string | null;
      }>;
    }>;
    chapters: Array<{
      id: number;
      title: string;
      displayOrder: number;
      contents: Array<{
        id: number;
        title: string;
        displayOrder: number;
        estimatedDurationMinutes: number | null;
        completionThreshold: number | null;
        minimumTimeMinutes: number | null;
        contentType: { slug: string; name: string; category: string };
      }>;
    }>;
  };
  progress: (LearningProgressSummary & { lessonProgress: LessonProgress[] }) | null;
};

export type ProgressEvaluationResult = {
  enrollmentId: number;
  progress: LearningProgressSummary;
  evaluation: { eligible: boolean; reasons: string[] };
  completion: { id: number; passed: boolean; completedAt: string } | null;
};

export type ProgramEnrollmentSource =
  | "LEGACY"
  | "SELF_SERVICE"
  | "ADMIN_ASSIGNED"
  | "WAITLIST"
  | "API"
  | "CSV_IMPORT"
  | "HRIS_SYNC";

export type LearnerProgramEnrollment = {
  id: number;
  programId: number;
  cohortId: number | null;
  enrollmentNo: number;
  source: ProgramEnrollmentSource;
  enrollmentStatus: string;
  progressPercentage: number;
  enrolledAt: string;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  program: { id: number; name: string; description: string | null; status: string };
  cohort: { id: number; name: string; startDate: string | null; endDate: string | null } | null;
  enrollments: Array<{
    id: number;
    courseVersionId: number;
    status: string;
    dueDate: string | null;
    completedAt: string | null;
    progress: { overallProgress: number } | null;
    courseVersion: { course: { id: number; code: string; title: string } };
  }>;
  milestoneProgresses: Array<{
    id: number;
    status: string;
    achievedAt: string | null;
    milestone: { id: number; title: string; milestonePercentage: number };
  }>;
  completion: { id: number; completedAt: string } | null;
};

export type ProgramRuntimeAnalytics = {
  generatedAt: string;
  summary: {
    activePrograms: number;
    totalEnrolled: number;
    totalCompleted: number;
    completionRate: number;
    averageProgress: number;
    overdueRequirements: number;
  };
  programs: Array<{
    id: number;
    name: string;
    status: string;
    enrolled: number;
    completed: number;
    overdue: number;
    progress: number;
    cohorts: number;
    cohortPerformance: Array<{
      id: number;
      name: string;
      learners: number;
      completed: number;
      progress: number;
    }>;
  }>;
};
