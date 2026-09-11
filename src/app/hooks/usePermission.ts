/**
 * usePermission — reads permissions from the current SSO session and
 * automatically re-evaluates whenever the session changes (e.g. after a
 * real-time permission update via SSE).
 *
 * Three mechanisms keep permissions in sync:
 *
 *  1. SSE push  — backend fires `permissions.changed` via Server-Sent Events
 *                 whenever an admin saves a role change.  App.tsx handles
 *                 this by calling hydrateSessionFromCookie(), which writes a
 *                 fresh SsoSession and emits AUTH_SESSION_CHANGED_EVENT.
 *
 *  2. Event listener — this hook listens for AUTH_SESSION_CHANGED_EVENT and
 *                 immediately rebuilds the permission Set from sessionStorage.
 *                 Reacts within milliseconds of the SSE-triggered hydration.
 *
 *  3. Polling fallback — a single module-level timer calls /auth/me every
 *                 POLL_INTERVAL_MS.  This covers the case where the SSE
 *                 stream is unavailable (RabbitMQ down, proxy drops
 *                 EventSource) and also handles EMS legacy (v1) sessions by
 *                 upgrading them to v2 SSO sessions on first mount.
 *
 * Usage:
 *   const can = usePermission();
 *   if (!can("xp_rule.view")) return <AccessDenied />;
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  getAuthSession,
  AUTH_SESSION_CHANGED_EVENT,
} from "../services/authSession.service";
import { hydrateSessionFromCookie } from "../services/sso.service";

// ─── Module-level poll singleton ─────────────────────────────────────────────
// One shared timer for the entire app. Every component calling usePermission()
// shares this, so only ONE /auth/me request fires per interval.

const POLL_INTERVAL_MS = 30_000; // 30 seconds

let pollTimer: ReturnType<typeof setInterval> | null = null;
let pollRefCount = 0;
let pollInFlight = false;

async function pollPermissions(): Promise<void> {
  if (pollInFlight) return;
  const session = getAuthSession();
  if (!session) return; // not logged in — nothing to poll

  pollInFlight = true;
  try {
    // hydrateSessionFromCookie fetches /auth/me, writes a fresh v2 SsoSession,
    // and emits AUTH_SESSION_CHANGED_EVENT — which every usePermission() instance
    // picks up via its window event listener.
    await hydrateSessionFromCookie();
  } catch (err) {
    // Network failures are expected (offline, server restart) — keep the
    // existing session and try again on the next interval.
    // Log unexpected errors so they are visible in the browser console.
    if (import.meta.env.DEV || !(err instanceof TypeError)) {
      // TypeError is the browser's "network error / failed to fetch" class.
      // Everything else (unexpected throws, response parse errors) is worth surfacing.
      console.warn("[usePermission] Permission poll failed — stale permissions may persist:", err);
    }
  } finally {
    pollInFlight = false;
  }
}

function startPollIfNeeded(): void {
  pollRefCount += 1;
  if (pollTimer !== null) return; // already running
  // Fire once immediately (upgrades EMS sessions, refreshes stale permissions).
  void pollPermissions();
  pollTimer = setInterval(() => void pollPermissions(), POLL_INTERVAL_MS);
}

function stopPollIfUnneeded(): void {
  pollRefCount = Math.max(0, pollRefCount - 1);
  if (pollRefCount > 0 || pollTimer === null) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

// ─── Permission set helper ────────────────────────────────────────────────────

function buildPermissionSet(): Set<string> {
  const session = getAuthSession();
  if (!session) return new Set();
  // SSO session (v2) — permissions array populated by /auth/me
  if (session.version === 2) return new Set(session.user.permissions ?? []);
  // EMS legacy session (v1) — no LMS permission codes stored locally.
  // The poll above will upgrade this to a v2 session on the next tick.
  return new Set();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePermission() {
  const [permissions, setPermissions] = useState<Set<string>>(buildPermissionSet);

  // Mechanism 2: react to session storage changes (SSE + poll both trigger this).
  useEffect(() => {
    const handleChange = () => setPermissions(buildPermissionSet());
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleChange);
  }, []);

  // Mechanism 3: start the shared poll timer while any component is mounted.
  useEffect(() => {
    startPollIfNeeded();
    return () => stopPollIfUnneeded();
  }, []);

  /**
   * Returns true if the current user has ALL of the given permission codes.
   * Pass multiple codes to require all of them simultaneously.
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

// ─── Component wrapper ────────────────────────────────────────────────────────

/** Renders children only when the user holds the required permission(s). */
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
