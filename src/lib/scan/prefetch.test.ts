import { describe, expect, it } from "vitest";
import { daysSinceActivity } from "./prefetch";

describe("daysSinceActivity", () => {
  it("returns null for empty dates", () => {
    expect(daysSinceActivity(null)).toBeNull();
    expect(daysSinceActivity("")).toBeNull();
  });

  it("computes days since a valid date", () => {
    const d = new Date(Date.now() - 100 * 86_400_000).toISOString().slice(0, 10);
    expect(daysSinceActivity(d)).toBeGreaterThanOrEqual(99);
    expect(daysSinceActivity(d)).toBeLessThanOrEqual(101);
  });
});
