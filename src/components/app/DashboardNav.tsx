"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  FileOutput,
  LayoutDashboard,
  LayoutGrid,
  Route,
  Settings,
  Shield,
  CreditCard,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  pro?: boolean;
  msp?: boolean;
  workspace?: boolean;
};

function buildNav(workspaceHref?: string | null): NavItem[] {
  const items: NavItem[] = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
    { href: "/dashboard/workspaces", label: "Workspaces", icon: Building2, msp: true },
  ];

  if (workspaceHref) {
    items.push({
      href: workspaceHref,
      label: "Workspace",
      icon: LayoutGrid,
      workspace: true,
    });
  }

  items.push(
    { href: "/dashboard/findings", label: "Findings", icon: ClipboardList },
    { href: "/dashboard/roadmap", label: "Roadmap", icon: Route, pro: true },
    { href: "/dashboard/compliance", label: "Compliance", icon: Shield, pro: true },
    { href: "/dashboard/reports", label: "Reports", icon: FileOutput, pro: true },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  );

  return items;
}

export function DashboardNav({
  isPro,
  showWorkspaces = false,
  workspaceHref,
}: {
  isPro: boolean;
  showWorkspaces?: boolean;
  workspaceHref?: string | null;
}) {
  const pathname = usePathname();
  const nav = buildNav(showWorkspaces ? workspaceHref : null);

  function isActive(item: NavItem) {
    if (item.workspace) return pathname.startsWith("/dashboard/client");
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  }

  const items = nav.filter((item) => !item.msp || showWorkspaces);

  return (
    <>
      <nav className="hidden w-52 shrink-0 lg:block" aria-label="Dashboard">
        <ul className="sticky top-20 space-y-0.5">
          {items.map((item) => {
            const locked = item.pro && !isPro;
            const active = !locked && isActive(item);
            const Icon = item.icon;
            return (
              <li key={item.href + item.label}>
                <Link
                  href={locked ? "/dashboard/billing" : item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "nav-active"
                      : locked
                        ? "nav-link-muted"
                        : "nav-link"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {locked && (
                    <span className="badge-free ml-auto px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase">
                      Pro
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        className="-mx-6 mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 px-6 pb-3 lg:hidden"
        aria-label="Dashboard"
      >
        {items.map((item) => {
          const locked = item.pro && !isPro;
          const active = !locked && isActive(item);
          return (
            <Link
              key={item.href + item.label}
              href={locked ? "/dashboard/billing" : item.href}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                active ? "nav-pill-active" : "nav-pill"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
