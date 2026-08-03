const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api").replace(
  /\/$/,
  "",
);
const defaultCompanyId =
  import.meta.env.VITE_DEFAULT_COMPANY_ID ?? "00000000-0000-4000-8000-000000000001";

type RequestOptions = RequestInit & {
  token?: string;
  companyId?: string;
};

type ApiEnvelope<T> = { success: true; data: T };
type ApiErrorEnvelope = {
  success: false;
  error: { message: string; code?: string; details?: unknown };
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

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, companyId = defaultCompanyId, headers, body, ...requestOptions } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(`${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
    ...requestOptions,
    body,
    headers: {
      Accept: "application/json",
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      ...(companyId ? { "x-company-id": companyId } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const payload = response.status === 204 ? undefined : ((await response.json()) as unknown);

  if (!response.ok) {
    const apiError = payload as ApiErrorEnvelope | undefined;
    throw new ApiClientError(
      apiError?.error?.message ?? `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      apiError?.error?.code,
      apiError?.error?.details,
    );
  }

  if (payload && typeof payload === "object" && "success" in payload && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }

  return payload as T;
}
