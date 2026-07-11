import Link from "next/link";
import { ArrowRight, Check, X } from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ContentCta } from "@/components/content/ContentCta";
import type { ComparisonPage } from "@/lib/content/comparisons/data";

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-green-600" aria-label="Yes" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-mk-faint" aria-label="No" />;
  }
  return <span className="text-sm text-mk-soft">{value}</span>;
}

export function ComparisonShell({ page }: { page: ComparisonPage }) {
  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden pt-32 pb-12">
          <div className="hidden pointer-events-none absolute inset-0 -z-10" />
          <div className="mx-auto max-w-3xl px-6 text-center">
            <p className="mk-eyebrow">
              Compare
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-mk-ink sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-mk-soft">{page.intro}</p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-12">
          <div className="overflow-hidden rounded-2xl border border-mk-line bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-mk-line bg-mk-panel">
                    <th className="px-5 py-3 font-semibold text-mk-ink">Feature</th>
                    <th className="px-5 py-3 text-center font-semibold text-mk-ink">
                      Tenant Hawk
                    </th>
                    <th className="px-5 py-3 text-center font-semibold text-mk-ink">
                      {page.competitorName}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {page.rows.map((row) => (
                    <tr key={row.feature} className="border-b border-mk-linesoft last:border-0">
                      <td className="px-5 py-3 text-mk-ink2">{row.feature}</td>
                      <td className="px-5 py-3 text-center">
                        <CellValue value={row.tenantHawk} />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <CellValue value={row.competitor} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="border-y border-mk-line bg-mk-panel py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-mk-ink">{page.tenantHawkWins.title}</h2>
              <ul className="mt-4 space-y-2">
                {page.tenantHawkWins.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-mk-soft">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-mk-line bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-mk-ink">{page.whenCompetitorWins.title}</h2>
              <p className="mt-1 text-sm text-mk-muted">{page.competitorTagline}</p>
              <ul className="mt-4 space-y-2">
                {page.whenCompetitorWins.points.map((point) => (
                  <li key={point} className="flex gap-2 text-sm text-mk-soft">
                    <span className="mt-0.5 text-mk-faint">›</span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {page.honestNote && (
            <p className="mx-auto mt-8 max-w-3xl px-6 text-center text-sm text-mk-soft">
              {page.honestNote}
            </p>
          )}
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <ContentCta />
          <p className="mt-6 text-center text-sm text-mk-muted">
            <Link href="/compare" className="font-medium text-mk-amber-deep hover:underline">
              See all comparisons
            </Link>
            {" · "}
            <Link href="/why" className="font-medium text-mk-amber-deep hover:underline">
              Why Tenant Hawk
            </Link>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function CompareHubList({
  pages,
}: {
  pages: { slug: string; title: string; metaDescription: string }[];
}) {
  return (
    <ul className="mt-10 grid gap-4 sm:grid-cols-2">
      {pages.map((p) => (
        <li key={p.slug}>
          <Link
            href={`/compare/${p.slug}`}
            className="group flex h-full flex-col rounded-2xl border border-mk-line bg-white p-6 shadow-sm transition-colors hover:border-mk-line2"
          >
            <h2 className="font-semibold text-mk-ink group-hover:text-mk-amber-deep">{p.title}</h2>
            <p className="mt-2 flex-1 text-sm text-mk-soft">{p.metaDescription}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-mk-amber-deep">
              Read comparison
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
