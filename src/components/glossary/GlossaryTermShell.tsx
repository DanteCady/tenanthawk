import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ContentCta } from "@/components/content/ContentCta";
import { getGuideLinkForCheck } from "@/lib/content/check-map";
import {
  GLOSSARY_CATEGORY_LABEL,
  getRelatedGlossaryTerms,
} from "@/lib/content/glossary/loader";
import type { GlossaryTerm } from "@/lib/content/glossary/types";
import { CONTENT_CATEGORY_CHIP } from "@/lib/content/categories";

export function GlossaryTermShell({ term }: { term: GlossaryTerm }) {
  const chip = CONTENT_CATEGORY_CHIP[term.category];
  const related = getRelatedGlossaryTerms(term);
  const guideLink = term.checkId ? getGuideLinkForCheck(term.checkId) : null;

  return (
    <div className="learn-page min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-28">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/glossary" className="hover:text-slate-800">
                Glossary
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-700">{term.term}</li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
          >
            {GLOSSARY_CATEGORY_LABEL[term.category]}
          </span>
        </div>

        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {term.term}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-slate-700">{term.definition}</p>

        {term.body && (
          <div className="prose-th mt-8 space-y-4 text-slate-600">
            {term.body.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        )}

        {(term.relatedGuideSlug || guideLink) && (
          <aside className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-sm font-semibold text-slate-900">Related guide</p>
            <Link
              href={`/learn/guides/${term.relatedGuideSlug ?? guideLink!.slug}`}
              className="mt-2 inline-block text-sm font-medium text-blue-700 hover:underline"
            >
              Read the full guide →
            </Link>
          </aside>
        )}

        {related.length > 0 && (
          <aside className="mt-10 border-t border-slate-200 pt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Related terms
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/glossary/${r.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 hover:border-slate-300"
                  >
                    {r.term}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="mt-14">
          <ContentCta />
        </div>
      </main>
      <Footer />
    </div>
  );
}
