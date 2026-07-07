import { describe, expect, it } from "vitest";
import { costScoreFromRecoverableUsd, scoreCostFromFindings } from "./cost-score";
import { grade, scoreFindings } from "./score";
import type { FindingDraft } from "./types";

function costFinding(
  overrides: Partial<FindingDraft> & { severity: FindingDraft["severity"] },
): FindingDraft {
  return {
    category: "cost",
    checkId: "cost.unused-licenses",
    title: "Unused license",
    description: "",
    remediation: "",
    ...overrides,
  };
}

describe("costScoreFromRecoverableUsd", () => {
  it("returns 100 when there is no recoverable spend", () => {
    expect(costScoreFromRecoverableUsd(0)).toBe(100);
  });

  it("returns high scores for modest waste", () => {
    expect(costScoreFromRecoverableUsd(50)).toBe(95);
    expect(costScoreFromRecoverableUsd(500)).toBe(80);
  });

  it("returns low scores for heavy waste", () => {
    expect(costScoreFromRecoverableUsd(15000)).toBeLessThan(50);
  });
});

describe("scoreCostFromFindings", () => {
  it("favors low recoverable spend over many low-severity findings", () => {
    const findings = Array.from({ length: 12 }, () =>
      costFinding({ severity: "low", impact: { usd: 5 } }),
    );
    const score = scoreCostFromFindings(findings);
    expect(score).toBeGreaterThanOrEqual(80);
    expect(grade(score)).not.toBe("F");
  });

  it("stays strict when recoverable spend is high", () => {
    const findings = [
      costFinding({ severity: "high", impact: { usd: 8000 } }),
      costFinding({ severity: "medium", impact: { usd: 4000 } }),
    ];
    const score = scoreCostFromFindings(findings);
    expect(score).toBeLessThan(60);
    expect(grade(score)).toBe("F");
  });
});

describe("scoreFindings", () => {
  it("applies cost-specific scoring in the category rollup", () => {
    const { categoryScores } = scoreFindings([
      ...Array.from({ length: 10 }, () =>
        costFinding({ severity: "low", impact: { usd: 10 } }),
      ),
      {
        category: "security",
        checkId: "security.mfa",
        severity: "high",
        title: "MFA gap",
        description: "",
        remediation: "",
      },
    ]);

    expect(categoryScores.cost).toBeGreaterThanOrEqual(80);
    expect(categoryScores.security).toBe(82);
  });
});
