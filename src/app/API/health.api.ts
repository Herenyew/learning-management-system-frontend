import type { BackendHealth } from "../models/health.model";
import { apiRequest } from "./httpClient";

export const getBackendHealth = (signal?: AbortSignal) =>
  apiRequest<BackendHealth>("/health", { signal });
