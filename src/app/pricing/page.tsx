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
      <main className="flex-1 pt-28 sm:pt-32">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="mk-eyebrow mb-5">Pricing</p>
          <h1 className="text-balance text-3xl font-[640] leading-[1.12] tracking-[-0.03em] text-mk-ink sm:text-[40px]">
            Simple pricing for every M365 operator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-[16.5px] leading-[1.6] text-mk-soft">
            Start with a free read-only scan; upgrade when you need monitoring, exports, or
            multi-tenant MSP tooling. Every scan surfaces reclaimable spend — recover one
            unused E5 license and Pro has already paid for itself.
          </p>
        </div>
        <Pricing showHeader={false} />
      </main>
      <Footer />
    </div>
  );
}
