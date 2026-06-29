"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ClipboardList,
  FileOutput,
  LayoutDashboard,
  Route,
  Settings,
  Shield,
  CreditCard,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clients", label: "Clients", icon: Building2, msp: true },
  { href: "/dashboard/findings", label: "Findings", icon: ClipboardList },
  { href: "/dashboard/roadmap", label: "Roadmap", icon: Route, pro: true },
  { href: "/dashboard/compliance", label: "Compliance", icon: Shield, pro: true },
  { href: "/dashboard/reports", label: "Reports", icon: FileOutput, pro: true },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
] as const;

export function DashboardNav({
  isPro,
  showClients = false,
}: {
  isPro: boolean;
  showClients?: boolean;
}) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (href === "/dashboard" && exact) {
      return pathname === "/dashboard";
    }
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const items = NAV.filter((item) => !("msp" in item && item.msp) || showClients);

  return (
    <>
      <nav className="hidden w-52 shrink-0 lg:block" aria-label="Dashboard">
        <ul className="sticky top-20 space-y-0.5">
          {items.map((item) => {
            const locked = "pro" in item && item.pro && !isPro;
            const active =
              !locked && isActive(item.href, "exact" in item ? item.exact : false);
            const Icon = item.icon;
            return (
              <li key={item.href}>
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
          const locked = "pro" in item && item.pro && !isPro;
          const active =
            !locked && isActive(item.href, "exact" in item ? item.exact : false);
          return (
            <Link
              key={item.href}
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
