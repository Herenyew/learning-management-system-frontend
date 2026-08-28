import { apiRequest } from "./httpClient";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

// ─── XP Rules ────────────────────────────────────────────────────────────────
export type XpRuleDto = { id: number; companyId: number; name: string; categoryId: number; triggerEventId: number; xpAmount: number; maximumAward: number | null; multiplier: number | string | null; targetAudienceId: number | null; courseVersionId: number | null; programId: number | null; conditionExpression: Record<string, unknown> | null; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateXpRuleInput = { name: string; categoryId: number; triggerEventId: number; xpAmount: number; maximumAward?: number | null; multiplier?: number | null; targetAudienceId?: number | null; courseVersionId?: number | null; programId?: number | null; conditionExpression?: Record<string, unknown> | null; isActive?: boolean };
export type UpdateXpRuleInput = Partial<CreateXpRuleInput>;

// ─── Badges ───────────────────────────────────────────────────────────────────
export type BadgeDto = { id: number; companyId: number; name: string; description: string | null; iconUrl: string | null; badgeCategoryId: number; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateBadgeInput = { name: string; description?: string | null; iconUrl?: string | null; badgeCategoryId: number; isActive?: boolean };
export type UpdateBadgeInput = Partial<CreateBadgeInput>;
export type BadgeCategoryDto = { id: number; companyId: number; name: string; slug: string | null; description: string | null; isActive: boolean };

export type BadgeRuleDto = { id: number; badgeId: number; triggerEventId: number | null; minimumXp: number | null; minimumCourses: number | null; minimumCertificates: number | null; minimumPrograms: number | null; targetAudienceId: number | null; customExpression: Record<string, unknown> | null; isActive: boolean };
export type CreateBadgeRuleInput = { triggerEventId?: number | null; minimumXp?: number | null; minimumCourses?: number | null; minimumCertificates?: number | null; minimumPrograms?: number | null; targetAudienceId?: number | null; customExpression?: Record<string, unknown> | null; isActive?: boolean };
export type UpdateBadgeRuleInput = Partial<CreateBadgeRuleInput>;

export const xpGamificationApi = {
  rules: {
    list: (params: { search?: string; categoryId?: number; triggerEventId?: number; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) =>
      apiRequest<XpRuleDto[]>(q("/configuration/xp-rules", params), { signal }),
    create: (input: CreateXpRuleInput) => apiRequest<XpRuleDto>("/configuration/xp-rules", { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateXpRuleInput) => apiRequest<XpRuleDto>(`/configuration/xp-rules/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`/configuration/xp-rules/${id}`, { method: "DELETE" }),
    lookups: (signal?: AbortSignal) =>
      apiRequest<{ categories: { id: number; name: string; slug?: string | null }[]; triggerEvents: { id: number; name: string; slug?: string | null }[] }>("/configuration/xp-rules/lookups", { signal }),
  },
  badges: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) =>
      apiRequest<BadgeDto[]>(q("/configuration/badges", params), { signal }),
    create: (input: CreateBadgeInput) => apiRequest<BadgeDto>("/configuration/badges", { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateBadgeInput) => apiRequest<BadgeDto>(`/configuration/badges/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`/configuration/badges/${id}`, { method: "DELETE" }),
    listRules: (badgeId: number, signal?: AbortSignal) => apiRequest<BadgeRuleDto[]>(`/configuration/badges/${badgeId}/rules`, { signal }),
    createRule: (badgeId: number, input: CreateBadgeRuleInput) => apiRequest<BadgeRuleDto>(`/configuration/badges/${badgeId}/rules`, { method: "POST", body: json(input) }),
    updateRule: (badgeId: number, ruleId: number, input: UpdateBadgeRuleInput) => apiRequest<BadgeRuleDto>(`/configuration/badges/${badgeId}/rules/${ruleId}`, { method: "PUT", body: json(input) }),
    deleteRule: (badgeId: number, ruleId: number) => apiRequest<void>(`/configuration/badges/${badgeId}/rules/${ruleId}`, { method: "DELETE" }),
  },
  badgeCategories: {
    list: (signal?: AbortSignal) => apiRequest<BadgeCategoryDto[]>("/configuration/badges/categories", { signal }),
  },
};
