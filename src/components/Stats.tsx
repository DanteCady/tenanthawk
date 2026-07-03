import { Reveal } from "./Reveal";
import { SCAN_CHECK_COUNT } from "@/lib/scan/catalog";

const stats = [
  { value: String(SCAN_CHECK_COUNT), label: "essential tenant health checks", color: "text-blue-600" },
  { value: "M365 · Entra · Azure", label: "connected through read-only Graph", color: "text-slate-900" },
  { value: "1 score", label: "for security, cost, reliability & hygiene", color: "text-yellow-600" },
  { value: "One console", label: "for your entire client portfolio", color: "text-green-600" },
];

export function Stats() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-6 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="px-2 py-8 text-center sm:px-6">
            <p className={`text-2xl font-bold sm:text-3xl ${s.color}`}>{s.value}</p>
            <p className="mt-2 text-sm text-slate-500">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
