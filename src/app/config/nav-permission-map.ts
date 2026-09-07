import { Permissions } from "../constants/permission.constant";

/**
 * Maps each navigation item ID to the permission required to see it.
 * Used by Sidebar to filter nav items based on current user permissions.
 *
 * Permission codes reference the backend Permissions catalog.
 */
export const NAV_PERMISSION_MAP: Record<string, string> = {
  // ─── Learner nav ────────────────────────────────────────
  dashboard: Permissions.COURSE_READ,
  catalog: Permissions.COURSE_READ,
  programs: Permissions.PROGRAM_READ,
  calendar: Permissions.COURSE_READ,
  leaderboard: Permissions.XP_RULE_VIEW,
  profile: Permissions.COURSE_READ,

  // ─── HR nav ─────────────────────────────────────────────
  "hr-dashboard": Permissions.COURSE_READ,
  "config-center": Permissions.ACCESS_CONTROL_MANAGE,
  "analytics-center": Permissions.ANALYTICS_VIEW,

  // ─── Manager nav ────────────────────────────────────────
  manager: Permissions.ANALYTICS_VIEW,
  effectiveness: Permissions.ANALYTICS_VIEW,
  "tna-form": Permissions.TNA_SUBMIT,

  // ─── Creator nav ────────────────────────────────────────
  "my-courses-builder": Permissions.COURSE_CREATE,
  "question-bank": Permissions.QUESTION_TYPE_VIEW,
  "live-sessions": Permissions.COURSE_READ,

  // ─── HR grouped: Learning Programs ──────────────────────
  "program-dashboard": Permissions.PROGRAM_READ,
  "hr-programs": Permissions.PROGRAM_READ,
  "hr-publishing": Permissions.APPROVAL_WORKFLOW_MANAGE,
  assignments: Permissions.PROGRAM_READ,
  surveys: Permissions.SURVEY_TEMPLATE_VIEW,

  // ─── HR grouped: TNA & Workforce Planning ───────────────
  "tna-agg": Permissions.TNA_VIEW_ALL,

  // ─── HR grouped: Standalone groups ──────────────────────
  "certification-mgmt": Permissions.CERTIFICATE_ISSUE,
  "moderation-center": Permissions.MODERATION_MANAGE,
  "hr-leaderboard-mgmt": Permissions.XP_RULE_VIEW,

  // ─── Admin grouped: Course Management ───────────────────
  scorm: Permissions.COURSE_READ,
};

/**
 * Get the permission required for a nav item.
 * Defaults to ACCESS_CONTROL_MANAGE for unknown items (safe fallback).
 */
export function getPermissionForNavId(navId: string): string {
  return NAV_PERMISSION_MAP[navId] ?? Permissions.ACCESS_CONTROL_MANAGE;
}
