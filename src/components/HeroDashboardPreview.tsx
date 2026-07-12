import { HawkMark } from "@/components/Logo";

const SIDE_NAV = [
  { icon: "≡", label: "Findings" },
  { icon: "↝", label: "Roadmap" },
  { icon: "◈", label: "Compliance" },
  { icon: "▤", label: "Reports" },
  { icon: "⚙", label: "Settings" },
  { icon: "▭", label: "Billing" },
] as const;

const DASH_STATS = [
  { label: "Open issues", value: "12", delta: "−3 since last scan", deltaClass: "text-mk-green" },
  { label: "High severity", value: "5", delta: "2 new this week", deltaClass: "text-[#b3541e]" },
  { label: "Recoverable / mo", value: "$2,380", delta: "14 unused licenses", deltaClass: "text-mk-muted" },
] as const;

const FINDINGS = [
  { sev: "High", sevClass: "text-mk-rust bg-mk-rust-wash", title: "App registration secret expires in 6 days", cat: "Reliability", impact: "Outage risk" },
  { sev: "High", sevClass: "text-mk-rust bg-mk-rust-wash", title: "Legacy authentication still enabled for 3 protocols", cat: "Security", impact: "—" },
  { sev: "Medium", sevClass: "text-mk-amber-deep bg-mk-amber-wash", title: "12 E5 licenses assigned to disabled accounts", cat: "Cost", impact: "$684/mo" },
  { sev: "Medium", sevClass: "text-mk-amber-deep bg-mk-amber-wash", title: "Conditional Access policy changed — 2 exclusions added", cat: "Security", impact: "—" },
  { sev: "Low", sevClass: "text-mk-soft bg-mk-tint", title: "9 empty groups with no owner", cat: "Hygiene", impact: "—" },
] as const;

export function HeroDashboardPreview() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-mk-line2 bg-white shadow-[0_1px_2px_rgba(18,22,31,0.04),0_24px_60px_-24px_rgba(18,22,31,0.14)]">
      {/* browser chrome */}
      <div className="flex items-center gap-4 border-b border-mk-tint bg-mk-panel px-[18px] py-3">
        <div className="flex gap-[7px]">
          <span className="h-[11px] w-[11px] rounded-full bg-[#e3dfd7]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#e3dfd7]" />
          <span className="h-[11px] w-[11px] rounded-full bg-[#e3dfd7]" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="rounded-md bg-mk-tint px-10 py-[5px] font-mkmono text-xs text-mk-muted">
            tenanthawk.io/dashboard
          </div>
        </div>
        <div className="w-10" />
      </div>

      {/* app */}
      <div className="grid min-h-[520px] sm:grid-cols-[208px_1fr]">
        {/* sidebar */}
        <div className="hidden flex-col gap-0.5 border-r border-mk-line3 bg-mk-panel px-3 py-5 sm:flex">
          <div className="flex items-center gap-2 px-2.5 pb-[18px] pt-1.5">
            <HawkMark className="h-5 w-5" />
            <span className="text-[13.5px] font-[650]">Tenant Hawk</span>
          </div>
          <div className="flex items-center gap-2 rounded-[7px] bg-[#efebe1] px-2.5 py-2 text-[13px] font-[550] text-mk-ink">
            <span className="w-3.5 text-center">▦</span> Overview
          </div>
          {SIDE_NAV.map((nav) => (
            <div
              key={nav.label}
              className="flex items-center gap-2 rounded-[7px] px-2.5 py-2 text-[13px] font-medium text-mk-muted"
            >
              <span className="w-3.5 text-center">{nav.icon}</span> {nav.label}
            </div>
          ))}
        </div>

        {/* main */}
        <div className="bg-white p-4 sm:px-[30px] sm:py-[26px]">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <div className="text-[19px] font-[650] tracking-[-0.01em]">Client overview</div>
              <div className="mt-0.5 text-[13px] text-mk-muted">
                Contoso (demo) · last scan 1d ago · next scan in 11h 47m
              </div>
            </div>
            <div className="hidden gap-2 sm:flex">
              <span className="rounded-[7px] border border-mk-line2 px-3 py-1.5 text-[12.5px] font-medium text-mk-soft">
                Export
              </span>
              <span className="rounded-[7px] bg-mk-ink px-3 py-1.5 text-[12.5px] font-[550] text-white">
                Re-scan
              </span>
            </div>
          </div>

          {/* stat row */}
          <div className="mb-4 grid gap-3 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
            <div className="flex items-center gap-4 rounded-[10px] border border-mk-line3 p-4">
              <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden>
                <circle cx="36" cy="36" r="30" fill="none" stroke="#efede7" strokeWidth="7" />
                <circle
                  cx="36"
                  cy="36"
                  r="30"
                  fill="none"
                  stroke="#c98a12"
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray="98 190"
                  transform="rotate(-90 36 36)"
                />
                <text
                  x="36"
                  y="42"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="650"
                  fill="#12161f"
                >
                  52
                </text>
              </svg>
              <div>
                <div className="text-[13px] font-semibold">Health score</div>
                <div className="mt-0.5 text-xs text-mk-muted">Overall grade</div>
                <div className="mt-1.5 inline-block rounded-[5px] bg-mk-rust-wash px-2 py-0.5 font-mkmono text-[11px] font-medium text-mk-rust">
                  D
                </div>
              </div>
            </div>
            {DASH_STATS.map((st) => (
              <div key={st.label} className="rounded-[10px] border border-mk-line3 p-4">
                <div className="text-xs text-mk-muted">{st.label}</div>
                <div className="mt-2 text-[26px] font-[650] tracking-[-0.02em]">{st.value}</div>
                <div className={`mt-1 text-[11.5px] ${st.deltaClass}`}>{st.delta}</div>
              </div>
            ))}
          </div>

          {/* findings table */}
          <div className="overflow-hidden rounded-[10px] border border-mk-line3">
            <div className="flex items-center justify-between border-b border-mk-tint px-4 py-3">
              <span className="text-[13px] font-semibold">Top findings</span>
              <span className="text-xs text-mk-muted">Ranked by risk × dollar impact</span>
            </div>
            {FINDINGS.map((f) => (
              <div
                key={f.title}
                className="grid grid-cols-[84px_1fr] items-center gap-3.5 border-b border-[#f5f3ee] px-4 py-[11px] text-[13px] last:border-b-0 sm:grid-cols-[84px_1fr_110px_90px]"
              >
                <span
                  className={`rounded-[5px] py-[3px] text-center font-mkmono text-[10.5px] font-medium uppercase tracking-[0.04em] ${f.sevClass}`}
                >
                  {f.sev}
                </span>
                <span className="text-mk-ink2">{f.title}</span>
                <span className="hidden text-xs text-mk-muted sm:block">{f.cat}</span>
                <span className="hidden text-right text-[12.5px] font-semibold text-mk-ink sm:block">
                  {f.impact}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
