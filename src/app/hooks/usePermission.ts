/**
 * usePermission — reads permissions from the current SSO session and
 * automatically re-evaluates whenever the session changes (e.g. after a
 * real-time permission update via SSE).
 *
 * Usage:
 *   const can = usePermission();
 *   if (!can("xp_rule.view")) return <AccessDenied />;
 */
import { useState, useEffect, useCallback } from "react";
import {
  getAuthSession,
  AUTH_SESSION_CHANGED_EVENT,
} from "../services/authSession.service";

function buildPermissionSet(): Set<string> {
  const session = getAuthSession();
  if (!session) return new Set();
  if (session.version === 2) return new Set(session.user.permissions ?? []);
  // EMS legacy session — no LMS permission codes available
  return new Set();
}

export function usePermission() {
  // Hold the permissions set in React state so any change triggers a re-render
  // of every component that calls usePermission().
  const [permissions, setPermissions] = useState<Set<string>>(buildPermissionSet);

  useEffect(() => {
    // Re-read permissions whenever the session is updated — covers:
    //  - login / logout
    //  - real-time permission change pushed via SSE → hydrateSessionFromCookie
    //    → saveSsoSession → emitSessionChange → AUTH_SESSION_CHANGED_EVENT
    const handleChange = () => {
      setPermissions(buildPermissionSet());
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleChange);
  }, []);

  /**
   * Returns true if the current user has ALL of the given permission codes.
   * Pass multiple codes to require all of them.
   */
  const can = useCallback(
    (...codes: string[]): boolean => {
      if (permissions.size === 0) return false;
      return codes.every((c) => permissions.has(c));
    },
    [permissions],
  );

  return can;
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
  return can(...codes)
    ? (children as React.ReactElement)
    : (fallback as React.ReactElement | null);
}
