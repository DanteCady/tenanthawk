import { graphGet } from "../graph";
import {
  buildCredentialExpiryFindings,
  collectCredentialExpiries,
} from "../credential-expiry";
import type { Check } from "../types";

interface Application {
  displayName?: string;
  passwordCredentials?: Array<{ endDateTime?: string }>;
  keyCredentials?: Array<{ endDateTime?: string }>;
}

export const expiringSecrets: Check = {
  id: "reliability.expiring-secrets",
  category: "reliability",
  async run({ token }) {
    const apps = await graphGet<Application>(
      token,
      "/applications?$select=displayName,passwordCredentials,keyCredentials&$top=100",
    );

    return buildCredentialExpiryFindings(collectCredentialExpiries(apps), {
      checkId: expiringSecrets.id,
      remediation:
        "Rotate expiring credentials in Entra → App registrations → Certificates & secrets before they expire.",
    });
  },
};
