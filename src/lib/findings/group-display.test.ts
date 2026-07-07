import { describe, expect, it } from "vitest";
import type { FindingDTO } from "@/components/app/FindingsTable";
import { groupFindingsForDisplay } from "./group-display";

function credentialFinding(
  overrides: Partial<FindingDTO> & Pick<FindingDTO, "id">,
): FindingDTO {
  return {
    checkId: "reliability.service-principal-secrets",
    category: "reliability",
    severity: "high",
    title: "Expired secret on P2P Server",
    description: "desc",
    impact: { daysUntil: -10, expiresAt: "2026-01-01T00:00:00Z" },
    remediation: "fix",
    entityRef: "P2P Server",
    tracking: "open",
    ...overrides,
  };
}

describe("groupFindingsForDisplay", () => {
  it("groups duplicate expired secrets on the same app", () => {
    const findings = [
      credentialFinding({ id: "1" }),
      credentialFinding({ id: "2" }),
      credentialFinding({ id: "3", title: "Expired secret on P2P Server" }),
    ];

    const groups = groupFindingsForDisplay(findings);
    expect(groups).toHaveLength(1);
    expect(groups[0].title).toBe("3 expired secrets on P2P Server");
    expect(groups[0].items).toHaveLength(3);
  });

  it("keeps different credential kinds separate", () => {
    const findings = [
      credentialFinding({ id: "1" }),
      credentialFinding({
        id: "2",
        title: "Expired certificate on P2P Server",
        impact: { daysUntil: -3, expiresAt: "2026-02-01T00:00:00Z" },
      }),
    ];

    const groups = groupFindingsForDisplay(findings);
    expect(groups).toHaveLength(2);
  });

  it("does not group unrelated findings", () => {
    const findings = [
      credentialFinding({ id: "1" }),
      {
        id: "2",
        checkId: "hygiene.unused-enterprise-apps",
        category: "hygiene" as const,
        severity: "low" as const,
        title: "1 unused enterprise app",
        description: "desc",
        impact: { count: 1 },
        remediation: "fix",
        entityRef: null,
        tracking: "open" as const,
      },
    ];

    expect(groupFindingsForDisplay(findings)).toHaveLength(2);
  });
});
