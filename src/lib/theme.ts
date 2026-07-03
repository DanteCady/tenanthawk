export const THEME_STORAGE_KEY = "tenant-hawk-theme";

export const THEMES = ["light", "dark", "hawk"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "light";

export const THEME_META: Record<
  Theme,
  { label: string; description: string; swatch: string; accent: string }
> = {
  light: {
    label: "Light",
    description: "Clean white interface with blue accents.",
    swatch: "#ffffff",
    accent: "#2563eb",
  },
  dark: {
    label: "Dark",
    description: "Neutral dark gray - clean and easy on the eyes.",
    swatch: "#09090b",
    accent: "#3b82f6",
  },
  hawk: {
    label: "Tenant Hawk",
    description: "Brand theme - deep slate with hawk amber glow.",
    swatch: "#0b1120",
    accent: "#f59e0b",
  },
};

export function isTheme(value: string | null | undefined): value is Theme {
  return value != null && THEMES.includes(value as Theme);
}
