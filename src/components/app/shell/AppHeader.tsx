"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronRight, Menu } from "lucide-react";
import type { Plan } from "@/lib/entitlements";
import type { ConnectionHealth } from "@/lib/connect/health";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { PlanBadge } from "@/components/app/PlanBadge";
import { ConnectionStatusBlip } from "@/components/app/ConnectionStatusBlip";
import { SignOutButton } from "@/components/app/SignOutButton";

export function AppHeader({
  plan,
  showConnectionBlip,
  connectionHealth,
  tenantLabel,
  showMspBreadcrumb,
  connectionId,
  mspClientLabel,
  onOpenMobileNav,
}: {
  plan: Plan;
  showConnectionBlip: boolean;
  connectionHealth: ConnectionHealth | null;
  tenantLabel: string | null;
  showMspBreadcrumb: boolean;
  connectionId: string | null;
  mspClientLabel: string | null;
  onOpenMobileNav: () => void;
}) {
  const pathname = usePathname();

  const showClientCrumb =
    showMspBreadcrumb &&
    connectionId &&
    mspClientLabel &&
    pathname !== "/dashboard" &&
    pathname !== "/dashboard/clients" &&
    !pathname.startsWith("/dashboard/client");

  return (
    <header className="app-header sticky top-0 z-30 shrink-0 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="nav-link rounded-lg p-2 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="lg:hidden" aria-label="Dashboard home">
            <ThemeLogo showWordmark={false} />
          </Link>

          {showClientCrumb ? (
            <nav
              aria-label="Client context"
              className="flex min-w-0 items-center gap-1.5 text-sm"
            >
              <Building2
                className="hidden h-4 w-4 shrink-0 text-[var(--th-brand-text)] sm:block"
                aria-hidden
              />
              <Link
                href="/dashboard/clients"
                className="shrink-0 font-medium text-[var(--th-text-muted)] hover:text-[var(--th-text)]"
              >
                Clients
              </Link>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--th-text-faint)]" />
              <Link
                href={`/dashboard/client?connection=${connectionId}`}
                className="truncate font-semibold text-[var(--th-text)] hover:text-[var(--th-brand-text)]"
              >
                {mspClientLabel}
              </Link>
            </nav>
          ) : (
            <span className="hidden text-sm font-medium text-[var(--th-text-muted)] lg:inline">
              Dashboard
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showConnectionBlip && connectionHealth ? (
            <ConnectionStatusBlip health={connectionHealth} tenantLabel={tenantLabel} />
          ) : null}
          <div className="hidden sm:block">
            <PlanBadge plan={plan} />
          </div>
          {plan === "free" && (
            <Link href="/dashboard/billing" className="btn-primary px-3 py-1.5 text-sm">
              Upgrade
            </Link>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
