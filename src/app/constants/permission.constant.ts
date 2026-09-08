/**
 * Frontend permission codes — single source of truth for UI permission checks.
 * Mirrors the backend Permissions catalog (src/common/constants/permission.constant.ts).
 * Keep in sync with the backend — if a permission code changes there, change it here.
 */
export const Permissions = {
  // ─── Access Control ──────────────────────────────────────
  ACCESS_CONTROL_MANAGE: "access_control.manage",

  // ─── System Settings ─────────────────────────────────────
  SYSTEM_CONFIG_MANAGE: "system_config.manage",
  SYSTEM_SETTING_CREATE: "system_setting.create",
  SYSTEM_SETTING_VIEW: "system_setting.view",
  SYSTEM_SETTING_UPDATE: "system_setting.update",
  SYSTEM_SETTING_DELETE: "system_setting.delete",

  // ─── Course Configuration ────────────────────────────────
  COURSE_CATEGORY_CREATE: "course_category.create",
  COURSE_CATEGORY_VIEW: "course_category.view",
  COURSE_CATEGORY_UPDATE: "course_category.update",
  COURSE_CATEGORY_DELETE: "course_category.delete",

  DIFFICULTY_LEVEL_CREATE: "difficulty_level.create",
  DIFFICULTY_LEVEL_VIEW: "difficulty_level.view",
  DIFFICULTY_LEVEL_UPDATE: "difficulty_level.update",
  DIFFICULTY_LEVEL_DELETE: "difficulty_level.delete",

  CONTENT_TYPE_CREATE: "content_type.create",
  CONTENT_TYPE_VIEW: "content_type.view",
  CONTENT_TYPE_UPDATE: "content_type.update",
  CONTENT_TYPE_DELETE: "content_type.delete",

  CONTENT_FILE_TYPE_CREATE: "content_file_type.create",
  CONTENT_FILE_TYPE_VIEW: "content_file_type.view",
  CONTENT_FILE_TYPE_UPDATE: "content_file_type.update",
  CONTENT_FILE_TYPE_DELETE: "content_file_type.delete",

  COURSE_TEMPLATE_CREATE: "course_template.create",
  COURSE_TEMPLATE_VIEW: "course_template.view",
  COURSE_TEMPLATE_UPDATE: "course_template.update",
  COURSE_TEMPLATE_DELETE: "course_template.delete",

  // ─── Assessment Configuration ────────────────────────────
  ASSESSMENT_TYPE_CREATE: "assessment_type.create",
  ASSESSMENT_TYPE_VIEW: "assessment_type.view",
  ASSESSMENT_TYPE_UPDATE: "assessment_type.update",
  ASSESSMENT_TYPE_DELETE: "assessment_type.delete",

  QUESTION_TYPE_CREATE: "question_type.create",
  QUESTION_TYPE_VIEW: "question_type.view",
  QUESTION_TYPE_UPDATE: "question_type.update",
  QUESTION_TYPE_DELETE: "question_type.delete",

  GRADING_METHOD_CREATE: "grading_method.create",
  GRADING_METHOD_VIEW: "grading_method.view",
  GRADING_METHOD_UPDATE: "grading_method.update",
  GRADING_METHOD_DELETE: "grading_method.delete",

  ASSESSMENT_TEMPLATE_CREATE: "assessment_template.create",
  ASSESSMENT_TEMPLATE_VIEW: "assessment_template.view",
  ASSESSMENT_TEMPLATE_UPDATE: "assessment_template.update",
  ASSESSMENT_TEMPLATE_DELETE: "assessment_template.delete",

  // ─── Audience Configuration ──────────────────────────────
  AUDIENCE_CREATE: "audience.create",
  AUDIENCE_VIEW: "audience.view",
  AUDIENCE_UPDATE: "audience.update",
  AUDIENCE_DELETE: "audience.delete",

  // ─── Program Configuration ───────────────────────────────
  PROGRAM_TYPE_CREATE: "program_type.create",
  PROGRAM_TYPE_VIEW: "program_type.view",
  PROGRAM_TYPE_UPDATE: "program_type.update",
  PROGRAM_TYPE_DELETE: "program_type.delete",

  PROGRAM_CATEGORY_CREATE: "program_category.create",
  PROGRAM_CATEGORY_VIEW: "program_category.view",
  PROGRAM_CATEGORY_UPDATE: "program_category.update",
  PROGRAM_CATEGORY_DELETE: "program_category.delete",

  TASK_TYPE_CREATE: "task_type.create",
  TASK_TYPE_VIEW: "task_type.view",
  TASK_TYPE_UPDATE: "task_type.update",
  TASK_TYPE_DELETE: "task_type.delete",

  PROGRAM_TEMPLATE_CREATE: "program_template.create",
  PROGRAM_TEMPLATE_VIEW: "program_template.view",
  PROGRAM_TEMPLATE_UPDATE: "program_template.update",
  PROGRAM_TEMPLATE_DELETE: "program_template.delete",

  // ─── Certificate Configuration ───────────────────────────
  CERTIFICATE_TEMPLATE_CREATE: "certificate_template.create",
  CERTIFICATE_TEMPLATE_VIEW: "certificate_template.view",
  CERTIFICATE_TEMPLATE_UPDATE: "certificate_template.update",
  CERTIFICATE_TEMPLATE_DELETE: "certificate_template.delete",

  // ─── Notification Configuration ──────────────────────────
  NOTIFICATION_TEMPLATE_CREATE: "notification_template.create",
  NOTIFICATION_TEMPLATE_VIEW: "notification_template.view",
  NOTIFICATION_TEMPLATE_UPDATE: "notification_template.update",
  NOTIFICATION_TEMPLATE_DELETE: "notification_template.delete",

  // ─── Enrollment Configuration ────────────────────────────
  ENROLLMENT_RULE_TYPE_CREATE: "enrollment_rule_type.create",
  ENROLLMENT_RULE_TYPE_VIEW: "enrollment_rule_type.view",
  ENROLLMENT_RULE_TYPE_UPDATE: "enrollment_rule_type.update",
  ENROLLMENT_RULE_TYPE_DELETE: "enrollment_rule_type.delete",

  // ─── Custom Fields ───────────────────────────────────────
  CUSTOM_FIELD_CREATE: "custom_field.create",
  CUSTOM_FIELD_VIEW: "custom_field.view",
  CUSTOM_FIELD_UPDATE: "custom_field.update",
  CUSTOM_FIELD_DELETE: "custom_field.delete",

  // ─── Survey Configuration ────────────────────────────────
  SURVEY_QUESTION_TYPE_CREATE: "survey_question_type.create",
  SURVEY_QUESTION_TYPE_VIEW: "survey_question_type.view",
  SURVEY_QUESTION_TYPE_UPDATE: "survey_question_type.update",
  SURVEY_QUESTION_TYPE_DELETE: "survey_question_type.delete",

  SURVEY_TEMPLATE_CREATE: "survey_template.create",
  SURVEY_TEMPLATE_VIEW: "survey_template.view",
  SURVEY_TEMPLATE_UPDATE: "survey_template.update",
  SURVEY_TEMPLATE_DELETE: "survey_template.delete",

  // ─── Gamification ────────────────────────────────────────
  XP_RULE_CREATE: "xp_rule.create",
  XP_RULE_VIEW: "xp_rule.view",
  XP_RULE_UPDATE: "xp_rule.update",
  XP_RULE_DELETE: "xp_rule.delete",

  LEARNING_LEVEL_CREATE: "learning_level.create",
  LEARNING_LEVEL_VIEW: "learning_level.view",
  LEARNING_LEVEL_UPDATE: "learning_level.update",
  LEARNING_LEVEL_DELETE: "learning_level.delete",

  BADGE_CREATE: "badge.create",
  BADGE_VIEW: "badge.view",
  BADGE_UPDATE: "badge.update",
  BADGE_DELETE: "badge.delete",

  BADGE_RULE_CREATE: "badge_rule.create",
  BADGE_RULE_VIEW: "badge_rule.view",
  BADGE_RULE_UPDATE: "badge_rule.update",
  BADGE_RULE_DELETE: "badge_rule.delete",

  // ─── Course Domain ───────────────────────────────────────
  COURSE_CREATE: "course.create",
  COURSE_VIEW: "course.view",
  COURSE_UPDATE: "course.update",
  COURSE_DELETE: "course.delete",
  COURSE_PUBLISH: "course.publish",

  // ─── Assessment Domain ───────────────────────────────────
  ASSESSMENT_CREATE: "assessment.create",
  ASSESSMENT_VIEW: "assessment.view",
  ASSESSMENT_GRADE: "assessment.grade",

  // ─── Operational / Managed Domain ────────────────────────
  COURSE_READ: "course.read",
  COURSE_REVIEW: "course.review",

  TNA_SUBMIT: "tna.submit",
  TNA_VIEW_ALL: "tna.view_all",
  TNA_REVIEW: "tna.review",
  TNA_CONFIG_MANAGE: "tna_config.manage",

  PROGRAM_READ: "program.read",
  PROGRAM_CREATE: "program.create",
  PROGRAM_UPDATE: "program.update",
  PROGRAM_DELETE: "program.delete",
  PROGRAM_PUBLISH: "program.publish",
  PROGRAM_REVIEW: "program.review",

  CERTIFICATE_ISSUE: "certificate.issue",
  CERTIFICATE_CONFIG_MANAGE: "certificate_config.manage",
  NOTIFICATION_CONFIG_MANAGE: "notification_config.manage",
  TEMPLATE_MANAGE: "template.manage",
  ENROLLMENT_CONFIG_MANAGE: "enrollment_config.manage",
  APPROVAL_WORKFLOW_MANAGE: "approval_workflow.manage",
  GAMIFICATION_CONFIG_MANAGE: "gamification_config.manage",
  ANALYTICS_VIEW: "analytics.view",
  MODERATION_MANAGE: "moderation.manage",
} as const;

export type PermissionCode = (typeof Permissions)[keyof typeof Permissions];
