import type { ConfigChangeType, ConfigFieldDiff } from "@/db/types";

/** Object families the journal tracks. Adding a type = add a source + a label. */
export type TrackedObjectType =
  | "ca_policy"
  | "named_location"
  | "authorization_policy"
  | "auth_methods_policy"
  | "intune_compliance_policy"
  | "intune_device_configuration";

export const TRACKED_OBJECT_LABELS: Record<TrackedObjectType, string> = {
  ca_policy: "Conditional Access policy",
  named_location: "Named location",
  authorization_policy: "Authorization policy",
  auth_methods_policy: "Authentication methods policy",
  intune_compliance_policy: "Intune compliance policy",
  intune_device_configuration: "Intune configuration profile",
};

/** A raw config object fetched from Graph (or the demo tenant). */
export interface TrackedObject {
  objectType: TrackedObjectType;
  objectId: string;
  displayName: string | null;
  payload: Record<string, unknown>;
}

/** Result of fetching one object family. Failed families are skipped entirely
 *  so a permission error is never misread as "everything was deleted". */
export interface SourceResult {
  objectType: TrackedObjectType;
  ok: boolean;
  objects: TrackedObject[];
}

export interface JournalChangeDraft {
  objectType: TrackedObjectType;
  objectId: string;
  displayName: string | null;
  changeType: ConfigChangeType;
  diff: ConfigFieldDiff[] | null;
  beforePayload: Record<string, unknown> | null;
  afterPayload: Record<string, unknown> | null;
  actor: string | null;
  actorSource: "audit_log" | "demo" | null;
}
