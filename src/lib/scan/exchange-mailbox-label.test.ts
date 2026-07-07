import { describe, expect, it } from "vitest";
import {
  formatMailboxEntityLabel,
  mailboxUsageLabel,
  parseMailboxUsageRow,
} from "./exchange-mailbox-label";

describe("exchange mailbox labels", () => {
  it("labels obfuscated inactive mailbox rows with usage context", () => {
    const row = parseMailboxUsageRow({
      "User Principal Name": "82CB004E94C1149A676E764CFFD7848B",
      "Display Name": "D6E07E263E0B6A10F0B18F2B83760BFE",
      "Is Deleted": "False",
      "Last Activity Date": "2024-01-15",
      "Storage Used (Byte)": "286376854",
      "Item Count": "1042",
      "Has Archive": "False",
    });
    expect(row?.isObfuscated).toBe(true);
    expect(mailboxUsageLabel(row!, "inactive")).toBe(
      "Inactive mailbox · 273 MB · last active 2024-01-15",
    );
  });

  it("labels obfuscated high-storage rows with size and item count", () => {
    const row = parseMailboxUsageRow({
      "User Principal Name": "82CB004E94C1149A676E764CFFD7848B",
      "Display Name": "D6E07E263E0B6A10F0B18F2B83760BFE",
      "Is Deleted": "False",
      "Last Activity Date": "2026-07-01",
      "Storage Used (Byte)": "59055800320",
      "Item Count": "8420",
      "Has Archive": "True",
    });
    expect(mailboxUsageLabel(row!, "storage")).toBe(
      "Mailbox · 55 GB · 8.4k items · archive enabled",
    );
  });

  it("formats legacy hex entities without showing raw tokens", () => {
    expect(formatMailboxEntityLabel("Mailbox (676BBBEB…)")).toBe(
      "Mailbox (identity hidden in usage report)",
    );
    expect(formatMailboxEntityLabel("44CD8F7101583D312DF060E14D633ACE")).toBe(
      "Mailbox (identity hidden in usage report)",
    );
  });

  it("passes through contextual labels stored from new scans", () => {
    expect(
      formatMailboxEntityLabel("Inactive mailbox · 2.1 GB · last active 2023-06-01"),
    ).toBe("Inactive mailbox · 2.1 GB · last active 2023-06-01");
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
