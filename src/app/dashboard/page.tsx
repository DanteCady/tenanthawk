import { redirect } from "next/navigation";
import { requireVerifiedSession } from "@/lib/session";
import { getMspOverview } from "@/lib/connection/msp-overview";
import { getMspConsoleAccess } from "@/lib/entitlements/msp-console";
import { MspOverviewDashboard } from "@/components/dashboard/MspOverviewDashboard";
import { ClientOverviewDashboard } from "@/components/dashboard/ClientOverviewDashboard";
import { EnterpriseConsoleBanner } from "@/components/dashboard/EnterpriseConsoleBanner";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ connection?: string }>;
}) {
  const session = await requireVerifiedSession();
  const mspAccess = await getMspConsoleAccess(session.user.id, session.user.email);
  const { connection } = await searchParams;

  if (mspAccess.showConsole) {
    if (connection) {
      redirect(`/dashboard/client?connection=${connection}`);
    }
    const overview = await getMspOverview(session.user.id);
    return <MspOverviewDashboard overview={overview} />;
  }

  return (
    <div className="space-y-5">
      {mspAccess.multiTenant && !mspAccess.entitled ? <EnterpriseConsoleBanner /> : null}
      <ClientOverviewDashboard />
    </div>
  );
}
