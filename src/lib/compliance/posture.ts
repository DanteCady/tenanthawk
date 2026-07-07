/** Maps scan check IDs to public compliance frameworks (informational, not certification). */

export type ComplianceFramework = "cis" | "nist";

export interface ControlRef {
  id: string;
  title: string;
}

export interface CheckComplianceMap {
  cis: ControlRef[];
  nist: ControlRef[];
}

export const CHECK_COMPLIANCE: Record<string, CheckComplianceMap> = {
  "security.conditional-access": {
    cis: [{ id: "6.1", title: "Establish an access granting process" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "security.legacy-auth": {
    cis: [{ id: "6.8", title: "Define and maintain role-based access control" }],
    nist: [{ id: "IA-2", title: "Identification and Authentication" }],
  },
  "security.mfa-registration": {
    cis: [
      { id: "6.3", title: "Require MFA for externally-exposed applications" },
      { id: "6.5", title: "Require MFA for administrative access" },
    ],
    nist: [{ id: "IA-2(1)", title: "Multi-Factor Authentication" }],
  },
  "security.admin-roles": {
    cis: [{ id: "5.4", title: "Restrict administrator privileges" }],
    nist: [{ id: "AC-6", title: "Least Privilege" }],
  },
  "security.guest-accounts": {
    cis: [{ id: "6.8", title: "Define and maintain role-based access control" }],
    nist: [{ id: "AC-2(1)", title: "Automated System Account Management" }],
  },
  "cost.disabled-user-licenses": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "cost.unused-licenses": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "cost.license-expiry": {
    cis: [{ id: "4.2", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "SA-22", title: "Unsupported System Components" }],
  },
  "reliability.expiring-secrets": {
    cis: [{ id: "4.6", title: "Securely manage enterprise assets and software" }],
    nist: [{ id: "SC-12", title: "Cryptographic Key Establishment and Management" }],
  },
  "reliability.intune-stale-sync": {
    cis: [{ id: "10.5", title: "Enable anti-exploitation features" }],
    nist: [{ id: "SI-4", title: "System Monitoring" }],
  },
  "hygiene.inactive-users": {
    cis: [{ id: "5.3", title: "Disable dormant accounts" }],
    nist: [{ id: "AC-2(3)", title: "Disable Accounts" }],
  },
  "hygiene.disabled-outside-group": {
    cis: [{ id: "6.8", title: "Define and maintain role-based access control" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "hygiene.empty-groups": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.ownerless-groups": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "hygiene.ownerless-teams": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "hygiene.empty-teams": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.stale-teams": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.teams-no-active-channels": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.teams-guest-heavy": {
    cis: [{ id: "6.8", title: "Define and maintain role-based access control" }],
    nist: [{ id: "AC-3", title: "Access Enforcement" }],
  },
  "cost.unused-copilot-licenses": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "hygiene.intune-noncompliant": {
    cis: [{ id: "10.5", title: "Enable anti-exploitation features" }],
    nist: [{ id: "SI-4", title: "System Monitoring" }],
  },
  "hygiene.sharing": {
    cis: [{ id: "3.3", title: "Configure data access control lists" }],
    nist: [{ id: "AC-3", title: "Access Enforcement" }],
  },
  "hygiene.sharepoint-external-sites": {
    cis: [{ id: "3.3", title: "Configure data access control lists" }],
    nist: [{ id: "AC-3", title: "Access Enforcement" }],
  },
  "hygiene.sharepoint-stale-sites": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.sharepoint-high-storage": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "hygiene.sharepoint-empty-sites": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.sharepoint-ownerless-sites": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "hygiene.sharepoint-inactive-files": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.entra-unmanaged-devices": {
    cis: [{ id: "10.5", title: "Enable anti-exploitation features" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "hygiene.intune-ghost-enrollment": {
    cis: [{ id: "10.5", title: "Enable anti-exploitation features" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "hygiene.personal-device-enrolled": {
    cis: [{ id: "10.5", title: "Enable anti-exploitation features" }],
    nist: [{ id: "AC-19", title: "Access Control for Mobile Devices" }],
  },
  "reliability.entra-stale-devices": {
    cis: [{ id: "10.5", title: "Enable anti-exploitation features" }],
    nist: [{ id: "SI-4", title: "System Monitoring" }],
  },
  "hygiene.inactive-mailboxes": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.mailbox-high-storage": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "hygiene.mailbox-forwarding-external": {
    cis: [{ id: "3.3", title: "Configure data access control lists" }],
    nist: [{ id: "AC-4", title: "Information Flow Enforcement" }],
  },
  "hygiene.mailbox-forwarding-enabled": {
    cis: [{ id: "3.3", title: "Configure data access control lists" }],
    nist: [{ id: "AC-4", title: "Information Flow Enforcement" }],
  },
  "cost.inactive-mailbox-licenses": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-8", title: "System Component Inventory" }],
  },
  "reliability.service-principal-secrets": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "IA-5", title: "Authenticator Management" }],
  },
  "security.over-permissioned-apps": {
    cis: [{ id: "3.3", title: "Configure data access control lists" }],
    nist: [{ id: "AC-6", title: "Least Privilege" }],
  },
  "hygiene.unused-enterprise-apps": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "CM-7", title: "Least Functionality" }],
  },
  "hygiene.app-without-owners": {
    cis: [{ id: "5.1", title: "Establish and maintain an inventory of accounts" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "hygiene.enterprise-app-no-owners": {
    cis: [{ id: "5.1", title: "Establish and maintain an inventory of accounts" }],
    nist: [{ id: "AC-2", title: "Account Management" }],
  },
  "security.app-global-admin-role": {
    cis: [{ id: "5.4", title: "Restrict administrator privileges to dedicated accounts" }],
    nist: [{ id: "AC-6", title: "Least Privilege" }],
  },
  "hygiene.multi-tenant-apps": {
    cis: [{ id: "4.1", title: "Establish and maintain a secure configuration process" }],
    nist: [{ id: "AC-3", title: "Access Enforcement" }],
  },
};

export const FRAMEWORK_LABELS: Record<ComplianceFramework, string> = {
  cis: "CIS Controls v8",
  nist: "NIST SP 800-53",
};

export interface ControlPosture {
  id: string;
  title: string;
  framework: ComplianceFramework;
  openFindings: number;
  highFindings: number;
  checkIds: string[];
  findings: Array<{
    id: string;
    title: string;
    severity: "low" | "medium" | "high";
    checkId: string;
  }>;
}

export interface CompliancePostureSummary {
  frameworks: ComplianceFramework[];
  controls: ControlPosture[];
  mappedChecks: number;
  unmappedChecks: number;
}

interface FindingForCompliance {
  id: string;
  check_id: string;
  title: string;
  severity: "low" | "medium" | "high";
}

export function buildCompliancePosture(
  findings: FindingForCompliance[],
): CompliancePostureSummary {
  const byKey = new Map<string, ControlPosture>();
  const seenChecks = new Set<string>();
  let unmapped = 0;

  for (const f of findings) {
    seenChecks.add(f.check_id);
    const map = CHECK_COMPLIANCE[f.check_id];
    if (!map) {
      unmapped += 1;
      continue;
    }

    for (const framework of ["cis", "nist"] as const) {
      for (const ctrl of map[framework]) {
        const key = `${framework}:${ctrl.id}`;
        const existing = byKey.get(key) ?? {
          id: ctrl.id,
          title: ctrl.title,
          framework,
          openFindings: 0,
          highFindings: 0,
          checkIds: [],
          findings: [],
        };
        existing.openFindings += 1;
        if (f.severity === "high") existing.highFindings += 1;
        if (!existing.checkIds.includes(f.check_id)) {
          existing.checkIds.push(f.check_id);
        }
        if (!existing.findings.some((x) => x.id === f.id)) {
          existing.findings.push({
            id: f.id,
            title: f.title,
            severity: f.severity,
            checkId: f.check_id,
          });
        }
        byKey.set(key, existing);
      }
    }
  }

  const controls = [...byKey.values()].sort((a, b) => {
    if (b.highFindings !== a.highFindings) return b.highFindings - a.highFindings;
    return b.openFindings - a.openFindings;
  });

  return {
    frameworks: ["cis", "nist"],
    controls,
    mappedChecks: seenChecks.size - unmapped,
    unmappedChecks: unmapped,
  };
}
