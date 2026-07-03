import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import {
  CONTENT_CATEGORY_CHIP,
  CONTENT_CATEGORY_LABEL,
} from "@/lib/content/categories";
import { getGuideBySlug } from "@/lib/content/loader";
import type { ContentMeta } from "@/lib/content/types";
import { ContentCta } from "./ContentCta";
import { FaqSection } from "./FaqSection";
import { QuickAnswer } from "./QuickAnswer";
import { ScanCheckCallout } from "./ScanCheckCallout";
import { SourceReferences } from "./SourceReferences";
import { TableOfContents } from "./TableOfContents";

export function ContentShell({
  meta,
  headings,
  children,
}: {
  meta: ContentMeta;
  headings: { id: string; title: string }[];
  children: React.ReactNode;
}) {
  const chip = CONTENT_CATEGORY_CHIP[meta.category];
  const related = meta.relatedSlugs
    .map((slug) => getGuideBySlug(slug))
    .filter((g): g is NonNullable<typeof g> => g !== null);

  const categoryHref =
    meta.category === "overview" ? "/learn" : `/learn/${meta.category}`;

  return (
    <div className="learn-page min-h-screen bg-white text-slate-900">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 pb-12 pt-28">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/learn" className="hover:text-slate-800">
                Learn
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={categoryHref} className="hover:text-slate-800">
                {CONTENT_CATEGORY_LABEL[meta.category]}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">{meta.title}</li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
          >
            {CONTENT_CATEGORY_LABEL[meta.category]}
          </span>
          <span className="text-xs text-slate-400">{meta.readTime}</span>
        </div>

        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">{meta.description}</p>

        <div className="mt-8 space-y-8">
          <QuickAnswer>{meta.quickAnswer}</QuickAnswer>
          <TableOfContents headings={headings} />
          <ScanCheckCallout checkIds={meta.checkIds} />
        </div>

        <article className="prose-th mt-10 space-y-6">{children}</article>

        <SourceReferences sources={meta.sources} />

        <FaqSection items={meta.faq} />

        <div className="mt-14">
          <ContentCta />
        </div>

        {related.length > 0 && (
          <aside className="mt-14 border-t border-slate-200 pt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Related guides
            </h2>
            <ul className="mt-4 space-y-3">
              {related.map((g) => (
                <li key={g.meta.slug}>
                  <Link
                    href={`/learn/guides/${g.meta.slug}`}
                    className="font-medium text-blue-700 hover:underline"
                  >
                    {g.meta.title}
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
