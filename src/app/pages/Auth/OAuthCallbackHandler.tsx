import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { P } from "../../constants/theme.constants";
import { hydrateSessionFromCookie } from "../../services/sso.service";
import type { Role } from "../../models/app.model";

interface OAuthCallbackHandlerProps {
  onAuthSuccess: (role: Role) => void;
  onAuthError: (error: string) => void;
}

/**
 * OAuth Callback Handler
 *
 * Handles the redirect back from Auth Service after the user logs in:
 *  1. Extracts `code` from URL query params
 *  2. POSTs it to the LMS backend POST /api/v1/auth/callback
 *     → backend exchanges code for tokens, creates ServiceSession, sets httpOnly cookie
 *  3. Calls GET /api/v1/auth/me to verify the session and get user info
 *  4. Saves a lightweight SsoSession to sessionStorage for UI display
 *  5. Calls onAuthSuccess with the resolved role
 */
// Track active callback promise to prevent duplicate token exchange requests in React 18 Strict Mode
let activeCallbackPromise: Promise<Role> | null = null;

export function OAuthCallbackHandler({ onAuthSuccess, onAuthError }: OAuthCallbackHandlerProps) {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Completing authentication…");

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        // 1. Extract authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const redirectUri = params.get("redirect_uri");

        if (!code) {
          throw new Error("No authorization code received. Please sign in again.");
        }

        setMessage("Exchanging authorization code…");

        // 2. Send code to LMS backend for exchange (wrapped in a shared promise to prevent double-firing)
        if (!activeCallbackPromise) {
          activeCallbackPromise = (async () => {
            const exchangeRes = await fetch("/api/v1/auth/callback", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ code, redirect_uri: redirectUri ?? "/" }),
            });

            if (!exchangeRes.ok) {
              const err = await exchangeRes.json().catch(() => ({}));
              throw new Error((err as { error?: string }).error ?? "Failed to exchange authorization code.");
            }

            const exchangeData = await exchangeRes.json();
            if (!exchangeData.success) {
              throw new Error(exchangeData.error ?? "Authentication server returned an error.");
            }

            // 3 + 4. Verify cookie session via /me and save SsoSession to sessionStorage
            const role = await hydrateSessionFromCookie();
            if (!role) {
              throw new Error("Failed to verify session. Please try again.");
            }
            return role;
          })();
        }

        const role = await activeCallbackPromise;

        if (cancelled) return;
        setStatus("success");
        setMessage("Authentication successful! Redirecting…");

        // Clear the URL query parameters and callback path so page refresh is safe
        window.history.replaceState({}, "", "/");

        // Clear the active promise on success
        activeCallbackPromise = null;

        // Small UX delay so user can see the success state
        setTimeout(() => {
          if (!cancelled) onAuthSuccess(role);
        }, 600);

      } catch (err) {
        // Reset the active promise on failure to allow retry
        activeCallbackPromise = null;
        if (cancelled) return;
        const errorMessage = err instanceof Error ? err.message : "Authentication failed.";
        setMessage(errorMessage);
        setStatus("error");
        onAuthError(errorMessage);
      }
    };

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{
        background:
          "radial-gradient(circle at 18% 24%, rgba(225,239,224,0.9) 0,rgba(225,239,224,0) 32%)," +
          "radial-gradient(circle at 82% 30%, rgba(242,248,237,0.95) 0,rgba(242,248,237,0) 30%),#f8fbf5",
      }}
    >
      <div
        className="w-full max-w-[430px] rounded-2xl bg-white px-8 py-10 shadow-[0_24px_80px_rgba(42,56,22,0.14)] sm:px-10"
        style={{ border: `1px solid ${P.border}` }}
      >
        <div className="flex flex-col items-center text-center gap-6">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_14px_30px_rgba(78,100,33,0.24)] ${
              status === "processing" ? "animate-pulse" : ""
            }`}
            style={{ background: P.olive }}
          >
            <GraduationCap size={30} className="text-white" />
          </div>

          {status === "processing" && (
            <>
              <h1 className="text-2xl font-bold" style={{ color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Signing You In
              </h1>
              <p className="text-sm" style={{ color: P.textMuted }}>{message}</p>
              <div className="flex gap-2">
                {[0, 200, 400].map((delay) => (
                  <div
                    key={delay}
                    className="h-2 w-2 rounded-full animate-bounce"
                    style={{ background: P.olive, animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <h1 className="text-2xl font-bold text-green-600" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                ✓ Authenticated
              </h1>
              <p className="text-sm" style={{ color: P.textMuted }}>{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <h1 className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Authentication Failed
              </h1>
              <p className="text-sm text-red-600">{message}</p>
              <button
                onClick={() => {
                  // Redirect to Auth frontend login page, not the backend API
                  window.location.href = import.meta.env.VITE_AUTH_FRONTEND_URL ?? "http://localhost:5174";
                }}
                className="rounded-xl px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ background: P.olive }}
              >
                Back to Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
