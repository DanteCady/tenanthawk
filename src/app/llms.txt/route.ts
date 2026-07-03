import { getAllGuides } from "@/lib/content/loader";
import { getSiteUrl } from "@/lib/guides/site-url";

export function GET() {
  const base = getSiteUrl();
  const guides = getAllGuides();

  const lines = [
    "# Tenant Hawk",
    "",
    "Microsoft 365 tenant health scanner - read-only scan, health score, license waste, security findings.",
    "",
    "## Product",
    `${base}`,
    `${base}/signup`,
    "",
    "## Learn",
    `${base}/learn`,
    ...guides.map((g) => `${base}/learn/guides/${g.meta.slug}`),
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
