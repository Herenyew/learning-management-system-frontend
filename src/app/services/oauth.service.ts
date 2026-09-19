/**
 * OAuth2 Service
 * Manages OAuth2 flow with Auth Service
 */

import type { AuthSession } from "./authSession.service";
import type { EmsUser } from "../API/emsAuth.api";

export interface OAuthConfig {
  authServiceUrl: string;
  clientId: string;
  redirectUri: string;
}

/**
 * Redirect user to Auth Service login
 */
export function redirectToAuthServiceLogin(config: OAuthConfig): void {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: "openid profile email",
  });

  const authUrl = `${config.authServiceUrl}/login?${params.toString()}`;
  window.location.href = authUrl;
}

/**
 * Get current user session from backend
 */
export async function getCurrentUserSession(): Promise<AuthSession | null> {
  try {
    const response = await fetch("/api/v1/auth/me", {
      credentials: "include", // Include cookies
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.data) {
      return null;
    }

    // Map backend response to AuthSession format
    const backendUser = data.data;

    return {
      version: 1,
      token: "", // Token is stored in session, not accessible from frontend
      user: {
        // The LMS /auth/me payload is camelCase and lacks the EMS-specific
        // snake_case identity fields, so cast instead of fabricating them.
        id: backendUser.userId,
        email: backendUser.email,
        companyId: backendUser.companyId,
        roleId: backendUser.roleId,
      } as EmsUser,
      role: mapRoleIdToRole(backendUser.roleId),
      rememberMe: true,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Failed to get current user session", error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    await fetch("/api/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    });
  } catch (error) {
    console.error("Failed to logout", error);
  }

  // Clear local session
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("learnos:auth-session-changed"));
  }
}

/**
 * Refresh session tokens
 */
export async function refreshSession(): Promise<boolean> {
  try {
    const response = await fetch("/api/v1/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Failed to refresh session", error);
    return false;
  }
}

/**
 * Map roleId from Auth Service to LMS role
 */
function mapRoleIdToRole(roleId: string): "learner" | "manager" | "creator" | "hr" | "admin" {
  // This mapping should match what's configured in your system
  // Adjust based on your role ID values from Auth Service
  const roleMap: Record<string, "learner" | "manager" | "creator" | "hr" | "admin"> = {
    admin: "admin",
    hr: "hr",
    manager: "manager",
    creator: "creator",
    learner: "learner",
  };

  return roleMap[roleId] || "learner";
}
