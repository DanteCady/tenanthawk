import { EnterpriseConsoleUpsell } from "@/components/dashboard/EnterpriseConsoleUpsell";

export function EnterpriseConsoleBanner() {
  return (
    <EnterpriseConsoleUpsell
      compact
      title="You have multiple tenants — unlock the Enterprise console"
      description="Portfolio roll-ups, client switching, and scorecards require an Enterprise plan."
    />
  );
}
