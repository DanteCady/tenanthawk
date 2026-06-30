import { AlertTriangle, Clock, DollarSign, ListChecks } from "lucide-react";
import { formatUsd } from "@/lib/format";

export function OutcomeHighlights({
  monthlyRecoverable,
  urgentExpiryCount = 0,
  highSeverity = 0,
  totalIssues = 0,
  compact = false,
}: {
  monthlyRecoverable: number;
  urgentExpiryCount?: number;
  highSeverity?: number;
  totalIssues?: number;
  compact?: boolean;
}) {
  const annualRecoverable = monthlyRecoverable * 12;

  const cards = [
    {
      key: "recoverable",
      icon: DollarSign,
      tone: "text-emerald-700 bg-emerald-50",
      label: "Recoverable spend",
      value:
        annualRecoverable > 0
          ? `$${formatUsd(annualRecoverable)}/yr`
          : monthlyRecoverable > 0
            ? `$${formatUsd(monthlyRecoverable)}/mo`
            : "$0",
      detail:
        annualRecoverable > 0
          ? `~$${formatUsd(monthlyRecoverable)}/mo from licenses and waste`
          : "No dollar impact flagged yet",
    },
    ...(urgentExpiryCount > 0
      ? [
          {
            key: "urgent",
            icon: Clock,
            tone: "text-amber-800 bg-amber-50",
            label: "Expiring soon",
            value: urgentExpiryCount.toString(),
            detail: "Secrets or subscriptions within 30 days",
          },
        ]
      : []),
    ...(highSeverity > 0
      ? [
          {
            key: "high",
            icon: AlertTriangle,
            tone: "text-red-700 bg-red-50",
            label: "High severity",
            value: highSeverity.toString(),
            detail: "Fix these before your next audit",
          },
        ]
      : []),
    {
      key: "issues",
      icon: ListChecks,
      tone: "text-blue-700 bg-blue-50",
      label: "Open issues",
      value: totalIssues.toString(),
      detail: "Prioritized in your fix-it list",
    },
  ];

  return (
    <div
      className={`grid gap-2.5 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-4"}`}
    >
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <span
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.tone}`}
            >
              <card.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-slate-500">
                {card.label}
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums leading-none text-slate-900">
                {card.value}
              </p>
              <p className="mt-1 text-xs leading-snug text-slate-500">{card.detail}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
