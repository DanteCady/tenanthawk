import Link from "next/link";
import { copyrightLine } from "@/lib/brand";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { COMPARISON_PAGES } from "@/lib/content/comparisons/data";
import { getAllGuides } from "@/lib/content/loader";

const footerLinkClass =
  "text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]";

const RESOURCE_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/features/journal", label: "The Journal" },
  { href: "/msp", label: "For MSPs" },
  { href: "/learn", label: "Guides" },
  { href: "/glossary", label: "Glossary" },
  { href: "/compare", label: "Compare" },
  { href: "/tools/license-savings-calculator", label: "License calculator" },
  { href: "/why", label: "Why Tenant Hawk" },
] as const;

export async function Footer() {
  const guides = getAllGuides();

  return (
    <footer className="app-footer mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <ThemeLogo />
            <p className="mt-3 max-w-sm text-sm text-[var(--th-text-muted)]">
              M365 tenant cleanup, health guides, and read-only scans for admins and MSPs.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--th-text-muted)]">
              Learn
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--th-text-muted)]">
              Compare
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {COMPARISON_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link href={`/compare/${page.slug}`} className={footerLinkClass}>
                    vs {page.competitorName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--th-text-muted)]">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/privacy" className={footerLinkClass}>
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={footerLinkClass}>
                  Terms
                </Link>
              </li>
            </ul>
            <p className="mt-6 text-xs text-[var(--th-text-faint)]">{copyrightLine()}</p>
          </div>
        </div>

        {guides.length > 0 && (
          <nav
            aria-label="M365 admin guides"
            className="mt-10 border-t border-[var(--th-border)] pt-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--th-text-muted)]">
              Guides
            </p>
            <ul className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <li key={guide.meta.slug}>
                  <Link
                    href={`/learn/guides/${guide.meta.slug}`}
                    className="text-xs leading-relaxed text-[var(--th-text-faint)] hover:text-[var(--th-text-muted)]"
                  >
                    {guide.meta.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
