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
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-16 pt-28">
        <nav aria-label="Breadcrumb" className="text-sm text-mk-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/glossary" className="hover:text-mk-ink2">
                Glossary
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-mk-ink2">{term.term}</li>
          </ol>
        </nav>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
          >
            {GLOSSARY_CATEGORY_LABEL[term.category]}
          </span>
        </div>

        <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-mk-ink sm:text-4xl">
          {term.term}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-mk-ink2">{term.definition}</p>

        {term.body && (
          <div className="prose-th mt-8 space-y-4 text-mk-soft">
            {term.body.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>
        )}

        {(term.relatedGuideSlug || guideLink) && (
          <aside className="mt-10 rounded-xl border border-mk-line bg-mk-panel px-5 py-4">
            <p className="text-sm font-semibold text-mk-ink">Related guide</p>
            <Link
              href={`/learn/guides/${term.relatedGuideSlug ?? guideLink!.slug}`}
              className="mt-2 inline-block text-sm font-medium text-mk-amber-deep hover:underline"
            >
              Read the full guide →
            </Link>
          </aside>
        )}

        {related.length > 0 && (
          <aside className="mt-10 border-t border-mk-line pt-10">
            <h2 className="mk-eyebrow">
              Related terms
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/glossary/${r.slug}`}
                    className="rounded-full border border-mk-line bg-white px-3 py-1 text-sm font-medium text-mk-ink2 hover:border-mk-line2"
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
