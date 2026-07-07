import { describe, expect, it } from "vitest";
import {
  dedupeSharePointSites,
  formatSharePointEntityLabel,
  isObfuscatedReportToken,
  sharePointSiteLabel,
} from "./sharepoint-site-label";
import type { SharePointSiteRow } from "./prefetch";

const base: SharePointSiteRow = {
  siteId: "00000000-0000-0000-0000-000000000000",
  reportSiteKey: "D86B84272437349ED168F20E2582FBE5",
  siteUrl: "",
  rootWebTemplate: "Group",
  ownerDisplayName: "D86B84272437349ED168F20E2582FBE5",
  ownerPrincipalName: "BA8A73D80A9D85BC25809C6B1F45CE06",
  lastActivityDate: null,
  fileCount: 0,
  activeFileCount: 0,
  pageViewCount: 0,
  storageUsedBytes: 0,
  isDeleted: false,
  externalSharing: null,
};

describe("sharePointSiteLabel", () => {
  it("labels obfuscated app-only report rows with template + token", () => {
    expect(sharePointSiteLabel(base)).toBe(
      "Microsoft 365 group site (D86B8427…)",
    );
  });

  it("extracts site name from real URLs when present", () => {
    expect(
      sharePointSiteLabel({
        ...base,
        siteId: "abc",
        reportSiteKey: "abc",
        siteUrl: "https://contoso.sharepoint.com/sites/Legacy-Project",
        ownerDisplayName: "Real Owners",
        rootWebTemplate: "Team Site",
      }),
    ).toBe("Legacy-Project");
  });
});

describe("formatSharePointEntityLabel", () => {
  it("formats legacy raw hex entities from older scans", () => {
    expect(formatSharePointEntityLabel("D86B84272437349ED168F20E2582FBE5")).toBe(
      "SharePoint site (D86B8427…)",
    );
    expect(formatSharePointEntityLabel("/")).toBe("SharePoint site (unknown)");
  });
});

describe("dedupeSharePointSites", () => {
  it("keeps separate rows when same token has different templates", () => {
    const rows = dedupeSharePointSites([
      { ...base, rootWebTemplate: "Team Site" },
      { ...base, rootWebTemplate: "My Site Host" },
    ]);
    expect(rows).toHaveLength(2);
  });
});

describe("isObfuscatedReportToken", () => {
  it("detects hex pseudonyms from Graph reports", () => {
    expect(isObfuscatedReportToken("D86B84272437349ED168F20E2582FBE5")).toBe(true);
    expect(isObfuscatedReportToken("Finance Team Owners")).toBe(false);
  });
});
