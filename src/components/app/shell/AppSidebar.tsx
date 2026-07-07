"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { ThemeLogo } from "@/components/theme/ThemeLogo";
import { getVisibleNavGroups } from "./nav-config";
import { NavLinks } from "./NavLinks";
import { SidebarTooltip } from "./SidebarTooltip";
import { SidebarUserProfile } from "./SidebarUserProfile";

export function AppSidebar({
  isPro,
  showClients,
  userName,
  userEmail,
  userImage,
  collapsed,
  hydrated,
  onToggle,
}: {
  isPro: boolean;
  showClients: boolean;
  userName: string;
  userEmail: string;
  userImage?: string | null;
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
          className={`flex shrink-0 items-center border-b border-[var(--th-sidebar-border)] ${
            isCollapsed
              ? "flex-col gap-2 px-2 py-3"
              : "h-14 justify-between gap-2 px-3"
          }`}
        >
          <Link href="/dashboard" aria-label="Dashboard home" className="min-w-0">
            <ThemeLogo showWordmark={!isCollapsed} />
          </Link>
          <SidebarTooltip
            enabled={isCollapsed}
            label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <button
              type="button"
              onClick={onToggle}
              className="nav-link shrink-0 rounded-lg p-2"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>
          </SidebarTooltip>
        </div>

        <nav
          className={`flex-1 px-2 py-4 ${
            isCollapsed ? "overflow-visible" : "overflow-y-auto"
          }`}
        >
          <NavLinks groups={groups} isPro={isPro} collapsed={isCollapsed} />
        </nav>

        <div
          className={`shrink-0 border-t border-[var(--th-sidebar-border)] ${
            isCollapsed ? "p-2" : "p-3"
          }`}
        >
          <SidebarUserProfile
            name={userName}
            email={userEmail}
            image={userImage}
            collapsed={isCollapsed}
          />
        </div>
      </div>
    </aside>
  );
}
