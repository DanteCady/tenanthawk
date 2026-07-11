import { isTheme, type Theme } from "@/lib/theme";

/** Routes that use the in-app theme picker (localStorage). */
export function isAppThemePath(pathname: string): boolean {
  return pathname.startsWith("/dashboard");
}

export function readStoredAppTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem("tenant-hawk-theme");
    return isTheme(stored) ? stored : "light";
  } catch {
    return "light";
  }
}

/** Inline bootstrap - marketing is always light; dashboard follows stored theme. */
export const THEME_BOOTSTRAP_SCRIPT = `(function(){try{var p=location.pathname;var app=p.indexOf("/dashboard")===0;if(app){var t=localStorage.getItem("tenant-hawk-theme");if(t==="light"||t==="dark"||t==="hawk"){document.documentElement.setAttribute("data-theme",t);return;}}document.documentElement.setAttribute("data-theme","light");}catch(e){}})();`;
