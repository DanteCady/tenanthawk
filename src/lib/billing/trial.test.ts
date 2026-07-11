import { describe, expect, it } from "vitest";
import {
  isTrialActive,
  TRIAL_DAYS,
  TRIAL_LAUNCH_DATE,
  trialDaysLeft,
  trialEndsAt,
} from "./trial";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("trial window", () => {
  it("runs TRIAL_DAYS from account creation for new users", () => {
    const created = new Date(TRIAL_LAUNCH_DATE.getTime() + 30 * DAY_MS);
    expect(trialEndsAt(created).getTime()).toBe(
      created.getTime() + TRIAL_DAYS * DAY_MS,
    );
    expect(isTrialActive(created, new Date(created.getTime() + DAY_MS))).toBe(true);
    expect(
      isTrialActive(created, new Date(created.getTime() + (TRIAL_DAYS + 1) * DAY_MS)),
    ).toBe(false);
  });

  it("grandfathers pre-launch accounts from the launch date", () => {
    const created = new Date(TRIAL_LAUNCH_DATE.getTime() - 90 * DAY_MS);
    expect(trialEndsAt(created).getTime()).toBe(
      TRIAL_LAUNCH_DATE.getTime() + TRIAL_DAYS * DAY_MS,
    );
  });

  it("counts remaining days rounded up and clamps at zero", () => {
    const created = new Date(TRIAL_LAUNCH_DATE.getTime() + 30 * DAY_MS);
    const halfDayBeforeEnd = new Date(
      trialEndsAt(created).getTime() - 0.5 * DAY_MS,
    );
    expect(trialDaysLeft(created, halfDayBeforeEnd)).toBe(1);
    const afterEnd = new Date(trialEndsAt(created).getTime() + DAY_MS);
    expect(trialDaysLeft(created, afterEnd)).toBe(0);
  });
});
