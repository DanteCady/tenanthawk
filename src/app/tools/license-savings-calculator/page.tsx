import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ContentCta } from "@/components/content/ContentCta";
import { LicenseSavingsCalculator } from "@/components/tools/LicenseSavingsCalculator";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "M365 license waste calculator — estimate recoverable spend",
  description:
    "Free calculator: estimate monthly and annual Microsoft 365 license waste from user count and average SKU cost. Then run a Tenant Hawk scan for your tenant's real numbers.",
  path: "/tools/license-savings-calculator",
});

export default function LicenseSavingsCalculatorPage() {
  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="mk-eyebrow">
              Free tool
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-mk-ink sm:text-5xl">
              M365 license waste calculator
            </h1>
            <p className="mt-4 text-lg text-mk-soft">
              Ballpark how much unused and misassigned Microsoft 365 seats might cost you
              each month. Sliders only, no sign-in. For real findings, run a free Tenant
              Hawk scan.
            </p>
          </div>

          <div className="mt-12">
            <LicenseSavingsCalculator />
          </div>

          <div className="mt-16">
            <ContentCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
