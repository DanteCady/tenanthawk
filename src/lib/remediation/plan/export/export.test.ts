import { describe, expect, it } from "vitest";
import type { RemediationPlan } from "../types";
import { exportRemediationScript } from "./index";

const samplePlan: RemediationPlan = {
  findingId: "finding-abc12345",
  checkId: "cost.disabled-user-licenses",
  mode: "whatIf",
  generatedAt: "2026-07-04T12:00:00.000Z",
  dataSource: "live",
  tenantId: "tenant-guid",
  tenantLabel: "Contoso",
  planVersion: "1.0",
  actions: [
    {
      id: "disabled-user-jane@contoso.com",
      target: "jane@contoso.com",
      verb: "Remove assigned licenses",
      detail: "SPE_E3",
      before: {
        userPrincipalName: "jane@contoso.com",
        skuIds: ["sku-1"],
        skuPartNumbers: ["SPE_E3"],
      },
      after: { assignedLicenses: [] },
      risk: "low",
      reversible: true,
    },
    {
      id: "disabled-user-bob@contoso.com",
      target: "bob@contoso.com",
      verb: "Remove assigned licenses",
      before: {
        userPrincipalName: "bob@contoso.com",
        skuIds: ["sku-2"],
      },
      after: { assignedLicenses: [] },
      risk: "low",
      reversible: true,
    },
  ],
  summary: { actionCount: 2 },
};

describe("exportRemediationScript", () => {
  it("embeds metadata header in PS7 export", () => {
    const result = exportRemediationScript(samplePlan, "local-ps7");
    expect(result.content).toContain("# findingId:    finding-abc12345");
    expect(result.content).toContain("# checkId:      cost.disabled-user-licenses");
    expect(result.content).toContain("# tenantId:     tenant-guid");
    expect(result.content).toContain("# planVersion:  1.0");
    expect(result.content).toContain("#requires -Version 7");
    expect(result.content).toContain("$WhatIf = $true");
    expect(result.content).toContain("SupportsShouldProcess");
    expect(result.content).toContain("jane@contoso.com");
    expect(result.content).toContain("bob@contoso.com");
  });

  it("embeds PS 5.1 requires and avoids PS7-only syntax", () => {
    const result = exportRemediationScript(samplePlan, "local-ps51");
    expect(result.content).toContain("#requires -Version 5.1");
    expect(result.content).not.toContain("#requires -Version 7");
    expect(result.content).not.toContain("??");
  });

  it("uses PreviewOnly and managed identity for runbook", () => {
    const result = exportRemediationScript(samplePlan, "azure-runbook");
    expect(result.content).toContain("$PreviewOnly = $true");
    expect(result.content).toContain("Connect-MgGraph -Identity");
    expect(result.content).not.toContain("Connect-MgGraph -Scopes");
  });

  it("filters actions when actionIds provided", () => {
    const result = exportRemediationScript(samplePlan, "local-ps7", {
      actionIds: ["disabled-user-jane@contoso.com"],
    });
    expect(result.content).toContain("jane@contoso.com");
    expect(result.content).not.toContain("bob@contoso.com");
    expect(result.content).toContain("# actions:      1 of 2 from preview");
  });
});
