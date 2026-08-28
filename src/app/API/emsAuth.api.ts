import type { Role } from "../models/app.model";

const emsApiBaseUrl = (import.meta.env.VITE_EMS_API_URL ?? "http://localhost:5000/api/v1").replace(
  /\/$/,
  "",
);

export type EmsLoginInput = {
  email: string;
  password: string;
};

export type EmsRole = {
  id: number;
  name: string;
};

export type EmsCompany = {
  company_code?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  logo_url?: string | null;
};

export type EmsEmployee = {
  id: string;
  full_name: string;
  profile_picture_url?: string | null;
  employments?: Array<{
    manager?: { full_name?: string | null } | null;
  }>;
};

export type EmsLmsSession = {
  synced: boolean;
  message?: string;
  permissions?: string[];
};

export type EmsUser = {
  id: number;
  email: string;
  company_id: number;
  company_code?: string | null;
  company?: EmsCompany | null;
  role_id: number | null;
  role?: EmsRole | null;
  employee_id: string | null;
  employee?: EmsEmployee | null;
  onboarding_status?: string | null;
  permissions?: unknown;
  lms?: EmsLmsSession | null;
  companyId?: number;
  roleId?: number;
};

export type EmsLoginResponse = {
  status: "success";
  token: string;
  data: {
    user: EmsUser;
  };
};

type EmsErrorResponse = {
  status?: string;
  message?: string;
};

const ROLE_ALIASES: Record<Role, ReadonlySet<string>> = {
  learner: new Set(["learner", "employee", "staff", "user"]),
  hr: new Set(["hr", "human resource", "human resources", "hr admin", "hr manager"]),
  manager: new Set(["manager", "line manager", "people manager", "supervisor", "team lead"]),
  creator: new Set([
    "creator",
    "course creator",
    "content creator",
    "instructor",
    "trainer",
    "learning creator",
  ]),
  admin: new Set(["admin", "administrator", "super admin", "system admin", "lms admin"]),
};

const normalizeRoleName = (value: string) =>
  value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");

const roleNameFrom = (value: unknown): string | null => {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const candidate = value as {
    name?: unknown;
    role_name?: unknown;
    role?: unknown;
  };
  if (typeof candidate.name === "string") return candidate.name;
  if (typeof candidate.role_name === "string") return candidate.role_name;
  if (typeof candidate.role === "string") return candidate.role;
  if (candidate.role && typeof candidate.role === "object" && !Array.isArray(candidate.role)) {
    const nestedName = (candidate.role as { name?: unknown }).name;
    if (typeof nestedName === "string") return nestedName;
  }
  return null;
};

/** Unknown EMS roles intentionally receive the least-privileged LMS role. */
export function mapEmsRoleToLmsRole(value: unknown): Role {
  const sourceName = roleNameFrom(value);
  if (!sourceName) return "learner";

  const normalizedName = normalizeRoleName(sourceName);
  const match = (Object.entries(ROLE_ALIASES) as Array<[Role, ReadonlySet<string>]>).find(
    ([, aliases]) => aliases.has(normalizedName),
  );
  return match?.[0] ?? "learner";
}

const isEmsUser = (value: unknown): value is EmsUser => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const user = value as Partial<EmsUser>;
  return (
    typeof user.id === "number" &&
    typeof user.email === "string" &&
    typeof user.company_id === "number" &&
    (typeof user.role_id === "number" || user.role_id === null) &&
    (typeof user.employee_id === "string" || user.employee_id === null)
  );
};

const isEmsLoginResponse = (value: unknown): value is EmsLoginResponse => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const response = value as Partial<EmsLoginResponse>;
  return (
    response.status === "success" &&
    typeof response.token === "string" &&
    response.token.length > 0 &&
    Boolean(response.data) &&
    isEmsUser(response.data?.user)
  );
};

const readResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    const text = await response.text();
    return text || undefined;
  }
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

export class EmsAuthError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "EmsAuthError";
  }
}

export async function loginWithEms(
  input: EmsLoginInput,
  signal?: AbortSignal,
): Promise<EmsLoginResponse> {
  const response = await fetch(`${emsApiBaseUrl}/auth/login`, {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }),
  });
  const payload = await readResponseBody(response);

  if (!response.ok) {
    const errorPayload = payload as EmsErrorResponse | undefined;
    throw new EmsAuthError(
      errorPayload?.message ?? `EMS sign-in failed: ${response.status} ${response.statusText}`,
      response.status,
    );
  }

  if (!isEmsLoginResponse(payload)) {
    throw new EmsAuthError("EMS returned an invalid login response.", response.status);
  }

  return payload;
}

export const emsAuthApi = {
  login: loginWithEms,
};
