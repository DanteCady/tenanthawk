import { graphGet } from "../graph";
import type { Check, FindingDraft } from "../types";

interface Credential {
  endDateTime?: string;
}
interface Application {
  displayName?: string;
  passwordCredentials?: Credential[];
  keyCredentials?: Credential[];
}

const DAY = 86_400_000;

export const expiringSecrets: Check = {
  id: "reliability.expiring-secrets",
  category: "reliability",
  async run({ token }) {
    const apps = await graphGet<Application>(
      token,
      "/applications?$select=displayName,passwordCredentials,keyCredentials&$top=100",
    );
    const findings: FindingDraft[] = [];
    const now = Date.now();

    for (const app of apps) {
      const creds = [
        ...(app.passwordCredentials ?? []).map((c) => ({ ...c, kind: "secret" })),
        ...(app.keyCredentials ?? []).map((c) => ({ ...c, kind: "certificate" })),
      ];
      for (const c of creds) {
        if (!c.endDateTime) continue;
        const days = Math.round((new Date(c.endDateTime).getTime() - now) / DAY);
        const name = app.displayName ?? "Unknown app";
        if (days < 0) {
          findings.push({
            category: "reliability",
            checkId: expiringSecrets.id,
            severity: "high",
            title: `Expired ${c.kind} on ${name}`,
            description: `A ${c.kind} expired ${Math.abs(days)} days ago and may already be breaking sign-in or integrations.`,
            remediation: `Rotate the ${c.kind} in Entra → App registrations → ${name} → Certificates & secrets.`,
            entityRef: name,
            impact: {
              daysUntil: days,
              expiresAt: c.endDateTime,
            },
          });
        } else if (days <= 30) {
          findings.push({
            category: "reliability",
            checkId: expiringSecrets.id,
            severity: days <= 7 ? "high" : "medium",
            title: `${c.kind} on ${name} expires in ${days}d`,
            description: `A ${c.kind} for ${name} expires in ${days} days. Integrations using it will fail at expiry.`,
            impact: {
              count: 1,
              daysUntil: days,
              expiresAt: c.endDateTime,
            },
            remediation: `Rotate the ${c.kind} before it expires in Entra → App registrations → ${name}.`,
            entityRef: name,
          });
        }
      }
    }
    return findings;
  },
};
