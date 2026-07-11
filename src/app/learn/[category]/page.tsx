import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContentCard } from "@/components/content/ContentCard";
import { ContentCta } from "@/components/content/ContentCta";
import {
  CONTENT_CATEGORIES,
  CONTENT_CATEGORY_DESCRIPTION,
  CONTENT_CATEGORY_LABEL,
  CONTENT_CATEGORY_SEO,
} from "@/lib/content/categories";
import type { ContentCategory } from "@/lib/content/types";
import { getGuidesByCategory } from "@/lib/content/loader";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CONTENT_CATEGORIES.filter((c) => c !== "overview").map((category) => ({
    category,
  }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  if (!CONTENT_CATEGORIES.includes(category as ContentCategory)) return {};

  const cat = category as Exclude<ContentCategory, "overview">;
  const seo = CONTENT_CATEGORY_SEO[cat];
  return buildPageMetadata({
    title: seo.title,
    description: seo.description,
    path: `/learn/${category}`,
  });
}

export default async function LearnCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!CONTENT_CATEGORIES.includes(category as ContentCategory)) {
    notFound();
  }

  const cat = category as ContentCategory;
  const guides = getGuidesByCategory(cat);

  return (
    <div className="marketing-v2 min-h-screen">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <nav aria-label="Breadcrumb" className="text-sm text-mk-muted">
            <Link href="/learn" className="hover:text-mk-ink2">
              Learn
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-mk-ink2">{CONTENT_CATEGORY_LABEL[cat]}</span>
          </nav>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-mk-ink">
            {CONTENT_CATEGORY_LABEL[cat]} guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-mk-soft">
            {CONTENT_CATEGORY_DESCRIPTION[cat]}
          </p>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <ContentCard key={guide.meta.slug} meta={guide.meta} />
            ))}
          </div>

          {guides.length === 0 && (
            <p className="mt-8 text-mk-soft">More guides in this category are on the way.</p>
          )}

          <div className="mx-auto mt-16 max-w-3xl">
            <ContentCta />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
