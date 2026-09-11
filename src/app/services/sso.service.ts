/**
 * SSO Authentication Service
 *
 * Handles the OAuth2 flow for the LMS.
 * The LMS has NO local login form — all authentication goes through the Auth Service.
 *
 * API base: /api/v1  (matches backend API_PREFIX=/api/v1)
 */

import { mapEmsRoleToLmsRole } from "../API/emsAuth.api";
import type { Role } from "../models/app.model";
import { saveSsoSession, clearAuthSession, emitSessionChange, type SsoUser } from "./authSession.service";

const API = "/api/v1";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of GET /api/v1/auth/me response data */
export interface LmsMeResponse {
  appUserId: number;
  employeeId: string;
  companyId: number;
  email: string;
  /** Backend serializes roleId as a string (String(payload.roleId)). */
  roleId: number | string;
  roleName?: string;
  permissions: string[];
}

// ─── Role mapping ─────────────────────────────────────────────────────────────

/**
 * Well-known DB role names (AppRole.name values) the backend uses.
 * Mapped directly to LMS Role without going through the EMS alias table.
 * This handles cases where the DB name doesn't match the EMS alias list
 * (e.g. "SUPER_ADMIN", "CEO", "FINANCE", "COURSE_CREATOR").
 */
const DB_ROLE_NAME_MAP: Record<string, Role> = {
  // Admin variants
  admin:        "admin",
  super_admin:  "admin",
  superadmin:   "admin",
  lms_admin:    "admin",
  // HR variants
  hr:           "hr",
  hr_user:      "hr",
  hr_admin:     "hr",
  hr_manager:   "hr",
  // Manager variants
  manager:      "manager",
  // Creator variants
  course_creator:   "creator",
  content_creator:  "creator",
  instructor:       "creator",
  // Learner / employee (catch-all low-privilege names)
  learner:      "learner",
  employee:     "learner",
  // Roles that don't map cleanly to a creator/hr bucket stay as "learner"
  // so they get the least-privilege sidebar. Admin can configure their
  // permissions via the Access Control page.
  ceo:          "admin",
  finance:      "learner",
};

/**
 * Maps the LMS /me response to an LMS Role.
 *
 * Priority order:
 *  1. roleName — checked against the DB role name map (exact, case-insensitive)
 *  2. roleName — delegated to EMS alias table (handles custom names like "HR Admin")
 *  3. permissions array — derive from what the user can actually do
 *     (covers the edge case where admin has changed permissions but roleName is stale)
 *  4. Default to "learner"
 */
export function mapMeResponseToRole(me: LmsMeResponse): Role {
  if (me.roleName) {
    // Priority 1: exact match against known DB role names (case-insensitive, underscore-normalised)
    const normalized = me.roleName.trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (normalized in DB_ROLE_NAME_MAP) {
      return DB_ROLE_NAME_MAP[normalized]!;
    }

    // Priority 2: delegate to EMS alias table for human-readable names
    // (e.g. "Course Creator", "HR Manager", "Line Manager", etc.)
    const fromAlias = mapEmsRoleToLmsRole(me.roleName);
    // mapEmsRoleToLmsRole returns "learner" for unknown names — only trust it
    // when the result is non-learner OR when the name itself looks like a learner role.
    const looksLikeLearner = /learner|employee|staff|user/i.test(me.roleName);
    if (fromAlias !== "learner" || looksLikeLearner) {
      return fromAlias;
    }
    // Fall through to permission-based detection if alias resolution produced
    // an uncertain "learner" fallback for an unknown name.
  }

  // Priority 3: permissions array — derive from what the user can actually do.
  // IMPORTANT: Do NOT use permissions that the admin may have customised away
  // as the sole signal. Use pairs / combinations that form a stable identity:
  //   - access_control.manage  →  admin (only admins/hr have this by default)
  //   - system_config.manage   →  admin
  //   - tna.view_all           →  manager or hr (workforce management signal)
  //   - course.create + no tna.view_all  →  creator (author, not manager)
  //   - tna.submit only         →  learner
  const perms = new Set(me.permissions ?? []);
  if (perms.has("access_control.manage") || perms.has("system_config.manage")) return "admin";
  if (perms.has("tna.view_all") && perms.has("analytics.view") && perms.has("course.read")) {
    // Could be manager or hr — prefer hr if they also have config powers
    return perms.has("access_control.manage") || perms.has("certificate.issue")
      ? "hr"
      : "manager";
  }
  if (perms.has("course.create")) return "creator";

  return "learner";
}

// ─── Runtime shape guard ─────────────────────────────────────────────────────

/**
 * Minimal runtime check that the /auth/me response has the fields we rely on.
 * Guards against malformed backend responses without a full schema library.
 */
function isValidMeResponse(data: unknown): data is LmsMeResponse {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.email === "string" &&
    typeof d.companyId === "number" &&
    Array.isArray(d.permissions)
  );
}

// ─── Session check ────────────────────────────────────────────────────────────

/**
 * Verify the current httpOnly cookie session against the backend.
 * Returns the session data if valid, null otherwise.
 */
export async function checkSession(): Promise<{
  isAuthenticated: boolean;
  role?: Role;
  me?: LmsMeResponse;
}> {
  try {
    const response = await fetch(`${API}/auth/me`, { credentials: "include" });
    if (!response.ok) return { isAuthenticated: false };

    let data: unknown;
    try {
      data = await response.json();
    } catch (parseErr) {
      // The server responded 200 but with non-JSON body — log and bail out.
      console.warn("[sso] /auth/me returned non-JSON body:", parseErr);
      return { isAuthenticated: false };
    }

    if (!data || typeof data !== "object" || !(data as Record<string, unknown>).success) {
      return { isAuthenticated: false };
    }

    const raw = (data as Record<string, unknown>).data;
    if (!isValidMeResponse(raw)) {
      // Backend returned success but with an unexpected shape — warn and bail.
      console.warn("[sso] /auth/me response has unexpected shape:", raw);
      return { isAuthenticated: false };
    }

    const role = mapMeResponseToRole(raw);
    return { isAuthenticated: true, role, me: raw };
  } catch (err) {
    // Network failure or unexpected error — treat as unauthenticated.
    // Log in development so engineers can see connectivity issues during testing.
    if (import.meta.env.DEV) {
      console.warn("[sso] checkSession failed:", err);
    }
    return { isAuthenticated: false };
  }
}

/**
 * Verify session and save it to sessionStorage for UI use.
 * Call this once after the OAuth callback succeeds.
 */
export async function hydrateSessionFromCookie(): Promise<Role | null> {
  const result = await checkSession();
  if (!result.isAuthenticated || !result.me || !result.role) return null;

  const me = result.me;
  const displayName = me.email;

  const ssoUser: SsoUser = {
    appUserId: me.appUserId ?? 0,
    employeeId: me.employeeId ?? "",
    companyId: me.companyId ?? 1,
    email: me.email,
    roleId: me.roleId ?? "001",
    roleName: me.roleName ?? "",
    permissions: me.permissions ?? [],
    displayName,
  };

  saveSsoSession(ssoUser, result.role);
  return result.role;
}

// ─── OAuth callback detection ─────────────────────────────────────────────────

/**
 * True when the current URL is the OAuth callback path.
 *
 * The auth service's generateModuleAuthorizationCode builds the redirect URL as:
 *   new URL("/auth/sso-callback", module.moduleFrontUrl)
 * So the canonical path is /auth/sso-callback.
 *
 * /auth/callback is kept as a fallback for older links
 * (e.g. SSORedirectScreen, direct links).
 */
export function isOAuthCallback(): boolean {
  if (typeof window === "undefined") return false;
  const { pathname } = window.location;
  return pathname === "/auth/sso-callback" || pathname === "/auth/callback";
}

/** Returns the `code` query param from the current URL, or null. */
export function getOAuthCode(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("code");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Calls the backend logout endpoint (clears the httpOnly cookie),
 * then clears the local UI session cache.
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
  } catch {
    // swallow — still clear local state
  }
  clearAuthSession();
  emitSessionChange();
}
