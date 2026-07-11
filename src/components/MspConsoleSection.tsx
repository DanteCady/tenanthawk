import { Reveal } from "./Reveal";
import { ENTERPRISE_CLIENT_CAP_DEFAULT } from "@/lib/billing/pricing";

const features = [
  {
    title: "Portfolio roll-up",
    desc: "average score, open highs, and recoverable spend across every client at a glance.",
  },
  {
    title: "Needs-attention queue",
    desc: "stale scans, open highs, and connection issues surface before your next check-in.",
  },
  {
    title: "Per-client scorecards",
    desc: "shareable grades and trends, built for client updates and exec summaries.",
  },
  {
    title: "Branded subdomain + SSO",
    desc: "your team signs in at acme.tenanthawk.io with Okta, Entra, or SAML.",
  },
];

const portfolioStats = [
  { label: "Avg. score", value: "74" },
  { label: "Open high", value: "23" },
  { label: "Recoverable / mo", value: "$1,840" },
];

const clients = [
  { initial: "N", avatarBg: "#2a3547", avatarFg: "#b9c2d4", name: "Northwind Traders", meta: "Scanned 2h ago", high: "2 high", highColor: "#d98e5f", score: "81", grade: "B", gradeColor: "#5fb98a" },
  { initial: "F", avatarBg: "#3b2f47", avatarFg: "#c7b9d4", name: "Fabrikam", meta: "Scanned 5h ago", high: "7 high", highColor: "#e06c4c", score: "68", grade: "D", gradeColor: "#e06c4c" },
  { initial: "C", avatarBg: "#2f4740", avatarFg: "#b9d4c7", name: "Contoso", meta: "Scanned 1d ago", high: "4 high", highColor: "#d98e5f", score: "76", grade: "C", gradeColor: "#d9a33c" },
  { initial: "W", avatarBg: "#47402f", avatarFg: "#d4cbb9", name: "Wingtip Toys", meta: "Scan stale · 9d", high: "—", highColor: "#6e7686", score: "72", grade: "C", gradeColor: "#d9a33c" },
];

export function MspConsoleSection() {
  return (
    <section id="msp" className="scroll-mt-16 bg-mk-night">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <Reveal>
            <p className="mk-eyebrow mb-5 !text-mk-amber-bright">For consultants &amp; MSPs</p>
            <h2 className="mb-5 text-balance text-3xl font-[640] leading-[1.12] tracking-[-0.03em] text-mk-night-text sm:text-[40px]">
              Every client tenant. One clear view.
            </h2>
            <p className="mb-9 text-pretty text-[16.5px] leading-[1.6] text-mk-night-soft">
              Manage up to {ENTERPRISE_CLIENT_CAP_DEFAULT} client tenants from one console.
              Every client gets the full scan — findings with dollar impact, daily rescans,
              drift alerts, and shareable scorecards for your next check-in.
            </p>
            <div className="mb-10 flex flex-col gap-4">
              {features.map((mf) => (
                <div key={mf.title} className="flex gap-3.5">
                  <span className="pt-px font-semibold text-mk-amber-bright">—</span>
                  <div>
                    <span className="text-[15px] font-semibold text-mk-cream">{mf.title}</span>
                    <span className="text-[15px] text-mk-night-soft"> — {mf.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-[10px] bg-mk-night-text px-6 py-3 text-[15.5px] font-[550] text-mk-ink transition-colors hover:bg-white"
            >
              See Enterprise pricing <span aria-hidden>→</span>
            </a>
          </Reveal>

          {/* portfolio console mock */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[14px] border border-mk-night-line2 bg-mk-night-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-mk-night-line px-5 py-4">
                <span className="text-sm font-semibold text-mk-cream">Client portfolio</span>
                <span className="font-mkmono text-[11px] text-mk-night-muted">
                  8 tenants connected
                </span>
              </div>
              <div className="grid grid-cols-3 border-b border-mk-night-line">
                {portfolioStats.map((ps) => (
                  <div key={ps.label} className="border-r border-mk-night-line px-5 py-[18px] last:border-r-0">
                    <div className="text-[11.5px] text-mk-night-muted">{ps.label}</div>
                    <div className="mt-1.5 text-[22px] font-[650] tracking-[-0.02em] text-mk-night-text">
                      {ps.value}
                    </div>
                  </div>
                ))}
              </div>
              {clients.map((cl) => (
                <div
                  key={cl.name}
                  className="grid grid-cols-[34px_1fr_100px_60px] items-center gap-3.5 border-b border-mk-night-row px-5 py-[13px] last:border-b-0"
                >
                  <span
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[13px] font-[650]"
                    style={{ background: cl.avatarBg, color: cl.avatarFg }}
                  >
                    {cl.initial}
                  </span>
                  <div>
                    <div className="text-[13.5px] font-[550] text-mk-cream">{cl.name}</div>
                    <div className="mt-px text-[11.5px] text-mk-night-muted">{cl.meta}</div>
                  </div>
                  <span
                    className="text-right font-mkmono text-[11px]"
                    style={{ color: cl.highColor }}
                  >
                    {cl.high}
                  </span>
                  <span className="text-right text-[13px] font-[650] text-mk-night-text">
                    {cl.score}{" "}
                    <span
                      className="font-mkmono text-[10.5px] font-medium"
                      style={{ color: cl.gradeColor }}
                    >
                      {cl.grade}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
