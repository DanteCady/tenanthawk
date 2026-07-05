import { graphGet } from "@/lib/scan/graph";
import type { SourceResult, TrackedObject, TrackedObjectType } from "./types";

interface GraphObject {
  id?: string;
  displayName?: string;
  [key: string]: unknown;
}

interface SourceDef {
  objectType: TrackedObjectType;
  path: string;
  /** Singleton endpoints return one object without a collection wrapper. */
  singleton?: boolean;
  displayName?: (o: GraphObject) => string | null;
}

/**
 * Object families the journal watches. All read-only, all within the scopes
 * the scan engine already consents to (Policy.Read.All, DeviceManagementConfiguration.Read.All).
 */
const SOURCES: SourceDef[] = [
  { objectType: "ca_policy", path: "/identity/conditionalAccess/policies" },
  { objectType: "named_location", path: "/identity/conditionalAccess/namedLocations" },
  {
    objectType: "authorization_policy",
    path: "/policies/authorizationPolicy",
    singleton: true,
    displayName: () => "Authorization policy",
  },
  {
    objectType: "auth_methods_policy",
    path: "/policies/authenticationMethodsPolicy",
    singleton: true,
    displayName: () => "Authentication methods policy",
  },
  { objectType: "intune_compliance_policy", path: "/deviceManagement/deviceCompliancePolicies" },
  { objectType: "intune_device_configuration", path: "/deviceManagement/deviceConfigurations" },
];

function toTracked(def: SourceDef, o: GraphObject): TrackedObject | null {
  const objectId = o.id ?? (def.singleton ? def.objectType : null);
  if (!objectId) return null;
  return {
    objectType: def.objectType,
    objectId,
    displayName: def.displayName?.(o) ?? o.displayName ?? null,
    payload: o as Record<string, unknown>,
  };
}

/** Fetch every tracked family; failures are per-family, never fatal. */
export async function fetchTrackedObjects(token: string): Promise<SourceResult[]> {
  return Promise.all(
    SOURCES.map(async (def): Promise<SourceResult> => {
      try {
        const raw = await graphGet<GraphObject>(token, def.path);
        const objects = raw
          .map((o) => toTracked(def, o))
          .filter((o): o is TrackedObject => o !== null);
        return { objectType: def.objectType, ok: true, objects };
      } catch (err) {
        console.error(`[journal] source failed: ${def.objectType}`, err);
        return { objectType: def.objectType, ok: false, objects: [] };
      }
    }),
  );
}
