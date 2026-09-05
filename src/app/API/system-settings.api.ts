import { apiRequest } from "./httpClient";
import { refreshCompanyTheme } from "../services/theme.service";
const B = "/configuration/system-settings";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type SettingCategory = "GENERAL" | "ENROLLMENT" | "NOTIFICATIONS" | "CERTIFICATION" | "GAMIFICATION" | "SECURITY" | "INTEGRATIONS";
export type SettingValueType = "STRING" | "NUMBER" | "BOOLEAN" | "JSON";

export type SystemSettingDto = {
  id: number;
  companyId: number;
  category: SettingCategory;
  settingKey: string;
  settingValue: unknown;
  valueType: SettingValueType;
  description: string | null;
  isActive: boolean;
  createdBy: number | null;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateSystemSettingInput = {
  category: SettingCategory;
  settingKey: string;
  settingValue: unknown;
  valueType: SettingValueType;
  description?: string;
};

export type UpdateSystemSettingInput = {
  settingValue?: unknown;
  valueType?: SettingValueType;
  description?: string | null;
  isActive?: boolean;
};

export type BulkUpdateItemInput = {
  id?: number;
  settingKey?: string;
  settingValue?: unknown;
  isActive?: boolean;
};

export const systemSettingsApi = {
  list: (
    params: { search?: string; category?: SettingCategory; page?: number; pageSize?: number; isActive?: boolean } = {},
    signal?: AbortSignal,
  ) =>
    apiRequest<SystemSettingDto[]>(
      q(B, { ...params, ...(params.isActive != null ? { isActive: String(params.isActive) } : {}) }),
      { signal },
    ),
  getById: (id: number, signal?: AbortSignal) => apiRequest<SystemSettingDto>(`${B}/${id}`, { signal }),
  getByKey: (key: string, signal?: AbortSignal) => apiRequest<SystemSettingDto>(`${B}/key/${encodeURIComponent(key)}`, { signal }),
  listByCategory: (category: SettingCategory, signal?: AbortSignal) =>
    apiRequest<SystemSettingDto[]>(`${B}/category/${category}`, { signal }),
  create: (input: CreateSystemSettingInput) =>
    apiRequest<SystemSettingDto>(B, { method: "POST", body: json(input) }).then((r) => {
      // Branding settings are live — re-apply the company theme immediately.
      void refreshCompanyTheme();
      return r;
    }),
  update: (id: number, input: UpdateSystemSettingInput) =>
    apiRequest<SystemSettingDto>(`${B}/${id}`, { method: "PUT", body: json(input) }).then((r) => {
      void refreshCompanyTheme();
      return r;
    }),
  bulkUpdate: (items: BulkUpdateItemInput[]) =>
    apiRequest<SystemSettingDto[]>(`${B}/bulk`, { method: "PUT", body: json({ items }) }).then(
      (r) => {
        void refreshCompanyTheme();
        return r;
      },
    ),
  delete: (id: number) =>
    apiRequest<void>(`${B}/${id}`, { method: "DELETE" }).then((r) => {
      void refreshCompanyTheme();
      return r;
    }),
};
