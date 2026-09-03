export type AccessControlPermission = {
  code: string;
  description: string | null;
  module: string;
};

export type AccessControlRole = {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  employeeCount: number;
  permissionCodes: string[];
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
