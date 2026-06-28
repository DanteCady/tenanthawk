import { Logo } from "@/components/Logo";

/** Theme-aware logo — uses CSS tokens tied to html[data-theme] (no hydration mismatch). */
export function ThemeLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return <Logo className={className} showWordmark={showWordmark} tone="auto" />;
}
