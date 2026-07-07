import { describe, expect, it } from "vitest";
import {
  formatTeamsEntityLabel,
  parseTeamsActivityRow,
  teamsActivityLabel,
} from "./teams-activity-label";

describe("teamsActivityLabel", () => {
  it("labels obfuscated app-only report rows with team type + token", () => {
    const row = parseTeamsActivityRow({
      "Team Id": "00000000-0000-0000-0000-000000000000",
      "Team Name": "44CD8F7101583D312DF060E14D633ACE",
      "Team Type": "Public",
      "Is Deleted": "False",
      "Active Channels": "0",
      Guests: "0",
    });
    expect(row).not.toBeNull();
    expect(teamsActivityLabel(row!)).toBe("Public team (44CD8F71…)");
  });

  it("uses real team name when report is not obfuscated", () => {
    const row = parseTeamsActivityRow({
      "Team Id": "a063d832-ae9a-467d-8cb4-17c073260890",
      "Team Name": "Project Phoenix",
      "Team Type": "Private",
      "Is Deleted": "False",
    });
    expect(teamsActivityLabel(row!)).toBe("Project Phoenix");
  });
});

describe("formatTeamsEntityLabel", () => {
  it("formats legacy raw hex entities from older scans", () => {
    expect(formatTeamsEntityLabel("44CD8F7101583D312DF060E14D633ACE")).toBe(
      "Microsoft Team (44CD8F71…)",
    );
  });
});
