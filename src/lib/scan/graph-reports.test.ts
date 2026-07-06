import { describe, expect, it } from "vitest";
import { parseReportCsv } from "./graph-reports";

describe("parseReportCsv", () => {
  it("parses header and rows", () => {
    const csv = "User Principal Name,Last Activity Date\nalice@contoso.com,2026-01-01\nbob@contoso.com,2026-01-02";
    const rows = parseReportCsv<{ "User Principal Name": string; "Last Activity Date": string }>(csv);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.["User Principal Name"]).toBe("alice@contoso.com");
    expect(rows[1]?.["Last Activity Date"]).toBe("2026-01-02");
  });

  it("strips UTF-8 BOM", () => {
    const csv = "\uFEFFReport Date,Total\n2026-01-01,5";
    const rows = parseReportCsv<{ "Report Date": string; Total: string }>(csv);
    expect(rows[0]?.["Report Date"]).toBe("2026-01-01");
  });

  it("handles quoted fields with commas", () => {
    const csv = 'Name,Notes\n"Team, Alpha",ok';
    const rows = parseReportCsv<{ Name: string; Notes: string }>(csv);
    expect(rows[0]?.Name).toBe("Team, Alpha");
  });

  it("returns empty array for blank input", () => {
    expect(parseReportCsv("")).toEqual([]);
    expect(parseReportCsv("OnlyHeader")).toEqual([]);
  });
});
