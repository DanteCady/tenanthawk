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
  eyebrowClass = "text-mk-amber-deep",
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
            <p className={`mk-eyebrow ${eyebrowClass}`}>
              {eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-mk-ink sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-lg text-mk-soft">{lede}</p>
            <div
              className={`mt-8 flex flex-wrap items-center gap-4 ${visual ? "" : "justify-center"}`}
            >
              <a
                href={ctaHref}
                className="mk-btn px-6 py-3 text-sm"
              >
                {ctaLabel}
              </a>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center rounded-xl border border-mk-line2 px-6 py-3 text-sm font-semibold text-mk-ink hover:border-mk-faint"
              >
                See pricing
              </Link>
            </div>
            {footnote && <p className="mt-4 text-xs text-mk-muted">{footnote}</p>}
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
  iconClass = "bg-purple-50 text-mk-amber-deep",
}: {
  title: string;
  lede?: string;
  items: FeaturePainItem[];
  iconClass?: string;
}) {
  return (
    <section className="bg-mk-panel py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
            {title}
          </h2>
          {lede && <p className="mt-4 text-lg text-mk-soft">{lede}</p>}
        </Reveal>
        <div
          className={`mt-12 grid gap-5 ${items.length % 3 === 0 ? "md:grid-cols-3" : "md:grid-cols-2"}`}
        >
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
                >
                  <item.icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-4 font-bold text-mk-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-mk-soft">{item.body}</p>
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
    <section className="bg-mk-panel py-20">
      <div className="mx-auto max-w-3xl px-6">
        <Reveal className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
            Frequently asked questions
          </h2>
        </Reveal>
        <div className="mt-10 space-y-4">
          {items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <div className="rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-mk-ink">{item.q}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mk-soft">{item.a}</p>
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
          <h2 className="text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-mk-soft">{lede}</p>
          <a
            href={ctaHref}
            className="mk-btn mt-8 px-8 py-3.5 text-sm"
          >
            {ctaLabel}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
