import type { Severity } from "@/db/types";

const STYLES: Record<Severity, string> = {
  high: "bg-bad/15 text-bad",
  medium: "bg-warn/15 text-warn",
  low: "bg-[var(--th-muted-bg)] text-[var(--th-text-muted)] ring-1 ring-[var(--th-border)]",
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
