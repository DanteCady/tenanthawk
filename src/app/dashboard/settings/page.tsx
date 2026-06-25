import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { getConnections } from "@/lib/queries";
import { PlanBadge } from "@/components/app/PlanBadge";
import { DisconnectTenantButton } from "@/components/app/DisconnectTenantButton";
import { AlertPreferencesForm } from "@/components/app/AlertPreferencesForm";
import { getAlertPreferences } from "@/lib/alerts/preferences";
import { isLiveConfigured } from "@/lib/scan/graph";
import { timeAgo } from "@/lib/time";

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="surface-card p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 py-3 last:border-0 last:pb-0 first:pt-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plan = await getPlan(session.user.id);
  const isPro = plan === "pro";
  const alertPrefs = await getAlertPreferences(session.user.id);
  const connections = await getConnections(session.user.id);
  const connection = connections[0];
  const liveConfigured = isLiveConfigured();

  const tenantLabel =
    connection?.tenant_domain ??
    connection?.display_name ??
    (connection?.mode === "demo" ? "Contoso (demo)" : "Microsoft 365");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Account, tenant connection, and billing preferences.
        </p>
      </div>

      <SettingsSection title="Account">
        <DetailRow icon={User} label="Name" value={session.user.name} />
        <DetailRow icon={Mail} label="Email" value={session.user.email} />
      </SettingsSection>

      <SettingsSection
        title="Connected tenant"
        description="Read-only Microsoft 365 / Entra access for scanning. We never store credentials."
      >
        {connection ? (
          <>
            <DetailRow
              icon={Building2}
              label="Tenant"
              value={
                <span className="flex flex-wrap items-center gap-2">
                  {tenantLabel}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      connection.mode === "live"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {connection.mode === "live" ? "Live" : "Demo"}
                  </span>
                </span>
              }
            />
            {connection.tenant_id && (
              <DetailRow
                icon={Lock}
                label="Tenant ID"
                value={
                  <code className="break-all text-xs text-slate-700">
                    {connection.tenant_id}
                  </code>
                }
              />
            )}
            <DetailRow
              icon={Lock}
              label="Connected"
              value={timeAgo(connection.created_at)}
            />

            <div className="mt-5 flex flex-wrap gap-2">
              {liveConfigured && connection.mode === "live" && (
                <a
                  href="/api/connect/start"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
                >
                  Re-consent
                </a>
              )}
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
              >
                Connect another
              </Link>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <DisconnectTenantButton />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
            <p className="text-sm text-slate-600">No tenant connected yet.</p>
            <Link
              href="/onboarding"
              className="btn-primary mt-4 inline-flex text-sm shadow-none hover:shadow-md"
            >
              Connect a tenant
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Monitoring & alerts"
        description="Pro includes daily automated scans. Choose when we alert you by email or Slack, Teams, or Discord webhook."
      >
        <AlertPreferencesForm
          isPro={isPro}
          userEmail={session.user.email}
          initialInstantAlerts={alertPrefs.instantAlerts}
          initialWeeklyDigest={alertPrefs.weeklyDigest}
          initialExpiryAlerts={alertPrefs.expiryAlerts}
        />
      </SettingsSection>

      <SettingsSection title="Plan & billing">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-600">Current plan</p>
            <div className="mt-1">
              <PlanBadge plan={plan} />
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
          >
            <CreditCard className="h-4 w-4" />
            Manage billing
          </Link>
        </div>
      </SettingsSection>
    </div>
  );
}
