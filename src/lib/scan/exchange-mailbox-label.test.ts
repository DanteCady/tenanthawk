import { describe, expect, it } from "vitest";
import {
  formatMailboxEntityLabel,
  mailboxUsageLabel,
  parseMailboxUsageRow,
} from "./exchange-mailbox-label";

describe("exchange mailbox labels", () => {
  it("labels obfuscated mailbox report rows", () => {
    const row = parseMailboxUsageRow({
      "User Principal Name": "82CB004E94C1149A676E764CFFD7848B",
      "Display Name": "D6E07E263E0B6A10F0B18F2B83760BFE",
      "Is Deleted": "False",
      "Last Activity Date": "2026-07-01",
      "Storage Used (Byte)": "286376854",
      "Item Count": "10",
      "Has Archive": "False",
    });
    expect(row?.isObfuscated).toBe(true);
    expect(mailboxUsageLabel(row!)).toBe("Mailbox (D6E07E26…)");
  });

  it("formats legacy hex entities in the UI", () => {
    expect(formatMailboxEntityLabel("44CD8F7101583D312DF060E14D633ACE")).toBe(
      "Mailbox (44CD8F71…)",
    );
  });

  it("uses real UPN when report is not obfuscated", () => {
    const row = parseMailboxUsageRow({
      "User Principal Name": "alex@contoso.com",
      "Display Name": "Alex Morgan",
      "Is Deleted": "False",
    });
    expect(mailboxUsageLabel(row!)).toBe("Alex Morgan");
  });
});
