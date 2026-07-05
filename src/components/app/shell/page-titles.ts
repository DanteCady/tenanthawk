const PAGE_TITLES: Array<{ prefix: string; title: string; exact?: boolean }> = [
  { prefix: "/dashboard/settings/enterprise", title: "Enterprise workspace" },
  { prefix: "/dashboard/settings", title: "Settings", exact: true },
  { prefix: "/dashboard/billing", title: "Billing", exact: true },
  { prefix: "/dashboard/findings", title: "Findings", exact: true },
  { prefix: "/dashboard/journal", title: "Journal", exact: true },
  { prefix: "/dashboard/roadmap", title: "Roadmap", exact: true },
  { prefix: "/dashboard/compliance", title: "Compliance", exact: true },
  { prefix: "/dashboard/reports", title: "Reports", exact: true },
  { prefix: "/dashboard/clients", title: "Clients", exact: true },
  { prefix: "/dashboard/client/scorecard", title: "Scorecard" },
  { prefix: "/dashboard/client", title: "Client overview" },
  { prefix: "/dashboard", title: "Overview", exact: true },
];

export function getDashboardPageTitle(pathname: string): string {
  for (const entry of PAGE_TITLES) {
    if (entry.exact) {
      if (pathname === entry.prefix) return entry.title;
      continue;
    }
    if (pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`)) {
      return entry.title;
    }
  }
  return "Dashboard";
}
