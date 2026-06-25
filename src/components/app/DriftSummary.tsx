import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import type { ScanDrift } from "@/lib/scan/drift";

export function DriftSummary({ drift }: { drift: ScanDrift }) {
  const hasChanges =
    drift.newCount > 0 || drift.resolvedCount > 0 || drift.changedCount > 0;

  if (!hasChanges) {
    return (
      <div className="surface-card flex items-center gap-3 p-4">
        <Sparkles className="h-5 w-5 text-green-600" />
        <div>
          <p className="text-sm font-medium text-slate-900">No drift since last scan</p>
          <p className="text-xs text-slate-500">Finding set unchanged from the previous run.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-card p-4">
      <p className="text-sm font-medium text-slate-900">Changes since last scan</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {drift.newCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
            <ArrowUp className="h-3.5 w-3.5" />
            {drift.newCount} new
          </span>
        )}
        {drift.resolvedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
            <ArrowDown className="h-3.5 w-3.5" />
            {drift.resolvedCount} resolved
          </span>
        )}
        {drift.changedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800">
            {drift.changedCount} severity change{drift.changedCount === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {(drift.newTitles.length > 0 || drift.resolvedTitles.length > 0) && (
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {drift.newTitles.map((t) => (
            <li key={`new-${t}`} className="truncate">
              <span className="font-medium text-red-600">New:</span> {t}
            </li>
          ))}
          {drift.resolvedTitles.map((t) => (
            <li key={`resolved-${t}`} className="truncate">
              <span className="font-medium text-green-600">Resolved:</span> {t}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
