import { grade } from "@/lib/scan/score";
import { GradeBadge } from "./GradeBadge";
import { timeAgo } from "@/lib/time";

export function ScanHistory({
  scans,
}: {
  scans: Array<{ id: string; score: number | null; started_at: Date | string }>;
}) {
  if (scans.length < 2) {
    return (
      <div className="surface-card p-4">
        <p className="text-sm font-medium text-slate-900">Scan history</p>
        <p className="mt-1 text-xs text-slate-500">
          Run another scan to start building history.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-slate-100 px-4 py-3">
        <p className="text-sm font-medium text-slate-900">Scan history</p>
        <p className="text-xs text-slate-500">Last {scans.length} completed scans</p>
      </div>
      <ul className="divide-y divide-slate-100">
        {scans.map((s, i) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <div className="min-w-0">
              <p className="text-slate-900">
                {i === 0 ? "Latest" : timeAgo(s.started_at)}
              </p>
              <p className="text-xs text-slate-500">
                Score {s.score ?? "-"}
              </p>
            </div>
            {s.score != null && <GradeBadge letter={grade(s.score)} size="sm" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
