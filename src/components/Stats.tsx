import { Reveal } from "./Reveal";
import { SCAN_CHECK_COUNT } from "@/lib/scan/catalog";

const stats = [
  { value: String(SCAN_CHECK_COUNT), label: "essential tenant health checks" },
  { value: "M365 · Entra · Intune", label: "connected through read-only Graph" },
  { value: "1 score", label: "for security, cost, reliability & hygiene" },
  { value: "< 5 min", label: "from consent to your first fix list" },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24 pt-14 sm:px-8">
      <div className="grid grid-cols-2 border-t border-mk-line lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal
            key={s.label}
            delay={i * 0.06}
            className="mr-6 border-r border-mk-line pr-6 pt-7 last:mr-0 last:border-r-0 last:pr-0"
          >
            <p className="text-2xl font-[640] tracking-[-0.02em] sm:text-[30px]">{s.value}</p>
            <p className="mt-1.5 text-[13.5px] leading-[1.45] text-mk-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
