import type { Severity } from "@/db/types";
import { graphGet } from "../graph";
import { isRiskyGraphScope } from "../constants/risky-permissions";
import {
  buildCredentialExpiryFindings,
  collectCredentialExpiries,
} from "../credential-expiry";
import type { Check, FindingDraft } from "../types";

export { expiringSecrets } from "./reliability";

const DAY = 86_400_000;
const MS_PUBLISHER = "Microsoft Corporation";
const GLOBAL_ADMIN_ROLE_TEMPLATE = "62e90394-69f5-4237-9190-012177145e10";
const SIGN_IN_LOOKBACK_DAYS = 90;
const SIGN_IN_PAGE_CAP = 5;

interface Credential {
  endDateTime?: string;
}

interface DirectoryObject {
  id?: string;
  displayName?: string;
  "@odata.type"?: string;
}

interface Application {
  id?: string;
  displayName?: string;
  signInAudience?: string;
  passwordCredentials?: Credential[];
  keyCredentials?: Credential[];
  owners?: DirectoryObject[];
}

interface ServicePrincipal {
  id?: string;
  appId?: string;
  displayName?: string;
  publisherName?: string;
  accountEnabled?: boolean;
  passwordCredentials?: Credential[];
  keyCredentials?: Credential[];
  owners?: DirectoryObject[];
}

interface OAuth2PermissionGrant {
  clientId?: string;
  scope?: string;
  consentType?: string;
}

interface SignInRow {
  appId?: string;
}

function severityFromCount(
  count: number,
  thresholds: { medium: number; high: number },
): Severity {
  if (count >= thresholds.high) return "high";
  if (count >= thresholds.medium) return "medium";
  return "low";
}

function aggregateFinding(
  checkId: string,
  category: FindingDraft["category"],
  count: number,
  entities: string[],
  opts: {
    noun: string;
    description: string;
    remediation: string;
    severity: Severity;
  },
): FindingDraft[] {
  if (count === 0) return [];

  return [
    {
      category,
      checkId,
      severity: opts.severity,
      title: `${count} ${opts.noun}`,
      description: opts.description,
      impact: { count, entities: entities.slice(0, 15) },
      remediation: opts.remediation,
    },
  ];
}

function isFirstPartyPrincipal(sp: ServicePrincipal): boolean {
  return sp.publisherName === MS_PUBLISHER;
}

function hasCredentials(item: {
  passwordCredentials?: Credential[];
  keyCredentials?: Credential[];
}): boolean {
  return (
    (item.passwordCredentials?.length ?? 0) > 0 ||
    (item.keyCredentials?.length ?? 0) > 0
  );
}

function collectExpiringCredentials(
  items: Array<{
    displayName?: string;
    passwordCredentials?: Credential[];
    keyCredentials?: Credential[];
  }>,
): FindingDraft[] {
  return buildCredentialExpiryFindings(collectCredentialExpiries(items), {
    checkId: servicePrincipalSecretsCheck.id,
    remediation:
      "Rotate expiring credentials in Entra → Enterprise applications → Certificates & secrets before they expire.",
  });
}

async function fetchRecentSignInAppIds(token: string): Promise<Set<string>> {
  const since = new Date(Date.now() - SIGN_IN_LOOKBACK_DAYS * DAY).toISOString();
  const appIds = new Set<string>();
  let url: string | undefined =
    `https://graph.microsoft.com/v1.0/auditLogs/signIns?$filter=createdDateTime ge ${since}&$select=appId&$top=999`;
  let pages = 0;

  while (url && pages < SIGN_IN_PAGE_CAP) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Graph ${res.status} for signIns`);
    const data = (await res.json()) as {
      value?: SignInRow[];
      "@odata.nextLink"?: string;
    };
    for (const row of data.value ?? []) {
      if (row.appId) appIds.add(row.appId.toLowerCase());
    }
    url = data["@odata.nextLink"];
    pages += 1;
  }

  return appIds;
}

async function fetchServicePrincipals(token: string): Promise<ServicePrincipal[]> {
  return graphGet<ServicePrincipal>(
    token,
    "/servicePrincipals?$select=id,appId,displayName,publisherName,accountEnabled,passwordCredentials,keyCredentials&$top=999",
  );
}

async function fetchApplications(token: string): Promise<Application[]> {
  return graphGet<Application>(
    token,
    "/applications?$select=id,displayName,signInAudience,passwordCredentials,keyCredentials&$expand=owners($select=id)&$top=999",
  );
}

export const servicePrincipalSecretsCheck: Check = {
  id: "reliability.service-principal-secrets",
  category: "reliability",
  async run({ token }) {
    const principals = await fetchServicePrincipals(token);
    const credentialed = principals.filter(
      (sp) => !isFirstPartyPrincipal(sp) && hasCredentials(sp),
    );
    return collectExpiringCredentials(credentialed);
  },
};

export const overPermissionedAppsCheck: Check = {
  id: "security.over-permissioned-apps",
  category: "security",
  async run({ token }) {
    const [grants, principals] = await Promise.all([
      graphGet<OAuth2PermissionGrant>(
        token,
        "/oauth2PermissionGrants?$select=clientId,scope,consentType&$top=999",
      ),
      fetchServicePrincipals(token),
    ]);

    const spById = new Map(
      principals.filter((sp) => sp.id).map((sp) => [sp.id as string, sp]),
    );

    const risky = new Map<string, string>();
    for (const grant of grants) {
      if (!grant.clientId || !grant.scope) continue;
      const scopes = grant.scope.split(/\s+/).filter(Boolean);
      if (!scopes.some(isRiskyGraphScope)) continue;
      const sp = spById.get(grant.clientId);
      if (!sp || isFirstPartyPrincipal(sp)) continue;
      risky.set(sp.id ?? grant.clientId, sp.displayName ?? "Unknown app");
    }

    const entities = [...risky.values()];
    return aggregateFinding(
      overPermissionedAppsCheck.id,
      "security",
      entities.length,
      entities,
      {
        noun: entities.length === 1 ? "over-permissioned enterprise app" : "over-permissioned enterprise apps",
        description: `${entities.length} enterprise app${entities.length === 1 ? "" : "s"} grant delegated permissions that include high-risk Microsoft Graph scopes.`,
        remediation:
          "Review admin-consented permissions in Entra → Enterprise applications and remove unnecessary Graph scopes.",
        severity: severityFromCount(entities.length, { medium: 2, high: 5 }),
      },
    );
  },
};

export const unusedEnterpriseAppsCheck: Check = {
  id: "hygiene.unused-enterprise-apps",
  category: "hygiene",
  async run({ token }) {
    const [principals, activeAppIds] = await Promise.all([
      fetchServicePrincipals(token),
      fetchRecentSignInAppIds(token).catch(() => new Set<string>()),
    ]);

    const unused = principals.filter((sp) => {
      if (!sp.appId || isFirstPartyPrincipal(sp)) return false;
      if (sp.accountEnabled === false) return false;
      if (!hasCredentials(sp)) return false;
      return !activeAppIds.has(sp.appId.toLowerCase());
    });

    return aggregateFinding(
      unusedEnterpriseAppsCheck.id,
      "hygiene",
      unused.length,
      unused.map((sp) => sp.displayName ?? sp.appId ?? "Unknown app"),
      {
        noun: unused.length === 1 ? "unused enterprise app" : "unused enterprise apps",
        description: `${unused.length} credentialed enterprise app${unused.length === 1 ? "" : "s"} had no sign-in activity in the last ${SIGN_IN_LOOKBACK_DAYS} days.`,
        remediation:
          "Disable or remove unused enterprise applications and rotate stale credentials in Entra → Enterprise applications.",
        severity: severityFromCount(unused.length, { medium: 3, high: 8 }),
      },
    );
  },
};

export const appWithoutOwnersCheck: Check = {
  id: "hygiene.app-without-owners",
  category: "hygiene",
  async run({ token }) {
    const apps = await fetchApplications(token);
    const ownerless = apps.filter((app) => (app.owners?.length ?? 0) === 0);

    return aggregateFinding(
      appWithoutOwnersCheck.id,
      "hygiene",
      ownerless.length,
      ownerless.map((app) => app.displayName ?? "Unknown app"),
      {
        noun: ownerless.length === 1 ? "ownerless app registration" : "ownerless app registrations",
        description: `${ownerless.length} app registration${ownerless.length === 1 ? "" : "s"} have no assigned owners.`,
        remediation:
          "Assign at least two owners to each app registration in Entra → App registrations.",
        severity: severityFromCount(ownerless.length, { medium: 5, high: 15 }),
      },
    );
  },
};

export const enterpriseAppNoOwnersCheck: Check = {
  id: "hygiene.enterprise-app-no-owners",
  category: "hygiene",
  async run({ token }) {
    const principals = await graphGet<ServicePrincipal>(
      token,
      "/servicePrincipals?$select=id,displayName,publisherName&$expand=owners($select=id)&$top=999",
    );

    const ownerless = principals.filter(
      (sp) => !isFirstPartyPrincipal(sp) && (sp.owners?.length ?? 0) === 0,
    );

    return aggregateFinding(
      enterpriseAppNoOwnersCheck.id,
      "hygiene",
      ownerless.length,
      ownerless.map((sp) => sp.displayName ?? "Unknown app"),
      {
        noun: ownerless.length === 1 ? "ownerless enterprise app" : "ownerless enterprise apps",
        description: `${ownerless.length} enterprise app${ownerless.length === 1 ? "" : "s"} have no assigned owners.`,
        remediation:
          "Assign owners to enterprise applications in Entra → Enterprise applications → Owners.",
        severity: severityFromCount(ownerless.length, { medium: 3, high: 10 }),
      },
    );
  },
};

export const appGlobalAdminRoleCheck: Check = {
  id: "security.app-global-admin-role",
  category: "security",
  async run({ token }) {
    const roles = await graphGet<{ id?: string }>(
      token,
      `/directoryRoles?$filter=roleTemplateId eq '${GLOBAL_ADMIN_ROLE_TEMPLATE}'&$select=id`,
    );
    const roleId = roles[0]?.id;
    if (!roleId) return [];

    const members = await graphGet<DirectoryObject>(
      token,
      `/directoryRoles/${roleId}/members?$select=id,displayName`,
    );

    const servicePrincipals = members.filter((member) =>
      member["@odata.type"]?.includes("servicePrincipal"),
    );

    return aggregateFinding(
      appGlobalAdminRoleCheck.id,
      "security",
      servicePrincipals.length,
      servicePrincipals.map((sp) => sp.displayName ?? "Unknown app"),
      {
        noun:
          servicePrincipals.length === 1
            ? "enterprise app with Global Administrator"
            : "enterprise apps with Global Administrator",
        description: `${servicePrincipals.length} service principal${servicePrincipals.length === 1 ? "" : "s"} hold the Global Administrator directory role.`,
        remediation:
          "Remove standing Global Administrator role assignments from applications and use least-privilege app roles with PIM where possible.",
        severity: servicePrincipals.length > 0 ? "high" : "low",
      },
    );
  },
};

export const multiTenantAppsCheck: Check = {
  id: "hygiene.multi-tenant-apps",
  category: "hygiene",
  async run({ token }) {
    const apps = await fetchApplications(token);
    const multiTenant = apps.filter(
      (app) =>
        app.signInAudience === "AzureADMultipleOrgs" &&
        hasCredentials(app),
    );

    return aggregateFinding(
      multiTenantAppsCheck.id,
      "hygiene",
      multiTenant.length,
      multiTenant.map((app) => app.displayName ?? "Unknown app"),
      {
        noun: multiTenant.length === 1 ? "multi-tenant app with credentials" : "multi-tenant apps with credentials",
        description: `${multiTenant.length} multi-tenant app registration${multiTenant.length === 1 ? "" : "s"} have active secrets or certificates configured.`,
        remediation:
          "Review multi-tenant app registrations and prefer single-tenant apps with managed identities or federated credentials where possible.",
        severity: severityFromCount(multiTenant.length, { medium: 1, high: 3 }),
      },
    );
  },
};
