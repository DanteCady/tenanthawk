import "server-only";
import OpenAI from "openai";
import type { Category, Severity } from "@/db/types";
import { getDocsForCheck } from "./docs";
import type { RemediationEnriched } from "./types";

const DEFAULT_MODEL = "gpt-4o-mini";

export interface EnrichInput {
  checkId: string;
  category: Category;
  severity: Severity;
  title: string;
  description: string;
  entityRef: string | null;
  templateRemediation: string;
}

function fallbackEnrichment(
  input: EnrichInput,
  model: string,
): RemediationEnriched {
  const links = getDocsForCheck(input.checkId, input.category);
  return {
    steps: [input.templateRemediation],
    links,
    generatedAt: new Date().toISOString(),
    model,
  };
}

function resolveLinks(
  linkTitles: string[],
  allowed: ReturnType<typeof getDocsForCheck>,
): RemediationEnriched["links"] {
  const byTitle = new Map(allowed.map((d) => [d.title.toLowerCase(), d]));
  const out: RemediationEnriched["links"] = [];
  for (const title of linkTitles) {
    const doc = byTitle.get(title.toLowerCase());
    if (doc) out.push(doc);
  }
  if (out.length === 0) return allowed.slice(0, 2);
  return out;
}

export async function enrichRemediation(
  input: EnrichInput,
): Promise<RemediationEnriched> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL ?? DEFAULT_MODEL;
  const allowedDocs = getDocsForCheck(input.checkId, input.category);

  if (!apiKey) {
    return fallbackEnrichment(input, "fallback");
  }

  const docList = allowedDocs
    .map((d) => `- ${d.title}`)
    .join("\n");

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You help Microsoft 365 Global Administrators fix tenant health issues.
Return JSON: { "steps": string[], "linkTitles": string[] }
- steps: 3-5 ordered, actionable steps for this specific finding
- linkTitles: 1-3 titles chosen ONLY from the allowed Microsoft docs list
- Reference affected resources by name when provided
- Use Entra / M365 admin portal paths where helpful
- Do not invent URLs or doc titles`,
        },
        {
          role: "user",
          content: `Finding:
- Category: ${input.category}
- Severity: ${input.severity}
- Title: ${input.title}
- Description: ${input.description}
- Affected: ${input.entityRef ?? "not specified"}
- Baseline fix: ${input.templateRemediation}

Allowed Microsoft documentation titles:
${docList || "- (none — return empty linkTitles)"}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty OpenAI response");

    const parsed = JSON.parse(raw) as {
      steps?: unknown;
      linkTitles?: unknown;
    };

    const steps = Array.isArray(parsed.steps)
      ? parsed.steps.filter(
          (s): s is string => typeof s === "string" && s.trim().length > 0,
        )
      : [];

    const linkTitles = Array.isArray(parsed.linkTitles)
      ? parsed.linkTitles.filter((t): t is string => typeof t === "string")
      : [];

    if (steps.length === 0) throw new Error("No steps in AI response");

    return {
      steps,
      links: resolveLinks(linkTitles, allowedDocs),
      generatedAt: new Date().toISOString(),
      model,
    };
  } catch (err) {
    console.error("[remediation/enrich] OpenAI failed", err);
    return fallbackEnrichment(input, `${model}-fallback`);
  }
}
