import { EnterpriseConsoleUpsell } from "@/components/dashboard/EnterpriseConsoleUpsell";

export function EnterpriseConsoleBanner() {
  return (
    <EnterpriseConsoleUpsell
      compact
      title="MSPs use Enterprise - not Pro"
      description="Pro is for one internal IT team. Add client tenants and the multi-tenant console with an Enterprise plan."
    />
  );
}
