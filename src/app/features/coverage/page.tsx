import Link from "next/link";
import { CheckCircle2, MinusCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { FeatureCta } from "@/components/features/shared";
import { SCAN_CHECK_COUNT } from "@/lib/scan/catalog";
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
    <div className="marketing-page min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-1">
        <section className="bg-white pb-16 pt-28 sm:pt-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-purple-600">
                Scan coverage
              </p>
              <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                {SCAN_CHECK_COUNT} checks across your Microsoft 365 tenant
              </h1>
              <p className="mt-5 text-lg text-slate-600">
                Tenant Hawk scans the Entra organization and M365 workloads MSPs actually
                review with clients — security, cost, reliability, and hygiene — not Azure ARM
                resources or ops consoles.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-10">
              {sectors.map((sector) => {
                const sectorChecks = bySector.get(sector) ?? [];
                return (
                  <Reveal key={sector}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h2 className="text-xl font-semibold text-slate-900">
                          {SECTOR_LABELS[sector]}
                        </h2>
                        <span className="text-sm text-slate-500">
                          {sectorChecks.length} check{sectorChecks.length === 1 ? "" : "s"}
                        </span>
                      </div>
                      <ul className="mt-5 divide-y divide-slate-100">
                        {sectorChecks.map((check) => (
                          <li
                            key={check.id}
                            className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <CheckCircle2
                                className="mt-0.5 h-4 w-4 shrink-0 text-green-600"
                                aria-hidden
                              />
                              <div>
                                <p className="font-medium text-slate-900">{check.marketingLabel}</p>
                                <p className="text-xs text-slate-500">{check.id}</p>
                              </div>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
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

        <section className="border-t border-slate-100 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal>
              <h2 className="text-2xl font-semibold text-slate-900">Explicitly not included</h2>
              <p className="mt-3 text-slate-600">
                We scope Tenant Hawk to client-ready M365 tenant reviews. These areas are backlog or
                out of product scope:
              </p>
              <ul className="mt-6 space-y-3">
                {OUT_OF_SCOPE.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-slate-700">
                    <MinusCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-slate-500">
                Need a specific workload?{" "}
                <Link href="/features" className="font-medium text-purple-700 hover:underline">
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
