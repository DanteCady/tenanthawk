import { describe, expect, it } from "vitest";
import { graphPermissionRows, undocumentedPermissions } from "./graph-permissions";

describe("graph permission docs", () => {
  it("documents every permission used by an offered check", () => {
    expect(undocumentedPermissions()).toEqual([]);
  });

  it("has grants and usedFor copy for every row", () => {
    for (const row of graphPermissionRows()) {
      expect(row.grants, `${row.permission} is missing 'grants' copy`).not.toBe("");
      expect(row.usedFor, `${row.permission} is missing 'usedFor' copy`).not.toBe("");
      expect(row.checkLabels.length).toBeGreaterThan(0);
    }
  });

  it("only documents read-only scopes", () => {
    for (const row of graphPermissionRows()) {
      expect(row.permission, `${row.permission} is not a read-only scope`).toMatch(
        /\.Read(Basic)?(\.|$)/,
      );
    }
  });
});
