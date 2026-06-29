import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { ProUpgradeOptions } from "@/components/app/UpgradeButton";
import { ManageBillingButton } from "@/components/app/ManageBillingButton";
import { DevPlanToggle } from "@/components/app/DevPlanToggle";
import { PlanBadge } from "@/components/app/PlanBadge";
import {
  isAnnualBillingConfigured,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { formatUsd } from "@/lib/format";

const PRO_FEATURES = [
  "Full findings with severity & dollar impact",
  "AI-guided remediation with Microsoft doc links",
  "Category score trends & compliance mapping (CIS / NIST)",
  "Shareable read-only report links for leadership",
  "Daily scans + drift & expiry alerts",
  "Slack / Teams / Discord webhook alerts",
  "Export reports",
  "All four scan categories",
];

const ENTERPRISE_FEATURES = [
  "Multi-tenant portfolio roll-up",
  "Clients console with switch & rescan",
  "Per-client scorecards for QBRs",
  "Volume pricing for MSPs & consultants",
] as const;

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { upgrade } = await searchParams;
  const plan = await getPlan(session.user.id);
  const showEnterprisePitch = upgrade === "enterprise" || plan === "pro";
  const annualAvailable = isAnnualBillingConfigured();
  const devMode =
    process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Pro is billed per connected tenant. Cancel anytime from the customer portal.
        </p>
      </div>

      <div className={`p-8 ${plan === "free" ? "surface-highlight" : "surface-card"}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your plan</h2>
          <PlanBadge plan={plan} />
        </div>

        {plan === "msp" ? (
          <div className="mt-6">
            <p className="text-slate-700">
              You&apos;re on <span className="font-semibold text-violet-700">Enterprise</span> —
              multi-tenant console, Pro features, and portfolio roll-ups are unlocked.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Contact support for seat changes or billing questions.
            </p>
          </div>
        ) : plan === "pro" ? (
          <div className="mt-6">
            <p className="text-slate-700">
              You&apos;re on <span className="font-semibold text-blue-700">Pro</span> —
              full findings, remediation, and daily monitoring are unlocked.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Switch between monthly and annual, update payment method, or cancel in the
              portal.
            </p>
            <div className="mt-5">
              <ManageBillingButton />
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  {f}
                </li>
              ))}
            </ul>
            <ProUpgradeOptions annualAvailable={annualAvailable} />
            {!annualAvailable && (
              <p className="text-xs text-slate-500">
                Annual billing (${formatUsd(PRO_ANNUAL_USD)}/yr) appears once{" "}
                <code className="rounded bg-slate-100 px-1">STRIPE_PRICE_PRO_ANNUAL</code>{" "}
                is configured — see SETUP.md.
              </p>
            )}
          </div>
        )}
      </div>

      {plan === "free" && (
        <p className="text-center text-xs text-slate-500">
          ${PRO_MONTHLY_USD}/mo or ${formatUsd(PRO_ANNUAL_USD)}/yr per tenant · prices in USD
        </p>
      )}

      {devMode && <DevPlanToggle plan={plan} />}

      {showEnterprisePitch && plan !== "msp" ? (
        <div className="surface-card space-y-4 p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Enterprise</h2>
            <span className="badge-enterprise">MSP / multi-tenant</span>
          </div>
          <p className="text-sm text-slate-600">
            Manage every client tenant from one console — portfolio health, scorecards, and
            switching without re-onboarding.
          </p>
          <ul className="space-y-2">
            {ENTERPRISE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="text-sm text-slate-600">
            Enterprise billing is rolling out soon. Email{" "}
            <a
              href="mailto:support@tenanthawk.io?subject=Enterprise%20console"
              className="font-medium text-violet-700 hover:text-violet-800"
            >
              support@tenanthawk.io
            </a>{" "}
            for design-partner access.
          </p>
        </div>
      ) : null}
    </div>
  );
}
