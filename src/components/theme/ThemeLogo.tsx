import { Logo } from "@/components/Logo";

/** Theme-aware logo - uses CSS tokens tied to html[data-theme] (no hydration mismatch). */
export function ThemeLogo({
  className,
  showWordmark = true,
  tone = "auto",
}: {
  className?: string;
  showWordmark?: boolean;
  tone?: "auto" | "dark" | "light";
}) {
  return <Logo className={className} showWordmark={showWordmark} tone={tone} />;
}
