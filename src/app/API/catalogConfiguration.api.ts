import { apiRequest } from "./httpClient";

export type RecordStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "RETIRED";

export type CourseCategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  displayOrder: number;
  isVisible: boolean;
  status: RecordStatus;
  _count: { courses: number };
};

export type LearningLevelDto = {
  id: string;
  name: string;
  color: string;
  displayOrder: number;
  minXp: number;
  maxXp: number | null;
  isVisible: boolean;
  status: RecordStatus;
};

export type ProgramTypeDto = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  defaultDurationDays: number | null;
  status: RecordStatus;
};

export type CategoryInput = Pick<
  CourseCategoryDto,
  "name" | "color" | "displayOrder" | "isVisible" | "status"
> & { description?: string | null };

export type LearningLevelInput = Pick<
  LearningLevelDto,
  "name" | "color" | "displayOrder" | "minXp" | "isVisible" | "status"
> & { maxXp?: number | null };

export type ProgramTypeInput = Pick<ProgramTypeDto, "name" | "color" | "status"> & {
  description?: string | null;
  defaultDurationDays?: number | null;
};

const json = (value: unknown) => JSON.stringify(value);

export const catalogConfigurationApi = {
  listCategories: (signal?: AbortSignal) =>
    apiRequest<CourseCategoryDto[]>("/course-categories", { signal }),
  createCategory: (input: CategoryInput) =>
    apiRequest<CourseCategoryDto>("/course-categories", { method: "POST", body: json(input) }),
  updateCategory: (id: string, input: Partial<CategoryInput>) =>
    apiRequest<CourseCategoryDto>(`/course-categories/${id}`, {
      method: "PATCH",
      body: json(input),
    }),
  deleteCategory: (id: string) =>
    apiRequest<{ id: string }>(`/course-categories/${id}`, { method: "DELETE" }),

  listLearningLevels: (signal?: AbortSignal) =>
    apiRequest<LearningLevelDto[]>("/learning-levels", { signal }),
  createLearningLevel: (input: LearningLevelInput) =>
    apiRequest<LearningLevelDto>("/learning-levels", { method: "POST", body: json(input) }),
  updateLearningLevel: (id: string, input: Partial<LearningLevelInput>) =>
    apiRequest<LearningLevelDto>(`/learning-levels/${id}`, { method: "PATCH", body: json(input) }),
  deleteLearningLevel: (id: string) =>
    apiRequest<{ id: string }>(`/learning-levels/${id}`, { method: "DELETE" }),

  listProgramTypes: (signal?: AbortSignal) =>
    apiRequest<ProgramTypeDto[]>("/program-types", { signal }),
  createProgramType: (input: ProgramTypeInput) =>
    apiRequest<ProgramTypeDto>("/program-types", { method: "POST", body: json(input) }),
  updateProgramType: (id: string, input: Partial<ProgramTypeInput>) =>
    apiRequest<ProgramTypeDto>(`/program-types/${id}`, { method: "PATCH", body: json(input) }),
  deleteProgramType: (id: string) =>
    apiRequest<{ id: string }>(`/program-types/${id}`, { method: "DELETE" }),
};
