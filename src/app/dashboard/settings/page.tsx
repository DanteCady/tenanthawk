import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  Mail,
  User,
} from "lucide-react";
import { getSession } from "@/lib/session";
import { getPlan, hasProFeatures, isEnterprisePlan } from "@/lib/entitlements";
import { getMspConsoleAccess } from "@/lib/entitlements/msp-console";
import { getActiveConnection, getConnections } from "@/lib/queries";
import { connectionLabel } from "@/lib/connection/label";
import { PlanBadge } from "@/components/app/PlanBadge";
import { DisconnectTenantButton } from "@/components/app/DisconnectTenantButton";
import { DeleteAccountButton } from "@/components/app/DeleteAccountButton";
import { AlertPreferencesForm } from "@/components/app/AlertPreferencesForm";
import { getAlertPreferences } from "@/lib/alerts/preferences";
import { getConnectionHealth } from "@/lib/connect/health";
import { TenantConnectionCheck } from "@/components/app/TenantConnectionCheck";
import { isLiveConfigured } from "@/lib/scan/graph";
import { ThemePicker } from "@/components/theme/ThemePicker";
import { timeAgo } from "@/lib/time";
import { LicensePricingForm } from "@/components/app/LicensePricingForm";
import { TwoFactorSettings } from "@/components/auth/TwoFactorSettings";
import {
  COMMON_LICENSE_PRICING_FIELDS,
  parseLicensePricing,
} from "@/lib/licenses/pricing-overrides";
import { microsoftListPriceForSku } from "@/lib/licenses/sku-pricing";

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
      <h2 className="text-lg font-semibold text-[var(--th-text)]">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-[var(--th-text-muted)]">{description}</p>
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
    <div className="flex items-start gap-3 border-b border-[var(--th-border-subtle)] py-3 last:border-0 last:pb-0 first:pt-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--th-text-faint)]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--th-text-faint)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-[var(--th-text)]">{value}</p>
      </div>
    </div>
  );
}

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plan = await getPlan(session.user.id);
  const isPro = hasProFeatures(plan);
  const mspAccess = await getMspConsoleAccess(session.user.id, session.user.email);
  const alertPrefs = await getAlertPreferences(session.user.id);
  const connections = await getConnections(session.user.id);
  const activeConn = await getActiveConnection(session.user.id);
  const liveConfigured = isLiveConfigured();

  const licensePricing = activeConn
    ? parseLicensePricing(activeConn.license_pricing)
    : null;
  const listPrices = Object.fromEntries(
    COMMON_LICENSE_PRICING_FIELDS.map(({ code }) => [
      code,
      microsoftListPriceForSku(code),
    ]),
  );
  const twoFactorEnabled = Boolean(
    (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
  );

  const connectionRows = await Promise.all(
    connections.map(async (conn) => ({
      conn,
      label: connectionLabel(conn),
      health: await getConnectionHealth(conn),
    })),
  );

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
          Account, client tenants, and billing preferences.
        </p>
      </div>

      <SettingsSection title="Appearance" description="Choose how Tenant Hawk looks on your device.">
        <ThemePicker />
      </SettingsSection>

      <SettingsSection title="Account">
        <DetailRow icon={User} label="Name" value={session.user.name} />
        <DetailRow icon={Mail} label="Email" value={session.user.email} />
      </SettingsSection>

      {isEnterprisePlan(plan) && (
        <SettingsSection
          title="Enterprise workspace"
          description="Branded subdomain, SSO, and team invites."
        >
          <Link
            href="/dashboard/settings/enterprise"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--th-border)] bg-[var(--th-surface)] px-4 py-2.5 text-sm font-medium text-[var(--th-text)] transition-colors hover:border-[var(--th-brand-muted-border)] hover:text-[var(--th-brand-text)]"
          >
            <Building2 className="h-4 w-4" />
            Configure subdomain &amp; SSO
            <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
          </Link>
        </SettingsSection>
      )}

      <SettingsSection
        title={connections.length > 1 ? "Connected clients" : "Connected tenant"}
        description="Read-only Microsoft 365 / Entra access for scanning. We never store credentials."
      >
        {connectionRows.length > 0 ? (
          <div className="space-y-4">
            {connectionRows.map(({ conn, label, health }) => {
              const isActive = activeConn?.id === conn.id;
              return (
                <div
                  key={conn.id}
                  className={`rounded-xl border p-4 ${
                    isActive
                      ? "border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)]"
                      : "border-[var(--th-border)] bg-[var(--th-muted-bg)]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[var(--th-text)]">{label}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[var(--th-text-faint)]">
                        <span
                          className={
                            conn.mode === "live"
                              ? "rounded-full border border-[var(--th-brand-muted-border)] bg-[var(--th-brand-muted)] px-2 py-0.5 font-medium text-[var(--th-brand-text)]"
                              : "badge-free"
                          }
                        >
                          {conn.mode === "live" ? "Live" : "Demo"}
                        </span>
                        {isActive ? (
                          <span className="font-medium text-[var(--th-brand-text)]">Active client</span>
                        ) : null}
                        · connected {timeAgo(conn.created_at)}
                      </p>
                    </div>
                    {!isActive ? (
                      <Link
                        href={`/dashboard/client?connection=${conn.id}`}
                        className="text-xs font-medium text-[var(--th-brand-text)] hover:text-[var(--th-brand-text-soft)]"
                      >
                        Switch to this client
                      </Link>
                    ) : null}
                  </div>

                  {conn.tenant_id ? (
                    <p className="mt-2 break-all font-mono text-xs text-[var(--th-text-muted)]">
                      {conn.tenant_id}
                    </p>
                  ) : null}

                  {health ? (
                    <div className="mt-3">
                      <TenantConnectionCheck initial={health} tenantLabel={label} />
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {liveConfigured && conn.mode === "live" && (
                      <a
                        href="/api/connect/start?return=clients"
                        className="inline-flex items-center gap-2 rounded-lg border border-[var(--th-border)] bg-[var(--th-surface)] px-3 py-1.5 text-xs font-medium text-[var(--th-text-muted)] transition-colors hover:border-[var(--th-brand-muted-border)] hover:text-[var(--th-brand-text)]"
                      >
                        Re-consent
                      </a>
                    )}
                    <DisconnectTenantButton
                      connectionId={conn.id}
                      label={label}
                      compact
                    />
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap gap-2 pt-2">
              <Link
                href="/onboarding?mode=add-client"
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--th-border)] bg-[var(--th-surface)] px-3.5 py-2 text-sm font-medium text-[var(--th-text-muted)] transition-colors hover:border-[var(--th-brand-muted-border)] hover:text-[var(--th-brand-text)]"
              >
                Add client tenant
                <ArrowRight className="h-4 w-4" />
              </Link>
              {mspAccess.showConsole ? (
                <Link
                  href="/dashboard/clients"
                  className="inline-flex items-center gap-2 rounded-lg border border-[var(--th-border)] bg-[var(--th-surface)] px-3.5 py-2 text-sm font-medium text-[var(--th-text-muted)] transition-colors hover:border-[var(--th-brand-muted-border)] hover:text-[var(--th-brand-text)]"
                >
                  <Building2 className="h-4 w-4" />
                  All clients
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--th-border)] bg-[var(--th-muted-bg)] px-4 py-6 text-center">
            <p className="text-sm text-[var(--th-text-muted)]">No tenant connected yet.</p>
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
        title="Security"
        description="Protect your Tenant Hawk account with two-factor authentication."
      >
        <TwoFactorSettings enabled={twoFactorEnabled} />
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

      <SettingsSection
        title="License pricing"
        description="Contracted per-seat rates for the active client (Pro)."
      >
        <LicensePricingForm
          isPro={isPro}
          initialOverrides={licensePricing}
          listPrices={listPrices}
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
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--th-border)] bg-[var(--th-surface)] px-3.5 py-2 text-sm font-medium text-[var(--th-text-muted)] transition-colors hover:border-[var(--th-brand-muted-border)] hover:text-[var(--th-brand-text)]"
          >
            <CreditCard className="h-4 w-4" />
            Manage billing
          </Link>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Danger zone"
        description="Permanently delete your account and all associated data."
      >
        <DeleteAccountButton isPro={isPro} />
      </SettingsSection>
    </div>
  );
}
