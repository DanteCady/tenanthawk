import { describe, expect, it } from "vitest";
import {
  copilotUsageLabel,
  isCopilotUsageObfuscated,
  parseCopilotUsageRow,
} from "./copilot-usage";

describe("copilot usage report", () => {
  it("detects activity across chat and M365 apps", () => {
    const row = parseCopilotUsageRow({
      "User Principal Name": "jordan@contoso.com",
      "Display Name": "Jordan Lee",
      "Last Activity Date": "2026-06-15",
      "Copilot Chat Last Activity Date": "2026-06-15",
      "Word Copilot Last Activity Date": "",
      "Outlook Copilot Last Activity Date": "2026-06-10",
    });

    expect(row).toMatchObject({
      userPrincipalName: "jordan@contoso.com",
      hasAnyActivity: true,
      hasChatActivity: true,
      hasM365AppActivity: true,
      isObfuscated: false,
    });
    expect(copilotUsageLabel(row!)).toBe("Jordan Lee");
  });

  it("flags chat-only usage", () => {
    const row = parseCopilotUsageRow({
      "User Principal Name": "sam@contoso.com",
      "Display Name": "Sam Patel",
      "Last Activity Date": "2026-06-01",
      "Copilot Chat Last Activity Date": "2026-06-01",
      "Word Copilot Last Activity Date": "",
    });

    expect(row?.hasChatActivity).toBe(true);
    expect(row?.hasM365AppActivity).toBe(false);
  });

  it("treats concealed usage rows as obfuscated", () => {
    const rows = [
      parseCopilotUsageRow({
        "User Principal Name": "82CB004E94C1149A676E764CFFD7848B",
        "Display Name": "D6E07E263E0B6A10F0B18F2B83760BFE",
        "Last Activity Date": "2026-06-01",
      }),
      parseCopilotUsageRow({
        "User Principal Name": "A1B2C3D4E5F60718293A4B5C6D7E8F90",
        "Display Name": "F0E1D2C3B4A5968778695A4B3C2D1E0F",
        "Last Activity Date": "2026-06-02",
      }),
    ].filter((row) => row !== null);

    expect(isCopilotUsageObfuscated(rows)).toBe(true);
    expect(rows[0]?.userPrincipalName).toBe("");
  });
});
