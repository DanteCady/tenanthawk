import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  GUIDE_BY_SLUG,
  GUIDE_CATEGORY_CHIP,
  GUIDE_CATEGORY_LABEL,
  type Guide,
} from "@/lib/guides/content";
import { GuideCta } from "./GuideCta";

export function GuideShell({ guide, children }: { guide: Guide; children: React.ReactNode }) {
  const chip = GUIDE_CATEGORY_CHIP[guide.category];
  const related = guide.relatedSlugs
    .map((slug) => GUIDE_BY_SLUG[slug])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pb-12 pt-28">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/guides" className="hover:text-slate-800">
                Guides
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">{guide.title}</li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
          >
            {GUIDE_CATEGORY_LABEL[guide.category]}
          </span>
          <span className="text-xs text-slate-400">{guide.readTime}</span>
        </div>

        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{guide.description}</p>

        <article className="mt-10 space-y-10">{children}</article>

        <div className="mt-14">
          <GuideCta />
        </div>

        {related.length > 0 && (
          <aside className="mt-14 border-t border-slate-200 pt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Related guides
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/guides/${g.slug}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </main>

      <Footer />
    </div>
  );
}

export function GuideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}
