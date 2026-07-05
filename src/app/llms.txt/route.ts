import { COMPARISON_PAGES } from "@/lib/content/comparisons/data";
import { getAllGlossaryTerms } from "@/lib/content/glossary/loader";
import { getAllGuides } from "@/lib/content/loader";
import { getSiteUrl } from "@/lib/guides/site-url";

function mdLink(title: string, url: string, note?: string): string {
  return note ? `- [${title}](${url}): ${note}` : `- [${title}](${url})`;
}

export function GET() {
  const base = getSiteUrl();
  const guides = getAllGuides();

  const lines = [
    "# Tenant Hawk",
    "",
    "> Read only Microsoft 365 tenant health scanner. One scan, one health score, dollar impact on license waste and security findings, for admins, consultants, and MSPs.",
    "",
    "Free scan and score at signup. Guides cover M365 cleanup, tenant hygiene, security misconfigurations, and audit prep.",
    "",
    "## Product",
    "",
    mdLink("Homepage", base, "Marketing site and product overview"),
    mdLink("Start free scan", `${base}/signup`, "Connect a tenant with read only admin consent"),
    mdLink("Why Tenant Hawk", `${base}/why`, "Problem framing and differentiation"),
    "",
    "## Learn",
    "",
    mdLink("M365 guides hub", `${base}/learn`, "Index of cleanup, security, and governance guides"),
    mdLink("Glossary", `${base}/glossary`, "M365 and Entra ID term definitions"),
    mdLink("Compare", `${base}/compare`, "Tenant Hawk vs Microsoft tools"),
    mdLink(
      "License savings calculator",
      `${base}/tools/license-savings-calculator`,
      "Estimate recoverable license spend",
    ),
    ...guides.map((g) =>
      mdLink(g.meta.title, `${base}/learn/guides/${g.meta.slug}`, g.meta.description),
    ),
    "",
    "## Compare",
    "",
    ...COMPARISON_PAGES.map((p) =>
      mdLink(p.title, `${base}/compare/${p.slug}`, p.metaDescription),
    ),
    "",
    "## Glossary",
    "",
    ...getAllGlossaryTerms().map((t) =>
      mdLink(t.term, `${base}/glossary/${t.slug}`, t.definition),
    ),
    "",
    "## Optional",
    "",
    mdLink("Privacy policy", `${base}/privacy`),
    mdLink("Terms of service", `${base}/terms`),
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
