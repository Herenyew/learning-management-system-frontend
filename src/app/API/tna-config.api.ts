import { apiRequest } from "./httpClient";
const B = "/configuration/tna";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type TnaRequestTypeDto = { id: number; companyId: number; name: string; description: string | null; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateTnaRequestTypeInput = { name: string; description?: string; isActive?: boolean };
export type UpdateTnaRequestTypeInput = Partial<CreateTnaRequestTypeInput>;

export type FundingTypeDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateFundingTypeInput = { name: string; slug?: string; description?: string; isActive?: boolean };
export type UpdateFundingTypeInput = Partial<CreateFundingTypeInput>;

export type TrainingFormatDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateTrainingFormatInput = { name: string; slug?: string; description?: string; isActive?: boolean };
export type UpdateTrainingFormatInput = Partial<CreateTrainingFormatInput>;

export const tnaConfigApi = {
  requestTypes: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<TnaRequestTypeDto[]>(q(`${B}/request-types`, params), { signal }),
    create: (input: CreateTnaRequestTypeInput) => apiRequest<TnaRequestTypeDto>(`${B}/request-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateTnaRequestTypeInput) => apiRequest<TnaRequestTypeDto>(`${B}/request-types/${id}`, { method: "PATCH", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/request-types/${id}`, { method: "DELETE" }),
  },
  fundingTypes: {
    list: (params: { search?: string; isActive?: boolean; isSystem?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<FundingTypeDto[]>(q(`${B}/funding-types`, params), { signal }),
    create: (input: CreateFundingTypeInput) => apiRequest<FundingTypeDto>(`${B}/funding-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateFundingTypeInput) => apiRequest<FundingTypeDto>(`${B}/funding-types/${id}`, { method: "PATCH", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/funding-types/${id}`, { method: "DELETE" }),
  },
  trainingFormats: {
    list: (params: { search?: string; isActive?: boolean; isSystem?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<TrainingFormatDto[]>(q(`${B}/training-formats`, params), { signal }),
    create: (input: CreateTrainingFormatInput) => apiRequest<TrainingFormatDto>(`${B}/training-formats`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateTrainingFormatInput) => apiRequest<TrainingFormatDto>(`${B}/training-formats/${id}`, { method: "PATCH", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/training-formats/${id}`, { method: "DELETE" }),
  },
};
