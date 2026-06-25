"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Lock, ScanLine } from "lucide-react";
import { ScoreCard } from "./ScoreCard";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      <div className="light-aura pointer-events-none absolute inset-0 -z-10" />
      <div className="light-grid pointer-events-none absolute inset-0 -z-10 h-[640px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
          >
            <ScanLine className="h-3.5 w-3.5 text-blue-500" />
            For M365 admins, MSPs &amp; IT consultants
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-5xl font-bold leading-[1.03] tracking-tight text-slate-900 sm:text-6xl"
          >
            Your tenant is{" "}
            <span className="text-rainbow">messier</span> than you think.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600"
          >
            Expired secrets. Licenses nobody uses. Risky access that crept in
            years ago. You <em>know</em> it&apos;s in there somewhere — but with
            hundreds of settings across M365, Entra, and Azure, where do you even
            start?
            <span className="mt-3 block font-medium text-slate-900">
              Tenant Hawk connects read-only and hands you one clear health score
              and a prioritized fix-it list — in minutes.
            </span>
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/signup"
              className="group btn-primary px-6 py-3.5"
            >
              Run a free scan
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            variants={item}
            className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500"
          >
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-500" />
              Read-only — no credentials stored
            </span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span>Connect in 2 minutes · no credit card</span>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <ScoreCard />
        </motion.div>
      </div>
    </section>
  );
}
