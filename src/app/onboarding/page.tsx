import { redirect } from "next/navigation";
import {
  getActiveConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { getPlan, hasProFeatures } from "@/lib/entitlements";
import { getEnterpriseClientLimit } from "@/lib/billing/enterprise-limits";
import { getEnterpriseClientCap } from "@/lib/billing/pricing";
import { summarize, type FindingRow } from "@/lib/summary";
import { isLiveConfigured } from "@/lib/scan/graph";
import { requireVerifiedSession } from "@/lib/session";
import { connectionLabel } from "@/lib/connection/label";
import { getOwnedEnterpriseOrganization } from "@/lib/enterprise/workspace";
import { getUserAccountType } from "@/lib/onboarding/user-account";
import { ConnectStep } from "@/components/onboarding/ConnectStep";
import { ResultsStep } from "@/components/onboarding/ResultsStep";
import { EnterpriseConsoleUpsell } from "@/components/dashboard/EnterpriseConsoleUpsell";

const CONNECT_ERRORS: Record<string, string> = {
  denied: "Consent was cancelled or denied. Please try again.",
  state: "The connection request expired. Please try again.",
  unconfigured:
    "Microsoft sign-in is not available in this environment yet. Use a demo scan or contact support.",
  rate_limit: "Too many connection attempts. Wait an hour and try again.",
  scan_failed:
    "We connected your tenant but the first scan failed. Try a demo scan or contact support.",
  client_cap: `Your Enterprise plan includes up to ${getEnterpriseClientCap()} client tenants. Contact support for volume pricing.`,
  enterprise_required: "Enterprise is required to add client tenants.",
  error: "Something went wrong connecting. Please try again.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ connect?: string; mode?: string }>;
}) {
  const session = await requireVerifiedSession();
  const { connect, mode } = await searchParams;
  const addClientMode = mode === "add-client";

  if (!addClientMode) {
    const accountType = await getUserAccountType(session.user.id);
    if (accountType === "msp") {
      const org = await getOwnedEnterpriseOrganization(session.user.id);
      if (!org) {
        redirect("/onboarding/workspace");
      }
    }
  }

  if (addClientMode) {
    const limit = await getEnterpriseClientLimit(session.user.id, session.user.email);

    if (!limit.canAdd && !limit.atCap) {
      return (
        <EnterpriseConsoleUpsell
          title="Add client tenants with Enterprise"
          description="Pro is for a single internal IT team. MSPs and consultants need Enterprise — not Pro — to connect and manage client tenants."
        />
      );
    }

    if (limit.atCap) {
      return (
        <EnterpriseConsoleUpsell
          title="Client tenant limit reached"
          description={`Your Enterprise Starter plan includes ${limit.cap} client tenants and you have ${limit.count} connected. Contact support for volume pricing.`}
        />
      );
    }

    return (
      <ConnectStep
        liveConfigured={isLiveConfigured()}
        showDevSetup={!isLiveConfigured() && process.env.NODE_ENV === "development"}
        error={connect ? CONNECT_ERRORS[connect] : undefined}
        addClientMode
      />
    );
  }
  const conn = await getActiveConnection(session.user.id);
  const scan = conn ? await getLatestScan(conn.id) : undefined;

  if (!conn || !scan) {
    return (
      <ConnectStep
        liveConfigured={isLiveConfigured()}
        showDevSetup={!isLiveConfigured() && process.env.NODE_ENV === "development"}
        error={connect ? CONNECT_ERRORS[connect] : undefined}
      />
    );
  }

  const plan = await getPlan(session.user.id);
  if (hasProFeatures(plan)) redirect("/dashboard");

  const findings = (await getFindings(scan.id)) as FindingRow[];
  const summary = summarize(findings, scan.category_scores);

  return (
    <ResultsStep
      summary={summary}
      score={scan.score ?? 0}
      tenant={connectionLabel(conn)}
    />
  );
}
