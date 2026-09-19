import { apiRequest } from "./httpClient";
const B = "/configuration/survey";
const TEMPLATES = "/configuration/templates";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => {
  const sp = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `${path}?${s}` : path;
};

export type SurveyType = "PRE_COURSE" | "POST_COURSE" | "MANAGER_FOLLOWUP";
export type KirkpatrickLevel = "L1_REACTION" | "L2_LEARNING" | "L3_BEHAVIOR" | "L4_RESULTS";

export type ConfigJson = Record<string, unknown>;

export type SurveyQuestionTypeDto = {
  id: number;
  companyId: number;
  name: string;
  slug: string;
  description: string | null;
  configJson: ConfigJson | null;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
export type CreateSurveyQuestionTypeInput = {
  name: string;
  slug: string;
  description?: string;
  configJson?: ConfigJson | null;
  isSystem?: boolean;
  isActive?: boolean;
};
export type UpdateSurveyQuestionTypeInput = Partial<CreateSurveyQuestionTypeInput>;

// Inline question payload used when a template and its questions are saved together.
// displayOrder is assigned automatically by the backend (array position + 1).
export type TemplateQuestionInlineInput = {
  questionTypeId: number;
  questionText: string;
  isRequired?: boolean;
  configJson?: ConfigJson | null;
};

export type SurveyTemplateDto = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  surveyType: SurveyType;
  kirkpatrickLevel: KirkpatrickLevel;
  isAnonymous: boolean;
  availableDays: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: SurveyTemplateQuestionDto[];
};
export type CreateSurveyTemplateInput = {
  name: string;
  description?: string;
  surveyType: SurveyType;
  kirkpatrickLevel: KirkpatrickLevel;
  isAnonymous?: boolean;
  availableDays?: number;
  isActive?: boolean;
  questions?: TemplateQuestionInlineInput[];
};
export type UpdateSurveyTemplateInput = Partial<CreateSurveyTemplateInput>;

// ─── Survey Template Questions (Dynamic Question Builder) ──────────────────
export type SurveyTemplateQuestionDto = {
  id: number;
  companyId: number;
  templateId: number;
  questionTypeId: number;
  questionText: string;
  isRequired: boolean;
  displayOrder: number;
  configJson: ConfigJson | null;
  questionType: SurveyQuestionTypeDto;
  createdAt: string;
  updatedAt: string;
};
export type CreateSurveyTemplateQuestionInput = {
  questionTypeId: number;
  questionText: string;
  isRequired?: boolean;
  configJson?: ConfigJson | null;
  displayOrder?: number;
};
export type UpdateSurveyTemplateQuestionInput = Partial<CreateSurveyTemplateQuestionInput>;
export type ReorderSurveyTemplateQuestionsInput = {
  questions: { id: number; displayOrder: number }[];
};

export const surveyConfigApi = {
  questionTypes: {
    list: (
      params: { search?: string; isActive?: boolean; page?: number; pageSize?: number } = {},
      signal?: AbortSignal,
    ) => apiRequest<SurveyQuestionTypeDto[]>(q(`${B}/survey-question-types`, params), { signal }),
    create: (input: CreateSurveyQuestionTypeInput) =>
      apiRequest<SurveyQuestionTypeDto>(`${B}/survey-question-types`, {
        method: "POST",
        body: json(input),
      }),
    update: (id: number, input: UpdateSurveyQuestionTypeInput) =>
      apiRequest<SurveyQuestionTypeDto>(`${B}/survey-question-types/${id}`, {
        method: "PUT",
        body: json(input),
      }),
    delete: (id: number) =>
      apiRequest<void>(`${B}/survey-question-types/${id}`, { method: "DELETE" }),
  },
  templates: {
    list: async (
      params: { search?: string; isActive?: boolean; page?: number; pageSize?: number } = {},
      signal?: AbortSignal,
    ): Promise<SurveyTemplateDto[]> => {
      const res = await apiRequest<SurveyTemplateDto[] | { items?: SurveyTemplateDto[] }>(
        q(`${TEMPLATES}/survey-templates`, params),
        { signal },
      );
      if (Array.isArray(res)) return res;
      return Array.isArray(res?.items) ? res.items : [];
    },
    get: (id: number, signal?: AbortSignal) =>
      apiRequest<SurveyTemplateDto>(`${TEMPLATES}/survey-templates/${id}`, { signal }),
    create: (input: CreateSurveyTemplateInput) =>
      apiRequest<SurveyTemplateDto>(`${TEMPLATES}/survey-templates`, {
        method: "POST",
        body: json(input),
      }),
    update: (id: number, input: UpdateSurveyTemplateInput) =>
      apiRequest<SurveyTemplateDto>(`${TEMPLATES}/survey-templates/${id}`, {
        method: "PUT",
        body: json(input),
      }),
    delete: (id: number) =>
      apiRequest<void>(`${TEMPLATES}/survey-templates/${id}`, { method: "DELETE" }),
  },
  templateQuestions: {
    list: (templateId: number, signal?: AbortSignal) =>
      apiRequest<SurveyTemplateQuestionDto[]>(
        `${TEMPLATES}/survey-templates/${templateId}/questions`,
        { signal },
      ),
    get: (templateId: number, id: number, signal?: AbortSignal) =>
      apiRequest<SurveyTemplateQuestionDto>(
        `${TEMPLATES}/survey-templates/${templateId}/questions/${id}`,
        { signal },
      ),
    create: (templateId: number, input: CreateSurveyTemplateQuestionInput) =>
      apiRequest<SurveyTemplateQuestionDto>(
        `${TEMPLATES}/survey-templates/${templateId}/questions`,
        { method: "POST", body: json(input) },
      ),
    update: (templateId: number, id: number, input: UpdateSurveyTemplateQuestionInput) =>
      apiRequest<SurveyTemplateQuestionDto>(
        `${TEMPLATES}/survey-templates/${templateId}/questions/${id}`,
        { method: "PUT", body: json(input) },
      ),
    // Backend responds 204 with no body on delete.
    delete: (templateId: number, id: number) =>
      apiRequest<void>(`${TEMPLATES}/survey-templates/${templateId}/questions/${id}`, {
        method: "DELETE",
      }),
    reorder: (templateId: number, input: ReorderSurveyTemplateQuestionsInput) =>
      apiRequest<SurveyTemplateQuestionDto[]>(
        `${TEMPLATES}/survey-templates/${templateId}/questions/reorder`,
        { method: "PUT", body: json(input) },
      ),
  },
};
