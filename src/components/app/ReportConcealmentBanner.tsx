import { Eye, EyeOff } from "lucide-react";
import type { ReportConcealmentStatus } from "@/lib/scan/report-settings.shared";
import { M365_REPORTS_SETTINGS_URL } from "@/lib/scan/report-settings.shared";

export function ReportConcealmentBanner({
  status,
  compact = false,
}: {
  status: ReportConcealmentStatus;
  compact?: boolean;
}) {
  if (status.state === "unknown") return null;

  if (status.state === "visible") {
    return (
      <div
        className={
          compact
            ? "rounded-xl border border-emerald-200/80 bg-emerald-50/80 px-4 py-3"
            : "rounded-2xl border border-emerald-200/80 bg-emerald-50/70 px-5 py-4"
        }
        role="status"
      >
        <div className="flex gap-3">
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-950">
              Report names are turned on for this tenant
            </p>
            <p className="mt-1 text-sm text-emerald-900/90">
              Microsoft 365 usage reports include real user, group, and site names.
              Mailbox, Teams, and SharePoint findings should show identifiable names.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3"
          : "rounded-2xl border border-amber-200/80 bg-amber-50/80 px-5 py-4"
      }
      role="status"
    >
      <div className="flex gap-3">
        <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-950">
            Report names are concealed for this tenant
          </p>
          <p className="mt-1 text-sm text-amber-900/90">
            Microsoft 365 is hiding user, group, and site names in usage reports.
            Findings may show storage and activity instead of real names, and some
            cost checks may be skipped. To show real names, ask the client&apos;s
            Global Admin to turn off{" "}
            <span className="font-medium">
              Display concealed user, group, and site names in all reports
            </span>{" "}
            in{" "}
            <a
              href={M365_REPORTS_SETTINGS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-amber-950 underline decoration-amber-400/80 underline-offset-2 hover:text-amber-900"
            >
              M365 Admin → Settings → Org settings → Reports
            </a>
            , then rescan.
          </p>
        </div>
      </div>
    </div>
  );
}
