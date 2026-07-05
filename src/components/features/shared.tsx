import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";

/** Shared building blocks for /features/* marketing pages. */

export interface FeatureFaqItem {
  q: string;
  a: string;
}

export interface FeaturePainItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

export function FeatureHero({
  eyebrow,
  eyebrowClass = "text-purple-600",
  title,
  lede,
  ctaLabel = "Start free scan",
  ctaHref = "/signup",
  footnote,
  visual,
}: {
  eyebrow: string;
  eyebrowClass?: string;
  title: string;
  lede: string;
  ctaLabel?: string;
  ctaHref?: string;
  footnote?: string;
  visual?: React.ReactNode;
}) {
  return (
    <section className="bg-white pb-20 pt-28 sm:pt-32">
      <div className="mx-auto max-w-6xl px-6">
        <div
          className={
            visual ? "grid items-center gap-12 lg:grid-cols-2" : "mx-auto max-w-3xl text-center"
          }
        >
          <Reveal>
            <p className={`text-sm font-semibold uppercase tracking-widest ${eyebrowClass}`}>
              {eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg text-slate-600">{lede}</p>
            <div
              className={`mt-8 flex flex-wrap items-center gap-4 ${visual ? "" : "justify-center"}`}
            >
              <a
                href={ctaHref}
                className="btn-primary inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold shadow-none hover:shadow-md"
              >
                {ctaLabel}
              </a>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-900 hover:border-slate-400"
              >
                See pricing
              </Link>
            </div>
            {footnote && <p className="mt-4 text-xs text-slate-500">{footnote}</p>}
          </Reveal>
          {visual && <Reveal delay={0.1}>{visual}</Reveal>}
        </div>
      </div>
    </section>
  );
}

export function PainGrid({
  title,
  lede,
  items,
  iconClass = "bg-purple-50 text-purple-600",
}: {
  title: string;
  lede?: string;
  items: FeaturePainItem[];
  iconClass?: string;
}) {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h2>
          {lede && <p className="mt-4 text-lg text-slate-600">{lede}</p>}
        </Reveal>
        <div
          className={`mt-12 grid gap-5 ${items.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqCards({ items }: { items: FeatureFaqItem[] }) {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureCta({
  title,
  lede,
  ctaLabel = "Start free scan",
  ctaHref = "/signup",
}: {
  title: string;
  lede: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{lede}</p>
          <a
            href={ctaHref}
            className="btn-primary mt-8 inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold shadow-none hover:shadow-md"
          >
            {ctaLabel}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
