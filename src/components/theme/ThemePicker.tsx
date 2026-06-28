"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import { THEME_META, THEMES, type Theme } from "@/lib/theme";
import { useTheme } from "@/components/theme/ThemeProvider";

const ICONS: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  hawk: Palette,
};

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="grid gap-3 sm:grid-cols-3"
      role="radiogroup"
      aria-label="Appearance"
    >
      {THEMES.map((id) => {
        const meta = THEME_META[id];
        const Icon = ICONS[id];
        const selected = theme === id;

        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setTheme(id)}
            className={`relative flex flex-col rounded-xl border p-4 text-left transition-all ${
              selected
                ? "border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)] ring-2 ring-[var(--th-brand)]/30"
                : "border-[var(--th-border)] bg-[var(--th-surface)] hover:border-[var(--th-border)] hover:bg-[var(--th-muted-bg)]"
            }`}
          >
            {selected && (
              <span className="absolute right-3 top-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--th-brand)] text-white">
                <Check className="h-3 w-3" aria-hidden />
              </span>
            )}

            <span
              className="mb-3 flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-[var(--th-border)]"
              style={{ backgroundColor: meta.swatch }}
              aria-hidden
            >
              <span
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: meta.accent }}
              />
              <Icon
                className="h-4 w-4"
                style={{ color: id === "light" ? "#64748b" : "#e6edf7" }}
              />
            </span>

            <span className="text-sm font-semibold text-[var(--th-text)]">
              {meta.label}
            </span>
            <span className="mt-1 text-xs leading-relaxed text-[var(--th-text-muted)]">
              {meta.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
