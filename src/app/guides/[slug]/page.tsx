import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/JsonLd";
import { GuideSection, GuideShell } from "@/components/guides/GuideShell";
import { GUIDES, GUIDE_BY_SLUG } from "@/lib/guides/content";
import { articleSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) return {};

  return buildPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: "article",
  });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) notFound();

  return (
    <>
      <JsonLd
        data={articleSchema({
          title: guide.title,
          description: guide.description,
          path: `/guides/${guide.slug}`,
        })}
      />
      <GuideShell guide={guide}>
        {guide.sections.map((section) => (
          <GuideSection key={section.title} title={section.title}>
            {section.paragraphs.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
            {section.bullets && (
              <ul className="list-disc space-y-2 pl-5">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </GuideSection>
        ))}
      </GuideShell>
    </>
  );
}
