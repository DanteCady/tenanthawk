import { KeyRound, ShieldAlert, Sparkles, Wallet } from "lucide-react";
import { Reveal } from "./Reveal";

const categories = [
  {
    icon: ShieldAlert,
    title: "Security",
    blurb: "Catch the gaps before an auditor or an attacker does.",
    accent: "text-red-600",
    chip: "bg-red-50 text-red-600",
    dot: "bg-red-500",
    ring: "hover:border-red-200",
    checks: [
      "Conditional Access drift & risky exclusions",
      "MFA gaps and legacy auth still enabled",
      "Over-privileged apps & stale admin roles",
      "Guest accounts that should be gone",
    ],
  },
  {
    icon: Wallet,
    title: "Cost",
    blurb: "Stop paying for licenses nobody uses.",
    accent: "text-green-600",
    chip: "bg-green-50 text-green-600",
    dot: "bg-green-500",
    ring: "hover:border-green-200",
    checks: [
      "Licenses on disabled or never-active users",
      "Oversized SKUs (E5 where E3 would do)",
      "Duplicate & overlapping license plans",
      "Monthly reclaimable-spend report",
    ],
  },
  {
    icon: KeyRound,
    title: "Reliability",
    blurb: "Never get blindsided by a silent expiry again.",
    accent: "text-blue-600",
    chip: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
    ring: "hover:border-blue-200",
    checks: [
      "App registration secrets & certs expiring",
      "Expiring domains and DNS issues",
      "Mailboxes approaching storage limits",
      "Service health & integration alerts",
    ],
  },
  {
    icon: Sparkles,
    title: "Hygiene",
    blurb: "Keep the tenant tidy as it grows.",
    accent: "text-yellow-600",
    chip: "bg-yellow-50 text-yellow-600",
    dot: "bg-yellow-500",
    ring: "hover:border-yellow-200",
    checks: [
      "Empty & orphaned groups and teams",
      "Inactive users and stale accounts",
      "Unmanaged or duplicate devices",
      "Misconfigured sharing & defaults",
    ],
  },
];

export function Categories() {
  return (
    <section id="categories" className="scroll-mt-24 bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            What Tenant Hawk scans
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Four kinds of tenant debt, one place to clear it
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every check rolls up into your health score with a clear severity, a
            dollar impact where it matters, and the exact steps to fix it.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {categories.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 0.08}>
              <div
                className={`group h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-all hover:shadow-lg hover:shadow-slate-200/60 ${c.ring}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${c.chip}`}>
                    <c.icon className="h-5 w-5" strokeWidth={1.9} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
                    <p className="text-sm text-slate-500">{c.blurb}</p>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {c.checks.map((check) => (
                    <li key={check} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${c.dot}`} />
                      {check}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
