import { apiRequest } from "./httpClient";

const AUDIENCE_PATH = "/configuration/audience";
const json = (value: unknown) => JSON.stringify(value);

export type AudienceGroup = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdBy: number;
  updatedBy: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type CreateAudienceGroupInput = {
  name: string;
  description?: string;
};

export type UpdateAudienceGroupInput = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export type ListAudienceGroupsOptions = {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
};

export type AudienceRuleOperator = "AND" | "OR";

export type AudienceRule = {
  id: number;
  companyId: number;
  audienceGroupId: number;
  departmentId: number | null;
  jobTitleId: number | null;
  jobLevelId: number | null;
  appRoleId: number | null;
  employmentTypeId: number | null;
  hireWithinDays: number | null;
  operator: AudienceRuleOperator;
  isExclusion: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AudienceRuleInput = {
  departmentId?: number | null;
  jobTitleId?: number | null;
  jobLevelId?: number | null;
  appRoleId?: number | null;
  employmentTypeId?: number | null;
  hireWithinDays?: number | null;
  operator?: AudienceRuleOperator;
  isExclusion?: boolean;
};

export type CreateAudienceRuleInput = AudienceRuleInput;
export type UpdateAudienceRuleInput = Partial<AudienceRuleInput>;

export type AudienceOption = {
  id: number;
  name: string;
  code?: string | null;
  description?: string | null;
};

export type AudienceOptions = {
  departments: AudienceOption[];
  jobTitles: AudienceOption[];
  jobLevels: AudienceOption[];
  appRoles: AudienceOption[];
  employmentTypes: AudienceOption[];
};

export type AudienceMember = {
  id: string;
  companyId: number;
  fullName: string;
  startDate: string | null;
  departmentId: number | null;
  jobTitleId: number | null;
  jobLevelId: number | null;
  employmentTypeId: number | null;
  isActive: boolean;
  lastSyncedAt: string | null;
};

export type ResolveAudienceMembersOptions = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AudienceMemberCheck = {
  matches: boolean;
};

const withQuery = (
  path: string,
  values: Record<string, string | number | boolean | undefined>,
): string => {
  const searchParams = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== "") searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
};

export const listAudienceGroups = (options: ListAudienceGroupsOptions = {}, signal?: AbortSignal) =>
  apiRequest<AudienceGroup[]>(
    withQuery(AUDIENCE_PATH, {
      search: options.search?.trim(),
      isActive: options.isActive,
      page: options.page,
      pageSize: options.pageSize,
    }),
    { signal },
  );

export const getAudienceGroup = (id: number, signal?: AbortSignal) =>
  apiRequest<AudienceGroup>(`${AUDIENCE_PATH}/${id}`, { signal });

export const createAudienceGroup = (input: CreateAudienceGroupInput) =>
  apiRequest<AudienceGroup>(AUDIENCE_PATH, {
    method: "POST",
    body: json(input),
  });

export const updateAudienceGroup = (id: number, input: UpdateAudienceGroupInput) =>
  apiRequest<AudienceGroup>(`${AUDIENCE_PATH}/${id}`, {
    method: "PUT",
    body: json(input),
  });

export const deleteAudienceGroup = (id: number): Promise<void> =>
  apiRequest<unknown>(`${AUDIENCE_PATH}/${id}`, { method: "DELETE" }).then(() => undefined);

export const getAudienceOptions = (signal?: AbortSignal) =>
  apiRequest<AudienceOptions>(`${AUDIENCE_PATH}/options`, { signal });

export const listAudienceRules = (groupId: number, signal?: AbortSignal) =>
  apiRequest<AudienceRule[]>(`${AUDIENCE_PATH}/${groupId}/rules`, { signal });

export const createAudienceRule = (groupId: number, input: CreateAudienceRuleInput) =>
  apiRequest<AudienceRule>(`${AUDIENCE_PATH}/${groupId}/rules`, {
    method: "POST",
    body: json(input),
  });

export const updateAudienceRule = (
  groupId: number,
  ruleId: number,
  input: UpdateAudienceRuleInput,
) =>
  apiRequest<AudienceRule>(`${AUDIENCE_PATH}/${groupId}/rules/${ruleId}`, {
    method: "PUT",
    body: json(input),
  });

export const deleteAudienceRule = (groupId: number, ruleId: number): Promise<void> =>
  apiRequest<unknown>(`${AUDIENCE_PATH}/${groupId}/rules/${ruleId}`, {
    method: "DELETE",
  }).then(() => undefined);

export const resolveAudienceMembers = (
  groupId: number,
  options: ResolveAudienceMembersOptions = {},
  signal?: AbortSignal,
) =>
  apiRequest<AudienceMember[]>(
    withQuery(`${AUDIENCE_PATH}/${groupId}/members`, {
      search: options.search?.trim(),
      page: options.page,
      pageSize: options.pageSize,
    }),
    { signal },
  );

export const checkAudienceMember = (groupId: number, employeeId: string, signal?: AbortSignal) =>
  apiRequest<AudienceMemberCheck>(
    `${AUDIENCE_PATH}/${groupId}/members/${encodeURIComponent(employeeId)}/check`,
    { signal },
  );

export const audienceApi = {
  groups: {
    list: listAudienceGroups,
    get: getAudienceGroup,
    create: createAudienceGroup,
    update: updateAudienceGroup,
    delete: deleteAudienceGroup,
  },
  options: getAudienceOptions,
  rules: {
    list: listAudienceRules,
    create: createAudienceRule,
    update: updateAudienceRule,
    delete: deleteAudienceRule,
  },
  members: {
    resolve: resolveAudienceMembers,
    check: checkAudienceMember,
  },
};
