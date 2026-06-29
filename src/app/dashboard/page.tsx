import { redirect } from "next/navigation";
import { requireVerifiedSession } from "@/lib/session";
import { getConnections } from "@/lib/queries";
import { getMspOverview } from "@/lib/connection/msp-overview";
import { MspOverviewDashboard } from "@/components/dashboard/MspOverviewDashboard";
import { ClientOverviewDashboard } from "@/components/dashboard/ClientOverviewDashboard";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ connection?: string }>;
}) {
  const session = await requireVerifiedSession();
  const connections = await getConnections(session.user.id);
  const { connection } = await searchParams;

  if (connections.length > 1) {
    if (connection) {
      redirect(`/dashboard/client?connection=${connection}`);
    }
    const overview = await getMspOverview(session.user.id);
    return <MspOverviewDashboard overview={overview} />;
  }

  return <ClientOverviewDashboard />;
}
