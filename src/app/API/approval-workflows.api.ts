import { apiRequest } from "./httpClient";
const B = "/configuration/approval-workflows";
const json = (v: unknown) => JSON.stringify(v);
const q = (path: string, p: Record<string, unknown>) => { const sp = new URLSearchParams(); Object.entries(p).forEach(([k,v]) => { if (v !== undefined && v !== "") sp.set(k, String(v)); }); const s = sp.toString(); return s ? `${path}?${s}` : path; };

export type WorkflowEntityType = "COURSE" | "COURSE_VERSION" | "LEARNING_PROGRAM" | "TNA_REQUEST" | "CERTIFICATE" | "LIVE_SESSION";
export type ApprovalWorkflowDto = { id: number; companyId: number; name: string; entityType: WorkflowEntityType; description: string | null; isDefault: boolean; isSystem: boolean; isActive: boolean; createdAt: string; updatedAt: string; steps?: ApprovalWorkflowStepDto[] };
export type CreateApprovalWorkflowInput = { name: string; entityType: WorkflowEntityType; description?: string; isDefault?: boolean; isActive?: boolean };
export type UpdateApprovalWorkflowInput = Partial<CreateApprovalWorkflowInput>;

export type ApprovalWorkflowStepDto = { id: number; companyId: number; workflowId: number; approvalOrder: number; approverRoleId: number | null; approverEmployeeId: string | null; isRequired: boolean; autoApprove: boolean; timeoutDays: number | null };
export type CreateApprovalWorkflowStepInput = { approvalOrder: number; approverRoleId?: number; approverEmployeeId?: string; isRequired?: boolean; autoApprove?: boolean; timeoutDays?: number };
export type UpdateApprovalWorkflowStepInput = Partial<CreateApprovalWorkflowStepInput>;

export const approvalWorkflowsApi = {
  list: (params: { search?: string; entityType?: WorkflowEntityType; isActive?: boolean; page?: number; limit?: number } = {}, signal?: AbortSignal) => apiRequest<ApprovalWorkflowDto[]>(q(B, params), { signal }),
  getById: (id: number, signal?: AbortSignal) => apiRequest<ApprovalWorkflowDto>(`${B}/${id}`, { signal }),
  create: (input: CreateApprovalWorkflowInput) => apiRequest<ApprovalWorkflowDto>(B, { method: "POST", body: json(input) }),
  update: (id: number, input: UpdateApprovalWorkflowInput) => apiRequest<ApprovalWorkflowDto>(`${B}/${id}`, { method: "PATCH", body: json(input) }),
  delete: (id: number) => apiRequest<void>(`${B}/${id}`, { method: "DELETE" }),
  steps: {
    list: (workflowId: number, signal?: AbortSignal) => apiRequest<ApprovalWorkflowStepDto[]>(`${B}/${workflowId}/steps`, { signal }),
    create: (workflowId: number, input: CreateApprovalWorkflowStepInput) => apiRequest<ApprovalWorkflowStepDto>(`${B}/${workflowId}/steps`, { method: "POST", body: json(input) }),
    update: (workflowId: number, stepId: number, input: UpdateApprovalWorkflowStepInput) => apiRequest<ApprovalWorkflowStepDto>(`${B}/${workflowId}/steps/${stepId}`, { method: "PATCH", body: json(input) }),
    delete: (workflowId: number, stepId: number) => apiRequest<void>(`${B}/${workflowId}/steps/${stepId}`, { method: "DELETE" }),
  },
};
