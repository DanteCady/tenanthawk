import Link from "next/link";
import { copyrightLine } from "@/lib/brand";
import { ThemeLogo } from "@/components/theme/ThemeLogo";

const footerLinkClass =
  "text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]";

export function Footer() {
  return (
    <footer className="app-footer mt-auto">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <ThemeLogo />
          <p className="text-sm text-[var(--th-text-muted)]">
            M365 tenant cleanup, health guides, and read-only scans for admins and MSPs.
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <Link href="/why" className={footerLinkClass}>
              Why Tenant Hawk
            </Link>
            <Link href="/learn" className={footerLinkClass}>
              Learn
            </Link>
            <Link href="/privacy" className={footerLinkClass}>
              Privacy
            </Link>
            <Link href="/terms" className={footerLinkClass}>
              Terms
            </Link>
          </div>
        </div>
        <p className="text-xs text-[var(--th-text-faint)]">{copyrightLine()}</p>
      </div>
    </footer>
  );
}
