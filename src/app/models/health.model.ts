export type BackendHealth = {
  status: "ok";
  service: string;
  database: "connected";
  checkedAt: string;
};

export type BackendConnectionStatus = "checking" | "connected" | "unavailable";
