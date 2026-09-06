import { apiRequest } from "./httpClient";
const B = "/configuration/notification";
const TEMPLATES = "/configuration/templates";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type NotificationModuleDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateNotificationModuleInput = { name: string; slug: string; description?: string; isSystem?: boolean };
export type UpdateNotificationModuleInput = Partial<CreateNotificationModuleInput> & { isActive?: boolean };

export type NotificationEventDto = { id: number; companyId: number; code: string; name: string; description: string | null; moduleId: number; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateNotificationEventInput = { code: string; name: string; description?: string; moduleId: number };
export type UpdateNotificationEventInput = Partial<CreateNotificationEventInput> & { isActive?: boolean };

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";
export type NotificationTemplateDto = { id: number; companyId: number; name: string; description: string | null; channel: NotificationChannel; eventCode: string; notificationEventId: number | null; subject: string | null; body: string; variables: Record<string, unknown> | null; language: string; senderName: string | null; replyToEmail: string | null; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateNotificationTemplateInput = { name: string; description?: string; channel: NotificationChannel; eventCode: string; notificationEventId?: number; subject?: string; body: string; variables?: Record<string, unknown>; language?: string; senderName?: string; replyToEmail?: string; isActive?: boolean };
export type UpdateNotificationTemplateInput = Partial<CreateNotificationTemplateInput>;

export const notificationConfigApi = {
  modules: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<NotificationModuleDto[]>(q(`${B}/modules`, params), { signal }),
    create: (input: CreateNotificationModuleInput) => apiRequest<NotificationModuleDto>(`${B}/modules`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateNotificationModuleInput) => apiRequest<NotificationModuleDto>(`${B}/modules/${id}`, { method: "PATCH", body: json(input) }),
    deactivate: (id: number) => apiRequest<NotificationModuleDto>(`${B}/modules/${id}/deactivate`, { method: "PATCH" }),
  },
  events: {
    list: (params: { search?: string; moduleId?: number; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<NotificationEventDto[]>(q(`${B}/events`, params), { signal }),
    create: (input: CreateNotificationEventInput) => apiRequest<NotificationEventDto>(`${B}/events`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateNotificationEventInput) => apiRequest<NotificationEventDto>(`${B}/events/${id}`, { method: "PATCH", body: json(input) }),
    deactivate: (id: number) => apiRequest<NotificationEventDto>(`${B}/events/${id}/deactivate`, { method: "PATCH" }),
  },
  templates: {
    list: (params: { search?: string; channel?: NotificationChannel; eventCode?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<NotificationTemplateDto[]>(q(`${TEMPLATES}/notification-templates`, params), { signal }),
    create: (input: CreateNotificationTemplateInput) => apiRequest<NotificationTemplateDto>(`${TEMPLATES}/notification-templates`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateNotificationTemplateInput) => apiRequest<NotificationTemplateDto>(`${TEMPLATES}/notification-templates/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${TEMPLATES}/notification-templates/${id}`, { method: "DELETE" }),
  },
};
