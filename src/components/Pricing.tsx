"use client";

import { useState } from "react";
import { Reveal } from "./Reveal";
import {
  E5_LICENSE_MONTHLY_USD_LIST,
  ENTERPRISE_ANNUAL_MONTHLY_EQUIV,
  ENTERPRISE_ANNUAL_SAVINGS_PERCENT,
  ENTERPRISE_ANNUAL_SAVINGS_USD,
  ENTERPRISE_ANNUAL_USD,
  ENTERPRISE_CLIENT_CAP_DEFAULT,
  ENTERPRISE_MONTHLY_USD,
  PRO_ANNUAL_MONTHLY_EQUIV,
  PRO_ANNUAL_SAVINGS_PERCENT,
  PRO_ANNUAL_SAVINGS_USD,
  PRO_ANNUAL_USD,
  PRO_MONTHLY_USD,
} from "@/lib/billing/pricing";
import { formatUsd } from "@/lib/format";

type Interval = "monthly" | "annual";

const FREE_FEATURES = [
  "14 days of full access — every check, dollar figures included",
  "1 tenant",
  "After the trial: weekly reliability scan (expiring secrets & certs)",
  "Health score & email alerts, forever",
];

const PRO_FEATURES = [
  "All four scan categories",
  "Config Journal — every change with who/what/when diffs",
  "Daily scans + drift alerts",
  "Cost-savings reporting",
  "Category trends & CIS / NIST mapping",
  "Shareable executive report links",
  "AI fix-it guides & exports",
];

const ENT_FEATURES = [
  "Full platform on every client tenant",
  `Up to ${ENTERPRISE_CLIENT_CAP_DEFAULT} client tenants (Starter)`,
  "Multi-tenant console & roll-ups",
  "Branded subdomain + SSO",
  "Per-client scorecards",
  "Priority support",
];

function FeatureList({ features }: { features: string[] }) {
  return (
    <div className="mb-8 flex flex-1 flex-col gap-3">
      {features.map((ft) => (
        <div key={ft} className="flex gap-2.5 text-sm leading-normal text-mk-ink2">
          <span className="font-semibold text-mk-green">✓</span> {ft}
        </div>
      ))}
    </div>
  );
}

export function Pricing({ showHeader = true }: { showHeader?: boolean }) {
  const [interval, setInterval] = useState<Interval>("monthly");
  const annual = interval === "annual";

  const proPrice = annual ? `$${PRO_ANNUAL_MONTHLY_EQUIV}` : `$${PRO_MONTHLY_USD}`;
  const proNote = annual
    ? `Billed annually — $${formatUsd(PRO_ANNUAL_USD)}/yr · save $${formatUsd(PRO_ANNUAL_SAVINGS_USD)}`
    : "Per internal tenant, billed monthly";
  const entPrice = annual ? `$${ENTERPRISE_ANNUAL_MONTHLY_EQUIV}` : `$${ENTERPRISE_MONTHLY_USD}`;
  const entNote = annual
    ? `Billed annually — $${formatUsd(ENTERPRISE_ANNUAL_USD)}/yr · save $${formatUsd(ENTERPRISE_ANNUAL_SAVINGS_USD)}`
    : "Flat rate, billed monthly";

  const toggleClass = (active: boolean) =>
    `rounded-lg border-0 px-5 py-2 text-sm font-[550] transition-all ${
      active ? "bg-white text-mk-ink shadow-[0_1px_3px_rgba(18,22,31,0.12)]" : "bg-transparent text-mk-muted"
    }`;

  return (
    <section
      id="pricing"
      className={`scroll-mt-16 ${showHeader ? "border-t border-mk-line" : ""}`}
    >
      <div
        className={`mx-auto max-w-6xl px-6 pb-20 sm:px-8 sm:pb-26 ${
          showHeader ? "pt-20 sm:pt-26" : "pt-10"
        }`}
      >
        {showHeader ? (
          <Reveal className="mx-auto mb-6 max-w-[620px] text-center">
            <p className="mk-eyebrow mb-5">Pricing</p>
            <h2 className="mb-[18px] text-balance text-3xl font-[640] leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
              Think ROI, not subscription lines.
            </h2>
            <p className="text-pretty text-[16.5px] leading-[1.6] text-mk-soft">
              Every scan surfaces reclaimable spend. Recover one unused E5 license (~$
              {E5_LICENSE_MONTHLY_USD_LIST}/mo at list) and Pro has already paid for itself.
            </p>
          </Reveal>
        ) : null}

        <Reveal className="mb-2 flex justify-center">
          <div className="rounded-full border border-mk-amber-line bg-mk-amber-wash px-4 py-[7px] text-[13.5px] text-mk-amber-deep">
            Founding customers:{" "}
            <span className="font-mkmono font-medium">EARLYBIRD26</span> for 25% off Pro —
            first 20 customers
          </div>
        </Reveal>

        <Reveal className="my-6 mb-12 flex justify-center">
          <div
            className="inline-flex rounded-[10px] border border-mk-line2 bg-mk-tint p-[3px]"
            role="group"
            aria-label="Billing interval"
          >
            <button type="button" onClick={() => setInterval("monthly")} className={toggleClass(!annual)}>
              Monthly
            </button>
            <button type="button" onClick={() => setInterval("annual")} className={toggleClass(annual)}>
              Annual <span className="text-[12.5px] text-mk-green">−{PRO_ANNUAL_SAVINGS_PERCENT}%</span>
            </button>
          </div>
        </Reveal>

        <div className="grid items-stretch gap-5 lg:grid-cols-3">
          {/* Free */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col rounded-[14px] border border-mk-line2 bg-white px-[30px] py-[34px]">
              <div className="mb-1.5 text-[17px] font-[650]">Free</div>
              <div className="mb-6 min-h-[42px] text-sm text-mk-muted">
                Start with the full product for 14 days — no card. Keep a weekly
                score after.
              </div>
              <div className="mb-7">
                <span className="text-[40px] font-[650] tracking-[-0.03em]">$0</span>{" "}
                <span className="text-sm text-mk-muted">forever</span>
              </div>
              <FeatureList features={FREE_FEATURES} />
              <a href="/signup" className="mk-btn-ghost px-5 py-3 text-[15px]">
                Start free
              </a>
            </div>
          </Reveal>

          {/* Pro */}
          <Reveal delay={0.08} className="h-full">
            <div className="relative flex h-full flex-col rounded-[14px] border-[1.5px] border-mk-ink bg-white px-[30px] py-[34px] shadow-[0_20px_50px_-20px_rgba(18,22,31,0.18)]">
              <span className="absolute -top-[13px] left-[30px] rounded-full bg-mk-ink px-3.5 py-[5px] font-mkmono text-[11px] font-medium uppercase tracking-[0.06em] text-mk-night-text">
                Most popular
              </span>
              <div className="mb-1.5 text-[17px] font-[650]">Pro</div>
              <div className="mb-6 min-h-[42px] text-sm text-mk-muted">
                Full visibility for internal IT teams — cost recovery, drift alerts,
                executive-ready reports.
              </div>
              <div className="mb-7">
                <span className="text-[40px] font-[650] tracking-[-0.03em]">{proPrice}</span>{" "}
                <span className="text-sm text-mk-muted">/tenant/mo</span>
                <div className="mt-1 text-[12.5px] text-mk-muted">{proNote}</div>
              </div>
              <FeatureList features={PRO_FEATURES} />
              <a href="/signup" className="mk-btn px-5 py-[13px] text-[15px]">
                Start free scan
              </a>
            </div>
          </Reveal>

          {/* Enterprise */}
          <Reveal delay={0.16} className="h-full">
            <div className="flex h-full flex-col rounded-[14px] border border-mk-line2 bg-white px-[30px] py-[34px]">
              <div className="mb-1.5 flex items-center gap-2.5">
                <span className="text-[17px] font-[650]">Enterprise</span>
                <span className="rounded-[5px] bg-mk-amber-wash px-2 py-[3px] font-mkmono text-[10.5px] font-medium uppercase tracking-[0.05em] text-mk-amber-deep">
                  For MSPs
                </span>
              </div>
              <div className="mb-6 min-h-[42px] text-sm text-mk-muted">
                Flat-rate MSP platform — roll up savings across every client tenant.
              </div>
              <div className="mb-7">
                <span className="text-[40px] font-[650] tracking-[-0.03em]">{entPrice}</span>{" "}
                <span className="text-sm text-mk-muted">
                  /mo · {ENTERPRISE_CLIENT_CAP_DEFAULT} clients
                </span>
                <div className="mt-1 text-[12.5px] text-mk-muted">{entNote}</div>
              </div>
              <FeatureList features={ENT_FEATURES} />
              <a href="/signup?type=msp" className="mk-btn-ghost px-5 py-3 text-[15px]">
                Get started
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
