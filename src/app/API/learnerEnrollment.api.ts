import type {
  EnrollmentProgressDetail,
  LearnerCatalogVersion,
  LearnerCourseEnrollment,
  LearnerProgramEnrollment,
  ProgressEvaluationResult,
} from "../models/enrollment.model";
import { apiRequest } from "./httpClient";

const BASE = "/enrollments";
const id = (value: number) => encodeURIComponent(String(value));
const json = (value: unknown) => JSON.stringify(value);

export const learnerEnrollmentApi = {
  listCatalog: (signal?: AbortSignal) =>
    apiRequest<LearnerCatalogVersion[]>("/courses/catalog", { signal }),
  listMine: (signal?: AbortSignal) =>
    apiRequest<LearnerCourseEnrollment[]>(`${BASE}/my`, { signal }),
  listMyPrograms: (signal?: AbortSignal) =>
    apiRequest<LearnerProgramEnrollment[]>(`${BASE}/my/programs`, { signal }),
  getProgress: (enrollmentId: number, signal?: AbortSignal) =>
    apiRequest<EnrollmentProgressDetail>(`${BASE}/${id(enrollmentId)}/progress`, { signal }),
  enrollCourse: (courseVersionId: number) =>
    apiRequest<LearnerCourseEnrollment>(`${BASE}/course`, {
      method: "POST",
      body: json({ courseId: courseVersionId }),
    }),
  enrollProgram: (programId: number, cohortId: number) =>
    apiRequest<{ enrollment: LearnerProgramEnrollment; linkedCourseEnrollmentIds: number[] }>(
      `${BASE}/program`,
      {
        method: "POST",
        body: json({ programId, cohortId }),
      },
    ),
  updateContentProgress: (
    enrollmentId: number,
    contentId: number,
    input: {
      status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
      watchPercentage?: number;
      lastPositionSeconds?: number;
      timeSpentMinutes?: number;
    },
  ) =>
    apiRequest<ProgressEvaluationResult>(
      `${BASE}/${id(enrollmentId)}/progress/content/${id(contentId)}`,
      { method: "PUT", body: json(input) },
    ),
  reevaluate: (enrollmentId: number) =>
    apiRequest<ProgressEvaluationResult>(`${BASE}/course/${id(enrollmentId)}/complete`, {
      method: "POST",
      body: json({}),
    }),
  startSession: (enrollmentId: number, deviceType?: string) =>
    apiRequest<{ id: number }>(`${BASE}/${id(enrollmentId)}/sessions`, {
      method: "POST",
      body: json(deviceType ? { deviceType } : {}),
    }),
  endSession: (sessionId: number, totalSeconds?: number) =>
    apiRequest<{ id: number }>(`/learning-sessions/${id(sessionId)}`, {
      method: "PATCH",
      body: json(totalSeconds == null ? {} : { totalSeconds }),
    }),
};
