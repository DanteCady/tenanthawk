import { formatReportDate } from "@/lib/export/report-format";

export interface ReportCustomer {
  organization: string;
  tenantDomain: string | null;
  tenantId: string | null;
  mode: string;
  scannedAt: string;
  provider: string;
}

export function buildReportCustomer(input: {
  tenant: string;
  displayName?: string | null;
  tenantDomain?: string | null;
  tenantId?: string | null;
  mode: string;
  scannedAt: string | Date;
  provider?: string;
}): ReportCustomer {
  return {
    organization: input.displayName ?? input.tenant,
    tenantDomain: input.tenantDomain ?? null,
    tenantId: input.tenantId ?? null,
    mode: input.mode,
    scannedAt:
      typeof input.scannedAt === "string"
        ? input.scannedAt
        : input.scannedAt.toISOString(),
    provider: input.provider ?? "microsoft",
  };
}

export function reportCustomerRows(
  customer: ReportCustomer,
): Array<{ label: string; value: string }> {
  const modeLabel =
    customer.mode === "demo" ? "Demo tenant scan" : "Live Microsoft 365 scan";

  const rows: Array<{ label: string; value: string }> = [
    { label: "Organization", value: customer.organization },
    { label: "Tenant domain", value: customer.tenantDomain ?? "-" },
    { label: "Scan type", value: modeLabel },
    { label: "Scanned", value: formatReportDate(customer.scannedAt) },
    { label: "Provider", value: "Microsoft Entra ID" },
  ];

  if (customer.tenantId && customer.mode !== "demo") {
    rows.splice(2, 0, { label: "Tenant ID", value: customer.tenantId });
  }

  return rows;
}
