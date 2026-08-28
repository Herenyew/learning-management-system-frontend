import { apiRequest } from "./httpClient";
const B = "/configuration/survey";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type SurveyType = "PRE_COURSE" | "POST_COURSE" | "MANAGER_FOLLOWUP";
export type KirkpatrickLevel = "L1_REACTION" | "L2_LEARNING" | "L3_BEHAVIOR" | "L4_RESULTS";

export type SurveyQuestionTypeDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateSurveyQuestionTypeInput = { name: string; slug: string; description?: string; isSystem?: boolean; isActive?: boolean };
export type UpdateSurveyQuestionTypeInput = Partial<CreateSurveyQuestionTypeInput>;

export type SurveyTemplateDto = { id: number; companyId: number; name: string; description: string | null; surveyType: SurveyType; kirkpatrickLevel: KirkpatrickLevel; isAnonymous: boolean; availableDays: number | null; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateSurveyTemplateInput = { name: string; description?: string; surveyType: SurveyType; kirkpatrickLevel: KirkpatrickLevel; isAnonymous?: boolean; availableDays?: number; isActive?: boolean };
export type UpdateSurveyTemplateInput = Partial<CreateSurveyTemplateInput>;

export const surveyConfigApi = {
  questionTypes: {
    list: (params: { search?: string; isActive?: boolean; page?: number; pageSize?: number } = {}, signal?: AbortSignal) => apiRequest<SurveyQuestionTypeDto[]>(q(`${B}/survey-question-types`, params), { signal }),
    create: (input: CreateSurveyQuestionTypeInput) => apiRequest<SurveyQuestionTypeDto>(`${B}/survey-question-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateSurveyQuestionTypeInput) => apiRequest<SurveyQuestionTypeDto>(`${B}/survey-question-types/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/survey-question-types/${id}`, { method: "DELETE" }),
  },
  templates: {
    list: (params: { search?: string; isActive?: boolean; page?: number; pageSize?: number } = {}, signal?: AbortSignal) => apiRequest<SurveyTemplateDto[]>(q(`${B}/templates`, params), { signal }),
    create: (input: CreateSurveyTemplateInput) => apiRequest<SurveyTemplateDto>(`${B}/templates`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateSurveyTemplateInput) => apiRequest<SurveyTemplateDto>(`${B}/templates/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/templates/${id}`, { method: "DELETE" }),
  },
};
