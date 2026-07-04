import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isEnterprisePlan, getPlan } from "@/lib/entitlements";
import { getOwnedEnterpriseOrganization } from "@/lib/enterprise/workspace";
import { EnterpriseWorkspaceSettings } from "@/components/enterprise/EnterpriseWorkspaceSettings";
import { EnterpriseSsoSettings } from "@/components/enterprise/EnterpriseSsoSettings";
import { EnterpriseInviteSettings } from "@/components/enterprise/EnterpriseInviteSettings";
import { pool } from "@/db";
import { SettingsSection } from "@/components/app/settings/SettingsSection";
import {
  SettingsLayout,
  buildSettingsNavItems,
} from "@/components/app/settings/SettingsLayout";

export default async function EnterpriseSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plan = await getPlan(session.user.id);
  if (!isEnterprisePlan(plan)) {
    redirect("/dashboard/billing");
  }

  const org = await getOwnedEnterpriseOrganization(session.user.id);
  if (!org) redirect("/onboarding/workspace");

  const ssoRow = await pool.query<{
    providerId: string;
    domain: string;
    domainVerified: boolean | null;
  }>(
    `SELECT "providerId", domain, "domainVerified" FROM "ssoProvider" WHERE "organizationId" = $1 LIMIT 1`,
    [org.id],
  );

  const existingSso = ssoRow.rows[0]
    ? {
        providerId: ssoRow.rows[0].providerId,
        domain: ssoRow.rows[0].domain,
        domainVerified: Boolean(ssoRow.rows[0].domainVerified),
      }
    : null;

  const navItems = buildSettingsNavItems({ showEnterpriseWorkspace: true });

  return (
    <SettingsLayout
      navItems={navItems}
      title="Enterprise workspace"
      description="Branded subdomain, SSO, and team invites for your MSP."
    >
      <SettingsSection
        title="Subdomain"
        description="Your team signs in at your branded URL."
      >
        <EnterpriseWorkspaceSettings
          organizationId={org.id}
          name={org.name}
          slug={org.slug}
        />
      </SettingsSection>

      <SettingsSection
        title="Single sign-on"
        description="Connect Okta, Entra ID, or any SAML/OIDC identity provider."
      >
        <EnterpriseSsoSettings
          organizationId={org.id}
          organizationSlug={org.slug}
          existingProvider={existingSso}
        />
      </SettingsSection>

      <SettingsSection title="Team invites" description="Invite teammates to your workspace.">
        <EnterpriseInviteSettings organizationId={org.id} />
      </SettingsSection>
    </SettingsLayout>
  );
}
