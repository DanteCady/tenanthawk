import type { Metadata } from "next";
import { LegalContact, LegalSection, LegalShell } from "@/components/legal/LegalShell";
import { COMPANY_LEGAL_NAME } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Privacy Policy — Tenant Hawk",
  description: "How Tenant Hawk collects, uses, and protects your data.",
};

const UPDATED = "June 25, 2026";

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated={UPDATED}>
      <p>
        {COMPANY_LEGAL_NAME} (&quot;we,&quot; &quot;us&quot;) operates Tenant Hawk, a read-only
        Microsoft 365 / Entra tenant health scanning service. This policy explains what we
        collect and how we use it when you use tenanthawk.io and related services.
      </p>

      <LegalSection title="What we collect">
        <p>
          <strong>Account information:</strong> name, email address, and password (stored hashed).
          We send email verification codes and, for Pro subscribers, monitoring alerts.
        </p>
        <p>
          <strong>Tenant connection metadata:</strong> Microsoft tenant ID, domain, and display
          name after you grant admin consent. We do <em>not</em> store Microsoft credentials or
          long-lived access tokens.
        </p>
        <p>
          <strong>Scan results:</strong> health scores, findings, remediation notes, and optional
          AI-generated remediation text cached per finding.
        </p>
        <p>
          <strong>Billing:</strong> subscription status via Stripe. Payment card details are handled
          by Stripe, not stored on our servers.
        </p>
        <p>
          <strong>Alert preferences:</strong> email and webhook URLs you configure for Pro
          monitoring.
        </p>
        <p>
          <strong>Technical logs:</strong> standard server logs (IP address, user agent, timestamps)
          for security and troubleshooting.
        </p>
      </LegalSection>

      <LegalSection title="How we use data">
        <p>
          We use your data to provide scans, dashboards, exports, billing, email verification,
          scheduled monitoring, and support. We do not sell your personal information.
        </p>
        <p>
          Scan data is read from Microsoft Graph using application permissions you consent to. We
          use it only to produce reports and alerts for your account.
        </p>
        <p>
          If you enable AI remediation, finding titles and descriptions may be sent to OpenAI to
          generate fix steps. Results are cached in our database.
        </p>
      </LegalSection>

      <LegalSection title="Data retention & deletion">
        <p>
          We retain account and scan data while your account is active. Disconnecting a tenant
          removes connection and scan history for that tenant. Deleting your account permanently
          removes your user record and associated data from our systems.
        </p>
      </LegalSection>

      <LegalSection title="Third parties">
        <p>
          We rely on service providers including hosting, Postgres database, Stripe (payments),
          email delivery (SMTP), Microsoft Graph (tenant data), and OpenAI (optional AI
          remediation). Each processes data under their own terms and only as needed to provide the
          service.
        </p>
      </LegalSection>

      <LegalSection title="Security">
        <p>
          We use HTTPS, hashed passwords, read-only Microsoft access, and least-privilege
          application permissions. No system is perfectly secure; report concerns to us promptly.
        </p>
      </LegalSection>

      <LegalSection title="Your rights">
        <p>
          Depending on your location, you may have rights to access, correct, or delete personal
          data. Use in-app account deletion or contact us. California residents may have additional
          rights under the CCPA.
        </p>
      </LegalSection>

      <LegalSection title="Changes">
        <p>
          We may update this policy. Material changes will be reflected by the &quot;Last
          updated&quot; date above.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalShell>
  );
}
