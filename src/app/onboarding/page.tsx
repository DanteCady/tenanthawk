import { redirect } from "next/navigation";
import {
  getActiveConnection,
  getLatestScan,
  getFindings,
} from "@/lib/queries";
import { getPlan, hasProFeatures } from "@/lib/entitlements";
import { summarize, type FindingRow } from "@/lib/summary";
import { isLiveConfigured } from "@/lib/scan/graph";
import { requireVerifiedSession } from "@/lib/session";
import { connectionLabel } from "@/lib/connection/label";
import { ConnectStep } from "@/components/onboarding/ConnectStep";
import { ResultsStep } from "@/components/onboarding/ResultsStep";

const CONNECT_ERRORS: Record<string, string> = {
  denied: "Consent was cancelled or denied. Please try again.",
  state: "The connection request expired. Please try again.",
  unconfigured:
    "Microsoft sign-in is not available in this environment yet. Use a demo scan or contact support.",
  rate_limit: "Too many connection attempts. Wait an hour and try again.",
  scan_failed:
    "We connected your tenant but the first scan failed. Try a demo scan or contact support.",
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

  if (addClientMode) {
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
