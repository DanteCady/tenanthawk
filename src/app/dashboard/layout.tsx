import Link from "next/link";
import { requireVerifiedSession } from "@/lib/session";
import { getPlan, hasProFeatures } from "@/lib/entitlements";
import { getActiveConnection, getConnections } from "@/lib/queries";
import { connectionLabel } from "@/lib/connection/label";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { PlanBadge } from "@/components/app/PlanBadge";
import { ConnectionStatusBlip } from "@/components/app/ConnectionStatusBlip";
import { ClientContextBar } from "@/components/app/ClientContextBar";
import { SignOutButton } from "@/components/app/SignOutButton";
import { AppFooter } from "@/components/AppFooter";
import { DashboardNav } from "@/components/app/DashboardNav";
import { getConnectionHealth } from "@/lib/connect/health";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireVerifiedSession();
  const plan = await getPlan(session.user.id);
  const connections = await getConnections(session.user.id);
  const conn = await getActiveConnection(session.user.id);
  const connectionHealth = conn ? await getConnectionHealth(conn) : null;
  const tenantLabel = conn ? connectionLabel(conn) : null;
  const isPro = hasProFeatures(plan);
  const isMsp = connections.length > 1;

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="app-header sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/dashboard" aria-label="Dashboard">
            <ThemeLogo />
          </Link>
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {!isMsp && connectionHealth ? (
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
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 lg:flex-row lg:gap-8">
        <DashboardNav isPro={isPro} showClients={isMsp} />
        <main className="min-w-0 flex-1">
          {isMsp && conn && tenantLabel ? (
            <ClientContextBar
              show
              connectionId={conn.id}
              label={tenantLabel}
            />
          ) : null}
          {children}
        </main>
      </div>

      <AppFooter />
    </div>
  );
}
