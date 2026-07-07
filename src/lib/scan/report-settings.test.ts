import { describe, expect, it } from "vitest";
import {
  inferReportConcealmentFromUsageReports,
  reportConcealmentFromCoverageNotes,
} from "./report-settings.shared";

describe("reportConcealmentFromCoverageNotes", () => {
  it("maps concealed tenant setting", () => {
    expect(
      reportConcealmentFromCoverageNotes({
        sectors: ["exchange"],
        offeredChecks: 1,
        scanMode: "standard",
        reportDisplayConcealedNames: true,
        reportSettingsReadable: true,
      }),
    ).toEqual({
      state: "concealed",
      readable: true,
      source: "scan",
    });
  });

  it("maps visible tenant setting", () => {
    expect(
      reportConcealmentFromCoverageNotes({
        sectors: ["exchange"],
        offeredChecks: 1,
        scanMode: "standard",
        reportDisplayConcealedNames: false,
        reportSettingsReadable: true,
      }).state,
    ).toBe("visible");
  });

  it("returns unknown when concealment was not determined", () => {
    expect(reportConcealmentFromCoverageNotes(null).state).toBe("unknown");
    expect(
      reportConcealmentFromCoverageNotes({
        sectors: [],
        offeredChecks: 0,
        scanMode: "standard",
        reportSettingsReadable: false,
      }).state,
    ).toBe("unknown");
  });
});

describe("inferReportConcealmentFromUsageReports", () => {
  it("detects concealed tenant from obfuscated mailbox usage rows", () => {
    expect(
      inferReportConcealmentFromUsageReports({
        mailboxUsage: [
          { isObfuscated: true },
          { isObfuscated: true },
        ],
      })?.state,
    ).toBe("concealed");
  });

  it("detects visible tenant from unobfuscated mailbox usage rows", () => {
    expect(
      inferReportConcealmentFromUsageReports({
        mailboxUsage: [{ isObfuscated: false }],
      })?.state,
    ).toBe("visible");
  });

  it("returns null when no usage report samples are available", () => {
    expect(inferReportConcealmentFromUsageReports({})).toBeNull();
  });
});
