// ============================================================
// Branding Service
//
// Applies branding-affecting system settings (platform name, logo,
// theme, colors, maintenance mode) to the app shell immediately
// after the user saves them — no full page refresh needed.
//
// The values are persisted to localStorage so the branding survives
// reloads without another round-trip to the Settings API.
// ============================================================

import type { SystemSettingDto } from "../API/system-settings.api";
import { LIVE_BRANDING_KEYS } from "../constants/system-settings.registry";

export type Branding = {
  platformName: string;
  logoUrl: string | null;
  theme: "light" | "dark";
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  maintenanceMode: boolean;
};

export const BRANDING_CHANGED_EVENT = "learnos:branding-changed";

export const DEFAULT_BRANDING: Branding = {
  platformName: "LearnOS",
  logoUrl: null,
  theme: "light",
  primaryColor: "#047857",
  secondaryColor: "#065F46",
  accentColor: "#6EE7B7",
  maintenanceMode: false,
};

const STORAGE_KEY = "learnos_branding";

const listeners = new Set<() => void>();
let current: Branding = { ...DEFAULT_BRANDING };

function readStored(): Partial<Branding> | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<Branding>) : null;
  } catch {
    return null;
  }
}

function persist(branding: Branding): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
  } catch {
    /* storage unavailable — ignore, branding still applies in-memory */
  }
}

/** Parse a setting row into the branding shape (returns null if not branding-related). */
function toBrandingPatch(setting: SystemSettingDto): Partial<Branding> | null {
  switch (setting.settingKey) {
    case "platform_name":
      return { platformName: String(setting.settingValue ?? DEFAULT_BRANDING.platformName) };
    case "platform_logo_url":
      return { logoUrl: setting.settingValue ? String(setting.settingValue) : null };
    case "default_theme":
      return { theme: String(setting.settingValue ?? "light") === "dark" ? "dark" : "light" };
    case "primary_color":
      return { primaryColor: String(setting.settingValue ?? DEFAULT_BRANDING.primaryColor) };
    case "secondary_color":
      return { secondaryColor: String(setting.settingValue ?? DEFAULT_BRANDING.secondaryColor) };
    case "accent_color":
      return { accentColor: String(setting.settingValue ?? DEFAULT_BRANDING.accentColor) };
    case "maintenance_mode":
      return { maintenanceMode: Boolean(setting.settingValue) };
    default:
      return null;
  }
}

/** Apply a branding patch to the DOM and notify subscribers. */
function applyToDom(branding: Branding): void {
  const root = document.documentElement;
  root.style.setProperty("--primary", branding.primaryColor);
  root.style.setProperty("--secondary", branding.secondaryColor);
  root.style.setProperty("--accent", branding.accentColor);
  root.style.setProperty("--brand-primary", branding.primaryColor);

  // Theme — matches the .dark class used by theme.css (@custom-variant dark)
  root.classList.toggle("dark", branding.theme === "dark");
}

/**
 * Rebuild branding from a list of settings (typically after fetching or saving).
 * Only branding-affecting keys are consumed.
 */
export function applySettingsToBranding(settings: SystemSettingDto[]): Branding {
  const patch: Partial<Branding> = {};
  for (const setting of settings) {
    if (!LIVE_BRANDING_KEYS.has(setting.settingKey) || !setting.isActive) continue;
    const mapped = toBrandingPatch(setting);
    if (mapped) Object.assign(patch, mapped);
  }

    current = { ...DEFAULT_BRANDING, ...(readStored() ?? {}), ...patch };
  persist(current);
  applyToDom(current);
  emitBrandingChanged();
  return current;
}

export function emitBrandingChanged(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* never let a listener break notification to others */
    }
  });
  window.dispatchEvent(new CustomEvent(BRANDING_CHANGED_EVENT));
}

export function getBranding(): Branding {
  return current;
}

export function subscribeBranding(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Hydrate branding on app start (from localStorage, then optionally from settings). */
export function hydrateBranding(): Branding {
  current = { ...DEFAULT_BRANDING, ...(readStored() ?? {}) };
  applyToDom(current);
  return current;
}

/** True when the current branding differs from the platform defaults. */
export function hasCustomBranding(): boolean {
  return (
    JSON.stringify(current) !== JSON.stringify(DEFAULT_BRANDING) || (readStored() ?? null) !== null
  );
}