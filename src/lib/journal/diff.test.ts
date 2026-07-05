import { describe, expect, it } from "vitest";
import { contentHash, diffObjects, stableStringify } from "./diff";

describe("stableStringify", () => {
  it("is key-order independent", () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }));
  });

  it("ignores volatile Graph metadata keys", () => {
    expect(
      stableStringify({ state: "enabled", modifiedDateTime: "2026-07-01T00:00:00Z" }),
    ).toBe(stableStringify({ state: "enabled", modifiedDateTime: "2026-07-04T09:00:00Z" }));
  });
});

describe("contentHash", () => {
  it("changes when a meaningful field changes", () => {
    expect(contentHash({ state: "enabled" })).not.toBe(contentHash({ state: "disabled" }));
  });
});

describe("diffObjects", () => {
  it("returns empty for identical objects", () => {
    expect(diffObjects({ a: 1 }, { a: 1 })).toEqual([]);
  });

  it("reports a changed scalar with its path", () => {
    const diff = diffObjects({ state: "enabled" }, { state: "disabled" });
    expect(diff).toEqual([{ path: "state", before: "enabled", after: "disabled" }]);
  });

  it("recurses into nested objects with dot paths", () => {
    const diff = diffObjects(
      { grantControls: { operator: "OR", builtInControls: ["mfa"] } },
      { grantControls: { operator: "AND", builtInControls: ["mfa"] } },
    );
    expect(diff).toEqual([
      { path: "grantControls.operator", before: "OR", after: "AND" },
    ]);
  });

  it("treats arrays as atomic leaves", () => {
    const diff = diffObjects(
      { ipRanges: ["10.0.0.0/8"] },
      { ipRanges: ["10.0.0.0/8", "203.0.113.0/24"] },
    );
    expect(diff).toEqual([
      {
        path: "ipRanges",
        before: ["10.0.0.0/8"],
        after: ["10.0.0.0/8", "203.0.113.0/24"],
      },
    ]);
  });

  it("reports added and removed keys against null", () => {
    expect(diffObjects({}, { pin: 6 })).toEqual([{ path: "pin", before: null, after: 6 }]);
    expect(diffObjects({ pin: 6 }, {})).toEqual([{ path: "pin", before: 6, after: null }]);
  });
});
