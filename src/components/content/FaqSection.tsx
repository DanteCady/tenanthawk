import type { FaqItem } from "@/lib/content/types";

export function FaqSection({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-200 pt-10">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">
        Frequently asked questions
      </h2>
      <dl className="mt-6 space-y-6">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-sm font-semibold text-slate-900">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
