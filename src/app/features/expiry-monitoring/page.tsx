import { BellRing, CalendarX2, FileSpreadsheet, KeyRound } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import {
  FaqCards,
  FeatureCta,
  FeatureHero,
  PainGrid,
  type FeatureFaqItem,
} from "@/components/features/shared";
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Free app secret & certificate expiry monitoring for Microsoft 365",
  description:
    "Get alerted before app registration secrets, SSO signing certificates, and domains expire in your M365 tenant. Free forever on one tenant - no PowerShell scripts, no Logic Apps, 2-minute read-only setup.",
  path: "/features/expiry-monitoring",
  keywords: [
    "app registration secret expiration notification",
    "azure app registration secret expiry alert",
    "client secret expired azure ad",
    "azure app secret expiry report",
    "certificate expiry monitoring office 365",
    "saml certificate expiration office 365",
    "enterprise application certificate expiry",
    "entra app secret expiration email",
    "monitor app registration secrets",
  ],
});

const FAQ: FeatureFaqItem[] = [
  {
    q: "Doesn't Microsoft notify me before an app secret expires?",
    a: "No. Entra ID has no built-in notification for expiring app registration secrets or certificates. The usual workarounds are a PowerShell script on a scheduled task, a Logic App, or a spreadsheet someone forgets to check. Tenant Hawk replaces all three with a read-only scan and an email before anything expires.",
  },
  {
    q: "What does the free tier monitor?",
    a: "App registration client secrets and certificates, SAML/SSO signing certificates on enterprise applications, custom domain and DNS issues, and mailboxes approaching storage limits - on one tenant, with a weekly health score and email alerts. Free forever, no card required.",
  },
  {
    q: "How much warning do I get?",
    a: "Findings appear as soon as a credential enters the expiry window, ranked by urgency - so a secret expiring in 14 days shows as high severity while one expiring in 60 days is tracked but calmer. Alert emails go out as findings appear or change.",
  },
  {
    q: "Does this need write access or an agent?",
    a: "No agents, no write access. Tenant Hawk uses app-only, read-only Microsoft Graph permissions granted through standard admin consent, and never stores your credentials.",
  },
  {
    q: "What happens when a secret I use actually expires?",
    a: "Whatever depends on it breaks - backup jobs stop, SSO sign-ins fail, integrations 401. That's why this is the one category we monitor for free: it's the cheapest outage you'll ever prevent.",
  },
];

export default function ExpiryMonitoringPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ)} />
      <div className="marketing-v2 min-h-screen">
        <Navbar />
        <main className="flex-1">
          <FeatureHero
            eyebrow="Expiry monitoring · Free"
            eyebrowClass="text-mk-amber-deep"
            title="The app secret expires Friday. Nobody knows."
            lede="Entra ID won't email you before an app registration secret or SSO certificate expires - you find out when sign-ins break. Tenant Hawk watches every secret, certificate, and domain in your tenant and warns you first. Free, forever, on one tenant."
            ctaLabel="Start monitoring free"
            footnote="Free tier · read-only Graph access · no card required · 2-minute setup"
          />

          <PainGrid
            title="How this outage usually happens"
            lede="Every M365 shop has lived some version of this."
            iconClass="bg-mk-amber-wash text-mk-amber-deep"
            items={[
              {
                icon: KeyRound,
                title: "A secret is created and forgotten",
                body: "An integration gets a client secret with a 12-month lifetime. The admin who made it changes roles. The clock keeps ticking.",
              },
              {
                icon: FileSpreadsheet,
                title: "The tracking spreadsheet goes stale",
                body: "Expiry dates live in a spreadsheet, a wiki page, or one person's calendar reminders. None of them get updated after quarter two.",
              },
              {
                icon: CalendarX2,
                title: "It expires on a weekend",
                body: "Backups silently stop, SSO fails Monday morning, and the fix takes an hour - after four hours of figuring out what broke.",
              },
            ]}
          />

          <PainGrid
            title="What Tenant Hawk watches"
            iconClass="bg-mk-amber-wash text-mk-amber-deep"
            items={[
              {
                icon: KeyRound,
                title: "App registration secrets & certificates",
                body: "Every client secret and certificate across your app registrations, with days-to-expiry and the apps that depend on them.",
              },
              {
                icon: BellRing,
                title: "SSO signing certificates",
                body: "SAML signing certificates on enterprise applications - the ones that take down single sign-on for a whole SaaS app when they lapse.",
              },
              {
                icon: CalendarX2,
                title: "Domains, DNS & mailbox limits",
                body: "Expiring custom domains, DNS misconfigurations, and mailboxes approaching storage caps - the quiet reliability issues that become loud.",
              },
            ]}
          />

          <FaqCards items={FAQ} />

          <FeatureCta
            title="Two minutes of setup. Zero surprise expiries."
            lede="Connect read-only, see every expiring credential in your tenant, and get emailed before the next one lapses. Free on one tenant, forever."
            ctaLabel="Start monitoring free"
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
