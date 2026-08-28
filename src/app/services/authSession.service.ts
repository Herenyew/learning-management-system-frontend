/**
 * Auth Session Service
 *
 * Supports two authentication paths:
 *
 *  1. SSO (OAuth2 cookie flow) — the primary flow for LMS.
 *     The LMS backend issues an httpOnly session cookie after code exchange.
 *     We store a lightweight SsoSession in sessionStorage (no raw token —
 *     the real token lives in the cookie that the browser sends automatically).
 *
 *  2. EMS direct login (legacy / dev fallback).
 *     Kept for backward compatibility; stores EmsUser + JWT in storage.
 */

import {
  EmsAuthError,
  loginWithEms,
  mapEmsRoleToLmsRole,
  type EmsLoginInput,
  type EmsLoginResponse,
  type EmsUser,
} from "../API/emsAuth.api";
import type { Role } from "../models/app.model";

export const AUTH_SESSION_STORAGE_KEY = "learnos_auth_session";
export const AUTH_SESSION_CHANGED_EVENT = "learnos:auth-session-changed";

// ─── Session types ────────────────────────────────────────────────────────────

/** Lightweight user info stored after SSO login (no raw JWT). */
export type SsoUser = {
  appUserId: number;
  employeeId: string;
  companyId: number;
  email: string;
  /** Backend /me returns roleId as a string. */
  roleId: number | string;
  roleName?: string;
  permissions: string[];
  /** Display name resolved from employee record or email. */
  displayName: string;
};

/** Session created via SSO / OAuth2 cookie flow. */
export type SsoSession = {
  version: 2;
  kind: "sso";
  user: SsoUser;
  role: Role;
  createdAt: string;
};

/** Session created via legacy EMS direct login. */
export type EmsSession = {
  version: 1;
  token: string;
  user: EmsUser;
  role: Role;
  rememberMe: boolean;
  createdAt: string;
};

export type AuthSession = SsoSession | EmsSession;

export type AuthenticateSessionInput = EmsLoginInput & {
  rememberMe: boolean;
};

// ─── Guards ───────────────────────────────────────────────────────────────────

const LMS_ROLES: ReadonlySet<Role> = new Set(["learner", "hr", "manager", "creator", "admin"]);

const isSsoSession = (value: unknown): value is SsoSession => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const s = value as Partial<SsoSession>;
  return (
    s.version === 2 &&
    s.kind === "sso" &&
    typeof s.role === "string" &&
    LMS_ROLES.has(s.role as Role) &&
    typeof s.createdAt === "string" &&
    Boolean(s.user) &&
    typeof s.user?.appUserId === "number" &&
    typeof s.user?.email === "string"
  );
};

const isEmsSession = (value: unknown): value is EmsSession => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const s = value as Partial<EmsSession>;
  return (
    s.version === 1 &&
    typeof s.token === "string" &&
    s.token.length > 0 &&
    typeof s.role === "string" &&
    LMS_ROLES.has(s.role as Role) &&
    typeof s.rememberMe === "boolean" &&
    typeof s.createdAt === "string" &&
    Boolean(s.user) &&
    typeof s.user?.id === "number" &&
    typeof s.user?.email === "string"
  );
};

const isAuthSession = (value: unknown): value is AuthSession =>
  isSsoSession(value) || isEmsSession(value);

// ─── Storage helpers ──────────────────────────────────────────────────────────

const getBrowserStorage = (rememberMe: boolean): Storage | null => {
  if (typeof window === "undefined") return null;
  return rememberMe ? window.localStorage : window.sessionStorage;
};

const removeStoredSession = (storage: Storage) => {
  try {
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // unavailable storage = no session
  }
};

export const emitSessionChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
};

// ─── SSO session helpers ──────────────────────────────────────────────────────

/**
 * Save an SSO session to sessionStorage (survives page reload, cleared on tab close).
 * Always uses sessionStorage — the real auth state is the httpOnly cookie; this is
 * just a UI cache for display name, role, etc.
 */
export function saveSsoSession(user: SsoUser, role: Role): SsoSession {
  if (typeof window === "undefined") return { version: 2, kind: "sso", user, role, createdAt: new Date().toISOString() };

  const session: SsoSession = {
    version: 2,
    kind: "sso",
    user,
    role,
    createdAt: new Date().toISOString(),
  };

  // Clear any stale EMS session first
  removeStoredSession(window.localStorage);
  removeStoredSession(window.sessionStorage);

  try {
    window.sessionStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // sessionStorage unavailable — session lives only in memory this page load
  }

  emitSessionChange();
  return session;
}

// ─── EMS session helpers (legacy) ────────────────────────────────────────────

export class AuthSessionStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthSessionStorageError";
  }
}

const emsSessionFromResponse = (response: EmsLoginResponse, rememberMe: boolean): EmsSession => ({
  version: 1,
  token: response.token,
  user: response.data.user,
  role: mapEmsRoleToLmsRole(response.data.user),
  rememberMe,
  createdAt: new Date().toISOString(),
});

export function saveAuthSession(response: EmsLoginResponse, rememberMe: boolean): EmsSession {
  const storage = getBrowserStorage(rememberMe);
  if (!storage || typeof window === "undefined") {
    throw new AuthSessionStorageError(
      "Browser storage is unavailable; the sign-in session cannot be saved.",
    );
  }

  removeStoredSession(window.localStorage);
  removeStoredSession(window.sessionStorage);

  const session = emsSessionFromResponse(response, rememberMe);
  try {
    storage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    throw new AuthSessionStorageError(
      rememberMe
        ? "Persistent browser storage is unavailable; disable remember me and try again."
        : "Session storage is unavailable; allow site storage and try again.",
    );
  }

  emitSessionChange();
  return session;
}

// ─── Read / clear ─────────────────────────────────────────────────────────────

const readSession = (storage: Storage): AuthSession | null => {
  try {
    const serialized = storage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!serialized) return null;
    const value: unknown = JSON.parse(serialized);
    if (isAuthSession(value)) return value;
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    try { storage.removeItem(AUTH_SESSION_STORAGE_KEY); } catch { /* ignore */ }
  }
  return null;
};

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return readSession(window.sessionStorage) ?? readSession(window.localStorage);
}

/** Returns the EMS JWT token if the session is an EMS session, null otherwise. */
export function getAuthSessionToken(): string | null {
  const session = getAuthSession();
  if (!session) return null;
  return session.version === 1 ? session.token : null;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  removeStoredSession(window.localStorage);
  removeStoredSession(window.sessionStorage);
  emitSessionChange();
}

// ─── Derived display helpers ──────────────────────────────────────────────────

/**
 * Returns the display name for the currently authenticated user,
 * regardless of whether the session is SSO or EMS.
 */
export function getAuthDisplayName(session: AuthSession | null): string {
  if (!session) return "LMS User";
  if (session.version === 2) return session.user.displayName || session.user.email;
  return session.user.employee?.full_name ?? session.user.email ?? "LMS User";
}

export function getAuthInitials(session: AuthSession | null): string {
  const name = getAuthDisplayName(session);
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0] ?? "")
      .join("")
      .toUpperCase() || "LU"
  );
}

export function getAuthSubtitle(session: AuthSession | null, roleLabel: string): string {
  if (!session) return roleLabel;
  if (session.version === 2) {
    // SSO session — companyId is a number
    return `${session.user.companyId} · ${roleLabel}`;
  }
  // EMS session — company_code may be present
  const code =
    session.user.company_code ??
    (session.user.company as { company_code?: string } | null | undefined)?.company_code ??
    "";
  return code ? `${code} · ${roleLabel}` : roleLabel;
}

// ─── EMS direct-login authenticate (legacy) ──────────────────────────────────

export async function authenticateSession(
  input: AuthenticateSessionInput,
  signal?: AbortSignal,
): Promise<EmsSession> {
  const response = await loginWithEms(
    { email: input.email, password: input.password },
    signal,
  );
  if (response.data.user.lms?.synced !== true) {
    throw new EmsAuthError(
      response.data.user.lms?.message ??
        "Your EMS account is valid, but the LMS profile could not be synchronized.",
      503,
    );
  }
  return saveAuthSession(response, input.rememberMe);
}

export const authSessionService = {
  authenticate: authenticateSession,
  save: saveAuthSession,
  saveSso: saveSsoSession,
  get: getAuthSession,
  getToken: getAuthSessionToken,
  clear: clearAuthSession,
};
