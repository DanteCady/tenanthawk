import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlossaryTermShell } from "@/components/glossary/GlossaryTermShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAllGlossarySlugs, getGlossaryTerm } from "@/lib/content/glossary/loader";
import { breadcrumbListSchema, definedTermSchema } from "@/lib/seo/schemas";
import { buildPageMetadata } from "@/lib/seo/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllGlossarySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return {};

  return buildPageMetadata({
    title: `${term.term} — M365 glossary`,
    description: term.definition,
    path: `/glossary/${term.slug}`,
  });
}

export default async function GlossaryTermPage({ params }: Props) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const path = `/glossary/${term.slug}`;

  return (
    <>
      <JsonLd
        data={definedTermSchema({
          term: term.term,
          definition: term.definition,
          slug: term.slug,
        })}
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: "Glossary", path: "/glossary" },
          { name: term.term, path },
        ])}
      />
      <GlossaryTermShell term={term} />
    </>
  );
}
