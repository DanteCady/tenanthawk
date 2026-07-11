import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { CompareHubList } from "@/components/compare/ComparisonShell";
import { ContentCta } from "@/components/content/ContentCta";
import { COMPARISON_PAGES } from "@/lib/content/comparisons/data";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Compare Tenant Hawk to Microsoft tools",
  description:
    "Honest comparisons: Tenant Hawk vs Microsoft Secure Score, M365 Admin Center, and self-hosted templates. See where each fits for tenant health and license waste.",
  path: "/compare",
});

export default function CompareIndexPage() {
  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <p className="mk-eyebrow">
              Compare
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-mk-ink sm:text-5xl">
              How Tenant Hawk compares
            </h1>
            <p className="mt-4 text-lg text-mk-soft">
              We tell you when Microsoft&apos;s own tools are the better fit. These pages
              explain what Tenant Hawk adds: one health score, license waste in dollars, and
              read-only scans in minutes.
            </p>
          </div>

          <CompareHubList pages={COMPARISON_PAGES} />

          <div className="mt-16">
            <ContentCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
