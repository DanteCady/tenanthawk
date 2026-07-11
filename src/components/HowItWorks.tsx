import { Reveal } from "./Reveal";
import { SCAN_CHECK_COUNT } from "@/lib/scan/catalog";

const gradeRows = [
  { cat: "Sec", pct: "58%", grade: "C", color: "#c98a12" },
  { cat: "Cost", pct: "42%", grade: "D", color: "#c2511f" },
  { cat: "Rel", pct: "85%", grade: "A", color: "#1f7a4d" },
  { cat: "Hyg", pct: "70%", grade: "B", color: "#1f7a4d" },
];

const fixList = [
  { done: true, label: "Rotate expiring app secret", tag: "done", tagClass: "text-mk-green" },
  { done: false, label: "Reclaim 12 unused licenses", tag: "$684/mo", tagClass: "text-mk-amber-deep" },
  { done: false, label: "Review CA policy change", tag: "high", tagClass: "text-mk-rust" },
];

function StepOneVisual() {
  return (
    <div className="mb-[26px] flex h-[200px] items-center justify-center rounded-xl border border-mk-line bg-mk-panel">
      <div className="flex items-center gap-3.5 rounded-[10px] border border-mk-line2 bg-white px-[22px] py-4 shadow-[0_2px_8px_rgba(18,22,31,0.05)]">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-mk-ink text-[15px] font-[650] text-white">
          M
        </span>
        <div>
          <div className="text-sm font-semibold">Connect Microsoft 365</div>
          <div className="mt-0.5 text-xs text-mk-muted">Read-only · admin consent</div>
        </div>
      </div>
    </div>
  );
}

function StepTwoVisual() {
  return (
    <div className="mb-[26px] flex h-[200px] items-center justify-center gap-5 rounded-xl border border-mk-line bg-mk-panel">
      <svg width="88" height="88" viewBox="0 0 88 88" aria-hidden>
        <circle cx="44" cy="44" r="36" fill="none" stroke="#ebe8e1" strokeWidth="8" />
        <circle
          cx="44"
          cy="44"
          r="36"
          fill="none"
          stroke="#c98a12"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="163 226"
          transform="rotate(-90 44 44)"
        />
        <text x="44" y="51" textAnchor="middle" fontSize="24" fontWeight="650" fill="#12161f">
          72
        </text>
      </svg>
      <div className="flex flex-col gap-[7px]">
        {gradeRows.map((g) => (
          <div key={g.cat} className="flex items-center gap-2.5 text-xs">
            <span className="w-[34px] font-mkmono text-[11px] text-mk-muted">{g.cat}</span>
            <span className="inline-block h-[5px] w-[72px] overflow-hidden rounded-full bg-[#ebe8e1]">
              <span
                className="block h-full rounded-full"
                style={{ background: g.color, width: g.pct }}
              />
            </span>
            <span className="text-[11.5px] font-semibold">{g.grade}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepThreeVisual() {
  return (
    <div className="mb-[26px] flex h-[200px] flex-col items-center justify-center gap-[9px] rounded-xl border border-mk-line bg-mk-panel px-7">
      {fixList.map((fx) => (
        <div
          key={fx.label}
          className="flex w-full items-center gap-[11px] rounded-lg border border-mk-line2 bg-white px-3.5 py-2.5 shadow-[0_1px_4px_rgba(18,22,31,0.04)]"
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-[5px] border-[1.5px] text-[10px] font-bold text-white ${
              fx.done ? "border-mk-green bg-mk-green" : "border-mk-faint bg-white"
            }`}
          >
            {fx.done ? "✓" : ""}
          </span>
          <span className="flex-1 text-[13px] font-medium text-mk-ink2">{fx.label}</span>
          <span className={`font-mkmono text-[11px] ${fx.tagClass}`}>{fx.tag}</span>
        </div>
      ))}
    </div>
  );
}

const steps = [
  {
    n: "Step 01",
    title: "Connect in 2 minutes",
    body: "No agents, no passwords, nothing to install. Grant read-only consent — or run a demo scan first.",
    visual: <StepOneVisual />,
  },
  {
    n: "Step 02",
    title: "See the whole picture",
    body: `${SCAN_CHECK_COUNT} checks across M365, Entra, and Intune roll into one score out of 100, graded A–F in every category.`,
    visual: <StepTwoVisual />,
  },
  {
    n: "Step 03",
    title: "Know what to fix first",
    body: "A prioritized fix-it list ranked by risk and dollar impact, with exact remediation steps for each issue.",
    visual: <StepThreeVisual />,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 border-t border-mk-line bg-white">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:px-8 sm:py-26">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <Reveal className="max-w-[560px]">
            <p className="mk-eyebrow mb-5">How it works</p>
            <h2 className="text-balance text-3xl font-[640] leading-[1.12] tracking-[-0.03em] sm:text-[40px]">
              From &ldquo;where do I start?&rdquo; to a checklist.
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="pb-1.5">
            <p className="text-[15px] text-mk-muted">Under 5 minutes to value</p>
          </Reveal>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 0.08}>
              {step.visual}
              <div className="mb-2.5 font-mkmono text-xs text-mk-faint">{step.n}</div>
              <div className="mb-2 text-[19px] font-[640] tracking-[-0.015em]">{step.title}</div>
              <p className="text-[14.5px] leading-[1.6] text-mk-soft">{step.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
