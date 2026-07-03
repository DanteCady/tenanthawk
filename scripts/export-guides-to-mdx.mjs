/**
 * One-time export: src/lib/guides/content.ts → content/guides/*.mdx
 * Run: node --experimental-strip-types scripts/export-guides-to-mdx.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDES } from "../src/lib/guides/content.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "content/guides");
mkdirSync(outDir, { recursive: true });

const CHECK_IDS_BY_SLUG = {
  "m365-tenant-cleanup": [
    "hygiene.inactive-users",
    "cost.unused-licenses",
    "security.legacy-auth",
    "hygiene.empty-groups",
  ],
  "m365-tenant-health-checklist": [
    "security.conditional-access",
    "security.mfa-registration",
    "cost.disabled-user-licenses",
    "reliability.expiring-secrets",
  ],
  "m365-security-misconfigurations": [
    "security.conditional-access",
    "security.legacy-auth",
    "security.admin-roles",
    "security.mfa-registration",
  ],
  "find-wasted-m365-licenses": [
    "cost.unused-licenses",
    "cost.disabled-user-licenses",
    "hygiene.inactive-users",
  ],
  "m365-expiring-secrets-and-domains": ["reliability.expiring-secrets", "cost.license-expiry"],
  "m365-tenant-hygiene": [
    "hygiene.inactive-users",
    "hygiene.empty-groups",
    "hygiene.sharing",
    "hygiene.intune-noncompliant",
  ],
  "prepare-for-m365-audit": [
    "security.conditional-access",
    "security.mfa-registration",
    "security.admin-roles",
    "cost.disabled-user-licenses",
  ],
};

const CATEGORY_BY_SLUG = {
  "m365-tenant-health-checklist": "governance",
  "prepare-for-m365-audit": "governance",
};

function sectionToMarkdown(section) {
  let md = `## ${section.title}\n\n`;
  for (const p of section.paragraphs) {
    md += `${p}\n\n`;
  }
  if (section.bullets?.length) {
    for (const b of section.bullets) {
      md += `- ${b}\n`;
    }
    md += "\n";
  }
  return md;
}

function defaultFaq(guide) {
  return [
    {
      q: `How long does ${guide.title.toLowerCase()} take?`,
      a: `Most admins can work through the core steps in one to two sessions. Tenant Hawk automates the inventory in under five minutes with a read-only scan.`,
    },
    {
      q: "Do I need Global Administrator to run these checks?",
      a: "Many checks require Global Administrator or Security Administrator in Entra ID. Tenant Hawk uses read-only admin consent so you can assess the tenant without making changes.",
    },
    {
      q: "How often should I repeat this review?",
      a: "Run a full pass quarterly at minimum, or monthly before audits and renewal season. After major org changes, run an ad-hoc review within a week.",
    },
  ];
}

const today = new Date().toISOString().slice(0, 10);

for (const guide of GUIDES) {
  const checkIds = CHECK_IDS_BY_SLUG[guide.slug] ?? [];
  const frontmatter = {
    title: guide.title,
    description: guide.description,
    slug: guide.slug,
    type: "guide",
    category: guide.category,
    checkIds,
    relatedSlugs: guide.relatedSlugs,
    readTime: guide.readTime,
    publishedAt: "2026-03-01",
    updatedAt: today,
    quickAnswer: guide.description,
    faq: defaultFaq(guide),
    targetKeyword: guide.title,
  };

  const body = guide.sections.map(sectionToMarkdown).join("");
  const yaml = JSON.stringify(frontmatter, null, 2)
    .replace(/^\{/, "")
    .replace(/\}$/, "")
    .replace(/"([^"]+)":/g, "$1:");

  // Use a proper minimal yaml writer via JSON is ugly - use manual template
  const fmLines = [
    `title: ${JSON.stringify(guide.title)}`,
    `description: ${JSON.stringify(guide.description)}`,
    `slug: ${JSON.stringify(guide.slug)}`,
    `type: guide`,
    `category: ${CATEGORY_BY_SLUG[guide.slug] ?? guide.category}`,
    `checkIds: ${JSON.stringify(checkIds)}`,
    `relatedSlugs: ${JSON.stringify(guide.relatedSlugs)}`,
    `readTime: ${JSON.stringify(guide.readTime)}`,
    `publishedAt: "2026-03-01"`,
    `updatedAt: ${JSON.stringify(today)}`,
    `quickAnswer: ${JSON.stringify(guide.description)}`,
    `targetKeyword: ${JSON.stringify(guide.title)}`,
    `faq:`,
    ...defaultFaq(guide).flatMap((item) => [
      `  - q: ${JSON.stringify(item.q)}`,
      `    a: ${JSON.stringify(item.a)}`,
    ]),
  ];

  const mdx = `---\n${fmLines.join("\n")}\n---\n\n${body}`;
  writeFileSync(join(outDir, `${guide.slug}.mdx`), mdx, "utf8");
  console.log(`Wrote ${guide.slug}.mdx`);
}

console.log(`Exported ${GUIDES.length} guides to ${outDir}`);
