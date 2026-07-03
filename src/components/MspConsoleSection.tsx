import {
  AlertTriangle,
  ArrowRight,
  Building2,
  KeyRound,
  LayoutDashboard,
  PieChart,
  ShieldCheck,
} from "lucide-react";
import { Reveal } from "./Reveal";
import { ENTERPRISE_CLIENT_CAP_DEFAULT } from "@/lib/billing/pricing";

const features = [
  {
    icon: LayoutDashboard,
    title: "Portfolio roll-up",
    body: "Average health score, open high findings, and recoverable spend across every client. One glance before your next client check-in.",
    chip: "bg-blue-50 text-blue-600",
  },
  {
    icon: Building2,
    title: "Client list & switching",
    body: "Connect each tenant read only, jump between clients in one click, and rescan any portfolio tenant from the console.",
    chip: "bg-green-50 text-green-600",
  },
  {
    icon: KeyRound,
    title: "Branded subdomain + SSO",
    body: "Your team signs in at acme.tenanthawk.io with your IdP - Okta, Entra, or SAML.",
    chip: "bg-violet-50 text-violet-600",
  },
  {
    icon: PieChart,
    title: "Per-client scorecards",
    body: "Shareable scorecards with category grades and trends. Built for client updates, onboarding reviews, and exec summaries.",
    chip: "bg-amber-50 text-amber-600",
  },
  {
    icon: AlertTriangle,
    title: "Needs attention queue",
    body: "See which clients have stale scans, open high findings, or connection issues before your next check in. The portfolio surfaces who needs work first.",
    chip: "bg-red-50 text-red-400",
  },
  {
    icon: ShieldCheck,
    title: "Full platform on every client",
    body: "Every client tenant gets the full Pro scan: findings with dollar impact, remediation steps, daily scans, exports, and alerts. Same depth on client ten as client one.",
    chip: "bg-teal-50 text-teal-400",
  },
] as const;

export function MspConsoleSection() {
  return (
    <section id="msp" className="scroll-mt-24 border-y border-slate-200 bg-slate-900 py-24 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">
            For consultants &amp; MSPs
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight sm:text-5xl">
            Every client tenant. One clear view.
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            Pro covers one tenant for in house teams. Consultants and MSPs use{" "}
            <span className="font-semibold text-white">Enterprise</span> to manage
            up to {ENTERPRISE_CLIENT_CAP_DEFAULT} client tenants from one console.
          </p>
        </Reveal>

        <Reveal className="mt-12" delay={0.06}>
          <div className="overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-800/60 shadow-2xl ring-1 ring-white/10">
            <div className="border-b border-slate-700/80 px-5 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Client portfolio
              </p>
            </div>
            <div className="grid gap-px bg-slate-700/50 sm:grid-cols-4">
              {[
                { label: "Avg. score", value: "74", accent: true },
                { label: "Clients", value: "8" },
                { label: "Open high", value: "23" },
                { label: "Recoverable / mo", value: "$1,840" },
              ].map((stat) => (
                <div key={stat.label} className="bg-slate-800/90 px-5 py-4">
                  <p className="text-xs text-slate-400">{stat.label}</p>
                  <p
                    className={`mt-1 text-2xl font-bold ${
                      stat.accent ? "text-blue-300" : "text-white"
                    }`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="divide-y divide-slate-700/80">
              {[
                { name: "Northwind Traders", score: 81, grade: "B", high: 2 },
                { name: "Fabrikam", score: 68, grade: "D", high: 7 },
                { name: "Contoso", score: 76, grade: "C", high: 4 },
              ].map((client) => (
                <div
                  key={client.name}
                  className="flex flex-wrap items-center justify-between gap-3 bg-slate-800/40 px-5 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700 text-xs font-bold text-slate-200">
                      {client.name.slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-white">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.high} open high</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-200">{client.score}</span>
                    <span className="rounded-md bg-slate-700 px-2 py-0.5 text-xs font-bold text-slate-200">
                      {client.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={0.08 + i * 0.06}>
              <div className="h-full rounded-2xl border border-slate-700/80 bg-slate-800/40 p-6">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${f.chip}`}
                >
                  <f.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12 text-center" delay={0.2}>
          <a
            href="#pricing"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
          >
            See Enterprise pricing
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <p className="mt-3 text-sm text-slate-400">
            Start free on one tenant, then upgrade when you&apos;re ready to add clients.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
