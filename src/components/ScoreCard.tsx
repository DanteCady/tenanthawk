"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";
import { KeyRound, ShieldAlert, Sparkles, Wallet } from "lucide-react";

const SCORE = 72;
const RADIUS = 52;
const CIRC = 2 * Math.PI * RADIUS;

const categories = [
  { icon: ShieldAlert, label: "Security", value: 64, color: "#ef4444", bar: "from-red-400 to-red-500" },
  { icon: Wallet, label: "Cost", value: 58, color: "#22c55e", bar: "from-green-400 to-green-500" },
  { icon: KeyRound, label: "Reliability", value: 81, color: "#3b82f6", bar: "from-blue-400 to-blue-500" },
  { icon: Sparkles, label: "Hygiene", value: 85, color: "#eab308", bar: "from-yellow-400 to-yellow-500" },
];

const findings = [
  { dot: "#ef4444", text: "3 app secrets expire in 14 days" },
  { dot: "#22c55e", text: "$1,840/mo in unused M365 licenses" },
  { dot: "#3b82f6", text: "Conditional Access policy changed 2d ago" },
];

function Gauge() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);
  const target = inView ? SCORE : 0;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, SCORE, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView]);

  return (
    <div ref={ref} className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <motion.circle
          cx="64"
          cy="64"
          r={RADIUS}
          fill="none"
          stroke="url(#gaugeLight)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          initial={{ strokeDashoffset: CIRC }}
          animate={{ strokeDashoffset: CIRC - (target / 100) * CIRC }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gaugeLight" x1="0" y1="0" x2="128" y2="128">
            <stop stopColor="#3b82f6" />
            <stop offset="0.5" stopColor="#eab308" />
            <stop offset="1" stopColor="#ef4444" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-slate-900">{display}</span>
        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-slate-400">
          Health
        </span>
      </div>
    </div>
  );
}

export function ScoreCard() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-tr from-blue-200/40 via-yellow-100/40 to-red-200/40 blur-3xl" />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">contoso.onmicrosoft.com</p>
            <p className="text-xs text-slate-500">Last scan · 6 min ago · 214 checks</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> Monitoring
          </span>
        </div>

        {/* score + categories */}
        <div className="flex items-center gap-6 px-5 py-6">
          <Gauge />
          <div className="flex-1 space-y-3">
            {categories.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <c.icon className="h-4 w-4" style={{ color: c.color }} />
                <span className="w-20 text-sm text-slate-500">{c.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${c.bar}`}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.value}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <span className="w-7 text-right text-xs font-semibold text-slate-700">
                  {c.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* findings */}
        <div className="space-y-px border-t border-slate-100 bg-slate-50">
          {findings.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 + i * 0.12 }}
              className="flex items-center gap-3 bg-white px-5 py-2.5"
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: f.dot }} />
              <span className="text-xs text-slate-600">{f.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
