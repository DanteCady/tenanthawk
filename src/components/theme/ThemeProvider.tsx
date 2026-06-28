"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  isTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme";
import {
  isAppThemePath,
  readStoredAppTheme,
  systemPreferredTheme,
} from "@/lib/theme/scope";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  /** True when the dashboard theme picker applies (stored preference). */
  appThemeActive: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const appThemeActive = isAppThemePath(pathname);
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    if (appThemeActive) {
      const stored = readStoredAppTheme();
      setThemeState(stored);
      applyTheme(stored);
      return;
    }

    const syncSystemTheme = () => applyTheme(systemPreferredTheme());
    syncSystemTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", syncSystemTheme);
    return () => media.removeEventListener("change", syncSystemTheme);
  }, [appThemeActive, pathname]);

  const setTheme = useCallback(
    (next: Theme) => {
      if (!isAppThemePath(window.location.pathname)) return;
      setThemeState(next);
      applyTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore storage failures */
      }
    },
    [],
  );

  const value = useMemo(
    () => ({ theme, setTheme, appThemeActive }),
    [theme, setTheme, appThemeActive],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
