import { apiRequest } from "./httpClient";
const B = "/configuration/assessment";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type AssessmentTypeDto = { id: number; companyId: number | null; code: string; name: string; description: string | null; isScored: boolean; isPractice: boolean; isGraded: boolean; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateAssessmentTypeInput = { code: string; name: string; description?: string; isScored?: boolean; isPractice?: boolean; isGraded?: boolean };
export type UpdateAssessmentTypeInput = Partial<CreateAssessmentTypeInput>;

export type QuestionTypeDto = { id: number; companyId: number; name: string; slug: string; description: string | null; answerStructure: "OPTION_BASED" | "MATCHING_PAIR_BASED" | "FREE_TEXT"; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateQuestionTypeInput = { name: string; slug: string; description?: string; answerStructure: "OPTION_BASED" | "MATCHING_PAIR_BASED" | "FREE_TEXT" };
export type UpdateQuestionTypeInput = Partial<CreateQuestionTypeInput>;

export type GradingMethodDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateGradingMethodInput = { name: string; slug: string; description?: string };
export type UpdateGradingMethodInput = Partial<CreateGradingMethodInput>;

export type AssessmentTemplateDto = {
  id: number;
  name: string;
  description: string | null;
  assessmentTypeId: number;
  gradingMethodId: number;
  passingScore: number;
  maxAttempts: number;
  timeLimitMinutes: number | null;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultImmediately: boolean;
  allowReview: boolean;
  showCorrectAnswers: string;
  lockdownBrowser: boolean;
  proctoringEnabled: boolean;
  negativeMarking: number | null;
  questionCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  assessmentType?: { id: number; name: string; code: string };
  gradingMethod?: { id: number; name: string; slug: string };
};

export type CreateAssessmentTemplateInput = {
  name: string;
  description?: string;
  assessmentTypeId: number;
  gradingMethodId: number;
  passingScore: number;
  maxAttempts?: number;
  timeLimitMinutes?: number;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResultImmediately?: boolean;
  allowReview?: boolean;
  showCorrectAnswers: "IMMEDIATELY" | "AFTER_SUBMIT" | "NEVER";
  lockdownBrowser?: boolean;
  proctoringEnabled?: boolean;
  negativeMarking?: number;
  questionCount?: number;
  isActive?: boolean;
};

export type UpdateAssessmentTemplateInput = Partial<CreateAssessmentTemplateInput>;

export const assessmentConfigApi = {
  assessmentTypes: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<AssessmentTypeDto[]>(q(`${B}/assessment-types`, params), { signal }),
    create: (input: CreateAssessmentTypeInput) => apiRequest<AssessmentTypeDto>(`${B}/assessment-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateAssessmentTypeInput) => apiRequest<AssessmentTypeDto>(`${B}/assessment-types/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/assessment-types/${id}`, { method: "DELETE" }),
  },
  questionTypes: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<QuestionTypeDto[]>(q(`${B}/question-types`, params), { signal }),
    create: (input: CreateQuestionTypeInput) => apiRequest<QuestionTypeDto>(`${B}/question-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateQuestionTypeInput) => apiRequest<QuestionTypeDto>(`${B}/question-types/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/question-types/${id}`, { method: "DELETE" }),
  },
  gradingMethods: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<GradingMethodDto[]>(q(`${B}/grading-methods`, params), { signal }),
    create: (input: CreateGradingMethodInput) => apiRequest<GradingMethodDto>(`${B}/grading-methods`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateGradingMethodInput) => apiRequest<GradingMethodDto>(`${B}/grading-methods/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/grading-methods/${id}`, { method: "DELETE" }),
  },
  templates: {
    list: (params: { search?: string; assessmentTypeId?: number; gradingMethodId?: number; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<AssessmentTemplateDto[]>(q(`${B}/templates`, params), { signal }),
    getById: (id: number, signal?: AbortSignal) => apiRequest<AssessmentTemplateDto>(`${B}/templates/${id}`, { signal }),
    create: (input: CreateAssessmentTemplateInput) => apiRequest<AssessmentTemplateDto>(`${B}/templates`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateAssessmentTemplateInput) => apiRequest<AssessmentTemplateDto>(`${B}/templates/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/templates/${id}`, { method: "DELETE" }),
  },
};
