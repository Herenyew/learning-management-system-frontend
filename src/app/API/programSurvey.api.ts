import { apiRequest } from "./httpClient";

export type ProgramSurvey = {
  id: number;
  title: string;
  description: string | null;
  isAnonymous: boolean;
  status: string;
  availableFrom: string | null;
  availableUntil: string | null;
  questions: Array<{
    id: number;
    questionText: string;
    displayOrder: number;
    isRequired: boolean;
    questionType: { name: string; slug: string; configJson: unknown };
  }>;
  response: { id: number; submittedAt: string } | null;
};

export type ProgramSurveyAnswerInput = {
  questionId: number;
  ratingValue?: number;
  selectedOption?: string;
  textAnswer?: string;
};

const id = (value: number) => encodeURIComponent(String(value));

export const programSurveyApi = {
  get: (programEnrollmentId: number, surveyId: number, signal?: AbortSignal) =>
    apiRequest<ProgramSurvey>(
      `/enrollments/program/${id(programEnrollmentId)}/surveys/${id(surveyId)}`,
      { signal },
    ),
  submit: (programEnrollmentId: number, surveyId: number, answers: ProgramSurveyAnswerInput[]) =>
    apiRequest(`/enrollments/program/${id(programEnrollmentId)}/surveys/${id(surveyId)}`, {
      method: "POST",
      body: JSON.stringify({ answers }),
    }),
};
