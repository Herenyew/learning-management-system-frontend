import type {
  LearnerProgramTask,
  PeerReviewQueueItem,
  ProgramTaskSubmission,
  SubmissionReviewQueueItem,
} from "../models/submission.model";
import { apiRequest } from "./httpClient";

const id = (value: number) => encodeURIComponent(String(value));
const json = (value: unknown) => JSON.stringify(value);

export const programTaskSubmissionApi = {
  listMine: (programEnrollmentId: number, signal?: AbortSignal) =>
    apiRequest<LearnerProgramTask[]>(`/enrollments/program/${id(programEnrollmentId)}/tasks`, {
      signal,
    }),
  submitText: (programEnrollmentId: number, taskId: number, textAnswer: string) =>
    apiRequest<{ submission: ProgramTaskSubmission }>(
      `/enrollments/program/${id(programEnrollmentId)}/tasks/${id(taskId)}/submissions`,
      { method: "POST", body: json({ submissionType: "TEXT_INPUT", textAnswer }) },
    ),
  submitLink: (programEnrollmentId: number, taskId: number, submissionUrl: string) =>
    apiRequest<{ submission: ProgramTaskSubmission }>(
      `/enrollments/program/${id(programEnrollmentId)}/tasks/${id(taskId)}/submissions`,
      { method: "POST", body: json({ submissionType: "LINK", submissionUrl }) },
    ),
  submitFile: async (programEnrollmentId: number, taskId: number, file: File) => {
    const upload = await apiRequest<{
      fileId: number;
      uploadUrl: string;
      method: "PUT";
      headers: Record<string, string>;
    }>(`/enrollments/program/${id(programEnrollmentId)}/tasks/${id(taskId)}/uploads`, {
      method: "POST",
      body: json({ fileName: file.name, mimeType: file.type, fileSizeBytes: file.size }),
    });
    const uploaded = await fetch(upload.uploadUrl, {
      method: upload.method,
      headers: upload.headers,
      body: file,
    });
    if (!uploaded.ok) throw new Error("The file could not be uploaded to storage.");
    return apiRequest<{ submission: ProgramTaskSubmission }>(
      `/enrollments/program/${id(programEnrollmentId)}/tasks/${id(taskId)}/submissions`,
      { method: "POST", body: json({ submissionType: "FILE_UPLOAD", fileId: upload.fileId }) },
    );
  },
  peerReviewQueue: (signal?: AbortSignal) =>
    apiRequest<PeerReviewQueueItem[]>("/submissions/peer-review-queue", { signal }),
  reviewQueue: (signal?: AbortSignal) =>
    apiRequest<SubmissionReviewQueueItem[]>("/submissions/review-queue", { signal }),
  approve: (submissionId: number, input: { score?: number; reviewComment?: string }) =>
    apiRequest<{ submission: ProgramTaskSubmission }>(`/submissions/${id(submissionId)}/approve`, {
      method: "POST",
      body: json(input),
    }),
  reject: (submissionId: number, reviewComment: string) =>
    apiRequest<{ submission: ProgramTaskSubmission }>(`/submissions/${id(submissionId)}/reject`, {
      method: "POST",
      body: json({ reviewComment }),
    }),
  peerReview: (submissionId: number, input: { reviewText?: string; rating?: number }) =>
    apiRequest(`/submissions/${id(submissionId)}/peer-reviews`, {
      method: "POST",
      body: json(input),
    }),
};
