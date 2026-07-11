import Link from "next/link";
import { Reveal } from "./Reveal";
import { SCAN_CHECK_COUNT } from "@/lib/scan/catalog";

const categories = [
  {
    n: "01",
    name: "Security",
    tagline: "Catch the gaps before an auditor — or an attacker — does.",
    items: [
      "Conditional Access gaps, including policies stuck in report-only",
      "MFA registration gaps and legacy auth still enabled",
      "Standing privileged access that should be eligible-only",
      "Over-permissioned enterprise apps & guest sprawl",
    ],
  },
  {
    n: "02",
    name: "Cost",
    tagline: "Stop paying for licenses nobody uses.",
    items: [
      "Licenses still on disabled accounts, with the $/month figure",
      "Paid seats sitting unassigned or on inactive users",
      "Copilot licenses nobody is actually using",
      "Subscriptions lapsing or stuck in grace period",
    ],
  },
  {
    n: "03",
    name: "Reliability",
    tagline: "Never get blindsided by a silent expiry again.",
    items: [
      "App registration secrets & certs about to expire",
      "Enterprise app credentials on the same countdown",
      "Intune devices that quietly stopped syncing",
      "Entra devices with stale sign-ins",
    ],
  },
  {
    n: "04",
    name: "Hygiene",
    tagline: "Keep the tenant tidy as it grows.",
    items: [
      "Inactive users — non-interactive sign-ins considered too",
      "Empty and ownerless groups, teams, and channels",
      "External mailbox forwarding and stale auto-replies",
      "Stale SharePoint sites and org-wide sharing posture",
    ],
  },
];

export function Categories() {
  return (
    <section id="scans" className="scroll-mt-16 border-t border-mk-line">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-26">
        <Reveal className="mb-16 max-w-[640px]">
          <p className="mk-eyebrow mb-5">What Tenant Hawk scans</p>
          <h2 className="mb-[18px] text-balance text-3xl font-[640] leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
            Four kinds of tenant debt, one place to clear it.
          </h2>
          <p className="text-pretty text-[16.5px] leading-[1.6] text-mk-soft">
            Every check rolls into your health score with a clear severity, a dollar
            impact where it matters, and the exact steps to fix it.
          </p>
        </Reveal>

        <div className="grid border-l border-t border-mk-line sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.06} className="h-full">
              <div className="h-full border-b border-r border-mk-line bg-white px-[26px] pb-9 pt-8">
                <div className="mb-[22px] font-mkmono text-[11.5px] text-mk-faint">{c.n}</div>
                <div className="mb-2 text-xl font-[640] tracking-[-0.015em]">{c.name}</div>
                <div className="mb-6 min-h-[44px] text-sm leading-[1.55] text-mk-muted">
                  {c.tagline}
                </div>
                <div className="flex flex-col gap-2.5">
                  {c.items.map((it) => (
                    <div key={it} className="flex gap-2.5 text-[13.5px] leading-[1.45] text-mk-ink2">
                      <span className="font-semibold text-mk-amber">—</span>
                      <span>{it}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15} className="mt-10">
          <Link
            href="/features/coverage"
            className="border-b-[1.5px] border-mk-amber pb-0.5 text-[15.5px] font-[550] text-mk-ink transition-colors hover:text-[#b36a00]"
          >
            See all {SCAN_CHECK_COUNT} checks, the Graph data each one reads, and where to
            be skeptical →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
