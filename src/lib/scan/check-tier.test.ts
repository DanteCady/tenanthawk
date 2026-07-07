import { describe, expect, it } from "vitest";
import { shouldRunCheck, skipReasonForCheck } from "./check-tier";

describe("check tier gating", () => {
  it("skips v2 checks on standard scans", () => {
    expect(shouldRunCheck("hygiene.inactive-channels", "standard")).toBe(false);
    expect(skipReasonForCheck("hygiene.inactive-channels", "standard")).toBe(
      "Requires deep scan",
    );
  });

  it("runs v2 checks on deep scans", () => {
    expect(shouldRunCheck("hygiene.inactive-channels", "deep")).toBe(true);
  });

  it("always runs v1 checks", () => {
    expect(shouldRunCheck("hygiene.stale-teams", "standard")).toBe(true);
  });
});
