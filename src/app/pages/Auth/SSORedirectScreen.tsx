import React from "react";
import { GraduationCap, ArrowRight } from "lucide-react";
import { P } from "../../constants/theme.constants";

/**
 * SSO Redirect Screen
 *
 * Shown when the user has no active session and is not on the callback path.
 * Redirects to the Auth Frontend login page, which handles authentication
 * and then redirects back to the LMS with an authorization code.
 *
 * Flow:
 *   1. User clicks "Sign In" → browser navigates to Auth Frontend (localhost:5174)
 *   2. User logs in on the Auth Frontend
 *   3. User clicks the LMS card on the Auth Portal dashboard
 *   4. Auth Frontend calls POST /api/v1/auth/authorize-module
 *   5. Auth backend returns redirectUrl → http://localhost:5173/auth/sso-callback?code=<code>
 *   6. LMS OAuthCallbackHandler exchanges code → sets httpOnly session cookie
 */
export function SSORedirectScreen() {
  const handleSignIn = () => {
    // VITE_AUTH_FRONTEND_URL is the Auth Portal UI (e.g. http://localhost:5174)
    // NOT the backend API — the backend does not serve a login page.
    const authFrontendUrl =
      (import.meta.env.VITE_AUTH_FRONTEND_URL as string | undefined) ??
      "http://localhost:5174";

    // Navigate directly to the Auth Frontend.
    // The LMS callback URL is NOT passed here — the auth portal handles module
    // access via POST /authorize-module after login, which builds the redirect itself.
    window.location.href = authFrontendUrl;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{
        background:
          "radial-gradient(circle at 18% 24%, rgba(225,239,224,0.9) 0,rgba(225,239,224,0) 32%)," +
          "radial-gradient(circle at 82% 30%, rgba(242,248,237,0.95) 0,rgba(242,248,237,0) 30%),#f8fbf5",
      }}
    >
      <main
        className="w-full max-w-[430px] rounded-2xl bg-white px-8 py-10 shadow-[0_24px_80px_rgba(42,56,22,0.14)] sm:px-10"
        style={{ border: `1px solid ${P.border}` }}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl shadow-[0_14px_30px_rgba(78,100,33,0.24)]"
            style={{ background: P.olive }}
          >
            <GraduationCap size={30} className="text-white" />
          </div>
          <h1
            className="text-3xl font-bold"
            style={{ color: P.text, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            LearnOS
          </h1>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            Learning Management Platform
          </p>
        </div>

        <div className="space-y-6">
          <div
            className="rounded-lg p-4 text-sm"
            style={{ background: P.bg, color: P.textMuted }}
          >
            <p className="font-medium mb-2">
              Sign in through your company's authentication portal.
            </p>
            <p className="text-xs">
              You'll be redirected to your company's secure login. After signing
              in, click the <strong>LMS</strong> card to open the learning
              platform.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            className="w-full rounded-xl px-6 py-4 text-base font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
            style={{ background: P.olive }}
          >
            <span>Go to Sign In</span>
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs" style={{ color: P.textMuted }}>
            Your session is protected and secure. All communications are
            encrypted.
          </p>
        </div>
      </main>
    </div>
  );
}
