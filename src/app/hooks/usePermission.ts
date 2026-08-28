/**
 * usePermission — reads permissions from the current SSO session.
 *
 * Usage:
 *   const can = usePermission();
 *   if (!can("xp_rule.view")) return <AccessDenied />;
 */
import { useMemo } from "react";
import { getAuthSession } from "../services/authSession.service";

export function usePermission() {
  const session = getAuthSession();

  const permissions = useMemo<Set<string>>(() => {
    if (!session) return new Set();
    // SSO session
    if (session.version === 2) return new Set(session.user.permissions ?? []);
    // EMS session — no LMS permission codes available
    return new Set();
  }, [session]);

  /**
   * Returns true if the current user has ALL of the given permission codes.
   * Pass multiple codes to require all of them.
   */
  return (...codes: string[]): boolean => {
    if (permissions.size === 0) return false;
    return codes.every((c) => permissions.has(c));
  };
}

/** Lightweight component wrapper: renders children only if the user has the permission. */
export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement | null {
  const can = usePermission();
  const codes = Array.isArray(permission) ? permission : [permission];
  return can(...codes) ? (children as React.ReactElement) : (fallback as React.ReactElement | null);
}
