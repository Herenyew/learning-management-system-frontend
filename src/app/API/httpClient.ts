/**
 * API HTTP Client
 *
 * Authentication strategy:
 *   Primary  — SSO cookie flow: the browser automatically sends the
 *              `lms_session` httpOnly cookie on every request because
 *              we set  credentials: "include".  No Authorization header
 *              is needed or available on the client side.
 *
 *   Fallback — Legacy EMS direct-login: if a Bearer token exists in
 *              sessionStorage/localStorage we include it as well.
 *              This keeps backward-compatibility without breaking the
 *              SSO path.
 */
import { clearAuthSession, getAuthSession, getAuthSessionToken } from "../services/authSession.service";

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1").replace(
  /\/$/,
  "",
);

type RequestOptions = RequestInit & {
  /** Override bearer token (rarely needed — prefer cookie auth). */
  token?: string;
};

type ApiEnvelope<T> = { success: true; data: T };
type ApiErrorEnvelope = {
  success: false;
  /** Legacy nested envelope: { error: { message, code, details } } */
  error?: { message: string; code?: string; details?: unknown };
  /** Current backend envelope: message/code/details live at the top level. */
  message?: string;
  code?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function apiStreamResponse(
  path: string,
  options: RequestOptions = {},
): Promise<Response> {
  const { token, headers, body, ...requestOptions } = options;
  const bearerToken = token ?? getAuthSessionToken();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...requestOptions,
    body,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      const session = getAuthSession();
      if (session) clearAuthSession();
    }

    let payload: ApiErrorEnvelope | undefined;
    try {
      payload = (await response.json()) as ApiErrorEnvelope;
    } catch {
      payload = undefined;
    }

    throw new ApiClientError(
      payload?.error?.message ?? payload?.message ?? `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      payload?.error?.code ?? payload?.code,
      payload?.error?.details ?? payload?.details,
    );
  }

  return response;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, ...requestOptions } = options;

  // For SSO sessions the session is the httpOnly cookie — no client-side token.
  // For legacy EMS sessions we still send the JWT as a Bearer token.
  const bearerToken = token ?? getAuthSessionToken(); // null for SSO sessions
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...requestOptions,
    body,
    // credentials: "include" sends the lms_session httpOnly cookie on every request.
    // This is the primary auth mechanism for SSO.
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      // Only add Authorization header when there is an actual token (EMS path).
      ...(bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {}),
      ...headers,
    },
  });

  // Parse the body first — a server may return JSON on both success AND error
  // responses (e.g. 422 with a validation detail object).  If the body is not
  // valid JSON (e.g. the server crashed before serialising), we swallow the
  // SyntaxError and treat the payload as undefined rather than letting an
  // uncaught rejection escape to the caller.
  let payload: unknown;
  if (response.status !== 204) {
    try {
      payload = (await response.json()) as unknown;
    } catch {
      payload = undefined;
    }
  }

  if (!response.ok) {
    // Only clear the local session cache on 401 when the server rejects the
    // session — the cookie expired or the session was revoked server-side.
    if (response.status === 401) {
      const session = getAuthSession();
      // Clear local UI cache so the user gets redirected to sign-in.
      // The httpOnly cookie will be cleared server-side on the logout call.
      if (session) clearAuthSession();
    }

    const apiError = payload as ApiErrorEnvelope | undefined;
    throw new ApiClientError(
      apiError?.error?.message ??
        apiError?.message ??
        `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      apiError?.error?.code ?? apiError?.code,
      apiError?.error?.details ?? apiError?.details,
    );
  }

  // Unwrap the standard { success: true, data: T } envelope if present
  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
