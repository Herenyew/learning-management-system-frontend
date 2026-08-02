import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { P } from "../../constants/theme.constants";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled frontend error", error, info);
  }

  private reset = () => {
    this.setState({ error: null });
  };

  override render() {
    if (!this.state.error) return this.props.children;

    return (
      <main
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: P.bg, color: P.text }}
      >
        <section
          className="w-full max-w-md rounded-2xl border bg-white p-6 text-center shadow-sm"
          style={{ borderColor: P.border }}
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: "#FFF2F0", color: "#C0392B" }}
          >
            <AlertTriangle size={22} />
          </div>
          <h1 className="text-lg font-bold">Something went wrong</h1>
          <p className="mt-2 text-sm" style={{ color: P.textMuted }}>
            The LMS interface hit an unexpected issue. You can retry without losing the app shell.
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: P.olive }}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </section>
      </main>
    );
  }
}
