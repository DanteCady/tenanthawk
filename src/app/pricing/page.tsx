import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Pricing } from "@/components/Pricing";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Pricing — M365 tenant health scans for admins & MSPs",
  description:
    "Free M365 health scans for one tenant. Pro adds monitoring, alerts, and full reports. Enterprise for MSPs with multi-tenant console, SSO, and client scorecards.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="marketing-v2 marketing-landing min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <div className="mx-auto max-w-6xl px-6 pb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
            Simple pricing for every M365 operator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-mk-soft">
            Start with a free read-only scan. Upgrade when you need monitoring, exports, or
            multi-tenant MSP tooling.
          </p>
        </div>
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
