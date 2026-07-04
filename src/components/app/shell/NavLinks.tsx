"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavGroup } from "./nav-config";
import { SidebarTooltip } from "./SidebarTooltip";

function isNavActive(pathname: string, href: string, exact?: boolean) {
  if (href === "/dashboard" && exact) {
    return pathname === "/dashboard";
  }
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({
  groups,
  isPro,
  collapsed,
  onNavigate,
}: {
  groups: NavGroup[];
  isPro: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          {!collapsed && (
            <p className="app-sidebar-group-label mb-1.5 px-3 text-[0.65rem] font-semibold uppercase tracking-wider">
              {group.label}
            </p>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const locked = item.pro && !isPro;
              const active =
                !locked && isNavActive(pathname, item.href, item.exact);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <SidebarTooltip
                    enabled={collapsed}
                    label={locked ? `${item.label} (Pro)` : item.label}
                  >
                    <Link
                      href={locked ? "/dashboard/billing" : item.href}
                      aria-label={collapsed ? item.label : undefined}
                      onClick={onNavigate}
                      className={`app-sidebar-link flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition-colors ${
                        collapsed ? "justify-center px-2" : "px-3"
                      } ${
                        active
                          ? "nav-active"
                          : locked
                            ? "nav-link-muted"
                            : "nav-link"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {locked && (
                            <span className="badge-free ml-auto shrink-0 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase">
                              Pro
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarTooltip>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
