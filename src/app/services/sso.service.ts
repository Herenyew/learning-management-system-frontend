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
  if (me.roleName) {
    return mapEmsRoleToLmsRole(me.roleName);
  }

  const perms = me.permissions ?? [];
  if (perms.some((p) => p.startsWith("course.") && p.includes("publish"))) return "creator";
  if (perms.some((p) => p.startsWith("tna.") || p.includes("hr"))) return "hr";
  if (perms.some((p) => p.includes("manager") || p.includes("team"))) return "manager";
  if (perms.some((p) => p.includes("admin") || p.includes("system"))) return "admin";

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
    appUserId: me.appUserId,
    employeeId: me.employeeId,
    companyId: me.companyId,
    email: me.email,
    roleId: me.roleId,
    roleName: me.roleName,
    permissions: me.permissions,
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
