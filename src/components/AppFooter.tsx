import Link from "next/link";
import { SUPPORT_EMAIL, copyrightLine } from "@/lib/brand";

/** Compact legal + support links for app shells (dashboard, etc.). */
export function AppFooter() {
  return (
    <footer className="app-footer">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-[var(--th-text-faint)] sm:flex-row">
        <p>{copyrightLine()}</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" className="link-muted">
            Privacy
          </Link>
          <Link href="/terms" className="link-muted">
            Terms
          </Link>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="link-muted">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
