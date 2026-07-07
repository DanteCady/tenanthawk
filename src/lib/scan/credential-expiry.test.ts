import { describe, expect, it } from "vitest";
import {
  buildCredentialExpiryFindings,
  collectCredentialExpiries,
} from "./credential-expiry";

describe("credential expiry grouping", () => {
  it("groups multiple expired secrets on one app", () => {
    const items = collectCredentialExpiries([
      {
        displayName: "P2P Server",
        passwordCredentials: [
          { endDateTime: "2025-01-01T00:00:00Z" },
          { endDateTime: "2025-02-01T00:00:00Z" },
          { endDateTime: "2025-03-01T00:00:00Z" },
        ],
      },
    ]);

    const findings = buildCredentialExpiryFindings(items, {
      checkId: "reliability.expiring-secrets",
      remediation: "Rotate secrets",
    });

    expect(findings).toHaveLength(1);
    expect(findings[0].title).toBe("3 expired secrets on P2P Server");
    expect(findings[0].impact?.entities).toHaveLength(3);
  });

  it("keeps expiring secrets and certificates separate", () => {
    const future = new Date(Date.now() + 20 * 86_400_000).toISOString();
    const items = collectCredentialExpiries([
      {
        displayName: "P2P Server",
        passwordCredentials: [{ endDateTime: future }],
        keyCredentials: [{ endDateTime: future }],
      },
    ]);

    const findings = buildCredentialExpiryFindings(items, {
      checkId: "reliability.expiring-secrets",
      remediation: "Rotate credentials",
    });

    expect(findings).toHaveLength(2);
  });
});
