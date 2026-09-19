// theme.service.ts — Applies the company's live branding palette (from the
// primary_color / secondary_color / accent_color system settings) to the app.
//
// The whole frontend renders its colors through the mutable `P` palette object
// in constants/theme.constants.ts. Mutating P's properties at runtime re-themes
// every component that reads P.* during render — no per-component changes needed.
import { P } from "../constants/theme.constants";
import { apiRequest } from "../API/httpClient";

const CACHE_KEY = "company_branding_v1";

export type CompanyBranding = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  defaultTheme: string;
};

// ─── Color helpers ────────────────────────────────────────────────────────────

function normalizeHex(hex: string, fallback: string): string {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return fallback;
  let h = m[1];
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  return `#${h.toLowerCase()}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex, "#000000").slice(1);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** Mixes `hex` toward `target` by `amount` (0 = hex, 1 = target). */
function mix(hex: string, target: string, amount: number): string {
  const [r1, g1, b1] = hexToRgb(hex);
  const [r2, g2, b2] = hexToRgb(target);
  return rgbToHex(r1 + (r2 - r1) * amount, g1 + (g2 - g1) * amount, b1 + (b2 - b1) * amount);
}

const darken = (hex: string, amount: number) => mix(hex, "#000000", amount);
const lighten = (hex: string, amount: number) => mix(hex, "#ffffff", amount);

// ─── Palette application ──────────────────────────────────────────────────────

export function applyCompanyTheme(branding: CompanyBranding): void {
  const primary = normalizeHex(branding.primaryColor, P.olive);
  const secondary = normalizeHex(branding.secondaryColor, P.gold);
  const accent = normalizeHex(branding.accentColor, P.sage);

  // Primary brand color drives the main palette family.
  P.olive = primary;
  P.darkOlive = darken(primary, 0.25);
  P.deepOlive = darken(primary, 0.4);
  P.sage = lighten(primary, 0.45);
  P.lightSage = lighten(primary, 0.82);
  P.paleGreen = lighten(primary, 0.93);
  P.text = darken(primary, 0.72);
  P.textMid = primary;
  P.textMuted = mix(primary, "#64748B", 0.55);
  P.border = lighten(primary, 0.72);
  P.borderMid = `rgba(${hexToRgb(primary).join(",")},0.18)`;
  P.bg = lighten(primary, 0.965);

  // Secondary drives the gold/accent family; accent drives highlights.
  P.gold = secondary;
  P.goldLight = lighten(secondary, 0.9);
  P.goldMid = lighten(secondary, 0.72);
  P.sage = accent;
}

/** Applies the last-known branding from localStorage (instant, no flash). */
export function applyCachedTheme(): void {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) applyCompanyTheme(JSON.parse(raw) as CompanyBranding);
  } catch {
    /* ignore malformed cache */
  }
}

/** Fetches the company's live branding from the backend and applies it. */
export async function refreshCompanyTheme(signal?: AbortSignal): Promise<CompanyBranding | null> {
  try {
    const branding = await apiRequest<CompanyBranding>("/configuration/system-settings/branding", {
      signal,
    });
    if (!branding?.primaryColor) return null;
    applyCompanyTheme(branding);
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(branding));
    } catch {
      /* storage unavailable */
    }
    return branding;
  } catch {
    // Not fatal — the default olive palette stays in place.
    return null;
  }
}
