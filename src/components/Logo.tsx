import type { SVGProps } from "react";

/**
 * Tenant Hawk mark - a geometric hawk head in profile with a fierce brow,
 * hooked beak, and a sharp eye. Reads at any size, transparent by default.
 */
export function HawkMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <linearGradient id="th-hawk" x1="12" y1="12" x2="56" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fcd34d" />
          <stop offset="0.55" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* hawk head, profile facing right, hooked beak */}
      <path
        d="M 15 24
           C 16 16 26 12 36 16
           C 41 18 44 20 46 23
           C 50 24 54 27 56 33
           L 57 39
           L 49 36
           C 52 33 49 32 45 32
           L 41 33
           C 38 40 32 45 26 44
           C 22 43 18 40 17 35
           C 14 33 13 30 15 24 Z"
        fill="url(#th-hawk)"
      />
      {/* fierce eye */}
      <path
        d="M 36 24 C 39 22 43 23 45 25 C 42 27 38 26 36 24 Z"
        fill="#0b1120"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  showWordmark = true,
  tone = "auto",
}: {
  className?: string;
  showWordmark?: boolean;
  /** "auto" follows html[data-theme] via CSS - safe for SSR. */
  tone?: "auto" | "dark" | "light";
}) {
  const wordmarkClass =
    tone === "light"
      ? "text-[1.3rem] font-semibold tracking-tight text-slate-900"
      : tone === "dark"
        ? "text-[1.3rem] font-semibold tracking-tight text-mist"
        : "logo-wordmark";

  const accentClass =
    tone === "light"
      ? "text-hawk-600"
      : tone === "dark"
        ? "text-hawk-400"
        : "logo-accent";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <HawkMark className="h-8 w-8" />
      {showWordmark && (
        <span className={wordmarkClass}>
          Tenant
          <span className={accentClass}>Hawk</span>
        </span>
      )}
    </span>
  );
}
