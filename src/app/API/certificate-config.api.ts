import { apiRequest } from "./httpClient";
const B = "/configuration/certification";
const TEMPLATES = "/configuration/templates";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type CertificateTypeDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateCertificateTypeInput = { name: string; slug: string; description?: string; isSystem?: boolean };
export type UpdateCertificateTypeInput = Partial<CreateCertificateTypeInput>;

export type CredentialSourceDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateCredentialSourceInput = { name: string; slug: string; description?: string; isSystem?: boolean };
export type UpdateCredentialSourceInput = Partial<CreateCredentialSourceInput>;

export type ProviderTypeDto = { id: number; companyId: number; name: string; slug: string; description: string | null; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string };
export type CreateProviderTypeInput = { name: string; slug: string; description?: string; isSystem?: boolean };
export type UpdateProviderTypeInput = Partial<CreateProviderTypeInput>;

export type CertificateTemplateStatus = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED" | "RETIRED";
export type CertificateTemplateDto = { id: number; companyId: number; name: string; certificateTypeId: number; titleText: string | null; credentialText: string | null; courseVersionId: number | null; learningProgramId: number | null; templateFile: string | null; certificateIdPattern: string; validityMonths: number | null; sealImage: string | null; qrVerificationEnabled: boolean; backgroundImage: string | null; status: CertificateTemplateStatus; createdAt: string; updatedAt: string };
export type CreateCertificateTemplateInput = { name: string; certificateTypeId: number; certificateIdPattern: string; courseVersionId?: number | null; learningProgramId?: number | null; templateFile?: string; validityMonths?: number; qrVerificationEnabled?: boolean; backgroundImage?: string; status?: CertificateTemplateStatus };
export type UpdateCertificateTemplateInput = Partial<CreateCertificateTemplateInput>;

export type CertificateTemplateSignerDto = { id: number; templateId: number; employeeId: string; displayOrder: number; createdAt: string; updatedAt: string };
export type CreateCertificateTemplateSignerInput = { employeeId: string; displayOrder: number };
export type UpdateCertificateTemplateSignerInput = Partial<CreateCertificateTemplateSignerInput>;

export const certificateConfigApi = {
  types: {
    list: (params: { search?: string; isActive?: boolean; isSystem?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<CertificateTypeDto[]>(q(`${B}/types`, params), { signal }),
    create: (input: CreateCertificateTypeInput) => apiRequest<CertificateTypeDto>(`${B}/types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateCertificateTypeInput) => apiRequest<CertificateTypeDto>(`${B}/types/${id}`, { method: "PATCH", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/types/${id}`, { method: "DELETE" }),
  },
  credentialSources: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<CredentialSourceDto[]>(q(`${B}/credential-sources`, params), { signal }),
    create: (input: CreateCredentialSourceInput) => apiRequest<CredentialSourceDto>(`${B}/credential-sources`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateCredentialSourceInput) => apiRequest<CredentialSourceDto>(`${B}/credential-sources/${id}`, { method: "PATCH", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/credential-sources/${id}`, { method: "DELETE" }),
  },
  providerTypes: {
    list: (params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<ProviderTypeDto[]>(q(`${B}/provider-types`, params), { signal }),
    create: (input: CreateProviderTypeInput) => apiRequest<ProviderTypeDto>(`${B}/provider-types`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateProviderTypeInput) => apiRequest<ProviderTypeDto>(`${B}/provider-types/${id}`, { method: "PATCH", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${B}/provider-types/${id}`, { method: "DELETE" }),
  },
  templates: {
    list: async (params: { search?: string; certificateTypeId?: number; status?: CertificateTemplateStatus; page?: number; limit?: number } = {}, signal?: AbortSignal): Promise<CertificateTemplateDto[]> => {
      const res = await apiRequest<CertificateTemplateDto[] | { items?: CertificateTemplateDto[] }>(q(`${TEMPLATES}/certificate-templates`, params), { signal });
      if (Array.isArray(res)) return res;
      return Array.isArray(res?.items) ? res.items : [];
    },
    create: (input: CreateCertificateTemplateInput) => apiRequest<CertificateTemplateDto>(`${TEMPLATES}/certificate-templates`, { method: "POST", body: json(input) }),
    update: (id: number, input: UpdateCertificateTemplateInput) => apiRequest<CertificateTemplateDto>(`${TEMPLATES}/certificate-templates/${id}`, { method: "PUT", body: json(input) }),
    delete: (id: number) => apiRequest<void>(`${TEMPLATES}/certificate-templates/${id}`, { method: "DELETE" }),
    listSigners: (templateId: number, signal?: AbortSignal) => apiRequest<CertificateTemplateSignerDto[]>(`${TEMPLATES}/certificate-templates/${templateId}/signers`, { signal }),
    addSigner: (templateId: number, input: CreateCertificateTemplateSignerInput) => apiRequest<CertificateTemplateSignerDto>(`${TEMPLATES}/certificate-templates/${templateId}/signers`, { method: "POST", body: json(input) }),
    updateSigner: (templateId: number, signerId: number, input: UpdateCertificateTemplateSignerInput) => apiRequest<CertificateTemplateSignerDto>(`${TEMPLATES}/certificate-templates/${templateId}/signers/${signerId}`, { method: "PUT", body: json(input) }),
    removeSigner: (templateId: number, signerId: number) => apiRequest<void>(`${TEMPLATES}/certificate-templates/${templateId}/signers/${signerId}`, { method: "DELETE" }),
  },
};
