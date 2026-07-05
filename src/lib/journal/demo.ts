import type { SourceResult, TrackedObject } from "./types";

/**
 * Demo tenant for the journal: a small set of realistic config objects that
 * evolves one scripted step per scan, so rescanning in demo mode builds a
 * believable change timeline (state flips, IP range edits, new policies).
 */

type DemoState = Record<string, TrackedObject>;

function caPolicy(
  id: string,
  displayName: string,
  state: string,
  extra?: Partial<Record<string, unknown>>,
): TrackedObject {
  return {
    objectType: "ca_policy",
    objectId: id,
    displayName,
    payload: {
      id,
      displayName,
      state,
      conditions: {
        users: { includeUsers: ["All"], excludeUsers: ["break-glass@contoso.com"] },
        applications: { includeApplications: ["All"] },
        clientAppTypes: ["browser", "mobileAppsAndDesktopClients"],
      },
      grantControls: { operator: "OR", builtInControls: ["mfa"] },
      ...extra,
    },
  };
}

function baseline(): DemoState {
  const objects: TrackedObject[] = [
    caPolicy("demo-ca-1", "Require MFA for admins", "enabled"),
    caPolicy("demo-ca-2", "Block legacy authentication", "enabled"),
    caPolicy("demo-ca-3", "Require compliant device for Exchange", "enabledForReportingButNotEnforced"),
    {
      objectType: "named_location",
      objectId: "demo-loc-1",
      displayName: "HQ Office",
      payload: {
        id: "demo-loc-1",
        displayName: "HQ Office",
        isTrusted: true,
        ipRanges: ["198.51.100.0/24"],
      },
    },
    {
      objectType: "auth_methods_policy",
      objectId: "auth_methods_policy",
      displayName: "Authentication methods policy",
      payload: {
        id: "auth_methods_policy",
        smsEnabled: true,
        authenticatorEnabled: true,
        temporaryAccessPassEnabled: false,
      },
    },
    {
      objectType: "intune_compliance_policy",
      objectId: "demo-comp-1",
      displayName: "Windows baseline compliance",
      payload: {
        id: "demo-comp-1",
        displayName: "Windows baseline compliance",
        passwordRequired: true,
        passwordMinimumLength: 8,
        bitLockerEnabled: true,
        osMinimumVersion: "10.0.19045",
      },
    },
  ];
  return Object.fromEntries(objects.map((o) => [`${o.objectType}:${o.objectId}`, o]));
}

type Mutation = { actor: string; apply: (state: DemoState) => void };

/** One scripted step per scan tick, cycling. Written to read like a real tenant's week. */
const MUTATIONS: Mutation[] = [
  {
    actor: "alex.rivera@contoso.com",
    apply(state) {
      const p = state["ca_policy:demo-ca-1"];
      if (p) p.payload = { ...p.payload, state: "disabled" };
    },
  },
  {
    actor: "sam.chen@contoso.com",
    apply(state) {
      const loc = state["named_location:demo-loc-1"];
      if (loc)
        loc.payload = {
          ...loc.payload,
          ipRanges: ["198.51.100.0/24", "203.0.113.0/24"],
        };
    },
  },
  {
    actor: "alex.rivera@contoso.com",
    apply(state) {
      const p = state["ca_policy:demo-ca-1"];
      if (p) p.payload = { ...p.payload, state: "enabled" };
    },
  },
  {
    actor: "priya.patel@contoso.com",
    apply(state) {
      const c = state["intune_compliance_policy:demo-comp-1"];
      if (c) c.payload = { ...c.payload, passwordMinimumLength: 6 };
    },
  },
  {
    actor: "sam.chen@contoso.com",
    apply(state) {
      const o = caPolicy(
        "demo-ca-4",
        "Require MFA for guests",
        "enabledForReportingButNotEnforced",
      );
      state[`${o.objectType}:${o.objectId}`] = o;
    },
  },
  {
    actor: "alex.rivera@contoso.com",
    apply(state) {
      const a = state["auth_methods_policy:auth_methods_policy"];
      if (a) a.payload = { ...a.payload, smsEnabled: false, temporaryAccessPassEnabled: true };
    },
  },
];

/** Demo actor for a given tick (used for attribution in demo mode). */
export function demoActorForTick(tick: number): string | null {
  if (tick <= 0) return null;
  return MUTATIONS[(tick - 1) % MUTATIONS.length].actor;
}

/** Deterministic demo state after `tick` completed scans (tick 0 = baseline). */
export function getDemoTrackedObjects(tick: number): SourceResult[] {
  const state = baseline();
  for (let i = 1; i <= tick; i++) {
    MUTATIONS[(i - 1) % MUTATIONS.length].apply(state);
  }

  const byType = new Map<string, TrackedObject[]>();
  for (const obj of Object.values(state)) {
    const list = byType.get(obj.objectType) ?? [];
    list.push(obj);
    byType.set(obj.objectType, list);
  }

  return [...byType.entries()].map(([objectType, objects]) => ({
    objectType: objectType as SourceResult["objectType"],
    ok: true,
    objects,
  }));
}
