import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Globe, KeyRound, Users } from "lucide-react";
import { getSession } from "@/lib/session";
import { isEnterprisePlan, getPlan } from "@/lib/entitlements";
import { getOwnedEnterpriseOrganization } from "@/lib/enterprise/workspace";
import { EnterpriseWorkspaceSettings } from "@/components/enterprise/EnterpriseWorkspaceSettings";
import { EnterpriseSsoSettings } from "@/components/enterprise/EnterpriseSsoSettings";
import { EnterpriseInviteSettings } from "@/components/enterprise/EnterpriseInviteSettings";
import { pool } from "@/db";

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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to settings
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Enterprise workspace
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Branded subdomain, SSO, and team invites for your MSP.
        </p>
      </div>

      <section className="surface-card p-6">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Subdomain</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Your team signs in at your branded URL.
        </p>
        <div className="mt-5">
          <EnterpriseWorkspaceSettings
            organizationId={org.id}
            name={org.name}
            slug={org.slug}
          />
        </div>
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Single sign-on</h2>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Connect Okta, Entra ID, or any SAML/OIDC identity provider.
        </p>
        <div className="mt-5">
          <EnterpriseSsoSettings
            organizationId={org.id}
            organizationSlug={org.slug}
            existingProvider={existingSso}
          />
        </div>
      </section>

      <section className="surface-card p-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Team invites</h2>
        </div>
        <div className="mt-5">
          <EnterpriseInviteSettings organizationId={org.id} />
        </div>
      </section>
    </div>
  );
}
