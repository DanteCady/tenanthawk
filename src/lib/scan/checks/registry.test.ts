import { describe, expect, it } from "vitest";
import { checks } from "./index";
import {
  offeredCheckDefinitions,
  scoredCheckCount,
  validateRegisteredCheckIds,
} from "./registry";

describe("check registry", () => {
  it("matches implemented checks to offered registry entries", () => {
    const errors = validateRegisteredCheckIds(checks.map((c) => c.id));
    expect(errors).toEqual([]);
    expect(checks.length).toBe(offeredCheckDefinitions().length);
    expect(scoredCheckCount()).toBe(checks.length);
  });
});
