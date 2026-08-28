import { apiRequest } from "./httpClient";
const B = "/configuration/training-effectiveness";
const json = (v: unknown) => JSON.stringify(v);

export type EffectivenessWeightConfigDto = { id: number; companyId: number; reactionWeight: number; learningWeight: number; behaviorWeight: number; resultsWeight: number; isActive: boolean; effectiveFrom: string; createdAt: string; updatedAt: string };
export type CreateWeightConfigInput = { reactionWeight: number; learningWeight: number; behaviorWeight: number; resultsWeight: number; isActive?: boolean; effectiveFrom?: string };
export type UpdateWeightConfigInput = Partial<CreateWeightConfigInput>;

export const trainingEffectivenessApi = {
  list: (params: { page?: number; limit?: number; isActive?: boolean } = {}, signal?: AbortSignal) => {
    const sp = new URLSearchParams(); Object.entries(params).forEach(([k,v]) => { if (v !== undefined) sp.set(k, String(v)); });
    const s = sp.toString(); return apiRequest<EffectivenessWeightConfigDto[]>(s ? `${B}?${s}` : B, { signal });
  },
  getActive: (signal?: AbortSignal) => apiRequest<EffectivenessWeightConfigDto>(`${B}/active`, { signal }),
  getById: (id: number, signal?: AbortSignal) => apiRequest<EffectivenessWeightConfigDto>(`${B}/${id}`, { signal }),
  create: (input: CreateWeightConfigInput) => apiRequest<EffectivenessWeightConfigDto>(B, { method: "POST", body: json(input) }),
  update: (id: number, input: UpdateWeightConfigInput) => apiRequest<EffectivenessWeightConfigDto>(`${B}/${id}`, { method: "PATCH", body: json(input) }),
  deactivate: (id: number) => apiRequest<EffectivenessWeightConfigDto>(`${B}/${id}/deactivate`, { method: "PATCH" }),
  remove: (id: number) => apiRequest<{ message: string }>(`${B}/${id}`, { method: "DELETE" }),
};
