import Link from "next/link";
import { Building2, Check, Mail } from "lucide-react";

const FEATURES = [
  "Multi-tenant portfolio roll-up",
  "Clients list with switch & rescan",
  "Per-client scorecards for QBRs",
  "White-label ready exports (coming soon)",
] as const;

export function EnterpriseConsoleUpsell({
  title = "Enterprise multi-tenant console",
  description = "Manage every client tenant from one dashboard — portfolio health, scorecards, and switching without re-onboarding.",
  compact = false,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3"
          : "surface-card mx-auto max-w-2xl space-y-6 p-8"
      }
    >
      <div className={compact ? "flex flex-wrap items-start justify-between gap-3" : undefined}>
        <div className={compact ? "min-w-0 flex-1" : undefined}>
          {!compact ? (
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              <Building2 className="h-5 w-5" />
            </div>
          ) : null}
          <h1
            className={
              compact
                ? "text-sm font-semibold text-slate-900"
                : "text-2xl font-semibold tracking-tight text-slate-900"
            }
          >
            {title}
          </h1>
          <p
            className={
              compact ? "mt-1 text-xs text-slate-600" : "mt-2 text-sm text-slate-600"
            }
          >
            {description}
          </p>
        </div>
        <Link
          href="/dashboard/billing?upgrade=enterprise"
          className={
            compact
              ? "shrink-0 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-violet-800"
              : "btn-primary inline-flex items-center gap-2 shadow-none hover:shadow-md"
          }
        >
          {compact ? "Upgrade" : "View Enterprise options"}
        </Link>
      </div>

      {!compact ? (
        <>
          <ul className="space-y-2.5">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="flex items-center gap-2 font-medium text-slate-900">
              <Mail className="h-4 w-4 text-slate-500" />
              Design partner access
            </p>
            <p className="mt-1">
              Enterprise billing is rolling out soon. Contact{" "}
              <a
                href="mailto:support@tenanthawk.io?subject=Enterprise%20console"
                className="font-medium text-violet-700 hover:text-violet-800"
              >
                support@tenanthawk.io
              </a>{" "}
              for early access, or run{" "}
              <code className="rounded bg-white px-1 py-0.5 text-xs">pnpm seed:msp</code>{" "}
              locally.
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
