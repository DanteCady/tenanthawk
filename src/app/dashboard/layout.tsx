import Link from "next/link";
import { requireVerifiedSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { getPrimaryConnection } from "@/lib/queries";
import { getConnectionHealth } from "@/lib/connect/health";
import { exportTenantLabel } from "@/lib/export/payload";
import { Logo } from "@/components/Logo";
import { PlanBadge } from "@/components/app/PlanBadge";
import { ConnectionStatusBlip } from "@/components/app/ConnectionStatusBlip";
import { SignOutButton } from "@/components/app/SignOutButton";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireVerifiedSession();
  const plan = await getPlan(session.user.id);
  const conn = await getPrimaryConnection(session.user.id);
  const connectionHealth = conn ? await getConnectionHealth(conn) : null;
  const tenantLabel = conn ? exportTenantLabel(conn) : null;

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/dashboard" aria-label="Dashboard">
            <Logo tone="light" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {connectionHealth ? (
              <ConnectionStatusBlip
                health={connectionHealth}
                tenantLabel={tenantLabel}
              />
            ) : null}
            <PlanBadge plan={plan} />
            {plan === "free" && (
              <Link
                href="/dashboard/billing"
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Upgrade
              </Link>
            )}
            <Link
              href="/dashboard/settings"
              className="hidden rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/billing"
              className="hidden rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline"
            >
              Billing
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
