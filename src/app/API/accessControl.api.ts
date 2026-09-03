import type { AccessControlMatrix, CurrentAccess } from "../models/accessControl.model";
import { apiRequest } from "./httpClient";

export const accessControlApi = {
  me: (signal?: AbortSignal) =>
    apiRequest<CurrentAccess>("/configuration/access-control/me", { signal }),
  list: (signal?: AbortSignal) =>
    apiRequest<AccessControlMatrix>("/configuration/access-control/roles", { signal }),
  updateRolePermissions: (roleId: number, permissionCodes: string[]) =>
    apiRequest<AccessControlMatrix>(`/configuration/access-control/roles/${roleId}/permissions`, {
      method: "PUT",
      body: JSON.stringify({ permissionCodes }),
    }),
};
