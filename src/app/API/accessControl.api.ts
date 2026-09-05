import type {
  AccessControlMatrix,
  CurrentAccess,
  EmsMapping,
  PermissionGroup,
  PermissionGroupDetail,
  RoleDetail,
  RolePermissionItem,
  SyncResult,
  UserRole,
} from "../models/accessControl.model";
import { apiRequest } from "./httpClient";

export const accessControlApi = {
  me: (signal?: AbortSignal) =>
    apiRequest<CurrentAccess>("/configuration/access-control/me", { signal }),

  list: (signal?: AbortSignal) =>
    apiRequest<AccessControlMatrix>("/configuration/access-control/roles", { signal }),

  getRole: (roleId: number, signal?: AbortSignal) =>
    apiRequest<RoleDetail>(`/configuration/access-control/roles/${roleId}`, { signal }),

  createRole: (data: { name: string; description?: string; isActive?: boolean }) =>
    apiRequest<RoleDetail>("/configuration/access-control/roles", { method: "POST", body: JSON.stringify(data) }),

  updateRole: (roleId: number, data: { name?: string; description?: string; isActive?: boolean }) =>
    apiRequest<RoleDetail>(`/configuration/access-control/roles/${roleId}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteRole: (roleId: number) =>
    apiRequest<{ success: boolean }>("/configuration/access-control/roles/" + roleId, { method: "DELETE" }),

  toggleRoleStatus: (roleId: number, isActive: boolean) =>
    apiRequest<RoleDetail>(`/configuration/access-control/roles/${roleId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  getRolePermissions: (roleId: number) =>
    apiRequest<RolePermissionItem[]>(`/configuration/access-control/roles/${roleId}/permissions`),

  bulkAssignPermissions: (roleId: number, permissionIds: number[]) =>
    apiRequest(`/configuration/access-control/roles/${roleId}/permissions/bulk-assign`, {
      method: "POST",
      body: JSON.stringify({ permissionIds }),
    }),

  bulkRevokePermissions: (roleId: number, permissionIds: number[]) =>
    apiRequest(`/configuration/access-control/roles/${roleId}/permissions/bulk-revoke`, {
      method: "DELETE",
      body: JSON.stringify({ permissionIds }),
    }),

  replaceRolePermissions: (roleId: number, permissionCodes: string[]) =>
    apiRequest<AccessControlMatrix>(`/configuration/access-control/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionCodes }),
    }),

  /** ─── Permissions ────────────────────────────────────────────────── */

  listPermissions: () =>
    apiRequest<RolePermissionItem[]>("/configuration/access-control/permissions"),

  createPermission: (data: { code: string; description?: string; module: string; groupId?: number }) =>
    apiRequest("/configuration/access-control/permissions", { method: "POST", body: JSON.stringify(data) }),

  updatePermission: (id: number, data: { code?: string; description?: string; module?: string; groupId?: number | null }) =>
    apiRequest(`/configuration/access-control/permissions/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletePermission: (id: number) =>
    apiRequest("/configuration/access-control/permissions/" + id, { method: "DELETE" }),

  /** ─── Permission Groups ──────────────────────────────────────────── */

  listPermissionGroups: () =>
    apiRequest<PermissionGroup[]>("/configuration/access-control/permission-groups"),

  getPermissionGroup: (id: number) =>
    apiRequest<PermissionGroupDetail>(`/configuration/access-control/permission-groups/${id}`),

  createPermissionGroup: (data: { name: string; description?: string; module: string }) =>
    apiRequest<PermissionGroupDetail>("/configuration/access-control/permission-groups", { method: "POST", body: JSON.stringify(data) }),

  updatePermissionGroup: (id: number, data: { name?: string; description?: string; module?: string; isActive?: boolean }) =>
    apiRequest<PermissionGroupDetail>(`/configuration/access-control/permission-groups/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deletePermissionGroup: (id: number) =>
    apiRequest("/configuration/access-control/permission-groups/" + id, { method: "DELETE" }),

  assignPermissionsToGroup: (groupId: number, permissionIds: number[]) =>
    apiRequest<PermissionGroupDetail>(`/configuration/access-control/permission-groups/${groupId}/permissions`, {
      method: "POST",
      body: JSON.stringify({ permissionIds }),
    }),

  /** ─── User Role Assignments ─────────────────────────────────────── */

  getUserRoles: (userId: number) =>
    apiRequest<UserRole[]>(`/configuration/access-control/users/${userId}/roles`),

  getUserAllRoles: (userId: number) =>
    apiRequest<UserRole[]>(`/configuration/access-control/users/${userId}/roles/all`),

  getUserEffectivePermissions: (userId: number) =>
    apiRequest<string[]>(`/configuration/access-control/users/${userId}/permissions`),

  getUserMenu: (userId: number) =>
    apiRequest<any[]>(`/configuration/access-control/users/${userId}/menu`),

  getUserPrimaryRole: (userId: number) =>
    apiRequest<any>(`/configuration/access-control/users/${userId}/primary-role`),

  assignRoleToUser: (userId: number, data: { roleId: number; isManual?: boolean; notes?: string; expiresAt?: string }) =>
    apiRequest<UserRole>(`/configuration/access-control/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  revokeRoleFromUser: (userId: number, roleId: number) =>
    apiRequest(`/configuration/access-control/users/${userId}/roles/${roleId}`, { method: "DELETE" }),

  bulkAssignRole: (roleId: number, userIds: number[]) =>
    apiRequest("/configuration/access-control/users/bulk-assign", {
      method: "POST",
      body: JSON.stringify({ roleId, userIds }),
    }),

  getUsersByRole: (roleId: number) =>
    apiRequest<UserRole[]>(`/configuration/access-control/roles/${roleId}/users`),

  /** ─── EMS Mappings ──────────────────────────────────────────────── */

  listEmsMappings: () =>
    apiRequest<EmsMapping[]>("/configuration/access-control/ems-mappings"),

  createEmsMapping: (data: { emsRoleName: string; appRoleId: number; autoAssign?: boolean; priority?: number }) =>
    apiRequest<EmsMapping>("/configuration/access-control/ems-mappings", { method: "POST", body: JSON.stringify(data) }),

  updateEmsMapping: (id: number, data: { emsRoleName?: string; appRoleId?: number; isActive?: boolean; autoAssign?: boolean; priority?: number }) =>
    apiRequest<EmsMapping>(`/configuration/access-control/ems-mappings/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteEmsMapping: (id: number) =>
    apiRequest("/configuration/access-control/ems-mappings/" + id, { method: "DELETE" }),

  syncFromEms: (emsUsers: Array<{ userId: number; emsRoleName: string }>) =>
    apiRequest<SyncResult>("/configuration/access-control/ems-mappings/sync", {
      method: "POST",
      body: JSON.stringify({ emsUsers }),
    }),
};
