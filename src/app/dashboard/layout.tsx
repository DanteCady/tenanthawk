import { requireVerifiedSession } from "@/lib/session";
import { getPlan, getTrialStatus, hasProFeatures } from "@/lib/entitlements";
import { getMspConsoleAccess } from "@/lib/entitlements/msp-console";
import { getActiveConnection } from "@/lib/queries";
import { connectionLabel } from "@/lib/connection/label";
import { AppShell } from "@/components/app/shell/AppShell";
import { getConnectionHealth } from "@/lib/connect/health";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireVerifiedSession();
  const plan = await getPlan(session.user.id);
  const trial = await getTrialStatus(session.user.id);
  const mspAccess = await getMspConsoleAccess(session.user.id, session.user.email);
  const conn = await getActiveConnection(session.user.id);
  const connectionHealth = conn ? await getConnectionHealth(conn) : null;
  const tenantLabel = conn ? connectionLabel(conn) : null;
  const isPro = hasProFeatures(plan);

  return (
    <AppShell
      isPro={isPro}
      trialDaysLeft={trial.daysLeft}
      showClients={mspAccess.showConsole}
      plan={plan}
      userName={session.user.name}
      userEmail={session.user.email}
      userImage={(session.user as { image?: string | null }).image ?? null}
      showConnectionBlip={!mspAccess.showConsole}
      connectionHealth={connectionHealth}
      tenantLabel={tenantLabel}
      showMspBreadcrumb={mspAccess.showConsole}
      connectionId={conn?.id ?? null}
      mspClientLabel={tenantLabel}
    >
      {children}
    </AppShell>
  );
}
