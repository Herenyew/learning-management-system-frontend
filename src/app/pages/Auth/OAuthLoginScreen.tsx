import React, { useEffect } from "react";
import { ArrowRight, GraduationCap } from "lucide-react";
import { P } from "../../constants/theme.constants";
import { redirectToAuthServiceLogin } from "../../services/oauth.service";

/**
 * OAuth2 Login Screen
 * Displays a login prompt that redirects to the centralized Auth Service
 */
export function OAuthLoginScreen() {
  const handleLoginClick = () => {
    const config = {
      authServiceUrl: import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:3861",
      clientId: "lms-service",
      redirectUri: `${window.location.origin}/oauth-callback`,
    };

    redirectToAuthServiceLogin(config);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{
        background:
          "radial-gradient(circle at 18% 24%, rgba(225, 239, 224, 0.9) 0, rgba(225, 239, 224, 0) 32%), radial-gradient(circle at 82% 30%, rgba(242, 248, 237, 0.95) 0, rgba(242, 248, 237, 0) 30%), #f8fbf5",
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
            style={{ color: P.text, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Welcome to LearnOS
          </h1>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            Sign in with your company credentials
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={handleLoginClick}
            className="w-full rounded-xl px-6 py-4 text-base font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-lg hover:scale-105"
            style={{ background: P.olive }}
          >
            <span>Sign In</span>
            <ArrowRight size={18} />
          </button>

          <p className="text-center text-xs" style={{ color: P.textMuted }}>
            You'll be redirected to your company's secure login page.
            <br />
            Your session is protected and secure.
          </p>
        </div>
      </main>
    </div>
  );
}
