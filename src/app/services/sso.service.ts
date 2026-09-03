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
 * Maps the LMS /me response to an LMS Role.
 *
 * Priority order:
 *  1. roleName string (e.g. "HR Admin", "Course Creator") — via mapEmsRoleToLmsRole
 *  2. permissions array — if it contains permission codes that indicate a role
 *  3. Default to "learner"
 */
export function mapMeResponseToRole(me: LmsMeResponse): Role {
  // Priority 1: roleName from /me response — this is the LMS AppRole.name that the
  // backend resolved after DB lookup. It is the most accurate source.
  // We use this instead of hardcoded roleId comparisons so the system works
  // regardless of what IDs the admin assigns to roles.
  if (me.roleName) {
    return mapEmsRoleToLmsRole(me.roleName);
  }

  // Priority 2: permissions array — derive role from what the user can actually do.
  // This handles edge cases where roleName is missing (e.g. first login, sync lag).
  const perms = me.permissions ?? [];
  if (perms.includes("access_control.manage") || perms.includes("system_config.manage")) return "admin";
  if (perms.includes("tna.view_all") && perms.includes("analytics.view")) return "manager";
  if (perms.includes("course.create") || perms.includes("course.publish")) return "creator";
  if (perms.some((p) => p.includes("hr"))) return "hr";

  return "learner";
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

    const data = await response.json();
    if (!data.success || !data.data) return { isAuthenticated: false };

    const me = data.data as LmsMeResponse;
    const role = mapMeResponseToRole(me);
    return { isAuthenticated: true, role, me };
  } catch {
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
