import Link from "next/link";
import { copyrightLine, SUPPORT_EMAIL } from "@/lib/brand";
import { COMPARISON_PAGES } from "@/lib/content/comparisons/data";
import { getAllGuides } from "@/lib/content/loader";

const footerLinkClass = "text-[13.5px] text-mk-soft transition-colors hover:text-mk-ink";
const colTitleClass =
  "mb-4 font-mkmono text-[11px] font-medium uppercase tracking-[0.08em] text-mk-faint";

const PRODUCT_LINKS = [
  { href: "/features", label: "Features" },
  { href: "/features/coverage", label: "All checks" },
  { href: "/features/journal", label: "The Journal" },
  { href: "/msp", label: "For MSPs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/tools/license-savings-calculator", label: "License calculator" },
] as const;

const LEARN_LINKS = [
  { href: "/learn", label: "Guides" },
  { href: "/glossary", label: "Glossary" },
  { href: "/compare", label: "Compare" },
  { href: "/why", label: "Why Tenant Hawk" },
] as const;

const COMPANY_LINKS = [
  { href: "/about", label: "About" },
  { href: "/security", label: "Security" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export async function Footer() {
  const guides = getAllGuides();

  return (
    <footer className="marketing-v2 mt-auto border-t border-mk-line bg-white">
      <div className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:px-8">
        <div className="mb-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3.5 flex items-center gap-2.5">
              <img
                src="/brand/tenanthawk-mark.svg"
                alt=""
                className="h-6 w-6 object-contain"
              />
              <span className="text-[15.5px] font-[650] text-mk-ink">Tenant Hawk</span>
            </div>
            <p className="max-w-[260px] text-[13.5px] leading-[1.6] text-mk-muted">
              M365 tenant cleanup, health guides, and read-only scans for admins and MSPs.
            </p>
          </div>

          <div>
            <p className={colTitleClass}>Product</p>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={colTitleClass}>Learn</p>
            <ul className="flex flex-col gap-2.5">
              {LEARN_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
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
            <p className={colTitleClass}>Company</p>
            <ul className="flex flex-col gap-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={footerLinkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {guides.length > 0 && (
          <nav
            aria-label="M365 admin guides"
            className="mb-10 border-t border-mk-linesoft pt-8"
          >
            <p className={colTitleClass}>Guides</p>
            <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((guide) => (
                <li key={guide.meta.slug}>
                  <Link
                    href={`/learn/guides/${guide.meta.slug}`}
                    className="text-xs leading-relaxed text-mk-muted transition-colors hover:text-mk-ink"
                  >
                    {guide.meta.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="flex flex-wrap justify-between gap-2 border-t border-mk-linesoft pt-6 text-[12.5px] text-mk-night-soft">
          <span>{copyrightLine()}</span>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="transition-colors hover:text-mk-ink">
            {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}
