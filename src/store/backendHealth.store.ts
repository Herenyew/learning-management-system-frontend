import { useCallback, useEffect, useState } from "react";

import { getBackendHealth } from "../app/API/health.api";
import type { BackendConnectionStatus, BackendHealth } from "../app/models/health.model";

type BackendHealthState = {
  status: BackendConnectionStatus;
  health: BackendHealth | null;
};

const REFRESH_INTERVAL_MS = 60_000;

export const useBackendHealth = (): BackendHealthState => {
  const [state, setState] = useState<BackendHealthState>({
    status: "checking",
    health: null,
  });

  const refresh = useCallback(async (signal?: AbortSignal) => {
    try {
      const health = await getBackendHealth(signal);
      setState({ status: "connected", health });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setState({ status: "unavailable", health: null });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void refresh(controller.signal);

    const interval = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, [refresh]);

  return state;
};
