import { describe, expect, it } from "vitest";
import type { RemediationPlan } from "./types";
import {
  buildWhatIfTerminalLines,
  formatWhatIfMessage,
} from "./whatif-terminal";

const plan: RemediationPlan = {
  findingId: "f1",
  checkId: "cost.disabled-user-licenses",
  mode: "whatIf",
  generatedAt: "2026-07-04T12:00:00.000Z",
  dataSource: "live",
  tenantId: "t1",
  tenantLabel: "Contoso",
  planVersion: "1.0",
  actions: [],
  summary: { actionCount: 0 },
};

describe("whatif-terminal", () => {
  it("formats ShouldProcess-style messages", () => {
    const msg = formatWhatIfMessage({
      id: "a1",
      target: "jane@contoso.com",
      verb: "Remove assigned licenses",
      before: {},
      after: {},
      risk: "low",
      reversible: true,
    });
    expect(msg).toContain('What if: Performing the operation "Remove assigned licenses"');
    expect(msg).toContain("jane@contoso.com");
  });

  it("builds plan header and summary lines", () => {
    const actions = [
      {
        id: "a1",
        target: "jane@contoso.com",
        verb: "Remove assigned licenses",
        detail: "SPE_E3",
        before: {},
        after: {},
        risk: "low" as const,
        reversible: true,
      },
    ];
    const lines = buildWhatIfTerminalLines(plan, actions, { a1: true });
    expect(lines.some((l) => l.text.includes("PS>"))).toBe(true);
    expect(lines.some((l) => l.kind === "whatif")).toBe(true);
    expect(lines.some((l) => l.text.includes("Plan: 1 to change"))).toBe(true);
  });

  it("marks skipped actions in output", () => {
    const actions = [
      {
        id: "a1",
        target: "jane@contoso.com",
        verb: "Remove assigned licenses",
        before: {},
        after: {},
        risk: "low" as const,
        reversible: true,
      },
    ];
    const lines = buildWhatIfTerminalLines(plan, actions, { a1: false });
    expect(lines.some((l) => l.text.includes("[skip]"))).toBe(true);
    expect(lines.some((l) => l.text.includes("1 skipped for export"))).toBe(true);
  });
});
