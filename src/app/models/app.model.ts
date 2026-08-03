export type Screen =
  | "login"
  | "dashboard"
  | "catalog"
  | "course-detail"
  | "player"
  | "quiz"
  | "certificates"
  | "profile"
  | "leaderboard"
  | "programs"
  | "hr-dashboard"
  | "tna"
  | "analytics"
  | "creator"
  | "notifications"
  // Extended modules (Extensions.tsx)
  | "tna-form"
  | "tna-agg"
  | "hr-programs"
  | "hr-leaderboard-mgmt"
  | "hr-xp"
  | "hr-publishing"
  | "hr-moderation"
  | "manager"
  | "cert-admin"
  | "scorm"
  | "creator-config"
  // Extended modules (Extensions2.tsx)
  | "calendar"
  | "effectiveness"
  | "live-sessions"
  | "question-bank"
  | "program-dashboard"
  | "assignments"
  | "surveys"
  | "cert-providers"
  // Extensions3 — new IA screens
  | "config-center"
  | "analytics-center"
  | "moderation-center"
  | "my-courses-builder"
  | "certification-mgmt"
  | "gamification"
  | "catalog-config";

export type NavigateFn = (s: string, courseId?: string) => void;

export type Role = "learner" | "hr" | "manager" | "creator" | "admin";

export type LeaderboardMetric = "xp" | "completion" | "performance";

export type LeaderboardConfig = {
  xp: boolean;
  completion: boolean;
  performance: boolean;
  primary: LeaderboardMetric;
};

export type ProgramLbCriteria = {
  xp: boolean;
  completion: boolean;
  performance: boolean;
  primary: LeaderboardMetric;
};

export type PreCourseAssessmentPolicy = "disabled" | "optional" | "mandatory";

// ─── Data ─────────────────────────────────────────────────────
export type Course = {
  id: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  rating: number;
  enrolled: number;
  progress: number;
  isEnrolled: boolean;
  color: string;
  instructor: string;
  instructorAvatar: string;
  tags: string[];
  recommended: boolean;
  mandatory: boolean;
  thumbnail: string;
  preCourseAssessment?: PreCourseAssessmentPolicy;
  provider?: string;
  providerShort?: string;
  providerStatus?: "Integrated" | "Manual";
  providerCredential?: string;
};
