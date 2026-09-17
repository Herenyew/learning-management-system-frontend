import type {
  BulkEnrollProgramCohortEmployeesInput,
  CreateProgramCohortInput,
  CreateProgramCourseInput,
  EnrollProgramCohortEmployeeInput,
  CreateProgramInput,
  JoinProgramCohortWaitlistInput,
  CreateProgramMilestoneInput,
  CreateProgramTaskInput,
  DuplicateProgramInput,
  ApplyProgramTemplateInput,
  Program,
  ProgramApprovalActionResult,
  ProgramApprovalRequirements,
  ProgramAuditHistory,
  ProgramCohort,
  ProgramCohortBulkEnrollmentResult,
  ProgramCohortEnrollmentRemovalResult,
  ProgramCohortEnrollmentResult,
  ProgramCohortRoster,
  ProgramCohortWaitlist,
  ProgramCohortWaitlistAcceptResult,
  ProgramCohortWaitlistEntry,
  ProgramCohortWaitlistJoinResult,
  ProgramCohortWaitlistProcessResult,
  ProgramCompositionOrderInput,
  ProgramCourse,
  ProgramDeleteResult,
  ProgramMilestone,
  ProgramOwnerOption,
  ProgramTargetAudience,
  ProgramTask,
  ReplaceProgramTargetAudiencesInput,
  SaveProgramAsTemplateInput,
  UpdateProgramCohortInput,
  UpdateProgramCourseInput,
  UpdateProgramInput,
  UpdateProgramMilestoneInput,
  UpdateProgramTaskInput,
} from "../models/program.model";
import type { ProgramTemplateDto } from "./catalogConfiguration.api";
import type { ProgramRuntimeAnalytics } from "../models/enrollment.model";
import { apiRequest } from "./httpClient";

const PROGRAMS_PATH = "/programs";
const json = (value: unknown) => JSON.stringify(value);
const idPath = (id: number | string) => encodeURIComponent(String(id));
const programPath = (programId: number | string, suffix = "") =>
  `${PROGRAMS_PATH}/${idPath(programId)}${suffix}`;
const childPath = (programId: number | string, collection: string, itemId: number) =>
  programPath(programId, `/${collection}/${itemId}`);

export const programApi = {
  create: (input: CreateProgramInput) =>
    apiRequest<Program>(PROGRAMS_PATH, { method: "POST", body: json(input) }),

  list: (signal?: AbortSignal) => apiRequest<Program[]>(PROGRAMS_PATH, { signal }),

  runtimeAnalytics: (signal?: AbortSignal) =>
    apiRequest<ProgramRuntimeAnalytics>(`${PROGRAMS_PATH}/analytics/runtime`, { signal }),

  listOwnerOptions: (signal?: AbortSignal) =>
    apiRequest<ProgramOwnerOption[]>(`${PROGRAMS_PATH}/owner-options`, { signal }),

  getById: (id: number | string, signal?: AbortSignal) =>
    apiRequest<Program>(programPath(id), { signal }),

  update: (id: number | string, input: UpdateProgramInput) =>
    apiRequest<Program>(programPath(id), { method: "PATCH", body: json(input) }),

  archive: (id: number | string) =>
    apiRequest<Program>(programPath(id, "/archive"), { method: "POST" }),

  restore: (id: number | string) =>
    apiRequest<Program>(programPath(id, "/restore"), { method: "POST" }),

  duplicate: (id: number | string, input: DuplicateProgramInput = {}) =>
    apiRequest<Program>(programPath(id, "/duplicate"), { method: "POST", body: json(input) }),

  createFromTemplate: (templateId: number, input: ApplyProgramTemplateInput) =>
    apiRequest<Program>(`${PROGRAMS_PATH}/from-template/${idPath(templateId)}`, {
      method: "POST",
      body: json(input),
    }),

  saveAsTemplate: (id: number | string, input: SaveProgramAsTemplateInput) =>
    apiRequest<ProgramTemplateDto>(programPath(id, "/save-as-template"), {
      method: "POST",
      body: json(input),
    }),

  getAuditHistory: (id: number | string, signal?: AbortSignal) =>
    apiRequest<ProgramAuditHistory>(programPath(id, "/audit-history"), { signal }),

  targetAudiences: {
    list: (programId: number | string, signal?: AbortSignal) =>
      apiRequest<ProgramTargetAudience[]>(programPath(programId, "/target-audiences"), { signal }),
    replace: (programId: number | string, input: ReplaceProgramTargetAudiencesInput) =>
      apiRequest<ProgramTargetAudience[]>(programPath(programId, "/target-audiences"), {
        method: "PUT",
        body: json(input),
      }),
  },

  cohorts: {
    list: (programId: number | string, signal?: AbortSignal) =>
      apiRequest<ProgramCohort[]>(programPath(programId, "/cohorts"), { signal }),
    create: (programId: number | string, input: CreateProgramCohortInput) =>
      apiRequest<ProgramCohort>(programPath(programId, "/cohorts"), {
        method: "POST",
        body: json(input),
      }),
    update: (programId: number | string, cohortId: number, input: UpdateProgramCohortInput) =>
      apiRequest<ProgramCohort>(childPath(programId, "cohorts", cohortId), {
        method: "PATCH",
        body: json(input),
      }),
    delete: (programId: number | string, cohortId: number) =>
      apiRequest<ProgramDeleteResult>(childPath(programId, "cohorts", cohortId), {
        method: "DELETE",
      }),
    getRoster: (programId: number | string, cohortId: number, signal?: AbortSignal) =>
      apiRequest<ProgramCohortRoster>(programPath(programId, `/cohorts/${cohortId}/roster`), {
        signal,
      }),
    enroll: (
      programId: number | string,
      cohortId: number,
      input: EnrollProgramCohortEmployeeInput,
    ) =>
      apiRequest<ProgramCohortEnrollmentResult>(
        programPath(programId, `/cohorts/${cohortId}/enrollments`),
        { method: "POST", body: json(input) },
      ),
    bulkEnroll: (
      programId: number | string,
      cohortId: number,
      input: BulkEnrollProgramCohortEmployeesInput,
    ) =>
      apiRequest<ProgramCohortBulkEnrollmentResult>(
        programPath(programId, `/cohorts/${cohortId}/enrollments/bulk`),
        { method: "POST", body: json(input) },
      ),
    removeEnrollment: (programId: number | string, cohortId: number, enrollmentId: number) =>
      apiRequest<ProgramCohortEnrollmentRemovalResult>(
        programPath(programId, `/cohorts/${cohortId}/enrollments/${enrollmentId}`),
        { method: "DELETE" },
      ),
    getWaitlist: (programId: number | string, cohortId: number, signal?: AbortSignal) =>
      apiRequest<ProgramCohortWaitlist>(programPath(programId, `/cohorts/${cohortId}/waitlist`), {
        signal,
      }),
    joinWaitlist: (
      programId: number | string,
      cohortId: number,
      input: JoinProgramCohortWaitlistInput,
    ) =>
      apiRequest<ProgramCohortWaitlistJoinResult>(
        programPath(programId, `/cohorts/${cohortId}/waitlist`),
        { method: "POST", body: json(input) },
      ),
    cancelWaitlistEntry: (programId: number | string, cohortId: number, entryId: number) =>
      apiRequest<ProgramCohortWaitlistEntry>(
        programPath(programId, `/cohorts/${cohortId}/waitlist/${entryId}`),
        { method: "DELETE" },
      ),
    processWaitlist: (programId: number | string, cohortId: number) =>
      apiRequest<ProgramCohortWaitlistProcessResult>(
        programPath(programId, `/cohorts/${cohortId}/waitlist/process`),
        { method: "POST" },
      ),
    acceptWaitlistEntry: (programId: number | string, cohortId: number, entryId: number) =>
      apiRequest<ProgramCohortWaitlistAcceptResult>(
        programPath(programId, `/cohorts/${cohortId}/waitlist/${entryId}/accept`),
        { method: "POST" },
      ),
  },

  courses: {
    list: (programId: number | string, signal?: AbortSignal) =>
      apiRequest<ProgramCourse[]>(programPath(programId, "/courses"), { signal }),
    create: (programId: number | string, input: CreateProgramCourseInput) =>
      apiRequest<ProgramCourse>(programPath(programId, "/courses"), {
        method: "POST",
        body: json(input),
      }),
    update: (programId: number | string, courseId: number, input: UpdateProgramCourseInput) =>
      apiRequest<ProgramCourse>(childPath(programId, "courses", courseId), {
        method: "PATCH",
        body: json(input),
      }),
    reorder: (programId: number | string, input: ProgramCompositionOrderInput) =>
      apiRequest<ProgramCourse[]>(programPath(programId, "/courses/order"), {
        method: "PUT",
        body: json(input),
      }),
    delete: (programId: number | string, courseId: number) =>
      apiRequest<ProgramDeleteResult>(childPath(programId, "courses", courseId), {
        method: "DELETE",
      }),
  },

  tasks: {
    list: (programId: number | string, signal?: AbortSignal) =>
      apiRequest<ProgramTask[]>(programPath(programId, "/tasks"), { signal }),
    create: (programId: number | string, input: CreateProgramTaskInput) =>
      apiRequest<ProgramTask>(programPath(programId, "/tasks"), {
        method: "POST",
        body: json(input),
      }),
    update: (programId: number | string, taskId: number, input: UpdateProgramTaskInput) =>
      apiRequest<ProgramTask>(childPath(programId, "tasks", taskId), {
        method: "PATCH",
        body: json(input),
      }),
    reorder: (programId: number | string, input: ProgramCompositionOrderInput) =>
      apiRequest<ProgramTask[]>(programPath(programId, "/tasks/order"), {
        method: "PUT",
        body: json(input),
      }),
    delete: (programId: number | string, taskId: number) =>
      apiRequest<ProgramDeleteResult>(childPath(programId, "tasks", taskId), {
        method: "DELETE",
      }),
  },

  milestones: {
    list: (programId: number | string, signal?: AbortSignal) =>
      apiRequest<ProgramMilestone[]>(programPath(programId, "/milestones"), { signal }),
    create: (programId: number | string, input: CreateProgramMilestoneInput) =>
      apiRequest<ProgramMilestone>(programPath(programId, "/milestones"), {
        method: "POST",
        body: json(input),
      }),
    update: (programId: number | string, milestoneId: number, input: UpdateProgramMilestoneInput) =>
      apiRequest<ProgramMilestone>(childPath(programId, "milestones", milestoneId), {
        method: "PATCH",
        body: json(input),
      }),
    delete: (programId: number | string, milestoneId: number) =>
      apiRequest<ProgramDeleteResult>(childPath(programId, "milestones", milestoneId), {
        method: "DELETE",
      }),
  },

  getApprovalRequirements: (programId: number | string, signal?: AbortSignal) =>
    apiRequest<ProgramApprovalRequirements>(
      `${PROGRAMS_PATH}/publishing/versions/${idPath(programId)}/approval-requirements`,
      { signal },
    ),

  submitForReview: (programId: number | string, comment?: string) =>
    apiRequest<ProgramApprovalActionResult>(
      `${PROGRAMS_PATH}/publishing/versions/${idPath(programId)}/submit-for-review`,
      { method: "POST", body: json({ comment }) },
    ),

  approve: (instanceId: number, comment?: string) =>
    apiRequest<ProgramApprovalActionResult>(
      `${PROGRAMS_PATH}/publishing/instances/${instanceId}/approve`,
      { method: "POST", body: json({ comment }) },
    ),

  reject: (instanceId: number, comment: string) =>
    apiRequest<ProgramApprovalActionResult>(
      `${PROGRAMS_PATH}/publishing/instances/${instanceId}/reject`,
      { method: "POST", body: json({ comment }) },
    ),

  requestChanges: (instanceId: number, comment: string) =>
    apiRequest<ProgramApprovalActionResult>(
      `${PROGRAMS_PATH}/publishing/instances/${instanceId}/request-changes`,
      { method: "POST", body: json({ comment }) },
    ),

  withdraw: (instanceId: number, comment?: string) =>
    apiRequest<ProgramApprovalActionResult>(
      `${PROGRAMS_PATH}/publishing/instances/${instanceId}/withdraw`,
      { method: "POST", body: json({ comment }) },
    ),
};
