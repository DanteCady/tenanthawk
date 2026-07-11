import Link from "next/link";
import { KeyRound, ShieldAlert, UserRoundX, Workflow } from "lucide-react";
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
import { faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "Microsoft 365 security assessment — findings in minutes, not weeks",
  description:
    "A read-only security assessment of your M365 tenant: Conditional Access gaps, users without MFA, legacy authentication, over-privileged apps, and stale admins - graded, prioritized, and mapped to CIS/NIST. No consultants, no agents.",
  path: "/features/security-assessment",
  keywords: [
    "microsoft 365 security assessment",
    "m365 security assessment",
    "microsoft 365 security audit",
    "office 365 security best practices checklist",
    "entra id security audit",
    "conditional access audit",
    "users without mfa office 365",
    "mfa report office 365",
    "legacy authentication office 365",
    "microsoft 365 security review",
  ],
});

const FAQ: FeatureFaqItem[] = [
  {
    q: "What does the assessment check?",
    a: "Conditional Access coverage and risky exclusions (including policies stuck in report-only), users and admins without MFA, legacy authentication still enabled, over-privileged app registrations, stale admin role assignments, and guest accounts that should be gone. Each finding is graded by severity with concrete remediation steps.",
  },
  {
    q: "How is this different from hiring a consultant for an assessment?",
    a: "A consulting engagement produces a similar findings list in two to six weeks for thousands of dollars - accurate for the day it was written. Tenant Hawk produces the graded findings list in minutes and re-runs it daily, so the assessment never goes stale. Many consultants use tooling like this to do the engagement anyway.",
  },
  {
    q: "How is this different from Microsoft Secure Score?",
    a: "Secure Score is a useful number but it mixes products you don't own, rewards enabling Microsoft upsells, and doesn't cover cost or expiry risk. Tenant Hawk focuses on the misconfigurations that actually get tenants breached, adds dollar impact, and explains each fix in plain language. See the full comparison on our compare page.",
  },
  {
    q: "Is it safe to run against production?",
    a: "Yes - the scan is read-only end to end. App-only Microsoft Graph permissions via standard admin consent, no agents, no writes, no stored credentials. You can revoke access at any time from Entra.",
  },
  {
    q: "Can I show the results to leadership or an auditor?",
    a: "Pro includes an executive report with category grades and trends, shareable as a read-only link or exported to PDF - plus CIS Controls and NIST SP 800-53 mapping so findings translate directly into compliance language.",
  },
];

export default function SecurityAssessmentPage() {
  return (
    <>
      <JsonLd data={faqPageSchema(FAQ)} />
      <div className="marketing-v2 min-h-screen">
        <Navbar />
        <main className="flex-1">
          <FeatureHero
            eyebrow="Security assessment"
            eyebrowClass="text-red-600"
            title="A security assessment of your M365 tenant. In minutes."
            lede="Not a six-week consulting engagement - a read-only scan that grades your tenant on the misconfigurations attackers actually use: MFA gaps, Conditional Access drift, legacy auth, over-privileged apps, and stale admins. Prioritized, explained, and mapped to CIS/NIST."
            ctaLabel="Run my assessment"
            footnote="Read-only Graph access · graded findings in minutes · CIS / NIST mapping on Pro"
          />

          <PainGrid
            title="What the assessment covers"
            lede="The four places tenant security quietly erodes."
            iconClass="bg-red-50 text-red-600"
            items={[
              {
                icon: ShieldAlert,
                title: "Conditional Access drift",
                body: "Policies stuck in report-only, risky exclusions that outlived their reason, and coverage gaps between policies that each looked fine alone.",
              },
              {
                icon: UserRoundX,
                title: "MFA & identity gaps",
                body: "Users - and worse, admins - without MFA, plus guest accounts nobody remembers inviting and stale privileged role assignments.",
              },
              {
                icon: KeyRound,
                title: "Legacy authentication",
                body: "Protocols that bypass MFA entirely, still enabled because something might break. The single most common gap in real-world tenant breaches.",
              },
              {
                icon: Workflow,
                title: "Over-privileged applications",
                body: "App registrations with tenant-wide write permissions that no one has reviewed since the integration shipped.",
              },
            ]}
          />

          {/* Secure Score bridge */}
          <section className="bg-white py-16">
            <div className="mx-auto max-w-3xl px-6">
              <Reveal>
                <div className="rounded-2xl border border-mk-line bg-mk-panel px-8 py-6 text-center">
                  <p className="text-sm text-mk-soft">
                    Already watching Microsoft Secure Score?{" "}
                    <Link
                      href="/compare/microsoft-secure-score"
                      className="font-semibold text-red-700 hover:text-red-800"
                    >
                      See how Tenant Hawk compares
                    </Link>{" "}
                    - and what Secure Score doesn&apos;t tell you.
                  </p>
                </div>
              </Reveal>
            </div>
          </section>

          <FaqCards items={FAQ} />

          <FeatureCta
            title="Know your gaps before someone else does."
            lede="Connect read-only and get a graded, prioritized security assessment of your tenant today - then watch it stay current with daily scans."
            ctaLabel="Run my assessment"
          />
        </main>
        <Footer />
      </div>
    </>
  );
}
