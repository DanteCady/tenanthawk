import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { ContentShell } from "@/components/content/ContentShell";
import { getAllGuideSlugs, getGuideBySlug } from "@/lib/content/loader";
import { renderMdx } from "@/lib/content/render-mdx";
import { articleSchema, breadcrumbListSchema, faqPageSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";
import {
  CONTENT_CATEGORY_LABEL,
} from "@/lib/content/categories";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return buildPageMetadata({
    title: guide.meta.title,
    description: guide.meta.description,
    path: `/learn/guides/${guide.meta.slug}`,
    type: "article",
  });
}

export default async function LearnGuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const { meta, body, headings } = guide;
  const content = await renderMdx(body);
  const path = `/learn/guides/${meta.slug}`;
  const categoryPath = meta.category === "overview" ? "/learn" : `/learn/${meta.category}`;

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: meta.title,
          description: meta.description,
          path,
          publishedAt: meta.publishedAt,
          updatedAt: meta.updatedAt,
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: "Learn", path: "/learn" },
          { name: CONTENT_CATEGORY_LABEL[meta.category], path: categoryPath },
          { name: meta.title, path },
        ])}
      />
      {meta.faq.length > 0 && <JsonLd data={faqPageSchema(meta.faq)} />}
      <ContentShell meta={meta} headings={headings}>
        {content}
      </ContentShell>
    </>
  );
}
