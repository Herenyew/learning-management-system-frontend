import React, { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";
import { P } from "../../constants/theme.constants";

/**
 * OAuth2 Callback Page
 * This page is displayed after the user logs in via the Auth Service
 * The Auth Service redirects back here with an authorization code
 */
export function OAuthCallbackScreen({
  onAuthComplete,
}: {
  onAuthComplete: (sessionId: string) => void;
}) {
  const [message, setMessage] = useState("Completing authentication...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const redirectUri = params.get("redirect_uri");

        if (!code) {
          throw new Error("No authorization code received");
        }

        setMessage("Exchanging authorization code for session...");

        // Exchange code for session via LMS backend
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirect_uri: redirectUri || "/dashboard",
          }),
          credentials: "include", // Include cookies
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to exchange authorization code");
        }

        const data = await response.json();

        if (!data.success || !data.data.sessionId) {
          throw new Error("Invalid response from authentication server");
        }

        setMessage("Authentication successful!");

        // Call the callback with the session ID
        setTimeout(() => {
          onAuthComplete(data.data.sessionId);
        }, 500);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Authentication failed";
        setError(errorMessage);
        setMessage("");
      }
    };

    handleCallback();
  }, [onAuthComplete]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{
        background:
          "radial-gradient(circle at 18% 24%, rgba(225, 239, 224, 0.9) 0, rgba(225, 239, 224, 0) 32%), radial-gradient(circle at 82% 30%, rgba(242, 248, 237, 0.95) 0, rgba(242, 248, 237, 0) 30%), #f8fbf5",
      }}
    >
      <div
        className="w-full max-w-[430px] rounded-2xl bg-white px-8 py-10 shadow-[0_24px_80px_rgba(42,56,22,0.14)] sm:px-10"
        style={{ border: `1px solid ${P.border}` }}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_14px_30px_rgba(78,100,33,0.24)] animate-spin"
            style={{ background: P.olive }}
          >
            <GraduationCap size={30} className="text-white" />
          </div>

          {error ? (
            <>
              <h1
                className="text-2xl font-bold"
                style={{ color: P.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Authentication Failed
              </h1>
              <p className="mt-4 text-sm text-red-600">{error}</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="mt-6 rounded-xl px-6 py-2 text-sm font-semibold text-white transition-all"
                style={{ background: P.olive }}
              >
                Back to Login
              </button>
            </>
          ) : (
            <>
              <h1
                className="text-2xl font-bold"
                style={{ color: P.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Signing You In
              </h1>
              <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
                {message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
