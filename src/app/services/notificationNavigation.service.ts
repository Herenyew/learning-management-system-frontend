import type { NavigateFn, Screen } from "../models/app.model";

/**
 * Maps screens referenced by backend notification actionUrls to screens that
 * actually exist in this frontend's navigation model.
 */
const SCREEN_ALIASES: Record<string, Screen> = {
  "course-details": "course-detail",
  "my-certificates": "certificates",
  "my-courses": "catalog",
  "my-programs": "programs",
  "live-sessions": "live-sessions",
  assignments: "assignments",
  "tna-requests": "tna-form",
  "my-tna-requests": "tna-form",
};

/**
 * Screens that a notification may safely navigate the user to. Anything else
 * (e.g. a screen the current frontend does not render) falls back to the
 * notification center so the user is never sent to a blank page.
 */
const APP_SCREENS = new Set<Screen>([
  "dashboard",
  "catalog",
  "course-detail",
  "certificates",
  "programs",
  "notifications",
  "tna-form",
  "hr-publishing",
  "hr-programs",
  "program-detail",
  "assignments",
  "live-sessions",
  "my-courses-builder",
  "manager",
  "hr-dashboard",
]);

const ID_PARAM_NAMES = [
  "courseVersionId",
  "courseId",
  "programId",
  "programEnrollmentId",
  "learningProgramId",
  "certificateId",
  "requestId",
];

/**
 * Parses a backend notification actionUrl (e.g. "/?screen=hr-publishing&courseVersionId=12")
 * and navigates to the matching in-app screen. Returns false when the URL is
 * missing, external, or maps to a screen this frontend does not render.
 */
export function navigateToNotificationAction(actionUrl: string | null, navigate: NavigateFn) {
  if (!actionUrl || typeof window === "undefined") return false;

  try {
    const target = new URL(actionUrl, window.location.origin);
    if (target.origin !== window.location.origin || target.pathname !== "/") {
      return false;
    }

    const requestedScreen = target.searchParams.get("screen");
    if (!requestedScreen) return false;
    const screen = SCREEN_ALIASES[requestedScreen] ?? (requestedScreen as Screen);
    if (!APP_SCREENS.has(screen)) return false;

    let entityId: string | undefined;
    for (const name of ID_PARAM_NAMES) {
      const value = target.searchParams.get(name);
      if (value) {
        entityId = value;
        break;
      }
    }

    navigate(screen, entityId);
    return true;
  } catch {
    return false;
  }
}
