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

export type AuthSession = {
  version: 1;
  token: string;
  user: EmsUser;
  role: Role;
  rememberMe: boolean;
  createdAt: string;
};

export type AuthenticateSessionInput = EmsLoginInput & {
  rememberMe: boolean;
};

const LMS_ROLES: ReadonlySet<Role> = new Set(["learner", "hr", "manager", "creator", "admin"]);

const isAuthSession = (value: unknown): value is AuthSession => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const session = value as Partial<AuthSession>;
  return (
    session.version === 1 &&
    typeof session.token === "string" &&
    session.token.length > 0 &&
    typeof session.role === "string" &&
    LMS_ROLES.has(session.role as Role) &&
    typeof session.rememberMe === "boolean" &&
    typeof session.createdAt === "string" &&
    Boolean(session.user) &&
    typeof session.user?.id === "number" &&
    typeof session.user?.email === "string"
  );
};

const getBrowserStorage = (rememberMe: boolean): Storage | null => {
  if (typeof window === "undefined") return null;
  return rememberMe ? window.localStorage : window.sessionStorage;
};

const removeStoredSession = (storage: Storage) => {
  try {
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    // An unavailable storage area is equivalent to having no session there.
  }
};

const emitSessionChange = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
  }
};

const sessionFromResponse = (response: EmsLoginResponse, rememberMe: boolean): AuthSession => ({
  version: 1,
  token: response.token,
  user: response.data.user,
  role: mapEmsRoleToLmsRole(response.data.user),
  rememberMe,
  createdAt: new Date().toISOString(),
});

export class AuthSessionStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthSessionStorageError";
  }
}

export function saveAuthSession(response: EmsLoginResponse, rememberMe: boolean): AuthSession {
  const storage = getBrowserStorage(rememberMe);
  if (!storage || typeof window === "undefined") {
    throw new AuthSessionStorageError(
      "Browser storage is unavailable; the sign-in session cannot be saved.",
    );
  }

  removeStoredSession(window.localStorage);
  removeStoredSession(window.sessionStorage);

  const session = sessionFromResponse(response, rememberMe);
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

const readSession = (storage: Storage): AuthSession | null => {
  try {
    const serialized = storage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!serialized) return null;
    const value: unknown = JSON.parse(serialized);
    if (isAuthSession(value)) return value;
    storage.removeItem(AUTH_SESSION_STORAGE_KEY);
  } catch {
    removeStoredSession(storage);
  }
  return null;
};

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  return readSession(window.sessionStorage) ?? readSession(window.localStorage);
}

export function getAuthSessionToken(): string | null {
  return getAuthSession()?.token ?? null;
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  removeStoredSession(window.localStorage);
  removeStoredSession(window.sessionStorage);
  emitSessionChange();
}

export async function authenticateSession(
  input: AuthenticateSessionInput,
  signal?: AbortSignal,
): Promise<AuthSession> {
  const response = await loginWithEms(
    {
      email: input.email,
      password: input.password,
    },
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
  get: getAuthSession,
  getToken: getAuthSessionToken,
  clear: clearAuthSession,
};
