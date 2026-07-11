import { CalendarCheck2, FileBarChart2, Presentation } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MspConsoleSection } from "@/components/MspConsoleSection";
import {
  FaqCards,
  FeatureCta,
  FeatureHero,
  PainGrid,
  type FeatureFaqItem,
} from "@/components/features/shared";
import {
  ENTERPRISE_CLIENT_CAP_DEFAULT,
  ENTERPRISE_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "M365 tenant management for MSPs — portfolio console & client scorecards",
  description:
    `Flat-rate Microsoft 365 health monitoring across every client tenant: portfolio roll-ups, per-client scorecards for QBRs, branded subdomain with SSO, and a needs-attention queue. Up to ${ENTERPRISE_CLIENT_CAP_DEFAULT} clients for $${ENTERPRISE_MONTHLY_USD}/mo.`,
  path: "/msp",
  keywords: [
    "msp microsoft 365 management tools",
    "m365 multi tenant management",
    "microsoft 365 msp tools",
    "msp qbr report",
    "msp quarterly business review template",
    "m365 tenant monitoring msp",
    "multi tenant microsoft 365 dashboard",
    "msp client security reporting",
    "white label m365 reporting",
  ],
});

const FAQ: FeatureFaqItem[] = [
  {
    q: "How does pricing work for MSPs?",
    a: `Enterprise is flat-rate: $${ENTERPRISE_MONTHLY_USD}/month covers up to ${ENTERPRISE_CLIENT_CAP_DEFAULT} client tenants with the full platform on every one - findings with dollar impact, daily scans, alerts, exports, and scorecards. Volume tiers are available beyond ${ENTERPRISE_CLIENT_CAP_DEFAULT} clients. No per-seat math.`,
  },
  {
    q: "How do I onboard a client tenant?",
    a: "Each client grants standard read-only admin consent - a link you can send them, or click through together in two minutes. No agents to deploy, no credentials to collect or store, and clients can revoke access from Entra at any time. That consent model is easy to explain in an MSA.",
  },
  {
    q: "Can I put my own brand on it?",
    a: "Yes. Enterprise includes a branded subdomain (acme.tenanthawk.io) with SSO via your IdP - Okta, Entra ID, or SAML - so your team signs in under your name, and shared scorecards carry your branding to clients.",
  },
  {
    q: "How do the scorecards work for QBRs?",
    a: "Every client tenant gets a shareable scorecard: overall grade, category trends, top findings, and reclaimable license spend. It's the security-and-savings slide of your quarterly business review, generated automatically - and the recovered-spend number regularly justifies your own line item.",
  },
  {
    q: "How do I know which client needs attention first?",
    a: "The portfolio roll-up ranks clients by open high-severity findings, stale scans, and connection issues. Instead of rotating through ten admin centers, you open one console and see who needs work today.",
  },
  {
    q: "How do you handle security and client data?",
    a: "Read-only Microsoft Graph access via standard admin consent — no agents, no stored client credentials, and clients can revoke access in Entra at any time. We use HTTPS, hashed passwords, and optional 2FA for your Tenant Hawk logins. Disconnect a tenant or delete your account and we remove the associated data. See our privacy policy for retention and subprocessors.",
  },
];

export default function MspPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ)} />
      <div className="marketing-page min-h-screen bg-white text-slate-900">
        <Navbar />
        <main className="flex-1">
          <FeatureHero
            eyebrow="For MSPs & consultants"
            eyebrowClass="text-blue-600"
            title="Every client tenant. One console. Flat rate."
            lede={`Stop rotating through ten admin centers. Tenant Hawk rolls every client's health score, open findings, and reclaimable license spend into one portfolio view - with per-client scorecards ready for your next QBR. $${ENTERPRISE_MONTHLY_USD}/month, up to ${ENTERPRISE_CLIENT_CAP_DEFAULT} clients.`}
            ctaLabel="Get started"
            ctaHref="/signup?type=msp"
            footnote="Read-only consent per client · branded subdomain + SSO · no agents"
          />

          <MspConsoleSection />

          <PainGrid
            title="Built for the client conversation"
            lede="The console runs your day; the scorecards run your reviews."
            iconClass="bg-blue-50 text-blue-600"
            items={[
              {
                icon: Presentation,
                title: "QBRs without the deck-building",
                body: "Per-client scorecards with grades, trends, and top findings - the security slide of your quarterly review, generated instead of assembled.",
              },
              {
                icon: FileBarChart2,
                title: "Savings that justify your invoice",
                body: "Reclaimable license spend per client, in dollars. Showing a client you found more waste than your management fee is the easiest renewal conversation you'll have.",
              },
              {
                icon: CalendarCheck2,
                title: "Proactive beats reactive",
                body: "Drift alerts and the needs-attention queue surface problems before the client calls - the difference between reporting an incident and preventing one.",
              },
            ]}
          />

          <FaqCards items={FAQ} />

          <FeatureCta
            title="Your next QBR is already prepared."
            lede="Connect your first client tenant read-only and see the portfolio view with real data in minutes."
            ctaLabel="Get started"
            ctaHref="/signup?type=msp"
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
