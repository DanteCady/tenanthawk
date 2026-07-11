import Link from "next/link";
import { CheckCircle2, MinusCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { FeatureCta } from "@/components/features/shared";
import {
  SCAN_CHECK_COUNT,
  scoreMethodologyDetail,
  scoreMethodologyLine,
} from "@/lib/scan/catalog";
import {
  offeredCheckDefinitions,
  SECTOR_LABELS,
  type ScanSector,
} from "@/lib/scan/checks/registry";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "M365 tenant scan coverage — every check Tenant Hawk runs",
  description:
    "See every automated Microsoft 365 tenant check Tenant Hawk runs across Identity, Teams, SharePoint, Exchange, Devices, Apps, and Copilot — with sector breakdown and what's explicitly out of scope.",
  path: "/features/coverage",
  keywords: [
    "microsoft 365 tenant health check",
    "m365 security assessment checklist",
    "office 365 tenant review",
    "microsoft 365 copilot license report",
    "m365 hygiene scan",
  ],
});

const SECTOR_ORDER: ScanSector[] = [
  "identity",
  "teams",
  "sharepoint",
  "exchange",
  "devices",
  "apps",
  "copilot",
  "cost",
];

const OUT_OF_SCOPE = [
  "Azure subscription resources (VMs, storage accounts, NSGs)",
  "Microsoft Defender for Endpoint deep posture",
  "Power Platform (Flows, environments, connectors)",
  "Purview / Copilot DLP label coverage",
  "Undocumented Microsoft admin-center internal APIs",
];

function tierLabel(tier: string, scoreImpact: string): string {
  if (scoreImpact === "informational") return "Informational";
  if (tier === "v2") return "Deep scan";
  return "Standard";
}

export default function CoveragePage() {
  const checks = offeredCheckDefinitions();
  const bySector = new Map<ScanSector, typeof checks>();

  for (const check of checks) {
    const list = bySector.get(check.sector) ?? [];
    list.push(check);
    bySector.set(check.sector, list);
  }

  const sectors = SECTOR_ORDER.filter((sector) => bySector.has(sector));

  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white pb-16 pt-28 sm:pt-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <p className="mk-eyebrow">
                Scan coverage
              </p>
              <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                {SCAN_CHECK_COUNT} checks across your Microsoft 365 tenant
              </h1>
              <p className="mt-5 text-lg text-mk-soft">
                Tenant Hawk scans the Entra organization and M365 workloads MSPs actually
                review with clients — security, cost, reliability, and hygiene — not Azure ARM
                resources or ops consoles.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-mk-line bg-mk-panel py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-10">
              {sectors.map((sector) => {
                const sectorChecks = bySector.get(sector) ?? [];
                return (
                  <Reveal key={sector}>
                    <div className="rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 className="text-xl font-semibold text-mk-ink">
                          {SECTOR_LABELS[sector]}
                        </h2>
                        <span className="text-sm text-mk-muted">
                          {sectorChecks.length} check{sectorChecks.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <ul className="mt-5 divide-y divide-mk-linesoft">
                        {sectorChecks.map((check) => (
                          <li
                            key={check.id}
                            className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <CheckCircle2
                                className="mt-0.5 h-4 w-4 shrink-0 text-mk-green"
                                aria-hidden
                              />
                              <div>
                                <p className="font-medium text-mk-ink">{check.marketingLabel}</p>
                                <p className="text-xs text-mk-muted">
                                  {check.id}
                                  <span className="text-mk-faint">
                                    {" · reads "}
                                    {check.permissions.join(", ")}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <span className="rounded-full bg-mk-tint px-2.5 py-0.5 text-xs font-medium text-mk-soft">
                              {tierLabel(check.tier, check.scoreImpact)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-mk-line py-16">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="text-2xl font-semibold text-mk-ink">
                How findings are scored — and where to be skeptical
              </h2>
              <p className="mt-3 text-mk-soft">
                {scoreMethodologyLine()}. {scoreMethodologyDetail()}
              </p>
              <p className="mt-4 text-mk-soft">
                Every check reads from a documented Graph source — the scope is listed next
                to each check above, and the{" "}
                <Link href="/security" className="font-medium text-mk-amber-deep hover:underline">
                  security page
                </Link>{" "}
                explains what each permission grants. A finding is a starting point for an
                operator, not a remediation order. Two examples of nuance we bake in rather
                than hide:
              </p>
              <ul className="mt-5 space-y-4 text-mk-soft">
                <li className="rounded-xl border border-mk-line bg-mk-panel p-4 text-sm leading-relaxed">
                  <span className="font-semibold text-mk-ink">Inactive users:</span>{" "}
                  mobile-only users can look dead on last interactive sign-in while Teams and
                  Outlook keep hitting non-interactive sign-ins in the background, so we
                  consider both. Even then, we do not recommend reclaiming a license on
                  inactivity alone — check leave status and get manager sign-off first, or
                  you will hear from someone on parental leave.
                </li>
                <li className="rounded-xl border border-mk-line bg-mk-panel p-4 text-sm leading-relaxed">
                  <span className="font-semibold text-mk-ink">
                    Licenses on disabled accounts:
                  </span>{" "}
                  flagged as its own pass rather than lumped into offboarding exports,
                  because the account disabled weeks ago with an E5 still attached is the
                  one that slips through ticket-driven processes. Some orgs park licenses on
                  disabled accounts intentionally during legal hold — verify before you
                  reclaim.
                </li>
              </ul>
              <p className="mt-5 text-sm text-mk-muted">
                Deep-scan checks (Teams and SharePoint activity) sample large tenants rather
                than exhaustively enumerating, and say so in the finding. Usage-report-based
                checks inherit Microsoft&apos;s own reporting lag of up to 48 hours.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-mk-line py-16">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="text-2xl font-semibold text-mk-ink">Explicitly not included</h2>
              <p className="mt-3 text-mk-soft">
                We scope Tenant Hawk to client-ready M365 tenant reviews. These areas are backlog or
                out of product scope:
              </p>
              <ul className="mt-6 space-y-3">
                {OUT_OF_SCOPE.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-mk-ink2">
                    <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-mk-faint" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-mk-muted">
                Need a specific workload?{" "}
                <Link href="/features" className="font-medium text-mk-amber-deep hover:underline">
                  Browse feature pages
                </Link>{" "}
                or start a scan to see what your tenant exposes today.
              </p>
            </Reveal>
          </div>
        </section>

        <FeatureCta
          title="See your tenant's coverage in minutes"
          lede="Connect read-only, run a scan, and get sector-filtered findings with dollar impact where it matters."
        />
      </main>
      <Footer />
    </div>
  );
}
