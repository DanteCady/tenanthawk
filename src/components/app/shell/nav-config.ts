import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardList,
  CreditCard,
  FileOutput,
  LayoutDashboard,
  Route,
  Settings,
  Shield,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
  pro?: boolean;
  msp?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/dashboard/clients", label: "Clients", icon: Building2, msp: true },
    ],
  },
  {
    label: "Security",
    items: [
      { href: "/dashboard/findings", label: "Findings", icon: ClipboardList },
      { href: "/dashboard/roadmap", label: "Roadmap", icon: Route, pro: true },
      { href: "/dashboard/compliance", label: "Compliance", icon: Shield, pro: true },
      { href: "/dashboard/reports", label: "Reports", icon: FileOutput, pro: true },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
    ],
  },
];

export function getVisibleNavGroups(showClients: boolean): NavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.msp || showClients),
  })).filter((group) => group.items.length > 0);
}
