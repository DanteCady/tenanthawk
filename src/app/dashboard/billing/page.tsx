import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getSession } from "@/lib/session";
import { getPlan } from "@/lib/entitlements";
import { UpgradeButton } from "@/components/app/UpgradeButton";
import { ManageBillingButton } from "@/components/app/ManageBillingButton";
import { DevPlanToggle } from "@/components/app/DevPlanToggle";

const PRO_FEATURES = [
  "Full findings with severity & dollar impact",
  "AI-guided remediation with Microsoft doc links",
  "Daily scans + drift & expiry alerts",
  "Slack / Teams / Discord webhook alerts",
  "Export reports",
  "All four scan categories",
];

export default async function BillingPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const plan = await getPlan(session.user.id);
  const devMode =
    process.env.NODE_ENV !== "production" && !process.env.STRIPE_SECRET_KEY;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className={`p-8 ${plan === "free" ? "surface-highlight" : "surface-card"}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Billing</h1>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              plan === "pro"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {plan === "pro" ? "Pro" : "Free"}
          </span>
        </div>

        {plan === "pro" ? (
          <div className="mt-6">
            <p className="text-slate-700">
              You&apos;re on <span className="font-semibold text-blue-700">Pro</span> —
              full findings, remediation, and daily monitoring are unlocked.
            </p>
            <div className="mt-5">
              <ManageBillingButton />
            </div>
          </div>
        ) : (
          <div className="mt-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold text-slate-900">$49</span>
              <span className="text-slate-600">/tenant / mo</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <UpgradeButton className="btn-primary w-full shadow-none hover:shadow-md">
                Upgrade to Pro
              </UpgradeButton>
            </div>
          </div>
        )}
      </div>

      {devMode && <DevPlanToggle plan={plan} />}
    </div>
  );
}
