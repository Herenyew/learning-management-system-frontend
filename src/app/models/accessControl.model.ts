export type AccessControlPermission = {
  code: string;
  description: string | null;
  module: string;
  groupId?: number | null;
};

export type AccessControlRole = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  employeeCount: number;
  permissionCodes: string[];
  isSystem?: boolean;
};

export type AccessControlMatrix = {
  roles: AccessControlRole[];
  permissions: AccessControlPermission[];
};

export type CurrentAccess = {
  permissions: string[];
  roleCodes: string[];
  appRoleId: number | null;
};

export type RolePermissionItem = {
  id: number;
  code: string;
  description: string | null;
  module: string;
};

export type RoleDetail = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  companyId: number;
  lastSyncedAt: string | null;
  lmsPolicyInitializedAt: string | null;
  employeeCount: number;
  permissions: RolePermissionItem[];
};

export type PermissionGroup = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  module: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { permissions: number };
};

export type PermissionGroupDetail = {
  id: number;
  companyId: number;
  name: string;
  description: string | null;
  module: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: RolePermissionItem[];
};

export type UserRole = {
  id: number;
  companyId: number;
  userId: number;
  appRoleId: number;
  assignedBy: number;
  assignedAt: string;
  isManual: boolean;
  isActive: boolean;
  expiresAt: string | null;
  notes: string | null;
  appRole: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
    lmsPermissions: Array<{ permission: { code: string } }>;
  };
};

export type EmsMapping = {
  id: number;
  companyId: number;
  emsRoleName: string;
  appRoleId: number;
  isActive: boolean;
  autoAssign: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  appRole: {
    id: number;
    name: string;
    description: string | null;
    isActive: boolean;
  };
};

export type SyncResult = {
  processed: number;
  assigned: number;
  skipped: number;
  errors: Array<{ userId: number; emsRoleName: string; reason: string }>;
};

/** A real role name coming from the EMS microservice (Role Picker dropdown). */
export type EmsRole = {
  id: number;
  name: string;
};

/** A LMS user returned by the User Roles search. */
export type LmsUser = {
  id: number;
  email: string;
  employeeId: string | null;
  isActive: boolean;
  fullName: string | null;
  primaryRole: { id: number; name: string } | null;
  assignedRoleIds: number[];
};

/** A user's role summary: primary role + manual assignments (GET /users/:id/roles/all). */
export type LmsUserRoleSummary = {
  id: number;
  name: string;
  description: string | null;
  isPrimary: boolean;
  isManual: boolean;
};

/** Primary role payload (GET /users/:id/primary-role) — wrapped in { role }. */
export type LmsPrimaryRole = {
  role: { id: number; name: string; description: string | null; isActive: boolean } | null;
};
