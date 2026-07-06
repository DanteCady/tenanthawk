/** High-risk Microsoft Graph application/delegated permission scope values. */
export const RISKY_GRAPH_SCOPES = new Set([
  "Directory.ReadWrite.All",
  "Directory.Read.All",
  "RoleManagement.ReadWrite.Directory",
  "RoleManagement.Read.Directory",
  "Mail.ReadWrite",
  "Mail.ReadWrite.Shared",
  "Mail.ReadWrite.All",
  "Files.ReadWrite.All",
  "Sites.ReadWrite.All",
  "User.ReadWrite.All",
  "Application.ReadWrite.All",
  "AppRoleAssignment.ReadWrite.All",
  "Group.ReadWrite.All",
  "Device.ReadWrite.All",
]);

export function isRiskyGraphScope(scope: string): boolean {
  const normalized = scope.trim();
  if (RISKY_GRAPH_SCOPES.has(normalized)) return true;
  return normalized.endsWith(".ReadWrite.All");
}
