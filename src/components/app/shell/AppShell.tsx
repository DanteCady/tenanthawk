"use client";

import { useState } from "react";
import type { Plan } from "@/lib/entitlements";
import type { ConnectionHealth } from "@/lib/connect/health";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { MobileNavDrawer } from "./MobileNavDrawer";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";

export function AppShell({
  children,
  isPro,
  showClients,
  plan,
  userName,
  userEmail,
  userImage,
  showConnectionBlip,
  connectionHealth,
  tenantLabel,
  showMspBreadcrumb,
  connectionId,
  mspClientLabel,
}: {
  children: React.ReactNode;
  isPro: boolean;
  showClients: boolean;
  plan: Plan;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  showConnectionBlip: boolean;
  connectionHealth: ConnectionHealth | null;
  tenantLabel: string | null;
  showMspBreadcrumb: boolean;
  connectionId: string | null;
  mspClientLabel: string | null;
}) {
  const { collapsed, toggle, hydrated } = useSidebarCollapsed();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <AppSidebar
        isPro={isPro}
        showClients={showClients}
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
        collapsed={collapsed}
        hydrated={hydrated}
        onToggle={toggle}
      />

      <MobileNavDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isPro={isPro}
        showClients={showClients}
        userName={userName}
        userEmail={userEmail}
        userImage={userImage}
      />

      <div className="app-main-column">
        <AppHeader
          plan={plan}
          showConnectionBlip={showConnectionBlip}
          connectionHealth={connectionHealth}
          tenantLabel={tenantLabel}
          showMspBreadcrumb={showMspBreadcrumb}
          connectionId={connectionId}
          mspClientLabel={mspClientLabel}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
