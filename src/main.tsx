import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
import { ErrorBoundary } from "./app/components/common";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
