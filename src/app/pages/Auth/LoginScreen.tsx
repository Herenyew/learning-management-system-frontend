import { useState, type FormEvent } from "react";
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail } from "lucide-react";
import { P } from "../../constants/theme.constants";
import type { Role } from "../../models/app.model";

const DEMO_ACCOUNTS: Array<{ email: string; password: string; role: Role }> = [
  { email: "alex.mercer@adiu.com", password: "learnos123", role: "learner" },
  { email: "learner@adiu.com", password: "learner123", role: "learner" },
  { email: "hr@adiu.com", password: "hr123", role: "hr" },
  { email: "manager@adiu.com", password: "manager123", role: "manager" },
  { email: "creator@adiu.com", password: "creator123", role: "creator" },
  { email: "admin@adiu.com", password: "admin123", role: "admin" },
];

export function LoginScreen({ onLogin }: { onLogin: (role: Role) => void }) {
  const [email, setEmail] = useState("alex.mercer@adiu.com");
  const [password, setPassword] = useState("learnos123");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("Enter your work email and password to continue.");
      return;
    }

    const account = DEMO_ACCOUNTS.find(
      (demoAccount) =>
        demoAccount.email === email.trim().toLowerCase() && demoAccount.password === password,
    );

    if (!account) {
      setMessage("Use a valid demo work email and password.");
      return;
    }

    setMessage("");
    onLogin(account.role);
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
            Welcome Back
          </h1>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            Sign in to your LearnOS workspace.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              className="mb-2 block text-xs font-bold uppercase tracking-[0.18em]"
              htmlFor="work-email"
              style={{ color: P.textMuted }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: P.textMuted }}
              />
              <input
                id="work-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="w-full rounded-2xl bg-white py-4 pl-12 pr-4 text-sm outline-none transition-shadow focus:ring-2"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                className="block text-xs font-bold uppercase tracking-[0.18em]"
                htmlFor="work-password"
                style={{ color: P.textMuted }}
              >
                Password
              </label>
              <button
                type="button"
                className="text-xs font-semibold"
                style={{ color: P.olive }}
                onClick={() => setMessage("Please contact HR IT to reset your password.")}
              >
                Forgot?
              </button>
            </div>
            <div className="relative">
              <Lock
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2"
                size={18}
                style={{ color: P.textMuted }}
              />
              <input
                id="work-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                className="w-full rounded-2xl bg-white py-4 pl-12 pr-12 text-sm outline-none transition-shadow focus:ring-2"
                style={{ border: `1px solid ${P.border}`, color: P.text }}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: P.textMuted }}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              type="checkbox"
              className="h-5 w-5 rounded border"
              style={{ accentColor: P.olive }}
            />
            <span style={{ color: P.textMuted }}>Keep me signed in</span>
          </label>

          {message && (
            <p
              className="rounded-xl px-4 py-3 text-sm"
              style={{ background: P.lightSage, color: P.darkOlive }}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-3 rounded-2xl px-4 py-4 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            style={{ background: P.olive }}
          >
            Sign In <ArrowRight size={18} />
          </button>
        </form>

        <p className="mt-8 text-center text-xs font-semibold" style={{ color: P.textMuted }}>
          Powered by ADIU Communication Service PLC
        </p>
      </main>
    </div>
  );
}
