"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { PlanBadge } from "@/components/app/PlanBadge";
import type { Plan } from "@/lib/entitlements";
import { getVisibleNavGroups } from "./nav-config";
import { NavLinks } from "./NavLinks";

export function AppSidebar({
  isPro,
  showClients,
  plan,
  collapsed,
  hydrated,
  onToggle,
}: {
  isPro: boolean;
  showClients: boolean;
  plan: Plan;
  collapsed: boolean;
  hydrated: boolean;
  onToggle: () => void;
}) {
  const groups = getVisibleNavGroups(showClients);
  const isCollapsed = hydrated && collapsed;

  return (
    <aside
      className="app-sidebar hidden lg:flex"
      data-collapsed={isCollapsed ? "true" : "false"}
      aria-label="Main navigation"
    >
      <div className="flex h-full flex-col">
        <div
          className={`flex h-14 shrink-0 items-center border-b border-[var(--th-sidebar-border)] ${
            isCollapsed ? "justify-center px-2" : "px-4"
          }`}
        >
          <Link href="/dashboard" aria-label="Dashboard home">
            <ThemeLogo showWordmark={!isCollapsed} />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <NavLinks groups={groups} isPro={isPro} collapsed={isCollapsed} />
        </nav>

        <div
          className={`shrink-0 border-t border-[var(--th-sidebar-border)] p-2 ${
            isCollapsed ? "flex flex-col items-center gap-2" : "space-y-2"
          }`}
        >
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 py-1">
              <PlanBadge plan={plan} />
            </div>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="nav-link flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
