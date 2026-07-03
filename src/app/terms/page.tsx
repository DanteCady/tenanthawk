import type { Metadata } from "next";
import { LegalContact, LegalSection, LegalShell } from "@/components/legal/LegalShell";
import { COMPANY_LEGAL_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Terms of Service - Tenant Hawk",
  description: "Terms governing use of Tenant Hawk.",
};

const UPDATED = "June 25, 2026";

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated={UPDATED}>
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of Tenant Hawk, operated by{" "}
        {COMPANY_LEGAL_NAME}. By creating an account or using the service, you agree to these
        Terms.
      </p>

      <LegalSection title="The service">
        <p>
          Tenant Hawk provides read-only scanning of Microsoft 365 / Entra tenants to surface
          security, cost, reliability, and hygiene findings. Free and Pro plans differ in features
          as described on our pricing page. Scheduled monitoring requires an active Pro
          subscription.
        </p>
      </LegalSection>

      <LegalSection title="Eligibility & accounts">
        <p>
          You must be at least 18 and authorized to connect the Microsoft tenant you scan. You are
          responsible for safeguarding your password and for activity under your account.
        </p>
      </LegalSection>

      <LegalSection title="Microsoft connection">
        <p>
          Connecting a tenant requires Global Administrator (or equivalent) consent to our
          read-only Entra application. You may disconnect at any time. We access tenant data only to
          perform scans and alerts you request. You remain responsible for changes made in your
          Microsoft environment.
        </p>
      </LegalSection>

      <LegalSection title="Subscriptions & billing">
        <p>
          Pro subscriptions are billed monthly per tenant through Stripe unless otherwise stated.
          Fees are non-refundable except where required by law. You may cancel via the billing
          portal; access continues through the paid period.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>use the service unlawfully or to probe systems you do not own or administer;</li>
          <li>attempt to bypass security, rate limits, or access controls;</li>
          <li>resell or redistribute scan data without permission;</li>
          <li>overload our infrastructure with automated requests beyond normal product use.</li>
        </ul>
      </LegalSection>

      <LegalSection title="Disclaimer">
        <p>
          Tenant Hawk is provided &quot;as is.&quot; Findings and AI-generated remediation are
          informational, not professional security or legal advice. We do not guarantee detection
          of every issue or accuracy of dollar-impact estimates. Verify recommendations before
          applying changes in production.
        </p>
      </LegalSection>

      <LegalSection title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, {COMPANY_LEGAL_NAME} is not liable for indirect,
          incidental, or consequential damages, or for loss of data or profits arising from use of
          the service. Our total liability is limited to fees you paid us in the twelve months
          before the claim.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You may delete your account at any time. We may suspend or terminate access for violation
          of these Terms or to protect the service. Upon termination, your right to use Tenant Hawk
          ends.
        </p>
      </LegalSection>

      <LegalSection title="Governing law">
        <p>
          These Terms are governed by the laws of the State of Rhode Island, USA, without regard
          to conflict-of-law rules. Disputes will be resolved in courts located in Rhode Island,
          unless otherwise required by applicable law.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may modify these Terms. Continued use after the updated date constitutes acceptance
          of the revised Terms.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalShell>
  );
}
