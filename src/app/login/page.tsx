import { Suspense } from "react";
import { headers } from "next/headers";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { EnterpriseLoginForm } from "@/components/auth/EnterpriseAuth";
import { getOrganizationBySlug } from "@/lib/enterprise/workspace";
import { parseHostContext } from "@/lib/platform/admin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const host = (await headers()).get("host");
  const ctx = parseHostContext(host);
  const { error } = await searchParams;

  if (ctx.kind === "platform-admin") {
    return (
      <AuthShell
        title="Platform console"
        subtitle="Sign in with your Tenant Hawk operator account."
      >
        {error === "not-authorized" && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-sm text-red-400">
            This account is not authorized for the platform console.
          </p>
        )}
        <Suspense>
          <AuthForm mode="login" defaultRedirect="/admin" />
        </Suspense>
      </AuthShell>
    );
  }

  if (ctx.kind === "enterprise") {
    const org = await getOrganizationBySlug(ctx.slug);
    if (org) {
      return (
        <AuthShell
          title={`${org.name}`}
          subtitle="Sign in with your organization SSO."
        >
          <EnterpriseLoginForm
            organizationSlug={org.slug}
            organizationName={org.name}
          />
        </AuthShell>
      );
    }

    return (
      <AuthShell
        title="Workspace not found"
        subtitle="This subdomain is not registered. Check the URL or contact your MSP admin."
      >
        <p className="text-center text-sm text-slate-600">
          <a href="https://tenanthawk.io/login" className="text-blue-600 hover:underline">
            Go to tenanthawk.io
          </a>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Tenant Hawk dashboard."
    >
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  );
}
