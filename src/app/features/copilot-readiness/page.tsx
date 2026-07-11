import Link from "next/link";
import { Bot, DollarSign, ShieldCheck, TrendingUp } from "lucide-react";
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
import { DEFAULT_COPILOT_SEAT_USD } from "@/lib/scan/constants/copilot-skus";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Microsoft 365 Copilot readiness and license ROI report",
  description:
    "Find unused Copilot seats, inactive licensed users, adoption gaps, MFA gaps, and tenant readiness blockers - in a client-ready QBR report from a read-only M365 scan.",
  path: "/features/copilot-readiness",
  keywords: [
    "microsoft 365 copilot license waste",
    "copilot adoption report",
    "copilot readiness assessment",
    "unused copilot licenses",
    "copilot rollout readiness",
    "m365 copilot roi",
  ],
});

const FAQ: FeatureFaqItem[] = [
  {
    q: "What does Tenant Hawk check for Copilot?",
    a: `Unused prepaid seats, licensed-but-inactive users, Copilot on disabled accounts, low adoption, Chat-only usage patterns, licensed users without MFA, and composite readiness blockers from sharing, CA, legacy auth, Teams, and guest hygiene.`,
  },
  {
    q: "Does it use the admin Copilot Readiness report?",
    a: "No undocumented admin APIs. Tenant Hawk uses official Graph usage and license data, then derives readiness blockers from hygiene findings you already need for a tenant review.",
  },
  {
    q: "How is dollar impact calculated?",
    a: `Copilot seat savings default to ~$${DEFAULT_COPILOT_SEAT_USD}/user/mo at list price. You can override license rates like other cost findings.`,
  },
];

export default function CopilotReadinessPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ)} />
      <div className="marketing-v2 min-h-screen">
        <Navbar />
        <main className="flex-1">
          <FeatureHero
            eyebrow="Copilot · Adoption & ROI"
            eyebrowClass="text-violet-600"
            title="Copilot license ROI and rollout readiness — in one client report."
            lede="MSPs and IT leads need more than usage dashboards: unused seats, inactive licensed users, MFA gaps, and tenant blockers that hurt Copilot quality. Tenant Hawk surfaces all of it from a read-only scan."
            ctaLabel="Scan Copilot readiness"
            footnote="Official Graph reports · composite readiness blockers · QBR-ready exports"
          />

          <PainGrid
            title="What we surface for Copilot conversations"
            lede="License waste, adoption coaching, and hygiene blockers — not another admin portal."
            items={[
              {
                icon: DollarSign,
                title: "License ROI",
                body: "Unused prepaid seats, inactive licensed users, and Copilot still assigned to disabled accounts — priced in dollars.",
              },
              {
                icon: TrendingUp,
                title: "Adoption signals",
                body: "Tenant-wide adoption rate, Chat-only usage, and per-user activity from the official Copilot usage report.",
              },
              {
                icon: ShieldCheck,
                title: "Security & readiness",
                body: "Copilot-licensed users without MFA plus composite readiness blockers from sharing, CA, Teams, and guest hygiene.",
              },
              {
                icon: Bot,
                title: "QBR-ready",
                body: "Copilot sector on the findings page, sector grades on MSP scorecards, and export sections for client conversations.",
              },
            ]}
          />

          <section className="border-t border-mk-linesoft bg-mk-panel py-16">
            <div className="mx-auto max-w-3xl px-6 text-center">
              <Reveal>
                <p className="text-sm text-mk-soft">
                  See the full check list on the{" "}
                  <Link href="/features/coverage" className="font-medium text-violet-700 hover:underline">
                    coverage map
                  </Link>
                  .
                </p>
              </Reveal>
            </div>
          </section>

          <FaqCards items={FAQ} />
          <FeatureCta
            title="Run a Copilot readiness scan"
            lede="Connect read-only, scan your tenant, and export a client-ready Copilot section in minutes."
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
