import { Clock, Radar } from "lucide-react";
import { getLastScheduledScan } from "@/lib/queries";
import { formatNextScanLabel } from "@/lib/monitoring/schedule";
import { timeAgo } from "@/lib/time";

export async function MonitoringStatus({
  connectionId,
}: {
  connectionId: string;
}) {
  const lastScheduled = await getLastScheduledScan(connectionId);

  return (
    <div className="surface-card flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-slate-700">
        <Radar className="h-4 w-4 text-blue-600" />
        <span>
          <span className="font-medium text-slate-900">Daily monitoring</span>
          {" · "}
          active
        </span>
      </div>
      <div className="flex items-center gap-2 text-slate-600">
        <Clock className="h-4 w-4 text-slate-400" />
        <span>
          Next scan{" "}
          <span className="font-medium text-slate-800">
            {formatNextScanLabel()}
          </span>
        </span>
      </div>
      {lastScheduled && (
        <span className="text-xs text-slate-500">
          Last automated scan {timeAgo(lastScheduled.started_at)}
        </span>
      )}
    </div>
  );
}
