import { graphGet } from "@/lib/scan/graph";

interface DirectoryAudit {
  activityDateTime?: string;
  initiatedBy?: {
    user?: { userPrincipalName?: string };
    app?: { displayName?: string };
  };
  targetResources?: Array<{ id?: string }>;
}

/**
 * Best-effort actor lookup from Entra directory audit logs.
 *
 * Returns a map of target object id -> actor label for changes since `since`.
 * Requires AuditLog.Read.All; when the app lacks it (or the call fails) we
 * return an empty map and the journal simply shows unattributed changes.
 */
export async function fetchActorsByObjectId(
  token: string,
  since: Date,
): Promise<Map<string, string>> {
  const actors = new Map<string, string>();
  try {
    const iso = since.toISOString();
    const audits = await graphGet<DirectoryAudit>(
      token,
      `/auditLogs/directoryAudits?$filter=activityDateTime ge ${iso}&$top=200`,
    );

    for (const audit of audits) {
      const actor =
        audit.initiatedBy?.user?.userPrincipalName ??
        audit.initiatedBy?.app?.displayName ??
        null;
      if (!actor) continue;
      for (const target of audit.targetResources ?? []) {
        // Later audits win (list is newest-first, so keep the first seen).
        if (target.id && !actors.has(target.id)) actors.set(target.id, actor);
      }
    }
  } catch (err) {
    console.error("[journal] audit log attribution unavailable", err);
  }
  return actors;
}
