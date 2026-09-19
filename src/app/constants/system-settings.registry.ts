// ============================================================
// System Settings — frontend registry (UI metadata mirror)
//
// Kept intentionally minimal: the backend Registry is the source
// of truth for which keys exist and their valueType. This file
// only carries UI hints (labels, select options, color fields).
// Keep it in sync with known-settings.registry.ts on the backend.
// ============================================================

import type { SettingCategory, SettingValueType } from "../API/system-settings.api";

export type SettingMeta = {
  key: string;
  category: SettingCategory;
  valueType: SettingValueType;
  label: string;
  description?: string;
  options?: { value: string; label: string }[];
  /** Color settings render a color picker + hex input. */
  color?: boolean;
};

export const SETTINGS_META: SettingMeta[] = [
  // GENERAL
  {
    key: "platform_name",
    category: "GENERAL",
    valueType: "STRING",
    label: "Platform Name",
    description: "Shown in the sidebar and page titles.",
  },
  {
    key: "platform_logo_url",
    category: "GENERAL",
    valueType: "STRING",
    label: "Platform Logo URL",
    description: "Logo shown in the sidebar header.",
  },
  {
    key: "default_theme",
    category: "GENERAL",
    valueType: "STRING",
    label: "Default Theme",
    description: "Light, dark, or custom theme for the workspace.",
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "custom", label: "Custom" },
    ],
  },
  {
    key: "custom_theme_colors",
    category: "GENERAL",
    valueType: "STRING",
    label: "Custom Theme Colors",
    description:
      "JSON object with custom color values (background, foreground, card, primary, secondary, muted, accent, border, sidebar).",
  },
  {
    key: "primary_color",
    category: "GENERAL",
    valueType: "STRING",
    label: "Primary Color",
    description: "Primary brand color used across the UI.",
    color: true,
  },
  {
    key: "secondary_color",
    category: "GENERAL",
    valueType: "STRING",
    label: "Secondary Color",
    description: "Secondary brand color.",
    color: true,
  },
  {
    key: "accent_color",
    category: "GENERAL",
    valueType: "STRING",
    label: "Accent Color",
    description: "Accent color for highlights.",
    color: true,
  },
  {
    key: "default_language",
    category: "GENERAL",
    valueType: "STRING",
    label: "Default Language",
    options: [
      { value: "en", label: "English" },
      { value: "am", label: "Amharic" },
      { value: "fr", label: "French" },
      { value: "ar", label: "Arabic" },
      { value: "sw", label: "Swahili" },
    ],
  },
  {
    key: "default_timezone",
    category: "GENERAL",
    valueType: "STRING",
    label: "Default Timezone",
    options: [
      { value: "Africa/Addis_Ababa", label: "Africa/Addis_Ababa" },
      { value: "Africa/Nairobi", label: "Africa/Nairobi" },
      { value: "Africa/Cairo", label: "Africa/Cairo" },
      { value: "Africa/Lagos", label: "Africa/Lagos" },
      { value: "UTC", label: "UTC" },
    ],
  },
  {
    key: "default_date_format",
    category: "GENERAL",
    valueType: "STRING",
    label: "Default Date Format",
    options: [
      { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
      { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
      { value: "YYYY-MM-DD", label: "YYYY-MM-DD (ISO)" },
    ],
  },
  {
    key: "maintenance_mode",
    category: "GENERAL",
    valueType: "BOOLEAN",
    label: "Maintenance Mode",
    description: "Puts the platform into read-only maintenance.",
  },
  {
    key: "enabled_content_types",
    category: "GENERAL",
    valueType: "JSON",
    label: "Enabled Content Types",
    description: "Content types creators may attach to courses.",
    options: [
      { value: "document", label: "Document" },
      { value: "video", label: "Video" },
      { value: "quiz", label: "Quiz" },
      { value: "link", label: "Link" },
      { value: "scorm", label: "SCORM" },
      { value: "live_session", label: "Live Session" },
      { value: "assignment", label: "Assignment" },
      { value: "survey", label: "Survey" },
    ],
  },

  // ENROLLMENT
  {
    key: "default_enrollment_policy",
    category: "ENROLLMENT",
    valueType: "STRING",
    label: "Default Enrollment Policy",
    options: [
      { value: "open", label: "Open" },
      { value: "invitation_only", label: "Invitation Only" },
      { value: "payment_required", label: "Payment Required" },
    ],
  },
  {
    key: "default_visibility",
    category: "ENROLLMENT",
    valueType: "STRING",
    label: "Default Visibility",
    options: [
      { value: "public", label: "Public" },
      { value: "signed_in", label: "Signed In" },
      { value: "company", label: "Company Only" },
      { value: "enrolled_only", label: "Enrolled Only" },
    ],
  },
  {
    key: "default_course_capacity",
    category: "ENROLLMENT",
    valueType: "NUMBER",
    label: "Default Course Capacity",
    description: "0 = unlimited.",
  },
  {
    key: "default_program_capacity",
    category: "ENROLLMENT",
    valueType: "NUMBER",
    label: "Default Program Capacity",
    description: "0 = unlimited.",
  },
  {
    key: "default_waitlist_size",
    category: "ENROLLMENT",
    valueType: "NUMBER",
    label: "Default Waitlist Size",
  },
  {
    key: "default_waitlist_response_hours",
    category: "ENROLLMENT",
    valueType: "NUMBER",
    label: "Waitlist Response Window (hours)",
  },

  // NOTIFICATIONS
  {
    key: "default_email_enabled",
    category: "NOTIFICATIONS",
    valueType: "BOOLEAN",
    label: "Email Notifications Enabled",
  },
  {
    key: "default_in_app_enabled",
    category: "NOTIFICATIONS",
    valueType: "BOOLEAN",
    label: "In-App Notifications Enabled",
  },
  {
    key: "notification_sender_name",
    category: "NOTIFICATIONS",
    valueType: "STRING",
    label: "Notification Sender Name",
  },
  {
    key: "default_reminder_days_before",
    category: "NOTIFICATIONS",
    valueType: "NUMBER",
    label: "Reminder Days Before",
  },

  // CERTIFICATION
  {
    key: "default_certificate_validity_days",
    category: "CERTIFICATION",
    valueType: "NUMBER",
    label: "Certificate Validity (days)",
  },
  {
    key: "auto_issue_on_completion",
    category: "CERTIFICATION",
    valueType: "BOOLEAN",
    label: "Auto-Issue on Completion",
  },
  {
    key: "default_certificate_template_id",
    category: "CERTIFICATION",
    valueType: "NUMBER",
    label: "Default Certificate Template ID",
    description: "Leave empty to use the standard template.",
  },

  // GAMIFICATION
  { key: "xp_enabled", category: "GAMIFICATION", valueType: "BOOLEAN", label: "XP Enabled" },
  {
    key: "fallback_course_xp",
    category: "GAMIFICATION",
    valueType: "NUMBER",
    label: "Fallback Course XP",
  },
  {
    key: "fallback_assessment_xp",
    category: "GAMIFICATION",
    valueType: "NUMBER",
    label: "Fallback Assessment XP",
  },
  {
    key: "fallback_perfect_score_bonus",
    category: "GAMIFICATION",
    valueType: "NUMBER",
    label: "Perfect Score Bonus XP",
  },

  // SECURITY
  {
    key: "password_min_length",
    category: "SECURITY",
    valueType: "NUMBER",
    label: "Minimum Password Length",
  },
  {
    key: "password_require_uppercase",
    category: "SECURITY",
    valueType: "BOOLEAN",
    label: "Require Uppercase",
  },
  {
    key: "password_require_lowercase",
    category: "SECURITY",
    valueType: "BOOLEAN",
    label: "Require Lowercase",
  },
  {
    key: "password_require_number",
    category: "SECURITY",
    valueType: "BOOLEAN",
    label: "Require Number",
  },
  {
    key: "password_require_special_character",
    category: "SECURITY",
    valueType: "BOOLEAN",
    label: "Require Special Character",
  },
  { key: "mfa_required", category: "SECURITY", valueType: "BOOLEAN", label: "Require MFA" },
  {
    key: "session_timeout_minutes",
    category: "SECURITY",
    valueType: "NUMBER",
    label: "Session Timeout (minutes)",
  },
  {
    key: "max_login_attempts",
    category: "SECURITY",
    valueType: "NUMBER",
    label: "Max Login Attempts",
  },

  // INTEGRATIONS
  {
    key: "api_rate_limit_per_minute",
    category: "INTEGRATIONS",
    valueType: "NUMBER",
    label: "API Rate Limit (per minute)",
  },
  {
    key: "webhook_retry_limit",
    category: "INTEGRATIONS",
    valueType: "NUMBER",
    label: "Webhook Retry Limit",
  },
  {
    key: "scorm_default_completion_threshold",
    category: "INTEGRATIONS",
    valueType: "NUMBER",
    label: "SCORM Completion Threshold (%)",
  },
  {
    key: "external_cert_sync_enabled",
    category: "INTEGRATIONS",
    valueType: "BOOLEAN",
    label: "External Certificate Sync",
  },
  {
    key: "calendar_sync_enabled",
    category: "INTEGRATIONS",
    valueType: "BOOLEAN",
    label: "Calendar Sync",
  },
];

export const SETTINGS_META_BY_KEY = new Map<string, SettingMeta>(
  SETTINGS_META.map((m) => [m.key, m]),
);

/** The Known Settings Registry keys — "core" settings cannot be deleted or deactivated. */
export const CORE_SETTING_KEYS = new Set<string>(SETTINGS_META.map((m) => m.key));

export const COLOR_KEYS = new Set(SETTINGS_META.filter((m) => m.color).map((m) => m.key));

/** Applies immediately after save (live branding). */
export const LIVE_BRANDING_KEYS = new Set([
  "platform_name",
  "platform_logo_url",
  "default_theme",
  "custom_theme_colors",
  "primary_color",
  "secondary_color",
  "accent_color",
  "maintenance_mode",
]);

export const CATEGORY_ORDER: SettingCategory[] = [
  "GENERAL",
  "ENROLLMENT",
  "NOTIFICATIONS",
  "CERTIFICATION",
  "GAMIFICATION",
  "SECURITY",
  "INTEGRATIONS",
];

export const CATEGORY_LABELS: Record<SettingCategory, string> = {
  GENERAL: "General",
  ENROLLMENT: "Enrollment",
  NOTIFICATIONS: "Notifications",
  CERTIFICATION: "Certification",
  GAMIFICATION: "Gamification",
  SECURITY: "Security",
  INTEGRATIONS: "Integrations",
};
