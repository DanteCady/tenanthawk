export interface PortalLink {
  label: string;
  href: string;
}

export interface PowerShellSnippet {
  label: string;
  script: string;
}

const ENTRA = "https://entra.microsoft.com";
const M365 = "https://admin.microsoft.com";
const INTUNE = "https://intune.microsoft.com";

const PORTAL_LINKS: Record<string, PortalLink[]> = {
  "security.conditional-access": [
    {
      label: "Conditional Access policies",
      href: `${ENTRA}/#view/Microsoft_AAD_ConditionalAccess/ConditionalAccessBlade/~/Policies`,
    },
  ],
  "security.legacy-auth": [
    {
      label: "Authentication methods",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/AdminAuthMethods`,
    },
    {
      label: "Sign-in logs",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/SignInBlade`,
    },
  ],
  "security.mfa-registration": [
    {
      label: "Per-user MFA",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/MultifactorAuthenticationMenuBlade/~/BulkUpdate`,
    },
    {
      label: "Authentication methods",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/AuthenticationMethodsMenuBlade/~/AdminAuthMethods`,
    },
  ],
  "security.admin-roles": [
    {
      label: "Privileged roles",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/RolesManagementMenuBlade/~/AllRoles`,
    },
  ],
  "security.guest-accounts": [
    {
      label: "All users (filter guests)",
      href: `${ENTRA}/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers`,
    },
    {
      label: "External collaboration",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/CompanyRelationshipsMenuBlade/~/Settings`,
    },
  ],
  "cost.disabled-user-licenses": [
    {
      label: "Active users & licenses",
      href: `${M365}/Adminportal/Home#/users`,
    },
  ],
  "cost.unused-licenses": [
    {
      label: "Licenses & subscriptions",
      href: `${M365}/Adminportal/Home#/subscriptions`,
    },
  ],
  "cost.license-expiry": [
    {
      label: "Billing subscriptions",
      href: `${M365}/Adminportal/Home#/subscriptions`,
    },
  ],
  "reliability.expiring-secrets": [
    {
      label: "App registrations",
      href: `${ENTRA}/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade`,
    },
  ],
  "reliability.intune-stale-sync": [
    {
      label: "Intune devices",
      href: `${INTUNE}/#view/Microsoft_Intune_Devices/DevicesMenu`,
    },
  ],
  "hygiene.inactive-users": [
    {
      label: "All users",
      href: `${ENTRA}/#view/Microsoft_AAD_UsersAndTenants/UserManagementMenuBlade/~/AllUsers`,
    },
  ],
  "hygiene.disabled-outside-group": [
    {
      label: "Groups",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/GroupsManagementMenuBlade/~/AllGroups`,
    },
  ],
  "hygiene.empty-groups": [
    {
      label: "Groups",
      href: `${ENTRA}/#view/Microsoft_AAD_IAM/GroupsManagementMenuBlade/~/AllGroups`,
    },
  ],
  "hygiene.intune-noncompliant": [
    {
      label: "Device compliance",
      href: `${INTUNE}/#view/Microsoft_Intune_DeviceSettings/DevicesMenu/~/overview`,
    },
  ],
  "hygiene.sharing": [
    {
      label: "SharePoint admin",
      href: `${M365}/sharepoint`,
    },
  ],
};

const POWERSHELL_SNIPPETS: Record<string, PowerShellSnippet> = {
  "cost.unused-licenses": {
    label: "List disabled users with licenses",
    script: `Connect-MgGraph -Scopes "User.Read.All"\nGet-MgUser -Filter "accountEnabled eq false" -All |\n  Where-Object { $_.AssignedLicenses.Count -gt 0 } |\n  Select-Object DisplayName, UserPrincipalName, @{N='Licenses';E={$_.AssignedLicenses.Count}}`,
  },
  "cost.disabled-user-licenses": {
    label: "List disabled users with licenses",
    script: `Connect-MgGraph -Scopes "User.Read.All"\nGet-MgUser -Filter "accountEnabled eq false" -All |\n  Where-Object { $_.AssignedLicenses.Count -gt 0 } |\n  Select-Object DisplayName, UserPrincipalName`,
  },
  "security.admin-roles": {
    label: "List Global Administrator members",
    script: `Connect-MgGraph -Scopes "RoleManagement.Read.Directory"\n$role = Get-MgDirectoryRole -Filter "displayName eq 'Global Administrator'"\nGet-MgDirectoryRoleMember -DirectoryRoleId $role.Id |\n  Select-Object DisplayName, UserPrincipalName`,
  },
  "hygiene.inactive-users": {
    label: "Users inactive 90+ days",
    script: `Connect-MgGraph -Scopes "User.Read.All"\n$cutoff = (Get-Date).AddDays(-90).ToUniversalTime().ToString("o")\nGet-MgUser -Filter "accountEnabled eq true" -All |\n  Where-Object { $_.SignInActivity.LastSignInDateTime -lt $cutoff } |\n  Select-Object DisplayName, UserPrincipalName, SignInActivity`,
  },
  "reliability.expiring-secrets": {
    label: "App secrets expiring in 30 days",
    script: `Connect-MgGraph -Scopes "Application.Read.All"\n$soon = (Get-Date).AddDays(30)\nGet-MgApplication -All |\n  ForEach-Object { $_.PasswordCredentials } |\n  Where-Object { $_.EndDateTime -lt $soon } |\n  Select-Object DisplayName, EndDateTime`,
  },
};

export function getPortalLinksForCheck(checkId: string): PortalLink[] {
  return PORTAL_LINKS[checkId] ?? [];
}

export function getPowerShellForCheck(checkId: string): PowerShellSnippet | null {
  return POWERSHELL_SNIPPETS[checkId] ?? null;
}
