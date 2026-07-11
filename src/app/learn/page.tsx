import Link from "next/link";
import { buildPageMetadata } from "@/lib/seo/site";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentCta } from "@/components/content/ContentCta";
import {
  CONTENT_CATEGORIES,
  CONTENT_CATEGORY_DESCRIPTION,
  CONTENT_CATEGORY_LABEL,
} from "@/lib/content/categories";
import { getAllGuides } from "@/lib/content/loader";

const RESOURCE_HUB = [
  {
    href: "/glossary",
    title: "Glossary",
    description: "M365 and Entra ID terms with short, plain-language definitions.",
  },
  {
    href: "/compare",
    title: "Compare",
    description: "Tenant Hawk vs Secure Score, Admin Center, and self-hosted options.",
  },
  {
    href: "/tools/license-savings-calculator",
    title: "License calculator",
    description: "Estimate recoverable Microsoft 365 spend, then scan for real numbers.",
  },
] as const;

export const metadata = buildPageMetadata({
  title: "M365 Admin Guides — Security, Licensing & Tenant Hygiene",
  description:
    "Free Microsoft 365 guides for IT admins and MSPs: inactive users, unused licenses, Conditional Access, legacy auth, tenant hygiene, and audit prep. Then run the same checks with a free Tenant Hawk scan.",
  path: "/learn",
});

export default function LearnIndexPage() {
  const guides = getAllGuides();

  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mk-eyebrow">
              Learn
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-mk-ink sm:text-5xl">
              M365 cleanup &amp; tenant health guides
            </h1>
            <p className="mt-4 text-lg text-mk-soft">
              Practical guides for cleaning up Microsoft 365: inactive users,
              license waste, security drift, and tenant hygiene. Run the same
              checks automatically with a{" "}
              <Link href="/signup" className="font-medium text-mk-amber-deep hover:underline">
                free Tenant Hawk scan
              </Link>
              .
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {RESOURCE_HUB.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-mk-amber-line bg-mk-amber-wash px-5 py-4 transition-colors hover:border-mk-amber-line hover:bg-mk-amber-wash"
              >
                <h2 className="font-semibold text-mk-ink">{item.title}</h2>
                <p className="mt-1 text-sm text-mk-soft">{item.description}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CONTENT_CATEGORIES.filter((c) => c !== "overview").map((category) => (
              <Link
                key={category}
                href={`/learn/${category}`}
                className="rounded-2xl border border-mk-line bg-mk-panel px-5 py-4 transition-colors hover:border-mk-line2 hover:bg-white"
              >
                <h2 className="font-semibold text-mk-ink">
                  {CONTENT_CATEGORY_LABEL[category]}
                </h2>
                <p className="mt-1 text-sm text-mk-soft">
                  {CONTENT_CATEGORY_DESCRIPTION[category]}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <ContentCard key={guide.meta.slug} meta={guide.meta} />
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl">
            <ContentCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
