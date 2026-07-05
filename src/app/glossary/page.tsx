import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ContentCta } from "@/components/content/ContentCta";
import { CONTENT_CATEGORY_CHIP } from "@/lib/content/categories";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_CATEGORY_LABEL,
  getGlossaryTermsByCategory,
} from "@/lib/content/glossary/loader";
import { buildPageMetadata } from "@/lib/seo/site";

export const metadata = buildPageMetadata({
  title: "M365 & Entra ID glossary for IT admins",
  description:
    "Plain-language definitions for Conditional Access, license waste, Entra ID, Intune, and tenant health terms Microsoft 365 admins search every day.",
  path: "/glossary",
});

export default function GlossaryIndexPage() {
  return (
    <div className="learn-page min-h-screen bg-white text-slate-900">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
              Glossary
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              M365 &amp; Entra ID terms, defined
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Short definitions for the vocabulary admins use in audits, QBRs, and cleanup
              projects. Each term links to guides and scanner checks where relevant.
            </p>
          </div>

          <div className="mt-16 space-y-12">
            {GLOSSARY_CATEGORIES.map((category) => {
              const terms = getGlossaryTermsByCategory(category);
              const chip = CONTENT_CATEGORY_CHIP[category];
              return (
                <section key={category}>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${chip.chip} ${chip.text}`}
                    >
                      {GLOSSARY_CATEGORY_LABEL[category]}
                    </span>
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {terms.map((term) => (
                      <li key={term.slug}>
                        <Link
                          href={`/glossary/${term.slug}`}
                          className="block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white"
                        >
                          <span className="font-semibold text-slate-900">{term.term}</span>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                            {term.definition}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>

          <div className="mx-auto mt-20 max-w-3xl">
            <ContentCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
