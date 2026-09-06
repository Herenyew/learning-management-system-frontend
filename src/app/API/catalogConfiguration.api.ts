/**
 * Catalog Configuration API
 *
 * Correct backend paths (all under /api/v1):
 *   Course categories  → /configuration/course/categories
 *   Difficulty levels  → /configuration/course/difficulty-levels
 *   Learning levels    → /configuration/learning-levels   (gamification)
 *   Program types      → /configuration/program/program-types
 *   Program categories → /configuration/program/program-categories
 *   Content types      → /configuration/course/content-types
 */
import { apiRequest } from "./httpClient";

const COURSE = "/configuration/course";
const LEVELS = "/configuration/learning-levels";
const PROGRAM = "/configuration/program";
const TEMPLATES = "/configuration/templates";

const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, params: Record<string, string | number | boolean | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `${path}?${s}` : path;
};

// ─── Course Categories ────────────────────────────────────────────────────────

export type CourseCategoryDto = {
  id: number;
  companyId: number;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  displayOrder: number;
  parentId: number | null;
  isActive: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseCategoryInput = {
  name: string;
  description?: string | null;
  color?: string | null;
  displayOrder?: number;
  parentId?: number | null;
  isActive?: boolean;
  isVisible?: boolean;
};

export type UpdateCourseCategoryInput = Partial<CreateCourseCategoryInput>;
export type CourseCategoryFilter = { search?: string; isActive?: boolean; page?: number; limit?: number };

// ─── Difficulty Levels ────────────────────────────────────────────────────────

export type DifficultyLevelDto = {
  id: number; companyId: number | null; code: string; name: string;
  description: string | null; displayOrder: number; color: string | null;
  icon: string | null; isSystem: boolean; isActive: boolean;
};
export type CreateDifficultyLevelInput = { code: string; name: string; description?: string | null; displayOrder?: number; color?: string | null; icon?: string | null };
export type UpdateDifficultyLevelInput = Partial<CreateDifficultyLevelInput>;

// ─── Learning Levels (gamification) ──────────────────────────────────────────

export type LearningLevelDto = {
  id: number; companyId: number; name: string;
  minimumXp: number; maximumXp: number | null;
  badgeColor: string | null; displayOrder: number;
  createdAt: string; updatedAt: string;
};
export type CreateLearningLevelInput = { name: string; minimumXp: number; maximumXp?: number | null; badgeColor?: string | null; displayOrder?: number };
export type UpdateLearningLevelInput = Partial<CreateLearningLevelInput>;

// ─── Program Types ────────────────────────────────────────────────────────────

export type ProgramTypeDto = { id: number; companyId: number; name: string; description: string | null; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateProgramTypeInput = { name: string; description?: string | null; isActive?: boolean };
export type UpdateProgramTypeInput = Partial<CreateProgramTypeInput>;

// ─── Program Categories ───────────────────────────────────────────────────────

export type ProgramCategoryDto = { id: number; companyId: number; name: string; description: string | null; color: string | null; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateProgramCategoryInput = { name: string; description?: string | null; color?: string | null; isActive?: boolean };
export type UpdateProgramCategoryInput = Partial<CreateProgramCategoryInput>;

// ─── Content Types ────────────────────────────────────────────────────────────

export type ContentTypeDto = { id: number; slug: string; name: string; category: "RESOURCE" | "INTERACTIVE"; description: string | null; icon: string | null; isActive: boolean; sortOrder: number };
export type CreateContentTypeInput = {
  slug: string;
  name: string;
  category: string;
  description?: string | null;
  icon?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

// ─── Course Templates (/configuration/templates/course-templates) ────────────

export type CourseTemplateDto = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  shortSummary: string | null;
  categoryId: number;
  difficultyLevelId: number;
  passingScore: number;
  completionThreshold: number;
  estimatedDurationMinutes: number | null;
  baseXpOnCompletion: number;
  perfectScoreBonusXp: number;
  certificateRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCourseTemplateInput = {
  name: string;
  description?: string | null;
  shortSummary?: string | null;
  categoryId: number;
  difficultyLevelId: number;
  passingScore?: number;
  completionThreshold?: number;
  targetAudienceIds?: number[];
  isActive?: boolean;
};

export type UpdateCourseTemplateInput = Partial<CreateCourseTemplateInput>;

export type CourseTemplateFilter = {
  search?: string;
  categoryId?: number;
  difficultyLevelId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

// ─── Program Templates (/configuration/templates/program-templates) ──────────

export type ProgramTemplateDto = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  programTypeId: number | null;
  durationWeeks: number | null;
  visibility: string;
  isMandatory: boolean;
  autoEnroll: boolean;
  allowSelfEnrollment: boolean;
  rollingEnrollment: boolean;
  capacity: number | null;
  certificateEnabled: boolean;
  xpEnabled: boolean;
  defaultMilestones: Array<Record<string, unknown>> | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateProgramTemplateInput = {
  name: string;
  description?: string | null;
  categoryId?: number | null;
  programTypeId?: number | null;
  durationWeeks?: number | null;
  visibility?: "PUBLIC" | "COMPANY" | "PRIVATE";
  isMandatory?: boolean;
  autoEnroll?: boolean;
  allowSelfEnrollment?: boolean;
  rollingEnrollment?: boolean;
  capacity?: number | null;
  certificateEnabled?: boolean;
  xpEnabled?: boolean;
  defaultMilestones?: Array<Record<string, unknown>> | null;
  isActive?: boolean;
};

export type UpdateProgramTemplateInput = Partial<CreateProgramTemplateInput>;

export type ProgramTemplateFilter = {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

// ─── Task Types (/configuration/program/task-types) ──────────────────────────

export type TaskSubmissionType = "FILE_UPLOAD" | "TEXT_INPUT" | "LINK" | "QUIZ" | "NONE";
export type TaskLinkedEntity =
  | "COURSE_VERSION"
  | "COURSE_CONTENT"
  | "ASSESSMENT"
  | "LIVE_SESSION"
  | "SURVEY"
  | "NONE";

export type TaskTypeDto = {
  id: number;
  companyId: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  expectedSubmissionType: TaskSubmissionType;
  linkedEntity: TaskLinkedEntity;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskTypeInput = {
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  expectedSubmissionType: TaskSubmissionType;
  linkedEntity: TaskLinkedEntity;
  isActive?: boolean;
};

// ─── Content File Types (/configuration/course/content-file-types) ──────────

export type ContentFileTypeDto = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  isActive: boolean;
  sortOrder: number;
};

export type CreateContentFileTypeInput = {
  slug?: string;
  name: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
};


// ─── API object ───────────────────────────────────────────────────────────────

export const catalogConfigurationApi = {
  // Course Categories
  listCategories: (filter: CourseCategoryFilter = {}, signal?: AbortSignal) =>
    apiRequest<CourseCategoryDto[]>(q(`${COURSE}/categories`, { search: filter.search, isActive: filter.isActive !== undefined ? String(filter.isActive) : undefined, page: filter.page ? String(filter.page) : '1', pageSize: filter.limit ? String(filter.limit) : '100' }), { signal }),
  createCategory: (input: CreateCourseCategoryInput) =>
    apiRequest<CourseCategoryDto>(`${COURSE}/categories`, { method: "POST", body: json(input) }),
  updateCategory: (id: number, input: UpdateCourseCategoryInput) =>
    apiRequest<CourseCategoryDto>(`${COURSE}/categories/${id}`, { method: "PUT", body: json(input) }),
  deleteCategory: (id: number) => apiRequest<void>(`${COURSE}/categories/${id}`, { method: "DELETE" }),

  // Difficulty Levels
  listDifficultyLevels: (signal?: AbortSignal) =>
    apiRequest<DifficultyLevelDto[]>(`${COURSE}/difficulty-levels`, { signal }),
  createDifficultyLevel: (input: CreateDifficultyLevelInput) =>
    apiRequest<DifficultyLevelDto>(`${COURSE}/difficulty-levels`, { method: "POST", body: json(input) }),
  updateDifficultyLevel: (id: number, input: UpdateDifficultyLevelInput) =>
    apiRequest<DifficultyLevelDto>(`${COURSE}/difficulty-levels/${id}`, { method: "PUT", body: json(input) }),
  deleteDifficultyLevel: (id: number) => apiRequest<void>(`${COURSE}/difficulty-levels/${id}`, { method: "DELETE" }),

  // Content Types (system-managed, read-only for non-admins)
  listContentTypes: (signal?: AbortSignal) =>
    apiRequest<ContentTypeDto[]>(`${COURSE}/content-types`, { signal }),
  createContentType: (input: CreateContentTypeInput) =>
    apiRequest<ContentTypeDto>(`${COURSE}/content-types`, { method: "POST", body: json(input) }),
  updateContentType: (id: number, input: Partial<CreateContentTypeInput>) =>
    apiRequest<ContentTypeDto>(`${COURSE}/content-types/${id}`, { method: "PUT", body: json(input) }),
  deleteContentType: (id: number) => apiRequest<void>(`${COURSE}/content-types/${id}`, { method: "DELETE" }),

  // Learning Levels (gamification)
  listLearningLevels: (signal?: AbortSignal) =>
    apiRequest<LearningLevelDto[]>(`${LEVELS}`, { signal }),
  createLearningLevel: (input: CreateLearningLevelInput) =>
    apiRequest<LearningLevelDto>(`${LEVELS}`, { method: "POST", body: json(input) }),
  updateLearningLevel: (id: number, input: UpdateLearningLevelInput) =>
    apiRequest<LearningLevelDto>(`${LEVELS}/${id}`, { method: "PUT", body: json(input) }),
  deleteLearningLevel: (id: number) => apiRequest<void>(`${LEVELS}/${id}`, { method: "DELETE" }),

  // Program Types
  listProgramTypes: (signal?: AbortSignal) =>
    apiRequest<ProgramTypeDto[]>(`${PROGRAM}/program-types`, { signal }),
  createProgramType: (input: CreateProgramTypeInput) =>
    apiRequest<ProgramTypeDto>(`${PROGRAM}/program-types`, { method: "POST", body: json(input) }),
  updateProgramType: (id: number, input: UpdateProgramTypeInput) =>
    apiRequest<ProgramTypeDto>(`${PROGRAM}/program-types/${id}`, { method: "PUT", body: json(input) }),
  deleteProgramType: (id: number) => apiRequest<void>(`${PROGRAM}/program-types/${id}`, { method: "DELETE" }),

  // Program Categories
  listProgramCategories: (signal?: AbortSignal) =>
    apiRequest<ProgramCategoryDto[]>(`${PROGRAM}/program-categories`, { signal }),
  createProgramCategory: (input: CreateProgramCategoryInput) =>
    apiRequest<ProgramCategoryDto>(`${PROGRAM}/program-categories`, { method: "POST", body: json(input) }),
  updateProgramCategory: (id: number, input: UpdateProgramCategoryInput) =>
    apiRequest<ProgramCategoryDto>(`${PROGRAM}/program-categories/${id}`, { method: "PUT", body: json(input) }),
  deleteProgramCategory: (id: number) => apiRequest<void>(`${PROGRAM}/program-categories/${id}`, { method: "DELETE" }),

  // Course Templates
  listCourseTemplates: (filter: CourseTemplateFilter = {}, signal?: AbortSignal) =>
    apiRequest<CourseTemplateDto[]>(q(`${TEMPLATES}/course-templates`, {
      search: filter.search,
      categoryId: filter.categoryId !== undefined ? String(filter.categoryId) : undefined,
      difficultyLevelId: filter.difficultyLevelId !== undefined ? String(filter.difficultyLevelId) : undefined,
      isActive: filter.isActive !== undefined ? String(filter.isActive) : undefined,
      page: filter.page !== undefined ? String(filter.page) : undefined,
      pageSize: filter.pageSize !== undefined ? String(filter.pageSize) : undefined,
    }), { signal }),
  getCourseTemplate: (id: number, signal?: AbortSignal) =>
    apiRequest<CourseTemplateDto>(`${TEMPLATES}/course-templates/${id}`, { signal }),
  createCourseTemplate: (input: CreateCourseTemplateInput) =>
    apiRequest<CourseTemplateDto>(`${TEMPLATES}/course-templates`, { method: "POST", body: json(input) }),
  updateCourseTemplate: (id: number, input: UpdateCourseTemplateInput) =>
    apiRequest<CourseTemplateDto>(`${TEMPLATES}/course-templates/${id}`, { method: "PUT", body: json(input) }),
  deleteCourseTemplate: (id: number) => apiRequest<void>(`${TEMPLATES}/course-templates/${id}`, { method: "DELETE" }),

  // Program Templates
  listProgramTemplates: async (filter: ProgramTemplateFilter = {}, signal?: AbortSignal): Promise<ProgramTemplateDto[]> => {
    const res = await apiRequest<ProgramTemplateDto[] | { items?: ProgramTemplateDto[] }>(q(`${TEMPLATES}/program-templates`, {
      search: filter.search,
      isActive: filter.isActive !== undefined ? String(filter.isActive) : undefined,
      page: filter.page !== undefined ? String(filter.page) : undefined,
      pageSize: filter.pageSize !== undefined ? String(filter.pageSize) : undefined,
    }), { signal });
    // Backend returns a paginated envelope: { success, items, total, page, pageSize }
    if (Array.isArray(res)) return res;
    return Array.isArray(res?.items) ? res.items : [];
  },
  getProgramTemplate: (id: number, signal?: AbortSignal) =>
    apiRequest<ProgramTemplateDto>(`${TEMPLATES}/program-templates/${id}`, { signal }),
  createProgramTemplate: (input: CreateProgramTemplateInput) =>
    apiRequest<ProgramTemplateDto>(`${TEMPLATES}/program-templates`, { method: "POST", body: json(input) }),
  updateProgramTemplate: (id: number, input: UpdateProgramTemplateInput) =>
    apiRequest<ProgramTemplateDto>(`${TEMPLATES}/program-templates/${id}`, { method: "PUT", body: json(input) }),
  deleteProgramTemplate: (id: number) => apiRequest<void>(`${TEMPLATES}/program-templates/${id}`, { method: "DELETE" }),

  // Task Types (/configuration/program/task-types)
  listTaskTypes: async (signal?: AbortSignal): Promise<TaskTypeDto[]> => {
    const res = await apiRequest<TaskTypeDto[] | { items?: TaskTypeDto[] }>(q(`${PROGRAM}/task-types`, {}), { signal });
    // Older backend builds return a spread envelope: { success, items, total, ... }
    if (Array.isArray(res)) return res;
    return Array.isArray(res?.items) ? res.items : [];
  },
  createTaskType: (input: CreateTaskTypeInput) =>
    apiRequest<TaskTypeDto>(`${PROGRAM}/task-types`, { method: "POST", body: json(input) }),
  updateTaskType: (id: number, input: Partial<CreateTaskTypeInput>) =>
    apiRequest<TaskTypeDto>(`${PROGRAM}/task-types/${id}`, { method: "PUT", body: json(input) }),
  deleteTaskType: (id: number) => apiRequest<void>(`${PROGRAM}/task-types/${id}`, { method: "DELETE" }),

  // Content File Types (/configuration/course/content-file-types)
  listContentFileTypes: (signal?: AbortSignal) =>
    apiRequest<ContentFileTypeDto[]>(q(`${COURSE}/content-file-types`, {}), { signal }),
  createContentFileType: (input: CreateContentFileTypeInput) =>
    apiRequest<ContentFileTypeDto>(`${COURSE}/content-file-types`, { method: "POST", body: json(input) }),
  updateContentFileType: (id: number, input: Partial<CreateContentFileTypeInput> & { isActive?: boolean }) =>
    apiRequest<ContentFileTypeDto>(`${COURSE}/content-file-types/${id}`, { method: "PUT", body: json(input) }),
  deleteContentFileType: (id: number) => apiRequest<void>(`${COURSE}/content-file-types/${id}`, { method: "DELETE" }),
};
