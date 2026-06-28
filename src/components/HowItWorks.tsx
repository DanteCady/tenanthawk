"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, Clock, ListChecks, Plug, ScanSearch } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Plug,
    title: "Connect in 2 minutes",
    body: "No agents, no passwords, nothing to install. Grant read-only admin consent, or run a demo scan first.",
    accent: "blue",
    grad: "from-blue-500 to-blue-600",
    chip: "bg-blue-50 text-blue-600 ring-blue-100",
    glow: "group-hover:shadow-blue-200/50",
    border: "group-hover:border-blue-200",
  },
  {
    step: "02",
    icon: ScanSearch,
    title: "See the whole picture",
    body: "200+ checks across M365, Entra, and Azure roll into one health score, graded A–F in every category.",
    accent: "yellow",
    grad: "from-amber-400 to-yellow-500",
    chip: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    glow: "group-hover:shadow-amber-200/50",
    border: "group-hover:border-amber-200",
  },
  {
    step: "03",
    icon: ListChecks,
    title: "Know what to fix first",
    body: "A prioritized fix-it list ranked by risk and dollar impact, with exact remediation steps for each issue.",
    accent: "green",
    grad: "from-green-500 to-emerald-600",
    chip: "bg-green-50 text-green-600 ring-green-100",
    glow: "group-hover:shadow-green-200/50",
    border: "group-hover:border-green-200",
  },
] as const;

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

function StepPreview({ index }: { index: number }) {
  const reduceMotion = useReducedMotion();

  if (index === 0) {
    return (
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
            M
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold text-slate-800">Connect Microsoft 365</p>
            <p className="text-[0.65rem] text-slate-400">Read-only · admin consent</p>
          </div>
          <motion.span
            animate={reduceMotion ? {} : { x: [0, 3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-slate-300"
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        </div>
      </div>
    );
  }

  if (index === 1) {
    const bars = [
      { label: "Sec", w: "64%", color: "bg-red-400" },
      { label: "Cost", w: "58%", color: "bg-green-400" },
      { label: "Rel", w: "81%", color: "bg-blue-400" },
      { label: "Hyg", w: "85%", color: "bg-yellow-400" },
    ];
    return (
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg viewBox="0 0 56 56" className="h-full w-full -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="5" />
              <motion.circle
                cx="28"
                cy="28"
                r="22"
                fill="none"
                stroke="url(#howScoreGrad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={138}
                initial={reduceMotion ? { strokeDashoffset: 39 } : { strokeDashoffset: 138 }}
                whileInView={{ strokeDashoffset: 39 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
              />
              <defs>
                <linearGradient id="howScoreGrad" x1="0" y1="0" x2="56" y2="56">
                  <stop stopColor="#3b82f6" />
                  <stop offset="0.5" stopColor="#eab308" />
                  <stop offset="1" stopColor="#ef4444" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-sm font-bold text-slate-800">72</span>
          </div>
          <div className="flex-1 space-y-1.5">
            {bars.map((b, i) => (
              <div key={b.label} className="flex items-center gap-2">
                <span className="w-6 text-[0.6rem] font-medium text-slate-400">{b.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <motion.div
                    className={`h-full rounded-full ${b.color}`}
                    initial={reduceMotion ? { width: b.w } : { width: 0 }}
                    whileInView={{ width: b.w }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 + i * 0.08 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const items = [
    "Rotate expiring app secret",
    "Reclaim 12 unused licenses",
    "Review CA policy change",
  ];
  return (
    <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={item}
            initial={reduceMotion ? false : { opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.1, duration: 0.4 }}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ListChecks className="h-3 w-3" />
            </span>
            {item}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="how" className="relative scroll-mt-24 overflow-hidden bg-slate-50 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-green-200/25 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <Clock className="h-3.5 w-3.5" />
            Under 5 minutes to value
          </div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-green-600">
            How it works
          </p>
          <h2 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            From &ldquo;where do I start?&rdquo; to a checklist
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Three steps. One read-only connection. A clear picture of your tenant.
          </p>
        </motion.div>

        {/* Desktop progress rail */}
        <div className="relative mt-16 hidden md:block">
          <div className="absolute left-[16.67%] right-[16.67%] top-[1.65rem] h-0.5 overflow-hidden rounded-full bg-slate-200">
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-blue-400 via-amber-400 to-green-500"
              initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            />
          </div>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="relative mt-10 grid gap-6 md:mt-6 md:grid-cols-3 md:gap-5"
        >
          {steps.map((s, i) => (
            <motion.div key={s.step} variants={card} className="relative">
              {/* Mobile vertical connector */}
              {i < steps.length - 1 && (
                <div className="absolute -bottom-6 left-7 top-auto z-0 h-6 w-px bg-gradient-to-b from-slate-300 to-transparent md:hidden" />
              )}

              <div
                className={`group relative flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${s.glow} ${s.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <motion.span
                      className={`relative z-10 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${s.grad} font-mono text-sm font-bold text-white shadow-md ring-4 ring-white`}
                      whileHover={reduceMotion ? {} : { scale: 1.06 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      {s.step}
                    </motion.span>
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${s.chip}`}
                    >
                      <s.icon className="h-5 w-5" strokeWidth={1.9} />
                    </span>
                  </div>
                  <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-300">
                    Step {i + 1}
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{s.body}</p>

                <StepPreview index={i} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-14 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-base text-slate-500">
            From vague dread to a list you can knock out{" "}
            <span className="font-semibold text-slate-900">before lunch.</span>
          </p>
          <a
            href="/signup"
            className="group btn-primary"
          >
            Run a free scan
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
