import { describe, expect, it } from "vitest";
import { buildCopilotReadinessFindings } from "./copilot-readiness";
import type { FindingDraft } from "./types";

describe("copilot readiness blockers", () => {
  it("aggregates open hygiene findings into a readiness finding", () => {
    const prior: FindingDraft[] = [
      {
        category: "hygiene",
        checkId: "hygiene.sharing",
        severity: "medium",
        title: "Sharing",
        description: "x",
        remediation: "x",
      },
      {
        category: "security",
        checkId: "security.legacy-auth",
        severity: "high",
        title: "Legacy auth",
        description: "x",
        remediation: "x",
      },
    ];

    const findings = buildCopilotReadinessFindings(prior);
    expect(findings).toHaveLength(1);
    expect(findings[0]?.checkId).toBe("copilot.readiness-blockers");
    expect(findings[0]?.impact?.entities).toEqual([
      "External SharePoint sharing",
      "Legacy authentication allowed",
    ]);
  });

  it("returns nothing when no blockers are open", () => {
    expect(buildCopilotReadinessFindings([])).toEqual([]);
  });
});
