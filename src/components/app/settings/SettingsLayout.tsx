import type { ReactNode } from "react";
import { PageHeader } from "@/components/app/PageHeader";
import { SettingsNav, type SettingsNavItem } from "./SettingsNav";

export function SettingsLayout({
  navItems,
  title,
  description,
  children,
  showNav = true,
}: {
  navItems?: SettingsNavItem[];
  title: string;
  description?: string;
  children: ReactNode;
  showNav?: boolean;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      {showNav && navItems ? <SettingsNav items={navItems} /> : null}
      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function buildSettingsNavItems(options: {
  showEnterpriseWorkspace: boolean;
}): SettingsNavItem[] {
  return [
    { id: "appearance", label: "Appearance", href: "/dashboard/settings#appearance" },
    { id: "account", label: "Account", href: "/dashboard/settings#account" },
    {
      id: "enterprise",
      label: "Enterprise",
      href: "/dashboard/settings/enterprise",
      route: true,
      visible: options.showEnterpriseWorkspace,
    },
    { id: "connections", label: "Connections", href: "/dashboard/settings#connections" },
    { id: "security", label: "Security", href: "/dashboard/settings#security" },
    { id: "alerts", label: "Alerts", href: "/dashboard/settings#alerts" },
    { id: "pricing", label: "License pricing", href: "/dashboard/settings#pricing" },
    { id: "danger", label: "Danger zone", href: "/dashboard/settings#danger" },
  ];
}
