/**
 * Maps each screen ID to the permission code required to see it in navigation.
 * Screens not listed here are considered public (no permission required).
 * This is the single source of truth for navigation-level permission filtering.
 */
export const SCREEN_PERMISSION: Record<string, string> = {
  // ─── Learner screens ───────────────────────────────────────
  dashboard: "course.read",
  catalog: "course.read",
  programs: "program.read",
  profile: "course.read",

  // ─── Manager screens ───────────────────────────────────────
  manager: "course.read",
  effectiveness: "analytics.view",
  "tna-form": "tna.submit",
  "analytics-center": "analytics.view",

  // ─── Creator screens ───────────────────────────────────────
  "my-courses-builder": "course.create",
  "question-bank": "question_type.view",
  "live-sessions": "course.read",

  // ─── HR/Admin flat screens ─────────────────────────────────
  "hr-dashboard": "course.read",
  "config-center": "course.read", // container screen; sub-screens gate themselves

  // ─── HR grouped: Learning Programs ──────────────────────────
  "program-dashboard": "program.read",
  "hr-programs": "program.read",
  "hr-publishing": "approval_workflow.manage",
  assignments: "course.read",
  surveys: "survey_template.view",

  // ─── HR grouped: TNA & Workforce Planning ──────────────────
  "tna-agg": "tna.view_all",

  // ─── HR grouped: Certificate Management ─────────────────────
  "certification-mgmt": "certificate.issue",

  // ─── HR grouped: Content Moderation ────────────────────────
  "moderation-center": "moderation.manage",

  // ─── HR grouped: Leaderboard Management ─────────────────────
  "hr-leaderboard-mgmt": "gamification_config.manage",

  // ─── HR grouped: Analytics & Reporting ──────────────────────
  scorm: "content_type.view",

  // ─── Admin grouped: Course Management ───────────────────────
  // (catalog already mapped above)

  // ─── Config sub-screens (accessed via config-center) ────────
  "config-role-permissions": "access_control.manage",
  "config-course-templates": "course_template.view",
  "config-certifications": "certificate_config.manage",
  "config-enrollment": "enrollment_config.manage",
  "config-tna": "tna_config.manage",
  "config-notifications": "notification_config.manage",
  "config-survey": "survey_template.view",
  "config-badges": "gamification_config.manage",
  "config-audience": "audience.view",
  "config-content-types": "content_type.view",
  "config-question-types": "question_type.view",
  "config-custom-fields": "custom_field.read",
  "config-publishing": "approval_workflow.manage",
  "config-system-settings": "system_config.manage",
  "config-effectiveness": "analytics.view",
};
