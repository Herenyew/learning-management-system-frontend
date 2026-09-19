import { apiRequest } from "./httpClient";
const B = "/configuration/custom-fields";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `${path}?${s}` : path;
};

export type CustomFieldTarget =
  | "COURSE"
  | "PROGRAM"
  | "TNA_REQUEST"
  | "ENROLLMENT"
  | "CERTIFICATE"
  | "USER_PROFILE"
  | "CONTENT";
export type CustomFieldType = "TEXT" | "NUMBER" | "SINGLE_SELECT" | "MULTI_SELECT" | "BOOLEAN";
export type CustomFieldDto = {
  id: number;
  companyId: number;
  target: CustomFieldTarget;
  fieldKey: string;
  label: string;
  description: string | null;
  fieldType: CustomFieldType;
  settingsJson: Record<string, unknown>;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};
export type CreateCustomFieldInput = {
  name: string;
  fieldKey: string;
  target: CustomFieldTarget;
  description?: string;
  fieldType?: CustomFieldType;
  settingsJson?: Record<string, unknown>;
  isRequired?: boolean;
  isActive?: boolean;
};
export type UpdateCustomFieldInput = Partial<CreateCustomFieldInput>;

export const customFieldsApi = {
  list: (
    params: {
      search?: string;
      target?: CustomFieldTarget;
      isActive?: boolean;
      page?: number;
      limit?: number;
    } = {},
    signal?: AbortSignal,
  ) => apiRequest<CustomFieldDto[]>(q(B, params), { signal }),
  create: (input: CreateCustomFieldInput) =>
    apiRequest<CustomFieldDto>(B, { method: "POST", body: json(input) }),
  update: (id: number, input: UpdateCustomFieldInput) =>
    apiRequest<CustomFieldDto>(`${B}/${id}`, { method: "PUT", body: json(input) }),
  delete: (id: number) => apiRequest<void>(`${B}/${id}`, { method: "DELETE" }),
};
