import Link from "next/link";
import { Calculator, CopyX, UserX, Wallet } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import {
  FaqCards,
  FeatureCta,
  FeatureHero,
  PainGrid,
  type FeatureFaqItem,
} from "@/components/features/shared";
import { E5_LICENSE_MONTHLY_USD_LIST, PRO_MONTHLY_USD } from "@/lib/billing/pricing";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Find unused Microsoft 365 licenses — license waste report in minutes",
  description:
    "Disabled users still holding E5s, never-active accounts, oversized SKUs, and overlapping plans - Tenant Hawk turns your M365 license waste into a dollar-ranked recovery report. One reclaimed E5 pays for the platform.",
  path: "/features/license-waste",
  keywords: [
    "unused microsoft 365 licenses",
    "microsoft 365 license management tool",
    "office 365 license report",
    "find unused office 365 licenses",
    "microsoft 365 license optimization",
    "reclaim office 365 licenses",
    "microsoft 365 license waste",
    "office 365 license usage report",
    "m365 license cleanup",
    "microsoft 365 cost optimization",
  ],
});

const FAQ: FeatureFaqItem[] = [
  {
    q: "How does Tenant Hawk find wasted licenses?",
    a: "A read-only scan cross-references license assignments with account status and activity: disabled accounts still holding paid seats, users who never signed in, premium SKUs assigned where a cheaper plan covers actual usage, and overlapping plans that double-pay for the same service. Every finding carries a monthly dollar figure.",
  },
  {
    q: "Does it use my real license prices?",
    a: "Yes. You can enter your contracted per-SKU rates and every savings figure is computed against what you actually pay - not list price. Without overrides, standard list pricing is used.",
  },
  {
    q: "How is this different from the M365 admin center license report?",
    a: "The admin center shows counts - how many seats you own and how many are assigned. It doesn't tell you that 12 of those assigned seats belong to disabled users, or that 8 E5s show no premium-feature usage. Tenant Hawk does the cross-referencing and ranks the result in dollars.",
  },
  {
    q: "What does it typically find?",
    a: "The most common pattern is offboarding leftovers: employees leave, their account is disabled, and the license stays assigned - billing every month. Oversized SKUs are the second biggest bucket. A single reclaimed E5 is roughly $" +
      E5_LICENSE_MONTHLY_USD_LIST +
      "/month at list; Pro is $" +
      PRO_MONTHLY_USD +
      "/month per tenant.",
  },
  {
    q: "Can I export the report for finance or a client?",
    a: "Pro includes shareable executive report links plus CSV, XLSX, and PDF exports - with the reclaimable-spend summary front and center. MSPs use the per-client scorecards for the same story across a portfolio.",
  },
];

export default function LicenseWastePage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ)} />
      <div className="marketing-page min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="flex-1">
          <FeatureHero
            eyebrow="License waste · Cost"
            eyebrowClass="text-green-600"
            title="You're paying for licenses nobody uses."
            lede="Disabled users still holding E5 seats. Accounts that never signed in. Premium SKUs doing E3 work. Tenant Hawk finds every wasted license in your tenant and prices the recovery in real dollars - usually more than the platform costs."
            ctaLabel="Find my wasted licenses"
            footnote="Read-only scan · dollar impact on every finding · results in minutes"
          />

          <PainGrid
            title="Where M365 spend leaks"
            iconClass="bg-green-50 text-green-600"
            items={[
              {
                icon: UserX,
                title: "Offboarding leftovers",
                body: "The account gets disabled, the license stays assigned. Multiply by every departure since your last audit - this is almost always the biggest bucket.",
              },
              {
                icon: Wallet,
                title: "Oversized SKUs",
                body: "E5 seats assigned for a feature nobody turned on. Usage says E3 (or F3); the invoice says E5. The delta is pure waste, every month.",
              },
              {
                icon: CopyX,
                title: "Overlapping plans",
                body: "Standalone add-ons that duplicate what a bundle already includes - two line items paying for one service.",
              },
            ]}
          />

          {/* Calculator bridge */}
          <section className="bg-white py-16">
            <div className="mx-auto max-w-3xl px-6">
              <Reveal>
                <div className="rounded-2xl border border-green-200 bg-gradient-to-b from-green-50 to-white px-8 py-8 text-center shadow-sm">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700">
                    <Calculator className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
                    Estimate your recoverable spend first
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
                    Plug your seat counts into the free calculator for a back-of-napkin
                    number - then run a scan to see the real one.
                  </p>
                  <Link
                    href="/tools/license-savings-calculator"
                    className="mt-5 inline-flex items-center justify-center rounded-xl border border-green-300 bg-white px-6 py-2.5 text-sm font-semibold text-green-800 hover:border-green-400"
                  >
                    Open the license savings calculator
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>

          <FaqCards items={FAQ} />

          <FeatureCta
            title="One reclaimed E5 pays for the platform."
            lede={`An unused E5 is about $${E5_LICENSE_MONTHLY_USD_LIST}/month at list. Pro is $${PRO_MONTHLY_USD}/month per tenant. Most first scans surface far more than one seat.`}
            ctaLabel="Find my wasted licenses"
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
