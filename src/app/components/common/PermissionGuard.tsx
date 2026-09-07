import type React from "react";
import { usePermission } from "../../hooks/usePermission";
import { AccessDenied } from "./AccessDenied";

type PermissionGuardProps = {
  permission: string | string[];
  mode?: "all" | "any";
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Reusable wrapper that gates content behind a permission check.
 *
 * Usage:
 *   <PermissionGuard permission="course.read">
 *     <CourseList />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission={["course.create", "course.update"]} mode="any">
 *     <CourseEditor />
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="course.delete" fallback={<p>View only</p>}>
 *     <CourseViewer />
 *   </PermissionGuard>
 */
export function PermissionGuard({
  permission,
  mode = "all",
  fallback,
  children,
}: PermissionGuardProps) {
  const can = usePermission();

  const codes = Array.isArray(permission) ? permission : [permission];

  const hasAccess = mode === "all" ? codes.every((c) => can(c)) : codes.some((c) => can(c));

  if (hasAccess) return <>{children}</>;

  return <>{fallback ?? <AccessDenied permission={codes.join(", ")} />}</>;
}
