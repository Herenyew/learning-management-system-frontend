import type {
  AssessmentAnswerInput,
  AssessmentAttempt,
  AssessmentAttemptResult,
} from "../models/assessment.model";
import { apiRequest } from "./httpClient";

const id = (value: number) => encodeURIComponent(String(value));
const json = (value: unknown) => JSON.stringify(value);

export const assessmentAttemptApi = {
  start: (assessmentId: number, enrollmentId: number) =>
    apiRequest<AssessmentAttempt>(`/assessments/${id(assessmentId)}/attempts`, {
      method: "POST",
      body: json({ enrollmentId }),
    }),
  get: (attemptId: number, signal?: AbortSignal) =>
    apiRequest<AssessmentAttempt>(`/assessment-attempts/${id(attemptId)}`, { signal }),
  saveAnswer: (attemptId: number, questionVersionId: number, input: AssessmentAnswerInput) =>
    apiRequest<AssessmentAttempt>(
      `/assessment-attempts/${id(attemptId)}/answers/${id(questionVersionId)}`,
      { method: "PUT", body: json(input) },
    ),
  submit: (attemptId: number) =>
    apiRequest<AssessmentAttemptResult>(`/assessment-attempts/${id(attemptId)}/submit`, {
      method: "POST",
      body: json({}),
    }),
  result: (attemptId: number, signal?: AbortSignal) =>
    apiRequest<AssessmentAttemptResult>(`/assessment-attempts/${id(attemptId)}/result`, { signal }),
};
