import { apiRequest } from "./httpClient";
const B = "/configuration/system-settings";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type SettingCategory = "GENERAL" | "ENROLLMENT" | "NOTIFICATIONS" | "CERTIFICATION" | "GAMIFICATION" | "SECURITY" | "INTEGRATIONS";
export type SystemSettingDto = { id: number; companyId: number; category: SettingCategory; settingKey: string; settingValue: unknown; description: string | null; updatedAt: string };
export type CreateSystemSettingInput = { category: SettingCategory; settingKey: string; settingValue: unknown; description?: string };
export type UpdateSystemSettingInput = { settingValue?: unknown; description?: string };

export const systemSettingsApi = {
  list: (params: { search?: string; category?: SettingCategory; page?: number; pageSize?: number } = {}, signal?: AbortSignal) => apiRequest<SystemSettingDto[]>(q(B, params), { signal }),
  getById: (id: number, signal?: AbortSignal) => apiRequest<SystemSettingDto>(`${B}/${id}`, { signal }),
  getByKey: (key: string, signal?: AbortSignal) => apiRequest<SystemSettingDto>(`${B}/key/${encodeURIComponent(key)}`, { signal }),
  create: (input: CreateSystemSettingInput) => apiRequest<SystemSettingDto>(B, { method: "POST", body: json(input) }),
  update: (id: number, input: UpdateSystemSettingInput) => apiRequest<SystemSettingDto>(`${B}/${id}`, { method: "PUT", body: json(input) }),
  delete: (id: number) => apiRequest<void>(`${B}/${id}`, { method: "DELETE" }),
};
