import { apiRequest } from "./httpClient";
const B = "/configuration/enrollment";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type EnrollmentRuleTypeDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateEnrollmentRuleTypeInput = { name: string; slug?: string; description?: string; isActive?: boolean };
export type UpdateEnrollmentRuleTypeInput = Partial<CreateEnrollmentRuleTypeInput>;

export type EnrollmentRuleDto = { id: number; companyId: number; name: string; description: string | null; entityType: "COURSE" | "PROGRAM"; courseVersionId: number | null; programId: number | null; ruleTypeId: number; priority: number; isActive: boolean; targetAudienceId: number | null; conditionExpression: Record<string, unknown> | null; createdAt: string; updatedAt: string };
export type CreateEnrollmentRuleInput = { name: string; description?: string; entityType: "COURSE" | "PROGRAM"; courseVersionId?: number | null; programId?: number | null; ruleTypeId: number; priority?: number; isActive?: boolean; targetAudienceId?: number | null; conditionExpression?: Record<string, unknown> | null };
export type UpdateEnrollmentRuleInput = Partial<CreateEnrollmentRuleInput>;

/** Reference option returned by the dropdown endpoints. */
export type EnrollmentReferenceOption = { id: number; label: string };

export const enrollmentApi = {
  ruleTypes: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<EnrollmentRuleTypeDto[]>(q(`${B}/rule-types`, params), { signal }),
    create: (input: CreateEnrollmentRuleTypeInput) => apiRequest<EnrollmentRuleTypeDto>(`${B}/rule-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateEnrollmentRuleTypeInput) => apiRequest<EnrollmentRuleTypeDto>(`${B}/rule-types/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/rule-types/${id}`, { method: "DELETE" }),
  },
  rules: {
    list: (params: { search?: string; ruleTypeId?: number; entityType?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<EnrollmentRuleDto[]>(q(`${B}/rules`, params), { signal }),
    create: (input: CreateEnrollmentRuleInput) => apiRequest<EnrollmentRuleDto>(`${B}/rules`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateEnrollmentRuleInput) => apiRequest<EnrollmentRuleDto>(`${B}/rules/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/rules/${id}`, { method: "DELETE" }),
  },
  courseVersions: {
    list: (params: { search?: string; limit?: number } = {}, signal?: AbortSignal) => apiRequest<EnrollmentReferenceOption[]>(q(`${B}/course-versions`, params), { signal }),
  },
  programs: {
    list: (params: { search?: string; limit?: number } = {}, signal?: AbortSignal) => apiRequest<EnrollmentReferenceOption[]>(q(`${B}/programs`, params), { signal }),
  },
};
