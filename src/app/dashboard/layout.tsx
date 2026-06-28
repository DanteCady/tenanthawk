import Link from "next/link";
import { requireVerifiedSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { getPrimaryConnection } from "@/lib/queries";
import { getConnectionHealth } from "@/lib/connect/health";
import { exportTenantLabel } from "@/lib/export/payload";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { PlanBadge } from "@/components/app/PlanBadge";
import { ConnectionStatusBlip } from "@/components/app/ConnectionStatusBlip";
import { SignOutButton } from "@/components/app/SignOutButton";
import { AppFooter } from "@/components/AppFooter";
import { DashboardNav } from "@/components/app/DashboardNav";

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
  const isPro = plan === "pro";

  return (
    <div className="app-shell flex min-h-screen flex-col">
      <header className="app-header sticky top-0 z-40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/dashboard" aria-label="Dashboard">
            <ThemeLogo />
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
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8 lg:flex-row lg:gap-8">
        <DashboardNav isPro={isPro} />
        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <AppFooter />
    </div>
  );
}
