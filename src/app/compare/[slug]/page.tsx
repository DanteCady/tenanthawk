import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComparisonShell } from "@/components/compare/ComparisonShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { COMPARISON_BY_SLUG, COMPARISON_PAGES } from "@/lib/content/comparisons/data";
import { breadcrumbListSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COMPARISON_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = COMPARISON_BY_SLUG[slug];
  if (!page) return {};

  return buildPageMetadata({
    title: page.title,
    description: page.metaDescription,
    path: `/compare/${page.slug}`,
  });
}

export default async function CompareDetailPage({ params }: Props) {
  const { slug } = await params;
  const page = COMPARISON_BY_SLUG[slug];
  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbListSchema([
          { name: "Compare", path: "/compare" },
          { name: page.title, path: `/compare/${page.slug}` },
        ])}
      />
      <ComparisonShell page={page} />
    </>
  );
}
